/**
 * Samudra Paket ERP - Backend Service
 * Main entry point for the backend application
 */

// Set NODE_ENV to development if not already set
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// Load environment variables from .env file
require('dotenv').config();

// Add better error handling for uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('\n==== UNCAUGHT EXCEPTION ====');
  console.error(`Error message: ${error.message}`);
  console.error(`Error stack: ${error.stack}`);
  process.exit(1);
});

// Add better error handling for unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('\n==== UNHANDLED REJECTION ====');
  console.error('Unhandled Rejection at:', promise);
  console.error('Reason:', reason);
  process.exit(1);
});

const express = require('express');
const path = require('path');
const fs = require('fs');

// Import database and cache configurations
const { configureMongoDB } = require('./config/database');
const { configureRedis, cacheMiddleware } = require('./config/cache');

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
    console.log('Starting server initialization...');
    
    // Connect to database
    console.log('Connecting to MongoDB...');
    await configureMongoDB(app);
    logger.info('MongoDB connected successfully');
    console.log('MongoDB connected successfully');
    
    // Connect to Redis for caching
    console.log('Connecting to Redis...');
    const redis = await configureRedis(app);
    if (redis) {
      logger.info('Redis connected successfully');
      console.log('Redis connected successfully');
      
      // Apply cache middleware globally with 1-hour expiry
      app.use(cacheMiddleware(redis, 3600));
    } else {
      logger.warn('Redis connection failed or not configured. Caching is disabled.');
      console.warn('Redis connection failed or not configured. Caching is disabled.');
    }

    // Start Express server
    console.log(`Starting Express server on port ${PORT}...`);
    const server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`API Documentation: http://localhost:${PORT}/api/docs`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      
      console.log(`Server running on port ${PORT}`);
      console.log(`API Documentation: http://localhost:${PORT}/api/docs`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    // Handle graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM signal received: closing HTTP server');
      server.close(() => {
        logger.info('HTTP server closed');
      });
    });
  } catch (error) {
    console.error('\n==== SERVER INITIALIZATION ERROR ====');
    console.error(`Error message: ${error.message}`);
    console.error(`Error stack: ${error.stack}`);
    
    logger.error(`Server failed to start: ${error.message}`);
    logger.error(`Error stack: ${error.stack}`);
    
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
