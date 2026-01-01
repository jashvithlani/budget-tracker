const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { pool, query, initializeDatabase } = require('./database');
const credentials = require('./credentials');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from React app in production
app.use(express.static(path.join(__dirname, 'client/build')));

// ==================== HELPER FUNCTIONS ====================

// Find user by username and password
function findUser(username, password) {
  return credentials.users.find(u => u.username === username && u.password === password);
}

// Extract user ID from token
function getUserIdFromToken(token) {
  try {
    const decoded = Buffer.from(token, 'base64').toString();
    const [userId] = decoded.split(':');
    return parseInt(userId);
  } catch (error) {
    return null;
  }
}

// Middleware to verify token and extract user_id
function authenticateToken(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '') || req.body.token || req.query.token;
  
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  const userId = getUserIdFromToken(token);
  if (!userId) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  
  req.userId = userId;
  next();
}

// ==================== AUTHENTICATION API ====================

// Login endpoint
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  const user = findUser(username, password);
  
  if (user) {
    // Generate token with user ID
    const token = Buffer.from(`${user.id}:${Date.now()}`).toString('base64');
    res.json({ 
      success: true, 
      token,
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName
      },
      message: 'Login successful' 
    });
  } else {
    res.status(401).json({ 
      success: false, 
      message: 'Invalid username or password' 
    });
  }
});

// Verify token endpoint
app.post('/api/verify-token', (req, res) => {
  const { token } = req.body;
  
  if (token && token.length > 0) {
    try {
      const userId = getUserIdFromToken(token);
      const user = credentials.users.find(u => u.id === userId);
      
      if (user) {
        res.json({ 
          valid: true,
          user: {
            id: user.id,
            username: user.username,
            displayName: user.displayName
          }
        });
      } else {
        res.json({ valid: false });
      }
    } catch (error) {
      res.json({ valid: false });
    }
  } else {
    res.json({ valid: false });
  }
});

