/**
 * Samudra Paket ERP - Position Controller Tests
 * Unit tests for position controller functionality
 */

const positionController = require('../../../../src/api/controllers/positionController');
// eslint-disable-next-line max-len
const MongoPositionRepository = require('../../../../src/infrastructure/repositories/mongoPositionRepository');
const { NotFoundError } = require('../../../../src/domain/utils/errorUtils');

// Mock the repository
jest.mock('../../../../src/infrastructure/repositories/mongoPositionRepository');

describe('Position Controller', () => {
  let req;
  let res;
  let next;
  let mockPosition;
  let mockRepositoryInstance;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup request and response mocks
    req = {
      params: {
        id: 'test-position-id',
        divisionId: 'test-division-id',
        parentId: 'test-parent-id',
      },
      body: {
        code: 'POS001',
        title: 'Test Position',
        division: 'test-division-id',
        description: 'Test position description',
        responsibilities: ['Responsibility 1', 'Responsibility 2'],
        requirements: {
          education: 'Bachelor Degree',
          experience: '2 years',
          skills: ['Skill 1', 'Skill 2'],
          certifications: ['Cert 1'],
        },
      },
      query: {},
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    next = jest.fn();

    // Setup mock position data
    mockPosition = {
      id: 'test-position-id',
      code: 'POS001',
      title: 'Test Position',
      division: 'test-division-id',
      description: 'Test position description',
      parentPosition: null,
      level: 0,
      responsibilities: ['Responsibility 1', 'Responsibility 2'],
      requirements: {
        education: 'Bachelor Degree',
        experience: '2 years',
        skills: ['Skill 1', 'Skill 2'],
        certifications: ['Cert 1'],
      },
      status: 'active',
    };

    // Setup mock pagination response
    const mockPaginatedResponse = {
      results: [mockPosition],
      pagination: {
        total: 1,
        page: 1,
        limit: 10,
        pages: 1,
      },
    };

    // Create a mock repository instance
    mockRepositoryInstance = {
      create: jest.fn().mockResolvedValue(mockPosition),
      findById: jest.fn().mockResolvedValue(mockPosition),
      findByQuery: jest.fn().mockResolvedValue(mockPaginatedResponse),
      update: jest.fn().mockResolvedValue(mockPosition),
      delete: jest.fn().mockResolvedValue(true),
      getHierarchy: jest.fn().mockResolvedValue([mockPosition]),
      findByDivision: jest.fn().mockResolvedValue([mockPosition]),
      findSubordinates: jest.fn().mockResolvedValue([mockPosition]),
    };

    // Mock the repository constructor to return our instance
    MongoPositionRepository.mockImplementation(() => mockRepositoryInstance);
  });

  describe('createPosition', () => {
    it('should create a position and return 201 status', async () => {
      await positionController.createPosition(req, res, next);

      expect(MongoPositionRepository).toHaveBeenCalledTimes(1);
      expect(mockRepositoryInstance.create).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockPosition,
        message: 'Position created successfully',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next with error if creation fails', async () => {
      const error = new Error('Creation failed');
      mockRepositoryInstance.create.mockRejectedValueOnce(error);

      await positionController.createPosition(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getAllPositions', () => {
    it('should return all positions with 200 status', async () => {
      req.query = {
        page: '1', limit: '10', sortBy: 'title', sortOrder: 'asc',
      };

      await positionController.getAllPositions(req, res, next);

      expect(MongoPositionRepository).toHaveBeenCalledTimes(1);
      expect(mockRepositoryInstance.findByQuery).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Positions retrieved successfully',
        }),
      );
    });

    it('should handle query filters correctly', async () => {
      req.query = {
        code: 'POS',
        title: 'Manager',
        division: 'test-division-id',
        parentPosition: 'test-parent-id',
        status: 'active',
        level: '1',
      };

      await positionController.getAllPositions(req, res, next);

      expect(mockRepositoryInstance.findByQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          code: expect.any(RegExp),
          title: expect.any(RegExp),
          division: 'test-division-id',
          parentPosition: 'test-parent-id',
          status: 'active',
          level: 1,
        }),
        expect.any(Object),
      );
    });

    it('should handle errors correctly', async () => {
      const error = new Error('Query failed');
      mockRepositoryInstance.findByQuery.mockRejectedValueOnce(error);

      await positionController.getAllPositions(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getPositionById', () => {
    it('should return a position with 200 status', async () => {
      await positionController.getPositionById(req, res, next);

      expect(MongoPositionRepository).toHaveBeenCalledTimes(1);
      expect(mockRepositoryInstance.findById).toHaveBeenCalledWith(
        'test-position-id',
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockPosition,
        message: 'Position retrieved successfully',
      });
    });

    it('should handle not found positions', async () => {
      mockRepositoryInstance.findById.mockResolvedValueOnce(null);

      await positionController.getPositionById(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(NotFoundError));
    });

    it('should handle errors correctly', async () => {
      const error = new Error('Find failed');
      mockRepositoryInstance.findById.mockRejectedValueOnce(error);

      await positionController.getPositionById(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('updatePosition', () => {
    it('should update a position and return 200 status', async () => {
      await positionController.updatePosition(req, res, next);

      expect(MongoPositionRepository).toHaveBeenCalledTimes(1);
      expect(mockRepositoryInstance.update).toHaveBeenCalledWith(
        'test-position-id',
        req.body,
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockPosition,
        message: 'Position updated successfully',
      });
    });

    it('should handle errors correctly', async () => {
      const error = new Error('Update failed');
      mockRepositoryInstance.update.mockRejectedValueOnce(error);

      await positionController.updatePosition(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('deletePosition', () => {
    it('should delete a position and return 200 status', async () => {
      await positionController.deletePosition(req, res, next);

      expect(MongoPositionRepository).toHaveBeenCalledTimes(1);
      expect(mockRepositoryInstance.delete).toHaveBeenCalledWith(
        'test-position-id',
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: null,
        message: 'Position deleted successfully',
      });
    });

    it('should handle errors correctly', async () => {
      const error = new Error('Delete failed');
      mockRepositoryInstance.delete.mockRejectedValueOnce(error);

      await positionController.deletePosition(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getPositionHierarchy', () => {
    it('should return position hierarchy with 200 status', async () => {
      req.query = { rootId: 'test-position-id' };

      await positionController.getPositionHierarchy(req, res, next);

      expect(MongoPositionRepository).toHaveBeenCalledTimes(1);
      expect(mockRepositoryInstance.getHierarchy).toHaveBeenCalledWith(
        'test-position-id',
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: [mockPosition],
        message: 'Position hierarchy retrieved successfully',
      });
    });

    it('should handle null rootId correctly', async () => {
      await positionController.getPositionHierarchy(req, res, next);

      expect(mockRepositoryInstance.getHierarchy).toHaveBeenCalledWith(null);
    });

    it('should handle errors correctly', async () => {
      const error = new Error('Hierarchy retrieval failed');
      mockRepositoryInstance.getHierarchy.mockRejectedValueOnce(error);

      await positionController.getPositionHierarchy(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getPositionsByDivision', () => {
    it('should return positions by division with 200 status', async () => {
      await positionController.getPositionsByDivision(req, res, next);

      expect(MongoPositionRepository).toHaveBeenCalledTimes(1);
      expect(mockRepositoryInstance.findByDivision).toHaveBeenCalledWith(
        'test-division-id',
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: [mockPosition],
        message: 'Positions retrieved successfully',
      });
    });

    it('should handle errors correctly', async () => {
      const error = new Error('Division query failed');
      mockRepositoryInstance.findByDivision.mockRejectedValueOnce(error);

      await positionController.getPositionsByDivision(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getSubordinatePositions', () => {
    it('should return subordinate positions with 200 status', async () => {
      await positionController.getSubordinatePositions(req, res, next);

      expect(MongoPositionRepository).toHaveBeenCalledTimes(1);
      expect(mockRepositoryInstance.findSubordinates).toHaveBeenCalledWith(
        'test-parent-id',
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: [mockPosition],
        message: 'Subordinate positions retrieved successfully',
      });
    });

    it('should handle errors correctly', async () => {
      const error = new Error('Subordinates query failed');
      mockRepositoryInstance.findSubordinates.mockRejectedValueOnce(error);

      await positionController.getSubordinatePositions(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});