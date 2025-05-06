/**
 * Samudra Paket ERP - RBAC Seeder
 * Seeds default roles and permissions for RBAC system
 */

const mongoose = require('mongoose');
const Role = require('../../../../domain/models/role');
const Permission = require('../../../../domain/models/permission');
const { connectToDatabase, disconnectFromDatabase } = require('../config');

/**
 * Default system modules
 */
const MODULES = [
  'USER',
  'ROLE',
  'PERMISSION',
  'CUSTOMER',
  'PICKUP',
  'SHIPMENT',
  'DELIVERY',
  'TRACKING',
  'BILLING',
  'PAYMENT',
  'REPORT',
  'DASHBOARD',
  'SETTING',
  'NOTIFICATION',
  'AUDIT',
];

/**
 * Default action types
 */
const ACTIONS = ['CREATE', 'READ', 'UPDATE', 'DELETE', 'EXECUTE', 'ALL'];

/**
 * Default system roles
 */
const DEFAULT_ROLES = [
  {
    name: 'ADMIN',
    description: 'System administrator with full access',
    isSystem: true,
  },
  {
    name: 'MANAGER',
    description: 'Manager with access to most features',
    isSystem: true,
  },
  {
    name: 'OPERATOR',
    description: 'Operator with access to operational features',
    isSystem: true,
  },
  {
    name: 'DRIVER',
    description: 'Driver with access to delivery features',
    isSystem: true,
  },
  {
    name: 'CHECKER',
    description: 'Checker with access to pickup and verification features',
    isSystem: true,
  },
  {
    name: 'DEBT_COLLECTOR',
    description: 'Debt collector with access to payment collection features',
    isSystem: true,
  },
  {
    name: 'CUSTOMER',
    description: 'Customer with access to tracking and limited features',
    isSystem: true,
  },
];

/**
 * Generate default permissions for all modules and actions
 * @returns {Array} Array of permission objects
 */
const generateDefaultPermissions = () => {
  const permissions = [];

  // Generate standard permissions (MODULE_ACTION)
  MODULES.forEach((module) => {
    ACTIONS.forEach((action) => {
      if (action !== 'ALL') {
        permissions.push({
          name: `${module} ${action}`,
          code: `${module}_${action}`,
          description: `Permission to ${action.toLowerCase()} ${module.toLowerCase()}`,
          module,
          action,
          isSystem: true,
        });
      }
    });
  });

  // Add special ALL permissions
  MODULES.forEach((module) => {
    permissions.push({
      name: `${module} ALL`,
      code: `${module}_ALL`,
      description: `Full permission to all ${module.toLowerCase()} operations`,
      module,
      action: 'ALL',
      isSystem: true,
    });
  });

  // Add global ALL permission
  permissions.push({
    name: 'ALL PERMISSIONS',
    code: 'ALL',
    description: 'Full access to all system features',
    module: 'SYSTEM',
    action: 'ALL',
    isSystem: true,
  });

  return permissions;
};

/**
 * Role permission mappings
 * Defines which permissions each role should have
 */
const ROLE_PERMISSION_MAPPINGS = {
  ADMIN: ['ALL'], // Admin has all permissions
  MANAGER: [
    'USER_READ',
    'USER_UPDATE',
    'ROLE_READ',
    'PERMISSION_READ',
    'CUSTOMER_ALL',
    'PICKUP_ALL',
    'SHIPMENT_ALL',
    'DELIVERY_ALL',
    'TRACKING_ALL',
    'BILLING_ALL',
    'PAYMENT_ALL',
    'REPORT_ALL',
    'DASHBOARD_ALL',
    'SETTING_READ',
    'NOTIFICATION_ALL',
    'AUDIT_READ',
  ],
  OPERATOR: [
    'CUSTOMER_READ',
    'CUSTOMER_UPDATE',
    'PICKUP_ALL',
    'SHIPMENT_ALL',
    'DELIVERY_READ',
    'TRACKING_READ',
    'BILLING_READ',
    'PAYMENT_READ',
    'REPORT_READ',
    'DASHBOARD_READ',
    'NOTIFICATION_READ',
  ],
  DRIVER: [
    'DELIVERY_READ',
    'DELIVERY_UPDATE',
    'TRACKING_READ',
    'TRACKING_UPDATE',
    'NOTIFICATION_READ',
  ],
  CHECKER: [
    'PICKUP_READ',
    'PICKUP_UPDATE',
    'SHIPMENT_READ',
    'TRACKING_READ',
    'NOTIFICATION_READ',
  ],
  DEBT_COLLECTOR: [
    'CUSTOMER_READ',
    'BILLING_READ',
    'PAYMENT_ALL',
    'NOTIFICATION_READ',
  ],
  CUSTOMER: [
    'TRACKING_READ',
    'BILLING_READ',
    'PAYMENT_CREATE',
    'PAYMENT_READ',
    'NOTIFICATION_READ',
  ],
};

