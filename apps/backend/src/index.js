/**
 * Samudra Paket ERP - Backend Service
 * Main entry point for the backend application
 */

// Set NODE_ENV to development if not already set
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const path = require('path');
const fs = require('fs');

// Import database connection
const { connectToDatabase } = require('./infrastructure/database/connection');

// Import API Gateway middleware
const {
  configureApiGateway,
  configureErrorHandling,
} = require('./api/middleware/gateway');

// Import routes
const apiRoutes = require('./api/routes');

// Import logger
const { logger } = require('./api/middleware/gateway/logger');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Import config
const config = require('./config/config');

// Initialize Express app
const app = express();
const PORT = config.app.port;

// Configure API Gateway middleware
configureApiGateway(app);

// Serve static files from public directory
app.use(express.static('public'));

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

// API Routes
app.use('/api', apiRoutes);

// Configure error handling middleware
configureErrorHandling(app);

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectToDatabase();
    logger.info('MongoDB connected successfully');

    // Start Express server
    const server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`API Documentation: http://localhost:${PORT}/api/docs`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    // Handle graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM signal received: closing HTTP server');
      server.close(() => {
        logger.info('HTTP server closed');
      });
    });
  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`, { error });
    process.exit(1);
  }
};

// Start the server if not in test environment
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', { error });
  // Give the logger time to flush before exiting
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection:', { reason });
  // Give the logger time to flush before exiting
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});

module.exports = app; // For testing purposes
