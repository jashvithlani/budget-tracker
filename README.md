# Budget Tracker Web Application

A comprehensive budget tracking application with PostgreSQL database, featuring multi-user support, monthly/yearly budget allocation, segment-wise expense tracking, and CSV export functionality.

## Features

- ✅ **Multi-user support** with secure login
- ✅ **Persistent data storage** with PostgreSQL
- ✅ Allocate monthly budgets
- ✅ Segment-wise budget allocation per month
- ✅ Budget defaults carry over from previous month
- ✅ Segment-wise expense tracking
- ✅ Add expenses for future months
- ✅ Interactive dashboard with monthly and yearly views
- ✅ Export to CSV (monthly and yearly reports)
- ✅ Custom segments (add, rename, delete)
- ✅ Toast notifications and confirmation modals

## Quick Start

### Prerequisites
- Node.js 18.x or higher
- PostgreSQL 12 or higher

### Installation

1. **Clone and install dependencies**:
```bash
npm install
cd client && npm install && cd ..
```

2. **Set up PostgreSQL** (see [LOCAL_POSTGRES_SETUP.md](LOCAL_POSTGRES_SETUP.md) for details):
```bash
# Create database
psql postgres
CREATE DATABASE budget_tracker;
\q
```

3. **Configure environment**:
```bash
cp .env.example .env
# Edit .env with your DATABASE_URL
```

4. **Start the application**:
```bash
npm start
```

For detailed setup instructions, see:
- **Local Development**: [LOCAL_POSTGRES_SETUP.md](LOCAL_POSTGRES_SETUP.md)
- **Deploy to Render**: [POSTGRESQL_SETUP.md](POSTGRESQL_SETUP.md)

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
- **Database**: PostgreSQL
- **Frontend**: React
- **Authentication**: Token-based with multi-user support
- **Styling**: Modern CSS with responsive design

## Database Schema

- **segments**: Budget categories per user (Food, Transportation, etc.)
- **monthly_budgets**: Total monthly budget allocation per user
- **segment_budgets**: Budget allocation per segment per month per user
- **expenses**: Individual expense entries per user

All tables include `user_id` for multi-user data isolation.

## API Endpoints

All endpoints (except login) require authentication via Bearer token.

### Authentication
- `POST /api/login` - User login
- `POST /api/verify-token` - Verify authentication token
- `POST /api/logout` - User logout

### Segments
- `GET /api/segments` - Get all segments (user-specific)
- `POST /api/segments` - Create new segment
- `PUT /api/segments/:id` - Rename segment
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

## Default Users

Two users are pre-configured (see `credentials.js`):
- **User 1**: jashvithlani / Tokyo@1234
- **User 2**: dskantaria / Dhaval@1234

Edit `credentials.js` to add/modify users.

## Documentation

- 📖 [PostgreSQL Setup for Render](POSTGRESQL_SETUP.md)
- 💻 [Local PostgreSQL Development](LOCAL_POSTGRES_SETUP.md)
- 🚀 [Quick Start Guide](QUICKSTART.md)
- 📦 [Installation Guide](INSTALLATION.md)

## Why PostgreSQL?

✅ **Persistent Data**: Data survives deployments (unlike SQLite on Render)  
✅ **Production Ready**: Better performance and reliability  
✅ **Free Options**: Render offers 90-day free trial, or use free services like Supabase  
Supabase password : Tokyo@123456789012

## Deployment

This app is optimized for deployment on Render.com:
1. Push code to GitHub
2. Create PostgreSQL database on Render
3. Create Web Service on Render
4. Set `DATABASE_URL` environment variable
5. Deploy!

See [POSTGRESQL_SETUP.md](POSTGRESQL_SETUP.md) for detailed instructions.

## License

MIT
