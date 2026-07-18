/**
 * Quick test script to check login flow
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Load service role key
let SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_SERVICE_ROLE_KEY) {
  const envPath = path.join(process.cwd(), '.env');
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const match = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/);
  if (match) {
    SUPABASE_SERVICE_ROLE_KEY = match[1].trim();
  }
}

const supabase = SUPABASE_SERVICE_ROLE_KEY 
  ? createClient('https://jfucpalmamyafotgujey.supabase.co', SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false }
    })
  : createClient('https://jfucpalmamyafotgujey.supabase.co', 'sb_publishable_mma-dlpq1s--bJbf5jOIIQ_5-GsQYqt');

async function testLogin() {
  const email = 'yousafmahad248@gmail.com';
  
  console.log('🔍 Testing login flow for:', email);
  console.log('='.repeat(50));
  
  // Step 1: Check database
  console.log('\n1. Checking database...');
  const { data: dbUser, error: dbError } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();
  
  if (dbError) {
    console.log('❌ User not found in database:', dbError.message);
  } else {
    console.log('✅ User found in database:', dbUser);
  }
  
  // Step 2: Check Auth
  console.log('\n2. Checking Supabase Auth...');
  const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
  
  if (authError) {
    console.log('❌ Auth error:', authError.message);
  } else {
    const authUser = authData?.users?.find(u => u.email === email);
    if (authUser) {
      console.log('✅ User found in Auth:', authUser.id);
      console.log('   Email confirmed:', !!authUser.email_confirmed_at);
    } else {
      console.log('❌ User not found in Auth');
    }
  }
  
  // Step 3: Try to create database user if missing
  if (!dbUser && authData) {
    const authUser = authData?.users?.find(u => u.email === email);
    if (authUser) {
      console.log('\n3. Creating database profile...');
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
        console.log('❌ Failed to create profile:', createError.message);
      } else {
        console.log('✅ Profile created:', newUser);
      }
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('Test completed!');
}

testLogin();