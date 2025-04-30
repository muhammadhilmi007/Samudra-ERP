/**
 * Samudra Paket ERP - Branch Model Unit Tests
 */

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Branch = require('../../../../src/domain/models/branch');

let mongoServer;

// Setup before tests
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

// Cleanup after tests
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// Clear data between tests
afterEach(async () => {
  await Branch.deleteMany({});
});

describe('Branch Model', () => {
  it('should create a branch successfully', async () => {
    const branchData = {
      code: 'HO001',
      name: 'Head Office Jakarta',
      address: {
        street: 'Jl. Sudirman No. 123',
        city: 'Jakarta',
        province: 'DKI Jakarta',
        postalCode: '12930',
      },
      contactInfo: {
        phone: '021-5551234',
        email: 'ho@samudrapaket.id',
      },
    };

    const branch = new Branch(branchData);
    const savedBranch = await branch.save();

    // Check saved branch
    expect(savedBranch._id).toBeDefined();
    expect(savedBranch.code).toBe('HO001');
    expect(savedBranch.name).toBe('Head Office Jakarta');
    expect(savedBranch.status).toBe('active'); // Default value
    expect(savedBranch.level).toBe(0); // Default value
  });

  it('should require code, name, address, and contactInfo', async () => {
    const branch = new Branch({});

    let error;
    try {
      await branch.validate();
    } catch (e) {
      error = e;
    }

    expect(error).toBeDefined();
    expect(error.name).toBe('ValidationError');
    expect(error.errors.code).toBeDefined();
    expect(error.errors.name).toBeDefined();
    // Address has nested required fields
    expect(error.errors['address.street']).toBeDefined();
    expect(error.errors['address.city']).toBeDefined();
    expect(error.errors['address.province']).toBeDefined();
    expect(error.errors['address.postalCode']).toBeDefined();
    // ContactInfo has nested required fields
    expect(error.errors['contactInfo.phone']).toBeDefined();
    expect(error.errors['contactInfo.email']).toBeDefined();
  });

  it('should validate required fields in contactInfo', async () => {
    const branch = new Branch({
      code: 'BR001',
      name: 'Test Branch',
      address: {
        street: 'Test Street',
        city: 'Test City',
        province: 'Test Province',
        postalCode: '12345',
      },
      contactInfo: {
        // Missing required email and phone
      },
    });

    let error;
    try {
      await branch.validate();
    } catch (e) {
      error = e;
    }

    expect(error).toBeDefined();
    expect(error.name).toBe('ValidationError');
    expect(error.errors['contactInfo.email']).toBeDefined();
    expect(error.errors['contactInfo.phone']).toBeDefined();
  });

  it('should set level based on parent branch', async () => {
    // Create parent branch (level 0)
    const parentBranch = await Branch.create({
      code: 'HO001',
      name: 'Head Office Jakarta',
      address: {
        street: 'Jl. Sudirman No. 123',
        city: 'Jakarta',
        province: 'DKI Jakarta',
        postalCode: '12930',
      },
      contactInfo: {
        phone: '021-5551234',
        email: 'ho@samudrapaket.id',
      },
    });

    // Create child branch with parent reference
    const childBranch = await Branch.create({
      code: 'BR001',
      name: 'Branch Bandung',
      address: {
        street: 'Jl. Asia Afrika No. 56',
        city: 'Bandung',
        province: 'Jawa Barat',
        postalCode: '40112',
      },
      contactInfo: {
        phone: '022-4231234',
        email: 'bandung@samudrapaket.id',
      },
      parentBranch: parentBranch._id,
    });

    // Check that level was set correctly
    expect(childBranch.level).toBe(1);

    // Create grandchild branch
    const grandchildBranch = await Branch.create({
      code: 'SB001',
      name: 'Sub-Branch Cimahi',
      address: {
        street: 'Jl. Cihampelas No. 78',
        city: 'Cimahi',
        province: 'Jawa Barat',
        postalCode: '40526',
      },
      contactInfo: {
        phone: '022-6651234',
        email: 'cimahi@samudrapaket.id',
      },
      parentBranch: childBranch._id,
    });

    // Check that level was set correctly
    expect(grandchildBranch.level).toBe(2);
  });

  it('should add and manage divisions within a branch', async () => {
    // Create branch
    const branch = await Branch.create({
      code: 'HO001',
      name: 'Head Office Jakarta',
      address: {
        street: 'Jl. Sudirman No. 123',
        city: 'Jakarta',
        province: 'DKI Jakarta',
        postalCode: '12930',
      },
      contactInfo: {
        phone: '021-5551234',
        email: 'ho@samudrapaket.id',
      },
      divisions: [
        {
          name: 'Finance Division',
          code: 'FIN',
          description: 'Handles all financial matters',
        },
        {
          name: 'Operations Division',
          code: 'OPS',
          description: 'Manages daily operations',
        },
      ],
    });

    // Check divisions
    expect(branch.divisions).toHaveLength(2);
    expect(branch.divisions[0].name).toBe('Finance Division');
    expect(branch.divisions[1].code).toBe('OPS');

    // Add a new division
    branch.divisions.push({
      name: 'Human Resources',
      code: 'HR',
      description: 'Manages personnel',
    });

    await branch.save();

    // Retrieve updated branch
    const updatedBranch = await Branch.findById(branch._id);

    // Check updated divisions
    expect(updatedBranch.divisions).toHaveLength(3);
    expect(updatedBranch.divisions[2].name).toBe('Human Resources');
  });

  it('should get branch hierarchy', async () => {
    // Create parent branch
    const headOffice = await Branch.create({
      code: 'HO001',
      name: 'Head Office Jakarta',
      address: {
        street: 'Jl. Sudirman No. 123',
        city: 'Jakarta',
        province: 'DKI Jakarta',
        postalCode: '12930',
      },
      contactInfo: {
        phone: '021-5551234',
        email: 'ho@samudrapaket.id',
      },
    });

    // Create child branch
    const branch1 = await Branch.create({
      code: 'BR001',
      name: 'Branch Bandung',
      address: {
        street: 'Jl. Asia Afrika No. 56',
        city: 'Bandung',
        province: 'Jawa Barat',
        postalCode: '40112',
      },
      contactInfo: {
        phone: '022-4231234',
        email: 'bandung@samudrapaket.id',
      },
      parentBranch: headOffice._id,
    });

    // Create sub-branch
    await Branch.create({
      code: 'SB001',
      name: 'Sub-Branch Cimahi',
      address: {
        street: 'Jl. Cihampelas No. 78',
        city: 'Cimahi',
        province: 'Jawa Barat',
        postalCode: '40526',
      },
      contactInfo: {
        phone: '022-6651234',
        email: 'cimahi@samudrapaket.id',
      },
      parentBranch: branch1._id,
    });

    // Get hierarchy - only root branches (parentBranch: null)
    const hierarchy = await Branch.getHierarchy();

    // Check hierarchy structure
    expect(hierarchy).toHaveLength(1); // Only head office at root level
    expect(hierarchy[0].name).toBe('Head Office Jakarta');

    // The childBranches virtual should be populated with direct children
    expect(hierarchy[0].childBranches).toBeDefined();
    expect(hierarchy[0].childBranches).toHaveLength(1); // One branch under head office
    expect(hierarchy[0].childBranches[0].code).toBe('BR001');
    expect(hierarchy[0].childBranches[0].name).toBe('Branch Bandung');

    // Check that the sub-branch is populated as a child of the Bandung branch
    const bandungBranch = hierarchy[0].childBranches[0];
    expect(bandungBranch.childBranches).toBeDefined();
    expect(bandungBranch.childBranches).toHaveLength(1); // One sub-branch under Bandung
    expect(bandungBranch.childBranches[0].name).toBe('Sub-Branch Cimahi');
  });
});
