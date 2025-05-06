/**
 * Samudra Paket ERP - Customer Seeder
 * Seeds the database with initial customer data
 */

const mongoose = require('mongoose');
const Customer = require('../../../../domain/models/customer');
const Branch = require('../../../../domain/models/branch');
const { connectToDatabase, disconnectFromDatabase } = require('../config');

/**
 * Initial customers data
 */
const customerTemplates = [
  {
    code: 'CUST-001',
    name: 'PT Maju Jaya Abadi',
    type: 'business',
    contactInfo: {
      primaryPhone: '021-5551234',
      secondaryPhone: '0812-3456-7890',
      email: 'hendro@majujaya.com',
      whatsapp: '0812-3456-7890'
    },
    contactPerson: 'Hendro Wibowo',
    address: {
      street: 'Jl. Sudirman Kav. 45',
      city: 'Jakarta Pusat',
      province: 'DKI Jakarta',
      postalCode: '10210',
      country: 'Indonesia'
    },
    taxId: '01.234.567.8-901.000',
    creditLimit: 10000000,
    paymentTerm: 'NET30',
    status: 'active',
    category: 'corporate',
    notes: 'Large corporate client with regular shipments'
  },
  {
    code: 'CUST-002',
    name: 'CV Berkah Sejahtera',
    type: 'business',
    contactInfo: {
      primaryPhone: '021-7891234',
      secondaryPhone: '0813-7891234',
      email: 'dewi@berkahsejahtera.co.id',
      whatsapp: '0813-7891234'
    },
    contactPerson: 'Dewi Anggraini',
    address: {
      street: 'Jl. Gatot Subroto No. 123',
      city: 'Jakarta Selatan',
      province: 'DKI Jakarta',
      postalCode: '12930',
      country: 'Indonesia'
    },
    taxId: '02.345.678.9-012.000',
    creditLimit: 5000000,
    paymentTerm: 'NET15',
    status: 'active',
    category: 'corporate',
    notes: 'Medium-sized business with weekly shipments'
  },
  {
    code: 'CUST-003',
    name: 'Toko Elektronik Makmur',
    type: 'business',
    contactInfo: {
      primaryPhone: '0812-3456-7890',
      email: 'budi@elektronikmakmur.com',
      whatsapp: '0812-3456-7890'
    },
    contactPerson: 'Budi Santoso',
    address: {
      street: 'Jl. Mangga Dua Raya No. 45',
      city: 'Jakarta Utara',
      province: 'DKI Jakarta',
      postalCode: '14430',
      country: 'Indonesia'
    },
    taxId: '03.456.789.0-123.000',
    creditLimit: 2000000,
    paymentTerm: 'NET7',
    status: 'active',
    category: 'regular',
    notes: 'Electronics store with frequent small shipments'
  },
  {
    code: 'CUST-004',
    name: 'TokoOnline.com',
    type: 'business',
    contactInfo: {
      primaryPhone: '0878-9012-3456',
      secondaryPhone: '021-7890123',
      email: 'sari@tokoonline.com',
      whatsapp: '0878-9012-3456'
    },
    contactPerson: 'Sari Indah',
    address: {
      street: 'Jl. Casablanca No. 88',
      city: 'Jakarta Selatan',
      province: 'DKI Jakarta',
      postalCode: '12870',
      country: 'Indonesia'
    },
    taxId: '04.567.890.1-234.000',
    creditLimit: 15000000,
    paymentTerm: 'NET30',
    status: 'active',
    category: 'premium',
    notes: 'Large e-commerce platform with high volume daily shipments'
  },
  {
    code: 'CUST-005',
    name: 'Butik Fashion Cantik',
    type: 'business',
    contactInfo: {
      primaryPhone: '0856-7890-1234',
      email: 'lina@fashioncantik.id',
      whatsapp: '0856-7890-1234'
    },
    contactPerson: 'Lina Wijaya',
    address: {
      street: 'Jl. Thamrin No. 56',
      city: 'Bandung',
      province: 'Jawa Barat',
      postalCode: '40111',
      country: 'Indonesia'
    },
    taxId: '05.678.901.2-345.000',
    creditLimit: 1000000,
    paymentTerm: 'CASH',
    status: 'active',
    category: 'regular',
    notes: 'Fashion boutique with occasional shipments'
  },
  {
    code: 'CUST-006',
    name: 'PT Global Logistics',
    type: 'business',
    contactInfo: {
      primaryPhone: '021-5678901',
      secondaryPhone: '0815-7890123',
      email: 'rudi@globallogistics.co.id',
      whatsapp: '0815-7890123'
    },
    contactPerson: 'Rudi Hartono',
    address: {
      street: 'Jl. Hayam Wuruk No. 108',
      city: 'Jakarta Barat',
      province: 'DKI Jakarta',
      postalCode: '11160',
      country: 'Indonesia'
    },
    taxId: '06.789.012.3-456.000',
    creditLimit: 25000000,
    paymentTerm: 'NET45',
    status: 'active',
    category: 'premium',
    notes: 'Logistics company with high volume shipments'
  },
  {
    code: 'CUST-007',
    name: 'Klinik Sehat Sentosa',
    type: 'business',
    contactInfo: {
      primaryPhone: '021-3456789',
      secondaryPhone: '0817-3456789',
      email: 'anita@kliniksehat.com',
      whatsapp: '0817-3456789'
    },
    contactPerson: 'dr. Anita Setiawan',
    address: {
      street: 'Jl. Diponegoro No. 75',
      city: 'Jakarta Pusat',
      province: 'DKI Jakarta',
      postalCode: '10310',
      country: 'Indonesia'
    },
    taxId: '07.890.123.4-567.000',
    creditLimit: 3000000,
    paymentTerm: 'NET15',
    status: 'active',
    category: 'regular',
    notes: 'Medical clinic with regular medical supply shipments'
  },
  {
    code: 'CUST-008',
    name: 'UD Sumber Rejeki',
    type: 'business',
    contactInfo: {
      primaryPhone: '0813-9012-3456',
      email: 'hendra@sumberrejeki.id',
      whatsapp: '0813-9012-3456'
    },
    contactPerson: 'Hendra Gunawan',
    address: {
      street: 'Jl. Pahlawan No. 23',
      city: 'Surabaya',
      province: 'Jawa Timur',
      postalCode: '60174',
      country: 'Indonesia'
    },
    taxId: '08.901.234.5-678.000',
    creditLimit: 1500000,
    paymentTerm: 'NET7',
    status: 'active',
    category: 'regular',
    notes: 'Trading company with regular shipments to Java and Bali'
  },
  {
    code: 'CUST-009',
    name: 'PT Teknologi Maju',
    type: 'business',
    contactInfo: {
      primaryPhone: '021-9012345',
      secondaryPhone: '0819-0123456',
      email: 'irwan@teknologimaju.com',
      whatsapp: '0819-0123456'
    },
    contactPerson: 'Irwan Setiawan',
    address: {
      street: 'Jl. HR Rasuna Said Kav. 62',
      city: 'Jakarta Selatan',
      province: 'DKI Jakarta',
      postalCode: '12920',
      country: 'Indonesia'
    },
    taxId: '09.012.345.6-789.000',
    creditLimit: 20000000,
    paymentTerm: 'NET30',
    status: 'active',
    category: 'premium',
    notes: 'Technology company with international shipments'
  },
  {
    code: 'CUST-010',
    name: 'Apotek Sehat Selalu',
    type: 'business',
    contactInfo: {
      primaryPhone: '0857-1234-5678',
      email: 'nina@apoteksehat.com',
      whatsapp: '0857-1234-5678'
    },
    contactPerson: 'Nina Susanti',
    address: {
      street: 'Jl. Ahmad Yani No. 45',
      city: 'Medan',
      province: 'Sumatera Utara',
      postalCode: '20234',
      country: 'Indonesia'
    },
    taxId: '10.123.456.7-890.000',
    creditLimit: 2500000,
    paymentTerm: 'NET15',
    status: 'active',
    category: 'regular',
    notes: 'Pharmacy with regular medical supply shipments'
  }
];

