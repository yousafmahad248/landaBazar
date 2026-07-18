/**
 * Check who is the admin in the database
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

async function checkAdmin() {
  console.log('🔍 Checking for admin users in database...\n');
  console.log('='.repeat(60));

  // Get all users
  const { data: users, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.log('❌ Error fetching users:', error.message);
    return;
  }

  if (!users || users.length === 0) {
    console.log('❌ No users found in database');
    return;
  }

  console.log(`\n📊 Total users in database: ${users.length}\n`);

  // Separate admins and regular users
  const admins = users.filter(u => u.is_admin === true);
  const regularUsers = users.filter(u => u.is_admin !== true);

  console.log('👑 ADMIN USERS:');
  console.log('-'.repeat(60));
  if (admins.length === 0) {
    console.log('❌ No admin users found!');
    console.log('\n💡 Tip: Make a user admin by running this SQL in Supabase:');
    console.log('   UPDATE users SET is_admin = true WHERE email = \'user@example.com\';');
  } else {
    admins.forEach((admin, index) => {
      console.log(`\n${index + 1}. ${admin.name}`);
      console.log(`   Email: ${admin.email}`);
      console.log(`   ID: ${admin.id}`);
      console.log(`   Phone: ${admin.phone || 'N/A'}`);
      console.log(`   Created: ${admin.created_at}`);
    });
  }

  console.log('\n\n👤 REGULAR USERS:');
  console.log('-'.repeat(60));
  if (regularUsers.length === 0) {
    console.log('No regular users found');
  } else {
    regularUsers.forEach((user, index) => {
      console.log(`\n${index + 1}. ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Phone: ${user.phone || 'N/A'}`);
      console.log(`   Created: ${user.created_at}`);
    });
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n💡 To make someone admin, run this SQL in Supabase Dashboard:');
  console.log('   UPDATE users SET is_admin = true WHERE email = \'email@example.com\';');
  console.log('\nOr visit: https://supabase.com/dashboard/project/jfucpalmamyafotgujey/editor');
}

checkAdmin();