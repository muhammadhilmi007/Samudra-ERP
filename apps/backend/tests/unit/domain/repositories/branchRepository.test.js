/**
 * Samudra Paket ERP - Branch Repository Unit Tests
 */

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Branch = require('../../../../src/domain/models/branch');
const branchRepository = require('../../../../src/domain/repositories/branchRepository');

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

describe('Branch Repository', () => {
  // Sample branch data for testing
  const sampleBranch = {
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

  describe('createBranch', () => {
    it('should create a branch successfully', async () => {
      const branch = await branchRepository.createBranch(sampleBranch);

      expect(branch._id).toBeDefined();
      expect(branch.code).toBe('HO001');
      expect(branch.name).toBe('Head Office Jakarta');
      expect(branch.status).toBe('active');
    });
  });

  describe('getAllBranches', () => {
    beforeEach(async () => {
      // Create multiple branches for testing
      await branchRepository.createBranch({
        ...sampleBranch,
        code: 'HO001',
        name: 'Head Office Jakarta',
      });

      await branchRepository.createBranch({
        ...sampleBranch,
        code: 'BR001',
        name: 'Branch Bandung',
        address: {
          ...sampleBranch.address,
          city: 'Bandung',
          province: 'Jawa Barat',
        },
      });

      await branchRepository.createBranch({
        ...sampleBranch,
        code: 'BR002',
        name: 'Branch Surabaya',
        address: {
          ...sampleBranch.address,
          city: 'Surabaya',
          province: 'Jawa Timur',
        },
      });
    });

    it('should get all branches with pagination', async () => {
      const result = await branchRepository.getAllBranches({}, { page: 1, limit: 2 });

      expect(result.data).toHaveLength(2);
      expect(result.meta.total).toBe(3);
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(2);
      expect(result.meta.totalPages).toBe(2);
    });

    it('should filter branches by name', async () => {
      // eslint-disable-next-line max-len
      const result = await branchRepository.getAllBranches({ name: { $regex: 'Branch', $options: 'i' } });

      expect(result.data).toHaveLength(2);
      expect(result.data[0].name).toMatch(/Branch/);
      expect(result.data[1].name).toMatch(/Branch/);
    });

    it('should filter branches by city', async () => {
      const result = await branchRepository.getAllBranches({ 'address.city': 'Bandung' });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].address.city).toBe('Bandung');
    });

    it('should sort branches by name', async () => {
      // eslint-disable-next-line max-len
      const result = await branchRepository.getAllBranches({}, { sortBy: 'name', sortOrder: 'asc' });

      expect(result.data).toHaveLength(3);
      expect(result.data[0].name).toBe('Branch Bandung');
      expect(result.data[1].name).toBe('Branch Surabaya');
      expect(result.data[2].name).toBe('Head Office Jakarta');
    });
  });

  describe('getBranchById', () => {
    let branchId;

    beforeEach(async () => {
      const branch = await branchRepository.createBranch(sampleBranch);
      branchId = branch._id;
    });

    it('should get branch by ID', async () => {
      const branch = await branchRepository.getBranchById(branchId);

      expect(branch).toBeDefined();
      expect(branch._id.toString()).toBe(branchId.toString());
      expect(branch.code).toBe('HO001');
    });

    it('should return null for non-existent ID', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const branch = await branchRepository.getBranchById(nonExistentId);

      expect(branch).toBeNull();
    });
  });

  describe('getBranchByCode', () => {
    beforeEach(async () => {
      await branchRepository.createBranch(sampleBranch);
    });

    it('should get branch by code', async () => {
      const branch = await branchRepository.getBranchByCode('HO001');

      expect(branch).toBeDefined();
      expect(branch.code).toBe('HO001');
      expect(branch.name).toBe('Head Office Jakarta');
    });

    it('should handle case-insensitive code search', async () => {
      const branch = await branchRepository.getBranchByCode('ho001');

      expect(branch).toBeDefined();
      expect(branch.code).toBe('HO001');
    });

    it('should return null for non-existent code', async () => {
      const branch = await branchRepository.getBranchByCode('NONEXISTENT');

      expect(branch).toBeNull();
    });
  });

  describe('updateBranch', () => {
    let branchId;

    beforeEach(async () => {
      const branch = await branchRepository.createBranch(sampleBranch);
      branchId = branch._id;
    });

    it('should update branch successfully', async () => {
      const updateData = {
        name: 'Updated Head Office',
        contactInfo: {
          phone: '021-9876543',
          email: 'updated@samudrapaket.id',
        },
      };

      const updatedBranch = await branchRepository.updateBranch(branchId, updateData);

      expect(updatedBranch.name).toBe('Updated Head Office');
      expect(updatedBranch.contactInfo.phone).toBe('021-9876543');
      expect(updatedBranch.contactInfo.email).toBe('updated@samudrapaket.id');

      // Check that other fields remain unchanged
      expect(updatedBranch.code).toBe('HO001');
      expect(updatedBranch.address.city).toBe('Jakarta');
    });
  });

  describe('deleteBranch', () => {
    let branchId;

    beforeEach(async () => {
      const branch = await branchRepository.createBranch(sampleBranch);
      branchId = branch._id;
    });

    it('should delete branch successfully', async () => {
      const deletedBranch = await branchRepository.deleteBranch(branchId);

      expect(deletedBranch).toBeDefined();
      expect(deletedBranch._id.toString()).toBe(branchId.toString());

      // Verify branch is deleted
      const branch = await branchRepository.getBranchById(branchId);
      expect(branch).toBeNull();
    });
  });

  describe('searchBranches', () => {
    beforeEach(async () => {
      // Create multiple branches for testing
      await branchRepository.createBranch({
        ...sampleBranch,
        code: 'HO001',
        name: 'Head Office Jakarta',
      });

      await branchRepository.createBranch({
        ...sampleBranch,
        code: 'BR001',
        name: 'Branch Bandung',
        address: {
          ...sampleBranch.address,
          city: 'Bandung',
          province: 'Jawa Barat',
        },
      });

      await branchRepository.createBranch({
        ...sampleBranch,
        code: 'BR002',
        name: 'Branch Surabaya',
        address: {
          ...sampleBranch.address,
          city: 'Surabaya',
          province: 'Jawa Timur',
        },
        status: 'inactive',
      });
    });

    it('should search branches by name', async () => {
      const result = await branchRepository.searchBranches({ name: 'Office' });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].name).toBe('Head Office Jakarta');
    });

    it('should search branches by code', async () => {
      const result = await branchRepository.searchBranches({ code: 'BR' });

      expect(result.data).toHaveLength(2);
      expect(result.data[0].code).toMatch(/BR/);
      expect(result.data[1].code).toMatch(/BR/);
    });

    it('should search branches by city', async () => {
      const result = await branchRepository.searchBranches({ city: 'Bandung' });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].address.city).toBe('Bandung');
    });

    it('should search branches by province', async () => {
      const result = await branchRepository.searchBranches({ province: 'Jawa' });

      expect(result.data).toHaveLength(2);
      expect(result.data[0].address.province).toMatch(/Jawa/);
      expect(result.data[1].address.province).toMatch(/Jawa/);
    });

    it('should search branches by status', async () => {
      const result = await branchRepository.searchBranches({ status: 'inactive' });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].status).toBe('inactive');
      expect(result.data[0].name).toBe('Branch Surabaya');
    });

    it('should combine multiple search criteria', async () => {
      const result = await branchRepository.searchBranches({
        name: 'Branch',
        province: 'Jawa Barat',
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].name).toBe('Branch Bandung');
      expect(result.data[0].address.province).toBe('Jawa Barat');
    });
  });

  describe('updateBranchStatus', () => {
    let branchId;

    beforeEach(async () => {
      const branch = await branchRepository.createBranch(sampleBranch);
      branchId = branch._id;
    });

    it('should update branch status to inactive', async () => {
      const updatedBranch = await branchRepository.updateBranchStatus(branchId, 'inactive');

      expect(updatedBranch.status).toBe('inactive');

      // Verify status is updated in database
      const branch = await branchRepository.getBranchById(branchId);
      expect(branch.status).toBe('inactive');
    });

    it('should update branch status back to active', async () => {
      // First set to inactive
      await branchRepository.updateBranchStatus(branchId, 'inactive');

      // Then set back to active
      const updatedBranch = await branchRepository.updateBranchStatus(branchId, 'active');

      expect(updatedBranch.status).toBe('active');
    });

    it('should throw error for invalid status', async () => {
      await expect(
        branchRepository.updateBranchStatus(branchId, 'invalid-status'),
      ).rejects.toThrow('Invalid status');
    });
  });

  describe('Branch hierarchy', () => {
    let headOffice; let branch1;
    beforeEach(async () => {
      // Create head office
      headOffice = await branchRepository.createBranch({
        ...sampleBranch,
        code: 'HO001',
        name: 'Head Office Jakarta',
      });

      // Create branches under head office
      branch1 = await branchRepository.createBranch({
        ...sampleBranch,
        code: 'BR001',
        name: 'Branch Bandung',
        address: {
          ...sampleBranch.address,
          city: 'Bandung',
          province: 'Jawa Barat',
        },
        parentBranch: headOffice._id,
      });

      // Create second branch under head office
      await branchRepository.createBranch({
        ...sampleBranch,
        code: 'BR002',
        name: 'Branch Surabaya',
        address: {
          ...sampleBranch.address,
          city: 'Surabaya',
          province: 'Jawa Timur',
        },
        parentBranch: headOffice._id,
      });

      // Create sub-branch under branch1
      await branchRepository.createBranch({
        ...sampleBranch,
        code: 'SB001',
        name: 'Sub-Branch Cimahi',
        address: {
          ...sampleBranch.address,
          city: 'Cimahi',
          province: 'Jawa Barat',
        },
        parentBranch: branch1._id,
      });
    });

    it('should get branch hierarchy starting from root', async () => {
      const hierarchy = await branchRepository.getBranchHierarchy();

      expect(hierarchy).toHaveLength(1); // Only head office at root
      expect(hierarchy[0].name).toBe('Head Office Jakarta');
      expect(hierarchy[0].childBranches).toHaveLength(2);

      // Find Bandung branch and check its children
      const bandungBranch = hierarchy[0].childBranches.find((b) => b.code === 'BR001');
      expect(bandungBranch).toBeDefined();
      expect(bandungBranch.childBranches).toHaveLength(1);
      expect(bandungBranch.childBranches[0].name).toBe('Sub-Branch Cimahi');
    });

    it('should get branch hierarchy starting from specific branch', async () => {
      const hierarchy = await branchRepository.getBranchHierarchy(branch1._id);

      expect(hierarchy).toHaveLength(1);
      expect(hierarchy[0].name).toBe('Branch Bandung');
      expect(hierarchy[0].childBranches).toHaveLength(1);
      expect(hierarchy[0].childBranches[0].name).toBe('Sub-Branch Cimahi');
    });

    it('should get branch descendants', async () => {
      const descendants = await branchRepository.getBranchDescendants(headOffice._id);

      expect(descendants).toHaveLength(3); // 2 branches + 1 sub-branch

      const codes = descendants.map((b) => b.code);
      expect(codes).toContain('BR001');
      expect(codes).toContain('BR002');
      expect(codes).toContain('SB001');
    });
  });

  describe('Division management', () => {
    let branchId;

    beforeEach(async () => {
      const branch = await branchRepository.createBranch(sampleBranch);
      branchId = branch._id;
    });

    it('should add division to branch', async () => {
      const divisionData = {
        name: 'Finance Division',
        code: 'FIN',
        description: 'Handles all financial matters',
      };

      const branch = await branchRepository.addDivision(branchId, divisionData);

      expect(branch.divisions).toHaveLength(1);
      expect(branch.divisions[0].name).toBe('Finance Division');
      expect(branch.divisions[0].code).toBe('FIN');
      expect(branch.divisions[0].status).toBe('active'); // Default value
    });

    it('should update division', async () => {
      // First add a division
      const branch = await branchRepository.addDivision(branchId, {
        name: 'Finance Division',
        code: 'FIN',
        description: 'Handles all financial matters',
      });

      const divisionId = branch.divisions[0]._id.toString();

      // Update the division
      const updateData = {
        name: 'Updated Finance Division',
        description: 'Updated description',
      };

      const updatedBranch = await branchRepository.updateDivision(branchId, divisionId, updateData);

      expect(updatedBranch.divisions).toHaveLength(1);
      expect(updatedBranch.divisions[0].name).toBe('Updated Finance Division');
      expect(updatedBranch.divisions[0].description).toBe('Updated description');
      expect(updatedBranch.divisions[0].code).toBe('FIN'); // Should remain unchanged
    });

    it('should remove division', async () => {
      // First add divisions
      const branch = await branchRepository.addDivision(branchId, {
        name: 'Finance Division',
        code: 'FIN',
      });

      await branchRepository.addDivision(branchId, {
        name: 'Operations Division',
        code: 'OPS',
      });

      const divisionId = branch.divisions[0]._id.toString();

      // Remove the first division
      const updatedBranch = await branchRepository.removeDivision(branchId, divisionId);

      expect(updatedBranch.divisions).toHaveLength(1);
      expect(updatedBranch.divisions[0].code).toBe('OPS');
    });

    it('should throw error when branch not found', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();

      await expect(
        branchRepository.addDivision(nonExistentId, { name: 'Test', code: 'TEST' }),
      ).rejects.toThrow('Branch not found');
    });

    it('should throw error when division not found', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();

      await expect(
        branchRepository.updateDivision(branchId, nonExistentId, { name: 'Test' }),
      ).rejects.toThrow('Division not found');
    });
  });
});
