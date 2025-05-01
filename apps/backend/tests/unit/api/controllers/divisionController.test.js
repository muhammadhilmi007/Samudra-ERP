/**
 * Samudra Paket ERP - Division Controller Tests
 * Unit tests for division controller functionality
 */

const divisionController = require('../../../../src/api/controllers/divisionController');
// eslint-disable-next-line max-len
const MongoDivisionRepository = require('../../../../src/infrastructure/repositories/mongoDivisionRepository');
const { NotFoundError } = require('../../../../src/domain/utils/errorUtils');

// Mock the repository
jest.mock('../../../../src/infrastructure/repositories/mongoDivisionRepository');

describe('Division Controller', () => {
  let req;
  let res;
  let next;
  let mockDivision;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup request and response mocks
    req = {
      params: { id: 'test-division-id', branchId: 'test-branch-id', parentId: 'test-parent-id' },
      body: {
        code: 'DIV001',
        name: 'Test Division',
        branch: 'test-branch-id',
        description: 'Test division description',
      },
      query: {},
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    next = jest.fn();

    // Setup mock division data
    mockDivision = {
      id: 'test-division-id',
      code: 'DIV001',
      name: 'Test Division',
      branch: 'test-branch-id',
      description: 'Test division description',
      parentDivision: null,
      level: 0,
      status: 'active',
    };

    // Setup repository method mocks
    MongoDivisionRepository.mockImplementation(() => ({
      create: jest.fn().mockResolvedValue(mockDivision),
      findById: jest.fn().mockResolvedValue(mockDivision),
      findByQuery: jest.fn().mockResolvedValue({
        results: [mockDivision],
        page: 1,
        limit: 10,
        totalResults: 1,
        totalPages: 1,
      }),
      update: jest.fn().mockResolvedValue(mockDivision),
      delete: jest.fn().mockResolvedValue(true),
      getHierarchy: jest.fn().mockResolvedValue([mockDivision]),
      findByBranch: jest.fn().mockResolvedValue([mockDivision]),
      findChildren: jest.fn().mockResolvedValue([mockDivision]),
    }));
  });

  describe('createDivision', () => {
    it('should create a division and return 201 status', async () => {
      await divisionController.createDivision(req, res, next);

      expect(MongoDivisionRepository).toHaveBeenCalledTimes(1);
      expect(MongoDivisionRepository.mock.instances[0].create).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockDivision,
        message: 'Division created successfully',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next with error if creation fails', async () => {
      const error = new Error('Creation failed');
      MongoDivisionRepository.mockImplementation(() => ({
        create: jest.fn().mockRejectedValue(error),
      }));

      await divisionController.createDivision(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getAllDivisions', () => {
    it('should return all divisions with 200 status', async () => {
      req.query = {
        page: '1', limit: '10', sortBy: 'name', sortOrder: 'asc',
      };

      await divisionController.getAllDivisions(req, res, next);

      expect(MongoDivisionRepository).toHaveBeenCalledTimes(1);
      expect(MongoDivisionRepository.mock.instances[0].findByQuery).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: [mockDivision],
        pagination: expect.any(Object),
        message: 'Divisions retrieved successfully',
      });
    });

    it('should handle query filters correctly', async () => {
      req.query = {
        branch: 'test-branch-id',
        parentDivision: 'test-parent-id',
        status: 'active',
      };

      await divisionController.getAllDivisions(req, res, next);

      expect(MongoDivisionRepository.mock.instances[0].findByQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          branch: 'test-branch-id',
          parentDivision: 'test-parent-id',
          status: 'active',
        }),
        expect.any(Object),
      );
    });

    it('should handle errors correctly', async () => {
      const error = new Error('Query failed');
      MongoDivisionRepository.mockImplementation(() => ({
        findByQuery: jest.fn().mockRejectedValue(error),
      }));

      await divisionController.getAllDivisions(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getDivisionById', () => {
    it('should return a division with 200 status', async () => {
      await divisionController.getDivisionById(req, res, next);

      expect(MongoDivisionRepository).toHaveBeenCalledTimes(1);
      expect(MongoDivisionRepository.mock.instances[0].findById).toHaveBeenCalledWith(
        'test-division-id',
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockDivision,
        message: 'Division retrieved successfully',
      });
    });

    it('should handle not found divisions', async () => {
      MongoDivisionRepository.mockImplementation(() => ({
        findById: jest.fn().mockResolvedValue(null),
      }));

      await divisionController.getDivisionById(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(NotFoundError));
    });

    it('should handle errors correctly', async () => {
      const error = new Error('Find failed');
      MongoDivisionRepository.mockImplementation(() => ({
        findById: jest.fn().mockRejectedValue(error),
      }));

      await divisionController.getDivisionById(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('updateDivision', () => {
    it('should update a division and return 200 status', async () => {
      await divisionController.updateDivision(req, res, next);

      expect(MongoDivisionRepository).toHaveBeenCalledTimes(1);
      expect(MongoDivisionRepository.mock.instances[0].update).toHaveBeenCalledWith(
        'test-division-id',
        req.body,
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockDivision,
        message: 'Division updated successfully',
      });
    });

    it('should handle errors correctly', async () => {
      const error = new Error('Update failed');
      MongoDivisionRepository.mockImplementation(() => ({
        update: jest.fn().mockRejectedValue(error),
      }));

      await divisionController.updateDivision(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('deleteDivision', () => {
    it('should delete a division and return 200 status', async () => {
      await divisionController.deleteDivision(req, res, next);

      expect(MongoDivisionRepository).toHaveBeenCalledTimes(1);
      expect(MongoDivisionRepository.mock.instances[0].delete).toHaveBeenCalledWith(
        'test-division-id',
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: null,
        message: 'Division deleted successfully',
      });
    });

    it('should handle errors correctly', async () => {
      const error = new Error('Delete failed');
      MongoDivisionRepository.mockImplementation(() => ({
        delete: jest.fn().mockRejectedValue(error),
      }));

      await divisionController.deleteDivision(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getDivisionHierarchy', () => {
    it('should return division hierarchy with 200 status', async () => {
      await divisionController.getDivisionHierarchy(req, res, next);

      expect(MongoDivisionRepository).toHaveBeenCalledTimes(1);
      expect(MongoDivisionRepository.mock.instances[0].getHierarchy).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: [mockDivision],
        message: 'Division hierarchy retrieved successfully',
      });
    });

    it('should handle errors correctly', async () => {
      const error = new Error('Hierarchy retrieval failed');
      MongoDivisionRepository.mockImplementation(() => ({
        getHierarchy: jest.fn().mockRejectedValue(error),
      }));

      await divisionController.getDivisionHierarchy(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getDivisionsByBranch', () => {
    it('should return divisions by branch with 200 status', async () => {
      await divisionController.getDivisionsByBranch(req, res, next);

      expect(MongoDivisionRepository).toHaveBeenCalledTimes(1);
      expect(MongoDivisionRepository.mock.instances[0].findByBranch).toHaveBeenCalledWith(
        'test-branch-id',
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: [mockDivision],
        message: 'Divisions retrieved successfully',
      });
    });

    it('should handle errors correctly', async () => {
      const error = new Error('Branch query failed');
      MongoDivisionRepository.mockImplementation(() => ({
        findByBranch: jest.fn().mockRejectedValue(error),
      }));

      await divisionController.getDivisionsByBranch(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getChildDivisions', () => {
    it('should return child divisions with 200 status', async () => {
      await divisionController.getChildDivisions(req, res, next);

      expect(MongoDivisionRepository).toHaveBeenCalledTimes(1);
      expect(MongoDivisionRepository.mock.instances[0].findChildren).toHaveBeenCalledWith(
        'test-parent-id',
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: [mockDivision],
        message: 'Child divisions retrieved successfully',
      });
    });

    it('should handle errors correctly', async () => {
      const error = new Error('Children query failed');
      MongoDivisionRepository.mockImplementation(() => ({
        findChildren: jest.fn().mockRejectedValue(error),
      }));

      await divisionController.getChildDivisions(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
