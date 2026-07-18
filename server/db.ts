import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { User, Product, Category, WishlistItem } from '../src/types';

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase: SupabaseClient;
let supabaseAdmin: SupabaseClient;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase credentials missing! Please set SUPABASE_URL and SUPABASE_ANON_KEY in Vercel Environment Variables.');
  // Do not process.exit(1) as it crashes the Vercel function silently.
  // Instead, create a dummy client that will fail if used, or just let it be undefined.
  // We'll throw an error if db operations are attempted.
} else {
  // Regular client for normal operations (respects RLS)
  supabase = createClient(supabaseUrl, supabaseKey);
  console.log('✅ Supabase client initialized successfully!');
  
  // Admin client for seeding and admin operations (bypasses RLS)
  supabaseAdmin = supabaseServiceKey 
    ? createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      })
    : supabase;
}

export { supabase, supabaseAdmin };



// Global Database API - Supabase Only
export const db = {
  // --- USERS ---
  async getUsers(): Promise<User[]> {
    const { data, error } = await supabase.from('users').select('*');
    if (error) {
      console.error('Error fetching users:', error);
      throw new Error('Failed to fetch users');
    }
    return (data || []).map((u: any) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      phone: u.phone,
      isAdmin: u.is_admin,
      isBlocked: u.is_blocked,
      profilePicture: u.profile_picture,
      createdAt: u.created_at
    })) as User[];
  },

  async getUserByEmail(email: string): Promise<(User & { passwordHash?: string }) | null> {
    const normalizedEmail = email.toLowerCase().trim();
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', normalizedEmail)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      id: data.id,
      email: data.email,
      name: data.name,
      phone: data.phone,
      isAdmin: data.is_admin,
      isBlocked: data.is_blocked,
      profilePicture: data.profile_picture,
      createdAt: data.created_at,
      passwordHash: data.passwordHash
    } as User & { passwordHash?: string };
  },

  async createUser(user: User & { passwordHash?: string }): Promise<User> {
    user.email = user.email.toLowerCase().trim();
    const { data, error } = await supabase
      .from('users')
      .insert([user])
      .select()
      .single();

    if (error) {
      console.error('Error creating user:', error);
      throw new Error('Failed to create user');
    }

    // Return without password hash
    return {
      id: data.id,
      email: data.email,
      name: data.name,
      phone: data.phone,
      isAdmin: data.is_admin,
      isBlocked: data.is_blocked,
      profilePicture: data.profile_picture,
      createdAt: data.created_at
    } as User;
  },

  async updateUserProfile(userId: string, updates: { name?: string; phone?: string; email?: string; profile_picture?: string; is_blocked?: boolean }): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error || !data) {
      console.error('Error updating user profile:', error);
      return null;
    }

    return {
      id: data.id,
      email: data.email,
      name: data.name,
      phone: data.phone,
      isAdmin: data.is_admin,
      isBlocked: data.is_blocked,
      profilePicture: data.profile_picture,
      createdAt: data.created_at
    } as User;
  },

  async deleteUser(userId: string): Promise<boolean> {
    // Delete from public.users
    const { error } = await supabaseAdmin.from('users').delete().eq('id', userId);
    if (error) {
      console.error('Error deleting user from database:', error);
      return false;
    }
    // Delete from Supabase Auth
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (authError) {
      console.error('Error deleting user from auth:', authError);
    }
    return true;
  },

  // --- PRODUCTS ---
  async getProducts(): Promise<Product[]> {
    const { data, error } = await supabase.from('products').select('*');
    if (error) {
      console.error('Error fetching products:', error);
      throw new Error('Failed to fetch products');
    }

    // Map Supabase snake_case to camelCase
    return (data || []).map(p => ({
      id: p.id,
      name: p.name,
      brand: p.brand,
      size: p.size,
      condition: p.condition,
      description: p.description,
      price: Number(p.price),
      originalPrice: p.original_price ? Number(p.original_price) : undefined,
      stockStatus: p.stock_status,
      categoryId: p.category_id,
      imageUrls: Array.isArray(p.image_urls) ? p.image_urls : JSON.parse(p.image_urls || '[]'),
      isFeatured: p.is_featured,
      isNewArrival: p.is_new_arrival,
      isBestDeal: p.is_best_deal,
      sellerId: p.seller_id,
      sellerName: p.seller_name,
      createdAt: p.created_at
    })) as Product[];
  },

  async getProductById(id: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return null;
    }

    const p = data;
    return {
      id: p.id,
      name: p.name,
      brand: p.brand,
      size: p.size,
      condition: p.condition,
      description: p.description,
      price: Number(p.price),
      originalPrice: p.original_price ? Number(p.original_price) : undefined,
      stockStatus: p.stock_status,
      categoryId: p.category_id,
      imageUrls: Array.isArray(p.image_urls) ? p.image_urls : JSON.parse(p.image_urls || '[]'),
      isFeatured: p.is_featured,
      isNewArrival: p.is_new_arrival,
      isBestDeal: p.is_best_deal,
      sellerId: p.seller_id,
      sellerName: p.seller_name,
      createdAt: p.created_at
    } as Product;
  },

  async createProduct(product: Product): Promise<Product> {
    const dbProduct = {
      id: product.id,
      name: product.name,
      brand: product.brand,
      size: product.size,
      condition: product.condition,
      description: product.description,
      price: product.price,
      original_price: product.originalPrice,
      stock_status: product.stockStatus,
      category_id: product.categoryId,
      image_urls: product.imageUrls,
      is_featured: product.isFeatured,
      is_new_arrival: product.isNewArrival,
      is_best_deal: product.isBestDeal,
      seller_id: product.sellerId,
      seller_name: product.sellerName,
      created_at: product.createdAt
    };

    // Use admin client to bypass RLS for product creation
    const { data, error } = await supabaseAdmin
      .from('products')
      .insert([dbProduct])
      .select()
      .single();

    if (error) {
      console.error('Error creating product:', error);
      throw new Error('Failed to create product');
    }

    return product;
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.brand !== undefined) dbUpdates.brand = updates.brand;
    if (updates.size !== undefined) dbUpdates.size = updates.size;
    if (updates.condition !== undefined) dbUpdates.condition = updates.condition;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.price !== undefined) dbUpdates.price = updates.price;
    if (updates.originalPrice !== undefined) dbUpdates.original_price = updates.originalPrice;
    if (updates.stockStatus !== undefined) dbUpdates.stock_status = updates.stockStatus;
    if (updates.categoryId !== undefined) dbUpdates.category_id = updates.categoryId;
    if (updates.imageUrls !== undefined) dbUpdates.image_urls = updates.imageUrls;
    if (updates.isFeatured !== undefined) dbUpdates.is_featured = updates.isFeatured;
    if (updates.isNewArrival !== undefined) dbUpdates.is_new_arrival = updates.isNewArrival;
    if (updates.isBestDeal !== undefined) dbUpdates.is_best_deal = updates.isBestDeal;

    const { data, error } = await supabase
      .from('products')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      console.error('Error updating product:', error);
      return null;
    }

    return this.getProductById(id);
  },

  async deleteProduct(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting product:', error);
      return false;
    }

    return true;
  },

  // --- CATEGORIES ---
  async getCategories(): Promise<Category[]> {
    const { data, error } = await supabase.from('categories').select('*');
    if (error) {
      console.error('Error fetching categories:', error);
      throw new Error('Failed to fetch categories');
    }
    return data as Category[];
  },

  async createCategory(category: Category): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .insert([category])
      .select()
      .single();

    if (error) {
      console.error('Error creating category:', error);
      throw new Error('Failed to create category');
    }

    return data as Category;
  },

  async updateCategory(id: string, name: string, slug: string): Promise<Category | null> {
    const { data, error } = await supabase
      .from('categories')
      .update({ name, slug })
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      console.error('Error updating category:', error);
      return null;
    }
    return data as Category;
  },

  async deleteCategory(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting category:', error);
      return false;
    }

    return true;
  },

  // --- WISHLIST ---
  async getWishlist(userId: string): Promise<WishlistItem[]> {
    const { data, error } = await supabase
      .from('wishlist')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching wishlist:', error);
      throw new Error('Failed to fetch wishlist');
    }

    return (data || []).map(w => ({
      id: w.id,
      userId: w.user_id,
      productId: w.product_id,
      createdAt: w.created_at
    })) as WishlistItem[];
  },

  async addToWishlist(userId: string, productId: string): Promise<WishlistItem> {
    const item: WishlistItem = {
      id: `wish-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId,
      productId,
      createdAt: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('wishlist')
      .insert([{
        id: item.id,
        user_id: item.userId,
        product_id: item.productId,
        created_at: item.createdAt
      }])
      .select()
      .single();

    if (error) {
      console.error('Error adding to wishlist:', error);
      throw new Error('Failed to add to wishlist');
    }

    return item;
  },

  async removeFromWishlist(userId: string, productId: string): Promise<boolean> {
    const { error } = await supabase
      .from('wishlist')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId);

    if (error) {
      console.error('Error removing from wishlist:', error);
      return false;
    }

    return true;
  },

  // --- SETTINGS ---
  async getSettings(): Promise<any> {
    const { data, error } = await supabase.from('settings').select('*').single();
    if (error) {
      // Fallback default if table not setup yet
      return { websiteName: 'Thrifted Kicks' };
    }
    return {
      id: data.id,
      websiteName: data.website_name,
      logoUrl: data.logo_url,
      whatsappNumber: data.whatsapp_number,
      instagramUrl: data.instagram_url,
      facebookUrl: data.facebook_url,
      tiktokUrl: data.tiktok_url
    };
  },

  async updateSettings(settings: any): Promise<any> {
    const dbSettings = {
      id: 'default',
      website_name: settings.websiteName,
      logo_url: settings.logoUrl,
      whatsapp_number: settings.whatsappNumber,
      instagram_url: settings.instagramUrl,
      facebook_url: settings.facebookUrl,
      tiktok_url: settings.tiktokUrl
    };

    const { data, error } = await supabaseAdmin
      .from('settings')
      .upsert([dbSettings], { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      console.error('Error updating settings:', error);
      throw new Error('Failed to update settings');
    }

    return this.getSettings();
  }
};
