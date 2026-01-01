# Supabase Setup Guide for Budget Tracker

Complete guide to set up your budget tracker with Supabase PostgreSQL (FREE FOREVER!)

## Why Supabase?

✅ **Free Forever**: 500MB storage, 2GB bandwidth  
✅ **Reliable**: Production-grade PostgreSQL  
✅ **Easy Setup**: 5 minutes to get started  
✅ **No Credit Card**: Truly free tier  
✅ **Automatic Backups**: Point-in-time recovery  

---

## Step 1: Create Supabase Account & Project

### 1.1 Sign Up
1. Go to https://supabase.com
2. Click **"Start your project"**
3. Sign up with GitHub (recommended) or email

### 1.2 Create New Project
1. Click **"New Project"**
2. Choose or create an **Organization** (free)
3. Fill in project details:
   - **Name**: `budget-tracker` (or any name you like)
   - **Database Password**: `Tokyo@123456789012` (or create a strong one - **SAVE THIS!**)
   - **Region**: Choose closest to you (or same as Render web service)
   - **Pricing Plan**: Free (default)
4. Click **"Create new project"**
5. **Wait 2-3 minutes** for provisioning

---

## Step 2: Get Your Database Connection String

### 2.1 Navigate to Database Settings
1. Once your project is ready, click **"Connect"** button (top right)
2. Or go to: **Settings** (left sidebar) → **Database**

### 2.2 Find Connection String
1. Scroll down to **"Connection string"** section
2. Select **"URI"** tab (not "Connection pooling")
3. You'll see something like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```

### 2.3 Replace Password
The connection string shows `[YOUR-PASSWORD]` - you need to replace it with your actual password:

```
# Before:
postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres

# After (with your password: Tokyo@123456789012):
postgresql://postgres:Tokyo@123456789012@db.xxxxx.supabase.co:5432/postgres
```

**COPY THIS FULL STRING** - you'll need it in the next step!

### 2.4 Alternative: Copy from Connection Info
If you see "Connection info" tab:
- **Host**: `db.xxxxx.supabase.co`
- **Port**: `5432`
- **Database**: `postgres`
- **User**: `postgres`
- **Password**: `Tokyo@123456789012` (or what you set)

Manually construct:
```
postgresql://postgres:Tokyo@123456789012@db.xxxxx.supabase.co:5432/postgres
```

---

## Step 3: Add to Render Environment

### 3.1 Go to Render Dashboard
1. Open https://dashboard.render.com
2. Click on your **Budget Tracker Web Service**

### 3.2 Add Environment Variable
1. Click **"Environment"** in left sidebar
2. Click **"Add Environment Variable"**
3. Enter:
   - **Key**: `DATABASE_URL`
   - **Value**: (paste your full Supabase connection string)
   
   Example:
   ```
   DATABASE_URL=postgresql://postgres:Tokyo@123456789012@db.xxxxx.supabase.co:5432/postgres
   ```

4. Click **"Save Changes"**

---

## Step 4: Deploy Your App

### 4.1 Push to GitHub

```bash
cd "/Users/jashvithlani/Desktop/Budget tracker"

# Stage all changes
git add .

# Commit
git commit -m "Migrate to PostgreSQL with Supabase"

# Push (this triggers Render deployment)
git push origin master
```

### 4.2 Monitor Deployment
1. Go to Render dashboard
2. Watch the build logs
3. Look for:
   ```
   ✅ PostgreSQL database initialized successfully
   🚀 Server is running on port 3001
   🗄️  PostgreSQL database connected
   ```

---

## Step 5: Verify It's Working

### 5.1 Check Render Logs
Look for these success messages:
```
✅ PostgreSQL database initialized successfully with multi-user support
👥 Multi-user support enabled - 2 users configured
🗄️  PostgreSQL database connected
```

### 5.2 Test Your App
1. Open your Render URL: `https://your-app.onrender.com`
2. Login with:
   - Username: `jashvithlani`
   - Password: `Tokyo@1234`
3. Add a test expense
4. Check dashboard shows it correctly

### 5.3 Test Data Persistence
1. Add some expenses (note the amounts)
2. Trigger a redeploy:
   ```bash
   # Make a small change and push
   echo "# Test" >> README.md
   git add . && git commit -m "Test deploy" && git push
   ```
3. Wait for redeploy to complete
4. Open app and login
5. **Your expenses should still be there!** ✅

---

## Step 6: View Your Database (Optional)

### 6.1 Use Supabase Table Editor
1. Go to your Supabase project
2. Click **"Table Editor"** in left sidebar
3. You'll see your tables:
   - `segments`
   - `monthly_budgets`
   - `segment_budgets`
   - `expenses`
4. Click any table to view/edit data

### 6.2 Use SQL Editor
1. Click **"SQL Editor"** in left sidebar
2. Run queries:
   ```sql
   -- View all segments
   SELECT * FROM segments;
   
   -- View all expenses
   SELECT * FROM expenses ORDER BY expense_date DESC;
   
   -- Count expenses
   SELECT COUNT(*) FROM expenses;
   
   -- Total spent
   SELECT SUM(amount) FROM expenses;
   ```

---

## Troubleshooting

