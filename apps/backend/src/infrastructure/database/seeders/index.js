/**
 * Samudra Paket ERP - Main Seeder
 * Orchestrates all seeders in the correct order
 */

const { connectToDatabase, disconnectFromDatabase } = require('./config');

// Import all module seeders
const rbacSeeder = require('./modules/rbacSeeder');
const userSeeder = require('./modules/userSeeder');
const branchSeeder = require('./modules/branchSeeder');
const customerSeeder = require('./modules/customerSeeder');
const employeeSeeder = require('./modules/employeeSeeder');
const forwarderSeeder = require('./modules/forwarderSeeder');
const serviceAreaSeeder = require('./modules/serviceAreaSeeder');
const pricingRuleSeeder = require('./modules/pricingRuleSeeder');
const warehouseSeeder = require('./modules/warehouseSeeder');
const notificationSeeder = require('./modules/notificationSeeder');

/**
 * Run all seeders in the correct order
 */
const runAllSeeders = async () => {
  try {
    console.log('Starting all seeders...');
    
    // Connect to database
    await connectToDatabase();
    
    // Run seeders in the correct order
    // 1. First RBAC (roles and permissions)
    console.log('\n=== Running RBAC Seeder ===');
    await rbacSeeder.seedRBAC();
    
    // 2. Then users
    console.log('\n=== Running User Seeder ===');
    await userSeeder.seedUsers();
    
    // 3. Then branches
    console.log('\n=== Running Branch Seeder ===');
    await branchSeeder.seedBranches();
    
    // 4. Then customers
    console.log('\n=== Running Customer Seeder ===');
    await customerSeeder.seedCustomers();
    
    // 5. Then employees
    console.log('\n=== Running Employee Seeder ===');
    await employeeSeeder.seedEmployees();
    
    // 6. Then forwarders (areas, partners, rates)
    console.log('\n=== Running Forwarder Seeder ===');
    await forwarderSeeder.seedForwarders();
    
    // 7. Then service areas
    console.log('\n=== Running Service Area Seeder ===');
    await serviceAreaSeeder.seedServiceAreas();
    
    // 8. Then pricing rules
    console.log('\n=== Running Pricing Rule Seeder ===');
    await pricingRuleSeeder.seedPricingRules();
    
    // 9. Then warehouse items
    console.log('\n=== Running Warehouse Seeder ===');
    await warehouseSeeder.seedWarehouseItems();
    
    // 10. Finally notification templates
    console.log('\n=== Running Notification Seeder ===');
    await notificationSeeder.seedNotifications();
    
    console.log('\nAll seeders completed successfully!');
    
  } catch (error) {
    console.error('Error running seeders:', error);
  } finally {
    // Disconnect from database
    await disconnectFromDatabase();
  }
};

/**
 * Run a specific seeder by name
 * @param {string} seederName - Name of the seeder to run
 */
const runSeeder = async (seederName) => {
  try {
    console.log(`Starting ${seederName} seeder...`);
    
    // Connect to database
    await connectToDatabase();
    
    // Run the specified seeder
    switch (seederName.toLowerCase()) {
      case 'rbac':
        await rbacSeeder.seedRBAC();
        break;
      case 'users':
        await userSeeder.seedUsers();
        break;
      case 'branches':
        await branchSeeder.seedBranches();
        break;
      case 'customers':
        await customerSeeder.seedCustomers();
        break;
      case 'employees':
        await employeeSeeder.seedEmployees();
        break;
      case 'forwarders':
        await forwarderSeeder.seedForwarders();
        break;
      case 'serviceareas':
        await serviceAreaSeeder.seedServiceAreas();
        break;
      case 'pricingrules':
        await pricingRuleSeeder.seedPricingRules();
        break;
      case 'warehouse':
        await warehouseSeeder.seedWarehouseItems();
        break;
      case 'notifications':
        await notificationSeeder.seedNotifications();
        break;
      default:
        console.error(`Unknown seeder: ${seederName}`);
        break;
    }
    
    console.log(`${seederName} seeder completed successfully!`);
    
  } catch (error) {
    console.error(`Error running ${seederName} seeder:`, error);
  } finally {
    // Disconnect from database
    await disconnectFromDatabase();
  }
};

// Run directly if this script is executed directly
if (require.main === module) {
  // Check if a specific seeder is specified
  const seederArg = process.argv[2];
  
  if (seederArg) {
    runSeeder(seederArg)
      .then(() => {
        console.log(`${seederArg} seeder script completed`);
        process.exit(0);
      })
      .catch((error) => {
        console.error(`${seederArg} seeder script failed:`, error);
        process.exit(1);
      });
  } else {
    // Run all seeders
    runAllSeeders()
      .then(() => {
        console.log('All seeder scripts completed');
        process.exit(0);
      })
      .catch((error) => {
        console.error('Seeder scripts failed:', error);
        process.exit(1);
      });
  }
}

module.exports = {
  runAllSeeders,
  runSeeder
};
