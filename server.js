const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./database');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from React app in production
app.use(express.static(path.join(__dirname, 'client/build')));

// ==================== SEGMENTS API ====================

// Get all segments
app.get('/api/segments', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM segments ORDER BY name').all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a new segment
app.post('/api/segments', (req, res) => {
  try {
    const { name } = req.body;
    const result = db.prepare('INSERT INTO segments (name) VALUES (?)').run(name);
    res.json({ id: result.lastInsertRowid, name });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update/Rename a segment
app.put('/api/segments/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const result = db.prepare('UPDATE segments SET name = ? WHERE id = ?').run(name, id);
    res.json({ message: 'Segment updated', changes: result.changes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a segment
app.delete('/api/segments/:id', (req, res) => {
  try {
    const { id } = req.params;
    const result = db.prepare('DELETE FROM segments WHERE id = ?').run(id);
    res.json({ message: 'Segment deleted', changes: result.changes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== MONTHLY BUDGETS API ====================

// Get monthly budget
app.get('/api/budgets/:year/:month', (req, res) => {
  try {
    const { year, month } = req.params;
    const row = db.prepare('SELECT * FROM monthly_budgets WHERE year = ? AND month = ?').get(year, month);
    res.json(row || null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Set monthly budget
app.post('/api/budgets', (req, res) => {
  try {
    const { year, month, total_budget } = req.body;
    db.prepare(`INSERT INTO monthly_budgets (year, month, total_budget) 
                VALUES (?, ?, ?) 
                ON CONFLICT(year, month) 
                DO UPDATE SET total_budget = excluded.total_budget`)
      .run(year, month, total_budget);
    res.json({ year, month, total_budget });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== SEGMENT BUDGETS API ====================

// Get segment budgets for a specific month
app.get('/api/segment-budgets/:year/:month', (req, res) => {
  try {
    const { year, month } = req.params;
    const rows = db.prepare(`SELECT sb.*, s.name as segment_name 
                            FROM segment_budgets sb 
                            JOIN segments s ON sb.segment_id = s.id 
                            WHERE sb.year = ? AND sb.month = ?
                            ORDER BY s.name`)
      .all(year, month);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Set segment budget for a month
app.post('/api/segment-budgets', (req, res) => {
  try {
    const { segment_id, year, month, allocated_amount } = req.body;
    db.prepare(`INSERT INTO segment_budgets (segment_id, year, month, allocated_amount) 
                VALUES (?, ?, ?, ?) 
                ON CONFLICT(segment_id, year, month) 
                DO UPDATE SET allocated_amount = excluded.allocated_amount`)
      .run(segment_id, year, month, allocated_amount);
    res.json({ segment_id, year, month, allocated_amount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Copy previous month's segment budgets to current month
app.post('/api/segment-budgets/copy-previous', (req, res) => {
  try {
    const { year, month, prev_year, prev_month } = req.body;
    const result = db.prepare(`INSERT INTO segment_budgets (segment_id, year, month, allocated_amount)
                              SELECT segment_id, ?, ?, allocated_amount
                              FROM segment_budgets
                              WHERE year = ? AND month = ?
                              ON CONFLICT(segment_id, year, month) DO NOTHING`)
      .run(year, month, prev_year, prev_month);
    res.json({ message: 'Previous month budgets copied', changes: result.changes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== EXPENSES API ====================

// Get expenses for a specific month
app.get('/api/expenses/:year/:month', (req, res) => {
  try {
    const { year, month } = req.params;
    const rows = db.prepare(`SELECT e.*, s.name as segment_name 
                            FROM expenses e 
                            JOIN segments s ON e.segment_id = s.id 
                            WHERE e.year = ? AND e.month = ?
                            ORDER BY e.expense_date DESC`)
      .all(year, month);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all expenses (for yearly view)
app.get('/api/expenses/year/:year', (req, res) => {
  try {
    const { year } = req.params;
    const rows = db.prepare(`SELECT e.*, s.name as segment_name 
                            FROM expenses e 
                            JOIN segments s ON e.segment_id = s.id 
                            WHERE e.year = ?
                            ORDER BY e.expense_date DESC`)
      .all(year);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a new expense
app.post('/api/expenses', (req, res) => {
  try {
    const { segment_id, year, month, amount, description, expense_date } = req.body;
    const result = db.prepare(`INSERT INTO expenses (segment_id, year, month, amount, description, expense_date) 
                              VALUES (?, ?, ?, ?, ?, ?)`)
      .run(segment_id, year, month, amount, description, expense_date);
    res.json({ id: result.lastInsertRowid, segment_id, year, month, amount, description, expense_date });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update an expense
app.put('/api/expenses/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { segment_id, year, month, amount, description, expense_date } = req.body;
    const result = db.prepare(`UPDATE expenses 
                              SET segment_id = ?, year = ?, month = ?, amount = ?, description = ?, expense_date = ?
                              WHERE id = ?`)
      .run(segment_id, year, month, amount, description, expense_date, id);
    res.json({ message: 'Expense updated', changes: result.changes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete an expense
app.delete('/api/expenses/:id', (req, res) => {
  try {
    const { id } = req.params;
    const result = db.prepare('DELETE FROM expenses WHERE id = ?').run(id);
    res.json({ message: 'Expense deleted', changes: result.changes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== DASHBOARD API ====================

// Get dashboard data for a specific month
app.get('/api/dashboard/month/:year/:month', (req, res) => {
  try {
    const { year, month } = req.params;
    
    // Get segment-wise data
    const rows = db.prepare(`SELECT 
                              s.id,
                              s.name,
                              COALESCE(sb.allocated_amount, 0) as budget,
                              COALESCE(SUM(e.amount), 0) as spent,
                              COALESCE(sb.allocated_amount, 0) - COALESCE(SUM(e.amount), 0) as remaining
                            FROM segments s
                            LEFT JOIN segment_budgets sb ON s.id = sb.segment_id AND sb.year = ? AND sb.month = ?
                            LEFT JOIN expenses e ON s.id = e.segment_id AND e.year = ? AND e.month = ?
                            GROUP BY s.id, s.name, sb.allocated_amount
                            ORDER BY s.name`)
      .all(year, month, year, month);
    
    // Calculate totals
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

// Get dashboard data for a specific year
app.get('/api/dashboard/year/:year', (req, res) => {
  try {
    const { year } = req.params;
    
    const rows = db.prepare(`SELECT 
                              s.id,
                              s.name,
                              COALESCE(SUM(sb.allocated_amount), 0) as budget,
                              COALESCE(SUM(e.amount), 0) as spent,
                              COALESCE(SUM(sb.allocated_amount), 0) - COALESCE(SUM(e.amount), 0) as remaining
                            FROM segments s
                            LEFT JOIN segment_budgets sb ON s.id = sb.segment_id AND sb.year = ?
                            LEFT JOIN expenses e ON s.id = e.segment_id AND e.year = ?
                            GROUP BY s.id, s.name
                            ORDER BY s.name`)
      .all(year, year);
    
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

// Get monthly breakdown for a year
app.get('/api/dashboard/year/:year/monthly', (req, res) => {
  try {
    const { year } = req.params;
    
    const rows = db.prepare(`SELECT 
                              e.month,
                              COALESCE(SUM(sb.allocated_amount), 0) as budget,
                              COALESCE(SUM(e.amount), 0) as spent
                            FROM (SELECT DISTINCT month FROM expenses WHERE year = ?) months
                            LEFT JOIN segment_budgets sb ON sb.year = ? AND sb.month = months.month
                            LEFT JOIN expenses e ON e.year = ? AND e.month = months.month
                            GROUP BY e.month
                            ORDER BY e.month`)
      .all(year, year, year);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== CSV EXPORT API ====================

// Helper function to convert array of objects to CSV
function arrayToCSV(data, headers) {
  if (!data || data.length === 0) return '';
  
  const csvHeaders = headers.map(h => h.title).join(',');
  const csvRows = data.map(row => {
    return headers.map(h => {
      const value = row[h.id];
      if (value === null || value === undefined) return '';
      // Escape values containing commas or quotes
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('"')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    }).join(',');
  });
  
  return [csvHeaders, ...csvRows].join('\n');
}

// Export monthly report to CSV
app.get('/api/export/month/:year/:month', (req, res) => {
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
                            LEFT JOIN segment_budgets sb ON s.id = sb.segment_id AND sb.year = ? AND sb.month = ?
                            LEFT JOIN expenses e ON s.id = e.segment_id AND e.year = ? AND e.month = ?
                            ORDER BY s.name, e.expense_date`)
      .all(year, month, year, month);
    
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

// Export yearly report to CSV
app.get('/api/export/year/:year', (req, res) => {
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
                            LEFT JOIN segment_budgets sb ON s.id = sb.segment_id AND sb.year = e.year AND sb.month = e.month
                            WHERE e.year = ?
                            ORDER BY e.month, s.name, e.expense_date`)
      .all(year);
    
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
});
