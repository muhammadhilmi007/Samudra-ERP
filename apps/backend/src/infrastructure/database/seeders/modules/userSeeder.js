/**
 * Samudra Paket ERP - User Seeder
 * Seeds the database with initial users for testing
 */

const mongoose = require('mongoose');
const User = require('../../../../domain/models/user');
const Role = require('../../../../domain/models/role');
const { connectToDatabase, disconnectFromDatabase } = require('../config');
const { seedRBAC } = require('./rbacSeeder');

/**
 * Initial users data with different roles
 */
const userTemplates = [
  {
    username: 'admin',
    email: 'admin@samudrapaket.com',
    password: 'admin123',
    fullName: 'Administrator',
    legacyRole: 'ADMIN',
    roleName: 'ADMIN',
    permissions: ['ALL'],
    isActive: true,
  },
  {
    username: 'manager',
    email: 'manager@samudrapaket.com',
    password: 'manager123',
    fullName: 'Manager User',
    legacyRole: 'MANAGER',
    roleName: 'MANAGER',
    permissions: ['CUSTOMER_ALL', 'PICKUP_ALL', 'SHIPMENT_ALL', 'DELIVERY_ALL'],
    isActive: true,
  },
  {
    username: 'operator',
    email: 'operator@samudrapaket.com',
    password: 'operator123',
    fullName: 'Operator User',
    legacyRole: 'OPERATOR',
    roleName: 'OPERATOR',
    permissions: ['CUSTOMER_READ', 'PICKUP_ALL', 'SHIPMENT_ALL'],
    isActive: true,
  },
  {
    username: 'driver',
    email: 'driver@samudrapaket.com',
    password: 'driver123',
    fullName: 'Driver User',
    legacyRole: 'DRIVER',
    roleName: 'DRIVER',
    permissions: ['DELIVERY_READ', 'DELIVERY_UPDATE', 'TRACKING_READ'],
    isActive: true,
  },
  {
    username: 'checker',
    email: 'checker@samudrapaket.com',
    password: 'checker123',
    fullName: 'Checker User',
    legacyRole: 'CHECKER',
    roleName: 'CHECKER',
    permissions: ['PICKUP_READ', 'PICKUP_UPDATE', 'TRACKING_READ'],
    isActive: true,
  },
  {
    username: 'collector',
    email: 'collector@samudrapaket.com',
    password: 'collector123',
    fullName: 'Debt Collector User',
    legacyRole: 'DEBT_COLLECTOR',
    roleName: 'DEBT_COLLECTOR',
    permissions: ['CUSTOMER_READ', 'PAYMENT_ALL'],
    isActive: true,
  },
  {
    username: 'customer',
    email: 'customer@example.com',
    password: 'customer123',
    fullName: 'Customer User',
    legacyRole: 'CUSTOMER',
    roleName: 'CUSTOMER',
    permissions: ['TRACKING_READ'],
    isActive: true,
  },
];

/**
 * Seed users to the database
 */
const seedUsers = async () => {
  try {
    console.log('Starting user seeder...');

    // Connect to database if not already connected
    if (mongoose.connection.readyState === 0) {
      await connectToDatabase();
    }

    // Check if we're connected
    if (mongoose.connection.readyState !== 1) {
      throw new Error(`Failed to connect to MongoDB. Connection state: ${['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState]}`);
    }

    console.log('Connected to MongoDB successfully');
    console.log('Database name:', mongoose.connection.name);

    // Find roles first
    console.log('Finding roles...');
    const roles = await Role.find({});
    const roleMap = {};

    // Create a map of role names to role IDs
    roles.forEach((role) => {
      roleMap[role.name] = role.id;
    });

    console.log('Role mapping:', roleMap);

    // Check if roles exist, if not, create them first
    if (Object.keys(roleMap).length === 0) {
      console.log('No roles found. Running RBAC seeder first...');

      // Run the RBAC seeder
      await seedRBAC();

      // Get roles again
      console.log('Finding roles again after seeding...');
      const freshRoles = await Role.find({});

      // Update role map
      freshRoles.forEach((role) => {
        roleMap[role.name] = role.id;
      });

      console.log('Updated role mapping:', roleMap);
    }

    // Ask if existing users should be deleted
    console.log('Checking for existing users...');
    const existingCount = await User.countDocuments({});
    
    if (existingCount > 0) {
      console.log(`Found ${existingCount} existing users`);
      console.log('Deleting existing users...');
      const deleteResult = await User.deleteMany({});
      console.log(`Deleted ${deleteResult.deletedCount} existing users`);
    } else {
      console.log('No existing users found');
    }

    // Prepare users with proper role references
    const users = userTemplates.map((template) => {
      const user = { ...template };
      // Set role reference if it exists in the database
      if (roleMap[template.roleName]) {
        user.role = roleMap[template.roleName];
      } else {
        console.warn(`Warning: Role '${template.roleName}' not found in database. User '${template.username}' will not be created.`);
        return null;
      }
      // Remove roleName as it's not part of the schema
      delete user.roleName;
      return user;
    }).filter(Boolean); // Remove null entries

    // Create new users
    console.log('Creating new users...');
    const createdUsers = await User.create(users);
    console.log(`Created ${createdUsers.length} users`);

    // Log created users (without passwords)
    createdUsers.forEach((user) => {
      console.log(`- ${user.username} (${user.legacyRole}): ${user.id}`);
    });

    console.log('User seeding completed successfully');
    return createdUsers;
  } catch (error) {
    console.error('Error seeding users:', error.message);
    if (error.name === 'MongooseServerSelectionError') {
      console.error('\nMongoDB connection error details:');
      console.error('1. Make sure MongoDB is running on your machine');
      console.error('2. Check if the MongoDB URI in .env file is correct');
      console.error('3. Verify that the username and password are correct');
      console.error('4. Ensure that the database name exists or can be created');
    }
    throw error;
  }
};

// Run seeder if this script is executed directly
if (require.main === module) {
  (async () => {
    try {
      await connectToDatabase();
      await seedUsers();
      await disconnectFromDatabase();
      console.log('User seeder completed successfully');
      process.exit(0);
    } catch (error) {
      console.error('User seeder failed:', error);
      // Close database connection if it's open
      if (mongoose.connection.readyState !== 0) {
        await disconnectFromDatabase();
      }
      process.exit(1);
    }
  })();
}

module.exports = {
  seedUsers
};
