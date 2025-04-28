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
    // Connect to database
    await connectToDatabase();

    // Delete existing users
    await User.deleteMany({});
    console.log('Deleted existing users');

    // Create new users
    const createdUsers = await User.create(users);
    console.log(`Created ${createdUsers.length} users`);

    // Log created users (without passwords)
    createdUsers.forEach(user => {
      console.log(`- ${user.username} (${user.role}): ${user._id}`);
    });

    console.log('User seeding completed successfully');
    
    // Close database connection
    await disconnectFromDatabase();
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding users:', error);
    
    // Close database connection
    await disconnectFromDatabase();
    
    process.exit(1);
  }
};

// Run seeder
seedUsers();
