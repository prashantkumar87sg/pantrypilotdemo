const { neon } = require('@neondatabase/serverless');
const { Pool } = require('pg');

// Neon serverless connection (for edge functions and serverless environments)
const sql = neon(process.env.DATABASE_URL);

// Traditional PostgreSQL pool (for persistent connections)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test database connection
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ PostgreSQL connected successfully');
    client.release();
    return true;
  } catch (error) {
    console.error('❌ PostgreSQL connection failed:', error.message);
    return false;
  }
};

// Initialize database tables
const initDatabase = async () => {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS items (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        urgency VARCHAR(10) CHECK (urgency IN ('critical', 'medium', 'low')) DEFAULT 'medium',
        notes TEXT,
        quantity VARCHAR(50),
        estimated_time_to_run_out VARCHAR(100),
        category VARCHAR(50),
        photo_url TEXT,
        audio_url TEXT,
        transcription TEXT,
        status VARCHAR(10) CHECK (status IN ('active', 'restocked', 'deleted')) DEFAULT 'active',
        date_added TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        date_restocked TIMESTAMP,
        date_last_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        user_id INTEGER,
        ai_extracted BOOLEAN DEFAULT FALSE,
        ai_confidence DECIMAL(3,2) CHECK (ai_confidence >= 0 AND ai_confidence <= 1),
        tags TEXT[],
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        email VARCHAR(255) UNIQUE,
        push_token TEXT,
        preferences JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create indexes for better performance
    await sql`CREATE INDEX IF NOT EXISTS idx_items_status_date ON items(status, date_added DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_items_urgency_status ON items(urgency, status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_items_user_status ON items(user_id, status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_items_search ON items USING gin(to_tsvector('english', name || ' ' || COALESCE(notes, '')))`;

    // Create trigger to automatically update updated_at timestamp
    await sql`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        NEW.date_last_modified = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql'
    `;

    await sql`
      DROP TRIGGER IF EXISTS update_items_updated_at ON items
    `;

    await sql`
      CREATE TRIGGER update_items_updated_at
        BEFORE UPDATE ON items
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column()
    `;

    console.log('✅ Database tables initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    throw error;
  }
};

// Graceful shutdown
const closeDatabase = async () => {
  try {
    await pool.end();
    console.log('📴 Database connections closed');
  } catch (error) {
    console.error('Error closing database:', error.message);
  }
};

module.exports = {
  sql,           // Neon serverless SQL
  pool,          // Traditional PostgreSQL pool
  testConnection,
  initDatabase,
  closeDatabase,
}; 