/**
 * Seed roles and permissions
 */
const seedRBAC = async () => {
  try {
    console.log('Starting RBAC seeding...');

    // Connect to MongoDB if not already connected
    if (mongoose.connection.readyState === 0) {
      await connectToDatabase();
    }

    // Generate default permissions
    const defaultPermissions = generateDefaultPermissions();

    // Create permissions if they don't exist
    const permissionPromises = defaultPermissions.map(async (permissionData) => {
      const existingPermission = await Permission.findOne({ code: permissionData.code });
      if (!existingPermission) {
        const permission = new Permission(permissionData);
        await permission.save();
        console.log(`Created permission: ${permissionData.code}`);
        return permission;
      }
      return existingPermission;
    });

    const permissions = await Promise.all(permissionPromises);
    console.log(`Total permissions: ${permissions.length}`);

    // Create roles if they don't exist
    const rolePromises = DEFAULT_ROLES.map(async (roleData) => {
      const existingRole = await Role.findOne({ name: roleData.name });
      if (!existingRole) {
        const role = new Role(roleData);
        await role.save();
        console.log(`Created role: ${roleData.name}`);
        return role;
      }
      return existingRole;
    });

    const roles = await Promise.all(rolePromises);
    console.log(`Total roles: ${roles.length}`);

    // Assign permissions to roles - using Promise.all instead of for...of loop
    await Promise.all(roles.map(async (role) => {
      const roleName = role.name;
      if (ROLE_PERMISSION_MAPPINGS[roleName]) {
        const permissionCodes = ROLE_PERMISSION_MAPPINGS[roleName];
        const permissionIds = permissions
          .filter((p) => permissionCodes.includes(p.code))
          .map((p) => p.id);

        // Update role with permissions
        role.permissions = permissionIds;
        await role.save();
        console.log(`Assigned ${permissionIds.length} permissions to ${roleName}`);
      }
      return role;
    }));

    console.log('RBAC seeding completed successfully');
  } catch (error) {
    console.error('Error seeding RBAC:', error);
    throw error;
  }
};

/**
 * Migrate existing users to the new RBAC system
 */
const migrateUsersToRbac = async () => {
  try {
    console.log('Starting user migration to RBAC...');

    // Connect to MongoDB if not already connected
    if (mongoose.connection.readyState === 0) {
      await connectToDatabase();
    }

    const User = require('../../../../domain/models/user');

    // Get all roles
    const roles = await Role.find({});
    const roleMap = {};

    // Create a map of legacy role names to role IDs
    roles.forEach((role) => {
      roleMap[role.name] = role.id;
    });

    console.log('Role mapping:', roleMap);

    // Get all users
    const users = await User.find({});
    console.log(`Found ${users.length} users to migrate`);

    // Process users in batches to avoid memory issues
    const batchSize = 100;
    const batches = Math.ceil(users.length / batchSize);

    for (let i = 0; i < batches; i += 1) {
      const start = i * batchSize;
      const end = Math.min(start + batchSize, users.length);
      const batch = users.slice(start, end);

      console.log(`Processing batch ${i + 1}/${batches} (${start}-${end})`);

      // Process each user in the batch
      await Promise.all(batch.map(async (user) => {
        // Skip users that already have a role reference
        if (user.role && mongoose.Types.ObjectId.isValid(user.role)) {
          return;
        }

        // Set the legacy role
        const legacyRole = user.role;

        // Find the corresponding role ID
        const roleId = roleMap[legacyRole];

        if (!roleId) {
          console.warn(`No matching role found for user ${user.username} with legacy role ${legacyRole}`);
          return;
        }

        // Update the user with the new role reference and legacy role
        user.legacyRole = legacyRole;
        user.role = roleId;

        // Save the user
        await user.save();
        console.log(`Migrated user ${user.username}: ${legacyRole} -> ${roleId}`);
      }));
    }

    console.log('User migration completed successfully');
  } catch (error) {
    console.error('Error migrating users:', error);
    throw error;
  }
};

// Run directly if this script is executed directly
if (require.main === module) {
  (async () => {
    try {
      await connectToDatabase();
      await seedRBAC();
      
      // Ask if user wants to migrate users
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      readline.question('Do you want to migrate users to the new RBAC system? (y/n): ', async (answer) => {
        if (answer.toLowerCase() === 'y') {
          await migrateUsersToRbac();
        }
        
        readline.close();
        await disconnectFromDatabase();
        process.exit(0);
      });
    } catch (error) {
      console.error('RBAC seeder script failed:', error);
      process.exit(1);
    }
  })();
}

module.exports = {
  seedRBAC,
  migrateUsersToRbac
};
