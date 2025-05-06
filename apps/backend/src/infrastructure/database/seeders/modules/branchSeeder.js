/**
 * Samudra Paket ERP - Branch Seeder
 * Seeds the database with initial branches for testing
 */

const mongoose = require('mongoose');
const Branch = require('../../../../domain/models/branch');
const { connectToDatabase, disconnectFromDatabase } = require('../config');

/**
 * Initial branches data
 */
const branchTemplates = [
  {
    code: 'JKT-01',
    name: 'Jakarta Pusat',
    address: {
      street: 'Jl. Kebon Sirih No. 123',
      city: 'Jakarta Pusat',
      province: 'DKI Jakarta',
      postalCode: '10110',
      country: 'Indonesia',
      coordinates: {
        latitude: -6.186486,
        longitude: 106.834091
      }
    },
    contactInfo: {
      phone: '021-5551234',
      email: 'jakarta.pusat@samudrapaket.com',
      fax: '021-5551235',
      website: 'www.samudrapaket.com'
    },
    level: 0,
    isMainBranch: true,
    status: 'active',
    operationalHours: {
      monday: { open: '08:00', close: '17:00' },
      tuesday: { open: '08:00', close: '17:00' },
      wednesday: { open: '08:00', close: '17:00' },
      thursday: { open: '08:00', close: '17:00' },
      friday: { open: '08:00', close: '17:00' },
      saturday: { open: '09:00', close: '15:00' },
      sunday: { open: null, close: null }
    }
  },
  {
    code: 'JKT-02',
    name: 'Jakarta Selatan',
    address: {
      street: 'Jl. Fatmawati No. 56',
      city: 'Jakarta Selatan',
      province: 'DKI Jakarta',
      postalCode: '12150',
      country: 'Indonesia',
      coordinates: {
        latitude: -6.265754,
        longitude: 106.804779
      }
    },
    contactInfo: {
      phone: '021-7501234',
      email: 'jakarta.selatan@samudrapaket.com',
      fax: '021-7501235',
      website: 'www.samudrapaket.com'
    },
    parentBranch: null, // Will be set after JKT-01 is created
    level: 1,
    status: 'active',
    operationalHours: {
      monday: { open: '08:00', close: '17:00' },
      tuesday: { open: '08:00', close: '17:00' },
      wednesday: { open: '08:00', close: '17:00' },
      thursday: { open: '08:00', close: '17:00' },
      friday: { open: '08:00', close: '17:00' },
      saturday: { open: '09:00', close: '15:00' },
      sunday: { open: null, close: null }
    }
  },
  {
    code: 'BDG-01',
    name: 'Bandung',
    address: {
      street: 'Jl. Asia Afrika No. 78',
      city: 'Bandung',
      province: 'Jawa Barat',
      postalCode: '40112',
      country: 'Indonesia',
      coordinates: {
        latitude: -6.921149,
        longitude: 107.607163
      }
    },
    contactInfo: {
      phone: '022-4201234',
      email: 'bandung@samudrapaket.com',
      fax: '022-4201235',
      website: 'www.samudrapaket.com'
    },
    parentBranch: null, // Will be set after JKT-01 is created
    level: 1,
    status: 'active',
    operationalHours: {
      monday: { open: '08:00', close: '17:00' },
      tuesday: { open: '08:00', close: '17:00' },
      wednesday: { open: '08:00', close: '17:00' },
      thursday: { open: '08:00', close: '17:00' },
      friday: { open: '08:00', close: '17:00' },
      saturday: { open: '09:00', close: '15:00' },
      sunday: { open: null, close: null }
    }
  },
  {
    code: 'SBY-01',
    name: 'Surabaya',
    address: {
      street: 'Jl. Basuki Rahmat No. 45',
      city: 'Surabaya',
      province: 'Jawa Timur',
      postalCode: '60271',
      country: 'Indonesia',
      coordinates: {
        latitude: -7.256928,
        longitude: 112.750268
      }
    },
    contactInfo: {
      phone: '031-5321234',
      email: 'surabaya@samudrapaket.com',
      fax: '031-5321235',
      website: 'www.samudrapaket.com'
    },
    parentBranch: null, // Will be set after JKT-01 is created
    level: 1,
    status: 'active',
    operationalHours: {
      monday: { open: '08:00', close: '17:00' },
      tuesday: { open: '08:00', close: '17:00' },
      wednesday: { open: '08:00', close: '17:00' },
      thursday: { open: '08:00', close: '17:00' },
      friday: { open: '08:00', close: '17:00' },
      saturday: { open: '09:00', close: '15:00' },
      sunday: { open: null, close: null }
    }
  },
  {
    code: 'MDN-01',
    name: 'Medan',
    address: {
      street: 'Jl. Diponegoro No. 34',
      city: 'Medan',
      province: 'Sumatera Utara',
      postalCode: '20152',
      country: 'Indonesia',
      coordinates: {
        latitude: 3.589375,
        longitude: 98.673894
      }
    },
    contactInfo: {
      phone: '061-4501234',
      email: 'medan@samudrapaket.com',
      fax: '061-4501235',
      website: 'www.samudrapaket.com'
    },
    parentBranch: null, // Will be set after JKT-01 is created
    level: 1,
    status: 'active',
    operationalHours: {
      monday: { open: '08:00', close: '17:00' },
      tuesday: { open: '08:00', close: '17:00' },
      wednesday: { open: '08:00', close: '17:00' },
      thursday: { open: '08:00', close: '17:00' },
      friday: { open: '08:00', close: '17:00' },
      saturday: { open: '09:00', close: '15:00' },
      sunday: { open: null, close: null }
    }
  }
];

