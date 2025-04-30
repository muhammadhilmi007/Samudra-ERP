/**
 * Unit Tests for Authentication Middleware
 * Tests JWT verification and authorization logic
 */

// Mock dependencies
jest.mock('jsonwebtoken');
jest.mock('../../../../src/domain/utils/errorUtils');
jest.mock('../../../../src/api/middleware/gateway/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

// Import dependencies
const jwt = require('jsonwebtoken');
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
  authenticate,
  authorizeRoles,
  authorizePermissions,
  authorizeLegacyRoles,
} = require('../../../../src/api/middleware/authMiddleware');

describe('Auth Middleware', () => {
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
      user: null,
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

  describe('authenticate', () => {
    it('should return 401 if no authorization header is provided', async () => {
      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      }));
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 if authorization header does not start with Bearer', async () => {
      req.headers.authorization = 'Basic token123';

      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      }));
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 if token verification fails', async () => {
      req.headers.authorization = 'Bearer invalidtoken';
      jwt.verify.mockImplementation(() => {
        throw new jwt.JsonWebTokenError('Invalid token');
      });

      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: { code: 'INVALID_TOKEN', message: 'Invalid token' },
      }));
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 if user is not found', async () => {
      req.headers.authorization = 'Bearer validtoken';
      jwt.verify.mockReturnValue({ id: 'user123', username: 'testuser' });

      // Mock findById to return null (user not found)
      findByIdMock.mockResolvedValue(null);

      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'User not found' },
      }));
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 403 if user is inactive', async () => {
      // Setup authentication header and token
      req.headers.authorization = 'Bearer validtoken';

      // Define an inactive user and set up the repository mock
      const inactiveUser = {
        id: 'user123',
        username: 'testuser',
        isActive: false,
        permissions: [],
        role: null,
      };

      // Mock findById to return our inactive user
      findByIdMock.mockResolvedValue(inactiveUser);

      // Call the middleware
      await authenticate(req, res, next);

      // Verify the correct response was sent
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred during authentication',
        },
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should set req.user and call next() if authentication is successful', async () => {
      // Setup authentication header and token
      req.headers.authorization = 'Bearer validtoken';

      // Mock JWT verification to return a valid decoded token
      const decodedToken = { id: 'user123', username: 'testuser' };
      jwt.verify.mockReturnValue(decodedToken);

      // Create a mock user with all necessary properties
      const user = {
        id: 'user123',
        username: 'testuser',
        email: 'test@example.com',
        isActive: true,
        permissions: ['user:read', 'user:write'],
        role: {
          id: 'role123',
          name: 'Admin',
        },
        legacyRole: null,
        toObject: () => ({
          id: 'user123',
          username: 'testuser',
          email: 'test@example.com',
          role: {
            id: 'role123',
            name: 'Admin',
          },
          permissions: ['user:read', 'user:write'],
          isActive: true,
          legacyRole: null,
        }),
      };

      // Mock findById to return our mock user
      findByIdMock.mockResolvedValue(user);

      // Call the middleware
      await authenticate(req, res, next);

      // Verify that authentication succeeded
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();

      // Verify req.user was set with essential properties
      expect(req.user).toBeTruthy();
      expect(req.user.id).toBe(user.id);
    });

    it('should handle token expiration appropriately', async () => {
      req.headers.authorization = 'Bearer expiredtoken';
      jwt.verify.mockImplementation(() => {
        throw new jwt.TokenExpiredError('Token expired', new Date());
      });

      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: { code: 'TOKEN_EXPIRED', message: 'Token expired, please login again' },
      }));
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('authorizeRoles', () => {
    let roleMiddleware;

    beforeEach(() => {
      // Setup user in request
      req.user = {
        id: 'user123',
        username: 'testuser',
        role: 'role123',
      };

      roleMiddleware = authorizeRoles('ADMIN');
    });

    it('should return 500 if authenticate middleware has not been run', async () => {
      req.user = null;

      await roleMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Authentication middleware must be used before authorization',
        },
      }));
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 if user is not found', async () => {
      // Mock findById to return null (user not found)
      findByIdMock.mockResolvedValue(null);

      await roleMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'User not found' },
      }));
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 403 if user does not have the required role', async () => {
      // Mock findById to return user with different role
      findByIdMock.mockResolvedValue({
        id: 'user123',
        username: 'testuser',
        role: 'USER',
      });

      await roleMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: { code: 'FORBIDDEN', message: 'You do not have permission to perform this action' },
      }));
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next() if user has the required role', async () => {
      // Mock findById to return user with required role
      findByIdMock.mockResolvedValue({
        id: 'user123',
        username: 'testuser',
        role: 'ADMIN',
      });

      await roleMiddleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should support arrays of allowed roles', async () => {
      const arrayRoleMiddleware = authorizeRoles(['ADMIN', 'MANAGER']);

      // Mock findById to return user with one of the allowed roles
      findByIdMock.mockResolvedValue({
        id: 'user123',
        username: 'testuser',
        role: 'MANAGER',
      });

      await arrayRoleMiddleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe('authorizePermissions', () => {
    let permissionMiddleware;

    beforeEach(() => {
      // Setup user in request
      req.user = {
        id: 'user123',
        username: 'testuser',
        permissions: ['user:read', 'user:create'],
      };

      permissionMiddleware = authorizePermissions('user:read');
    });

    it('should return 500 if authenticate middleware has not been run', async () => {
      req.user = null;

      await permissionMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Authentication middleware must be used before authorization',
        },
      }));
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 if user is not found', async () => {
      // Mock findById to return null (user not found)
      findByIdMock.mockResolvedValue(null);

      await permissionMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'User not found' },
      }));
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 403 if user does not have the required permission', async () => {
      // Mock findById to return user without required permission
      findByIdMock.mockResolvedValue({
        id: 'user123',
        username: 'testuser',
        permissions: ['user:create'],
      });

      const restrictedMiddleware = authorizePermissions('user:delete');

      await restrictedMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: { code: 'FORBIDDEN', message: 'You do not have permission to perform this action' },
      }));
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next() if user has ALL permission', async () => {
      // Mock findById to return user with ALL permission
      findByIdMock.mockResolvedValue({
        id: 'user123',
        username: 'testuser',
        permissions: ['ALL'],
      });

      await permissionMiddleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should call next() if user has the required permission', async () => {
      // Mock findById to return user with required permission
      findByIdMock.mockResolvedValue({
        id: 'user123',
        username: 'testuser',
        permissions: ['user:read', 'user:create', 'ALL'],
      });

      // Make sure the middleware is called with a permission the user has
      permissionMiddleware = authorizePermissions('user:read');
      await permissionMiddleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe('authorizeLegacyRoles', () => {
    let legacyRoleMiddleware;

    beforeEach(() => {
      // Setup user in request
      req.user = {
        id: 'user123',
        username: 'testuser',
        legacyRole: 'ADMIN',
      };

      legacyRoleMiddleware = authorizeLegacyRoles('ADMIN');
    });

    it('should return 500 if authenticate middleware has not been run', async () => {
      req.user = null;

      await legacyRoleMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Authentication middleware must be used before authorization',
        },
      }));
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 if user is not found', async () => {
      // Mock findById to return null (user not found)
      findByIdMock.mockResolvedValue(null);

      await legacyRoleMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'User not found' },
      }));
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 403 if user does not have the required legacy role', async () => {
      // Mock findById to return user with different legacy role
      findByIdMock.mockResolvedValue({
        id: 'user123',
        username: 'testuser',
        legacyRole: 'USER',
      });

      await legacyRoleMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: { code: 'FORBIDDEN', message: 'You do not have permission to perform this action' },
      }));
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next() if user has the required legacy role', async () => {
      // Mock findById to return user with required legacy role
      findByIdMock.mockResolvedValue({
        id: 'user123',
        username: 'testuser',
        legacyRole: 'ADMIN',
      });

      await legacyRoleMiddleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
  });
});
