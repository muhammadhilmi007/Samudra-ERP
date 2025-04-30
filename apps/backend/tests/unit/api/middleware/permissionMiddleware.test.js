/**
 * Samudra Paket ERP - Permission Middleware Tests
 * Unit tests for the permission middleware
 */

// Mock dependencies
jest.mock('../../../../src/domain/utils/errorUtils');
jest.mock('../../../../src/api/middleware/gateway/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

// Import dependencies
const { createApiError } = require('../../../../src/domain/utils/errorUtils');

// Create a mock for MongoUserRepository
const findByIdMock = jest.fn();
const mockUserRepo = {
  findById: findByIdMock,
};

// Mock the MongoUserRepository module
jest.mock(
  '../../../../src/infrastructure/repositories/mongoUserRepository',
  () => jest.fn(() => mockUserRepo),
);

// Import middleware functions after mocking
const {
  checkPermission,
  checkResourcePermission,
  checkAllPermissions,
} = require('../../../../src/api/middleware/permissionMiddleware');

describe('Permission Middleware', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    findByIdMock.mockReset();

    // Setup request, response, and next function
    req = {
      headers: {},
      user: {
        id: 'user123',
        username: 'testuser',
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    next = jest.fn();

    // Mock createApiError implementation
    createApiError.mockImplementation((code, message) => ({
      success: false,
      error: { code, message },
    }));
  });

  describe('checkPermission', () => {
    let permissionMiddleware;

    beforeEach(() => {
      // Create a test user with permissions
      const mockUser = {
        id: 'user123',
        username: 'testuser',
        permissions: ['USER_READ', 'USER_CREATE', 'ROLE_READ'],
      };

      // Reset mocks before each test
      findByIdMock.mockReset();
      // Mock the userRepository to return our mock user
      findByIdMock.mockResolvedValue(mockUser);
    });

    it('should return 401 if user is not found', async () => {
      // Create middleware with required permission
      permissionMiddleware = checkPermission('USER_DELETE');

      // Mock findById to return null (user not found)
      findByIdMock.mockResolvedValue(null);

      // Call the middleware
      await permissionMiddleware(req, res, next);

      // Verify response
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'User not found' },
      }));
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 403 if user does not have required permission', async () => {
      // Create middleware with required permission that user doesn't have
      permissionMiddleware = checkPermission('USER_DELETE');

      // Call the middleware
      await permissionMiddleware(req, res, next);

      // Verify response
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: { code: 'FORBIDDEN', message: 'You do not have permission to perform this action' },
      }));
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next() if user has the required permission', async () => {
      // Create middleware with required permission that user has
      permissionMiddleware = checkPermission('USER_READ');

      // Call the middleware
      await permissionMiddleware(req, res, next);

      // Verify next was called
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should call next() if user has ALL permission', async () => {
      // Mock user with ALL permission
      findByIdMock.mockResolvedValue({
        id: 'user123',
        username: 'testuser',
        permissions: ['ALL'],
      });

      // Create middleware with any permission
      permissionMiddleware = checkPermission('SOME_RANDOM_PERMISSION');

      // Call the middleware
      await permissionMiddleware(req, res, next);

      // Verify next was called
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should support arrays of required permissions (AND logic)', async () => {
      // Create middleware with multiple required permissions
      permissionMiddleware = checkPermission(['USER_READ', 'USER_CREATE']);

      // Call the middleware
      await permissionMiddleware(req, res, next);

      // Verify next was called
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should return 403 if user has some but not all required permissions', async () => {
      // Create middleware with multiple required permissions, one of which user doesn't have
      permissionMiddleware = checkPermission(['USER_READ', 'USER_DELETE']);

      // Call the middleware
      await permissionMiddleware(req, res, next);

      // Verify response
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: { code: 'FORBIDDEN', message: 'You do not have permission to perform this action' },
      }));
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('checkAllPermissions', () => {
    let permissionMiddleware;

    beforeEach(() => {
      // Create a test user with permissions
      const mockUser = {
        id: 'user123',
        username: 'testuser',
        permissions: ['USER_READ', 'USER_CREATE', 'ROLE_READ'],
      };

      // Reset mocks before each test
      findByIdMock.mockReset();
      // Mock the userRepository to return our mock user
      findByIdMock.mockResolvedValue(mockUser);
    });

    it('should return 401 if user is not found', async () => {
      // Create middleware with required permissions
      permissionMiddleware = checkAllPermissions(['USER_READ', 'USER_DELETE']);

      // Mock findById to return null (user not found)
      findByIdMock.mockResolvedValue(null);

      // Call the middleware
      await permissionMiddleware(req, res, next);

      // Verify response
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'User not found' },
      }));
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 403 if user does not have all required permissions', async () => {
      // Create middleware with required permissions, one of which user doesn't have
      permissionMiddleware = checkAllPermissions(['USER_READ', 'USER_DELETE']);

      // Call the middleware
      await permissionMiddleware(req, res, next);

      // Verify response
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: { code: 'FORBIDDEN', message: 'You do not have all required permissions' },
      }));
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next() if user has all required permissions', async () => {
      // Create middleware with required permissions that user has
      permissionMiddleware = checkAllPermissions(['USER_READ', 'USER_CREATE']);

      // Call the middleware
      await permissionMiddleware(req, res, next);

      // Verify next was called
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should call next() if user has ALL permission', async () => {
      // Mock user with ALL permission
      findByIdMock.mockResolvedValue({
        id: 'user123',
        username: 'testuser',
        permissions: ['ALL'],
      });

      // Create middleware with any permissions
      permissionMiddleware = checkAllPermissions(['SOME_RANDOM_PERMISSION', 'ANOTHER_PERMISSION']);

      // Call the middleware
      await permissionMiddleware(req, res, next);

      // Verify next was called
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe('checkResourcePermission', () => {
    let resourcePermissionMiddleware;
    let resourceAccessFn;

    beforeEach(() => {
      // Create a test user with permissions
      const mockUser = {
        id: 'user123',
        username: 'testuser',
        permissions: ['USER_READ', 'USER_CREATE', 'ROLE_READ'],
      };

      // Reset mocks before each test
      findByIdMock.mockReset();
      // Mock the userRepository to return our mock user
      findByIdMock.mockResolvedValue(mockUser);

      // Create a mock resource access function
      resourceAccessFn = jest.fn().mockResolvedValue(true);
    });

    it('should call next() if user has permission and resource access', async () => {
      // Create middleware with required permission that user has
      resourcePermissionMiddleware = checkResourcePermission('USER_READ', resourceAccessFn);

      // Call the middleware
      await resourcePermissionMiddleware(req, res, next);

      // Verify next was called
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect(resourceAccessFn).toHaveBeenCalledWith(req);
    });

    it('should return 403 if user has permission but not resource access', async () => {
      // Mock resource access function to return false
      resourceAccessFn = jest.fn().mockResolvedValue(false);

      // Create middleware with required permission that user has
      resourcePermissionMiddleware = checkResourcePermission('USER_READ', resourceAccessFn);

      // Call the middleware
      await resourcePermissionMiddleware(req, res, next);

      // Verify response
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: { code: 'FORBIDDEN', message: 'You do not have permission to access this resource' },
      }));
      expect(next).not.toHaveBeenCalled();
      expect(resourceAccessFn).toHaveBeenCalledWith(req);
    });

    // eslint-disable-next-line max-len
    it('should return 403 if user does not have permission (resource access not checked)', async () => {
      // Create middleware with required permission that user doesn't have
      resourcePermissionMiddleware = checkResourcePermission('USER_DELETE', resourceAccessFn);

      // Call the middleware
      await resourcePermissionMiddleware(req, res, next);

      // Verify response
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: { code: 'FORBIDDEN', message: 'You do not have permission to perform this action' },
      }));
      expect(next).not.toHaveBeenCalled();
      expect(resourceAccessFn).not.toHaveBeenCalled();
    });
  });
});
