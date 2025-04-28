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
    // Check if we should use external MongoDB connection
    if (process.env.MONGODB_URI) {
      console.log('Attempting to connect to external MongoDB...');
      
      // Basic connection options
      const options = {
        serverSelectionTimeoutMS: 10000, // 10 seconds timeout for server selection
        connectTimeoutMS: 10000, // 10 seconds connection timeout
        socketTimeoutMS: 45000, // 45 seconds socket timeout
      };

      // Log connection attempt
      const sanitizedUri = process.env.MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');
      console.log(`Connecting to MongoDB at: ${sanitizedUri}`);
      
      // Connect to MongoDB
      await mongoose.connect(process.env.MONGODB_URI, options);
      
      // Log successful connection
      console.log('MongoDB connected successfully!');
      console.log(`Database name: ${mongoose.connection.db.databaseName}`);
      return;
    }
    // If no MongoDB URI is provided, use in-memory MongoDB for development
    else if (process.env.NODE_ENV === 'development') {
      console.log('No MongoDB URI provided, using in-memory MongoDB for development...');
      
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
        console.error('Failed to start in-memory MongoDB server:', memoryError.message);
        throw new Error('Could not start in-memory MongoDB server');
      }
    }
    else {
      throw new Error('MongoDB URI not provided and not in development mode');
    }
  } catch (error) {
    console.error('\n==== MongoDB CONNECTION ERROR ====');
    console.error(`Error message: ${error.message}`);
    
    if (error.name === 'MongoServerSelectionError') {
      console.error('\nPossible causes:');
      console.error('1. MongoDB server is not running');
      console.error('2. MongoDB connection string is incorrect');
      console.error('3. MongoDB credentials are invalid');
      console.error('4. Network issues preventing connection');
      
      console.error('\nTroubleshooting steps:');
      console.error('1. Verify MongoDB is running (check MongoDB Compass)');
      console.error('2. Check your connection string in .env file');
      console.error('3. Try connecting with MongoDB Compass to verify credentials');
      console.error('4. Make sure your firewall allows MongoDB connections');
      console.error('5. Check if the database name exists or can be created');
    }
    
    console.error('\nSample .env configuration:');
    console.error('MONGODB_URI=mongodb://localhost:27017/samudra_paket');
    console.error('==== END OF ERROR REPORT ====\n');
    
    // Re-throw the error to be handled by the caller
    throw error;
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
    // Don't exit process, just log the error
    console.error('Failed to disconnect from MongoDB cleanly');
  }
};

module.exports = {
  connectToDatabase,
  disconnectFromDatabase
};
