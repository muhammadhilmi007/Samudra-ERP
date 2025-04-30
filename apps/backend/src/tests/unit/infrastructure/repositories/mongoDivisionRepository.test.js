/**
 * Samudra Paket ERP - MongoDB Division Repository Unit Tests
 */

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const MongoDivisionRepository = require('../../../../infrastructure/repositories/mongoDivisionRepository');
const Division = require('../../../../domain/models/division');
const { NotFoundError } = require('../../../../domain/utils/errorUtils');

let mongoServer;
let divisionRepository;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
  divisionRepository = new MongoDivisionRepository();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Division.deleteMany({});
});

describe('MongoDivisionRepository', () => {
  describe('create', () => {
    it('should create a division successfully', async () => {
      const divisionData = {
        code: 'DIV001',
        name: 'Finance Division',
        description: 'Handles financial operations',
        branch: new mongoose.Types.ObjectId(),
        status: 'active',
      };

      const division = await divisionRepository.create(divisionData);

      expect(division).toBeDefined();
      expect(division.code).toBe(divisionData.code);
      expect(division.name).toBe(divisionData.name);
      expect(division.description).toBe(divisionData.description);
      expect(division.branch.toString()).toBe(divisionData.branch.toString());
      expect(division.status).toBe(divisionData.status);
    });
  });

  describe('findById', () => {
    it('should find a division by ID', async () => {
      // Create a division first
      const divisionData = {
        code: 'DIV001',
        name: 'Finance Division',
        branch: new mongoose.Types.ObjectId(),
      };
      const createdDivision = await divisionRepository.create(divisionData);

      // Find the division by ID
      const foundDivision = await divisionRepository.findById(createdDivision.id);

      expect(foundDivision).toBeDefined();
      expect(foundDivision.id).toBe(createdDivision.id);
      expect(foundDivision.code).toBe(divisionData.code);
      expect(foundDivision.name).toBe(divisionData.name);
    });

    it('should return null if division not found', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const foundDivision = await divisionRepository.findById(nonExistentId);

      expect(foundDivision).toBeNull();
    });
  });

  describe('findByQuery', () => {
    beforeEach(async () => {
      // Create test divisions
      const branch1 = new mongoose.Types.ObjectId();
      const branch2 = new mongoose.Types.ObjectId();

      const divisions = [
        {
          code: 'DIV001',
          name: 'Finance Division',
          branch: branch1,
          status: 'active',
        },
        {
          code: 'DIV002',
          name: 'HR Division',
          branch: branch1,
          status: 'active',
        },
        {
          code: 'DIV003',
          name: 'IT Division',
          branch: branch2,
          status: 'inactive',
        },
      ];

      await Promise.all(divisions.map(div => divisionRepository.create(div)));
    });

    it('should find divisions by query', async () => {
      const result = await divisionRepository.findByQuery({ status: 'active' });

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      expect(result.data.length).toBe(2);
      expect(result.pagination).toBeDefined();
      expect(result.pagination.total).toBe(2);
    });

    it('should apply pagination correctly', async () => {
      const result = await divisionRepository.findByQuery({}, { page: 1, limit: 2 });

      expect(result.data.length).toBe(2);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(2);
      expect(result.pagination.total).toBe(3);
      expect(result.pagination.pages).toBe(2);
    });

    it('should apply sorting correctly', async () => {
      const result = await divisionRepository.findByQuery({}, { sortBy: 'code', sortOrder: 'asc' });

      expect(result.data[0].code).toBe('DIV001');
      expect(result.data[1].code).toBe('DIV002');
      expect(result.data[2].code).toBe('DIV003');
    });
  });

  describe('update', () => {
    it('should update a division successfully', async () => {
      // Create a division first
      const divisionData = {
        code: 'DIV001',
        name: 'Finance Division',
        branch: new mongoose.Types.ObjectId(),
      };
      const createdDivision = await divisionRepository.create(divisionData);

      // Update the division
      const updateData = {
        name: 'Updated Finance Division',
        description: 'Updated description',
      };
      const updatedDivision = await divisionRepository.update(createdDivision.id, updateData);

      expect(updatedDivision).toBeDefined();
      expect(updatedDivision.id).toBe(createdDivision.id);
      expect(updatedDivision.code).toBe(divisionData.code); // Unchanged
      expect(updatedDivision.name).toBe(updateData.name); // Updated
      expect(updatedDivision.description).toBe(updateData.description); // Updated
    });

    it('should throw NotFoundError if division not found', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      await expect(
        divisionRepository.update(nonExistentId, { name: 'Updated Name' })
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('delete', () => {
    it('should delete a division successfully', async () => {
      // Create a division first
      const divisionData = {
        code: 'DIV001',
        name: 'Finance Division',
        branch: new mongoose.Types.ObjectId(),
      };
      const createdDivision = await divisionRepository.create(divisionData);

      // Delete the division
      const result = await divisionRepository.delete(createdDivision.id);
      expect(result).toBe(true);

      // Verify division is deleted
      const foundDivision = await divisionRepository.findById(createdDivision.id);
      expect(foundDivision).toBeNull();
    });

    it('should throw NotFoundError if division not found', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      await expect(
        divisionRepository.delete(nonExistentId)
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('hierarchy and relationships', () => {
    it('should get division hierarchy', async () => {
      // Create parent division
      const parentDivision = await divisionRepository.create({
        code: 'DIV001',
        name: 'Parent Division',
        branch: new mongoose.Types.ObjectId(),
      });

      // Create child divisions
      await divisionRepository.create({
        code: 'DIV002',
        name: 'Child Division 1',
        branch: new mongoose.Types.ObjectId(),
        parentDivision: parentDivision.id,
      });

      await divisionRepository.create({
        code: 'DIV003',
        name: 'Child Division 2',
        branch: new mongoose.Types.ObjectId(),
        parentDivision: parentDivision.id,
      });

      // Get hierarchy
      const hierarchy = await divisionRepository.getHierarchy();
      
      expect(hierarchy).toBeDefined();
      expect(hierarchy.length).toBeGreaterThan(0);
      
      // Find the parent division in the hierarchy
      const parentInHierarchy = hierarchy.find(
        div => div._id.toString() === parentDivision.id
      );
      
      expect(parentInHierarchy).toBeDefined();
      expect(parentInHierarchy.childDivisions).toBeDefined();
      expect(parentInHierarchy.childDivisions.length).toBe(2);
    });

    it('should find divisions by branch', async () => {
      const branchId = new mongoose.Types.ObjectId();
      
      // Create divisions for the branch
      await divisionRepository.create({
        code: 'DIV001',
        name: 'Division 1',
        branch: branchId,
      });

      await divisionRepository.create({
        code: 'DIV002',
        name: 'Division 2',
        branch: branchId,
      });

      // Create division for another branch
      await divisionRepository.create({
        code: 'DIV003',
        name: 'Division 3',
        branch: new mongoose.Types.ObjectId(),
      });

      // Find divisions by branch
      const divisions = await divisionRepository.findByBranch(branchId);
      
      expect(divisions).toBeDefined();
      expect(divisions.length).toBe(2);
      expect(divisions[0].branch.toString()).toBe(branchId.toString());
      expect(divisions[1].branch.toString()).toBe(branchId.toString());
    });

    it('should find child divisions', async () => {
      // Create parent division
      const parentDivision = await divisionRepository.create({
        code: 'DIV001',
        name: 'Parent Division',
        branch: new mongoose.Types.ObjectId(),
      });

      // Create child divisions
      await divisionRepository.create({
        code: 'DIV002',
        name: 'Child Division 1',
        branch: new mongoose.Types.ObjectId(),
        parentDivision: parentDivision.id,
      });

      await divisionRepository.create({
        code: 'DIV003',
        name: 'Child Division 2',
        branch: new mongoose.Types.ObjectId(),
        parentDivision: parentDivision.id,
      });

      // Find child divisions
      const childDivisions = await divisionRepository.findChildren(parentDivision.id);
      
      expect(childDivisions).toBeDefined();
      expect(childDivisions.length).toBe(2);
      expect(childDivisions[0].parentDivision.toString()).toBe(parentDivision.id);
      expect(childDivisions[1].parentDivision.toString()).toBe(parentDivision.id);
    });
  });
});
