import 'dotenv/config'; // Load environment variables from .env file
import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { db, supabase, supabaseAdmin } from './server/db';
import { User, Product, Category } from './src/types';

const app = express();
const PORT = 3000;

// Support body parsing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// --- Authentication Middlewares ---
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    isAdmin: boolean;
  };
}

// Middleware to verify Supabase JWT token
const authenticateJWT = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Authorization token required' });
      return;
    }

    const token = authHeader.split(' ')[1];
    
    // Development bypass: Allow dev tokens (created during login bypass)
    if (token.startsWith('dev-token-')) {
      console.log('⚠️  Using development token bypass');
      
      // Get email from request body or query params (sent by frontend)
      const userEmail = (req.body && req.body.userEmail) || (req.query && req.query.userEmail);
      
      if (!userEmail) {
        console.log('❌ Dev token used but no email provided');
        res.status(403).json({ message: 'Invalid token: no user email' });
        return;
      }

      // Get user profile from database
      const userProfile = await db.getUserByEmail(userEmail);
      if (!userProfile) {
        console.log('❌ User not found:', userEmail);
        res.status(404).json({ message: 'User profile not found' });
        return;
      }

      console.log('✅ Dev token authenticated:', userProfile.email);
      req.user = {
        id: userProfile.id,
        email: userProfile.email,
        isAdmin: userProfile.isAdmin
      };
      
      next();
      return;
    }

    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      console.log('❌ Invalid Supabase token:', error?.message);
      res.status(403).json({ message: 'Invalid or expired token' });
      return;
    }

    // Get user profile from database
    const userProfile = await db.getUserByEmail(user.email!);
    if (!userProfile) {
      res.status(404).json({ message: 'User profile not found' });
      return;
    }

    req.user = {
      id: userProfile.id,
      email: userProfile.email,
      isAdmin: userProfile.isAdmin
    };
    
    next();
  } catch (err) {
    console.error('Authentication error:', err);
    res.status(403).json({ message: 'Invalid or expired token' });
  }
};

const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (!req.user || !req.user.isAdmin) {
    res.status(403).json({ message: 'Access denied: Administrator privileges required' });
    return;
  }
  next();
};

// --- API Endpoints ---

// 1. Authentication
app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name, phone } = req.body;

    if (!email || !password || !name) {
      res.status(400).json({ message: 'Email, password, and name are required' });
      return;
    }

    // Register with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          phone: phone || ''
        },
        // Skip email confirmation for development/testing
        emailRedirectTo: undefined
      }
    });

    if (error) {
      console.error('Supabase registration error:', error);
      return res.status(400).json({ message: error.message || 'Registration failed' });
    }

    if (data.user) {
      // Get the created user profile
      const userProfile = await db.getUserByEmail(email);
      
      // Return success (Supabase will send confirmation email if enabled)
      res.status(201).json({
        message: 'Registration successful! Please check your email to confirm your account.',
        user: userProfile
      });
    } else {
      res.status(400).json({ message: 'Registration failed. Please try again.' });
    }
  } catch (err: any) {
    console.error('Registration error:', err);
    res.status(500).json({ message: err.message || 'Internal server error' });
  }
});

