/**
 * Samudra Paket ERP - Forwarder Seeder
 * Seeds the database with forwarder areas, partners, and rates for testing
 */

const mongoose = require('mongoose');
const ForwarderArea = require('../../../../domain/models/forwarderArea');
const ForwarderPartner = require('../../../../domain/models/forwarderPartner');
const ForwarderRate = require('../../../../domain/models/forwarderRate');
const { connectToDatabase, disconnectFromDatabase } = require('../config');

/**
 * Initial forwarder partners data
 */
const forwarderPartnerTemplates = [
  {
    code: 'JNE',
    name: 'JNE Express',
    contactPerson: 'Budi Santoso',
    phone: '021-5150123',
    email: 'partnership@jne.co.id',
    address: 'Jl. Tomang Raya No. 45, Jakarta Barat',
    status: 'active',
    services: ['REG', 'YES', 'OKE'],
    contractStartDate: new Date('2023-01-01'),
    contractEndDate: new Date('2025-12-31'),
    paymentTerms: 'NET30',
    commissionRate: 10,
    notes: 'Nationwide coverage with strong presence in Java and Sumatra'
  },
  {
    code: 'TIKI',
    name: 'TIKI',
    contactPerson: 'Sari Indah',
    phone: '021-6305123',
    email: 'partnership@tiki.id',
    address: 'Jl. Pemuda No. 115, Jakarta Timur',
    status: 'active',
    services: ['REG', 'ONS', 'ECO'],
    contractStartDate: new Date('2023-02-15'),
    contractEndDate: new Date('2025-02-14'),
    paymentTerms: 'NET15',
    commissionRate: 12,
    notes: 'Strong coverage in Eastern Indonesia'
  },
  {
    code: 'SICEPAT',
    name: 'SiCepat Express',
    contactPerson: 'Rudi Hartono',
    phone: '021-5437890',
    email: 'partnership@sicepat.com',
    address: 'Jl. Gatot Subroto Kav. 23, Jakarta Selatan',
    status: 'active',
    services: ['BEST', 'REG', 'GOKIL'],
    contractStartDate: new Date('2023-03-10'),
    contractEndDate: new Date('2024-12-31'),
    paymentTerms: 'NET30',
    commissionRate: 15,
    notes: 'Fast delivery in major cities'
  },
  {
    code: 'ANTERAJA',
    name: 'AnterAja',
    contactPerson: 'Nina Wijaya',
    phone: '021-7891234',
    email: 'partnership@anteraja.id',
    address: 'Jl. TB Simatupang No. 88, Jakarta Selatan',
    status: 'active',
    services: ['SAME DAY', 'NEXT DAY', 'REGULAR'],
    contractStartDate: new Date('2023-04-01'),
    contractEndDate: new Date('2025-03-31'),
    paymentTerms: 'NET15',
    commissionRate: 14,
    notes: 'Strong in e-commerce deliveries'
  },
  {
    code: 'POS',
    name: 'Pos Indonesia',
    contactPerson: 'Agus Supriyanto',
    phone: '021-3456789',
    email: 'partnership@posindonesia.co.id',
    address: 'Jl. Lapangan Banteng Utara No. 1, Jakarta Pusat',
    status: 'active',
    services: ['EXPRESS', 'STANDARD', 'KILAT'],
    contractStartDate: new Date('2023-01-15'),
    contractEndDate: new Date('2024-12-31'),
    paymentTerms: 'NET30',
    commissionRate: 8,
    notes: 'Widest coverage including remote areas'
  }
];

/**
 * Initial forwarder areas data
 */
