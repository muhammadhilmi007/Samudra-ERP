/**
 * Samudra Paket ERP - RBAC Initialization Script
 * Initializes the RBAC system by seeding roles and permissions,
 * then migrates existing users to the new RBAC system
 */

const seedRBAC = require('./rbacSeeder');
const migrateUsersToRbac = require('./migrateUsersToRbac');

/**
 * Initialize RBAC system
 * 1. Seed roles and permissions
 * 2. Migrate existing users to the new RBAC system
 */
const initializeRbac = async () => {
  try {
    // eslint-disable-next-line no-console
    console.log('Starting RBAC initialization...');

    // Step 1: Seed roles and permissions
    // eslint-disable-next-line no-console
    console.log('\n=== STEP 1: Seeding roles and permissions ===\n');
    await seedRBAC();

    // Step 2: Migrate existing users to the new RBAC system
    // eslint-disable-next-line no-console
    console.log('\n=== STEP 2: Migrating users to RBAC ===\n');
    await migrateUsersToRbac();

    // eslint-disable-next-line no-console
    console.log('\nRBAC initialization completed successfully');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error initializing RBAC:', error);
    process.exit(1);
  }
};

// Run the initialization if this script is executed directly
if (require.main === module) {
  initializeRbac()
    .then(() => {
      // eslint-disable-next-line no-console
      console.log('RBAC initialization script completed');
      process.exit(0);
    })
    .catch((error) => {
      // eslint-disable-next-line no-console
      console.error('RBAC initialization script failed:', error);
      process.exit(1);
    });
}

module.exports = {
  initializeRbac,
};
