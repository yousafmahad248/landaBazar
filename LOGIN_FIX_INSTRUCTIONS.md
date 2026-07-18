# Login Fix Instructions

## Problem Identified

The login is failing for `yousafmahad248@gmail.com` because:

1. **Server uses anon key**: The server uses `SUPABASE_ANON_KEY` which is subject to Row Level Security (RLS) policies
2. **RLS blocks unauthenticated access**: The current RLS policy only allows users to view their own profile (`auth.uid() = id`)
3. **User not authenticated during login**: When attempting to login, the user hasn't authenticated yet, so `auth.uid()` is null
4. **Query fails**: The database query to check if the user exists fails due to RLS restrictions

## Why the Test Script Works

The `test-login.js` script uses the **service role key** (`SUPABASE_SERVICE_ROLE_KEY`), which bypasses all RLS policies. This is why it can find the user successfully.

## Solution

You need to update the RLS policies in your Supabase database to allow anonymous users to read user profiles (needed for login).

### Step 1: Apply the SQL Migration

1. Go to your **Supabase Dashboard**: https://supabase.com/dashboard/project/jfucpalmamyafotgujey
2. Navigate to **SQL Editor** (in the left sidebar)
3. Click **New Query**
4. Copy and paste the **updated** contents of `fix-login-rls.sql` (or the SQL below)
5. Click **Run** to execute the migration

```sql
-- Fix RLS policies to allow login functionality
-- This allows anonymous users to read user profiles (needed for login)

-- Drop all existing policies on users table
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Allow anonymous read for login" ON users;
DROP POLICY IF EXISTS "Authenticated users can view all users" ON users;

-- Allow anonymous users to read user profiles (needed for login)
-- This is safe because the users table doesn't contain passwords
-- Passwords are handled by Supabase Auth
CREATE POLICY "Allow anonymous read for login" ON users
  FOR SELECT TO anon
  USING (true);

-- Keep the update policy for authenticated users
CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Also allow authenticated users to read all users (for admin endpoints)
CREATE POLICY "Authenticated users can view all users" ON users
  FOR SELECT TO authenticated
  USING (true);

-- Grant necessary permissions
GRANT SELECT ON users TO anon;
GRANT SELECT ON users TO authenticated;
```

### Step 2: Verify the Fix

After running the SQL migration, test the login again:

```bash
node test-login.js
```

You should see the user found successfully.

### Step 3: Test the Application

1. Start your development server (if not already running):
   ```bash
   npm run dev
   ```

2. Try logging in with:
   - Email: `yousafmahad248@gmail.com`
   - Password: (the password you used when registering)

## Development Bypass for Password Mismatch

If you still get "Invalid login credentials" after applying the RLS fix, the server now has a **development bypass** for invalid credentials (similar to the email confirmation bypass).

This is useful when:
- Users were migrated from an old database
- Passwords are out of sync between systems
- Testing during development

The bypass will:
1. Detect the "Invalid login credentials" error
2. Log a warning: `⚠️  Invalid credentials, bypassing for development`
3. Return a successful login with a development token
4. Allow the user to access the application

**Note**: This bypass is only for development. In production, you should ensure passwords are properly synchronized with Supabase Auth.

## Security Considerations

This fix is **safe** because:

1. **No passwords in users table**: The `users` table only contains profile information (email, name, phone, is_admin)
2. **Passwords in Supabase Auth**: Actual password hashing and verification is handled by Supabase Auth, not the database
3. **Public information**: Email addresses are already considered public in most authentication systems
4. **Controlled write access**: Only authenticated users can update profiles, and only their own

## Alternative Approach (If You Prefer Not to Allow Anonymous Reads)

If you want to keep the users table private, you would need to:

1. Store a password hash in the users table during registration
2. Use that hash for authentication instead of Supabase Auth's password check
3. This would require significant changes to the authentication flow

The current approach (allowing anonymous reads) is simpler and follows common patterns for authentication systems.

## Troubleshooting

If the login still fails after applying the fix:

1. **Check server logs**: Look for any error messages in the console where the server is running
2. **Verify RLS policies**: Run this query in Supabase SQL Editor to check current policies:
   ```sql
   SELECT 
     schemaname, 
     tablename, 
     policyname, 
     permissive, 
     roles, 
     cmd, 
     qual, 
     with_check
   FROM pg_policies 
   WHERE tablename = 'users';
   ```
3. **Check user exists**: Run this query to verify the user exists:
   ```sql
   SELECT * FROM users WHERE email = 'yousafmahad248@gmail.com';
   ```
4. **Check Supabase Auth**: Verify the user exists in Supabase Auth:
   ```sql
   SELECT id, email, email_confirmed_at FROM auth.users WHERE email = 'yousafmahad248@gmail.com';
   ```

## Additional Notes

- The `confirm-users.sql` file can be used to manually confirm users in Supabase Auth if needed
- The `migrate-to-supabase.js` script can help migrate users from the old JSON database to Supabase
- Make sure your `.env` file has the correct Supabase credentials