const forwarderAreaTemplates = [
  {
    code: 'JKT',
    name: 'Jakarta',
    province: 'DKI Jakarta',
    type: 'CITY',
    status: 'active',
    serviceAvailability: {
      JNE: true,
      TIKI: true,
      SICEPAT: true,
      ANTERAJA: true,
      POS: true
    },
    deliveryEstimation: {
      JNE: { min: 1, max: 2 },
      TIKI: { min: 1, max: 2 },
      SICEPAT: { min: 1, max: 1 },
      ANTERAJA: { min: 1, max: 1 },
      POS: { min: 2, max: 3 }
    }
  },
  {
    code: 'BDG',
    name: 'Bandung',
    province: 'Jawa Barat',
    type: 'CITY',
    status: 'active',
    serviceAvailability: {
      JNE: true,
      TIKI: true,
      SICEPAT: true,
      ANTERAJA: true,
      POS: true
    },
    deliveryEstimation: {
      JNE: { min: 1, max: 2 },
      TIKI: { min: 1, max: 2 },
      SICEPAT: { min: 1, max: 2 },
      ANTERAJA: { min: 1, max: 2 },
      POS: { min: 2, max: 3 }
    }
  },
  {
    code: 'SBY',
    name: 'Surabaya',
    province: 'Jawa Timur',
    type: 'CITY',
    status: 'active',
    serviceAvailability: {
      JNE: true,
      TIKI: true,
      SICEPAT: true,
      ANTERAJA: true,
      POS: true
    },
    deliveryEstimation: {
      JNE: { min: 2, max: 3 },
      TIKI: { min: 2, max: 3 },
      SICEPAT: { min: 1, max: 2 },
      ANTERAJA: { min: 2, max: 3 },
      POS: { min: 3, max: 4 }
    }
  },
  {
    code: 'MDN',
    name: 'Medan',
    province: 'Sumatera Utara',
    type: 'CITY',
    status: 'active',
    serviceAvailability: {
      JNE: true,
      TIKI: true,
      SICEPAT: true,
      ANTERAJA: false,
      POS: true
    },
    deliveryEstimation: {
      JNE: { min: 3, max: 4 },
      TIKI: { min: 3, max: 5 },
      SICEPAT: { min: 2, max: 3 },
      ANTERAJA: { min: 0, max: 0 },
      POS: { min: 4, max: 6 }
    }
  },
  {
    code: 'DPS',
    name: 'Denpasar',
    province: 'Bali',
    type: 'CITY',
    status: 'active',
    serviceAvailability: {
      JNE: true,
      TIKI: true,
      SICEPAT: true,
      ANTERAJA: true,
      POS: true
    },
    deliveryEstimation: {
      JNE: { min: 3, max: 4 },
      TIKI: { min: 3, max: 4 },
      SICEPAT: { min: 2, max: 3 },
      ANTERAJA: { min: 3, max: 4 },
      POS: { min: 4, max: 5 }
    }
  }
];

/**
 * Generate forwarder rates based on partners and areas
 */
const generateForwarderRates = (partners, areas) => {
  const rates = [];
  
  // Create a map for easier lookup
  const partnerMap = {};
  partners.forEach(partner => {
    partnerMap[partner.code] = partner;
  });
  
  // Generate rates for each origin-destination pair and each forwarder
  areas.forEach(origin => {
    areas.forEach(destination => {
      // Skip same origin-destination
      if (origin.code === destination.code) return;
      
      // For each forwarder partner
      Object.keys(origin.serviceAvailability).forEach(forwarderCode => {
        // Skip if service not available in either origin or destination
        if (!origin.serviceAvailability[forwarderCode] || !destination.serviceAvailability[forwarderCode]) return;
        
        // Get partner
        const partner = partnerMap[forwarderCode];
        if (!partner) return;
        
        // Calculate base rate based on distance (simplified for demo)
        // In real world, this would be based on actual distance or zones
        const distanceMultiplier = Math.random() * 2 + 1; // Random between 1-3
        const baseRate = Math.round(10000 + (Math.random() * 40000)); // Base between 10k-50k
        
        // Create rate for each service
        partner.services.forEach(service => {
          // Service multiplier
          let serviceMultiplier = 1;
          if (service.includes('YES') || service.includes('NEXT') || service.includes('ONS')) {
            serviceMultiplier = 1.5; // Express service
          } else if (service.includes('SAME') || service.includes('BEST')) {
            serviceMultiplier = 2; // Same day service
          }
          
          // Calculate rate
          const rate = Math.round(baseRate * distanceMultiplier * serviceMultiplier);
          
          // Create rate object
          rates.push({
            forwarderCode: forwarderCode,
            originCode: origin.code,
            destinationCode: destination.code,
            service: service,
            rate: rate,
            minWeight: 1,
            maxWeight: 30,
            effectiveDate: new Date('2023-01-01'),
            expiryDate: new Date('2025-12-31'),
            status: 'active',
            notes: `${service} from ${origin.name} to ${destination.name}`
          });
        });
      });
    });
  });
  
  return rates;
};

/**
 * Seed forwarder partners
 */
