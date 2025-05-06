/**
 * Samudra Paket ERP - Service Area Seeder
 * Seeds the database with service areas for testing
 */

const mongoose = require('mongoose');
const ServiceArea = require('../../../../domain/models/serviceArea');
const Branch = require('../../../../domain/models/branch');
const { connectToDatabase, disconnectFromDatabase } = require('../config');

/**
 * Seed service areas to the database
 */
const seedServiceAreas = async () => {
  try {
    console.log('Starting service area seeder...');

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

    // Check for existing service areas
    console.log('Checking for existing service areas...');
    const existingCount = await ServiceArea.countDocuments({});
    
    if (existingCount > 0) {
      console.log(`Found ${existingCount} existing service areas`);
      console.log('Deleting existing service areas...');
      const deleteResult = await ServiceArea.deleteMany({});
      console.log(`Deleted ${deleteResult.deletedCount} existing service areas`);
    } else {
      console.log('No existing service areas found');
    }

    // Create service areas for each branch
    const serviceAreaTemplates = [];
    
    branches.forEach(branch => {
      // Main service area (city where branch is located)
      serviceAreaTemplates.push({
        code: `${branch.code}-MAIN`,
        name: branch.city,
        branch: branch._id,
        type: 'CITY',
        province: branch.province,
        postalCodes: [branch.postalCode],
        status: 'active',
        isPrimary: true,
        coverageRadius: 10, // 10 km
        deliveryEstimation: {
          min: 1,
          max: 1
        },
        serviceTypes: ['REGULAR', 'EXPRESS', 'SAME_DAY'],
        notes: `Primary service area for ${branch.name} branch`
      });
      
      // Secondary service areas (nearby cities/areas)
      // For Jakarta branches
      if (branch.city.includes('Jakarta')) {
        // Add other Jakarta areas
        const jakartaAreas = ['Jakarta Pusat', 'Jakarta Selatan', 'Jakarta Barat', 'Jakarta Timur', 'Jakarta Utara'];
        const otherJakartaAreas = jakartaAreas.filter(area => area !== branch.city);
        
        otherJakartaAreas.forEach((area, index) => {
          serviceAreaTemplates.push({
            code: `${branch.code}-JKT${index + 1}`,
            name: area,
            branch: branch._id,
            type: 'CITY',
            province: 'DKI Jakarta',
            postalCodes: [],
            status: 'active',
            isPrimary: false,
            coverageRadius: 15, // 15 km
            deliveryEstimation: {
              min: 1,
              max: 2
            },
            serviceTypes: ['REGULAR', 'EXPRESS'],
            notes: `Secondary service area for ${branch.name} branch`
          });
        });
        
        // Add nearby cities
        ['Tangerang', 'Bekasi', 'Depok', 'Bogor'].forEach((city, index) => {
          serviceAreaTemplates.push({
            code: `${branch.code}-SEC${index + 1}`,
            name: city,
            branch: branch._id,
            type: 'CITY',
            province: city === 'Tangerang' ? 'Banten' : 'Jawa Barat',
            postalCodes: [],
            status: 'active',
            isPrimary: false,
            coverageRadius: 25, // 25 km
            deliveryEstimation: {
              min: 1,
              max: 2
            },
            serviceTypes: ['REGULAR', 'EXPRESS'],
            notes: `Extended service area for ${branch.name} branch`
          });
        });
      }
      
      // For Bandung branch
      else if (branch.city === 'Bandung') {
        ['Cimahi', 'Lembang', 'Soreang', 'Banjaran'].forEach((city, index) => {
          serviceAreaTemplates.push({
            code: `${branch.code}-SEC${index + 1}`,
            name: city,
            branch: branch._id,
            type: 'CITY',
            province: 'Jawa Barat',
            postalCodes: [],
            status: 'active',
            isPrimary: false,
            coverageRadius: 20, // 20 km
            deliveryEstimation: {
              min: 1,
              max: 2
            },
            serviceTypes: ['REGULAR', 'EXPRESS'],
            notes: `Secondary service area for ${branch.name} branch`
          });
        });
      }
      
      // For Surabaya branch
      else if (branch.city === 'Surabaya') {
        ['Sidoarjo', 'Gresik', 'Mojokerto', 'Lamongan'].forEach((city, index) => {
          serviceAreaTemplates.push({
            code: `${branch.code}-SEC${index + 1}`,
            name: city,
            branch: branch._id,
            type: 'CITY',
            province: 'Jawa Timur',
            postalCodes: [],
            status: 'active',
            isPrimary: false,
            coverageRadius: 30, // 30 km
            deliveryEstimation: {
              min: 1,
              max: 2
            },
            serviceTypes: ['REGULAR', 'EXPRESS'],
            notes: `Secondary service area for ${branch.name} branch`
          });
        });
      }
      
      // For Medan branch
      else if (branch.city === 'Medan') {
        ['Binjai', 'Deli Serdang', 'Tebing Tinggi', 'Perbaungan'].forEach((city, index) => {
          serviceAreaTemplates.push({
            code: `${branch.code}-SEC${index + 1}`,
            name: city,
            branch: branch._id,
            type: 'CITY',
            province: 'Sumatera Utara',
            postalCodes: [],
            status: 'active',
            isPrimary: false,
            coverageRadius: 35, // 35 km
            deliveryEstimation: {
              min: 1,
              max: 2
            },
            serviceTypes: ['REGULAR', 'EXPRESS'],
            notes: `Secondary service area for ${branch.name} branch`
          });
        });
      }
    });

    // Create new service areas
    console.log('Creating new service areas...');
    const createdServiceAreas = await ServiceArea.create(serviceAreaTemplates);
    console.log(`Created ${createdServiceAreas.length} service areas`);

    // Log created service areas
    createdServiceAreas.forEach((area) => {
      console.log(`- ${area.code}: ${area.name} (${area.province})`);
    });

    console.log('Service area seeding completed successfully');
    return createdServiceAreas;
  } catch (error) {
    console.error('Error seeding service areas:', error.message);
    throw error;
  }
};

// Run seeder if this script is executed directly
if (require.main === module) {
  (async () => {
    try {
      await connectToDatabase();
      await seedServiceAreas();
      await disconnectFromDatabase();
      console.log('Service area seeder completed successfully');
      process.exit(0);
    } catch (error) {
      console.error('Service area seeder failed:', error);
      // Close database connection if it's open
      if (mongoose.connection.readyState !== 0) {
        await disconnectFromDatabase();
      }
      process.exit(1);
    }
  })();
}

module.exports = {
  seedServiceAreas
};
