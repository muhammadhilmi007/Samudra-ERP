/**
 * Samudra Paket ERP - User Seeder
 * Seeds the database with initial users for testing
 */

// Set NODE_ENV to development if not already set
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const mongoose = require('mongoose');
const User = require('../../../domain/models/user');
const Role = require('../../../domain/models/role');
const { connectToDatabase, disconnectFromDatabase } = require('../connection');

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
    // eslint-disable-next-line no-console
    console.log('Starting user seeder...');
    // eslint-disable-next-line no-console
    console.log(`MongoDB URI: ${process.env.MONGODB_URI || 'Not set (will use in-memory DB)'}`);

    // Connect to database
    // eslint-disable-next-line no-console
    console.log('Connecting to MongoDB...');
    await connectToDatabase();

    // Check if we're connected
    if (mongoose.connection.readyState !== 1) {
      // eslint-disable-next-line max-len
      throw new Error(`Failed to connect to MongoDB. Connection state: ${['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState]}`);
    }

    // eslint-disable-next-line no-console
    console.log('Connected to MongoDB successfully');
    // eslint-disable-next-line no-console
    console.log('Database name:', mongoose.connection.name);

    // Delete existing users
    // eslint-disable-next-line no-console
    console.log('Deleting existing users...');
    const deleteResult = await User.deleteMany({});
    // eslint-disable-next-line no-console
    console.log(`Deleted ${deleteResult.deletedCount} existing users`);

    // Find roles first
    // eslint-disable-next-line no-console
    console.log('Finding roles...');
    const roles = await Role.find({});
    const roleMap = {};

    // Create a map of role names to role IDs
    roles.forEach((role) => {
      roleMap[role.name] = role.id;
    });

    // eslint-disable-next-line no-console
    console.log('Role mapping:', roleMap);

    // Check if roles exist, if not, create them first
    if (Object.keys(roleMap).length === 0) {
      // eslint-disable-next-line no-console
      console.log('No roles found. Running RBAC seeder first...');

      // Import and run the RBAC seeder
      // eslint-disable-next-line global-require
      const { seedRBAC } = require('../../seeds/rbacSeeder');
      await seedRBAC();

      // Get roles again
      // eslint-disable-next-line no-console
      console.log('Finding roles again after seeding...');
      const freshRoles = await Role.find({});

      // Update role map
      freshRoles.forEach((role) => {
        roleMap[role.name] = role.id;
      });

      // eslint-disable-next-line no-console
      console.log('Updated role mapping:', roleMap);
    }

    // Prepare users with proper role references
    const users = userTemplates.map((template) => {
      const user = { ...template };
      // Set role reference if it exists in the database
      if (roleMap[template.roleName]) {
        user.role = roleMap[template.roleName];
      } else {
        // eslint-disable-next-line no-console, max-len
        console.warn(`Warning: Role '${template.roleName}' not found in database. User '${template.username}' will not be created.`);
        return null;
      }
      // Remove roleName as it's not part of the schema
      delete user.roleName;
      return user;
    }).filter(Boolean); // Remove null entries

    // Create new users
    // eslint-disable-next-line no-console
    console.log('Creating new users...');
    const createdUsers = await User.create(users);
    // eslint-disable-next-line no-console
    console.log(`Created ${createdUsers.length} users`);

    // Log created users (without passwords)
    createdUsers.forEach((user) => {
      // eslint-disable-next-line no-console
      console.log(`- ${user.username} (${user.legacyRole}): ${user.id}`);
    });

    // eslint-disable-next-line no-console
    console.log('User seeding completed successfully');

    // Close database connection
    // eslint-disable-next-line no-console
    console.log('Closing database connection...');
    await disconnectFromDatabase();
    // eslint-disable-next-line no-console
    console.log('Database connection closed');

    process.exit(0);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error seeding users:', error.message);
    if (error.name === 'MongooseServerSelectionError') {
      // eslint-disable-next-line no-console
      console.error('\nMongoDB connection error details:');
      // eslint-disable-next-line no-console
      console.error('1. Make sure MongoDB is running on your machine');
      // eslint-disable-next-line no-console
      console.error('2. Check if the MongoDB URI in .env file is correct');
      // eslint-disable-next-line no-console
      console.error('3. Verify that the username and password are correct');
      // eslint-disable-next-line no-console
      console.error('4. Ensure that the database name exists or can be created');
      // eslint-disable-next-line no-console
      console.error('\nFor MongoDB Compass users:');
      // eslint-disable-next-line no-console
      console.error('- Check that the connection string format is correct');
      // eslint-disable-next-line no-console
      console.error('- Try using the connection string from MongoDB Compass');
      // eslint-disable-next-line no-console
      console.error('- Example format: mongodb://localhost:27017/samudra_paket');
    }

    // Close database connection if it's open
    try {
      if (mongoose.connection.readyState !== 0) {
        // eslint-disable-next-line no-console
        console.log('Closing database connection...');
        await disconnectFromDatabase();
        // eslint-disable-next-line no-console
        console.log('Database connection closed');
      }
    } catch (disconnectError) {
      // eslint-disable-next-line no-console
      console.error('Error closing database connection:', disconnectError.message);
    }

    process.exit(1);
  }
};

// Run seeder
seedUsers();
