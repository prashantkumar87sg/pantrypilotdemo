const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Database connection
const sql = neon(process.env.DATABASE_URL);

// Simple health check first
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Basic middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:3000', 'https://pantrypilotdemo.vercel.app'],
  credentials: true,
}));
app.use(morgan('combined'));
app.use(express.json());

// Simple test route
app.get('/api/items', async (req, res) => {
  try {
    console.log('--- Received request to GET /api/items ---');
    const items = await sql`SELECT * FROM items WHERE status = 'active' ORDER BY date_added DESC LIMIT 10`;
    console.log('--- Successfully fetched items from database ---');
    res.json({ activeItems: items, restockedItems: [] });
  } catch (error) {
    console.error('--- ERROR in GET /api/items: ---', error);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'PantryPilot API Server', status: 'running' });
});

// Start server immediately
console.log('Starting server...');
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Health check: /api/health`);
});

console.log('Server setup complete'); 