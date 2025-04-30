/**
 * Samudra Paket ERP - User Migration to RBAC
 * Migrates existing users to the new RBAC system
 */

const mongoose = require('mongoose');
const User = require('../../domain/models/user');
const Role = require('../../domain/models/role');
const config = require('../../config/config');

/**
 * Migrates existing users to the new RBAC system
 * - Copies the legacy role to the new legacyRole field
 * - Sets the appropriate role reference based on the legacy role
 */
const migrateUsersToRbac = async () => {
  try {
    // eslint-disable-next-line no-console
    console.log('Starting user migration to RBAC...');

    // Connect to MongoDB if not already connected
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(config.mongodb.uri, config.mongodb.options);
      // eslint-disable-next-line no-console
      console.log('Connected to MongoDB');
    }

    // Get all roles
    const roles = await Role.find({});
    const roleMap = {};

    // Create a map of legacy role names to role IDs
    roles.forEach((role) => {
      roleMap[role.name] = role.id;
    });

    // eslint-disable-next-line no-console
    console.log('Role mapping:', roleMap);

    // Get all users
    const users = await User.find({});
    // eslint-disable-next-line no-console
    console.log(`Found ${users.length} users to migrate`);

    // Process users in batches to avoid memory issues
    const batchSize = 100;
    const batches = Math.ceil(users.length / batchSize);

    for (let i = 0; i < batches; i += 1) {
      const start = i * batchSize;
      const end = Math.min(start + batchSize, users.length);
      const batch = users.slice(start, end);

      // eslint-disable-next-line no-console
      console.log(`Processing batch ${i + 1}/${batches} (${start}-${end})`);

      // Process each user in the batch
      // eslint-disable-next-line no-await-in-loop
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
          // eslint-disable-next-line no-console
          console.warn(`No matching role found for user ${user.username} with legacy role ${legacyRole}`);
          return;
        }

        // Update the user with the new role reference and legacy role
        // eslint-disable-next-line no-param-reassign
        user.legacyRole = legacyRole;
        // eslint-disable-next-line no-param-reassign
        user.role = roleId;

        // Save the user
        // eslint-disable-next-line no-await-in-loop
        await user.save();
        // eslint-disable-next-line no-console
        console.log(`Migrated user ${user.username}: ${legacyRole} -> ${roleId}`);
      }));
    }

    // eslint-disable-next-line no-console
    console.log('User migration completed successfully');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error migrating users:', error);
  }
};

// Export for use in other scripts
module.exports = {
  migrateUsersToRbac,
};

// Run directly if this script is executed directly
if (require.main === module) {
  migrateUsersToRbac()
    .then(() => {
      // eslint-disable-next-line no-console
      console.log('User migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      // eslint-disable-next-line no-console
      console.error('User migration script failed:', error);
      process.exit(1);
    });
}
