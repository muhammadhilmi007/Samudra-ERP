/**
 * Samudra Paket ERP - RBAC Seeder
 * Script to initialize default roles and permissions for the RBAC system
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Role = require('../../domain/models/role');
const Permission = require('../../domain/models/permission');
const User = require('../../domain/models/user');

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

// Define system permissions by module
const permissionDefinitions = [
  // User management permissions
  { name: 'USER CREATE', code: 'USER_CREATE', module: 'USER', action: 'CREATE', description: 'Create users' },
  { name: 'USER READ', code: 'USER_READ', module: 'USER', action: 'READ', description: 'View users' },
  { name: 'USER UPDATE', code: 'USER_UPDATE', module: 'USER', action: 'UPDATE', description: 'Update users' },
  { name: 'USER DELETE', code: 'USER_DELETE', module: 'USER', action: 'DELETE', description: 'Delete users' },
  
  // Role management permissions
  { name: 'ROLE CREATE', code: 'ROLE_CREATE', module: 'ROLE', action: 'CREATE', description: 'Create roles' },
  { name: 'ROLE READ', code: 'ROLE_READ', module: 'ROLE', action: 'READ', description: 'View roles' },
  { name: 'ROLE UPDATE', code: 'ROLE_UPDATE', module: 'ROLE', action: 'UPDATE', description: 'Update roles' },
  { name: 'ROLE DELETE', code: 'ROLE_DELETE', module: 'ROLE', action: 'DELETE', description: 'Delete roles' },
  
  // Permission management permissions
  { name: 'PERMISSION CREATE', code: 'PERMISSION_CREATE', module: 'PERMISSION', action: 'CREATE', description: 'Create permissions' },
  { name: 'PERMISSION READ', code: 'PERMISSION_READ', module: 'PERMISSION', action: 'READ', description: 'View permissions' },
  { name: 'PERMISSION UPDATE', code: 'PERMISSION_UPDATE', module: 'PERMISSION', action: 'UPDATE', description: 'Update permissions' },
  { name: 'PERMISSION DELETE', code: 'PERMISSION_DELETE', module: 'PERMISSION', action: 'DELETE', description: 'Delete permissions' },
  
  // Branch management permissions
  { name: 'BRANCH CREATE', code: 'BRANCH_CREATE', module: 'BRANCH', action: 'CREATE', description: 'Create branches' },
  { name: 'BRANCH READ', code: 'BRANCH_READ', module: 'BRANCH', action: 'READ', description: 'View branches' },
  { name: 'BRANCH UPDATE', code: 'BRANCH_UPDATE', module: 'BRANCH', action: 'UPDATE', description: 'Update branches' },
  { name: 'BRANCH DELETE', code: 'BRANCH_DELETE', module: 'BRANCH', action: 'DELETE', description: 'Delete branches' },
  
  // Pickup management permissions
  { name: 'PICKUP CREATE', code: 'PICKUP_CREATE', module: 'PICKUP', action: 'CREATE', description: 'Create pickup requests' },
  { name: 'PICKUP READ', code: 'PICKUP_READ', module: 'PICKUP', action: 'READ', description: 'View pickup requests' },
  { name: 'PICKUP UPDATE', code: 'PICKUP_UPDATE', module: 'PICKUP', action: 'UPDATE', description: 'Update pickup requests' },
  { name: 'PICKUP DELETE', code: 'PICKUP_DELETE', module: 'PICKUP', action: 'DELETE', description: 'Delete pickup requests' },
  { name: 'PICKUP ASSIGN', code: 'PICKUP_ASSIGN', module: 'PICKUP', action: 'EXECUTE', description: 'Assign pickup requests' },
  
  // Shipment management permissions
  { name: 'SHIPMENT CREATE', code: 'SHIPMENT_CREATE', module: 'SHIPMENT', action: 'CREATE', description: 'Create shipments' },
  { name: 'SHIPMENT READ', code: 'SHIPMENT_READ', module: 'SHIPMENT', action: 'READ', description: 'View shipments' },
  { name: 'SHIPMENT UPDATE', code: 'SHIPMENT_UPDATE', module: 'SHIPMENT', action: 'UPDATE', description: 'Update shipments' },
  { name: 'SHIPMENT DELETE', code: 'SHIPMENT_DELETE', module: 'SHIPMENT', action: 'DELETE', description: 'Delete shipments' },
  { name: 'SHIPMENT STATUS', code: 'SHIPMENT_STATUS', module: 'SHIPMENT', action: 'EXECUTE', description: 'Update shipment status' },
  
  // Delivery management permissions
  { name: 'DELIVERY CREATE', code: 'DELIVERY_CREATE', module: 'DELIVERY', action: 'CREATE', description: 'Create deliveries' },
  { name: 'DELIVERY READ', code: 'DELIVERY_READ', module: 'DELIVERY', action: 'READ', description: 'View deliveries' },
  { name: 'DELIVERY UPDATE', code: 'DELIVERY_UPDATE', module: 'DELIVERY', action: 'UPDATE', description: 'Update deliveries' },
  { name: 'DELIVERY DELETE', code: 'DELIVERY_DELETE', module: 'DELIVERY', action: 'DELETE', description: 'Delete deliveries' },
  { name: 'DELIVERY COMPLETE', code: 'DELIVERY_COMPLETE', module: 'DELIVERY', action: 'EXECUTE', description: 'Complete deliveries' },
  
  // Payment management permissions
  { name: 'PAYMENT CREATE', code: 'PAYMENT_CREATE', module: 'PAYMENT', action: 'CREATE', description: 'Create payments' },
  { name: 'PAYMENT READ', code: 'PAYMENT_READ', module: 'PAYMENT', action: 'READ', description: 'View payments' },
  { name: 'PAYMENT UPDATE', code: 'PAYMENT_UPDATE', module: 'PAYMENT', action: 'UPDATE', description: 'Update payments' },
  { name: 'PAYMENT DELETE', code: 'PAYMENT_DELETE', module: 'PAYMENT', action: 'DELETE', description: 'Delete payments' },
  
  // Report management permissions
  { name: 'REPORT READ', code: 'REPORT_READ', module: 'REPORT', action: 'READ', description: 'View reports' },
  { name: 'REPORT EXPORT', code: 'REPORT_EXPORT', module: 'REPORT', action: 'EXECUTE', description: 'Export reports' },
  
  // Special permissions
  { name: 'ALL PERMISSIONS', code: 'ALL', module: 'SYSTEM', action: 'ALL', description: 'All permissions (superuser)' },
];

// Define system roles with their permissions
const roleDefinitions = [
  {
    name: 'SUPER_ADMIN',
    description: 'Super Administrator with all permissions',
    permissions: ['ALL'], // Special permission that grants access to everything
    isSystem: true,
  },
  {
    name: 'ADMIN',
    description: 'Administrator with access to administrative functions',
    permissions: [
      'USER_READ', 'USER_CREATE', 'USER_UPDATE', 'USER_DELETE',
      'ROLE_READ', 'ROLE_CREATE', 'ROLE_UPDATE', 'ROLE_DELETE',
      'PERMISSION_READ', 'PERMISSION_CREATE', 'PERMISSION_UPDATE', 'PERMISSION_DELETE',
      'BRANCH_READ', 'BRANCH_CREATE', 'BRANCH_UPDATE', 'BRANCH_DELETE',
      'PICKUP_READ', 'PICKUP_CREATE', 'PICKUP_UPDATE', 'PICKUP_DELETE', 'PICKUP_ASSIGN',
      'SHIPMENT_READ', 'SHIPMENT_CREATE', 'SHIPMENT_UPDATE', 'SHIPMENT_DELETE', 'SHIPMENT_STATUS',
      'DELIVERY_READ', 'DELIVERY_CREATE', 'DELIVERY_UPDATE', 'DELIVERY_DELETE', 'DELIVERY_COMPLETE',
      'PAYMENT_READ', 'PAYMENT_CREATE', 'PAYMENT_UPDATE', 'PAYMENT_DELETE',
      'REPORT_READ', 'REPORT_EXPORT',
    ],
    isSystem: true,
  },
  {
    name: 'MANAGER',
    description: 'Branch Manager with access to branch operations',
    permissions: [
      'USER_READ',
      'ROLE_READ',
      'PERMISSION_READ',
      'BRANCH_READ',
      'PICKUP_READ', 'PICKUP_CREATE', 'PICKUP_UPDATE', 'PICKUP_ASSIGN',
      'SHIPMENT_READ', 'SHIPMENT_CREATE', 'SHIPMENT_UPDATE', 'SHIPMENT_STATUS',
      'DELIVERY_READ', 'DELIVERY_CREATE', 'DELIVERY_UPDATE', 'DELIVERY_COMPLETE',
      'PAYMENT_READ', 'PAYMENT_CREATE', 'PAYMENT_UPDATE',
      'REPORT_READ', 'REPORT_EXPORT',
    ],
    isSystem: true,
  },
  {
    name: 'OPERATOR',
    description: 'Operator with access to daily operations',
    permissions: [
      'PICKUP_READ', 'PICKUP_CREATE', 'PICKUP_UPDATE', 'PICKUP_ASSIGN',
      'SHIPMENT_READ', 'SHIPMENT_CREATE', 'SHIPMENT_UPDATE', 'SHIPMENT_STATUS',
      'DELIVERY_READ', 'DELIVERY_CREATE', 'DELIVERY_UPDATE',
      'PAYMENT_READ', 'PAYMENT_CREATE',
      'REPORT_READ',
    ],
    isSystem: true,
  },
  {
    name: 'DRIVER',
    description: 'Driver with access to delivery operations',
    permissions: [
      'PICKUP_READ',
      'SHIPMENT_READ',
      'DELIVERY_READ', 'DELIVERY_UPDATE', 'DELIVERY_COMPLETE',
    ],
    isSystem: true,
  },
  {
    name: 'CHECKER',
    description: 'Checker with access to shipment verification',
    permissions: [
      'PICKUP_READ',
      'SHIPMENT_READ', 'SHIPMENT_UPDATE', 'SHIPMENT_STATUS',
    ],
    isSystem: true,
  },
  {
    name: 'DEBT_COLLECTOR',
    description: 'Debt Collector with access to payment collection',
    permissions: [
      'PAYMENT_READ', 'PAYMENT_CREATE', 'PAYMENT_UPDATE',
    ],
    isSystem: true,
  },
  {
    name: 'CUSTOMER',
    description: 'Customer with access to their own shipments',
    permissions: [
      'PICKUP_READ', 'PICKUP_CREATE',
      'SHIPMENT_READ',
      'PAYMENT_READ',
    ],
    isSystem: true,
  },
];

// Seed permissions
const seedPermissions = async () => {
  console.log('Seeding permissions...');
  const permissionPromises = permissionDefinitions.map(async (permDef) => {
    try {
      // Check if permission already exists
      const existingPermission = await Permission.findOne({ code: permDef.code });
      if (existingPermission) {
        console.log(`Permission ${permDef.code} already exists, skipping...`);
        return existingPermission;
      }

      // Create new permission
      const permission = new Permission({
        name: permDef.name,
        code: permDef.code,
        description: permDef.description,
        module: permDef.module,
        action: permDef.action,
        isSystem: true,
      });

      await permission.save();
      console.log(`Created permission: ${permission.code}`);
      return permission;
    } catch (error) {
      console.error(`Error creating permission ${permDef.code}:`, error);
      throw error;
    }
  });

  return Promise.all(permissionPromises);
};

// Seed roles
const seedRoles = async () => {
  console.log('Seeding roles...');
  const permissions = await Permission.find({});
  const permissionMap = {};
  
  // Create a map of permission codes to IDs for easier lookup
  permissions.forEach((permission) => {
    permissionMap[permission.code] = permission._id;
  });

  const rolePromises = roleDefinitions.map(async (roleDef) => {
    try {
      // Check if role already exists
      const existingRole = await Role.findOne({ name: roleDef.name });
      if (existingRole) {
        console.log(`Role ${roleDef.name} already exists, updating permissions...`);
        
        // Update permissions
        const permissionIds = roleDef.permissions.map((code) => permissionMap[code]);
        existingRole.permissions = permissionIds;
        await existingRole.save();
        
        console.log(`Updated role: ${existingRole.name}`);
        return existingRole;
      }

      // Map permission codes to IDs
      const permissionIds = roleDef.permissions.map((code) => permissionMap[code]);

      // Create new role
      const role = new Role({
        name: roleDef.name,
        description: roleDef.description,
        permissions: permissionIds,
        isSystem: roleDef.isSystem,
      });

      await role.save();
      console.log(`Created role: ${role.name}`);
      return role;
    } catch (error) {
      console.error(`Error creating role ${roleDef.name}:`, error);
      throw error;
    }
  });

  return Promise.all(rolePromises);
};

// Update existing users with permissions
const updateUsersWithPermissions = async () => {
  console.log('Updating users with permissions...');
  
  try {
    // Get all users
    const users = await User.find({});
    console.log(`Found ${users.length} users to update`);
    
    // Get all roles with populated permissions
    const roles = await Role.find({}).populate('permissions');
    
    // Create a map of role IDs to permission codes
    const rolePermissionMap = {};
    roles.forEach((role) => {
      rolePermissionMap[role._id.toString()] = role.permissions.map((perm) => perm.code);
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
    
    // Update each user
    const updatePromises = users.map(async (user) => {
      try {
        // If user has a role, use its permissions
        if (user.role) {
          const roleId = user.role.toString();
          if (rolePermissionMap[roleId]) {
            user.permissions = rolePermissionMap[roleId];
          }
        } 
        // If user has a legacy role but no new role, map to the corresponding new role
        else if (user.legacyRole && !user.role) {
          const newRoleName = legacyRoleMap[user.legacyRole];
          if (newRoleName) {
            const newRole = roles.find((r) => r.name === newRoleName);
            if (newRole) {
              user.role = newRole._id;
              user.permissions = rolePermissionMap[newRole._id.toString()];
              console.log(`Mapped user ${user.username} from legacy role ${user.legacyRole} to new role ${newRoleName}`);
            }
          }
        }
        
        await user.save();
        console.log(`Updated user: ${user.username}`);
        return user;
      } catch (error) {
        console.error(`Error updating user ${user.username}:`, error);
        throw error;
      }
    });
    
    return Promise.all(updatePromises);
  } catch (error) {
    console.error('Error updating users with permissions:', error);
    throw error;
  }
};

// Main seeder function
const seedRBAC = async () => {
  try {
    const conn = await connectDB();
    
    console.log('Starting RBAC seeding process...');
    
    // Seed permissions first
    await seedPermissions();
    
    // Then seed roles with permissions
    await seedRoles();
    
    // Update existing users with permissions
    await updateUsersWithPermissions();
    
    console.log('RBAC seeding completed successfully!');
    
    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    
    return { success: true };
  } catch (error) {
    console.error('Error seeding RBAC:', error);
    
    // Close the connection on error
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log('MongoDB connection closed');
    }
    
    return { success: false, error };
  }
};

// Execute the seeder if this script is run directly
if (require.main === module) {
  seedRBAC()
    .then((result) => {
      if (result.success) {
        console.log('RBAC seeding completed successfully!');
        process.exit(0);
      } else {
        console.error('RBAC seeding failed:', result.error);
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('Unhandled error during RBAC seeding:', error);
      process.exit(1);
    });
}

module.exports = seedRBAC;
