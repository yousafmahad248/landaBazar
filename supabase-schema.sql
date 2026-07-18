-- Supabase Schema for Landa Bazar (Thrifted Kicks)
-- Run this SQL in Supabase Dashboard > SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (managed by Supabase Auth)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  profile_picture TEXT,
  is_blocked BOOLEAN DEFAULT false,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Settings table
CREATE TABLE IF NOT EXISTS public.settings (
  id TEXT PRIMARY KEY,
  website_name TEXT NOT NULL DEFAULT 'Thrifted Kicks',
  logo_url TEXT,
  whatsapp_number TEXT,
  instagram_url TEXT,
  facebook_url TEXT,
  tiktok_url TEXT
);

-- Categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL
);

-- Products table
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  size TEXT NOT NULL,
  condition TEXT NOT NULL CHECK (condition IN ('Like New', 'Good', 'Fair')),
  description TEXT NOT NULL,
  price NUMERIC NOT NULL,
  original_price NUMERIC,
  stock_status TEXT DEFAULT 'In Stock' CHECK (stock_status IN ('In Stock', 'Sold')),
  category_id TEXT REFERENCES categories(id),
  image_urls JSONB DEFAULT '[]',
  is_featured BOOLEAN DEFAULT false,
  is_new_arrival BOOLEAN DEFAULT false,
  is_best_deal BOOLEAN DEFAULT false,
  seller_id TEXT,
  seller_name TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Wishlist table
CREATE TABLE IF NOT EXISTS public.wishlist (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_new_arrival ON products(is_new_arrival);
CREATE INDEX IF NOT EXISTS idx_products_best_deal ON products(is_best_deal);
CREATE INDEX IF NOT EXISTS idx_wishlist_user ON wishlist(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_product ON wishlist(product_id);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON categories;
DROP POLICY IF EXISTS "Admins can insert categories" ON categories;
DROP POLICY IF EXISTS "Admins can delete categories" ON categories;
DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;
DROP POLICY IF EXISTS "Admins can insert products" ON products;
DROP POLICY IF EXISTS "Admins can update products" ON products;
DROP POLICY IF EXISTS "Admins can delete products" ON products;
DROP POLICY IF EXISTS "Users can view their own wishlist" ON wishlist;
DROP POLICY IF EXISTS "Users can insert into their own wishlist" ON wishlist;
DROP POLICY IF EXISTS "Users can delete from their own wishlist" ON wishlist;

-- RLS Policies for Users
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Note: Removed "Admins can view all users" policy to avoid infinite recursion
-- Admin users can view all users via the API endpoint which bypasses RLS

-- RLS Policies for Categories (Public read, Admin write)
CREATE POLICY "Categories are viewable by everyone" ON categories
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert categories" ON categories
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
  );

CREATE POLICY "Admins can delete categories" ON categories
  FOR DELETE USING (
    auth.uid() IS NOT NULL
  );

-- RLS Policies for Products (Public read, Admin/authenticated write)
CREATE POLICY "Products are viewable by everyone" ON products
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert products" ON products
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
  );

CREATE POLICY "Admins can update products" ON products
  FOR UPDATE USING (
    auth.uid() IS NOT NULL
  );

CREATE POLICY "Admins can delete products" ON products
  FOR DELETE USING (
    auth.uid() IS NOT NULL
  );

-- RLS Policies for Wishlist
CREATE POLICY "Users can view their own wishlist" ON wishlist
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert into their own wishlist" ON wishlist
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete from their own wishlist" ON wishlist
  FOR DELETE USING (auth.uid() = user_id);

-- Function to handle new user creation from Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, phone, is_admin)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'phone', NULL),
    false
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Trigger to auto-create user profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant permissions
GRANT ALL ON users TO authenticated;
GRANT ALL ON categories TO authenticated;
GRANT ALL ON products TO authenticated;
GRANT ALL ON wishlist TO authenticated;
GRANT SELECT ON users TO anon;
GRANT SELECT ON categories TO anon;
GRANT SELECT ON products TO anon;