const seedForwarderPartners = async () => {
  console.log('Seeding forwarder partners...');
  
  // Check for existing forwarder partners
  const existingCount = await ForwarderPartner.countDocuments({});
  
  if (existingCount > 0) {
    console.log(`Found ${existingCount} existing forwarder partners`);
    console.log('Deleting existing forwarder partners...');
    const deleteResult = await ForwarderPartner.deleteMany({});
    console.log(`Deleted ${deleteResult.deletedCount} existing forwarder partners`);
  } else {
    console.log('No existing forwarder partners found');
  }
  
  // Create new forwarder partners
  console.log('Creating new forwarder partners...');
  const createdPartners = await ForwarderPartner.create(forwarderPartnerTemplates);
  console.log(`Created ${createdPartners.length} forwarder partners`);
  
  // Log created forwarder partners
  createdPartners.forEach((partner) => {
    console.log(`- ${partner.code}: ${partner.name}`);
  });
  
  return createdPartners;
};

/**
 * Seed forwarder areas
 */
const seedForwarderAreas = async () => {
  console.log('Seeding forwarder areas...');
  
  // Check for existing forwarder areas
  const existingCount = await ForwarderArea.countDocuments({});
  
  if (existingCount > 0) {
    console.log(`Found ${existingCount} existing forwarder areas`);
    console.log('Deleting existing forwarder areas...');
    const deleteResult = await ForwarderArea.deleteMany({});
    console.log(`Deleted ${deleteResult.deletedCount} existing forwarder areas`);
  } else {
    console.log('No existing forwarder areas found');
  }
  
  // Create new forwarder areas
  console.log('Creating new forwarder areas...');
  const createdAreas = await ForwarderArea.create(forwarderAreaTemplates);
  console.log(`Created ${createdAreas.length} forwarder areas`);
  
  // Log created forwarder areas
  createdAreas.forEach((area) => {
    console.log(`- ${area.code}: ${area.name}, ${area.province}`);
  });
  
  return createdAreas;
};

/**
 * Seed forwarder rates
 */
const seedForwarderRates = async (partners, areas) => {
  console.log('Seeding forwarder rates...');
  
  // Check for existing forwarder rates
  const existingCount = await ForwarderRate.countDocuments({});
  
  if (existingCount > 0) {
    console.log(`Found ${existingCount} existing forwarder rates`);
    console.log('Deleting existing forwarder rates...');
    const deleteResult = await ForwarderRate.deleteMany({});
    console.log(`Deleted ${deleteResult.deletedCount} existing forwarder rates`);
  } else {
    console.log('No existing forwarder rates found');
  }
  
  // Generate rates
  const rateTemplates = generateForwarderRates(partners, areas);
  console.log(`Generated ${rateTemplates.length} rate templates`);
  
  // Create new forwarder rates
  console.log('Creating new forwarder rates...');
  const createdRates = await ForwarderRate.create(rateTemplates);
  console.log(`Created ${createdRates.length} forwarder rates`);
  
  return createdRates;
};

/**
 * Seed all forwarder data (partners, areas, rates)
 */
const seedForwarders = async () => {
  try {
    console.log('Starting forwarder seeder...');
    
    // Connect to database if not already connected
    if (mongoose.connection.readyState === 0) {
      await connectToDatabase();
    }
    
    // Check if we're connected
    if (mongoose.connection.readyState !== 1) {
      throw new Error(`Failed to connect to MongoDB. Connection state: ${['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState]}`);
    }
    
    console.log('Connected to MongoDB successfully');
    
    // Seed forwarder partners
    const partners = await seedForwarderPartners();
    
    // Seed forwarder areas
    const areas = await seedForwarderAreas();
    
    // Seed forwarder rates
    await seedForwarderRates(partners, areas);
    
    console.log('Forwarder seeding completed successfully');
  } catch (error) {
    console.error('Error seeding forwarders:', error.message);
    throw error;
  }
};

// Run seeder if this script is executed directly
if (require.main === module) {
  (async () => {
    try {
      await connectToDatabase();
      await seedForwarders();
      await disconnectFromDatabase();
      console.log('Forwarder seeder completed successfully');
      process.exit(0);
    } catch (error) {
      console.error('Forwarder seeder failed:', error);
      // Close database connection if it's open
      if (mongoose.connection.readyState !== 0) {
        await disconnectFromDatabase();
      }
      process.exit(1);
    }
  })();
}

module.exports = {
  seedForwarders,
  seedForwarderPartners,
  seedForwarderAreas,
  seedForwarderRates
};
