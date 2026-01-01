const { Pool } = require('pg');

// Create a connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Initialize database tables
const initializeDatabase = async () => {
  const client = await pool.connect();
  try {
    // Create tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS segments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, name)
      );

      CREATE TABLE IF NOT EXISTS monthly_budgets (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        year INTEGER NOT NULL,
        month INTEGER NOT NULL,
        total_budget DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, year, month)
      );

      CREATE TABLE IF NOT EXISTS segment_budgets (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        segment_id INTEGER NOT NULL,
        year INTEGER NOT NULL,
        month INTEGER NOT NULL,
        allocated_amount DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (segment_id) REFERENCES segments(id) ON DELETE CASCADE,
        UNIQUE(user_id, segment_id, year, month)
      );

      CREATE TABLE IF NOT EXISTS expenses (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        segment_id INTEGER NOT NULL,
        year INTEGER NOT NULL,
        month INTEGER NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        description TEXT,
        expense_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (segment_id) REFERENCES segments(id) ON DELETE CASCADE
      );
    `);

    // Insert default segments for user 1 and 2 if they don't exist
    const defaultSegments = [
      'Food', 'Transportation', 'Housing', 'Utilities', 
      'Entertainment', 'Healthcare', 'Shopping', 'Others'
    ];

    for (const userId of [1, 2]) {
      for (const segment of defaultSegments) {
        await client.query(
          'INSERT INTO segments (user_id, name) VALUES ($1, $2) ON CONFLICT (user_id, name) DO NOTHING',
          [userId, segment]
        );
      }
    }

    console.log('✅ PostgreSQL database initialized successfully with multi-user support');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Export pool for queries
module.exports = {
  pool,
  query: (text, params) => pool.query(text, params),
  initializeDatabase
};
