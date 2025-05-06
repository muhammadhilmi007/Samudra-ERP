/**
 * Samudra Paket ERP - Run All Seeders
 * Script to run all database seeders in the correct order
 */

const { runAllSeeders, runSeeder } = require('../src/infrastructure/database/seeders');

// Check if a specific seeder is specified
const seederArg = process.argv[2];

// Run seeders
if (seederArg) {
  console.log(`Running ${seederArg} seeder...`);
  runSeeder(seederArg)
    .then(() => {
      console.log(`${seederArg} seeder completed successfully`);
      process.exit(0);
    })
    .catch((error) => {
      console.error(`Error running ${seederArg} seeder:`, error);
      process.exit(1);
    });
} else {
  console.log('Running all seeders...');
  runAllSeeders()
    .then(() => {
      console.log('All seeders completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error running seeders:', error);
      process.exit(1);
    });
}
