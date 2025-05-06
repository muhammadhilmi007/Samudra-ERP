/**
 * Samudra Paket ERP - Employee Seeder
 * Seeds the database with initial employees for testing
 */

const mongoose = require('mongoose');
const Employee = require('../../../../domain/models/employee');
const Branch = require('../../../../domain/models/branch');
const Position = require('../../../../domain/models/position');
const Division = require('../../../../domain/models/division');
const { connectToDatabase, disconnectFromDatabase } = require('../config');

/**
 * Initial divisions data
 */
const divisionTemplates = [
  {
    code: 'OPS',
    name: 'Operations',
    description: 'Handles day-to-day logistics operations'
  },
  {
    code: 'FIN',
    name: 'Finance',
    description: 'Manages financial aspects of the company'
  },
  {
    code: 'HR',
    name: 'Human Resources',
    description: 'Manages employee affairs and recruitment'
  },
  {
    code: 'IT',
    name: 'Information Technology',
    description: 'Manages IT infrastructure and systems'
  },
  {
    code: 'MKT',
    name: 'Marketing',
    description: 'Handles marketing and customer acquisition'
  },
  {
    code: 'CS',
    name: 'Customer Service',
    description: 'Provides support to customers'
  }
];

/**
 * Initial positions data
 */
const positionTemplates = [
  {
    code: 'OPS_MGR',
    title: 'Manager',
    division: 'OPS',
    level: 3,
    description: 'Manages branch operations'
  },
  {
    code: 'OPS_SUP',
    title: 'Supervisor',
    division: 'OPS',
    level: 2,
    description: 'Supervises operational staff'
  },
  {
    code: 'OPS_OPR',
    title: 'Operator',
    division: 'OPS',
    level: 1,
    description: 'Handles package processing and data entry'
  },
  {
    code: 'OPS_DRV',
    title: 'Driver',
    division: 'OPS',
    level: 1,
    description: 'Delivers packages to customers'
  },
  {
    code: 'OPS_CHK',
    title: 'Checker',
    division: 'OPS',
    level: 1,
    description: 'Verifies package details and conditions'
  },
  {
    code: 'FIN_MGR',
    title: 'Finance Manager',
    division: 'FIN',
    level: 3,
    description: 'Manages financial operations'
  },
  {
    code: 'FIN_ACC',
    title: 'Accountant',
    division: 'FIN',
    level: 2,
    description: 'Handles accounting and financial reporting'
  },
  {
    code: 'FIN_CSH',
    title: 'Cashier',
    division: 'FIN',
    level: 1,
    description: 'Processes payments and handles cash'
  },
  {
    code: 'HR_MGR',
    title: 'HR Manager',
    division: 'HR',
    level: 3,
    description: 'Manages HR department'
  },
  {
    code: 'HR_REC',
    title: 'Recruiter',
    division: 'HR',
    level: 2,
    description: 'Handles recruitment and hiring'
  },
  {
    code: 'IT_MGR',
    title: 'IT Manager',
    division: 'IT',
    level: 3,
    description: 'Manages IT department'
  },
  {
    code: 'IT_DEV',
    title: 'Developer',
    division: 'IT',
    level: 2,
    description: 'Develops and maintains software systems'
  },
  {
    code: 'IT_SUP',
    title: 'IT Support',
    division: 'IT',
    level: 1,
    description: 'Provides technical support to staff'
  },
  {
    code: 'MKT_MGR',
    title: 'Marketing Manager',
    division: 'MKT',
    level: 3,
    description: 'Manages marketing department'
  },
  {
    code: 'MKT_SAL',
    title: 'Sales Representative',
    division: 'MKT',
    level: 2,
    description: 'Acquires new customers and maintains relationships'
  },
  {
    code: 'CS_MGR',
    title: 'Customer Service Manager',
    division: 'CS',
    level: 3,
    description: 'Manages customer service department'
  },
  {
    code: 'CS_REP',
    title: 'Customer Service Representative',
    division: 'CS',
    level: 1,
    description: 'Handles customer inquiries and complaints'
  },
  {
    code: 'FIN_COL',
    title: 'Debt Collector',
    division: 'FIN',
    level: 1,
    description: 'Collects payments from customers'
  }
];

/**
 * Generate employee data based on branches, divisions, and positions
 */
