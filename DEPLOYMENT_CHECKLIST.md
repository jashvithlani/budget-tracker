# PostgreSQL Deployment Checklist

Use this checklist to ensure a smooth migration to PostgreSQL.

## ☑️ Pre-Deployment Checklist

- [ ] PostgreSQL code changes complete
- [ ] All files committed to git
- [ ] Decided on PostgreSQL provider (Render/Supabase/ElephantSQL)

## ☑️ Database Setup

### Option A: Render PostgreSQL
- [ ] Created PostgreSQL database on Render dashboard
- [ ] Noted down the External Database URL
- [ ] Database is in the same region as web service (for performance)

### Option B: External Provider (Supabase/ElephantSQL)
- [ ] Created account and database
- [ ] Copied connection string
- [ ] Tested connection string is valid

## ☑️ Environment Configuration

- [ ] Opened web service on Render dashboard
- [ ] Clicked "Environment" tab
- [ ] Added environment variable:
  - Key: `DATABASE_URL`
  - Value: (PostgreSQL connection string)
- [ ] Saved environment variables

## ☑️ Code Deployment

```bash
# From your project directory
cd "/Users/jashvithlani/Desktop/Budget tracker"

# Stage all changes
git add .

# Commit with descriptive message
git commit -m "Migrate to PostgreSQL for persistent storage"

# Push to GitHub (triggers Render deployment)
git push origin master
```

- [ ] Code pushed to GitHub
- [ ] Render detected new commit
- [ ] Build started on Render

## ☑️ Verification

### During Build:
- [ ] Build logs show "Installing dependencies" (with pg package)
- [ ] No build errors
- [ ] Build completes successfully

### After Deployment:
- [ ] Check Render logs for success messages:
  ```
  ✅ PostgreSQL database initialized successfully
  🚀 Server is running on port XXXX
  🗄️  PostgreSQL database connected
  ```
- [ ] Open your app URL
- [ ] Login page loads
- [ ] Can log in successfully
- [ ] Can add test data
- [ ] Dashboard shows correct data

### Persistence Test:
- [ ] Add some test expenses
- [ ] Note down the amounts
- [ ] Trigger a redeploy (push a small change or manual redeploy)
- [ ] After redeploy, check if data is still there ✅

## ☑️ Common Issues & Solutions

### ❌ Build fails: "Cannot find module 'pg'"
**Solution**: Delete package-lock.json and retry
```bash
rm package-lock.json
git add package-lock.json
git commit -m "Remove package-lock for fresh install"
git push origin master
```

### ❌ Runtime error: "Connection timeout"
**Solution**: Check DATABASE_URL is set correctly
- Go to Environment tab
- Verify DATABASE_URL exists and is correct
- Save and redeploy

### ❌ Runtime error: "password authentication failed"
**Solution**: Wrong connection string
- Copy connection string again from database provider
- Update DATABASE_URL
- Redeploy

### ❌ Data is still being cleared
**Solution**: Verify you're using PostgreSQL
- Check logs for "PostgreSQL database connected"
- If you see SQLite errors, something went wrong
- Verify package.json has "pg" not "better-sqlite3"

## ☑️ Post-Deployment

- [ ] Removed any test data
- [ ] Informed other users about the migration
- [ ] Updated credentials if needed
- [ ] Set up database backups (Render does this automatically)

## ☑️ Monitoring

### First 24 Hours:
- [ ] Check logs occasionally for errors
- [ ] Test adding/editing/deleting data
- [ ] Test CSV export
- [ ] Test multi-user functionality

### First Week:
- [ ] Monitor database size in Render dashboard
- [ ] Check for any performance issues
- [ ] Verify keep-alive is working (check logs for ping messages)

## 🎉 Success Criteria

✅ App is accessible at your Render URL  
✅ Users can log in  
✅ Data persists across deployments  
✅ No errors in logs  
✅ Dashboard shows correct calculations  
✅ All features work (segments, budgets, expenses, export)  

## 📞 Need Help?

If something goes wrong:
1. Check Render logs for detailed error messages
2. Review [POSTGRESQL_SETUP.md](POSTGRESQL_SETUP.md) troubleshooting section
3. Verify all environment variables are set
4. Check PostgreSQL database is running (Render dashboard)

## 💾 Backup Strategy

### Render PostgreSQL:
- Automatic daily backups included
- Can restore from dashboard

### External Providers:
- Check their backup policies
- Supabase: Point-in-time recovery available
- ElephantSQL: Backup options in dashboard

## 🔄 Rollback Plan (Emergency)

If migration fails completely:
```bash
# Revert to previous commit (SQLite version)
git log
git revert <migration-commit-hash>
git push origin master
```

But remember: SQLite won't persist data on Render anyway!

## ✅ Final Check

Everything working? Congratulations! 🎉

Your budget tracker now has:
- ✅ Persistent storage
- ✅ Production-ready database
- ✅ Multi-user support
- ✅ Reliable data retention

You can now use your app with confidence!

