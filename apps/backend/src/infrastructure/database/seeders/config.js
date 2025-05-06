/**
 * Samudra Paket ERP - Seeder Configuration
 * Central configuration for all seeders
 */

const mongoose = require('mongoose');

/**
 * MongoDB connection configuration
 */
const mongodb = {
  uri: process.env.MONGODB_URI || 'mongodb://mongo:oFgiQXbTppRRDKapRNAEIwATDWMnUfzv@caboose.proxy.rlwy.net:51544',
  options: {
    serverSelectionTimeoutMS: 30000, // 30 seconds timeout for server selection
    connectTimeoutMS: 30000, // 30 seconds connection timeout
    socketTimeoutMS: 60000, // 60 seconds socket timeout
    family: 4, // Use IPv4, avoid issues with IPv6
  }
};

/**
 * Connect to MongoDB
 * @returns {Promise<mongoose.Connection>}
 */
const connectToDatabase = async () => {
  try {
    console.log('Connecting to MongoDB...');
    const sanitizedUri = mongodb.uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');
    console.log(`Connection URI: ${sanitizedUri}`);
    
    await mongoose.connect(mongodb.uri, mongodb.options);
    
    console.log('Connected to MongoDB successfully!');
    console.log(`Database name: ${mongoose.connection.db.databaseName}`);
    
    return mongoose.connection;
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
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
  } catch (error) {
    console.error('MongoDB disconnection error:', error.message);
    throw error;
  }
};

module.exports = {
  mongodb,
  connectToDatabase,
  disconnectFromDatabase
};
