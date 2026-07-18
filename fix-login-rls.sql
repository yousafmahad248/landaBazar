-- Fix RLS policies to allow login functionality
-- This allows anonymous users to read user profiles (needed for login)
-- Run this in Supabase Dashboard > SQL Editor

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

-- Verify the policies
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