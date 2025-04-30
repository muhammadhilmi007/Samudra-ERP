/**
 * Samudra Paket ERP - User Migration to RBAC
 * Script to migrate existing users to the new RBAC system
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../../domain/models/user');
const Role = require('../../domain/models/role');

// MongoDB connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/samudra_paket');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

/**
 * Migrate users to the new RBAC system
 * This will:
 * 1. Map legacy roles to new roles
 * 2. Update users with the appropriate role and permissions
 * 3. Create an audit log of the migration
 */
const migrateUsersToRbac = async () => {
  try {
    const conn = await connectDB();
    
    console.log('Starting user migration to RBAC...');
    
    // Get all roles with populated permissions
    const roles = await Role.find({}).populate('permissions');
    if (!roles.length) {
      throw new Error('No roles found. Please run the rbacSeeder.js script first.');
    }
    
    console.log(`Found ${roles.length} roles`);
    
    // Create a map of role names to role objects
    const roleMap = {};
    roles.forEach((role) => {
      roleMap[role.name] = role;
    });
    
    // Create a map of legacy roles to new role names
    const legacyRoleMap = {
      'ADMIN': 'SUPER_ADMIN',
      'MANAGER': 'MANAGER',
      'OPERATOR': 'OPERATOR',
      'DRIVER': 'DRIVER',
      'CHECKER': 'CHECKER',
      'DEBT_COLLECTOR': 'DEBT_COLLECTOR',
      'CUSTOMER': 'CUSTOMER',
    };
    
    // Get all users
    const users = await User.find({});
    console.log(`Found ${users.length} users to migrate`);
    
    // Migration stats
    const stats = {
      total: users.length,
      migrated: 0,
      skipped: 0,
      errors: 0,
      details: [],
    };
    
    // Migrate each user
    for (const user of users) {
      try {
        const originalState = {
          username: user.username,
          legacyRole: user.legacyRole,
          role: user.role,
          permissions: [...user.permissions],
        };
        
        let migrated = false;
        
        // Case 1: User already has a role in the new system
        if (user.role) {
          const roleId = user.role.toString();
          const role = await Role.findById(roleId).populate('permissions');
          
          if (role) {
            // Update permissions based on the role
            user.permissions = role.permissions.map((perm) => perm.code);
            migrated = true;
            console.log(`User ${user.username} already has role ${role.name}, updated permissions`);
          }
        }
        
        // Case 2: User has a legacy role but no new role
        if (!migrated && user.legacyRole) {
          const newRoleName = legacyRoleMap[user.legacyRole];
          
          if (newRoleName && roleMap[newRoleName]) {
            const newRole = roleMap[newRoleName];
            user.role = newRole._id;
            user.permissions = newRole.permissions.map((perm) => perm.code);
            migrated = true;
            console.log(`Migrated user ${user.username} from legacy role ${user.legacyRole} to new role ${newRoleName}`);
          }
        }
        
        // Case 3: User has no role at all
        if (!migrated && !user.role && !user.legacyRole) {
          // Assign a default role (e.g., CUSTOMER)
          const defaultRole = roleMap['CUSTOMER'];
          if (defaultRole) {
            user.role = defaultRole._id;
            user.permissions = defaultRole.permissions.map((perm) => perm.code);
            migrated = true;
            console.log(`Assigned default role CUSTOMER to user ${user.username} with no previous role`);
          }
        }
        
        // Save the updated user
        if (migrated) {
          await user.save();
          stats.migrated++;
          stats.details.push({
            username: user.username,
            status: 'migrated',
            from: originalState,
            to: {
              role: user.role,
              permissions: user.permissions,
            },
          });
        } else {
          stats.skipped++;
          stats.details.push({
            username: user.username,
            status: 'skipped',
            reason: 'No applicable migration path',
          });
        }
      } catch (error) {
        console.error(`Error migrating user ${user.username}:`, error);
        stats.errors++;
        stats.details.push({
          username: user.username,
          status: 'error',
          error: error.message,
        });
      }
    }
    
    // Print migration summary
    console.log('\nMigration Summary:');
    console.log(`Total users: ${stats.total}`);
    console.log(`Successfully migrated: ${stats.migrated}`);
    console.log(`Skipped: ${stats.skipped}`);
    console.log(`Errors: ${stats.errors}`);
    
    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    
    return { success: true, stats };
  } catch (error) {
    console.error('Error during user migration:', error);
    
    // Close the connection on error
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log('MongoDB connection closed');
    }
    
    return { success: false, error };
  }
};

// Execute the migration if this script is run directly
if (require.main === module) {
  migrateUsersToRbac()
    .then((result) => {
      if (result.success) {
        console.log('User migration to RBAC completed successfully!');
        process.exit(0);
      } else {
        console.error('User migration to RBAC failed:', result.error);
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('Unhandled error during user migration:', error);
      process.exit(1);
    });
}

module.exports = migrateUsersToRbac;