### ❌ "Connection timeout" or "Cannot connect"

**Solution 1**: Check connection string format
- Make sure you replaced `[YOUR-PASSWORD]` with actual password
- No spaces in the connection string
- Format: `postgresql://postgres:PASSWORD@host:5432/postgres`

**Solution 2**: Check Render environment variable
- Go to Render → Environment
- Verify `DATABASE_URL` is exactly as copied from Supabase
- No extra quotes or spaces
- Click "Save Changes" if you edited it

**Solution 3**: Check Supabase project is running
- Go to Supabase dashboard
- Make sure project shows "Active" status (green)

### ❌ "password authentication failed"

**Problem**: Wrong password in connection string

**Solution**:
1. Go to Supabase → Settings → Database
2. Scroll to "Reset database password"
3. Set a new password (e.g., `NewPassword123`)
4. Update your connection string with new password
5. Update `DATABASE_URL` in Render
6. Redeploy

### ❌ "SSL connection required"

**Solution**: Your code already handles this automatically!
The database.js file includes:
```javascript
ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
```

If you still see this error, add `?sslmode=require` to your connection string:
```
postgresql://postgres:Tokyo@123456789012@db.xxxxx.supabase.co:5432/postgres?sslmode=require
```

### ❌ Build succeeds but app crashes on startup

**Solution**: Check Render logs for detailed error
```bash
# Common issues:
1. DATABASE_URL not set → Add it in Environment
2. Wrong connection string → Copy again from Supabase
3. Supabase project paused → Check Supabase dashboard
```

---

## Monitoring & Maintenance

### Check Database Usage
1. Go to Supabase → Settings → Usage
2. Monitor:
   - **Database size**: 500MB limit on free tier
   - **Bandwidth**: 2GB/month
   - **Active connections**: Check if healthy

### Estimate Your Usage
- Each expense: ~200 bytes
- 500MB = ~2.5 million expenses
- **You're safe for years!** 😊

### Backups
Supabase automatically backs up your database:
- **Daily backups** included
- **Point-in-time recovery** available
- Go to Settings → Backups to manage

---

## Security Best Practices

### 🔒 Database Password
- ✅ Use strong password (letters + numbers + symbols)
- ✅ Don't commit to GitHub (it's in Render environment only)
- ❌ Don't share publicly

### 🔒 Connection String
- ✅ Keep DATABASE_URL secret
- ✅ Only in Render environment variables
- ❌ Never commit to GitHub
- ❌ Never share in public

### 🔒 Supabase Dashboard
- ✅ Use GitHub OAuth for login (more secure)
- ✅ Enable 2FA on Supabase account
- ✅ Don't share project credentials

---

## Cost Monitoring

### Free Tier Limits (Supabase)
- **Database size**: 500MB
- **Bandwidth**: 2GB/month  
- **API requests**: Unlimited
- **Projects**: 2 free projects

### What If You Hit Limits?
- **Database full**: Upgrade to Pro ($25/mo) or clean old data
- **Bandwidth exceeded**: Upgrade or wait for next month
- **For this app**: You likely won't hit limits for years!

---

## Testing Locally with Supabase

If you want to test locally with your Supabase database:

```bash
# Create .env file
cp .env.example .env

# Edit .env
DATABASE_URL=postgresql://postgres:Tokyo@123456789012@db.xxxxx.supabase.co:5432/postgres
PORT=3001
NODE_ENV=development

# Install dependencies
npm install

# Start server
npm start
```

Your local app will connect to Supabase cloud database!

---

## Quick Reference

### Supabase Dashboard URLs
- **Main Dashboard**: https://app.supabase.com
- **Your Project**: https://app.supabase.com/project/your-project-id
- **Table Editor**: https://app.supabase.com/project/your-project-id/editor
- **SQL Editor**: https://app.supabase.com/project/your-project-id/sql

### Key Information
- **Database Name**: `postgres`
- **User**: `postgres`
- **Port**: `5432`
- **SSL**: Required (enabled by default)

### Connection String Format
```
postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres
```

---

## Next Steps After Setup

1. ✅ Test adding expenses
2. ✅ Test all features (dashboard, CSV export, etc.)
3. ✅ Share app with your friend (User 2)
4. ✅ Monitor usage in Supabase dashboard
5. ✅ Set up Slack/email notifications (optional)

---

## Success Checklist

- [ ] Supabase project created
- [ ] Database password saved securely
- [ ] Connection string copied
- [ ] DATABASE_URL added to Render
- [ ] Code pushed to GitHub
- [ ] Render build succeeded
- [ ] App is accessible
- [ ] Can login successfully
- [ ] Can add expenses
- [ ] Expenses show in dashboard
- [ ] Redeployed and data persists ✅

---

## 🎉 You're Done!

Your budget tracker now has:
- ✅ Permanent data storage with Supabase
- ✅ Free forever (up to 500MB)
- ✅ Production-ready PostgreSQL
- ✅ Automatic backups
- ✅ Easy database management

**Enjoy your fully functional budget tracker!** 🚀

---

## Support

- **Supabase Docs**: https://supabase.com/docs
- **Supabase Discord**: https://discord.supabase.com
- **Your Guides**: See other .md files in project