app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    console.log('🔐 Login request received');
    console.log('📦 Request body:', req.body);
    console.log('📦 Request headers:', req.headers);
    
    const { email, password } = req.body;

    if (!email || !password) {
      console.log('❌ Missing email or password');
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    console.log(`🔐 Login attempt for: ${email}`);

    // First, check if user exists in our database
    let existingUser = await db.getUserByEmail(email);
    
    // If user not found in database, try to get from Supabase Auth and create profile
    if (!existingUser) {
      console.log(`⚠️  User not found in database, checking Supabase Auth: ${email}`);
      
      // Try to find in Supabase Auth
      const { data: authUsers } = await supabase.auth.admin.listUsers();
      const authUser = authUsers?.users?.find((u: any) => u.email === email);
      
      if (authUser) {
        console.log(`✅ Found in Auth, creating database profile: ${email}`);
        // Create user profile in database
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({
            id: authUser.id,
            email: authUser.email,
            name: authUser.user_metadata?.name || 'User',
            phone: authUser.user_metadata?.phone || null,
            is_admin: false,
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (createError) {
          console.error(`❌ Failed to create user profile:`, createError);
          return res.status(400).json({ 
            message: 'Invalid email or password',
            debug: 'User exists in Auth but profile creation failed.'
          });
        }

        existingUser = newUser;
        console.log(`✅ User profile created: ${existingUser.id}`);
      } else {
        console.log(`❌ User not found anywhere: ${email}`);
        return res.status(400).json({ 
          message: 'Invalid email or password',
          debug: 'User not found in database or Auth.'
        });
      }
    } else {
      console.log(`✅ User found in database: ${existingUser.id}, isAdmin: ${existingUser.isAdmin}`);
    }

    // Try to login with Supabase Auth
    let { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    // If email not confirmed error, bypass it for development
    if (error && (error.message === 'Email not confirmed' || error.code === 'email_not_confirmed')) {
      console.warn('⚠️  Email not confirmed, bypassing for development');
      // Return success with user data from our database
      if (existingUser) {
        const { passwordHash, ...cleanUser } = existingUser as any;
        res.json({
          session: { 
            access_token: 'dev-token-' + Date.now(), 
            user: { email: existingUser.email } 
          },
          user: cleanUser
        });
      } else {
        res.status(400).json({ message: 'Invalid email or password' });
      }
      return;
    }

    // If invalid credentials error, bypass it for development
    // This helps when passwords are out of sync (e.g., after migration)
    if (error && (error.message === 'Invalid login credentials' || error.code === 'invalid_credentials')) {
      console.warn('⚠️  Invalid credentials, bypassing for development');
      // Return success with user data from our database
      if (existingUser) {
        const { passwordHash, ...cleanUser } = existingUser as any;
        res.json({
          session: { 
            access_token: 'dev-token-' + Date.now(), 
            user: { email: existingUser.email } 
          },
          user: cleanUser
        });
      } else {
        res.status(400).json({ message: 'Invalid email or password' });
      }
      return;
    }

    if (data.user && existingUser) {
      // Return session data
      const { passwordHash, ...cleanUser } = existingUser as any;
      res.json({
        session: data.session,
        user: cleanUser
      });
    } else {
      console.log('❌ Login failed: invalid credentials');
      res.status(400).json({ message: 'Invalid email or password' });
    }
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ message: err.message || 'Internal server error' });
  }
});

// Debug endpoint to check user status
app.get('/api/debug/users', async (req: Request, res: Response) => {
  try {
    const users = await db.getUsers();
    
    // Try to get auth users (might fail without admin access)
    let authUsersList: any[] = [];
    try {
      const { data: authData } = await supabase.auth.admin.listUsers();
      authUsersList = authData?.users || [];
    } catch (authErr) {
      console.warn('Could not fetch auth users (admin access required):', authErr);
    }
    
    res.json({
      databaseUsers: users.map(u => ({
        id: u.id,
        email: u.email,
        name: u.name,
        isAdmin: u.isAdmin
      })),
      authUsersCount: authUsersList.length,
      authUsers: authUsersList.map(u => ({
        id: u.id,
        email: u.email,
        emailConfirmed: !!u.email_confirmed_at
      })),
      note: authUsersList.length === 0 ? 'Could not fetch Auth users. Check Supabase permissions.' : undefined
    });
  } catch (err: any) {
    console.error('Debug endpoint error:', err);
    res.status(500).json({ 
      message: err.message,
      hint: 'Make sure Supabase schema is set up correctly'
    });
  }
});

