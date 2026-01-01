# Budget Tracker Web Application

A comprehensive budget tracking application with local database storage, featuring monthly/yearly budget allocation, segment-wise expense tracking, and CSV export functionality.

## Features

- ✅ Allocate monthly budgets
- ✅ Segment-wise budget allocation per month
- ✅ Budget defaults carry over from previous month
- ✅ Segment-wise expense tracking
- ✅ Add expenses for future months
- ✅ Interactive dashboard with monthly and yearly views
- ✅ Export to CSV (monthly and yearly reports)
- ✅ Local SQLite database (no external dependencies)

## Installation

1. Install backend dependencies:
```bash
npm install
```

2. Install frontend dependencies:
```bash
cd client
npm install
cd ..
```

Or use the convenience script:
```bash
npm run install-all
```

## Running the Application

### Development Mode

1. Start the backend server:
```bash
npm start
```

2. In a new terminal, start the React frontend:
```bash
npm run client
```

The backend will run on `http://localhost:3001` and the frontend on `http://localhost:3000`.

### Production Mode

1. Build the React app:
```bash
npm run build
```

2. Start the server:
```bash
npm start
```

The application will be available at `http://localhost:3001`.

## Technology Stack

- **Backend**: Node.js + Express
- **Database**: SQLite (local)
- **Frontend**: React
- **Styling**: Modern CSS with responsive design

## Database Schema

- **segments**: Budget categories (Food, Transportation, etc.)
- **monthly_budgets**: Total monthly budget allocation
- **segment_budgets**: Budget allocation per segment per month
- **expenses**: Individual expense entries

## API Endpoints

### Segments
- `GET /api/segments` - Get all segments
- `POST /api/segments` - Create new segment
- `DELETE /api/segments/:id` - Delete segment

### Budgets
- `GET /api/budgets/:year/:month` - Get monthly budget
- `POST /api/budgets` - Set monthly budget
- `GET /api/segment-budgets/:year/:month` - Get segment budgets
- `POST /api/segment-budgets` - Set segment budget
- `POST /api/segment-budgets/copy-previous` - Copy previous month's budgets

### Expenses
- `GET /api/expenses/:year/:month` - Get monthly expenses
- `GET /api/expenses/year/:year` - Get yearly expenses
- `POST /api/expenses` - Add expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

### Dashboard
- `GET /api/dashboard/month/:year/:month` - Monthly dashboard data
- `GET /api/dashboard/year/:year` - Yearly dashboard data

### Export
- `GET /api/export/month/:year/:month` - Export monthly CSV report
- `GET /api/export/year/:year` - Export yearly CSV report

## License

MIT
