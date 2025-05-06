/**
 * Samudra Paket ERP - Pricing Rule Seeder
 * Seeds the database with pricing rules for testing
 */

const mongoose = require('mongoose');
const PricingRule = require('../../../../domain/models/pricingRule');
const { connectToDatabase, disconnectFromDatabase } = require('../config');

/**
 * Initial pricing rules data
 */
const pricingRuleTemplates = [
  // Regular pricing rules
  {
    code: 'REG-STD',
    name: 'Regular Standard',
    type: 'STANDARD',
    serviceType: 'REGULAR',
    basePrice: 10000,
    weightIncrement: 1,
    pricePerKg: 2500,
    minWeight: 1,
    maxWeight: 30,
    minDistance: 0,
    maxDistance: 999999,
    effectiveDate: new Date('2023-01-01'),
    expiryDate: new Date('2025-12-31'),
    status: 'active',
    notes: 'Standard pricing for regular shipments'
  },
  {
    code: 'REG-BULK',
    name: 'Regular Bulk',
    type: 'BULK',
    serviceType: 'REGULAR',
    basePrice: 8000,
    weightIncrement: 1,
    pricePerKg: 2000,
    minWeight: 10,
    maxWeight: 100,
    minDistance: 0,
    maxDistance: 999999,
    effectiveDate: new Date('2023-01-01'),
    expiryDate: new Date('2025-12-31'),
    status: 'active',
    notes: 'Bulk pricing for regular shipments (10kg or more)'
  },
  
  // Express pricing rules
  {
    code: 'EXP-STD',
    name: 'Express Standard',
    type: 'STANDARD',
    serviceType: 'EXPRESS',
    basePrice: 15000,
    weightIncrement: 1,
    pricePerKg: 3500,
    minWeight: 1,
    maxWeight: 30,
    minDistance: 0,
    maxDistance: 999999,
    effectiveDate: new Date('2023-01-01'),
    expiryDate: new Date('2025-12-31'),
    status: 'active',
    notes: 'Standard pricing for express shipments'
  },
  {
    code: 'EXP-BULK',
    name: 'Express Bulk',
    type: 'BULK',
    serviceType: 'EXPRESS',
    basePrice: 12000,
    weightIncrement: 1,
    pricePerKg: 3000,
    minWeight: 10,
    maxWeight: 100,
    minDistance: 0,
    maxDistance: 999999,
    effectiveDate: new Date('2023-01-01'),
    expiryDate: new Date('2025-12-31'),
    status: 'active',
    notes: 'Bulk pricing for express shipments (10kg or more)'
  },
  
  // Same-day pricing rules
  {
    code: 'SAME-STD',
    name: 'Same Day Standard',
    type: 'STANDARD',
    serviceType: 'SAME_DAY',
    basePrice: 25000,
    weightIncrement: 1,
    pricePerKg: 5000,
    minWeight: 1,
    maxWeight: 20,
    minDistance: 0,
    maxDistance: 50, // Limited to 50km
    effectiveDate: new Date('2023-01-01'),
    expiryDate: new Date('2025-12-31'),
    status: 'active',
    notes: 'Standard pricing for same-day shipments (limited to 50km)'
  },
  
  // Distance-based pricing rules
  {
    code: 'DIST-NEAR',
    name: 'Distance Near',
    type: 'DISTANCE',
    serviceType: 'REGULAR',
    basePrice: 10000,
    weightIncrement: 1,
    pricePerKg: 2000,
    minWeight: 1,
    maxWeight: 30,
    minDistance: 0,
    maxDistance: 50,
    effectiveDate: new Date('2023-01-01'),
    expiryDate: new Date('2025-12-31'),
    status: 'active',
    notes: 'Distance-based pricing for nearby shipments (0-50km)'
  },
  {
    code: 'DIST-MID',
    name: 'Distance Medium',
    type: 'DISTANCE',
    serviceType: 'REGULAR',
    basePrice: 15000,
    weightIncrement: 1,
    pricePerKg: 2500,
    minWeight: 1,
    maxWeight: 30,
    minDistance: 51,
    maxDistance: 150,
    effectiveDate: new Date('2023-01-01'),
    expiryDate: new Date('2025-12-31'),
    status: 'active',
    notes: 'Distance-based pricing for medium-distance shipments (51-150km)'
  },
  {
    code: 'DIST-FAR',
    name: 'Distance Far',
    type: 'DISTANCE',
    serviceType: 'REGULAR',
    basePrice: 20000,
    weightIncrement: 1,
    pricePerKg: 3000,
    minWeight: 1,
    maxWeight: 30,
    minDistance: 151,
    maxDistance: 999999,
    effectiveDate: new Date('2023-01-01'),
    expiryDate: new Date('2025-12-31'),
    status: 'active',
    notes: 'Distance-based pricing for long-distance shipments (151km+)'
  },
  
  // Special pricing rules
  {
    code: 'CORP-DISC',
    name: 'Corporate Discount',
    type: 'CUSTOMER',
    serviceType: 'REGULAR',
    basePrice: 9000,
    weightIncrement: 1,
    pricePerKg: 2200,
    minWeight: 1,
    maxWeight: 100,
    minDistance: 0,
    maxDistance: 999999,
    customerType: 'CORPORATE',
    effectiveDate: new Date('2023-01-01'),
    expiryDate: new Date('2025-12-31'),
    status: 'active',
    notes: 'Special pricing for corporate customers'
  },
  {
    code: 'ECOM-DISC',
    name: 'E-Commerce Discount',
    type: 'CUSTOMER',
    serviceType: 'REGULAR',
    basePrice: 8500,
    weightIncrement: 1,
    pricePerKg: 2100,
    minWeight: 1,
    maxWeight: 100,
    minDistance: 0,
    maxDistance: 999999,
    customerType: 'E-COMMERCE',
    effectiveDate: new Date('2023-01-01'),
    expiryDate: new Date('2025-12-31'),
    status: 'active',
    notes: 'Special pricing for e-commerce customers'
  }
];

