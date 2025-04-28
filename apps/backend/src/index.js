/**
 * Samudra Paket ERP - Backend Service
 * Main entry point for the backend application
 */

// Set NODE_ENV to development if not already set
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const cors = require('cors');

// Import database connection
const { connectToDatabase } = require('./infrastructure/database/connection');

// Import routes
const apiRoutes = require('./api/routes');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serve static files from public directory

// Routes
app.use('/api', apiRoutes);

// Basic health check route
app.get('/', (req, res) => {
  res.json({
    success: true,
    data: {
      message: 'Samudra Paket ERP API is running',
      version: '0.1.0',
    },
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: {
      code: 'SERVER_ERROR',
      message: 'Internal Server Error',
      details: process.env.NODE_ENV === 'development' ? err.message : {},
    },
  });
});

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectToDatabase();
    console.log('MongoDB connected successfully');
    
    // Start Express server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`API Documentation: http://localhost:${PORT}/api/docs`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

// Start the server if not in test environment
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = app; // For testing purposes
