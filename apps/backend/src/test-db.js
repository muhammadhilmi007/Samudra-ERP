/**
 * Test MongoDB Connection
 * This file is used to test the MongoDB connection separately from the main application
 */

// Load environment variables from .env file
require('dotenv').config();

const mongoose = require('mongoose');

async function testConnection() {
  try {
    console.log('Testing MongoDB connection...');
    
    // Get MongoDB connection details from environment variables
    const mongoUri = process.env.MONGODB_URI || 'mongodb://mongo:oFgiQXbTppRRDKapRNAEIwATDWMnUfzv@caboose.proxy.rlwy.net:51544';
    console.log(`MongoDB URI: ${mongoUri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}`);
    
    // Connection options
    const options = {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 60000,
      family: 4,
      retryWrites: true,
      w: 'majority',
      authSource: 'admin'
    };
    
    // Connect to MongoDB
    await mongoose.connect(mongoUri, options);
    
    console.log('MongoDB connected successfully!');
    console.log(`Database name: ${mongoose.connection.db.databaseName}`);
    
    // Close the connection
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
    
  } catch (error) {
    console.error('\n==== MONGODB CONNECTION ERROR ====');
    console.error(`Error message: ${error.message}`);
    console.error(`Error stack: ${error.stack}`);
    
    if (error.name === 'MongoServerSelectionError') {
      console.error('Could not connect to any MongoDB server in the connection string');
    }
    
    process.exit(1);
  }
}

// Run the test
testConnection();
