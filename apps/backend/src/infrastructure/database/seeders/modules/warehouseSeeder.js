/**
 * Samudra Paket ERP - Warehouse Seeder
 * Seeds the database with warehouse items for testing
 */

const mongoose = require('mongoose');
const WarehouseItem = require('../../../../domain/models/warehouseItem');
const Branch = require('../../../../domain/models/branch');
const { connectToDatabase, disconnectFromDatabase } = require('../config');

/**
 * Seed warehouse items to the database
 */
const seedWarehouseItems = async () => {
  try {
    console.log('Starting warehouse item seeder...');

    // Connect to database if not already connected
    if (mongoose.connection.readyState === 0) {
      await connectToDatabase();
    }

    // Check if we're connected
    if (mongoose.connection.readyState !== 1) {
      throw new Error(`Failed to connect to MongoDB. Connection state: ${['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState]}`);
    }

    console.log('Connected to MongoDB successfully');

    // Get all branches
    const branches = await Branch.find({});
    if (branches.length === 0) {
      throw new Error('No branches found. Please run the branch seeder first.');
    }

    // Check for existing warehouse items
    console.log('Checking for existing warehouse items...');
    const existingCount = await WarehouseItem.countDocuments({});
    
    if (existingCount > 0) {
      console.log(`Found ${existingCount} existing warehouse items`);
      console.log('Deleting existing warehouse items...');
      const deleteResult = await WarehouseItem.deleteMany({});
      console.log(`Deleted ${deleteResult.deletedCount} existing warehouse items`);
    } else {
      console.log('No existing warehouse items found');
    }

    // Generate warehouse items for each branch
    const warehouseItems = [];
    let itemId = 1;

    // Package types
    const packageTypes = ['BOX', 'ENVELOPE', 'PARCEL', 'DOCUMENT', 'FRAGILE'];
    
    // Status options
    const statusOptions = ['received', 'processing', 'allocated', 'loaded', 'in_transit', 'delivered'];
    
    // Service types
    const serviceTypes = ['REGULAR', 'EXPRESS', 'SAME_DAY'];
    
    // Random destinations (using branches)
    const destinations = branches.map(branch => ({
      branchId: branch._id,
      branchCode: branch.code,
      branchName: branch.name,
      city: branch.city,
      province: branch.province
    }));

    // Generate items for each branch
    for (const branch of branches) {
      // Generate 20-30 items per branch
      const itemCount = Math.floor(Math.random() * 11) + 20; // 20-30 items
      
      for (let i = 0; i < itemCount; i++) {
        // Select random destination (different from current branch)
        const availableDestinations = destinations.filter(dest => dest.branchCode !== branch.code);
        const destination = availableDestinations[Math.floor(Math.random() * availableDestinations.length)];
        
        // Generate random weight between 0.5 and 20 kg
        const weight = parseFloat((Math.random() * 19.5 + 0.5).toFixed(2));
        
        // Generate random dimensions
        const length = Math.floor(Math.random() * 50) + 10; // 10-60 cm
        const width = Math.floor(Math.random() * 40) + 10; // 10-50 cm
        const height = Math.floor(Math.random() * 30) + 5; // 5-35 cm
        
        // Calculate volumetric weight
        const volumetricWeight = parseFloat(((length * width * height) / 6000).toFixed(2));
        
        // Select random package type
        const packageType = packageTypes[Math.floor(Math.random() * packageTypes.length)];
        
        // Select random status
        const status = statusOptions[Math.floor(Math.random() * statusOptions.length)];
        
        // Select random service type
        const serviceType = serviceTypes[Math.floor(Math.random() * serviceTypes.length)];
        
        // Generate tracking number
        const trackingNumber = `SP${branch.code}${String(itemId).padStart(8, '0')}`;
        
        // Create warehouse item
        warehouseItems.push({
          itemCode: `ITEM-${String(itemId++).padStart(6, '0')}`,
          trackingNumber: trackingNumber,
          packageType: packageType,
          weight: weight,
          dimensions: {
            length: length,
            width: width,
            height: height
          },
          volumetricWeight: volumetricWeight,
          chargeableWeight: Math.max(weight, volumetricWeight),
          origin: {
            branchId: branch._id,
            branchCode: branch.code,
            branchName: branch.name,
            city: branch.city,
            province: branch.province
          },
          destination: destination,
          status: status,
          serviceType: serviceType,
          receivedAt: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)), // Random date within last 7 days
          description: `Test package ${i+1} for ${branch.name}`,
          specialInstructions: Math.random() > 0.7 ? 'Handle with care' : null, // 30% chance of special instructions
          isFragile: packageType === 'FRAGILE',
          location: {
            zone: `ZONE-${String.fromCharCode(65 + Math.floor(Math.random() * 5))}`, // A-E
            rack: `RACK-${Math.floor(Math.random() * 10) + 1}`,
            shelf: `SHELF-${Math.floor(Math.random() * 5) + 1}`
          }
        });
      }
    }

    // Create new warehouse items
    console.log('Creating new warehouse items...');
    const createdItems = await WarehouseItem.create(warehouseItems);
    console.log(`Created ${createdItems.length} warehouse items`);

    // Log summary of created items by branch
    const branchSummary = {};
    createdItems.forEach(item => {
      const branchCode = item.origin.branchCode;
      if (!branchSummary[branchCode]) {
        branchSummary[branchCode] = 0;
      }
      branchSummary[branchCode]++;
    });

    console.log('Warehouse items by branch:');
    Object.entries(branchSummary).forEach(([branchCode, count]) => {
      console.log(`- ${branchCode}: ${count} items`);
    });

    console.log('Warehouse item seeding completed successfully');
    return createdItems;
  } catch (error) {
    console.error('Error seeding warehouse items:', error.message);
    throw error;
  }
};

// Run seeder if this script is executed directly
if (require.main === module) {
  (async () => {
    try {
      await connectToDatabase();
      await seedWarehouseItems();
      await disconnectFromDatabase();
      console.log('Warehouse item seeder completed successfully');
      process.exit(0);
    } catch (error) {
      console.error('Warehouse item seeder failed:', error);
      // Close database connection if it's open
      if (mongoose.connection.readyState !== 0) {
        await disconnectFromDatabase();
      }
      process.exit(1);
    }
  })();
}

module.exports = {
  seedWarehouseItems
};
