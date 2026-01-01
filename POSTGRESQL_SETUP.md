# PostgreSQL Setup Guide for Render

This guide will help you set up PostgreSQL on Render so your data persists across deployments.

## Why PostgreSQL?

✅ **Persistent Data**: Unlike SQLite, your data won't be lost on redeployments  
✅ **Free Tier**: Render offers 90 days free PostgreSQL (then $7/month, or use external free options)  
✅ **Production Ready**: Better performance and reliability for web apps  

---

## Step 1: Create PostgreSQL Database on Render

### Option A: Render PostgreSQL (90 days free, then $7/month)

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Click "New +"** → Select **"PostgreSQL"**
3. **Configure the Database**:
   - **Name**: `budget-tracker-db` (or any name you prefer)
   - **Database**: `budgettracker` (will be created automatically)
   - **User**: `budgettracker` (will be created automatically)
   - **Region**: Choose the **same region** as your web service (for best performance)
   - **Instance Type**: Select **"Free"** (90 days free trial, then $7/month)
4. **Click "Create Database"**
5. **Wait 2-3 minutes** for the database to be provisioned

### Option B: External Free PostgreSQL (Recommended for Long-term Free)

#### Supabase (Recommended)
1. Go to https://supabase.com
2. Sign up and create a new project
3. Go to **Settings** → **Database**
4. Find the **Connection String** (URI format)
5. Use this connection string in Step 3

#### ElephantSQL
1. Go to https://www.elephantsql.com
2. Sign up and create a **"Tiny Turtle"** (free) instance
3. Copy the **URL** from the details page
4. Use this URL in Step 3

---

## Step 2: Get Your Database Connection String

### If Using Render PostgreSQL:

1. On your database page, find **"Connections"** section
2. Copy the **"External Database URL"** (it looks like this):
   ```
   postgres://username:password@hostname:5432/database_name
   ```
3. **Keep this URL safe** - you'll need it in the next step

### If Using External Provider:

- Copy the connection string from your provider (Supabase, ElephantSQL, etc.)

---

## Step 3: Add Environment Variable to Your Web Service

1. **Go to your Web Service** on Render (the one running your budget tracker)
2. Click **"Environment"** in the left sidebar
3. Click **"Add Environment Variable"**
4. Add the following:
   - **Key**: `DATABASE_URL`
   - **Value**: Paste your PostgreSQL connection string from Step 2
   
   Example:
   ```
   DATABASE_URL=postgres://user:password@hostname:5432/dbname
   ```

5. Click **"Save Changes"**

---

## Step 4: Deploy Your Updated Code

### Push to GitHub:

```bash
cd "/Users/jashvithlani/Desktop/Budget tracker"

# Stage all changes
git add .

# Commit with a message
git commit -m "Migrate to PostgreSQL for persistent storage"

# Push to GitHub
git push origin master
```

### Render Will Automatically:
1. Detect the new code
2. Rebuild your application
3. Connect to PostgreSQL
4. Initialize the database tables
5. Start your app with persistent storage 🎉

---

## Step 5: Verify It's Working

1. **Check Render Logs**:
   - Go to your web service on Render
   - Click **"Logs"** tab
   - Look for: `✅ PostgreSQL database initialized successfully`

2. **Test Your App**:
   - Open your app URL (e.g., `https://budget-tracker-xxx.onrender.com`)
   - Log in and add some test data
   - Redeploy (push a small change) or wait for server to sleep/wake
   - **Your data should still be there!** ✨

---

## Step 6: Monitor Your Database

### Check Database Connection:
```bash
# In Render dashboard, go to your database
# Click "Connect" to see connection details
```

### View Database Data:
- Use tools like **pgAdmin**, **DBeaver**, or **TablePlus**
- Connect using your database URL
- You can view tables: `segments`, `expenses`, `segment_budgets`, `monthly_budgets`

---

## Troubleshooting

### ❌ Error: "Connection timeout" or "Cannot connect to database"

**Solution**: Check that `DATABASE_URL` environment variable is set correctly:
1. Go to Render Dashboard → Your Web Service → Environment
2. Verify `DATABASE_URL` is present and correct
3. If using Render PostgreSQL, make sure both services are in the **same region**

### ❌ Error: "password authentication failed"

**Solution**: Your connection string might be incorrect:
1. Go back to your PostgreSQL database page
2. Copy the **External Database URL** again (don't use Internal)
3. Update the `DATABASE_URL` environment variable
4. Redeploy

### ❌ Error: "SSL connection required"

**Solution**: This is handled automatically by the code, but if you still see this:
- For Render PostgreSQL: Should work automatically
- For external providers: Add `?sslmode=require` to the end of your connection string

### ❌ Build fails with "pg module not found"

**Solution**: 
```bash
# Delete node_modules and package-lock.json locally
rm -rf node_modules package-lock.json

# Reinstall
npm install

# Commit and push
git add .
git commit -m "Fix pg dependency"
git push origin master
```

---

## Cost Breakdown

| Option | Cost | Duration | Notes |
|--------|------|----------|-------|
| Render PostgreSQL | Free | 90 days | Then $7/month |
| Render PostgreSQL | $7/month | After trial | Automatic backups, reliable |
| Supabase | Free | Forever | 500MB storage, 2GB bandwidth |
| ElephantSQL | Free | Forever | 20MB storage |
| Render Web Service | Free | Forever | Sleeps after inactivity |

---

## Next Steps

✅ Your budget tracker now has **persistent storage**!  
✅ Data survives deployments and server restarts  
✅ You can add users and track expenses without worry  

### Optional Enhancements:

1. **Set up Database Backups** (Render PostgreSQL includes daily backups)
2. **Monitor Database Size** (check Render dashboard)
3. **Optimize Queries** (add indexes if needed later)

---

## Need Help?

- Check Render logs for detailed error messages
- Review the [Render PostgreSQL docs](https://render.com/docs/databases)
- Check your database provider's documentation

**Your app is now production-ready! 🚀**

