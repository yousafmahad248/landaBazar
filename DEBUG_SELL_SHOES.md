# Sell Shoes - Debug Guide

## Problem
"List My Shoes" button click kar rahe hain lekin product create nahi ho raha.

## ✅ Changes Made

### 1. Frontend Logging (SellShoes.tsx)
Console mein ab detailed logs dikhenge:
- `📝 Submitting product:` - Form data
- `📦 Product data:` - Final product object
- `✅ Product listed successfully!` - Success message
- `❌ Error listing product:` - Error details

### 2. Backend Logging (server.ts)
Server console mein ab detailed logs dikhenge:
- `📝 Received product creation request`
- `👤 User: email@example.com`
- `📦 Product data received:` - All fields
- `❌ Missing required fields` - Agar koi field missing hai
- `✅ User found: Name`
- `💾 Creating product in database...`
- `✅ Product created successfully: product-id`
- `❌ Error creating product:` - Error details

## 🔍 Debug Steps

### Step 1: Check Browser Console
1. **F12** press karein (Developer Tools)
2. **Console** tab par jayen
3. "List My Shoes" button click karein
4. Yahan logs dekhen:
   - Kya error aa raha hai?
   - Kya data submit ho raha hai?
   - Kya response aa raha hai?

### Step 2: Check Server Console
Terminal/CMD jahan server run kar rahe hain wahan dekhen:
- Kya logs aa rahe hain?
- Kya error dikha raha hai?
- Request reach kar rahi hai server tak?

### Step 3: Common Issues

#### Issue 1: "Please fill in all required fields"
**Solution:** Sab fields fill karein:
- Product Name
- Brand
- Size
- Condition
- Description
- Price
- Category
- At least 1 image

#### Issue 2: "Please add at least one image"
**Solution:** 
- Image upload karein, ya
- Manual URL add karein

#### Issue 3: "Not authenticated"
**Solution:** 
- Login karein
- Token valid hai ya nahi check karein

#### Issue 4: "User not found"
**Solution:**
- Database mein user exists karta hai?
- `check-admin.js` run karein

#### Issue 5: "Missing required product attributes"
**Solution:**
- Console logs dekhen ke kaun sa field missing hai
- Backend logs mein "missing" object dekhen

## 🧪 Test Karne Ke Liye

### Minimum Required Data:
```javascript
{
  name: "Air Jordan 1",
  brand: "Nike",
  size: "US 10",
  condition: "Good",
  description: "Great condition shoes",
  price: 150,
  categoryId: "cat-123", // Koi bhi valid category ID
  imageUrls: ["https://example.com/image.jpg"]
}
```

## 📋 Checklist

- [ ] Server running hai? (`npm run dev`)
- [ ] Login hai?
- [ ] Browser console open hai aur logs dekh rahe hain?
- [ ] Server console logs dekh rahe hain?
- [ ] Sab form fields fill hain?
- [ ] At least 1 image hai?
- [ ] Category select ki hai?
- [ ] Price daal di hai?

## 🐛 Agar Abhi Bhi Kaam Na Kare

Console logs copy karein aur batayen:
1. Browser console kya dikha raha hai?
2. Server console kya dikha raha hai?
3. Kya error message aa raha hai?

Tab main exact problem solve kar paunga!

## 🔧 Quick Fixes

### Fix 1: Server Restart
```bash
# Server stop karein (Ctrl+C)
# Phir se start karein:
npm run dev
```

### Fix 2: Clear Cache
```bash
# Browser cache clear karein (Ctrl+Shift+Delete)
# Ya hard refresh karein (Ctrl+Shift+R)
```

### Fix 3: Check Token
```javascript
// Browser console mein run karein:
console.log('Token:', localStorage.getItem('token'));
```

### Fix 4: Test API Directly
```javascript
// Browser console mein run karein:
const token = localStorage.getItem('token');
fetch('http://localhost:3000/api/user/products', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    name: "Test Shoe",
    brand: "Nike",
    size: "US 10",
    condition: "Good",
    description: "Test description",
    price: 100,
    categoryId: "YOUR_CATEGORY_ID",
    imageUrls: ["https://via.placeholder.com/300"]
  })
})
.then(r => r.json())
.then(console.log)
.catch(console.error);