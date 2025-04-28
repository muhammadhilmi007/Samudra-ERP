/**
 * Samudra Paket ERP - MongoDB Connection Tester
 * Script untuk menguji koneksi ke MongoDB dan membantu troubleshooting
 */

// Load environment variables
require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Path to .env file
const envFilePath = path.resolve(__dirname, '../.env');

/**
 * Format connection string for display (hide credentials)
 */
function formatConnectionString(uri) {
  if (!uri) return 'Not provided';
  return uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');
}

/**
 * Test MongoDB connection
 */
async function testConnection() {
  console.log('\n===== MONGODB CONNECTION TEST =====');
  console.log('Testing connection to MongoDB...\n');
  
  // Display current configuration
  console.log('Current Configuration:');
  console.log(`MongoDB URI: ${formatConnectionString(process.env.MONGODB_URI)}`);
  console.log(`MongoDB User: ${process.env.MONGODB_USER || 'Not provided'}`);
  console.log(`MongoDB Password: ${process.env.MONGODB_PASSWORD ? '********' : 'Not provided'}`);
  console.log(`Node Environment: ${process.env.NODE_ENV || 'Not set'}\n`);
  
  try {
    // Connection options
    const options = {
      serverSelectionTimeoutMS: 10000, // 10 seconds timeout for server selection
      connectTimeoutMS: 10000, // 10 seconds connection timeout
      socketTimeoutMS: 45000, // 45 seconds socket timeout
    };
    
    console.log('Attempting to connect to MongoDB...');
    
    // Connect to MongoDB
    const startTime = Date.now();
    await mongoose.connect(process.env.MONGODB_URI, options);
    const connectionTime = Date.now() - startTime;
    
    // Connection successful
    console.log(`\n✅ CONNECTION SUCCESSFUL (${connectionTime}ms)`);
    console.log(`Connected to database: ${mongoose.connection.db.databaseName}`);
    console.log(`MongoDB version: ${await mongoose.connection.db.admin().serverInfo().then(info => info.version)}`);
    
    // List collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`\nCollections in database (${collections.length}):`);
    if (collections.length > 0) {
      collections.forEach(collection => {
        console.log(`- ${collection.name}`);
      });
    } else {
      console.log('No collections found (empty database)');
    }
    
    console.log('\nConnection test completed successfully!');
    console.log('You can now run the user seeder script:');
    console.log('node src/infrastructure/database/seeds/userSeeder.js');
  } catch (error) {
    // Connection failed
    console.error('\n❌ CONNECTION FAILED');
    console.error(`Error: ${error.message}`);
    
    // Provide troubleshooting guidance based on error
    console.error('\nTROUBLESHOOTING GUIDANCE:');
    
    if (error.name === 'MongoServerSelectionError') {
      console.error('1. Pastikan MongoDB server berjalan di komputer Anda');
      console.error('2. Periksa apakah alamat server dan port sudah benar');
      console.error('3. Periksa apakah firewall mengizinkan koneksi ke MongoDB');
      
      // Suggest connection string format
      console.error('\nFormat connection string yang benar:');
      console.error('- Tanpa autentikasi: mongodb://localhost:27017/samudra_paket');
      console.error('- Dengan autentikasi: mongodb://username:password@localhost:27017/samudra_paket');
      
      // Suggest MongoDB Compass connection string
      console.error('\nUntuk pengguna MongoDB Compass:');
      console.error('1. Buka MongoDB Compass');
      console.error('2. Salin connection string dari Compass (biasanya terlihat di bagian atas)');
      console.error('3. Gunakan connection string tersebut di file .env');
    } else if (error.name === 'MongoParseError') {
      console.error('Connection string tidak valid. Format yang benar:');
      console.error('mongodb://localhost:27017/samudra_paket');
    } else if (error.name === 'MongooseServerSelectionError') {
      console.error('Tidak dapat terhubung ke server MongoDB:');
      console.error('1. Pastikan MongoDB server berjalan');
      console.error('2. Periksa apakah alamat dan port sudah benar');
    } else if (error.message.includes('Authentication failed')) {
      console.error('Autentikasi gagal:');
      console.error('1. Periksa username dan password di file .env');
      console.error('2. Pastikan pengguna memiliki akses ke database');
      
      // Suggest updating .env file
      console.error('\nContoh konfigurasi .env yang benar:');
      console.error('MONGODB_URI=mongodb://localhost:27017/samudra_paket');
      console.error('MONGODB_USER=username');
      console.error('MONGODB_PASSWORD=password');
    }
    
    // Suggest direct connection string
    console.error('\nCOBA CONNECTION STRING INI:');
    console.error('MONGODB_URI=mongodb://127.0.0.1:27017/samudra_paket');
    console.error('(Gunakan 127.0.0.1 alih-alih localhost)');
    
    // Suggest creating .env file
    if (!fs.existsSync(envFilePath)) {
      console.error('\nFile .env tidak ditemukan. Buat file .env dengan konten:');
      console.error('NODE_ENV=development');
      console.error('PORT=5000');
      console.error('MONGODB_URI=mongodb://127.0.0.1:27017/samudra_paket');
    }
  } finally {
    // Close connection
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log('\nMongoDB connection closed');
    }
  }
  
  console.log('\n===== END OF TEST =====');
}

// Run test
testConnection()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