const generateEmployees = async () => {
  // Get all branches
  const branches = await Branch.find({});
  if (branches.length === 0) {
    throw new Error('No branches found. Please run the branch seeder first.');
  }

  // Create divisions for each branch
  const divisionMap = {};
  const genericDivisionMap = {}; // For backward compatibility
  
  // First, get the main branch (JKT-01) to use as default for company-wide divisions
  const mainBranch = branches.find(b => b.code === 'JKT-01');
  if (!mainBranch) {
    throw new Error('Main branch (JKT-01) not found. Please ensure branch seeder has been run correctly.');
  }
  
  // First, check if we need to delete existing divisions
  const existingDivisions = await Division.countDocuments();
  if (existingDivisions > 0) {
    console.log(`Found ${existingDivisions} existing divisions. Deleting...`);
    await Division.deleteMany({});
    console.log('Existing divisions deleted.');
  }
  
  // First, check if we need to delete existing positions
  const existingPositions = await Position.countDocuments();
  if (existingPositions > 0) {
    console.log(`Found ${existingPositions} existing positions. Deleting...`);
    await Position.deleteMany({});
    console.log('Existing positions deleted.');
  }
  
  // We need a user for createdBy and updatedBy fields
  // Let's find any user we can use for the createdBy and updatedBy fields
  let adminUser = await mongoose.connection.db.collection('users').findOne({});
  
  if (!adminUser) {
    console.log('No users found in the database. Please run the user seeder first.');
    throw new Error('No users found in the database. Please run the user seeder first.');
  }
  
  console.log(`Found user ${adminUser.username || adminUser.email} for createdBy/updatedBy fields`);
  const adminUserId = adminUser._id;
  
  // Create divisions for each branch
  for (const branch of branches) {
    for (const divTemplate of divisionTemplates) {
      // Create a unique code for each branch-division combination
      const branchDivCode = `${branch.code}_${divTemplate.code}`;
      
      // Create the division with branch reference and unique code
      const division = await Division.create({
        ...divTemplate,
        code: branchDivCode, // Use the branch-specific code to ensure uniqueness
        branch: branch._id
      });
      
      console.log(`Created division: ${division.code} - ${division.name} for branch ${branch.code}`);
      
      // Store in map with branch-specific key
      divisionMap[branchDivCode] = division._id;
      
      // For the main branch, also store with generic division code for backward compatibility
      if (branch.code === 'JKT-01') {
        genericDivisionMap[divTemplate.code] = division._id;
      }
    }
  }
  
  // Merge the maps, prioritizing branch-specific codes
  Object.assign(divisionMap, genericDivisionMap);

  // Create positions if they don't exist
  const positionMap = {};
  for (const posTemplate of positionTemplates) {
    // Set division reference
    posTemplate.division = divisionMap[posTemplate.division];
    
    let position = await Position.findOne({ code: posTemplate.code, title: posTemplate.title });
    if (!position) {
      position = await Position.create(posTemplate);
      console.log(`Created position: ${position.code} - ${position.title}`);
    }
    
    // Create a compound key for position lookup
    const posKey = `${position.code}_${position.title}`;
    positionMap[posKey] = position._id;
  }

  // Generate employees for each branch
  const employees = [];
  let employeeId = 1;

  for (const branch of branches) {
    // Manager for each branch
    const managerName = `Branch Manager ${branch.name}`;
    const [firstName, ...lastNameParts] = managerName.split(' ');
    const lastName = lastNameParts.join(' ');
    
    employees.push({
      employeeId: `EMP-${String(employeeId++).padStart(4, '0')}`,
      firstName: firstName,
      lastName: lastName,
      position: positionMap['OPS_MGR_Manager'],
      branch: branch._id,
      contact: {
        email: `manager.${branch.code.toLowerCase()}@samudrapaket.com`,
        phone: `08123456${String(employeeId).padStart(4, '0')}`,
        emergencyContact: 'Family Member',
        emergencyPhone: `08765432${String(employeeId).padStart(4, '0')}`,
      },
      address: {
        street: `Jl. Karyawan No. ${employeeId}`,
        city: branch.city,
        district: 'Central District',
        province: branch.province,
        postalCode: '12345',
        country: 'Indonesia',
      },
      joinDate: new Date('2022-01-01'),
      status: 'active',
      gender: employeeId % 2 === 0 ? 'male' : 'female',
      maritalStatus: 'married',
      birthDate: new Date('1985-01-01'),
      documents: [
        {
          type: 'id_card',
          number: `3271${String(employeeId).padStart(12, '0')}`,
          issuedDate: new Date('2020-01-01'),
          expiryDate: new Date('2025-01-01'),
        }
      ],
      createdBy: adminUserId,
      updatedBy: adminUserId,
      bankAccount: {
        bankName: 'BCA',
        accountNumber: `123456${String(employeeId).padStart(4, '0')}`,
        accountName: `${firstName} ${lastName}`
      }
    });

    // Supervisor for each branch
    const supervisorName = `Supervisor ${branch.name}`;
    const [supFirstName, ...supLastNameParts] = supervisorName.split(' ');
    const supLastName = supLastNameParts.join(' ');
    
    employees.push({
      employeeId: `EMP-${String(employeeId++).padStart(4, '0')}`,
      firstName: supFirstName,
      lastName: supLastName,
      position: positionMap['OPS_SUP_Supervisor'],
      branch: branch._id,
      contact: {
        email: `supervisor.${branch.code.toLowerCase()}@samudrapaket.com`,
        phone: `08123456${String(employeeId).padStart(4, '0')}`,
        emergencyContact: 'Family Member',
        emergencyPhone: `08765432${String(employeeId).padStart(4, '0')}`,
      },
      address: {
        street: `Jl. Karyawan No. ${employeeId}`,
        city: branch.city,
        district: 'Central District',
        province: branch.province,
        postalCode: '12345',
        country: 'Indonesia',
      },
      joinDate: new Date('2022-02-01'),
      status: 'active',
      gender: employeeId % 2 === 0 ? 'male' : 'female',
      maritalStatus: 'single',
      birthDate: new Date('1990-01-01'),
      documents: [
        {
          type: 'id_card',
          number: `3271${String(employeeId).padStart(12, '0')}`,
          issuedDate: new Date('2020-01-01'),
          expiryDate: new Date('2025-01-01'),
        }
      ],
      createdBy: adminUserId,
      updatedBy: adminUserId,
      bankAccount: {
        bankName: 'BCA',
        accountNumber: `123456${String(employeeId).padStart(4, '0')}`,
        accountName: `${supFirstName} ${supLastName}`
      }
    });

    // 2 Operators for each branch
    for (let i = 0; i < 2; i++) {
      employees.push({
        employeeId: `EMP-${String(employeeId++).padStart(4, '0')}`,
        name: `Operator ${i+1} ${branch.name}`,
        position: positionMap['OPS_OPR_Operator'],
        branch: branch._id,
        email: `operator${i+1}.${branch.code.toLowerCase()}@samudrapaket.com`,
        phone: `08123456${String(employeeId).padStart(4, '0')}`,
        address: `Jl. Karyawan No. ${employeeId}, ${branch.city}`,
        joinDate: new Date('2022-03-01'),
        status: 'active',
        gender: employeeId % 2 === 0 ? 'male' : 'female',
        identityType: 'KTP',
        identityNumber: `3271${String(employeeId).padStart(12, '0')}`,
        bankAccount: {
          bankName: 'BCA',
          accountNumber: `123456${String(employeeId).padStart(4, '0')}`,
          accountName: `Operator ${i+1} ${branch.name}`
        }
      });
    }

    // 3 Drivers for each branch
    for (let i = 0; i < 3; i++) {
      employees.push({
        employeeId: `EMP-${String(employeeId++).padStart(4, '0')}`,
        name: `Driver ${i+1} ${branch.name}`,
        position: positionMap['OPS_DRV_Driver'],
        branch: branch._id,
        email: `driver${i+1}.${branch.code.toLowerCase()}@samudrapaket.com`,
        phone: `08123456${String(employeeId).padStart(4, '0')}`,
        address: `Jl. Karyawan No. ${employeeId}, ${branch.city}`,
        joinDate: new Date('2022-04-01'),
        status: 'active',
        gender: 'male', // Most drivers are male
        identityType: 'KTP',
        identityNumber: `3271${String(employeeId).padStart(12, '0')}`,
        bankAccount: {
          bankName: 'BCA',
          accountNumber: `123456${String(employeeId).padStart(4, '0')}`,
          accountName: `Driver ${i+1} ${branch.name}`
        },
        drivingLicense: {
          number: `SIM-A-${String(employeeId).padStart(8, '0')}`,
          type: 'A',
          expiryDate: new Date('2025-12-31')
        }
      });
    }

    // 2 Checkers for each branch
    for (let i = 0; i < 2; i++) {
      employees.push({
        employeeId: `EMP-${String(employeeId++).padStart(4, '0')}`,
        name: `Checker ${i+1} ${branch.name}`,
        position: positionMap['OPS_CHK_Checker'],
        branch: branch._id,
        email: `checker${i+1}.${branch.code.toLowerCase()}@samudrapaket.com`,
        phone: `08123456${String(employeeId).padStart(4, '0')}`,
        address: `Jl. Karyawan No. ${employeeId}, ${branch.city}`,
        joinDate: new Date('2022-05-01'),
        status: 'active',
        gender: employeeId % 2 === 0 ? 'male' : 'female',
        identityType: 'KTP',
        identityNumber: `3271${String(employeeId).padStart(12, '0')}`,
        bankAccount: {
          bankName: 'BCA',
          accountNumber: `123456${String(employeeId).padStart(4, '0')}`,
          accountName: `Checker ${i+1} ${branch.name}`
        }
      });
    }

    // Admin staff for each branch
    const adminStaffName = `Admin Staff ${branch.name}`;
    const [adminFirstName, ...adminLastNameParts] = adminStaffName.split(' ');
    const adminLastName = adminLastNameParts.join(' ');
    
    employees.push({
      employeeId: `EMP-${String(employeeId++).padStart(4, '0')}`,
      firstName: adminFirstName,
      lastName: adminLastName,
      position: positionMap['ADM_STF_Staff'],
      branch: branch._id,
      contact: {
        email: `admin.${branch.code.toLowerCase()}@samudrapaket.com`,
        phone: `08123456${String(employeeId).padStart(4, '0')}`,
        emergencyContact: 'Family Member',
        emergencyPhone: `08765432${String(employeeId).padStart(4, '0')}`,
      },
      address: {
        street: `Jl. Karyawan No. ${employeeId}`,
        city: branch.city,
        district: 'Central District',
        province: branch.province,
        postalCode: '12345',
        country: 'Indonesia',
      },
      joinDate: new Date('2022-03-01'),
      status: 'active',
      gender: employeeId % 2 === 0 ? 'male' : 'female',
      maritalStatus: 'single',
      birthDate: new Date('1992-01-01'),
      documents: [
        {
          type: 'id_card',
          number: `3271${String(employeeId).padStart(12, '0')}`,
          issuedDate: new Date('2020-01-01'),
          expiryDate: new Date('2025-01-01'),
        }
      ],
      createdBy: adminUserId,
      updatedBy: adminUserId,
      bankAccount: {
        bankName: 'BCA',
        accountNumber: `123456${String(employeeId).padStart(4, '0')}`,
        accountName: `${adminFirstName} ${adminLastName}`
      }
    });

    // 1 Cashier for each branch
    const cashierName = `Cashier ${branch.name}`;
    const [cashierFirstName, ...cashierLastNameParts] = cashierName.split(' ');
    const cashierLastName = cashierLastNameParts.join(' ');
    
    employees.push({
      employeeId: `EMP-${String(employeeId++).padStart(4, '0')}`,
      firstName: cashierFirstName,
      lastName: cashierLastName,
      position: positionMap['FIN_CSH_Cashier'],
      branch: branch._id,
      contact: {
        email: `cashier.${branch.code.toLowerCase()}@samudrapaket.com`,
        phone: `08123456${String(employeeId).padStart(4, '0')}`,
        emergencyContact: 'Family Member',
        emergencyPhone: `08765432${String(employeeId).padStart(4, '0')}`,
      },
      address: {
        street: `Jl. Karyawan No. ${employeeId}`,
        city: branch.city,
        district: 'Central District',
        province: branch.province,
        postalCode: '12345',
        country: 'Indonesia',
      },
      joinDate: new Date('2022-06-01'),
      status: 'active',
      gender: 'female', // Most cashiers are female
      maritalStatus: 'single',
      birthDate: new Date('1995-01-01'),
      documents: [
        {
          type: 'id_card',
          number: `3271${String(employeeId).padStart(12, '0')}`,
          issuedDate: new Date('2020-01-01'),
          expiryDate: new Date('2025-01-01'),
        }
      ],
      createdBy: adminUserId,
      updatedBy: adminUserId,
      bankAccount: {
        bankName: 'BCA',
        accountNumber: `123456${String(employeeId).padStart(4, '0')}`,
        accountName: `${cashierFirstName} ${cashierLastName}`
      }
    });

    // 1 Customer Service Representative for each branch
    employees.push({
      employeeId: `EMP-${String(employeeId++).padStart(4, '0')}`,
      name: `CS Rep ${branch.name}`,
      position: positionMap['CS_REP_Customer Service Representative'],
      branch: branch._id,
      email: `cs.${branch.code.toLowerCase()}@samudrapaket.com`,
      phone: `08123456${String(employeeId).padStart(4, '0')}`,
      address: `Jl. Karyawan No. ${employeeId}, ${branch.city}`,
      joinDate: new Date('2022-07-01'),
      status: 'active',
      gender: 'female', // Most CS reps are female
      identityType: 'KTP',
      identityNumber: `3271${String(employeeId).padStart(12, '0')}`,
      bankAccount: {
        bankName: 'BCA',
        accountNumber: `123456${String(employeeId).padStart(4, '0')}`,
        accountName: `CS Rep ${branch.name}`
      }
    });

    // 1 Debt Collector for each branch
    employees.push({
      employeeId: `EMP-${String(employeeId++).padStart(4, '0')}`,
      name: `Debt Collector ${branch.name}`,
      position: positionMap['FIN_COL_Debt Collector'],
      branch: branch._id,
      email: `collector.${branch.code.toLowerCase()}@samudrapaket.com`,
      phone: `08123456${String(employeeId).padStart(4, '0')}`,
      address: `Jl. Karyawan No. ${employeeId}, ${branch.city}`,
      joinDate: new Date('2022-08-01'),
      status: 'active',
      gender: 'male', // Most debt collectors are male
      identityType: 'KTP',
      identityNumber: `3271${String(employeeId).padStart(12, '0')}`,
      bankAccount: {
        bankName: 'BCA',
        accountNumber: `123456${String(employeeId).padStart(4, '0')}`,
        accountName: `Debt Collector ${branch.name}`
      }
    });
  }

  // Add head office employees for main branch
  const headOfficeBranch = await Branch.findOne({ isMainBranch: true }) || mainBranch;
  if (headOfficeBranch) {
    // Finance Manager
    employees.push({
      employeeId: `EMP-${String(employeeId++).padStart(4, '0')}`,
      name: 'Finance Manager',
      position: positionMap['FIN_MGR_Finance Manager'],
      branch: headOfficeBranch._id,
      email: 'finance.manager@samudrapaket.com',
      phone: `08123456${String(employeeId).padStart(4, '0')}`,
      address: `Jl. Karyawan No. ${employeeId}, ${headOfficeBranch.city}`,
      joinDate: new Date('2022-01-15'),
      status: 'active',
      gender: 'female',
      identityType: 'KTP',
      identityNumber: `3271${String(employeeId).padStart(12, '0')}`,
      bankAccount: {
        bankName: 'BCA',
        accountNumber: `123456${String(employeeId).padStart(4, '0')}`,
        accountName: 'Finance Manager'
      }
    });

    // HR Manager
    employees.push({
      employeeId: `EMP-${String(employeeId++).padStart(4, '0')}`,
      name: 'HR Manager',
      position: positionMap['HR_MGR_HR Manager'],
      branch: headOfficeBranch._id,
      email: 'hr.manager@samudrapaket.com',
      phone: `08123456${String(employeeId).padStart(4, '0')}`,
      address: `Jl. Karyawan No. ${employeeId}, ${headOfficeBranch.city}`,
      joinDate: new Date('2022-01-20'),
      status: 'active',
      gender: 'female',
      identityType: 'KTP',
      identityNumber: `3271${String(employeeId).padStart(12, '0')}`,
      bankAccount: {
        bankName: 'BCA',
        accountNumber: `123456${String(employeeId).padStart(4, '0')}`,
        accountName: 'HR Manager'
      }
    });

    // IT Manager
    employees.push({
      employeeId: `EMP-${String(employeeId++).padStart(4, '0')}`,
      name: 'IT Manager',
      position: positionMap['IT_MGR_IT Manager'],
      branch: headOfficeBranch._id,
      email: 'it.manager@samudrapaket.com',
      phone: `08123456${String(employeeId).padStart(4, '0')}`,
      address: `Jl. Karyawan No. ${employeeId}, ${headOfficeBranch.city}`,
      joinDate: new Date('2022-01-25'),
      status: 'active',
      gender: 'male',
      identityType: 'KTP',
      identityNumber: `3271${String(employeeId).padStart(12, '0')}`,
      bankAccount: {
        bankName: 'BCA',
        accountNumber: `123456${String(employeeId).padStart(4, '0')}`,
        accountName: 'IT Manager'
      }
    });

    // Marketing Manager
    employees.push({
      employeeId: `EMP-${String(employeeId++).padStart(4, '0')}`,
      name: 'Marketing Manager',
      position: positionMap['MKT_MGR_Marketing Manager'],
      branch: headOfficeBranch._id,
      email: 'marketing.manager@samudrapaket.com',
      phone: `08123456${String(employeeId).padStart(4, '0')}`,
      address: `Jl. Karyawan No. ${employeeId}, ${headOfficeBranch.city}`,
      joinDate: new Date('2022-02-01'),
      status: 'active',
      gender: 'male',
      identityType: 'KTP',
      identityNumber: `3271${String(employeeId).padStart(12, '0')}`,
      bankAccount: {
        bankName: 'BCA',
        accountNumber: `123456${String(employeeId).padStart(4, '0')}`,
        accountName: 'Marketing Manager'
      }
    });

    // Customer Service Manager
    employees.push({
      employeeId: `EMP-${String(employeeId++).padStart(4, '0')}`,
      name: 'Customer Service Manager',
      position: positionMap['CS_MGR_Customer Service Manager'],
      branch: headOfficeBranch._id,
      email: 'cs.manager@samudrapaket.com',
      phone: `08123456${String(employeeId).padStart(4, '0')}`,
      address: `Jl. Karyawan No. ${employeeId}, ${headOfficeBranch.city}`,
      joinDate: new Date('2022-02-05'),
      status: 'active',
      gender: 'female',
      identityType: 'KTP',
      identityNumber: `3271${String(employeeId).padStart(12, '0')}`,
      bankAccount: {
        bankName: 'BCA',
        accountNumber: `123456${String(employeeId).padStart(4, '0')}`,
        accountName: 'Customer Service Manager'
      }
    });
  }

  return employees;
};

