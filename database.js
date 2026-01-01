const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'budget_tracker.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database tables
// Segments table (budget categories) - NOW PER USER
db.exec(`CREATE TABLE IF NOT EXISTS segments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, name)
)`);

// Monthly budgets table - PER USER
db.exec(`CREATE TABLE IF NOT EXISTS monthly_budgets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  total_budget DECIMAL(10, 2) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, year, month)
)`);

// Segment budgets table - PER USER
db.exec(`CREATE TABLE IF NOT EXISTS segment_budgets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  segment_id INTEGER NOT NULL,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  allocated_amount DECIMAL(10, 2) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (segment_id) REFERENCES segments(id) ON DELETE CASCADE,
  UNIQUE(user_id, segment_id, year, month)
)`);

// Expenses table - PER USER
db.exec(`CREATE TABLE IF NOT EXISTS expenses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  segment_id INTEGER NOT NULL,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT,
  expense_date DATE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (segment_id) REFERENCES segments(id) ON DELETE CASCADE
)`);

// Insert default segments for user_id 1 and 2 if they don't exist
const defaultSegments = ['Food', 'Transportation', 'Housing', 'Utilities', 'Entertainment', 'Healthcare', 'Shopping', 'Others'];
const stmt = db.prepare('INSERT OR IGNORE INTO segments (user_id, name) VALUES (?, ?)');

// Add default segments for user 1 and 2
[1, 2].forEach(userId => {
  defaultSegments.forEach(segment => stmt.run(userId, segment));
});

console.log('Database initialized successfully with multi-user support');

module.exports = db;

