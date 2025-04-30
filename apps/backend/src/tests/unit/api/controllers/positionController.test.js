/**
 * Samudra Paket ERP - Position Controller Unit Tests
 */

const positionController = require('../../../../api/controllers/positionController');
// eslint-disable-next-line max-len
const MongoPositionRepository = require('../../../../infrastructure/repositories/mongoPositionRepository');

// Mock the NotFoundError
jest.mock('../../../../domain/utils/errorUtils', () => ({
  NotFoundError: jest.fn().mockImplementation((message) => ({
    message,
    name: 'NotFoundError',
  })),
}));

// Mock the repository
jest.mock('../../../../infrastructure/repositories/mongoPositionRepository');

describe('Position Controller', () => {
  let req;
  let res;
  let next;

  let mockRepository;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock request, response, and next
    req = {
      body: {},
      params: {},
      query: {},
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    next = jest.fn();

    // Create mock repository methods
    mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByQuery: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      getHierarchy: jest.fn(),
      findByDivision: jest.fn(),
      findSubordinates: jest.fn(),
    };

    // Mock the repository constructor to return our mock instance
    MongoPositionRepository.mockImplementation(() => mockRepository);
  });

  describe('createPosition', () => {
    it('should create a position and return 201 status', async () => {
      // Arrange
      const positionData = {
        code: 'POS001',
        title: 'Finance Manager',
        division: '60d21b4667d0d8992e610c85',
      };

      req.body = positionData;

      const createdPosition = {
        id: '60d21b4667d0d8992e610c86',
        ...positionData,
      };

      mockRepository.create.mockResolvedValue(createdPosition);

      // Act
      await positionController.createPosition(req, res, next);

      // Assert
      expect(mockRepository.create).toHaveBeenCalledWith(positionData);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: createdPosition,
        message: 'Position created successfully',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next with error if creation fails', async () => {
      // Arrange
      const error = new Error('Creation failed');

      mockRepository.create.mockRejectedValue(error);

      // Act
      await positionController.createPosition(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('getAllPositions', () => {
    it('should get all positions with query parameters', async () => {
      // Arrange
      req.query = {
        page: '1',
        limit: '10',
        sortBy: 'title',
        sortOrder: 'asc',
        status: 'active',
        level: '1',
      };

      const positions = [
        { id: '1', code: 'POS001', title: 'Finance Manager' },
        { id: '2', code: 'POS002', title: 'HR Manager' },
      ];

      const result = {
        results: positions,
        totalResults: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
        pagination: {
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      };

      mockRepository.findByQuery.mockResolvedValue(result);

      // Act
      await positionController.getAllPositions(req, res, next);

      // Assert
      expect(mockRepository.findByQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'active',
          level: 1,
        }),
        expect.objectContaining({
          page: 1,
          limit: 10,
          sortBy: 'title',
          sortOrder: 'asc',
        }),
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: positions,
        meta: result.pagination,
        message: 'Positions retrieved successfully',
      });
    });

    it('should call next with error if retrieval fails', async () => {
      // Arrange
      const error = new Error('Retrieval failed');

      mockRepository.findByQuery.mockRejectedValue(error);

      // Act
      await positionController.getAllPositions(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getPositionById', () => {
    it('should get a position by ID', async () => {
      // Arrange
      const positionId = '60d21b4667d0d8992e610c86';
      req.params = { id: positionId };

      const position = {
        id: positionId,
        code: 'POS001',
        title: 'Finance Manager',
      };

      mockRepository.findById.mockResolvedValue(position);

      // Act
      await positionController.getPositionById(req, res, next);

      // Assert
      expect(mockRepository.findById).toHaveBeenCalledWith(positionId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: position,
        message: 'Position retrieved successfully',
      });
    });

    it('should handle not found position', async () => {
      // Arrange
      const positionId = '60d21b4667d0d8992e610c86';
      req.params = { id: positionId };

      mockRepository.findById.mockResolvedValue(null);

      // Act
      await positionController.getPositionById(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('not found'),
        }),
      );
    });
  });

  describe('updatePosition', () => {
    it('should update a position', async () => {
      // Arrange
      const positionId = '60d21b4667d0d8992e610c86';
      const updateData = {
        title: 'Senior Finance Manager',
        description: 'Updated description',
      };

      req.params = { id: positionId };
      req.body = updateData;

      const updatedPosition = {
        id: positionId,
        ...updateData,
      };

      mockRepository.update.mockResolvedValue(updatedPosition);

      // Act
      await positionController.updatePosition(req, res, next);

      // Assert
      expect(mockRepository.update).toHaveBeenCalledWith(positionId, updateData);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: updatedPosition,
        message: 'Position updated successfully',
      });
    });

    it('should call next with error if update fails', async () => {
      // Arrange
      const error = new Error('Update failed');

      mockRepository.update.mockRejectedValue(error);

      // Act
      await positionController.updatePosition(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('deletePosition', () => {
    it('should delete a position', async () => {
      // Arrange
      const positionId = '60d21b4667d0d8992e610c86';
      req.params = { id: positionId };

      mockRepository.delete.mockResolvedValue({ deleted: true });

      // Act
      await positionController.deletePosition(req, res, next);

      // Assert
      expect(mockRepository.delete).toHaveBeenCalledWith(positionId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: null,
        message: 'Position deleted successfully',
      });
    });

    it('should call next with error if deletion fails', async () => {
      // Arrange
      const error = new Error('Deletion failed');

      mockRepository.delete.mockRejectedValue(error);

      // Act
      await positionController.deletePosition(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getPositionHierarchy', () => {
    it('should get position hierarchy', async () => {
      // Arrange
      req.query = { rootId: '60d21b4667d0d8992e610c86' };

      const hierarchy = {
        position: {
          id: '60d21b4667d0d8992e610c86',
          title: 'CEO',
        },
        children: [],
      };

      mockRepository.getHierarchy.mockResolvedValue(hierarchy);

      // Act
      await positionController.getPositionHierarchy(req, res, next);

      // Assert
      expect(mockRepository.getHierarchy).toHaveBeenCalledWith('60d21b4667d0d8992e610c86');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: hierarchy,
        message: 'Position hierarchy retrieved successfully',
      });
    });
  });

  describe('getPositionsByDivision', () => {
    it('should get positions by division', async () => {
      // Arrange
      const divisionId = '60d21b4667d0d8992e610c85';
      req.params = { divisionId };

      const positions = [
        {
          id: '1', code: 'POS001', title: 'Finance Manager', division: divisionId,
        },
        {
          id: '2', code: 'POS002', title: 'Accountant', division: divisionId,
        },
      ];

      // eslint-disable-next-line no-shadow
      const mockRepository = new MongoPositionRepository();
      mockRepository.findByDivision.mockResolvedValue(positions);

      // Act
      await positionController.getPositionsByDivision(req, res, next);

      // Assert
      expect(mockRepository.findByDivision).toHaveBeenCalledWith(divisionId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: positions,
        message: 'Positions retrieved successfully',
      });
    });
  });

  describe('getSubordinatePositions', () => {
    it('should get subordinate positions', async () => {
      // Arrange
      const parentId = '60d21b4667d0d8992e610c86';
      req.params = { parentId };

      const subordinatePositions = [
        {
          id: '1', code: 'POS001', title: 'Manager 1', parentPosition: parentId,
        },
        {
          id: '2', code: 'POS002', title: 'Manager 2', parentPosition: parentId,
        },
      ];

      // eslint-disable-next-line no-shadow
      const mockRepository = new MongoPositionRepository();
      mockRepository.findSubordinates.mockResolvedValue(subordinatePositions);

      // Act
      await positionController.getSubordinatePositions(req, res, next);

      // Assert
      expect(mockRepository.findSubordinates).toHaveBeenCalledWith(parentId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: subordinatePositions,
        message: 'Subordinate positions retrieved successfully',
      });
    });
  });
});
