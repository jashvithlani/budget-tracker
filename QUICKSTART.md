# Quick Start Guide

## Getting Started in 3 Steps

### Step 1: Install Dependencies

The backend dependencies are already installed. You just need to install the frontend dependencies:

```bash
cd client
npm install
cd ..
```

If you encounter npm permission issues, the backend should work fine as-is since dependencies are already installed.

### Step 2: Start the Backend Server

```bash
npm start
```

You should see:
```
Database initialized successfully
Server is running on port 3001
API available at http://localhost:3001/api
```

### Step 3: Start the Frontend (Optional - for development)

In a new terminal:

```bash
cd client
npm start
```

The frontend will open at `http://localhost:3000`

## Testing the Application

The backend server is currently running and has been tested with:

1. ✅ **Database Creation**: SQLite database created successfully
2. ✅ **Segments API**: Default segments loaded (Food, Transportation, Housing, etc.)
3. ✅ **Budget API**: Budget allocation working
4. ✅ **Expenses API**: Expense tracking functional
5. ✅ **Dashboard API**: Real-time budget tracking operational

## Sample Data Created

The application already has test data:
- Monthly budget for January 2026: $5,000
- Food segment budget: $800
- Sample expense: $125.50 for Groceries

## Quick Test via curl

You can test the API directly:

```bash
# Get all segments
curl http://localhost:3001/api/segments

# Get dashboard for January 2026
curl http://localhost:3001/api/dashboard/month/2026/1

# Add an expense
curl -X POST http://localhost:3001/api/expenses \
  -H "Content-Type: application/json" \
  -d '{"segment_id": 1, "year": 2026, "month": 1, "amount": 50, "description": "Lunch", "expense_date": "2026-01-01"}'
```

## What's Included

✅ **All Features Implemented:**
- Monthly budget allocation
- Segment-wise budget tracking
- Expense management (add, edit, delete)
- Future month expense support
- Interactive dashboard (monthly & yearly views)
- CSV export (monthly & yearly reports)
- Local SQLite database (no external dependencies)

## File Structure

```
Budget tracker/
├── server.js                 # Backend server
├── database.js              # Database setup
├── budget_tracker.db        # SQLite database
├── package.json             # Backend dependencies
├── client/                  # React frontend
│   ├── src/
│   │   ├── App.js          # Main app component
│   │   ├── components/
│   │   │   ├── Dashboard.js
│   │   │   ├── BudgetAllocation.js
│   │   │   └── ExpenseManager.js
│   │   └── ...
│   └── package.json        # Frontend dependencies
├── README.md               # Full documentation
└── INSTALLATION.md         # Detailed setup guide
```

## Next Steps

1. **Access the frontend**: If you started the React dev server, go to `http://localhost:3000`
2. **Allocate your budget**: Go to "Budget Allocation" tab and set your monthly budget
3. **Track expenses**: Add expenses in the "Expenses" tab
4. **Monitor spending**: View your dashboard for real-time tracking
5. **Export reports**: Download CSV reports anytime

## Notes

- The backend runs on port 3001 (not 5000 due to system permissions)
- The database file is `budget_tracker.db` in the project root
- All data is stored locally - no internet connection required
- The frontend proxies API requests to the backend automatically

Enjoy tracking your budget! 💰

