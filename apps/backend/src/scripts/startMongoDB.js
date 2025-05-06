/**
 * Samudra Paket ERP - Start MongoDB Script
 * Script to start a local MongoDB instance for development
 */

const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Create a directory to store the MongoDB connection info
const configDir = path.join(__dirname, '../config');
if (!fs.existsSync(configDir)) {
  fs.mkdirSync(configDir, { recursive: true });
}

const connectionInfoPath = path.join(configDir, 'mongodb-connection.json');

/**
 * Start a MongoDB memory server for development
 */
const startMongoDB = async () => {
  try {
    console.log('Starting MongoDB Memory Server for development...');
    
    // Start MongoDB memory server
    const mongod = await MongoMemoryServer.create({
      instance: {
        port: 27017, // Try to use the default MongoDB port
        dbName: 'samudra_paket_erp',
      }
    });
    
    const uri = mongod.getUri();
    const port = mongod.instanceInfo.port;
    
    console.log(`\n✅ MongoDB Memory Server started successfully!`);
    console.log(`URI: ${uri}`);
    console.log(`Port: ${port}`);
    console.log(`Database: samudra_paket_erp`);
    
    // Save connection info to a file for other processes to use
    const connectionInfo = {
      uri,
      port,
      dbName: 'samudra_paket_erp',
      timestamp: new Date().toISOString(),
    };
    
    fs.writeFileSync(connectionInfoPath, JSON.stringify(connectionInfo, null, 2));
    console.log(`\nConnection info saved to: ${connectionInfoPath}`);
    
    // Set environment variable for other processes
    process.env.MONGODB_URI = uri;
    
    console.log('\nPress Ctrl+C to stop the MongoDB server...');
    
    // Keep the process running
    process.stdin.resume();
    
    // Handle process termination
    const cleanup = async () => {
      console.log('\nStopping MongoDB Memory Server...');
      await mongod.stop();
      console.log('MongoDB Memory Server stopped');
      
      // Remove the connection info file
      if (fs.existsSync(connectionInfoPath)) {
        fs.unlinkSync(connectionInfoPath);
        console.log(`Removed connection info file: ${connectionInfoPath}`);
      }
      
      process.exit(0);
    };
    
    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
    process.on('exit', cleanup);
    
  } catch (error) {
    console.error('Error starting MongoDB Memory Server:', error);
    process.exit(1);
  }
};

// Run the script
startMongoDB();