/**
 * Seed employees to the database
 */
const seedEmployees = async () => {
  try {
    console.log('Starting employee seeder...');

    // Connect to database if not already connected
    if (mongoose.connection.readyState === 0) {
      await connectToDatabase();
    }

    // Check if we're connected
    if (mongoose.connection.readyState !== 1) {
      throw new Error(`Failed to connect to MongoDB. Connection state: ${['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState]}`);
    }

    console.log('Connected to MongoDB successfully');

    // Check for existing employees
    console.log('Checking for existing employees...');
    const existingCount = await Employee.countDocuments({});
    
    if (existingCount > 0) {
      console.log(`Found ${existingCount} existing employees`);
      console.log('Deleting existing employees...');
      const deleteResult = await Employee.deleteMany({});
      console.log(`Deleted ${deleteResult.deletedCount} existing employees`);
    } else {
      console.log('No existing employees found');
    }

    // Generate employee data
    console.log('Generating employee data...');
    const employeeTemplates = await generateEmployees();
    console.log(`Generated ${employeeTemplates.length} employee templates`);

    // Create new employees
    console.log('Creating new employees...');
    const createdEmployees = await Employee.create(employeeTemplates);
    console.log(`Created ${createdEmployees.length} employees`);

    // Log created employees
    createdEmployees.forEach((employee) => {
      console.log(`- ${employee.employeeId}: ${employee.name}`);
    });

    console.log('Employee seeding completed successfully');
    return createdEmployees;
  } catch (error) {
    console.error('Error seeding employees:', error.message);
    throw error;
  }
};

// Run seeder if this script is executed directly
if (require.main === module) {
  (async () => {
    try {
      await connectToDatabase();
      await seedEmployees();
      await disconnectFromDatabase();
      console.log('Employee seeder completed successfully');
      process.exit(0);
    } catch (error) {
      console.error('Employee seeder failed:', error);
      // Close database connection if it's open
      if (mongoose.connection.readyState !== 0) {
        await disconnectFromDatabase();
      }
      process.exit(1);
    }
  })();
}

module.exports = {
  seedEmployees
};
