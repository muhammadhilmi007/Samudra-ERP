/**
 * Samudra Paket ERP - Division Controller Unit Tests
 */

const divisionController = require('../../../../api/controllers/divisionController');
// eslint-disable-next-line max-len
const MongoDivisionRepository = require('../../../../infrastructure/repositories/mongoDivisionRepository');

// Mock the NotFoundError
jest.mock('../../../../domain/utils/errorUtils', () => ({
  NotFoundError: jest.fn().mockImplementation((message) => ({
    message,
    name: 'NotFoundError',
  })),
}));

// Mock the repository
jest.mock('../../../../infrastructure/repositories/mongoDivisionRepository');

describe('Division Controller', () => {
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
      findByQuery: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      getHierarchy: jest.fn(),
      findByBranch: jest.fn(),
      findChildren: jest.fn(),
    };

    // Mock the repository constructor to return our mock instance
    MongoDivisionRepository.mockImplementation(() => mockRepository);
  });

  describe('createDivision', () => {
    it('should create a division and return 201 status', async () => {
      // Arrange
      const divisionData = {
        name: 'Finance Division',
        code: 'DIV001',
        branch: '60d21b4667d0d8992e610c85',
      };

      req.body = divisionData;

      const createdDivision = {
        id: '60d21b4667d0d8992e610c86',
        ...divisionData,
      };

      mockRepository.create.mockResolvedValue(createdDivision);

      // Act
      await divisionController.createDivision(req, res, next);

      // Assert
      expect(mockRepository.create).toHaveBeenCalledWith(divisionData);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: createdDivision,
        message: 'Division created successfully',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next with error if creation fails', async () => {
      // Arrange
      const error = new Error('Creation failed');

      mockRepository.create.mockRejectedValue(error);

      // Act
      await divisionController.createDivision(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('getAllDivisions', () => {
    it('should get all divisions with query parameters', async () => {
      // Arrange
      req.query = {
        page: '1',
        limit: '10',
        sortBy: 'name',
        sortOrder: 'asc',
        status: 'active',
      };

      const divisions = [
        { id: '1', code: 'DIV001', name: 'Finance Division' },
        { id: '2', code: 'DIV002', name: 'HR Division' },
      ];

      const result = {
        results: divisions,
        totalResults: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      mockRepository.findByQuery.mockResolvedValue(result);

      // Act
      await divisionController.getAllDivisions(req, res, next);

      // Assert
      expect(mockRepository.findByQuery).toHaveBeenCalledWith(
        { status: 'active' },
        expect.objectContaining({
          page: 1,
          limit: 10,
          sortBy: 'name',
          sortOrder: 'asc',
        }),
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: divisions,
        pagination: expect.any(Object),
        message: 'Divisions retrieved successfully',
      });
    });

    it('should call next with error if retrieval fails', async () => {
      // Arrange
      const error = new Error('Retrieval failed');

      mockRepository.findByQuery.mockRejectedValue(error);

      // Act
      await divisionController.getAllDivisions(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getDivisionById', () => {
    it('should get a division by ID', async () => {
      // Arrange
      const divisionId = '60d21b4667d0d8992e610c86';
      req.params = { id: divisionId };

      const division = {
        id: divisionId,
        code: 'DIV001',
        name: 'Finance Division',
      };

      mockRepository.findById.mockResolvedValue(division);

      // Act
      await divisionController.getDivisionById(req, res, next);

      // Assert
      expect(mockRepository.findById).toHaveBeenCalledWith(divisionId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: division,
        message: 'Division retrieved successfully',
      });
    });

    it('should handle not found division', async () => {
      // Arrange
      const divisionId = '60d21b4667d0d8992e610c86';
      req.params = { id: divisionId };

      mockRepository.findById.mockResolvedValue(null);

      // Act
      await divisionController.getDivisionById(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('not found'),
        }),
      );
    });
  });

  describe('updateDivision', () => {
    it('should update a division', async () => {
      // Arrange
      const divisionId = '60d21b4667d0d8992e610c86';
      const updateData = {
        name: 'Updated Finance Division',
        description: 'Updated description',
      };

      req.params = { id: divisionId };
      req.body = updateData;

      const updatedDivision = {
        id: divisionId,
        ...updateData,
      };

      mockRepository.update.mockResolvedValue(updatedDivision);

      // Act
      await divisionController.updateDivision(req, res, next);

      // Assert
      expect(mockRepository.update).toHaveBeenCalledWith(divisionId, updateData);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: updatedDivision,
        message: 'Division updated successfully',
      });
    });

    it('should call next with error if update fails', async () => {
      // Arrange
      const error = new Error('Update failed');

      mockRepository.update.mockRejectedValue(error);

      // Act
      await divisionController.updateDivision(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('deleteDivision', () => {
    it('should delete a division', async () => {
      // Arrange
      const divisionId = '60d21b4667d0d8992e610c86';
      req.params = { id: divisionId };

      mockRepository.delete.mockResolvedValue({ deleted: true });

      // Act
      await divisionController.deleteDivision(req, res, next);

      // Assert
      expect(mockRepository.delete).toHaveBeenCalledWith(divisionId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: null,
        message: 'Division deleted successfully',
      });
    });

    it('should call next with error if deletion fails', async () => {
      // Arrange
      const error = new Error('Deletion failed');

      mockRepository.delete.mockRejectedValue(error);

      // Act
      await divisionController.deleteDivision(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getDivisionHierarchy', () => {
    it('should get division hierarchy', async () => {
      // Arrange
      req.params = { id: '60d21b4667d0d8992e610c86' };

      const hierarchy = {
        division: {
          id: '60d21b4667d0d8992e610c86',
          name: 'Finance Division',
        },
        children: [],
      };

      mockRepository.getHierarchy.mockResolvedValue(hierarchy);

      // Act
      await divisionController.getDivisionHierarchy(req, res, next);

      // Assert
      expect(mockRepository.getHierarchy).toHaveBeenCalledWith('60d21b4667d0d8992e610c86');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: hierarchy,
        message: 'Division hierarchy retrieved successfully',
      });
    });
  });

  describe('getDivisionsByBranch', () => {
    it('should get divisions by branch', async () => {
      // Arrange
      const branchId = '60d21b4667d0d8992e610c85';
      req.params = { branchId };

      const divisions = [
        {
          id: '1', code: 'DIV001', name: 'Finance Division', branch: branchId,
        },
        {
          id: '2', code: 'DIV002', name: 'HR Division', branch: branchId,
        },
      ];

      mockRepository.findByBranch.mockResolvedValue(divisions);

      // Act
      await divisionController.getDivisionsByBranch(req, res, next);

      // Assert
      expect(mockRepository.findByBranch).toHaveBeenCalledWith(branchId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: divisions,
        message: 'Divisions retrieved successfully',
      });
    });
  });

  describe('getChildDivisions', () => {
    it('should get child divisions', async () => {
      // Arrange
      const parentId = '60d21b4667d0d8992e610c86';
      req.params = { parentId };

      const childDivisions = [
        {
          id: '1', code: 'DIV001', name: 'Division 1', parentDivision: parentId,
        },
        {
          id: '2', code: 'DIV002', name: 'Division 2', parentDivision: parentId,
        },
      ];

      mockRepository.findChildren.mockResolvedValue(childDivisions);

      // Act
      await divisionController.getChildDivisions(req, res, next);

      // Assert
      expect(mockRepository.findChildren).toHaveBeenCalledWith(parentId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: childDivisions,
        message: 'Child divisions retrieved successfully',
      });
    });
  });
});
