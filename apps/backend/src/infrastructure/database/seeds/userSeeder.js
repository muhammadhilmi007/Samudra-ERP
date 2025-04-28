/**
 * Samudra Paket ERP - User Seeder
 * Seeds the database with initial users for testing
 */

// Set NODE_ENV to development if not already set
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const mongoose = require('mongoose');
const User = require('../../../domain/models/user');
const { connectToDatabase, disconnectFromDatabase } = require('../connection');

/**
 * Initial users data with different roles
 */
const users = [
  {
    username: 'admin',
    email: 'admin@samudrapaket.com',
    password: 'admin123',
    fullName: 'Administrator',
    role: 'ADMIN',
    permissions: ['ALL'],
    isActive: true,
  },
  {
    username: 'manager',
    email: 'manager@samudrapaket.com',
    password: 'manager123',
    fullName: 'Manager User',
    role: 'MANAGER',
    permissions: ['manage_users', 'manage_packages', 'view_reports'],
    isActive: true,
  },
  {
    username: 'operator',
    email: 'operator@samudrapaket.com',
    password: 'operator123',
    fullName: 'Operator User',
    role: 'OPERATOR',
    permissions: ['create_package', 'update_package', 'view_package'],
    isActive: true,
  },
  {
    username: 'driver',
    email: 'driver@samudrapaket.com',
    password: 'driver123',
    fullName: 'Driver User',
    role: 'DRIVER',
    permissions: ['view_package', 'update_package_status'],
    isActive: true,
  },
  {
    username: 'checker',
    email: 'checker@samudrapaket.com',
    password: 'checker123',
    fullName: 'Checker User',
    role: 'CHECKER',
    permissions: ['view_package', 'verify_package'],
    isActive: true,
  },
  {
    username: 'collector',
    email: 'collector@samudrapaket.com',
    password: 'collector123',
    fullName: 'Debt Collector User',
    role: 'DEBT_COLLECTOR',
    permissions: ['view_package', 'collect_payment'],
    isActive: true,
  },
  {
    username: 'customer',
    email: 'customer@example.com',
    password: 'customer123',
    fullName: 'Customer User',
    role: 'CUSTOMER',
    permissions: ['track_package'],
    isActive: true,
  },
];

/**
 * Seed users to the database
 */
const seedUsers = async () => {
  try {
    console.log('Starting user seeder...');
    console.log(`MongoDB URI: ${process.env.MONGODB_URI || 'Not set (will use in-memory DB)'}`);
    
    // Connect to database
    console.log('Connecting to MongoDB...');
    await connectToDatabase();
    
    // Check if we're connected
    if (mongoose.connection.readyState !== 1) {
      throw new Error('Failed to connect to MongoDB. Connection state: ' + 
        ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState]);
    }
    
    console.log('Connected to MongoDB successfully');
    console.log('Database name:', mongoose.connection.name);

    // Delete existing users
    console.log('Deleting existing users...');
    const deleteResult = await User.deleteMany({});
    console.log(`Deleted ${deleteResult.deletedCount} existing users`);

    // Create new users
    console.log('Creating new users...');
    const createdUsers = await User.create(users);
    console.log(`Created ${createdUsers.length} users`);

    // Log created users (without passwords)
    createdUsers.forEach(user => {
      console.log(`- ${user.username} (${user.role}): ${user._id}`);
    });

    console.log('User seeding completed successfully');
    
    // Close database connection
    console.log('Closing database connection...');
    await disconnectFromDatabase();
    console.log('Database connection closed');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding users:', error.message);
    if (error.name === 'MongooseServerSelectionError') {
      console.error('\nMongoDB connection error details:');
      console.error('1. Make sure MongoDB is running on your machine');
      console.error('2. Check if the MongoDB URI in .env file is correct');
      console.error('3. Verify that the username and password are correct');
      console.error('4. Ensure that the database name exists or can be created');
      console.error('\nFor MongoDB Compass users:');
      console.error('- Check that the connection string format is correct');
      console.error('- Try using the connection string from MongoDB Compass');
      console.error('- Example format: mongodb://localhost:27017/samudra_paket');
    }
    
    // Close database connection if it's open
    try {
      if (mongoose.connection.readyState !== 0) {
        console.log('Closing database connection...');
        await disconnectFromDatabase();
        console.log('Database connection closed');
      }
    } catch (disconnectError) {
      console.error('Error closing database connection:', disconnectError.message);
    }
    
    process.exit(1);
  }
};

// Run seeder
seedUsers();
