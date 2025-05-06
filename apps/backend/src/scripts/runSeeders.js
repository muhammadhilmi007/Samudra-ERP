/**
 * Samudra Paket ERP - Run Seeders Script
 * Script to run database seeders
 */

// Set NODE_ENV to development if not already set
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const { runSeeders } = require('../infrastructure/database/seeds/seeder');

/**
 * Run the seeders
 */
const run = async () => {
  try {
    console.log('=== Samudra Paket ERP - Database Seeder ===');
    console.log(`Environment: ${process.env.NODE_ENV}`);
    console.log('Starting seeder process...\n');
    
    await runSeeders();
    
    console.log('\n=== Seeding completed successfully ===');
    process.exit(0);
  } catch (error) {
    console.error('\n=== Seeding failed ===');
    console.error(error);
    process.exit(1);
  }
};

// Run the script
run();
