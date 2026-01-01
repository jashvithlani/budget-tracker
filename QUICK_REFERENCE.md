# PostgreSQL Quick Reference

## Quick Deploy Commands

```bash
# Navigate to project
cd "/Users/jashvithlani/Desktop/Budget tracker"

# Stage all changes
git add .

# Commit
git commit -m "Migrate to PostgreSQL for persistent storage"

# Push (triggers Render deployment)
git push origin master
```

## Environment Variable

Add this in Render Dashboard → Your Web Service → Environment:

```
Key: DATABASE_URL
Value: postgres://username:password@hostname:5432/database
```

## PostgreSQL Providers

### Render (90 days free)
```
1. Dashboard → New + → PostgreSQL
2. Copy "External Database URL"
3. Add to web service as DATABASE_URL
```

### Supabase (Free forever)
```
1. supabase.com → New Project
2. Settings → Database → Connection String (URI)
3. Add to Render as DATABASE_URL
```

### ElephantSQL (Free forever)
```
1. elephantsql.com → Create New Instance → Tiny Turtle (free)
2. Copy URL from Details page
3. Add to Render as DATABASE_URL
```

## Local Development

```bash
# Install PostgreSQL
brew install postgresql@14
brew services start postgresql@14

# Create database
psql postgres
CREATE DATABASE budget_tracker;
\q

# Create .env file
cp .env.example .env

# Edit .env
DATABASE_URL=postgres://localhost:5432/budget_tracker

# Install dependencies
npm install

# Start server
npm start
```

## Check if It's Working

Look for these in Render logs:
```
✅ PostgreSQL database initialized successfully
🚀 Server is running on port 3001
🗄️  PostgreSQL database connected
```

## Test Persistence

1. Add expense → Note the amount
2. Redeploy app (or wait for sleep/wake)
3. Check expense is still there ✅

## Common Issues

### Build Error
```bash
rm package-lock.json
git add . && git commit -m "Fresh install" && git push
```

### Connection Error
- Verify DATABASE_URL is set in Environment tab
- Check DATABASE_URL format is correct
- Ensure PostgreSQL database is running

### Authentication Error
- Copy connection string again from database provider
- Update DATABASE_URL
- Redeploy

## Useful psql Commands

```bash
# Connect to database
psql $DATABASE_URL

# Or locally
psql budget_tracker

# View tables
\dt

# View data
SELECT * FROM segments;
SELECT * FROM expenses;

# Count rows
SELECT COUNT(*) FROM expenses;

# Exit
\q
```

## Cost Summary

| Service | Cost |
|---------|------|
| Render PostgreSQL | Free 90d → $7/mo |
| Supabase | Free forever (500MB) |
| ElephantSQL | Free forever (20MB) |
| Render Web Service | Free forever |

## Files to Read

1. **START_HERE.md** ← Start here!
2. **POSTGRESQL_SETUP.md** - Full deployment guide
3. **LOCAL_POSTGRES_SETUP.md** - Local development
4. **DEPLOYMENT_CHECKLIST.md** - Step-by-step checklist

## Emergency Rollback

```bash
git log
git revert <commit-hash>
git push origin master
```

(But remember: SQLite won't persist on Render anyway!)

## Success Checklist

- ✅ PostgreSQL database created
- ✅ DATABASE_URL added to Render
- ✅ Code pushed to GitHub
- ✅ Build succeeded
- ✅ Logs show PostgreSQL connected
- ✅ Can login to app
- ✅ Can add/view data
- ✅ Data persists after redeploy

## That's It!

Your app now has persistent storage. Data will never be lost on deployments again! 🎉

