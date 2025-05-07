/**
 * Database Configuration
 * Handles MongoDB connection setup and management
 */

const mongoose = require('mongoose');
const { logger } = require('../api/middleware/gateway/logger');

/**
 * Configure MongoDB connection
 * @param {Object} app - Express application instance
 * @returns {Promise<void>}
 */
const configureMongoDB = async (app) => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      throw new Error('MONGODB_URI environment variable is not defined');
    }
    
    // Configure Mongoose
    mongoose.set('strictQuery', false);
    
    // Connect to MongoDB
    const connection = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      autoIndex: process.env.NODE_ENV !== 'production', // Don't build indexes in production
    });
    
    // Store mongoose connection in app locals for health checks
    app.locals.mongoose = mongoose;
    
    logger.info(`MongoDB Connected: ${connection.connection.host}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      logger.error(`MongoDB connection error: ${err}`);
    });
    
    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });
    
    // Handle process termination
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed due to app termination');
      process.exit(0);
    });
    
    return connection;
  } catch (error) {
    logger.error(`MongoDB connection error: ${error.message}`);
    // Exit process with failure
    process.exit(1);
  }
};

module.exports = {
  configureMongoDB,
};
