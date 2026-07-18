# Supabase Migration Instructions

Yeh steps follow karein apne local database ko Supabase par migrate karne ke liye.

## Step 1: Supabase Schema Setup

1. **Supabase Dashboard kholen**: https://supabase.com/dashboard
2. **Apna project select karein** (jfucpalmamyafotgujey)
3. **SQL Editor** par jayen (left sidebar mein)
4. **supabase-schema.sql** file ke saare contents copy karein
5. SQL Editor mein paste karein
6. **RUN** button click karein

Yeh command saare tables, indexes, RLS policies, aur triggers create kar dega.

## Step 2: Create Users in Supabase Auth

Ab aapko Supabase Auth mein users create karne honge:

1. Supabase Dashboard mein **Authentication** > **Users** par jayen
2. **Add user** button click karein
3. Yeh 3 users create karein:

### User 1: Admin
- **Email**: admin@thriftedkicks.com
- **Password**: koi bhi password (baad mein change kar sakte hain)
- **Email Confirm**: ✅ (CHECK KAREIN - IMPORTANT!)
- **Auto Confirm User**: ✅ (CHECK KAREIN - IMPORTANT!)

### User 2: Yousaf Mahad
- **Email**: yousafmahad248@gmail.com
- **Password**: koi bhi password
- **Email Confirm**: ✅ (CHECK KAREIN - IMPORTANT!)
- **Auto Confirm User**: ✅ (CHECK KAREIN - IMPORTANT!)

### User 3: Mahad Yousaf
- **Email**: mahadshah571@gmail.com
- **Password**: koi bhi password
- **Email Confirm**: ✅ (CHECK KAREIN - IMPORTANT!)
- **Auto Confirm User**: ✅ (CHECK KAREIN - IMPORTANT!)

**⚠️ IMPORTANT**: Dono checkboxes check karein, warna "Email not confirmed" error aayega!

**Note**: Password baad mein login ke time use hoga, isliye yaad rakhna!

### Step 2.1: Confirm Users (Agar email confirm nahi hui to)

Agar users create karne ke baad bhi "Email not confirmed" error aa raha hai, to:

1. Supabase Dashboard > **SQL Editor** par jayen
2. **confirm-users.sql** file ka content paste karein
3. RUN button click karein
4. Yeh saare users ko confirm kar dega

## Step 3: Run Migration Script

Terminal mein yeh command run karein:

```bash
node migrate-to-supabase.js
```

Yeh script:
- Local users data ko Supabase `users` table mein transfer kar dega
- Categories transfer kar dega
- Products transfer kar dega
- Wishlist transfer kar dega

Expected output:
```
🚀 Starting Migration to Supabase...
==================================================

📤 Migrating Users...
  ✅ admin@thriftedkicks.com
  ✅ yousafmahad248@gmail.com
  ✅ mahadshah571@gmail.com

📤 Migrating Categories...
  ℹ️  No categories to migrate

📤 Migrating Products...
  ℹ️  No products to migrate

📤 Migrating Wishlist...
  ℹ️  No wishlist items to migrate

==================================================
✅ Migration completed!
```

## Step 4: Update User IDs (Important!)

Migration script ne users ko alag IDs di hongi. Ab unko Supabase Auth ke user IDs se match karna hoga:

1. Supabase Dashboard > **Authentication** > **Users** mein jayen
2. Har user ke **UUID** copy karein
3. Supabase Dashboard > **Table Editor** > **users** par jayen
4. Har user ki row mein `id` field update karein aur woh UUID paste karein jo Auth se copy ki thi

Ya phir yeh SQL run karein (SQL Editor mein):

```sql
-- Update user IDs to match Supabase Auth
UPDATE users SET id = 'AUTH_USER_ID_HERE' WHERE email = 'admin@thriftedkicks.com';
UPDATE users SET id = 'AUTH_USER_ID_HERE' WHERE email = 'yousafmahad248@gmail.com';
UPDATE users SET id = 'AUTH_USER_ID_HERE' WHERE email = 'mahadshah571@gmail.com';
```

Har `AUTH_USER_ID_HERE` ko actual UUID se replace karein.

## Step 5: Test the Application

1. Server restart karein:
```bash
npm run dev
```

2. Browser mein http://localhost:3000 kholen

3. Test karein:
   - **Login**: `/login` par jakein aur credentials se login karein
   - **Register**: Naya account banayein
   - **Shop**: Products dekhain
   - **Wishlist**: Products ko wishlist mein add karein
   - **Sell Shoes**: `/sell` par jakein product add karein
   - **Admin Dashboard**: `/admin` par jakein (admin user se)

## Step 6: Cleanup (Optional)

Sab kuch kaam kar raha hai to:

1. **thrifted_kicks_db.json** file delete kar sakte hain
2. **migrate-to-supabase.js** file delete kar sakte hain
3. **supabase-schema.sql** file save kar sakte hain (backup ke liye)

## Troubleshooting

### Error: "Supabase credentials missing"
.env file mein SUPABASE_URL aur SUPABASE_ANON_KEY check karein.

### Error: "Invalid email or password"
- Supabase Auth mein user create hua hai ya nahi check karein
- User ki email confirmed hai ya nahi check karein

### Error: "User profile not found"
- users table mein user entry hai ya nahi check karein
- User ID Auth ke UUID se match karta hai ya nahi check karein

### Products nahi dikh rahe
- products table mein data hai ya nahi check karein
- RLS policies sahi hain ya nahi check karein

## Next Steps

Migration complete hone ke baad:
- Cart system add kar sakte hain
- Payment integration kar sakte hain
- Order management system add kar sakte hain
- Real-time notifications add kar sakte hain

## Support

Agar koi issue aaye to:
1. Console errors check karein
2. Supabase Dashboard > Logs check karein
3. Network tab mein API calls check karein