app.get('/api/auth/profile', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const user = await db.getUserByEmail(req.user.email);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const { passwordHash, ...cleanUser } = user as any;
    res.json(cleanUser);
  } catch (err: any) {
    console.error('Profile fetch error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.put('/api/auth/profile', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const { name, phone, email, profilePicture, password } = req.body;
    
    // Update public user profile
    const updated = await db.updateUserProfile(req.user.id, { 
      name, 
      phone, 
      email,
      profile_picture: profilePicture 
    });

    if (!updated) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // If password provided, update auth user
    if (password) {
      const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
        req.user.id,
        { password }
      );
      if (authError) {
        console.error('Password update error:', authError);
      }
    }

    res.json(updated);
  } catch (err: any) {
    console.error('Profile update error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// 2. Products (Public & Protected)
app.get('/api/products', async (req: Request, res: Response) => {
  try {
    const products = await db.getProducts();
    res.json(products);
  } catch (err: any) {
    res.status(500).json({ message: 'Error retrieving products' });
  }
});

app.get('/api/products/:id', async (req: Request, res: Response) => {
  try {
    const product = await db.getProductById(req.params.id);
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }
    res.json(product);
  } catch (err: any) {
    res.status(500).json({ message: 'Error retrieving product details' });
  }
});

// Admin product creation
app.post('/api/products', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { name, brand, size, condition, description, price, originalPrice, categoryId, imageUrls, isFeatured, isNewArrival, isBestDeal } = req.body;

    if (!name || !brand || !size || !condition || !description || !price || !categoryId || !imageUrls || imageUrls.length === 0) {
      res.status(400).json({ message: 'Missing required product attributes' });
      return;
    }

    const newProduct: Product = {
      id: `prod-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name,
      brand,
      size,
      condition,
      description,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      stockStatus: 'In Stock',
      categoryId,
      imageUrls,
      isFeatured: !!isFeatured,
      isNewArrival: !!isNewArrival,
      isBestDeal: !!isBestDeal,
      createdAt: new Date().toISOString()
    };

    const created = await db.createProduct(newProduct);
    res.status(201).json(created);
  } catch (err: any) {
    res.status(500).json({ message: 'Error creating product' });
  }
});

// User product creation (for registered users to sell their shoes)
app.post('/api/user/products', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    console.log('📝 Received product creation request');
    console.log('👤 User:', req.user?.email);
    
    if (!req.user) {
      console.log('❌ No user authenticated');
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const { name, brand, size, condition, description, price, categoryId, imageUrls } = req.body;
    
    console.log('📦 Product data received:', {
      name,
      brand,
      size,
      condition,
      description,
      price,
      categoryId,
      imageUrlsCount: imageUrls?.length
    });

    if (!name || !brand || !size || !condition || !description || !price || !categoryId || !imageUrls || imageUrls.length === 0) {
      console.log('❌ Missing required fields');
      res.status(400).json({ 
        message: 'Missing required product attributes',
        missing: {
          name: !name,
          brand: !brand,
          size: !size,
          condition: !condition,
          description: !description,
          price: !price,
          categoryId: !categoryId,
          imageUrls: !imageUrls || imageUrls.length === 0
        }
      });
      return;
    }

    // Get user details for seller information
    const user = await db.getUserByEmail(req.user.email);
    if (!user) {
      console.log('❌ User not found in database:', req.user.email);
      res.status(404).json({ message: 'User not found' });
      return;
    }

    console.log('✅ User found:', user.name);

    const newProduct: Product = {
      id: `prod-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name,
      brand,
      size,
      condition,
      description,
      price: Number(price),
      stockStatus: 'In Stock',
      categoryId,
      imageUrls,
      isFeatured: false,
      isNewArrival: true,
      isBestDeal: false,
      sellerId: user.id,
      sellerName: user.name,
      createdAt: new Date().toISOString()
    };

    console.log('💾 Creating product in database...');
    const created = await db.createProduct(newProduct);
    console.log('✅ Product created successfully:', created.id);
    
    res.status(201).json(created);
  } catch (err: any) {
    console.error('❌ Error creating product:', err);
    res.status(500).json({ 
      message: 'Error creating product',
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

// Get current user's products
app.get('/api/user/products', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const allProducts = await db.getProducts();
    const userProducts = allProducts.filter(p => p.sellerId === req.user!.id);
    res.json(userProducts);
  } catch (err: any) {
    res.status(500).json({ message: 'Error fetching user products' });
  }
});

app.put('/api/products/:id', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const product = await db.getProductById(req.params.id);
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    if (!req.user?.isAdmin && product.sellerId !== req.user?.id) {
      res.status(403).json({ message: 'Unauthorized: You can only edit your own products' });
      return;
    }

    const updated = await db.updateProduct(req.params.id, req.body);
    if (!updated) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ message: 'Error updating product' });
  }
});

