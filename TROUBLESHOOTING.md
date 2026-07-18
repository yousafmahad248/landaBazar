# Login Issue - Troubleshooting Guide

"Invalid email or password" error aa raha hai? Yeh steps follow karein:

## 🔍 Step 1: Check Supabase Schema

1. Supabase Dashboard kholen
2. Left sidebar > **SQL Editor**
3. Ye query run karein:

```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE';
```

**Expected Output:**
- users
- categories
- products
- wishlist

Agar saare tables nahi dikh rahe, to `supabase-schema.sql` run karein.

## 🔍 Step 2: Check Users in Database

1. Supabase Dashboard > **Table Editor** > **users**
2. Wahan 3 users hone chahiye:
   - admin@thriftedkicks.com
   - yousafmahad248@gmail.com
   - mahadshah571@gmail.com

Agar users nahi hain, to migration script run karein:
```bash
node migrate-to-supabase.js
```

## 🔍 Step 3: Check Supabase Auth Users

1. Supabase Dashboard > **Authentication** > **Users**
2. Wahan bhi 3 users hone chahiye
3. Har user ke **Email Confirmed** column mein ✅ hona chahiye

Agar users nahi hain, to create karein:
- Email: admin@thriftedkicks.com
- Password: admin123
- ✅ Email Confirm check karein
- ✅ Auto Confirm User check karein

## 🔍 Step 4: Check User IDs Match

**Yeh sabse important step hai!**

1. **Supabase Auth Users** se UUID copy karein:
   - Authentication > Users
   - Har user par click karein
   - UUID copy karein (e.g., "123e4567-e89b-12d3-a456-426614174000")

2. **Users Table** mein check karein:
   - Table Editor > users
   - Har user ki `id` column mein wohi UUID honi chahiye

3. Agar match nahi kar rahe, to SQL run karein:

```sql
-- Pehle check karein ke Auth mein kaun sa UUID hai
SELECT id, email FROM auth.users;

-- Phir users table mein update karein
UPDATE users SET id = 'AUTH_UUID_HERE' WHERE email = 'admin@thriftedkicks.com';
UPDATE users SET id = 'AUTH_UUID_HERE' WHERE email = 'yousafmahad248@gmail.com';
UPDATE users SET id = 'AUTH_UUID_HERE' WHERE email = 'mahadshah571@gmail.com';
```

## 🔍 Step 5: Use Debug Endpoint

Server running hai to browser ya Postman mein yeh URL kholen:

```
http://localhost:3000/api/debug/users
```

Yeh aapko batayega:
- Kitne users database mein hain
- Kitne users Auth mein hain
- User IDs match kar rahe hain ya nahi

## 🔍 Step 6: Check Server Logs

Terminal mein server logs dekhien. Jab login attempt karein, to console mein yeh dikhai dena chahiye:

```
🔐 Login attempt for: admin@thriftedkicks.com
✅ User found in database: xxxxx, isAdmin: true
```

Agar "User not found in database" aa raha hai, to migration nahi hui.

Agar "Supabase Auth error" aa raha hai, to:
- Password galat hai
- Ya user Auth mein nahi hai

## 🚀 Quick Fix - Complete Migration in One Go

Agar kuch bhi nahi kaam kar raha, to yeh complete process follow karein:

### 1. Supabase Dashboard > SQL Editor

**First, drop everything and start fresh:**
```sql
-- Drop all tables (CAREFUL!)
DROP TABLE IF EXISTS wishlist CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;
```

**Then run schema:**
```sql
-- Copy paste entire supabase-schema.sql content here
-- (CREATE TABLE statements, indexes, RLS policies, triggers)
```

### 2. Create Users in Supabase Auth

**Method A: Via Dashboard (Easiest)**
1. Authentication > Users
2. Add user (3 times)
3. Email: admin@thriftedkicks.com, Password: admin123
4. ✅ Email Confirm check karein
5. ✅ Auto Confirm User check karein
6. Add user button click karein

**Method B: Via SQL (Faster)**
```sql
-- Create users directly in auth.users
INSERT INTO auth.users (id, email, email_confirmed_at, confirmed_at, last_sign_in_at)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'admin@thriftedkicks.com', NOW(), NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000002', 'yousafmahad248@gmail.com', NOW(), NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000003', 'mahadshah571@gmail.com', NOW(), NOW());
```

### 3. Run Migration Script

```bash
node migrate-to-supabase.js
```

Expected output:
```
🚀 Starting Migration to Supabase...
==================================================
📤 Migrating Users...
  ✅ admin@thriftedkicks.com
  ✅ yousafmahad248@gmail.com
  ✅ mahadshah571@gmail.com
==================================================
✅ Migration completed!
```

### 4. Update User IDs

```sql
-- Update users table IDs to match Auth
UPDATE users SET id = '00000000-0000-0000-0000-000000000001' WHERE email = 'admin@thriftedkicks.com';
UPDATE users SET id = '00000000-0000-0000-0000-000000000002' WHERE email = 'yousafmahad248@gmail.com';
UPDATE users SET id = '00000000-0000-0000-0000-000000000003' WHERE email = 'mahadshah571@gmail.com';
```

### 5. Restart Server

```bash
# Stop server (Ctrl+C)
# Then restart
npm run dev
```

### 6. Test Login

Browser mein: http://localhost:3000/login

**Test Credentials:**
- Email: admin@thriftedkicks.com
- Password: admin123

## ✅ Verification Checklist

- [ ] Supabase schema ran successfully
- [ ] 3 users exist in Supabase Auth
- [ ] 3 users exist in users table
- [ ] User IDs match in both places
- [ ] Migration script ran successfully
- [ ] Server restarted
- [ ] Login works

## 🐛 Common Issues

### Issue: "User not found in database"
**Solution:** Run migration script: `node migrate-to-supabase.js`

### Issue: "Email not confirmed"
**Solution:** Run `confirm-users.sql` or check "Email Confirm" in Auth

### Issue: "Password does not match"
**Solution:** Create users in Supabase Auth with password: admin123

### Issue: "User profile not found"
**Solution:** User IDs don't match. Update IDs as shown in Step 4.

## 📞 Still Not Working?

Check these:
1. Server logs in terminal
2. Browser console (F12)
3. Network tab in browser DevTools
4. Supabase Dashboard > Logs

Console logs abhi detailed hain, wahan dekh kar exact problem pata kar sakte hain.