/**
 * Seed pricing rules to the database
 */
const seedPricingRules = async () => {
  try {
    console.log('Starting pricing rule seeder...');

    // Connect to database if not already connected
    if (mongoose.connection.readyState === 0) {
      await connectToDatabase();
    }

    // Check if we're connected
    if (mongoose.connection.readyState !== 1) {
      throw new Error(`Failed to connect to MongoDB. Connection state: ${['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState]}`);
    }

    console.log('Connected to MongoDB successfully');

    // Check for existing pricing rules
    console.log('Checking for existing pricing rules...');
    const existingCount = await PricingRule.countDocuments({});
    
    if (existingCount > 0) {
      console.log(`Found ${existingCount} existing pricing rules`);
      console.log('Deleting existing pricing rules...');
      const deleteResult = await PricingRule.deleteMany({});
      console.log(`Deleted ${deleteResult.deletedCount} existing pricing rules`);
    } else {
      console.log('No existing pricing rules found');
    }

    // Create new pricing rules
    console.log('Creating new pricing rules...');
    const createdPricingRules = await PricingRule.create(pricingRuleTemplates);
    console.log(`Created ${createdPricingRules.length} pricing rules`);

    // Log created pricing rules
    createdPricingRules.forEach((rule) => {
      console.log(`- ${rule.code}: ${rule.name} (${rule.serviceType})`);
    });

    console.log('Pricing rule seeding completed successfully');
    return createdPricingRules;
  } catch (error) {
    console.error('Error seeding pricing rules:', error.message);
    throw error;
  }
};

// Run seeder if this script is executed directly
if (require.main === module) {
  (async () => {
    try {
      await connectToDatabase();
      await seedPricingRules();
      await disconnectFromDatabase();
      console.log('Pricing rule seeder completed successfully');
      process.exit(0);
    } catch (error) {
      console.error('Pricing rule seeder failed:', error);
      // Close database connection if it's open
      if (mongoose.connection.readyState !== 0) {
        await disconnectFromDatabase();
      }
      process.exit(1);
    }
  })();
}

module.exports = {
  seedPricingRules
};
