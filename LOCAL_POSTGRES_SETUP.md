# Local Development with PostgreSQL

This guide helps you set up PostgreSQL locally for development.

## Prerequisites

You need PostgreSQL installed on your machine.

### Install PostgreSQL

#### macOS (using Homebrew):
```bash
# Install PostgreSQL
brew install postgresql@14

# Start PostgreSQL service
brew services start postgresql@14
```

#### Ubuntu/Debian:
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

#### Windows:
Download and install from: https://www.postgresql.org/download/windows/

---

## Setup Local Database

### 1. Create Database

```bash
# Access PostgreSQL (macOS/Linux)
psql postgres

# Or for Ubuntu/Linux, you may need:
sudo -u postgres psql

# Create database and user
CREATE DATABASE budget_tracker;
CREATE USER budgetuser WITH PASSWORD 'yourpassword';
GRANT ALL PRIVILEGES ON DATABASE budget_tracker TO budgetuser;

# Exit psql
\q
```

### 2. Create .env File

```bash
cd "/Users/jashvithlani/Desktop/Budget tracker"

# Copy the example file
cp .env.example .env
```

### 3. Edit .env File

Open `.env` and update with your local credentials:

```env
DATABASE_URL=postgres://budgetuser:yourpassword@localhost:5432/budget_tracker
PORT=3001
NODE_ENV=development
```

---

## Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

---

## Run the Application

### Option 1: Run Both (Recommended for Development)

```bash
# Terminal 1: Start backend (with auto-reload)
npm run dev

# Terminal 2: Start frontend
npm run client
```

- Backend runs on: http://localhost:3001
- Frontend runs on: http://localhost:3000

### Option 2: Run Backend Only

```bash
npm start
```

---

## Verify Setup

### Check Database Connection

When you start the server, you should see:
```
✅ PostgreSQL database initialized successfully with multi-user support
🚀 Server is running on port 3001
📊 API available at http://localhost:3001/api
👥 Multi-user support enabled - 2 users configured
🗄️  PostgreSQL database connected
```

### Test the API

```bash
# Health check (should fail with 401 - that's correct, auth is working)
curl http://localhost:3001/api/segments

# Login
curl -X POST http://localhost:3001/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"jashvithlani","password":"Tokyo@1234"}'
```

---

## Common Issues

### ❌ "Connection refused" or "ECONNREFUSED"

**Problem**: PostgreSQL is not running

**Solution**:
```bash
# macOS
brew services start postgresql@14

# Ubuntu/Linux
sudo systemctl start postgresql

# Check if running
brew services list  # macOS
sudo systemctl status postgresql  # Linux
```

### ❌ "password authentication failed"

**Problem**: Wrong credentials in .env

**Solution**:
1. Check your .env file
2. Make sure DATABASE_URL matches what you set in psql
3. Or reset the password:
```bash
psql postgres
ALTER USER budgetuser WITH PASSWORD 'newpassword';
\q
```

### ❌ "database does not exist"

**Problem**: Database wasn't created

**Solution**:
```bash
psql postgres
CREATE DATABASE budget_tracker;
\q
```

### ❌ "relation does not exist" or "table not found"

**Problem**: Tables weren't created

**Solution**: Just restart your server - it will create tables automatically:
```bash
npm start
```

---

## Useful PostgreSQL Commands

```bash
# Connect to your database
psql budget_tracker

# List all tables
\dt

# View segments table
SELECT * FROM segments;

# View all expenses
SELECT * FROM expenses;

# Count expenses
SELECT COUNT(*) FROM expenses;

# Exit psql
\q
```

---

## Development Workflow

1. **Make code changes** in your editor
2. **Backend auto-reloads** (if using `npm run dev`)
3. **Frontend auto-reloads** (React hot reload)
4. **Test in browser** at http://localhost:3000

---

## Switching Between SQLite and PostgreSQL

Your app now uses PostgreSQL. If you want to test SQLite locally:

1. Keep the old `better-sqlite3` code in a branch
2. Use PostgreSQL for production (Render)
3. Use PostgreSQL locally (recommended for consistency)

---

## Database Management Tools (Optional)

For a GUI to view/edit your database:

- **pgAdmin** (Free, cross-platform): https://www.pgadmin.org/
- **TablePlus** (macOS, paid with free tier): https://tableplus.com/
- **DBeaver** (Free, cross-platform): https://dbeaver.io/

Connection details:
- **Host**: localhost
- **Port**: 5432
- **Database**: budget_tracker
- **Username**: budgetuser
- **Password**: (what you set)

---

## Ready to Deploy?

Once local development works, follow **POSTGRESQL_SETUP.md** to deploy to Render with PostgreSQL.