/**
 * Seed branches to the database
 */
const seedBranches = async () => {
  try {
    console.log('Starting branch seeder...');

    // Connect to database if not already connected
    if (mongoose.connection.readyState === 0) {
      await connectToDatabase();
    }

    // Check if we're connected
    if (mongoose.connection.readyState !== 1) {
      throw new Error(`Failed to connect to MongoDB. Connection state: ${['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState]}`);
    }

    console.log('Connected to MongoDB successfully');

    // Check for existing branches
    console.log('Checking for existing branches...');
    const existingCount = await Branch.countDocuments({});
    
    if (existingCount > 0) {
      console.log(`Found ${existingCount} existing branches`);
      console.log('Deleting existing branches...');
      const deleteResult = await Branch.deleteMany({});
      console.log(`Deleted ${deleteResult.deletedCount} existing branches`);
    } else {
      console.log('No existing branches found');
    }

    // Create main branch first
    console.log('Creating main branch...');
    const mainBranchTemplate = branchTemplates.find(b => b.level === 0);
    const mainBranch = await Branch.create(mainBranchTemplate);
    console.log(`Created main branch: ${mainBranch.code} - ${mainBranch.name}`);
    
    // Update other branches with parent reference
    const otherBranchTemplates = branchTemplates.filter(b => b.level !== 0);
    otherBranchTemplates.forEach(branch => {
      branch.parentBranch = mainBranch._id;
    });
    
    // Create other branches
    console.log('Creating other branches...');
    const otherBranches = await Branch.create(otherBranchTemplates);
    console.log(`Created ${otherBranches.length} additional branches`);
    
    // Combine all created branches
    const createdBranches = [mainBranch, ...otherBranches];
    
    // Log created branches
    createdBranches.forEach((branch) => {
      console.log(`- ${branch.code}: ${branch.name} (${branch.address.city}, ${branch.address.province})`);
    });

    console.log('Branch seeding completed successfully');
    return createdBranches;
  } catch (error) {
    console.error('Error seeding branches:', error.message);
    throw error;
  }
};

// Run seeder if this script is executed directly
if (require.main === module) {
  (async () => {
    try {
      await connectToDatabase();
      await seedBranches();
      await disconnectFromDatabase();
      console.log('Branch seeder completed successfully');
      process.exit(0);
    } catch (error) {
      console.error('Branch seeder failed:', error);
      // Close database connection if it's open
      if (mongoose.connection.readyState !== 0) {
        await disconnectFromDatabase();
      }
      process.exit(1);
    }
  })();
}

module.exports = {
  seedBranches
};
