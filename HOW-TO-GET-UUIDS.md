# How to Get Supabase Auth UUIDs

Yeh step by step guide follow karein ke kaise Supabase Auth se actual UUIDs copy karein.

## Method 1: From Supabase Dashboard (Easiest)

### Step 1: Supabase Auth Users List

1. **Supabase Dashboard kholen**: https://supabase.com/dashboard
2. Left sidebar se **Authentication** par click karein
3. **Users** tab par click karein

### Step 2: Copy UUIDs

Ab aapko 3 users dikhne chahiye. Har user ke liye:

1. **User 1: admin@thriftedkicks.com**
   - Us par click karein
   - **User ID** field mein ek long string hoga (e.g., `123e4567-e89b-12d3-a456-426614174000`)
   - Copy karein (Ctrl+C)

2. **User 2: yousafmahad248@gmail.com**
   - Us par click karein
   - **User ID** copy karein

3. **User 3: mahadshah571@gmail.com**
   - Us par click karein
   - **User ID** copy karein

### Step 3: Update Users Table

Ab Supabase Dashboard > **SQL Editor** mein jayen aur yeh run karein:

```sql
-- Replace these UUIDs with the ones you copied from Auth
UPDATE users SET id = 'PASTE_FIRST_UUID_HERE' WHERE email = 'admin@thriftedkicks.com';
UPDATE users SET id = 'PASTE_SECOND_UUID_HERE' WHERE email = 'yousafmahad248@gmail.com';
UPDATE users SET id = 'PASTE_THIRD_UUID_HERE' WHERE email = 'mahadshah571@gmail.com';
```

**Example:**
```sql
UPDATE users SET id = '123e4567-e89b-12d3-a456-426614174000' WHERE email = 'admin@thriftedkicks.com';
UPDATE users SET id = '456e7890-e89b-12d3-a456-426614174001' WHERE email = 'yousafmahad248@gmail.com';
UPDATE users SET id = '789e0123-e89b-12d3-a456-426614174002' WHERE email = 'mahadshah571@gmail.com';
```

## Method 2: Using SQL Query (Faster)

### Step 1: Get All Auth Users

SQL Editor mein yeh query run karein:

```sql
SELECT id, email FROM auth.users ORDER BY created_at;
```

Output dikhega:
```
id                                   | email
-------------------------------------|------------------------
123e4567-e89b-12d3-a456-426614174000 | admin@thriftedkicks.com
456e7890-e89b-12d3-a456-426614174001 | yousafmahad248@gmail.com
789e0123-e89b-12d3-a456-426614174002 | mahadshah571@gmail.com
```

### Step 2: Copy UUIDs

Har row se `id` column ki value copy karein.

### Step 3: Update Users Table

```sql
UPDATE users SET id = '123e4567-e89b-12d3-a456-426614174000' WHERE email = 'admin@thriftedkicks.com';
UPDATE users SET id = '456e7890-e89b-12d3-a456-426614174001' WHERE email = 'yousafmahad248@gmail.com';
UPDATE users SET id = '789e0123-e89b-12d3-a456-426614174002' WHERE email = 'mahadshah571@gmail.com';
```

## Method 3: Automatic Update (Easiest!)

Agar aap chahte hain ke automatically IDs match ho jayein, to yeh query run karein:

```sql
-- Automatically update users table IDs to match Auth users
UPDATE users 
SET id = auth_users.id
FROM auth.users auth_users
WHERE users.email = auth_users.email;
```

Yeh query automatically saare users ke IDs update kar degi!

## Verification

### Check 1: Verify Users Table

```sql
SELECT id, email, name, is_admin FROM users;
```

Output:
```
id                                   | email                       | name              | is_admin
-------------------------------------|-----------------------------|-------------------|----------
123e4567-e89b-12d3-a456-426614174000 | admin@thriftedkicks.com     | Thrifted Kicks Admin | true
456e7890-e89b-12d3-a456-426614174001 | yousafmahad248@gmail.com    | yousaf mahad      | false
789e0123-e89b-12d3-a456-426614174002 | mahadshah571@gmail.com      | Mahad yousaf      | false
```

### Check 2: Verify Auth Users

```sql
SELECT id, email, email_confirmed_at FROM auth.users;
```

Output:
```
id                                   | email                       | email_confirmed_at
-------------------------------------|-----------------------------|-------------------
123e4567-e89b-12d3-a456-426614174000 | admin@thriftedkicks.com     | 2026-07-14 20:34:36
456e7890-e89b-12d3-a456-426614174001 | yousafmahad248@gmail.com    | 2026-07-14 20:36:17
789e0123-e89b-12d3-a456-426614174002 | mahadshah571@gmail.com      | 2026-07-14 20:46:49
```

### Check 3: Verify IDs Match

```sql
-- This should return all 3 users if IDs match
SELECT u.id, u.email, a.id as auth_id 
FROM users u 
JOIN auth.users a ON u.email = a.email;
```

## Common Mistakes to Avoid

### ❌ Wrong: Using placeholder text
```sql
UPDATE users SET id = 'AUTH_UUID_1' WHERE email = 'admin@thriftedkicks.com';
```

### ✅ Correct: Using actual UUID
```sql
UPDATE users SET id = '123e4567-e89b-12d3-a456-426614174000' WHERE email = 'admin@thriftedkicks.com';
```

### ❌ Wrong: Missing quotes
```sql
UPDATE users SET id = 123e4567-e89b-12d3-a456-426614174000 WHERE email = 'admin@thriftedkicks.com';
```

### ✅ Correct: With quotes
```sql
UPDATE users SET id = '123e4567-e89b-12d3-a456-426614174000' WHERE email = 'admin@thriftedkicks.com';
```

## Quick Test

After updating IDs, test login:

```bash
npm run dev
```

Browser: http://localhost:3000/login
- Email: admin@thriftedkicks.com
- Password: admin123

## Still Having Issues?

Use the debug endpoint:
```
http://localhost:3000/api/debug/users
```

Yeh aapko batayega:
- Database mein kitne users hain
- Auth mein kitne users hain
- IDs match kar rahe hain ya nahi