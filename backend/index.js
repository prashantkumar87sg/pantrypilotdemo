const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const { testConnection, initDatabase } = require('./config/database');
const itemRoutes = require('./routes/items');
const aiRoutes = require('./routes/ai');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5001;
let dbReady = false; // Database readiness flag

// Health check endpoint (must be defined before any middleware that might block it)
app.get('/api/health', (req, res) => {
  res.status(dbReady ? 200 : 503).json({
    status: dbReady ? 'OK' : 'Service Unavailable',
    databaseReady: dbReady,
    timestamp: new Date().toISOString(),
  });
});

// Initialize Database
async function initializeDatabase() {
  try {
    console.log("Attempting to connect to the database...");
    await testConnection();
    console.log("Database connection successful. Initializing tables...");
    await initDatabase();
    console.log("Database tables initialized. Starting server...");
    dbReady = true; // Set database readiness to true after successful initialization
  } catch (error) {
    console.error('FATAL: Database initialization failed. Server not started.', error);
    process.exit(1); // Exit the process if DB initialization fails
  }
}


// Middleware
app.use(helmet());

const allowedOrigins = [
  'http://localhost:3000',
  process.env.FRONTEND_URL,
].filter(Boolean); // This removes any falsy values, like if FRONTEND_URL is not set.

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if the origin is in our whitelist
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
}));

app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files (for uploaded images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend/build', 'index.html'));
  });
}

// Routes
app.use('/api/items', itemRoutes);
app.use('/api/ai', aiRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'PantryPilot API Server',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      items: '/api/items',
      ai: '/api/ai',
    },
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File too large',
        message: 'File size cannot exceed 10MB',
      });
    }
  }

  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Handle 404 routes
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `The route ${req.originalUrl} does not exist on this server`,
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Health check available at /api/health`);
  
  // Initialize database in the background after the server starts listening
  initializeDatabase().catch(error => {
    // The process will exit due to the error handler in initializeDatabase
    // but we log it here for good measure.
    console.error("Background database initialization failed:", error);
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  // The closeDatabase function is no longer needed here as it's handled at the top level.
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received. Shutting down gracefully...');
  // The closeDatabase function is no longer needed here as it's handled at the top level.
  process.exit(0);
});

module.exports = app; 