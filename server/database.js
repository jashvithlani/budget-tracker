const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'budget.db'));

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables
const createTables = () => {
  // Segments table
  db.exec(`
    CREATE TABLE IF NOT EXISTS segments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Budgets table (monthly budget allocations)
  db.exec(`
    CREATE TABLE IF NOT EXISTS budgets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      segment_id INTEGER NOT NULL,
      month INTEGER NOT NULL,
      year INTEGER NOT NULL,
      amount REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (segment_id) REFERENCES segments(id) ON DELETE CASCADE,
      UNIQUE(segment_id, month, year)
    )
  `);

  // Expenses table
  db.exec(`
    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      segment_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      description TEXT,
      expense_date DATE NOT NULL,
      month INTEGER NOT NULL,
      year INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (segment_id) REFERENCES segments(id) ON DELETE CASCADE
    )
  `);

  // Insert default segments if they don't exist
  const insertSegment = db.prepare('INSERT OR IGNORE INTO segments (name) VALUES (?)');
  const defaultSegments = ['Food', 'Transportation', 'Entertainment', 'Utilities', 'Healthcare', 'Other'];
  defaultSegments.forEach(segment => insertSegment.run(segment));
};

createTables();

module.exports = db;

