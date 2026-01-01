const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./database');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

// ============= SEGMENTS API =============

// Get all segments
app.get('/api/segments', (req, res) => {
  try {
    const segments = db.prepare('SELECT * FROM segments ORDER BY name').all();
    res.json(segments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add new segment
app.post('/api/segments', (req, res) => {
  try {
    const { name } = req.body;
    const stmt = db.prepare('INSERT INTO segments (name) VALUES (?)');
    const result = stmt.run(name);
    res.json({ id: result.lastInsertRowid, name });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete segment
app.delete('/api/segments/:id', (req, res) => {
  try {
    const stmt = db.prepare('DELETE FROM segments WHERE id = ?');
    stmt.run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============= BUDGETS API =============

// Get budgets for a specific month/year
app.get('/api/budgets/:year/:month', (req, res) => {
  try {
    const { year, month } = req.params;
    const budgets = db.prepare(`
      SELECT b.*, s.name as segment_name
      FROM budgets b
      JOIN segments s ON b.segment_id = s.id
      WHERE b.year = ? AND b.month = ?
    `).all(year, month);
    res.json(budgets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get budget defaults from previous month
app.get('/api/budgets/defaults/:year/:month', (req, res) => {
  try {
    let { year, month } = req.params;
    year = parseInt(year);
    month = parseInt(month);
    
    // Calculate previous month
    let prevMonth = month - 1;
    let prevYear = year;
    if (prevMonth === 0) {
      prevMonth = 12;
      prevYear = year - 1;
    }
    
    const budgets = db.prepare(`
      SELECT b.segment_id, b.amount, s.name as segment_name
      FROM budgets b
      JOIN segments s ON b.segment_id = s.id
      WHERE b.year = ? AND b.month = ?
    `).all(prevYear, prevMonth);
    
    res.json(budgets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Set budget for segment in a month
app.post('/api/budgets', (req, res) => {
  try {
    const { segment_id, year, month, amount } = req.body;
    const stmt = db.prepare(`
      INSERT INTO budgets (segment_id, year, month, amount)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(segment_id, year, month)
      DO UPDATE SET amount = excluded.amount
    `);
    const result = stmt.run(segment_id, year, month, amount);
    res.json({ success: true, id: result.lastInsertRowid });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Bulk set budgets for a month
app.post('/api/budgets/bulk', (req, res) => {
  try {
    const { budgets } = req.body; // Array of { segment_id, year, month, amount }
    const stmt = db.prepare(`
      INSERT INTO budgets (segment_id, year, month, amount)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(segment_id, year, month)
      DO UPDATE SET amount = excluded.amount
    `);
    
    const transaction = db.transaction((budgets) => {
      for (const budget of budgets) {
        stmt.run(budget.segment_id, budget.year, budget.month, budget.amount);
      }
    });
    
    transaction(budgets);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============= EXPENSES API =============

// Get expenses for a specific month/year
app.get('/api/expenses/:year/:month', (req, res) => {
  try {
    const { year, month } = req.params;
    const expenses = db.prepare(`
      SELECT e.*, s.name as segment_name
      FROM expenses e
      JOIN segments s ON e.segment_id = s.id
      WHERE e.year = ? AND e.month = ?
      ORDER BY e.expense_date DESC
    `).all(year, month);
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all expenses for a year
app.get('/api/expenses/year/:year', (req, res) => {
  try {
    const { year } = req.params;
    const expenses = db.prepare(`
      SELECT e.*, s.name as segment_name
      FROM expenses e
      JOIN segments s ON e.segment_id = s.id
      WHERE e.year = ?
      ORDER BY e.expense_date DESC
    `).all(year);
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add expense
app.post('/api/expenses', (req, res) => {
  try {
    const { segment_id, amount, description, expense_date } = req.body;
    const date = new Date(expense_date);
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    
    const stmt = db.prepare(`
      INSERT INTO expenses (segment_id, amount, description, expense_date, month, year)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(segment_id, amount, description, expense_date, month, year);
    res.json({ success: true, id: result.lastInsertRowid });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update expense
app.put('/api/expenses/:id', (req, res) => {
  try {
    const { segment_id, amount, description, expense_date } = req.body;
    const date = new Date(expense_date);
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    
    const stmt = db.prepare(`
      UPDATE expenses
      SET segment_id = ?, amount = ?, description = ?, expense_date = ?, month = ?, year = ?
      WHERE id = ?
    `);
    stmt.run(segment_id, amount, description, expense_date, month, year, req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete expense
app.delete('/api/expenses/:id', (req, res) => {
  try {
    const stmt = db.prepare('DELETE FROM expenses WHERE id = ?');
    stmt.run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============= DASHBOARD API =============

// Get monthly summary
app.get('/api/dashboard/monthly/:year/:month', (req, res) => {
  try {
    const { year, month } = req.params;
    
    const summary = db.prepare(`
      SELECT 
        s.id as segment_id,
        s.name as segment_name,
        COALESCE(b.amount, 0) as budget,
        COALESCE(SUM(e.amount), 0) as spent,
        COALESCE(b.amount, 0) - COALESCE(SUM(e.amount), 0) as remaining
      FROM segments s
      LEFT JOIN budgets b ON s.id = b.segment_id AND b.year = ? AND b.month = ?
      LEFT JOIN expenses e ON s.id = e.segment_id AND e.year = ? AND e.month = ?
      GROUP BY s.id, s.name, b.amount
      ORDER BY s.name
    `).all(year, month, year, month);
    
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get yearly summary
app.get('/api/dashboard/yearly/:year', (req, res) => {
  try {
    const { year } = req.params;
    
    const summary = db.prepare(`
      SELECT 
        s.id as segment_id,
        s.name as segment_name,
        COALESCE(SUM(b.amount), 0) as total_budget,
        COALESCE(SUM(e.amount), 0) as total_spent,
        COALESCE(SUM(b.amount), 0) - COALESCE(SUM(e.amount), 0) as remaining
      FROM segments s
      LEFT JOIN budgets b ON s.id = b.segment_id AND b.year = ?
      LEFT JOIN expenses e ON s.id = e.segment_id AND e.year = ?
      GROUP BY s.id, s.name
      ORDER BY s.name
    `).all(year, year);
    
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get monthly breakdown for a year
app.get('/api/dashboard/year-breakdown/:year', (req, res) => {
  try {
    const { year } = req.params;
    
    const breakdown = db.prepare(`
      SELECT 
        e.month,
        s.name as segment_name,
        COALESCE(b.amount, 0) as budget,
        COALESCE(SUM(e.amount), 0) as spent
      FROM expenses e
      JOIN segments s ON e.segment_id = s.id
      LEFT JOIN budgets b ON s.id = b.segment_id AND b.year = e.year AND b.month = e.month
      WHERE e.year = ?
      GROUP BY e.month, s.id, s.name, b.amount
      ORDER BY e.month, s.name
    `).all(year);
    
    res.json(breakdown);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============= EXPORT API =============

// Export monthly report
app.get('/api/export/monthly/:year/:month', (req, res) => {
  try {
    const { year, month } = req.params;
    
    const data = db.prepare(`
      SELECT 
        s.name as Segment,
        COALESCE(b.amount, 0) as Budget,
        e.expense_date as Date,
        e.description as Description,
        e.amount as Amount
      FROM segments s
      LEFT JOIN budgets b ON s.id = b.segment_id AND b.year = ? AND b.month = ?
      LEFT JOIN expenses e ON s.id = e.segment_id AND e.year = ? AND e.month = ?
      ORDER BY s.name, e.expense_date
    `).all(year, month, year, month);
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Export yearly report
app.get('/api/export/yearly/:year', (req, res) => {
  try {
    const { year } = req.params;
    
    const data = db.prepare(`
      SELECT 
        e.month as Month,
        s.name as Segment,
        COALESCE(b.amount, 0) as Budget,
        e.expense_date as Date,
        e.description as Description,
        e.amount as Amount
      FROM expenses e
      JOIN segments s ON e.segment_id = s.id
      LEFT JOIN budgets b ON s.id = b.segment_id AND b.year = e.year AND b.month = e.month
      WHERE e.year = ?
      ORDER BY e.month, s.name, e.expense_date
    `).all(year);
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

