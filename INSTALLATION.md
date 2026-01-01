# Budget Tracker - Setup Guide

## Quick Start

This guide will help you set up and run the Budget Tracker application.

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation Steps

#### 1. Backend Setup

The backend dependencies should already be installed. If not, run:

```bash
npm install
```

This will install:
- express: Web server framework
- sqlite3: Local database
- cors: Cross-origin resource sharing
- csv-writer: CSV export functionality
- body-parser: Request body parsing

#### 2. Frontend Setup

Navigate to the client directory and install dependencies:

```bash
cd client
npm install
cd ..
```

This will install:
- React and React DOM
- axios: HTTP client
- react-scripts: Build tools

### Running the Application

#### Option 1: Development Mode (Recommended for development)

1. **Start the backend server** (in one terminal):
```bash
npm start
```
This will start the backend server on `http://localhost:3001`

2. **Start the frontend** (in another terminal):
```bash
cd client
npm start
```
This will start the React development server on `http://localhost:3000`

The frontend will automatically proxy API requests to the backend.

#### Option 2: Production Mode

1. **Build the frontend**:
```bash
cd client
npm run build
cd ..
```

2. **Start the server**:
```bash
npm start
```

The application will be available at `http://localhost:3001`

### First Time Setup

When you first run the application:

1. The SQLite database (`budget_tracker.db`) will be automatically created
2. Default budget segments will be added:
   - Food
   - Transportation
   - Housing
   - Utilities
   - Entertainment
   - Healthcare
   - Shopping
   - Others

### Using the Application

#### 1. Set Monthly Budget
- Go to "Budget Allocation" tab
- Enter your total monthly budget
- Allocate amounts to each segment
- Click "Save All Budgets"

#### 2. Copy Previous Month's Budget
- In the "Budget Allocation" tab
- Click "Copy Previous Month" to use last month's allocation as a starting point
- Modify as needed and save

#### 3. Add Expenses
- Go to "Expenses" tab
- Click "Add Expense"
- Select segment, enter amount, date, and description
- You can add expenses for future months by selecting a future date

#### 4. View Dashboard
- Go to "Dashboard" tab
- Toggle between Monthly and Yearly views
- See real-time budget vs. actual spending
- Visual progress bars for each segment

#### 5. Export Data
- Click "Export Month" to download current month's data as CSV
- Click "Export Year" to download entire year's data as CSV

### Troubleshooting

#### Port Already in Use
If port 3001 is already in use, you can change it by setting the PORT environment variable:
```bash
PORT=3002 npm start
```

#### Database Issues
If you encounter database issues:
1. Stop the server
2. Delete the `budget_tracker.db` file
3. Restart the server (database will be recreated)

#### Frontend Can't Connect to Backend
Make sure:
1. Backend is running on port 3001
2. The proxy setting in `client/package.json` is correct
3. No firewall is blocking the connection

### Features

✅ **Monthly Budget Allocation**
- Set overall monthly budget
- Allocate by segments
- Copy from previous month

✅ **Expense Tracking**
- Add, edit, delete expenses
- Categorize by segment
- Add expenses for future months
- Add descriptions for context

✅ **Dashboard**
- Monthly and yearly views
- Real-time budget tracking
- Visual progress indicators
- Segment-wise breakdown

✅ **Data Export**
- Export monthly reports to CSV
- Export yearly reports to CSV
- Detailed transaction history

### Database Schema

The application uses SQLite with the following tables:

- **segments**: Budget categories
- **monthly_budgets**: Total budget per month
- **segment_budgets**: Budget allocation per segment per month
- **expenses**: Individual expense records

### API Endpoints

All API endpoints are available at `http://localhost:3001/api`

See README.md for complete API documentation.

### Support

For issues or questions, please refer to the README.md file or check the application logs in the terminal.

