// Root entry point for Railway deployment
// This file directly starts the backend server to avoid nested npm commands

const path = require('path');

// Change working directory to backend
process.chdir(path.join(__dirname, 'backend'));

// Load environment variables from backend directory
require('dotenv').config();

// Start the backend server
require('./index.js'); 