/**
 * Migration Script: Local JSON Database → Supabase
 * 
 * Instructions:
 * 1. Pehle supabase-schema.sql file ko Supabase Dashboard > SQL Editor mein run karein
 * 2. Phir yeh script run karein: node migrate-to-supabase.js
 * 3. Script automatically Supabase Auth users bhi create kar dega
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Supabase credentials
const SUPABASE_URL = 'https://jfucpalmamyafotgujey.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_mma-dlpq1s--bJbf5jOIIQ_5-GsQYqt';

// Load service role key from .env file
let SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// If not in environment, try to read from .env file
if (!SUPABASE_SERVICE_ROLE_KEY) {
  try {
    const envPath = path.join(process.cwd(), '.env');
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const match = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/);
    if (match) {
      SUPABASE_SERVICE_ROLE_KEY = match[1].trim();
    }
  } catch (err) {
    console.log('⚠️  Could not read .env file');
  }
}

// Initialize Supabase client with service role key
const supabase = SUPABASE_SERVICE_ROLE_KEY 
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

if (SUPABASE_SERVICE_ROLE_KEY) {
  console.log('🔓 Using service role key (RLS bypassed)');
} else {
  console.log('⚠️  Using anon key (RLS enabled)');
}

// Load local database
const DB_FILE = path.join(process.cwd(), 'thrifted_kicks_db.json');
const localData = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));

async function migrateUsers() {
  console.log('\n📤 Migrating Users...');
  
  for (const user of localData.users) {
    try {
      // Check if user already exists in our database
      const { data: existingUser } = await supabase
        .from('users')
        .select('id, email')
        .eq('email', user.email)
        .single();

      if (existingUser) {
        console.log(`  ⏭️  ${user.email} (already exists, skipping)`);
        continue;
      }

      // Try to get the Auth user ID
      let authUserId = null;
      
      // Try to find in Auth users
      const { data: authUsers } = await supabase.auth.admin.listUsers();
      const authUser = authUsers?.users?.find(u => u.email === user.email);
      
      if (authUser) {
        // Use existing Auth user ID
        authUserId = authUser.id;
        console.log(`  🔑 Found existing Auth user: ${user.email} (ID: ${authUserId})`);
      } else {
        // Create new Auth user
        console.log(`  🔑 Creating Auth user: ${user.email}`);
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: user.email,
          password: 'admin123',
          email_confirm: true,
          user_metadata: {
            name: user.name,
            phone: user.phone || ''
          }
        });

        if (authError && !authError.message.includes('already registered')) {
          console.log(`  ⚠️  Auth user creation issue: ${authError.message}`);
        }

        if (authData?.user) {
          authUserId = authData.user.id;
        }
      }

      // Wait a bit for Auth user to be ready
      await new Promise(resolve => setTimeout(resolve, 500));

      // If we have an Auth user ID, use it for the public.users table
      if (authUserId) {
        const { data, error } = await supabase
          .from('users')
          .insert({
            id: authUserId,
            email: user.email,
            name: user.name,
            phone: user.phone || null,
            is_admin: user.isAdmin || false,
            created_at: user.createdAt
          })
          .select()
          .single();

        if (error) {
          console.log(`  ⚠️  ${user.email}: ${error.message}`);
        } else {
          console.log(`  ✅ ${user.email} (ID: ${authUserId})`);
        }
      } else {
        console.log(`  ❌ ${user.email}: Could not get Auth user ID`);
      }
    } catch (err) {
      console.log(`  ❌ ${user.email}: ${err.message}`);
    }
  }
}

async function migrateCategories() {
  console.log('\n📤 Migrating Categories...');
  
  if (localData.categories.length === 0) {
    console.log('  ℹ️  No categories to migrate');
    return;
  }

  for (const category of localData.categories) {
    try {
      // Check if category already exists
      const { data: existingCategory } = await supabase
        .from('categories')
        .select('id')
        .eq('id', category.id)
        .single();

      if (existingCategory) {
        console.log(`  ⏭️  ${category.name} (already exists, skipping)`);
        continue;
      }

      const { data, error } = await supabase
        .from('categories')
        .insert(category)
        .select()
        .single();

      if (error) {
        console.log(`  ⚠️  ${category.name}: ${error.message}`);
      } else {
        console.log(`  ✅ ${category.name}`);
      }
    } catch (err) {
      console.log(`  ❌ ${category.name}: ${err.message}`);
    }
  }
}

async function migrateProducts() {
  console.log('\n📤 Migrating Products...');
  
  if (localData.products.length === 0) {
    console.log('  ℹ️  No products to migrate');
    return;
  }

  for (const product of localData.products) {
    try {
      // Check if product already exists
      const { data: existingProduct } = await supabase
        .from('products')
        .select('id')
        .eq('id', product.id)
        .single();

      if (existingProduct) {
        console.log(`  ⏭️  ${product.name} (already exists, skipping)`);
        continue;
      }

      const { data, error } = await supabase
        .from('products')
        .insert({
          id: product.id,
          name: product.name,
          brand: product.brand,
          size: product.size,
          condition: product.condition,
          description: product.description,
          price: product.price,
          original_price: product.originalPrice || null,
          stock_status: product.stockStatus,
          category_id: product.categoryId,
          image_urls: product.imageUrls,
          is_featured: product.isFeatured,
          is_new_arrival: product.isNewArrival,
          is_best_deal: product.isBestDeal,
          seller_id: product.sellerId || null,
          seller_name: product.sellerName || null,
          created_at: product.createdAt
        })
        .select()
        .single();

      if (error) {
        console.log(`  ⚠️  ${product.name}: ${error.message}`);
      } else {
        console.log(`  ✅ ${product.name}`);
      }
    } catch (err) {
      console.log(`  ❌ ${product.name}: ${err.message}`);
    }
  }
}

async function migrateWishlist() {
  console.log('\n📤 Migrating Wishlist...');
  
  if (localData.wishlist.length === 0) {
    console.log('  ℹ️  No wishlist items to migrate');
    return;
  }

  for (const item of localData.wishlist) {
    try {
      // Check if wishlist item already exists
      const { data: existingItem } = await supabase
        .from('wishlist')
        .select('id')
        .eq('id', item.id)
        .single();

      if (existingItem) {
        console.log(`  ⏭️  Wishlist item ${item.id} (already exists, skipping)`);
        continue;
      }

      const { data, error } = await supabase
        .from('wishlist')
        .insert({
          id: item.id,
          user_id: item.userId,
          product_id: item.productId,
          created_at: item.createdAt
        })
        .select()
        .single();

      if (error) {
        console.log(`  ⚠️  Wishlist item ${item.id}: ${error.message}`);
      } else {
        console.log(`  ✅ Wishlist item ${item.id}`);
      }
    } catch (err) {
      console.log(`  ❌ Wishlist item ${item.id}: ${err.message}`);
    }
  }
}

async function main() {
  console.log('🚀 Starting Migration to Supabase...');
  console.log('='.repeat(50));

  try {
    await migrateUsers();
    await migrateCategories();
    await migrateProducts();
    await migrateWishlist();

    console.log('\n' + '='.repeat(50));
    console.log('✅ Migration completed!');
    console.log('\n📋 Next Steps:');
    console.log('1. Supabase Dashboard mein jakein verify karein ke data aagaya hai');
    console.log('2. User IDs match karein with Supabase Auth UUIDs');
    console.log('3. Server restart karein: npm run dev');
    console.log('4. Test karein ke sab kaam kar raha hai');
  } catch (err) {
    console.error('\n❌ Migration failed:', err);
    process.exit(1);
  }
}

main();