/**
 * Debug Server
 * This file is used to debug the server initialization process
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
const cors = require('cors');
const helmet = require('helmet');

// Import database connection
const { connectToDatabase } = require('./infrastructure/database/connection');

// Create Express app
const app = express();

// Create logs directory
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
  console.log(`Created logs directory at ${logsDir}`);
}

async function startServer() {
  try {
    console.log('Starting server in debug mode...');
    
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await connectToDatabase();
    console.log('MongoDB connected successfully!');
    
    // Basic middleware
    console.log('Setting up middleware...');
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cors());
    app.use(helmet());
    
    // Simple test route
    app.get('/', (req, res) => {
      res.json({ message: 'Samudra Paket ERP API is running' });
    });
    
    // Health check route
    app.get('/health', (req, res) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });
    
    // Start the server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
      console.log(`API URL: ${process.env.API_URL}`);
    });
    
  } catch (error) {
    console.error('\n==== SERVER INITIALIZATION ERROR ====');
    console.error(`Error message: ${error.message}`);
    console.error(`Error stack: ${error.stack}`);
    process.exit(1);
  }
}

// Start the server
startServer();
