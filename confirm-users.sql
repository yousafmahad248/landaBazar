-- Confirm all existing users in Supabase Auth
-- Run this in Supabase Dashboard > SQL Editor

-- Update all users to confirmed status
UPDATE auth.users 
SET email_confirmed_at = NOW(),
    confirmed_at = NOW(),
    last_sign_in_at = NOW()
WHERE email_confirmed_at IS NULL;

-- Verify the update
SELECT id, email, email_confirmed_at, confirmed_at 
FROM auth.users 
ORDER BY created_at DESC;