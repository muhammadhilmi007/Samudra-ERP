/**
 * Samudra Paket ERP - Database Connection
 * Handles MongoDB connection using mongoose
 */

const mongoose = require('mongoose');
let mongoServer;

/**
 * Connect to MongoDB
 * @returns {Promise<void>}
 */
const connectToDatabase = async () => {
  try {
    // Always use in-memory MongoDB server for development to simplify setup
    if (process.env.NODE_ENV === 'development') {
      try {
        // Use in-memory MongoDB server for development
        const { MongoMemoryServer } = require('mongodb-memory-server');
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        console.log(`Using in-memory MongoDB server at: ${mongoUri}`);
        
        await mongoose.connect(mongoUri);
        console.log('Connected to in-memory MongoDB server');
        return;
      } catch (memoryError) {
        console.warn('Failed to start in-memory MongoDB server:', memoryError.message);
        console.warn('Falling back to external MongoDB connection if available...');
      }
    }
    
    // If we're not in development or in-memory server failed, try external connection
    if (process.env.MONGODB_URI) {
      try {
        // Connect to external MongoDB server
        const options = {};

        // Add credentials if provided
        if (process.env.MONGODB_USER && process.env.MONGODB_PASSWORD) {
          options.auth = {
            username: process.env.MONGODB_USER,
            password: process.env.MONGODB_PASSWORD
          };
        }

        await mongoose.connect(process.env.MONGODB_URI, options);
        console.log(`MongoDB connected successfully to: ${process.env.MONGODB_URI}`);
        return;
      } catch (externalError) {
        console.error('External MongoDB connection error:', externalError.message);
        
        // If we're in development and external connection failed, try one more time with in-memory
        if (process.env.NODE_ENV === 'development' && !mongoServer) {
          console.log('Attempting to use in-memory MongoDB server as fallback...');
          const { MongoMemoryServer } = require('mongodb-memory-server');
          mongoServer = await MongoMemoryServer.create();
          const mongoUri = mongoServer.getUri();
          
          await mongoose.connect(mongoUri);
          console.log('Connected to fallback in-memory MongoDB server');
          return;
        }
        
        throw externalError;
      }
    } else {
      throw new Error('MongoDB URI not provided');
    }
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    console.error('Please check your MongoDB configuration in .env file');
    console.error('For development, you can use an in-memory database by setting NODE_ENV=development');
    
    // Don't exit process, just log the error and continue
    // This allows the application to start even if database connection fails
    console.warn('Starting application without database connection. Some features may not work.');
  }
};

/**
 * Disconnect from MongoDB
 * @returns {Promise<void>}
 */
const disconnectFromDatabase = async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log('MongoDB disconnected successfully');
    }
    
    // Stop in-memory server if it's running
    if (mongoServer) {
      await mongoServer.stop();
      console.log('In-memory MongoDB server stopped');
    }
  } catch (error) {
    console.error('MongoDB disconnection error:', error.message);
    process.exit(1);
  }
};

module.exports = {
  connectToDatabase,
  disconnectFromDatabase
};