// Logout endpoint
app.post('/api/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

// ==================== SEGMENTS API ====================

// Get all segments for current user
app.get('/api/segments', authenticateToken, async (req, res) => {
  try {
    const result = await query('SELECT * FROM segments WHERE user_id = $1 ORDER BY name', [req.userId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a new segment for current user
app.post('/api/segments', authenticateToken, async (req, res) => {
  try {
    const { name } = req.body;
    const result = await query(
      'INSERT INTO segments (user_id, name) VALUES ($1, $2) RETURNING *',
      [req.userId, name]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update/Rename a segment (only if owned by user)
app.put('/api/segments/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const result = await query(
      'UPDATE segments SET name = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
      [name, id, req.userId]
    );
    res.json({ message: 'Segment updated', changes: result.rowCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a segment (only if owned by user)
app.delete('/api/segments/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      'DELETE FROM segments WHERE id = $1 AND user_id = $2',
      [id, req.userId]
    );
    res.json({ message: 'Segment deleted', changes: result.rowCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== MONTHLY BUDGETS API ====================

// Get monthly budget for current user
app.get('/api/budgets/:year/:month', authenticateToken, async (req, res) => {
  try {
    const { year, month } = req.params;
    const result = await query(
      'SELECT * FROM monthly_budgets WHERE user_id = $1 AND year = $2 AND month = $3',
      [req.userId, year, month]
    );
    res.json(result.rows[0] || null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Set monthly budget for current user
app.post('/api/budgets', authenticateToken, async (req, res) => {
  try {
    const { year, month, total_budget } = req.body;
    const result = await query(
      `INSERT INTO monthly_budgets (user_id, year, month, total_budget) 
       VALUES ($1, $2, $3, $4) 
       ON CONFLICT (user_id, year, month) 
       DO UPDATE SET total_budget = EXCLUDED.total_budget
       RETURNING *`,
      [req.userId, year, month, total_budget]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== SEGMENT BUDGETS API ====================

// Get segment budgets for a specific month for current user
app.get('/api/segment-budgets/:year/:month', authenticateToken, async (req, res) => {
  try {
    const { year, month } = req.params;
    const result = await query(
      `SELECT sb.*, s.name as segment_name 
       FROM segment_budgets sb 
       JOIN segments s ON sb.segment_id = s.id 
       WHERE sb.user_id = $1 AND sb.year = $2 AND sb.month = $3
       ORDER BY s.name`,
      [req.userId, year, month]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Set segment budget for current user
app.post('/api/segment-budgets', authenticateToken, async (req, res) => {
  try {
    const { segment_id, year, month, allocated_amount } = req.body;
    const result = await query(
      `INSERT INTO segment_budgets (user_id, segment_id, year, month, allocated_amount) 
       VALUES ($1, $2, $3, $4, $5) 
       ON CONFLICT (user_id, segment_id, year, month) 
       DO UPDATE SET allocated_amount = EXCLUDED.allocated_amount
       RETURNING *`,
      [req.userId, segment_id, year, month, allocated_amount]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Copy previous month's segment budgets for current user
app.post('/api/segment-budgets/copy-previous', authenticateToken, async (req, res) => {
  try {
    const { year, month, prev_year, prev_month } = req.body;
    const result = await query(
      `INSERT INTO segment_budgets (user_id, segment_id, year, month, allocated_amount)
       SELECT user_id, segment_id, $1, $2, allocated_amount
       FROM segment_budgets
       WHERE user_id = $3 AND year = $4 AND month = $5
       ON CONFLICT (user_id, segment_id, year, month) DO NOTHING`,
      [year, month, req.userId, prev_year, prev_month]
    );
    res.json({ message: 'Previous month budgets copied', changes: result.rowCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== EXPENSES API ====================

// Get expenses for a specific month for current user
app.get('/api/expenses/:year/:month', authenticateToken, async (req, res) => {
  try {
    const { year, month } = req.params;
    const result = await query(
      `SELECT e.*, s.name as segment_name 
       FROM expenses e 
       JOIN segments s ON e.segment_id = s.id 
       WHERE e.user_id = $1 AND e.year = $2 AND e.month = $3
       ORDER BY e.expense_date DESC`,
      [req.userId, year, month]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all expenses for a year for current user
app.get('/api/expenses/year/:year', authenticateToken, async (req, res) => {
  try {
    const { year } = req.params;
    const result = await query(
      `SELECT e.*, s.name as segment_name 
       FROM expenses e 
       JOIN segments s ON e.segment_id = s.id 
       WHERE e.user_id = $1 AND e.year = $2
       ORDER BY e.expense_date DESC`,
      [req.userId, year]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a new expense for current user
app.post('/api/expenses', authenticateToken, async (req, res) => {
  try {
    const { segment_id, year, month, amount, description, expense_date } = req.body;
    const result = await query(
      `INSERT INTO expenses (user_id, segment_id, year, month, amount, description, expense_date) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [req.userId, segment_id, year, month, amount, description, expense_date]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update an expense (only if owned by user)
app.put('/api/expenses/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { segment_id, year, month, amount, description, expense_date } = req.body;
    const result = await query(
      `UPDATE expenses 
       SET segment_id = $1, year = $2, month = $3, amount = $4, description = $5, expense_date = $6
       WHERE id = $7 AND user_id = $8
       RETURNING *`,
      [segment_id, year, month, amount, description, expense_date, id, req.userId]
    );
    res.json({ message: 'Expense updated', changes: result.rowCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete an expense (only if owned by user)
app.delete('/api/expenses/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      'DELETE FROM expenses WHERE id = $1 AND user_id = $2',
      [id, req.userId]
    );
    res.json({ message: 'Expense deleted', changes: result.rowCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== DASHBOARD API ====================

// Get dashboard data for a specific month for current user
app.get('/api/dashboard/month/:year/:month', authenticateToken, async (req, res) => {
  try {
    const { year, month } = req.params;
    
    const result = await query(
      `SELECT 
        s.id,
        s.name,
        COALESCE(sb.allocated_amount, 0) as budget,
        COALESCE(SUM(e.amount), 0) as spent,
        COALESCE(sb.allocated_amount, 0) - COALESCE(SUM(e.amount), 0) as remaining
      FROM segments s
      LEFT JOIN segment_budgets sb ON s.id = sb.segment_id AND sb.year = $1 AND sb.month = $2 AND sb.user_id = $3
      LEFT JOIN expenses e ON s.id = e.segment_id AND e.year = $1 AND e.month = $2 AND e.user_id = $3
      WHERE s.user_id = $3
      GROUP BY s.id, s.name, sb.allocated_amount
      ORDER BY s.name`,
      [year, month, req.userId]
    );
    
    const rows = result.rows;
    const totalBudget = rows.reduce((sum, row) => sum + parseFloat(row.budget || 0), 0);
    const totalSpent = rows.reduce((sum, row) => sum + parseFloat(row.spent || 0), 0);
    const totalRemaining = totalBudget - totalSpent;
    
    res.json({
      segments: rows,
      totals: {
        budget: totalBudget,
        spent: totalSpent,
        remaining: totalRemaining
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get dashboard data for a specific year for current user
app.get('/api/dashboard/year/:year', authenticateToken, async (req, res) => {
  try {
    const { year } = req.params;
    
    const result = await query(
      `SELECT 
        s.id,
        s.name,
        COALESCE(budget_sum.total_budget, 0) as budget,
        COALESCE(expense_sum.total_spent, 0) as spent,
        COALESCE(budget_sum.total_budget, 0) - COALESCE(expense_sum.total_spent, 0) as remaining
      FROM segments s
      LEFT JOIN (
        SELECT segment_id, SUM(allocated_amount) as total_budget
        FROM segment_budgets
        WHERE year = $1 AND user_id = $2
        GROUP BY segment_id
      ) budget_sum ON s.id = budget_sum.segment_id
      LEFT JOIN (
        SELECT segment_id, SUM(amount) as total_spent
        FROM expenses
        WHERE year = $1 AND user_id = $2
        GROUP BY segment_id
      ) expense_sum ON s.id = expense_sum.segment_id
      WHERE s.user_id = $2
      ORDER BY s.name`,
      [year, req.userId]
    );
    
    const rows = result.rows;
    const totalBudget = rows.reduce((sum, row) => sum + parseFloat(row.budget || 0), 0);
    const totalSpent = rows.reduce((sum, row) => sum + parseFloat(row.spent || 0), 0);
    const totalRemaining = totalBudget - totalSpent;
    
    res.json({
      segments: rows,
      totals: {
        budget: totalBudget,
        spent: totalSpent,
        remaining: totalRemaining
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== CSV EXPORT API ====================

function arrayToCSV(data, headers) {
  if (!data || data.length === 0) return '';
  
  const csvHeaders = headers.map(h => h.title).join(',');
  const csvRows = data.map(row => {
    return headers.map(h => {
      const value = row[h.id];
      if (value === null || value === undefined) return '';
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('"')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    }).join(',');
  });
  
  return [csvHeaders, ...csvRows].join('\n');
}

// Export monthly report for current user
app.get('/api/export/month/:year/:month', authenticateToken, async (req, res) => {
  try {
    const { year, month } = req.params;
    const filename = `budget_report_${year}_${month.padStart(2, '0')}.csv`;
    
    const result = await query(
      `SELECT 
        s.name as segment,
        COALESCE(sb.allocated_amount, 0) as budget,
        e.amount,
        e.description,
        e.expense_date
      FROM segments s
      LEFT JOIN segment_budgets sb ON s.id = sb.segment_id AND sb.year = $1 AND sb.month = $2 AND sb.user_id = $3
      LEFT JOIN expenses e ON s.id = e.segment_id AND e.year = $1 AND e.month = $2 AND e.user_id = $3
      WHERE s.user_id = $3
      ORDER BY s.name, e.expense_date`,
      [year, month, req.userId]
    );
    
    const headers = [
      { id: 'segment', title: 'Segment' },
      { id: 'budget', title: 'Budget' },
      { id: 'amount', title: 'Expense Amount' },
      { id: 'description', title: 'Description' },
      { id: 'expense_date', title: 'Date' }
    ];
    
    const csv = arrayToCSV(result.rows, headers);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Export yearly report for current user
app.get('/api/export/year/:year', authenticateToken, async (req, res) => {
  try {
    const { year } = req.params;
    const filename = `budget_report_${year}.csv`;
    
    const result = await query(
      `SELECT 
        s.name as segment,
        e.month,
        e.amount,
        e.description,
        e.expense_date,
        COALESCE(sb.allocated_amount, 0) as budget
      FROM expenses e
      JOIN segments s ON e.segment_id = s.id
      LEFT JOIN segment_budgets sb ON s.id = sb.segment_id AND sb.year = e.year AND sb.month = e.month AND sb.user_id = e.user_id
      WHERE e.year = $1 AND e.user_id = $2
      ORDER BY e.month, s.name, e.expense_date`,
      [year, req.userId]
    );
    
    const headers = [
      { id: 'segment', title: 'Segment' },
      { id: 'month', title: 'Month' },
      { id: 'budget', title: 'Budget' },
      { id: 'amount', title: 'Expense Amount' },
      { id: 'description', title: 'Description' },
      { id: 'expense_date', title: 'Date' }
    ];
    
    const csv = arrayToCSV(result.rows, headers);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Catch-all handler for React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build/index.html'));
});

// Initialize database and start server
const startServer = async () => {
  try {
    await initializeDatabase();
    
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📊 API available at http://localhost:${PORT}/api`);
      console.log(`👥 Multi-user support enabled - ${credentials.users.length} users configured`);
      console.log(`🗄️  PostgreSQL database connected`);
    });

    // Keep-alive ping for Render free tier (ping every 14 minutes)
    if (process.env.NODE_ENV === 'production') {
      const RENDER_URL = process.env.RENDER_EXTERNAL_URL;
      if (RENDER_URL) {
        setInterval(async () => {
          try {
            const fetch = (await import('node-fetch')).default;
            await fetch(`${RENDER_URL}/api/segments`, {
              headers: { 'Authorization': 'Bearer keepalive' }
            });
            console.log('⏰ Keep-alive ping sent');
          } catch (error) {
            console.log('⚠️  Keep-alive ping failed (this is normal)');
          }
        }, 14 * 60 * 1000); // 14 minutes
      }
    }
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
