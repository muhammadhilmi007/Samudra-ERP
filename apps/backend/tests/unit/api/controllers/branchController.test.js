/**
 * Samudra Paket ERP - Branch Controller Unit Tests
 */

const branchController = require('../../../../src/api/controllers/branchController');
const branchRepository = require('../../../../src/domain/repositories/branchRepository');
const { validateBranchInput } = require('../../../../src/api/validators/branchValidator');

// Mock dependencies
jest.mock('../../../../src/domain/repositories/branchRepository');
jest.mock('../../../../src/api/validators/branchValidator');

describe('Branch Controller', () => {
  let req;
  let res;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock request and response
    req = {
      params: {},
      query: {},
      body: {},
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe('createBranch', () => {
    const validBranchData = {
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

    it('should create branch successfully', async () => {
      // Setup
      req.body = validBranchData;

      validateBranchInput.mockReturnValue({ error: null, value: validBranchData });
      branchRepository.getBranchByCode.mockResolvedValue(null);
      branchRepository.createBranch.mockResolvedValue({ ...validBranchData, _id: 'branch-id' });

      // Execute
      await branchController.createBranch(req, res);

      // Assert
      expect(validateBranchInput).toHaveBeenCalledTimes(1);
      expect(validateBranchInput).toHaveBeenCalledWith(validBranchData);
      expect(branchRepository.getBranchByCode).toHaveBeenCalledTimes(1);
      expect(branchRepository.getBranchByCode).toHaveBeenCalledWith('HO001');
      expect(branchRepository.createBranch).toHaveBeenCalledTimes(1);
      expect(branchRepository.createBranch).toHaveBeenCalledWith(validBranchData);
      expect(res.status).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({ code: 'HO001' }),
        meta: {},
      });
    });

    it('should return validation error', async () => {
      // Setup
      req.body = { code: 'INVALID' };

      const validationError = {
        details: [{ message: 'Name is required' }],
      };

      validateBranchInput.mockReturnValue({ error: validationError, value: req.body });

      // Execute
      await branchController.createBranch(req, res);

      // Assert
      expect(validateBranchInput).toHaveBeenCalledTimes(1);
      expect(validateBranchInput).toHaveBeenCalledWith(req.body);
      expect(branchRepository.getBranchByCode).not.toHaveBeenCalled();
      expect(branchRepository.createBranch).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.objectContaining({
          code: 'VALIDATION_ERROR',
          details: validationError.details,
        }),
      });
    });

    it('should return error for duplicate branch code', async () => {
      // Setup
      req.body = validBranchData;

      validateBranchInput.mockReturnValue({ error: null, value: validBranchData });
      // eslint-disable-next-line max-len
      branchRepository.getBranchByCode.mockResolvedValue({ code: 'HO001', name: 'Existing Branch' });

      // Execute
      await branchController.createBranch(req, res);

      // Assert
      expect(validateBranchInput).toHaveBeenCalledTimes(1);
      expect(validateBranchInput).toHaveBeenCalledWith(validBranchData);
      expect(branchRepository.getBranchByCode).toHaveBeenCalledTimes(1);
      expect(branchRepository.getBranchByCode).toHaveBeenCalledWith('HO001');
      expect(branchRepository.createBranch).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.objectContaining({
          code: 'DUPLICATE_BRANCH',
        }),
      });
    });
  });

  describe('getAllBranches', () => {
    it('should get all branches with filters and pagination', async () => {
      // Setup
      req.query = {
        page: '2',
        limit: '10',
        name: 'Office',
        city: 'Jakarta',
        status: 'active',
      };

      const branches = [
        { code: 'HO001', name: 'Head Office Jakarta' },
        { code: 'BR001', name: 'Branch Office Bandung' },
      ];

      branchRepository.getAllBranches.mockResolvedValue({
        data: branches,
        meta: {
          total: 15,
          page: 2,
          limit: 10,
          totalPages: 2,
        },
      });

      // Execute
      await branchController.getAllBranches(req, res);

      // Assert
      expect(branchRepository.getAllBranches).toHaveBeenCalledTimes(1);
      expect(branchRepository.getAllBranches).toHaveBeenCalledWith(
        expect.objectContaining({
          name: expect.any(Object),
          'address.city': expect.any(Object),
          status: 'active',
        }),
        expect.objectContaining({
          page: 2,
          limit: 10,
        }),
      );

      expect(res.status).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: branches,
        meta: expect.objectContaining({
          total: 15,
          page: 2,
        }),
      });
    });
  });

  describe('getBranchById', () => {
    it('should get branch by ID', async () => {
      // Setup
      req.params = { id: 'branch-id' };
      req.query = { populate: 'parentBranch,childBranches' };

      const branch = {
        _id: 'branch-id',
        code: 'HO001',
        name: 'Head Office Jakarta',
      };

      branchRepository.getBranchById.mockResolvedValue(branch);

      // Execute
      await branchController.getBranchById(req, res);

      // Assert
      expect(branchRepository.getBranchById).toHaveBeenCalledTimes(1);
      expect(branchRepository.getBranchById).toHaveBeenCalledWith(
        'branch-id',
        ['parentBranch', 'childBranches'],
      );

      expect(res.status).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: branch,
        meta: {},
      });
    });

    it('should return 404 for non-existent branch', async () => {
      // Setup
      req.params = { id: 'non-existent-id' };

      branchRepository.getBranchById.mockResolvedValue(null);

      // Execute
      await branchController.getBranchById(req, res);

      // Assert
      expect(branchRepository.getBranchById).toHaveBeenCalledTimes(1);
      expect(branchRepository.getBranchById).toHaveBeenCalledWith(
        'non-existent-id',
        [],
      );

      expect(res.status).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.objectContaining({
          code: 'BRANCH_NOT_FOUND',
        }),
      });
    });
  });

  // Additional test cases for other controller methods would follow the same pattern
});
