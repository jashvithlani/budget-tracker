# Setup Instructions

## Important: NPM Registry Configuration

Your system is currently configured to use a private NPM registry. Before installing dependencies, you'll need to either:

### Option 1: Use Public NPM Registry (Recommended for this project)

```bash
# Temporarily use public registry
npm install --registry https://registry.npmjs.org/

# Or set it as default
npm config set registry https://registry.npmjs.org/
```

### Option 2: Use Yarn Instead

```bash
# Install yarn if you don't have it
npm install -g yarn --registry https://registry.npmjs.org/

# Then install dependencies
yarn install
cd client && yarn install && cd ..

# Run the application
yarn server  # Terminal 1
yarn client  # Terminal 2
```

## Installation Steps

1. **Install Backend Dependencies:**
```bash
cd /Users/jashvithlani/Desktop/Budget\ tracker
npm install --registry https://registry.npmjs.org/
```

2. **Install Frontend Dependencies:**
```bash
cd client
npm install --registry https://registry.npmjs.org/
cd ..
```

3. **Run the Application:**

**Option A - Both servers together:**
```bash
npm run dev
```

**Option B - Separate terminals:**
```bash
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend  
npm run client
```

## Manual Installation (If npm fails)

If you continue to have issues, you can manually install packages:

### Backend packages:
```bash
npm install express cors better-sqlite3 body-parser date-fns concurrently nodemon --registry https://registry.npmjs.org/
```

### Frontend packages:
```bash
cd client
npm install react react-dom react-scripts axios recharts date-fns --registry https://registry.npmjs.org/
```

## Testing the Application

Once installed and running:

1. Backend will be at: http://localhost:5000
2. Frontend will be at: http://localhost:3000
3. The frontend will automatically proxy API requests to the backend

## Troubleshooting

### If port 5000 is already in use:
Edit `server/index.js` and change the PORT variable to another port (e.g., 5001)

### If port 3000 is already in use:
Create a file `client/.env` with:
```
PORT=3001
```

### Database issues:
If you encounter database errors, delete `server/budget.db` and restart the server.

## First Time Setup

After installation, when you first run the application:

1. The SQLite database will be created automatically
2. Default segments will be added (Food, Transportation, etc.)
3. You can start by:
   - Allocating budgets in the "Budget Allocation" tab
   - Adding expenses in the "Expenses" tab
   - Viewing your financial overview in the "Dashboard" tab