/**
 * Seeds the database with initial customer data
 */
const seedCustomers = async () => {
  console.log('Starting customer seeder...');
  let connection;

  try {
    connection = await connectToDatabase();
    console.log('Connected to MongoDB successfully');

    // Check if customers already exist
    const existingCustomers = await Customer.countDocuments();
    console.log('Checking for existing customers...');

    if (existingCustomers > 0) {
      console.log(`Found ${existingCustomers} existing customers. Skipping seeding.`);
      return;
    }

    console.log('No existing customers found');
    
    // Check if branches exist (dependency)
    const branches = await Branch.find().select('_id code name');
    if (branches.length === 0) {
      throw new Error('No branches found. Please run the branch seeder first.');
    }
    console.log(`Found ${branches.length} branches to associate with customers`);
    
    // Map branch codes to their IDs for easy reference
    const branchMap = {};
    branches.forEach(branch => {
      branchMap[branch.code] = branch._id;
    });
    
    // Assign branches to customers based on location
    const customersWithBranches = customerTemplates.map(customer => {
      // Default to Jakarta Pusat branch (JKT-01) if no specific match
      let branchCode = 'JKT-01';
      
      // Assign branch based on customer's province/city
      const province = customer.address.province;
      const city = customer.address.city;
      
      if (province === 'Jawa Barat' || city === 'Bandung') {
        branchCode = 'BDG-01';
      } else if (province === 'Jawa Timur' || city === 'Surabaya') {
        branchCode = 'SBY-01';
      } else if (province === 'Sumatera Utara' || city === 'Medan') {
        branchCode = 'MDN-01';
      } else if (city === 'Jakarta Selatan') {
        branchCode = 'JKT-02';
      }
      
      return {
        ...customer,
        branch: branchMap[branchCode]
      };
    });
    
    console.log('Creating new customers...');

    // Create customers
    const createdCustomers = await Customer.create(customersWithBranches);

    console.log(`Created ${createdCustomers.length} customers successfully`);
    console.log('Customer seeding completed successfully');
  } catch (error) {
    console.error('Error seeding customers:', error);
    throw error;
  } finally {
    if (connection) {
      await disconnectFromDatabase();
    }
  }
}

// Run seeder if this script is executed directly
if (require.main === module) {
  (async () => {
    try {
      await connectToDatabase();
      await seedCustomers();
      await disconnectFromDatabase();
      console.log('Customer seeder executed successfully');
      process.exit(0);
    } catch (error) {
      console.error('Error executing customer seeder:', error);
      // Close database connection if it's open
      if (mongoose.connection && mongoose.connection.readyState !== 0) {
        await disconnectFromDatabase();
      }
      process.exit(1);
    }
  })();
}

module.exports = {
  seedCustomers
};
