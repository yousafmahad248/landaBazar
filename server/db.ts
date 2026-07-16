import fs from 'fs';
import path from 'path';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { User, Product, Category, WishlistItem } from '../src/types';

const DB_FILE = path.join(process.cwd(), 'thrifted_kicks_db.json');

// Initialize Supabase Client if keys are available
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

let supabase: SupabaseClient | null = null;
if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('Supabase client initialized successfully!');
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
  }
}

// Categories and products will be created dynamically by users and admins

// In-Memory Fallback Database
interface JSONDatabase {
  users: User[];
  products: Product[];
  categories: Category[];
  wishlist: WishlistItem[];
}

function loadLocalDB(): JSONDatabase {
  if (!fs.existsSync(DB_FILE)) {
    const initialDB: JSONDatabase = {
      users: [
        {
          id: 'admin-1',
          email: 'admin@thriftedkicks.com',
          name: 'Thrifted Kicks Admin',
          phone: '+923001234567',
          isAdmin: true,
          createdAt: new Date().toISOString()
        }
      ],
      products: [],
      categories: [],
      wishlist: []
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDB, null, 2), 'utf-8');
    return initialDB;
  }
  try {
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    // Ensure all required fields exist
    if (!parsed.users) parsed.users = [];
    if (!parsed.products) parsed.products = [];
    if (!parsed.categories) parsed.categories = [];
    if (!parsed.wishlist) parsed.wishlist = [];
    return parsed;
  } catch (err) {
    console.error('Error reading local JSON db, reverting to empty:', err);
    return {
      users: [],
      products: [],
      categories: [],
      wishlist: []
    };
  }
}

function saveLocalDB(db: JSONDatabase) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving local DB file:', err);
  }
}

// Export supabase for use in server.ts
export { supabase };

