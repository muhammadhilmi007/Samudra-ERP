/**
 * Samudra Paket ERP - Branch Management Service Unit Tests
 */

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Branch = require('../../../../src/domain/models/branch');
const branchManagementService = require('../../../../src/domain/services/branchManagementService');

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

describe('Branch Management Service', () => {
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
      const branch = await branchManagementService.createBranch(sampleBranch);

      expect(branch._id).toBeDefined();
      expect(branch.code).toBe('HO001');
      expect(branch.name).toBe('Head Office Jakarta');
      expect(branch.status).toBe('active');
    });

    it('should generate a branch code if not provided', async () => {
      const branchData = { ...sampleBranch };
      delete branchData.code;

      const branch = await branchManagementService.createBranch(branchData);

      expect(branch._id).toBeDefined();
      expect(branch.code).toBeDefined();
      expect(branch.code).toMatch(/^JA\d{3}$/); // JA (Jakarta) + 3 digits
    });
  });

  describe('getAllBranches', () => {
    beforeEach(async () => {
      // Create multiple branches for testing
      await branchManagementService.createBranch({
        ...sampleBranch,
        code: 'HO001',
        name: 'Head Office Jakarta',
      });

      await branchManagementService.createBranch({
        ...sampleBranch,
        code: 'BR001',
        name: 'Branch Bandung',
        address: {
          ...sampleBranch.address,
          city: 'Bandung',
          province: 'Jawa Barat',
        },
      });

      await branchManagementService.createBranch({
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
      const result = await branchManagementService.getAllBranches({}, { page: 1, limit: 2 });

      expect(result.data).toHaveLength(2);
      expect(result.meta.total).toBe(3);
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(2);
      expect(result.meta.totalPages).toBe(2);
    });

    it('should filter branches by name', async () => {
      const result = await branchManagementService.searchBranches({ name: 'Branch' });

      expect(result.data).toHaveLength(2);
      expect(result.data[0].name).toMatch(/Branch/);
      expect(result.data[1].name).toMatch(/Branch/);
    });

    it('should filter branches by city', async () => {
      const result = await branchManagementService.searchBranches({ city: 'Bandung' });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].address.city).toBe('Bandung');
    });
  });

  describe('getBranchHierarchy', () => {
    let headOffice;
    let regionalBranch;
    let localBranch;

    beforeEach(async () => {
      // Create head office (level 0)
      headOffice = await branchManagementService.createBranch({
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

      // Create regional branch (level 1)
      regionalBranch = await branchManagementService.createBranch({
        code: 'RB001',
        name: 'Regional Jawa Barat',
        address: {
          street: 'Jl. Asia Afrika No. 56',
          city: 'Bandung',
          province: 'Jawa Barat',
          postalCode: '40112',
        },
        contactInfo: {
          phone: '022-4231234',
          email: 'jabar@samudrapaket.id',
        },
        parentBranch: headOffice._id,
      });

      // Create local branch (level 2)
      localBranch = await branchManagementService.createBranch({
        code: 'LB001',
        name: 'Local Branch Cimahi',
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
        parentBranch: regionalBranch._id,
      });
    });

    it('should get the full branch hierarchy', async () => {
      const hierarchy = await branchManagementService.getBranchHierarchy();

      expect(hierarchy).toHaveLength(1); // Only head office at the top level
      expect(hierarchy[0].name).toBe('Head Office Jakarta');
      expect(hierarchy[0].childBranches).toHaveLength(1);
      expect(hierarchy[0].childBranches[0].name).toBe('Regional Jawa Barat');
      expect(hierarchy[0].childBranches[0].childBranches).toHaveLength(1);
      expect(hierarchy[0].childBranches[0].childBranches[0].name).toBe('Local Branch Cimahi');
    });

    it('should get a branch hierarchy from a specific branch', async () => {
      const hierarchy = await branchManagementService.getBranchHierarchy(regionalBranch._id);

      expect(hierarchy).toHaveLength(1);
      expect(hierarchy[0].name).toBe('Regional Jawa Barat');
      expect(hierarchy[0].childBranches).toHaveLength(1);
      expect(hierarchy[0].childBranches[0].name).toBe('Local Branch Cimahi');
    });

    it('should get branch descendants', async () => {
      const descendants = await branchManagementService.getBranchDescendants(headOffice._id);

      expect(descendants).toHaveLength(2);
      expect(descendants[0].name).toBe('Regional Jawa Barat');
      expect(descendants[1].name).toBe('Local Branch Cimahi');
    });
  });

  describe('updateBranchStatus', () => {
    let branch;

    beforeEach(async () => {
      branch = await branchManagementService.createBranch(sampleBranch);
    });

    it('should update branch status to inactive', async () => {
      const updatedBranch = await branchManagementService.updateBranchStatus(branch._id, 'inactive');

      expect(updatedBranch.status).toBe('inactive');
    });

    it('should update branch status to active', async () => {
      // First set to inactive
      await branchManagementService.updateBranchStatus(branch._id, 'inactive');
      
      // Then set back to active
      const updatedBranch = await branchManagementService.updateBranchStatus(branch._id, 'active');

      expect(updatedBranch.status).toBe('active');
    });

    it('should throw error for invalid status', async () => {
      await expect(
        branchManagementService.updateBranchStatus(branch._id, 'invalid'),
      ).rejects.toThrow('Invalid status');
    });

    it('should not allow setting a branch to inactive if it has active child branches', async () => {
      // Create a child branch
      const childBranch = await branchManagementService.createBranch({
        code: 'CH001',
        name: 'Child Branch',
        address: {
          street: 'Test Street',
          city: 'Test City',
          province: 'Test Province',
          postalCode: '12345',
        },
        contactInfo: {
          phone: '123-4567890',
          email: 'child@samudrapaket.id',
        },
        parentBranch: branch._id,
      });

      // Try to set parent to inactive
      await expect(
        branchManagementService.updateBranchStatus(branch._id, 'inactive'),
      ).rejects.toThrow('Cannot set branch to inactive while it has active child branches');
    });
  });

  describe('Division management', () => {
    let branch;

    beforeEach(async () => {
      branch = await branchManagementService.createBranch(sampleBranch);
    });

    it('should add a division to a branch', async () => {
      const divisionData = {
        name: 'Finance Division',
        code: 'FIN',
        description: 'Handles all financial matters',
      };

      const updatedBranch = await branchManagementService.addDivision(branch._id, divisionData);

      expect(updatedBranch.divisions).toHaveLength(1);
      expect(updatedBranch.divisions[0].name).toBe('Finance Division');
      expect(updatedBranch.divisions[0].code).toBe('FIN');
    });

    it('should generate a division code if not provided', async () => {
      const divisionData = {
        name: 'Operations Division',
        description: 'Manages daily operations',
      };

      const updatedBranch = await branchManagementService.addDivision(branch._id, divisionData);

      expect(updatedBranch.divisions).toHaveLength(1);
      expect(updatedBranch.divisions[0].name).toBe('Operations Division');
      expect(updatedBranch.divisions[0].code).toBeDefined();
      expect(updatedBranch.divisions[0].code).toMatch(/^OPE\d{2}$/); // OPE (Operations) + 2 digits
    });

    it('should update a division', async () => {
      // Add a division first
      const divisionData = {
        name: 'Finance Division',
        code: 'FIN',
        description: 'Handles all financial matters',
      };

      const branchWithDivision = await branchManagementService.addDivision(branch._id, divisionData);
      const divisionId = branchWithDivision.divisions[0]._id.toString();

      // Update the division
      const updateData = {
        name: 'Updated Finance Division',
        description: 'Updated description',
      };

      const updatedBranch = await branchManagementService.updateDivision(
        branch._id,
        divisionId,
        updateData,
      );

      const updatedDivision = updatedBranch.divisions.find(
        (div) => div._id.toString() === divisionId,
      );

      expect(updatedDivision.name).toBe('Updated Finance Division');
      expect(updatedDivision.description).toBe('Updated description');
      expect(updatedDivision.code).toBe('FIN'); // Code should remain unchanged
    });

    it('should remove a division', async () => {
      // Add a division first
      const divisionData = {
        name: 'Finance Division',
        code: 'FIN',
        description: 'Handles all financial matters',
      };

      const branchWithDivision = await branchManagementService.addDivision(branch._id, divisionData);
      const divisionId = branchWithDivision.divisions[0]._id.toString();

      // Remove the division
      const updatedBranch = await branchManagementService.removeDivision(branch._id, divisionId);

      expect(updatedBranch.divisions).toHaveLength(0);
    });

    it('should get divisions by branch', async () => {
      // Add multiple divisions
      await branchManagementService.addDivision(branch._id, {
        name: 'Finance Division',
        code: 'FIN',
        description: 'Handles all financial matters',
      });

      await branchManagementService.addDivision(branch._id, {
        name: 'Operations Division',
        code: 'OPS',
        description: 'Manages daily operations',
      });

      const divisions = await branchManagementService.getDivisionsByBranch(branch._id);

      expect(divisions).toHaveLength(2);
      expect(divisions[0].name).toBe('Finance Division');
      expect(divisions[1].name).toBe('Operations Division');
    });

    it('should update division status', async () => {
      // Add a division first
      const divisionData = {
        name: 'Finance Division',
        code: 'FIN',
        description: 'Handles all financial matters',
      };

      const branchWithDivision = await branchManagementService.addDivision(branch._id, divisionData);
      const divisionId = branchWithDivision.divisions[0]._id.toString();

      // Update the division status
      const updatedBranch = await branchManagementService.updateDivisionStatus(
        branch._id,
        divisionId,
        'inactive',
      );

      const updatedDivision = updatedBranch.divisions.find(
        (div) => div._id.toString() === divisionId,
      );

      expect(updatedDivision.status).toBe('inactive');
    });
  });
});
