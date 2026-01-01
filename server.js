const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./database');
const fs = require('fs');
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
app.get('/api/segments', authenticateToken, (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM segments WHERE user_id = ? ORDER BY name').all(req.userId);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a new segment for current user
app.post('/api/segments', authenticateToken, (req, res) => {
  try {
    const { name } = req.body;
    const result = db.prepare('INSERT INTO segments (user_id, name) VALUES (?, ?)').run(req.userId, name);
    res.json({ id: result.lastInsertRowid, user_id: req.userId, name });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update/Rename a segment (only if owned by user)
app.put('/api/segments/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const result = db.prepare('UPDATE segments SET name = ? WHERE id = ? AND user_id = ?').run(name, id, req.userId);
    res.json({ message: 'Segment updated', changes: result.changes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a segment (only if owned by user)
app.delete('/api/segments/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const result = db.prepare('DELETE FROM segments WHERE id = ? AND user_id = ?').run(id, req.userId);
    res.json({ message: 'Segment deleted', changes: result.changes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== MONTHLY BUDGETS API ====================

// Get monthly budget for current user
app.get('/api/budgets/:year/:month', authenticateToken, (req, res) => {
  try {
    const { year, month } = req.params;
    const row = db.prepare('SELECT * FROM monthly_budgets WHERE user_id = ? AND year = ? AND month = ?').get(req.userId, year, month);
    res.json(row || null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Set monthly budget for current user
app.post('/api/budgets', authenticateToken, (req, res) => {
  try {
    const { year, month, total_budget } = req.body;
    db.prepare(`INSERT INTO monthly_budgets (user_id, year, month, total_budget) 
                VALUES (?, ?, ?, ?) 
                ON CONFLICT(user_id, year, month) 
                DO UPDATE SET total_budget = excluded.total_budget`)
      .run(req.userId, year, month, total_budget);
    res.json({ user_id: req.userId, year, month, total_budget });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== SEGMENT BUDGETS API ====================

// Get segment budgets for a specific month for current user
app.get('/api/segment-budgets/:year/:month', authenticateToken, (req, res) => {
  try {
    const { year, month } = req.params;
    const rows = db.prepare(`SELECT sb.*, s.name as segment_name 
                            FROM segment_budgets sb 
                            JOIN segments s ON sb.segment_id = s.id 
                            WHERE sb.user_id = ? AND sb.year = ? AND sb.month = ?
                            ORDER BY s.name`)
      .all(req.userId, year, month);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Set segment budget for current user
app.post('/api/segment-budgets', authenticateToken, (req, res) => {
  try {
    const { segment_id, year, month, allocated_amount } = req.body;
    db.prepare(`INSERT INTO segment_budgets (user_id, segment_id, year, month, allocated_amount) 
                VALUES (?, ?, ?, ?, ?) 
                ON CONFLICT(user_id, segment_id, year, month) 
                DO UPDATE SET allocated_amount = excluded.allocated_amount`)
      .run(req.userId, segment_id, year, month, allocated_amount);
    res.json({ user_id: req.userId, segment_id, year, month, allocated_amount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Copy previous month's segment budgets for current user
app.post('/api/segment-budgets/copy-previous', authenticateToken, (req, res) => {
  try {
    const { year, month, prev_year, prev_month } = req.body;
    const result = db.prepare(`INSERT INTO segment_budgets (user_id, segment_id, year, month, allocated_amount)
                              SELECT user_id, segment_id, ?, ?, allocated_amount
                              FROM segment_budgets
                              WHERE user_id = ? AND year = ? AND month = ?
                              ON CONFLICT(user_id, segment_id, year, month) DO NOTHING`)
      .run(year, month, req.userId, prev_year, prev_month);
    res.json({ message: 'Previous month budgets copied', changes: result.changes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== EXPENSES API ====================

// Get expenses for a specific month for current user
app.get('/api/expenses/:year/:month', authenticateToken, (req, res) => {
  try {
    const { year, month } = req.params;
    const rows = db.prepare(`SELECT e.*, s.name as segment_name 
                            FROM expenses e 
                            JOIN segments s ON e.segment_id = s.id 
                            WHERE e.user_id = ? AND e.year = ? AND e.month = ?
                            ORDER BY e.expense_date DESC`)
      .all(req.userId, year, month);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all expenses for a year for current user
app.get('/api/expenses/year/:year', authenticateToken, (req, res) => {
  try {
    const { year } = req.params;
    const rows = db.prepare(`SELECT e.*, s.name as segment_name 
                            FROM expenses e 
                            JOIN segments s ON e.segment_id = s.id 
                            WHERE e.user_id = ? AND e.year = ?
                            ORDER BY e.expense_date DESC`)
      .all(req.userId, year);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a new expense for current user
app.post('/api/expenses', authenticateToken, (req, res) => {
  try {
    const { segment_id, year, month, amount, description, expense_date } = req.body;
    const result = db.prepare(`INSERT INTO expenses (user_id, segment_id, year, month, amount, description, expense_date) 
                              VALUES (?, ?, ?, ?, ?, ?, ?)`)
      .run(req.userId, segment_id, year, month, amount, description, expense_date);
    res.json({ id: result.lastInsertRowid, user_id: req.userId, segment_id, year, month, amount, description, expense_date });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update an expense (only if owned by user)
app.put('/api/expenses/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const { segment_id, year, month, amount, description, expense_date } = req.body;
    const result = db.prepare(`UPDATE expenses 
                              SET segment_id = ?, year = ?, month = ?, amount = ?, description = ?, expense_date = ?
                              WHERE id = ? AND user_id = ?`)
      .run(segment_id, year, month, amount, description, expense_date, id, req.userId);
    res.json({ message: 'Expense updated', changes: result.changes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete an expense (only if owned by user)
app.delete('/api/expenses/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const result = db.prepare('DELETE FROM expenses WHERE id = ? AND user_id = ?').run(id, req.userId);
    res.json({ message: 'Expense deleted', changes: result.changes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== DASHBOARD API ====================

// Get dashboard data for a specific month for current user
app.get('/api/dashboard/month/:year/:month', authenticateToken, (req, res) => {
  try {
    const { year, month } = req.params;
    
    const rows = db.prepare(`SELECT 
                              s.id,
                              s.name,
                              COALESCE(sb.allocated_amount, 0) as budget,
                              COALESCE(SUM(e.amount), 0) as spent,
                              COALESCE(sb.allocated_amount, 0) - COALESCE(SUM(e.amount), 0) as remaining
                            FROM segments s
                            LEFT JOIN segment_budgets sb ON s.id = sb.segment_id AND sb.year = ? AND sb.month = ? AND sb.user_id = ?
                            LEFT JOIN expenses e ON s.id = e.segment_id AND e.year = ? AND e.month = ? AND e.user_id = ?
                            WHERE s.user_id = ?
                            GROUP BY s.id, s.name, sb.allocated_amount
                            ORDER BY s.name`)
      .all(year, month, req.userId, year, month, req.userId, req.userId);
    
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
app.get('/api/dashboard/year/:year', authenticateToken, (req, res) => {
  try {
    const { year } = req.params;
    
    const rows = db.prepare(`SELECT 
                              s.id,
                              s.name,
                              COALESCE(budget_sum.total_budget, 0) as budget,
                              COALESCE(expense_sum.total_spent, 0) as spent,
                              COALESCE(budget_sum.total_budget, 0) - COALESCE(expense_sum.total_spent, 0) as remaining
                            FROM segments s
                            LEFT JOIN (
                              SELECT segment_id, SUM(allocated_amount) as total_budget
                              FROM segment_budgets
                              WHERE year = ? AND user_id = ?
                              GROUP BY segment_id
                            ) budget_sum ON s.id = budget_sum.segment_id
                            LEFT JOIN (
                              SELECT segment_id, SUM(amount) as total_spent
                              FROM expenses
                              WHERE year = ? AND user_id = ?
                              GROUP BY segment_id
                            ) expense_sum ON s.id = expense_sum.segment_id
                            WHERE s.user_id = ?
                            ORDER BY s.name`)
      .all(year, req.userId, year, req.userId, req.userId);
    
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
app.get('/api/export/month/:year/:month', authenticateToken, (req, res) => {
  try {
    const { year, month } = req.params;
    const filename = `budget_report_${year}_${month.padStart(2, '0')}.csv`;
    
    const rows = db.prepare(`SELECT 
                              s.name as segment,
                              COALESCE(sb.allocated_amount, 0) as budget,
                              e.amount,
                              e.description,
                              e.expense_date
                            FROM segments s
                            LEFT JOIN segment_budgets sb ON s.id = sb.segment_id AND sb.year = ? AND sb.month = ? AND sb.user_id = ?
                            LEFT JOIN expenses e ON s.id = e.segment_id AND e.year = ? AND e.month = ? AND e.user_id = ?
                            WHERE s.user_id = ?
                            ORDER BY s.name, e.expense_date`)
      .all(year, month, req.userId, year, month, req.userId, req.userId);
    
    const headers = [
      { id: 'segment', title: 'Segment' },
      { id: 'budget', title: 'Budget' },
      { id: 'amount', title: 'Expense Amount' },
      { id: 'description', title: 'Description' },
      { id: 'expense_date', title: 'Date' }
    ];
    
    const csv = arrayToCSV(rows, headers);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Export yearly report for current user
app.get('/api/export/year/:year', authenticateToken, (req, res) => {
  try {
    const { year } = req.params;
    const filename = `budget_report_${year}.csv`;
    
    const rows = db.prepare(`SELECT 
                              s.name as segment,
                              e.month,
                              e.amount,
                              e.description,
                              e.expense_date,
                              COALESCE(sb.allocated_amount, 0) as budget
                            FROM expenses e
                            JOIN segments s ON e.segment_id = s.id
                            LEFT JOIN segment_budgets sb ON s.id = sb.segment_id AND sb.year = e.year AND sb.month = e.month AND sb.user_id = e.user_id
                            WHERE e.year = ? AND e.user_id = ?
                            ORDER BY e.month, s.name, e.expense_date`)
      .all(year, req.userId);
    
    const headers = [
      { id: 'segment', title: 'Segment' },
      { id: 'month', title: 'Month' },
      { id: 'budget', title: 'Budget' },
      { id: 'amount', title: 'Expense Amount' },
      { id: 'description', title: 'Description' },
      { id: 'expense_date', title: 'Date' }
    ];
    
    const csv = arrayToCSV(rows, headers);
    
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

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
  console.log(`Multi-user support enabled - ${credentials.users.length} users configured`);
});
