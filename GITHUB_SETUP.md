# Quick GitHub Setup

## 📦 Upload to GitHub (Free)

Yes! You can **store** your code on GitHub for free and **deploy** it using free hosting platforms.

### Step 1: Create GitHub Repository

1. Go to [github.com](https://github.com)
2. Click "+" → "New repository"
3. Name it: `budget-tracker`
4. Keep it **Public** (for free hosting)
5. Don't initialize with README
6. Click "Create repository"

### Step 2: Push Your Code

Open terminal and run:

```bash
cd "/Users/jashvithlani/Desktop/Budget tracker"

# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Budget Tracker with Rupees"

# Rename branch to main
git branch -M main

# Add your GitHub repo (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/budget-tracker.git

# Push to GitHub
git push -u origin main
```

### Step 3: Your Code is on GitHub! ✅

But... **it's not live yet**. GitHub only stores your code.

---

## 🌐 Make It Live (Free Hosting)

GitHub Pages **won't work** for this app because it has a backend server.

### Use Render.com Instead (FREE):

1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Click "New +" → "Web Service"
4. Select your `budget-tracker` repo
5. Click "Connect"
6. Render auto-detects Node.js
7. Set:
   - **Build Command**: `npm install && cd client && npm install && npm run build && cd ..`
   - **Start Command**: `npm start`
8. Click "Create Web Service"

**Wait 5-10 minutes** → Your app is LIVE! 🎉

You'll get a URL like: `https://budget-tracker-xyz.onrender.com`

---

## 💡 Summary

- ✅ **GitHub**: FREE code storage (always)
- ✅ **Render**: FREE hosting for your app
- ✅ **Total Cost**: $0.00
- ⚠️ **Note**: Render free tier sleeps when inactive, wakes up on first request (~30s)

---

## 🎯 Quick Links

- **GitHub**: https://github.com
- **Render**: https://render.com (recommended)
- **Railway**: https://railway.app (alternative)
- **Full Guide**: See DEPLOYMENT.md

---

Need help with any step? Let me know! 🚀

