/**
 * Samudra Paket ERP - Start MongoDB Script
 * Starts a local MongoDB server using mongodb-memory-server for development
 */

const { MongoMemoryServer } = require('mongodb-memory-server');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Path to .env file
const envFilePath = path.resolve(__dirname, '../.env');

/**
 * Start MongoDB Memory Server
 */
async function startMongoDB() {
  try {
    console.log('Starting MongoDB Memory Server...');
    
    // Create MongoDB Memory Server
    const mongod = await MongoMemoryServer.create({
      instance: {
        dbName: 'samudra_paket',
        port: 27017,
      }
    });
    
    // Get connection URI
    const uri = mongod.getUri();
    console.log(`MongoDB Memory Server started at: ${uri}`);
    
    // Update .env file with MongoDB URI
    let envContent = '';
    
    if (fs.existsSync(envFilePath)) {
      // Read existing .env file
      envContent = fs.readFileSync(envFilePath, 'utf8');
      
      // Replace or add MONGODB_URI
      if (envContent.includes('MONGODB_URI=')) {
        envContent = envContent.replace(/MONGODB_URI=.*/g, `MONGODB_URI=${uri}`);
      } else {
        envContent += `\nMONGODB_URI=${uri}`;
      }
    } else {
      // Create new .env file with MongoDB URI
      envContent = `NODE_ENV=development\nPORT=5000\nMONGODB_URI=${uri}\nJWT_SECRET=dev_jwt_secret\nJWT_EXPIRES_IN=1h\nJWT_REFRESH_SECRET=dev_jwt_refresh_secret\nJWT_REFRESH_EXPIRES_IN=7d`;
    }
    
    // Write updated content to .env file
    fs.writeFileSync(envFilePath, envContent);
    console.log('.env file updated with MongoDB URI');
    
    // Keep process running
    console.log('Press Ctrl+C to stop MongoDB and exit');
    
    // Handle process termination
    process.on('SIGINT', async () => {
      await mongod.stop();
      console.log('MongoDB Memory Server stopped');
      process.exit(0);
    });
  } catch (error) {
    console.error('Error starting MongoDB Memory Server:', error);
    process.exit(1);
  }
}

// Start MongoDB
startMongoDB();