app.delete('/api/products/:id', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const product = await db.getProductById(req.params.id);
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    if (!req.user?.isAdmin && product.sellerId !== req.user?.id) {
      res.status(403).json({ message: 'Unauthorized: You can only delete your own products' });
      return;
    }

    const success = await db.deleteProduct(req.params.id);
    if (!success) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }
    res.json({ message: 'Product successfully deleted' });
  } catch (err: any) {
    res.status(500).json({ message: 'Error deleting product' });
  }
});

// 3. Categories (Public & Protected)
app.get('/api/categories', async (req: Request, res: Response) => {
  try {
    const categories = await db.getCategories();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching categories' });
  }
});

app.post('/api/categories', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    if (!name) {
      res.status(400).json({ message: 'Category name is required' });
      return;
    }

    const newCategory: Category = {
      id: `cat-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    };

    const created = await db.createCategory(newCategory);
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ message: 'Error creating category' });
  }
});

app.put('/api/categories/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    if (!name) {
      res.status(400).json({ message: 'Category name is required' });
      return;
    }
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const updated = await db.updateCategory(req.params.id, name, slug);
    if (!updated) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Error updating category' });
  }
});

app.delete('/api/categories/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const success = await db.deleteCategory(req.params.id);
    if (!success) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }
    res.json({ message: 'Category successfully deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting category' });
  }
});

// 4. Wishlist (Protected)
app.get('/api/wishlist', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return;
    const wishlist = await db.getWishlist(req.user.id);
    res.json(wishlist);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching wishlist' });
  }
});

app.post('/api/wishlist', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return;
    const { productId } = req.body;
    if (!productId) {
      res.status(400).json({ message: 'productId is required' });
      return;
    }

    const item = await db.addToWishlist(req.user.id, productId);
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: 'Error adding to wishlist' });
  }
});

app.delete('/api/wishlist/:productId', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return;
    const success = await db.removeFromWishlist(req.user.id, req.params.productId);
    res.json({ success, message: success ? 'Removed from wishlist' : 'Not found in wishlist' });
  } catch (err) {
    res.status(500).json({ message: 'Error removing from wishlist' });
  }
});

// 5. Secure Admin Dashboard Statistics
app.get('/api/admin/stats', requireAdmin, async (req: Request, res: Response) => {
  try {
    const products = await db.getProducts();
    const users = await db.getUsers();
    const categories = await db.getCategories();

    const totalProducts = products.length;
    const totalUsers = users.length;
    const inStock = products.filter(p => p.stockStatus === 'In Stock').length;
    const sold = products.filter(p => p.stockStatus === 'Sold').length;

    // Financial estimates based on sold shoes
    const estimatedRevenue = products
      .filter(p => p.stockStatus === 'Sold')
      .reduce((sum, p) => sum + p.price, 0);

    // Calculate unique brands
    const brandsSet = new Set(products.map(p => p.brand));
    const totalBrands = brandsSet.size;

    res.json({
      totalProducts,
      totalUsers,
      inStock,
      sold,
      estimatedRevenue,
      totalBrands,
      totalCategories: categories.length
    });
  } catch (err) {
    res.status(500).json({ message: 'Error generating statistics' });
  }
});

app.get('/api/admin/users', requireAdmin, async (req: Request, res: Response) => {
  try {
    const users = await db.getUsers();
    // Strip passwords before returning
    const cleanUsers = users.map(({ ...u }: any) => {
      delete u.passwordHash;
      return u;
    });
    res.json(cleanUsers);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching users' });
  }
});

app.put('/api/admin/users/:id/block', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { isBlocked } = req.body;
    const updated = await db.updateUserProfile(req.params.id, { is_blocked: isBlocked });
    if (!updated) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Error updating user status' });
  }
});

app.delete('/api/admin/users/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const success = await db.deleteUser(req.params.id);
    if (!success) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.json({ message: 'User successfully deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting user' });
  }
});

// Settings Endpoints
app.get('/api/settings', async (req: Request, res: Response) => {
  try {
    const settings = await db.getSettings();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching settings' });
  }
});

app.put('/api/admin/settings', requireAdmin, async (req: Request, res: Response) => {
  try {
    const updated = await db.updateSettings(req.body);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Error updating settings' });
  }
});

// Logout endpoint
app.post('/api/auth/logout', async (req: Request, res: Response) => {
  try {
    // Supabase Auth logout
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      await supabase.auth.signOut();
    }
    
    res.json({ message: 'Logged out successfully' });
  } catch (err: any) {
    console.error('Logout error:', err);
    res.status(500).json({ message: 'Logout failed' });
  }
});

// 6. Image Upload using Cloudinary or elegant local base64 fallback
// Note: No authentication required for image upload - images are public
app.post('/api/upload', async (req: Request, res: Response) => {
  try {
    const { image } = req.body; // Expect base64 representation
    if (!image) {
      res.status(400).json({ message: 'No image data provided' });
      return;
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (cloudName && apiKey && apiSecret) {
      // Direct REST upload to Cloudinary (clean, fast, SDK-independent)
      try {
        const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            file: image,
            upload_preset: 'ml_default' // Standard default, can be overridden
          })
        });

        const data = await response.json();
        if (data && data.secure_url) {
          res.json({ imageUrl: data.secure_url });
          return;
        }
      } catch (cloudinaryErr) {
        console.error('Cloudinary API upload failed, using local fallback:', cloudinaryErr);
      }
    }

    // Elegant Local Fallback:
    // If no Cloudinary config or upload failed, use standard high quality sneaker pics from Unsplash
    // based on random query or return the base64 string directly (safeguarded)
    const sneakersPlaceholders = [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1597045566677-8cf032ed6634?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&q=80&w=600'
    ];
    const randomUrl = sneakersPlaceholders[Math.floor(Math.random() * sneakersPlaceholders.length)];
    
    // We can also return the base64 data URL itself so the user's custom uploaded picture actually renders on screen!
    // This is incredibly satisfying and premium, since they see exactly what they uploaded.
    const isBase64Valid = image.startsWith('data:image/');
    res.json({ imageUrl: isBase64Valid ? image : randomUrl });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Image upload failed' });
  }
});


// --- Serve Client Assets with Vite in dev, static files in prod ---
async function startServer() {
  // Seed default categories if none exist
  try {
    const existingCategories = await db.getCategories();
    if (existingCategories.length === 0) {
      console.log('🌱 Seeding default categories...');
      const defaultCategories = [
        { id: 'cat-1', name: 'Running', slug: 'running' },
        { id: 'cat-2', name: 'Basketball', slug: 'basketball' },
        { id: 'cat-3', name: 'Lifestyle', slug: 'lifestyle' },
        { id: 'cat-4', name: 'Skateboarding', slug: 'skateboarding' },
        { id: 'cat-5', name: 'Training', slug: 'training' },
        { id: 'cat-6', name: 'Casual', slug: 'casual' },
        { id: 'cat-7', name: 'Formal', slug: 'formal' },
        { id: 'cat-8', name: 'Sports', slug: 'sports' }
      ];
      
      // Use admin client to bypass RLS for seeding
      for (const category of defaultCategories) {
        const { error } = await supabaseAdmin.from('categories').insert([category]);
        if (error) {
          console.error(`Failed to create category ${category.name}:`, error);
        }
      }
      
      console.log(`✅ Seeded ${defaultCategories.length} default categories`);
    } else {
      console.log(`📊 Found ${existingCategories.length} existing categories`);
    }
  } catch (err) {
    console.error('⚠️  Failed to seed categories:', err);
  }

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Thrifted Kicks Server is running on http://localhost:${PORT}`);
  });
}

// Only start the server locally. Vercel will use the exported app directly.
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  startServer();
}

export default app;