// Global Database API (switches based on configuration)
export const db = {
  isSupabase: (): boolean => supabase !== null,

  // --- USERS ---
  async getUsers(): Promise<User[]> {
    if (supabase) {
      const { data, error } = await supabase.from('users').select('*');
      if (!error && data) return data as User[];
      console.warn('Supabase users fetch failed, falling back to local storage:', error);
    }
    return loadLocalDB().users;
  },

  async getUserByEmail(email: string): Promise<(User & { passwordHash?: string }) | null> {
    const normalizedEmail = email.toLowerCase().trim();
    if (supabase) {
      const { data, error } = await supabase.from('users').select('*').eq('email', normalizedEmail).single();
      if (!error && data) return data as User & { passwordHash?: string };
      console.warn('Supabase user select by email failed, falling back to local:', error);
    }
    const local = loadLocalDB();
    // In our local JSON database, we might store passwords as a special property
    const user = local.users.find(u => u.email.toLowerCase() === normalizedEmail);
    if (!user) return null;
    // We will retrieve stored passwordHash from a private mapping or from the user object itself
    return user as any;
  },

  async createUser(user: User & { passwordHash?: string }): Promise<User> {
    user.email = user.email.toLowerCase().trim();
    if (supabase) {
      const { data, error } = await supabase.from('users').insert([user]).select().single();
      if (!error && data) return data as User;
      console.warn('Supabase user insert failed, falling back to local:', error);
    }
    const local = loadLocalDB();
    local.users.push(user);
    saveLocalDB(local);
    // return without password hash
    const { passwordHash, ...cleanUser } = user;
    return cleanUser;
  },

  async updateUserProfile(userId: string, updates: { name?: string; phone?: string; email?: string }): Promise<User | null> {
    if (supabase) {
      const { data, error } = await supabase.from('users').update(updates).eq('id', userId).select().single();
      if (!error && data) return data as User;
      console.warn('Supabase profile update failed, falling back to local:', error);
    }
    const local = loadLocalDB();
    const idx = local.users.findIndex(u => u.id === userId);
    if (idx === -1) return null;
    local.users[idx] = { ...local.users[idx], ...updates };
    saveLocalDB(local);
    const { passwordHash, ...cleanUser } = local.users[idx] as any;
    return cleanUser;
  },

  // --- PRODUCTS ---
  async getProducts(): Promise<Product[]> {
    if (supabase) {
      const { data, error } = await supabase.from('products').select('*');
      if (!error && data) {
        // Map Supabase table snake_case properties to CamelCase
        return data.map(p => ({
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
          createdAt: p.created_at
        })) as Product[];
      }
      console.warn('Supabase products fetch failed, falling back to local storage:', error);
    }
    return loadLocalDB().products;
  },

  async getProductById(id: string): Promise<Product | null> {
    if (supabase) {
      const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
      if (!error && data) {
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
          createdAt: p.created_at
        } as Product;
      }
    }
    const products = await this.getProducts();
    return products.find(p => p.id === id) || null;
  },

  async createProduct(product: Product): Promise<Product> {
    if (supabase) {
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
        created_at: product.createdAt
      };
      const { data, error } = await supabase.from('products').insert([dbProduct]).select().single();
      if (!error && data) return product;
      console.warn('Supabase product insert failed, falling back to local:', error);
    }
    const local = loadLocalDB();
    local.products.push(product);
    saveLocalDB(local);
    return product;
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    if (supabase) {
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

      const { data, error } = await supabase.from('products').update(dbUpdates).eq('id', id).select().single();
      if (!error && data) {
        return this.getProductById(id);
      }
      console.warn('Supabase product update failed, falling back to local:', error);
    }
    const local = loadLocalDB();
    const idx = local.products.findIndex(p => p.id === id);
    if (idx === -1) return null;
    local.products[idx] = { ...local.products[idx], ...updates } as Product;
    saveLocalDB(local);
    return local.products[idx];
  },

  async deleteProduct(id: string): Promise<boolean> {
    if (supabase) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (!error) return true;
      console.warn('Supabase product delete failed, falling back to local:', error);
    }
    const local = loadLocalDB();
    const idx = local.products.findIndex(p => p.id === id);
    if (idx === -1) return false;
    local.products.splice(idx, 1);
    saveLocalDB(local);
    return true;
  },

  // --- CATEGORIES ---
  async getCategories(): Promise<Category[]> {
    if (supabase) {
      const { data, error } = await supabase.from('categories').select('*');
      if (!error && data) return data as Category[];
      console.warn('Supabase categories fetch failed, falling back to local:', error);
    }
    return loadLocalDB().categories;
  },

  async createCategory(category: Category): Promise<Category> {
    if (supabase) {
      const { data, error } = await supabase.from('categories').insert([category]).select().single();
      if (!error && data) return data as Category;
      console.warn('Supabase category create failed, falling back to local:', error);
    }
    const local = loadLocalDB();
    local.categories.push(category);
    saveLocalDB(local);
    return category;
  },

  async deleteCategory(id: string): Promise<boolean> {
    if (supabase) {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (!error) return true;
    }
    const local = loadLocalDB();
    const idx = local.categories.findIndex(c => c.id === id);
    if (idx === -1) return false;
    local.categories.splice(idx, 1);
    saveLocalDB(local);
    return true;
  },

  // --- WISHLIST ---
  async getWishlist(userId: string): Promise<WishlistItem[]> {
    if (supabase) {
      const { data, error } = await supabase.from('wishlist').select('*').eq('user_id', userId);
      if (!error && data) {
        return data.map(w => ({
          id: w.id,
          userId: w.user_id,
          productId: w.product_id,
          createdAt: w.created_at
        })) as WishlistItem[];
      }
      console.warn('Supabase wishlist fetch failed, falling back to local:', error);
    }
    const local = loadLocalDB();
    return local.wishlist.filter(w => w.userId === userId);
  },

  async addToWishlist(userId: string, productId: string): Promise<WishlistItem> {
    const item: WishlistItem = {
      id: `wish-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId,
      productId,
      createdAt: new Date().toISOString()
    };
    if (supabase) {
      const { data, error } = await supabase.from('wishlist').insert([{
        id: item.id,
        user_id: item.userId,
        product_id: item.productId,
        created_at: item.createdAt
      }]).select().single();
      if (!error && data) return item;
      console.warn('Supabase wishlist insert failed, falling back to local:', error);
    }
    const local = loadLocalDB();
    // Avoid duplicates
    const exists = local.wishlist.some(w => w.userId === userId && w.productId === productId);
    if (!exists) {
      local.wishlist.push(item);
      saveLocalDB(local);
    }
    return item;
  },

  async removeFromWishlist(userId: string, productId: string): Promise<boolean> {
    if (supabase) {
      const { error } = await supabase.from('wishlist').delete().eq('user_id', userId).eq('product_id', productId);
      if (!error) return true;
      console.warn('Supabase wishlist delete failed, falling back to local:', error);
    }
    const local = loadLocalDB();
    const lenBefore = local.wishlist.length;
    local.wishlist = local.wishlist.filter(w => !(w.userId === userId && w.productId === productId));
    saveLocalDB(local);
    return local.wishlist.length < lenBefore;
  }
};
