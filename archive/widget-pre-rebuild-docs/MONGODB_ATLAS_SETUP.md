# 🚀 MongoDB Atlas Setup Guide (Option 2)

**Estimated Time**: 5-10 minutes

---

## ✅ What You Have Already

Your codebase already has:
- ✅ MongoDB connection logic in place
- ✅ Seed scripts ready (`scripts/seed-database.js`)
- ✅ Environment configuration structure

**You just need to**:
1. Create a free MongoDB Atlas cluster
2. Get the connection string
3. Update `.env.local`
4. Run the seed script

---

## 📋 Step-by-Step Instructions

### Step 1: Create MongoDB Atlas Account (2 minutes)

1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Sign up with:
   - **Email** (recommended)
   - OR Google account
   - OR GitHub account
3. Verify your email if prompted

---

### Step 2: Create Free Cluster (3-5 minutes)

1. After login, click **"Build a Database"**
2. Choose **M0 FREE** tier (should be pre-selected)
   - Provider: AWS, Google Cloud, or Azure (any works)
   - Region: Choose closest to you (e.g., `us-west-2`)
3. Cluster Name: `Cluster0` or `glowglitch`
4. Click **"Create Cluster"**
5. ⏳ Wait 3-5 minutes for cluster to provision

---

### Step 3: Create Database User (1 minute)

**While cluster is creating:**

1. Click **"Database Access"** (left sidebar under Security)
2. Click **"Add New Database User"**
3. Settings:
   - **Username**: `glowglitch_user` (or your choice)
   - **Password**: Click **"Autogenerate Secure Password"** 
   - 📋 **COPY THE PASSWORD** (you'll need it in Step 5)
   - **Database User Privileges**: `Read and write to any database`
4. Click **"Add User"**

---

### Step 4: Whitelist IP Address (1 minute)

1. Click **"Network Access"** (left sidebar under Security)
2. Click **"Add IP Address"**
3. **For Development**: Click **"Allow Access from Anywhere"** → `0.0.0.0/0`
   - ⚠️ This is safe for development. In production, restrict to specific IPs.
4. Click **"Confirm"**

---

### Step 5: Get Connection String (1 minute)

1. Go back to **"Database"** (left sidebar)
2. Wait for cluster status to show **"Active"** (green indicator)
3. Click **"Connect"** button on your cluster
4. Choose **"Connect your application"**
5. Settings:
   - **Driver**: Node.js
   - **Version**: 5.5 or later
6. **Copy** the connection string shown (looks like):

```
mongodb+srv://glowglitch_user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

7. **IMPORTANT**: Replace `<password>` with the password you copied in Step 3

**Example result**:
```
mongodb+srv://glowglitch_user:MySecureP@ss123@cluster0.abc123.mongodb.net/?retryWrites=true&w=majority
```

---

### Step 6: Update Your `.env.local` File

**I'll do this for you in agent mode!** Just provide me with your connection string.

Your `.env.local` will be updated to:

```bash
# MongoDB Atlas Connection (Cloud - Option 2)
CONCIERGE_DATA_MODE=localDb
MONGODB_URI=<YOUR_ATLAS_CONNECTION_STRING>
MONGODB_DB=glowglitch
```

---

### Step 7: Seed Database (30 seconds)

**I'll run this for you:**

```bash
node scripts/seed-database.js
```

This will populate your Atlas database with 7 ready-to-ship products.

---

### Step 8: Restart Dev Server

**I'll handle this:**

```bash
# Kill existing server
lsof -ti:3000 | xargs kill -9

# Start fresh
npm run dev
```

---

### Step 9: Test the Widget ✨

1. Open browser: http://localhost:3000
2. Click **"Ask Aurora Concierge"** button (bottom-right)
3. Click **"Ready to ship"**
4. **Expected**: Shows real products from MongoDB Atlas! 🎉

---

## 🎯 What You'll Get

After seeding, your MongoDB Atlas will have **7 products**:

| Product | Price | Category | Ready-to-Ship |
|---------|-------|----------|---------------|
| Solaris Halo Ring | $1,299 | Ring | ✅ Yes |
| Lumen Pavé Ring | $1,499 | Ring | ✅ Yes |
| Aurora Solitaire Ring | $2,499 | Ring | ✅ Yes |
| Nebula Custom Ring | $999 | Ring | ❌ No |
| Coral Sky Studs | $899 | Earring | ✅ Yes |
| Lab Diamond Pendant | $1,899 | Necklace | ✅ Yes |
| Minimalist Band Ring | $199 | Ring | ✅ Yes |

**Widget filters now work perfectly**:
- ✅ "Ready to ship" → 6 products
- ✅ "Gifts under $300" → 1 product
- ✅ "Design ideas" → 7 products

---

## 🔧 Troubleshooting

### Error: "Authentication failed"
**Fix**: Check that you replaced `<password>` in the connection string with your actual password.

**Special characters in password?** URL-encode them:
- `@` → `%40`
- `#` → `%23`
- `%` → `%25`
- `&` → `%26`

### Error: "Could not connect to any servers"
**Fix**: Check Network Access in Atlas → ensure IP address is whitelisted (or use `0.0.0.0/0` for dev).

### Error: "Database name not specified"
**Fix**: Add `/glowglitch` before the `?` in your connection string:
```
mongodb+srv://user:pass@cluster0.xxx.mongodb.net/glowglitch?retryWrites=true&w=majority
```

---

## 📝 Next Steps

Once you've completed Steps 1-5 and have your MongoDB Atlas connection string, provide it to me and I'll:

1. ✅ Update `.env.local` with your Atlas connection string
2. ✅ Run the seed script to populate your database
3. ✅ Restart the dev server
4. ✅ Verify the widget works with real data

---

## 🎯 Ready?

**Just say**: "Here's my MongoDB Atlas connection string: `mongodb+srv://...`"

And I'll handle the rest! 🚀

