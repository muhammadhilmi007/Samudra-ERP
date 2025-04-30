/**
 * Samudra Paket ERP - RBAC Seeder
 * Seeds default roles and permissions for RBAC system
 */

const mongoose = require('mongoose');
const Role = require('../../domain/models/role');
const Permission = require('../../domain/models/permission');
const config = require('../../config/config');

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
    // eslint-disable-next-line no-console
    console.log('Starting RBAC seeding...');

    // Connect to MongoDB if not already connected
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(config.mongodb.uri, config.mongodb.options);
      // eslint-disable-next-line no-console
      console.log('Connected to MongoDB');
    }

    // Generate default permissions
    const defaultPermissions = generateDefaultPermissions();

    // Create permissions if they don't exist
    const permissionPromises = defaultPermissions.map(async (permissionData) => {
      const existingPermission = await Permission.findOne({ code: permissionData.code });
      if (!existingPermission) {
        const permission = new Permission(permissionData);
        await permission.save();
        // eslint-disable-next-line no-console
        console.log(`Created permission: ${permissionData.code}`);
        return permission;
      }
      return existingPermission;
    });

    const permissions = await Promise.all(permissionPromises);
    // eslint-disable-next-line no-console
    console.log(`Total permissions: ${permissions.length}`);

    // Create roles if they don't exist
    const rolePromises = DEFAULT_ROLES.map(async (roleData) => {
      const existingRole = await Role.findOne({ name: roleData.name });
      if (!existingRole) {
        const role = new Role(roleData);
        await role.save();
        // eslint-disable-next-line no-console
        console.log(`Created role: ${roleData.name}`);
        return role;
      }
      return existingRole;
    });

    const roles = await Promise.all(rolePromises);
    // eslint-disable-next-line no-console
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
        // eslint-disable-next-line no-param-reassign
        role.permissions = permissionIds;
        await role.save();
        // eslint-disable-next-line no-console
        console.log(`Assigned ${permissionIds.length} permissions to ${roleName}`);
      }
      return role;
    }));

    // eslint-disable-next-line no-console
    console.log('RBAC seeding completed successfully');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error seeding RBAC:', error);
  }
};

// Export for use in other scripts
module.exports = {
  seedRBAC,
};

// Run directly if this script is executed directly
if (require.main === module) {
  seedRBAC()
    .then(() => {
      // eslint-disable-next-line no-console
      console.log('RBAC seeding script completed');
      process.exit(0);
    })
    .catch((error) => {
      // eslint-disable-next-line no-console
      console.error('RBAC seeding script failed:', error);
      process.exit(1);
    });
}
