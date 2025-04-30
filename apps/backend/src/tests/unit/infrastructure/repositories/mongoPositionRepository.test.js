/**
 * Samudra Paket ERP - MongoDB Position Repository Unit Tests
 */

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const MongoPositionRepository = require('../../../../infrastructure/repositories/mongoPositionRepository');
const Position = require('../../../../domain/models/position');
const Division = require('../../../../domain/models/division');
const { NotFoundError } = require('../../../../domain/utils/errorUtils');

let mongoServer;
let positionRepository;
let divisionId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
  positionRepository = new MongoPositionRepository();
  
  // Create a division to use in tests
  const division = new Division({
    code: 'DIV001',
    name: 'Test Division',
    branch: new mongoose.Types.ObjectId(),
  });
  await division.save();
  divisionId = division._id;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Position.deleteMany({});
});

describe('MongoPositionRepository', () => {
  describe('create', () => {
    it('should create a position successfully', async () => {
      const positionData = {
        code: 'POS001',
        title: 'Finance Manager',
        description: 'Manages financial operations',
        division: divisionId,
        responsibilities: ['Budget planning', 'Financial reporting'],
        status: 'active',
      };

      const position = await positionRepository.create(positionData);

      expect(position).toBeDefined();
      expect(position.code).toBe(positionData.code);
      expect(position.title).toBe(positionData.title);
      expect(position.description).toBe(positionData.description);
      expect(position.division.toString()).toBe(divisionId.toString());
      expect(position.responsibilities).toEqual(positionData.responsibilities);
      expect(position.status).toBe(positionData.status);
    });
  });

  describe('findById', () => {
    it('should find a position by ID', async () => {
      // Create a position first
      const positionData = {
        code: 'POS001',
        title: 'Finance Manager',
        division: divisionId,
      };
      const createdPosition = await positionRepository.create(positionData);

      // Find the position by ID
      const foundPosition = await positionRepository.findById(createdPosition.id);

      expect(foundPosition).toBeDefined();
      expect(foundPosition.id).toBe(createdPosition.id);
      expect(foundPosition.code).toBe(positionData.code);
      expect(foundPosition.title).toBe(positionData.title);
    });

    it('should return null if position not found', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const foundPosition = await positionRepository.findById(nonExistentId);

      expect(foundPosition).toBeNull();
    });
  });

  describe('findByQuery', () => {
    beforeEach(async () => {
      // Create test positions
      const positions = [
        {
          code: 'POS001',
          title: 'Finance Manager',
          division: divisionId,
          level: 1,
          status: 'active',
        },
        {
          code: 'POS002',
          title: 'HR Manager',
          division: divisionId,
          level: 1,
          status: 'active',
        },
        {
          code: 'POS003',
          title: 'IT Manager',
          division: divisionId,
          level: 1,
          status: 'inactive',
        },
      ];

      await Promise.all(positions.map(pos => positionRepository.create(pos)));
    });

    it('should find positions by query', async () => {
      const result = await positionRepository.findByQuery({ status: 'active' });

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      expect(result.data.length).toBe(2);
      expect(result.pagination).toBeDefined();
      expect(result.pagination.total).toBe(2);
    });

    it('should apply pagination correctly', async () => {
      const result = await positionRepository.findByQuery({}, { page: 1, limit: 2 });

      expect(result.data.length).toBe(2);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(2);
      expect(result.pagination.total).toBe(3);
      expect(result.pagination.pages).toBe(2);
    });

    it('should apply sorting correctly', async () => {
      const result = await positionRepository.findByQuery({}, { sortBy: 'code', sortOrder: 'asc' });

      expect(result.data[0].code).toBe('POS001');
      expect(result.data[1].code).toBe('POS002');
      expect(result.data[2].code).toBe('POS003');
    });
  });

  describe('update', () => {
    it('should update a position successfully', async () => {
      // Create a position first
      const positionData = {
        code: 'POS001',
        title: 'Finance Manager',
        division: divisionId,
      };
      const createdPosition = await positionRepository.create(positionData);

      // Update the position
      const updateData = {
        title: 'Senior Finance Manager',
        description: 'Senior role for financial operations',
      };
      const updatedPosition = await positionRepository.update(createdPosition.id, updateData);

      expect(updatedPosition).toBeDefined();
      expect(updatedPosition.id).toBe(createdPosition.id);
      expect(updatedPosition.code).toBe(positionData.code); // Unchanged
      expect(updatedPosition.title).toBe(updateData.title); // Updated
      expect(updatedPosition.description).toBe(updateData.description); // Updated
    });

    it('should throw NotFoundError if position not found', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      await expect(
        positionRepository.update(nonExistentId, { title: 'Updated Title' })
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('delete', () => {
    it('should delete a position successfully', async () => {
      // Create a position first
      const positionData = {
        code: 'POS001',
        title: 'Finance Manager',
        division: divisionId,
      };
      const createdPosition = await positionRepository.create(positionData);

      // Delete the position
      const result = await positionRepository.delete(createdPosition.id);
      expect(result).toBe(true);

      // Verify position is deleted
      const foundPosition = await positionRepository.findById(createdPosition.id);
      expect(foundPosition).toBeNull();
    });

    it('should throw NotFoundError if position not found', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      await expect(
        positionRepository.delete(nonExistentId)
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('hierarchy and relationships', () => {
    it('should get position hierarchy', async () => {
      // Create parent position
      const parentPosition = await positionRepository.create({
        code: 'POS001',
        title: 'Director',
        division: divisionId,
      });

      // Create child positions
      await positionRepository.create({
        code: 'POS002',
        title: 'Manager 1',
        division: divisionId,
        parentPosition: parentPosition.id,
      });

      await positionRepository.create({
        code: 'POS003',
        title: 'Manager 2',
        division: divisionId,
        parentPosition: parentPosition.id,
      });

      // Get hierarchy
      const hierarchy = await positionRepository.getHierarchy();
      
      expect(hierarchy).toBeDefined();
      expect(hierarchy.length).toBeGreaterThan(0);
      
      // Find the parent position in the hierarchy
      const parentInHierarchy = hierarchy.find(
        pos => pos._id.toString() === parentPosition.id
      );
      
      expect(parentInHierarchy).toBeDefined();
      expect(parentInHierarchy.subordinatePositions).toBeDefined();
      expect(parentInHierarchy.subordinatePositions.length).toBe(2);
    });

    it('should find positions by division', async () => {
      // Create positions for the division
      await positionRepository.create({
        code: 'POS001',
        title: 'Position 1',
        division: divisionId,
      });

      await positionRepository.create({
        code: 'POS002',
        title: 'Position 2',
        division: divisionId,
      });

      // Create position for another division
      const anotherDivisionId = new mongoose.Types.ObjectId();
      await positionRepository.create({
        code: 'POS003',
        title: 'Position 3',
        division: anotherDivisionId,
      });

      // Find positions by division
      const positions = await positionRepository.findByDivision(divisionId);
      
      expect(positions).toBeDefined();
      expect(positions.length).toBe(2);
      expect(positions[0].division.toString()).toBe(divisionId.toString());
      expect(positions[1].division.toString()).toBe(divisionId.toString());
    });

    it('should find subordinate positions', async () => {
      // Create parent position
      const parentPosition = await positionRepository.create({
        code: 'POS001',
        title: 'Director',
        division: divisionId,
      });

      // Create subordinate positions
      await positionRepository.create({
        code: 'POS002',
        title: 'Manager 1',
        division: divisionId,
        parentPosition: parentPosition.id,
      });

      await positionRepository.create({
        code: 'POS003',
        title: 'Manager 2',
        division: divisionId,
        parentPosition: parentPosition.id,
      });

      // Find subordinate positions
      const subordinates = await positionRepository.findSubordinates(parentPosition.id);
      
      expect(subordinates).toBeDefined();
      expect(subordinates.length).toBe(2);
      expect(subordinates[0].parentPosition.toString()).toBe(parentPosition.id);
      expect(subordinates[1].parentPosition.toString()).toBe(parentPosition.id);
    });
  });
});
