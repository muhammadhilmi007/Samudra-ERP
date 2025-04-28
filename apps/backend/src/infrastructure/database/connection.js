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
    // Khusus untuk MongoDB Compass - gunakan koneksi sederhana
    console.log('Attempting to connect to MongoDB...');
    
    // Gunakan URI default jika tidak ada yang disediakan
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/samudra_paket';
    
    // Opsi koneksi sederhana
    const options = {
      serverSelectionTimeoutMS: 30000, // 30 detik timeout untuk seleksi server
      connectTimeoutMS: 30000, // 30 detik timeout koneksi
      socketTimeoutMS: 60000, // 60 detik socket timeout
      family: 4 // Gunakan IPv4, hindari masalah dengan IPv6
    };

    // Log percobaan koneksi
    const sanitizedUri = uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');
    console.log(`Connecting to MongoDB at: ${sanitizedUri}`);
    
    // Connect to MongoDB
    await mongoose.connect(uri, options);
    
    // Log koneksi berhasil
    console.log('MongoDB connected successfully!');
    console.log(`Database name: ${mongoose.connection.db.databaseName}`);
    return;
  } catch (error) {
    console.error('\n==== MONGODB CONNECTION ERROR ====');
    console.error(`Error message: ${error.message}`);
    
    // Coba gunakan in-memory MongoDB sebagai fallback jika dalam mode development
    if (process.env.NODE_ENV === 'development') {
      try {
        console.log('\nMencoba menggunakan in-memory MongoDB sebagai fallback...');
        
        const { MongoMemoryServer } = require('mongodb-memory-server');
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        console.log(`Using in-memory MongoDB server at: ${mongoUri}`);
        
        await mongoose.connect(mongoUri);
        console.log('Connected to in-memory MongoDB server');
        return;
      } catch (memoryError) {
        console.error('Failed to start in-memory MongoDB server:', memoryError.message);
      }
    }
    // Tampilkan pesan error yang lebih spesifik untuk MongoDB Compass
    console.error('\n==== PANDUAN TROUBLESHOOTING MONGODB COMPASS ====');
    console.error('Error message:', error.message);
    
    console.error('\nLangkah-langkah troubleshooting:');
    console.error('1. Pastikan MongoDB Compass sudah terbuka dan terhubung');
    console.error('2. Periksa connection string di MongoDB Compass');
    console.error('3. Gunakan format connection string berikut di file .env:');
    console.error('   MONGODB_URI=mongodb://127.0.0.1:27017/samudra_paket');
    console.error('   (Gunakan 127.0.0.1 bukan localhost)');
    
    console.error('\nJika menggunakan autentikasi:');
    console.error('1. Pastikan database samudra_paket sudah dibuat di MongoDB');
    console.error('2. Pastikan user memiliki akses ke database tersebut');
    console.error('3. Gunakan format connection string dengan kredensial:');
    console.error('   MONGODB_URI=mongodb://username:password@127.0.0.1:27017/samudra_paket');
    
    console.error('\nUntuk MongoDB Compass:');
    console.error('1. Buka MongoDB Compass');
    console.error('2. Klik "Connect" > "New Connection"');
    console.error('3. Masukkan connection string: mongodb://127.0.0.1:27017');
    console.error('4. Klik "Connect"');
    console.error('5. Buat database "samudra_paket" jika belum ada');
    
    console.error('\nJika masih gagal:');
    console.error('1. Restart MongoDB service');
    console.error('2. Pastikan port 27017 tidak diblokir firewall');
    console.error('3. Coba gunakan "mongodb://localhost:27017/samudra_paket"');
    console.error('==== END OF TROUBLESHOOTING GUIDE ====\n');
    
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
