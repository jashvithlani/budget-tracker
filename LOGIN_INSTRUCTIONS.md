# 🔐 Login System Added!

## How to Change Your Password

### Step 1: Open credentials.js file
Location: `/Users/jashvithlani/Desktop/Budget tracker/credentials.js`

### Step 2: Edit the credentials
```javascript
module.exports = {
  username: 'admin',      // ← Change this
  password: 'budget123',  // ← Change this
  sessionSecret: 'mybudget-secret-key-change-this-12345'
};
```

### Step 3: Save and restart
- Save the file
- Restart the server: `npm start`
- Login with new credentials

---

## Default Credentials

**Username**: `admin`  
**Password**: `budget123`

⚠️ **Change these immediately** for security!

---

## Security Notes

- ✅ Login required to access the app
- ✅ Token stored in browser localStorage
- ✅ Auto-logout when token expires
- ✅ Logout button in header
- ⚠️ For personal use only (simple authentication)

---

## Features Added

1. **Login Page** - Beautiful gradient design
2. **Session Management** - Token-based authentication
3. **Logout Button** - Top right corner
4. **Auto-redirect** - Not logged in? → Login page
5. **Easy Password Change** - Edit credentials.js

---

## How It Works

1. User enters username/password
2. Backend checks against credentials.js
3. If correct: Generate token, save to localStorage
4. All API requests include token validation
5. Logout: Clear token, redirect to login

---

## To Deploy on Render

The credentials.js file will be pushed to GitHub and deployed.

**To change password on deployed app:**
1. Edit credentials.js locally
2. Push to GitHub
3. Render auto-deploys with new credentials
4. Users must login with new password

---

## Testing Locally

1. **Start backend**: `npm start` (in project root)
2. **Start frontend**: `npm start` (in client folder)
3. **Visit**: http://localhost:3000
4. **Login with**: admin / budget123

---

**Status**: ✅ Login system complete and ready!

