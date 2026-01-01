# Deployment Guide - Budget Tracker

## 🚀 Free Hosting Options

Your Budget Tracker can be hosted for **FREE** using these platforms.

---

## Option 1: Render.com (Recommended - Easiest) ⭐

**Why Render?**
- ✅ Completely FREE tier
- ✅ Automatic deployments from GitHub
- ✅ Supports Node.js + SQLite
- ✅ Built-in static site hosting
- ✅ No credit card required

### Step-by-Step Deployment:

#### 1. Prepare Your Code

First, add this to your `package.json`:

```json
"engines": {
  "node": "18.x"
},
"scripts": {
  "start": "node server.js",
  "build": "cd client && npm install && npm run build"
}
```

#### 2. Push to GitHub

```bash
cd "/Users/jashvithlani/Desktop/Budget tracker"
git init
git add .
git commit -m "Initial commit - Budget Tracker"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

#### 3. Deploy on Render

1. Go to [render.com](https://render.com)
2. Sign up/Login with GitHub
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Name**: budget-tracker
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free
6. Click "Create Web Service"

#### 4. Wait for Deployment
- First deploy takes 5-10 minutes
- You'll get a URL like: `https://budget-tracker.onrender.com`

#### 5. Done! 🎉
Your app is live and accessible worldwide!

### Important Notes:
- Free tier sleeps after 15 minutes of inactivity
- First request after sleep takes ~30 seconds to wake up
- Database persists across restarts
- Auto-redeploys on git push

---

## Option 2: Railway.app (Also Great) 🚂

**Why Railway?**
- ✅ $5 free credit monthly (enough for personal use)
- ✅ Very fast deployments
- ✅ Easy to use
- ✅ Excellent for SQLite

### Step-by-Step:

1. **Push to GitHub** (same as above)

2. **Deploy on Railway:**
   - Go to [railway.app](https://railway.app)
   - Login with GitHub
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Railway auto-detects Node.js

3. **Configure:**
   - Add environment variable: `PORT=3001`
   - Railway automatically builds and deploys

4. **Get URL:**
   - Click "Settings" → "Generate Domain"
   - Your app is live!

---

## Option 3: Fly.io (More Advanced) ✈️

**Why Fly?**
- ✅ True free tier
- ✅ Fast global deployment
- ✅ Persistent volumes for SQLite

### Requirements:
- Credit card for verification (not charged)
- Install Fly CLI: `brew install flyctl`

### Steps:

1. **Login:**
```bash
flyctl auth login
```

2. **Initialize:**
```bash
cd "/Users/jashvithlani/Desktop/Budget tracker"
flyctl launch
```

3. **Configure** fly.toml (auto-generated)

4. **Deploy:**
```bash
flyctl deploy
```

5. **Get URL:**
```bash
flyctl open
```

---

## Option 4: GitHub Pages + Backend Elsewhere

### Frontend Only (GitHub Pages):

1. **Build frontend:**
```bash
cd client
npm run build
```

2. **Deploy to GitHub Pages:**
```bash
# Install gh-pages
npm install -g gh-pages

# Deploy
cd client
gh-pages -d build
```

3. **Host backend separately** on Render/Railway

4. **Update API URL** in frontend to point to backend

**Downside:** More complex, requires CORS setup

---

## 📊 Comparison Table

| Platform | Cost | Setup | Speed | Best For |
|----------|------|-------|-------|----------|
| **Render** | FREE | ⭐⭐⭐⭐⭐ Easy | Medium | Beginners |
| **Railway** | $5/mo credit | ⭐⭐⭐⭐ Easy | Fast | Personal use |
| **Fly.io** | FREE | ⭐⭐⭐ Medium | Fast | Advanced users |
| **GitHub Pages** | FREE | ⭐⭐⭐⭐ Easy | Fast | Frontend only |

---

## 🔧 Pre-Deployment Checklist

Before deploying, ensure:

- ✅ All dependencies in package.json
- ✅ .gitignore includes node_modules and *.db
- ✅ Environment variables configured
- ✅ Build script works locally
- ✅ Server.js serves static files from client/build

---

## 🌟 Recommended Approach

**For Beginners:** Use **Render.com**
1. Push to GitHub
2. Connect to Render
3. Deploy automatically
4. Share your link!

**Total Time:** 15-20 minutes ⏱️

---

## 🆘 Troubleshooting

### Database Issues:
- SQLite file is created automatically on first run
- Data persists on Render/Railway free tier
- For production, consider PostgreSQL

### Port Issues:
- Don't hardcode port 3001
- Use `process.env.PORT || 3001`
- Hosting platforms assign their own ports

### Build Errors:
- Make sure client/package.json exists
- Run `npm run build` locally first
- Check build logs on platform

---

## 📝 Next Steps

1. Choose a platform (Render recommended)
2. Push code to GitHub
3. Follow deployment steps
4. Share your live app! 🎉

Need help? Check platform documentation:
- [Render Docs](https://render.com/docs)
- [Railway Docs](https://docs.railway.app)
- [Fly Docs](https://fly.io/docs)

