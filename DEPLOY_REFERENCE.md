# 🚀 Quick Deploy Reference

## Render.com Configuration

When deploying, use these EXACT settings:

### Build Command:
```
npm install && cd client && npm install && npm run build && cd ..
```

### Start Command:
```
npm start
```

### Environment Variables:
```
NODE_ENV=production
```

### Instance Type:
```
Free
```

---

## Git Commands (Copy-Paste)

```bash
# Navigate to project
cd "/Users/jashvithlani/Desktop/Budget tracker"

# Initialize git (if not done)
git init

# Add all files
git add .

# Commit
git commit -m "Budget Tracker - Ready for deployment"

# Set branch name
git branch -M main

# Add remote (REPLACE YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/budget-tracker.git

# Push to GitHub
git push -u origin main
```

---

## After Deployment - Update Code

```bash
# Make your changes, then:
git add .
git commit -m "Description of changes"
git push

# Render auto-deploys in ~5 minutes!
```

---

## Your URLs

**GitHub Repo:**
```
https://github.com/YOUR_USERNAME/budget-tracker
```

**Live App (after deployment):**
```
https://budget-tracker-XXXX.onrender.com
```

---

## Troubleshooting Quick Fixes

### Build fails?
Check: package.json exists in root

### App crashes?
Check: Logs tab in Render dashboard

### Database not saving?
Check: Render has persistent disk enabled

### App slow first time?
Normal: Free tier wakes up in 30s

---

## Need GitHub Token?

1. Go to: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Check "repo" scope
4. Generate and copy
5. Use as password when pushing

---

📖 **Full Guide**: See RENDER_DEPLOYMENT.md

