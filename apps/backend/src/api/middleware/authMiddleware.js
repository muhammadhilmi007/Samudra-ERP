/**
 * Samudra Paket ERP - Authentication Middleware
 * Handles JWT authentication and RBAC authorization
 */

const jwt = require('jsonwebtoken');
const { createApiError } = require('../../domain/utils/errorUtils');
const MongoUserRepository = require('../../infrastructure/repositories/mongoUserRepository');
const { logger } = require('./gateway/logger');

// Initialize repositories
const userRepository = new MongoUserRepository();

/**
 * Authenticate user using JWT token
 * @returns {Function} Express middleware
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    logger.info('Auth header:', { authHeader });

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.info('No valid auth header, returning 401');
      return res.status(401).json(
        createApiError('UNAUTHORIZED', 'Authentication required'),
      );
    }

    // Extract token
    const token = authHeader.split(' ')[1];
    logger.info('Token extracted:', { token: `${token.substring(0, 10)}...` });

    // Verify token
    logger.info('Verifying token...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key_here');
    logger.info('Token verified:', { decoded });

    // Get user from database
    logger.info('Getting user from database:', { userId: decoded.id });
    const user = await userRepository.findById(decoded.id, { populate: ['role'] });
    logger.info('User retrieved:', {
      user: user ? {
        id: user.id,
        username: user.username,
        isActive: user.isActive,
        role: typeof user.role === 'object' ? `{id: ${user.role.id}, 
        name: ${user.role.name}}` : user.role,
      } : null,
    });

    // Check if user exists
    if (!user) {
      logger.info('User not found, returning 401');
      return res.status(401).json(createApiError('UNAUTHORIZED', 'User not found'));
    }

    // Check if user is active
    logger.info('Checking if user is active:', { isActive: user.isActive });
    if (!user.isActive) {
      logger.info('User is inactive, returning 401 UNAUTHORIZED');
      return res.status(401).json(
        createApiError('UNAUTHORIZED', 'Authentication required'),
      );
    }

    // Attach user to request object
    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: typeof user.role === 'object' ? user.role.id : user.role,
      roleName: typeof user.role === 'object' ? user.role.name : 'Admin',
      permissions: user.permissions || [],
      legacyRole: user.legacyRole,
    };

    return next();
  } catch (error) {
    logger.error('Authentication error:', error);

    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json(createApiError(
        'TOKEN_EXPIRED',
        'Token expired, please login again', // Updated message
      ));
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json(
        createApiError('INVALID_TOKEN', error.message || 'Invalid token'),
      );
    }

    return res.status(500).json(
      createApiError('SERVER_ERROR', 'An error occurred during authentication'),
    );
  }
};

/**
 * Authorize user based on roles
 * @param {string|string[]} roleIds - Required role ID(s)
 * @returns {Function} Express middleware
 */
const authorizeRoles = (roleIds) => async (req, res, next) => {
  // Check if authenticate middleware has been run
  if (!req.user) {
    return res.status(500).json(
      createApiError('SERVER_ERROR', 'Authentication middleware must be used before authorization'),
    );
  }

  try {
    // Get user from database to ensure we have the latest data
    const user = await userRepository.findById(req.user.id);
    if (!user) {
      return res.status(401).json(
        createApiError('UNAUTHORIZED', 'User not found'),
      );
    }

    // Convert single role to array
    const allowedRoleIds = Array.isArray(roleIds) ? roleIds : [roleIds];

    // Check if user has required role
    const hasRole = allowedRoleIds.some((roleId) => user.role
    && user.role.toString() === roleId.toString());

    if (!hasRole) {
      return res.status(403).json(
        createApiError('FORBIDDEN', 'You do not have permission to perform this action'),
      );
    }

    next();
  } catch (error) {
    logger.error('Role authorization error:', { error });
    return res.status(500).json(
      createApiError('SERVER_ERROR', 'An error occurred during authorization'),
    );
  }
  return undefined;
};

/**
 * Authorize user based on permissions
 * @param {string|string[]} permissions - Required permission code(s)
 * @returns {Function} Express middleware
 */
const authorizePermissions = (permissions) => async (req, res, next) => {
  // Check if authenticate middleware has been run
  if (!req.user) {
    return res.status(500).json(
      createApiError('SERVER_ERROR', 'Authentication middleware must be used before authorization'),
    );
  }

  try {
    // Get user from database to ensure we have the latest data
    const user = await userRepository.findById(req.user.id);
    if (!user) {
      return res.status(401).json(
        createApiError('UNAUTHORIZED', 'User not found'),
      );
    }

    // Convert single permission to array
    const requiredPermissions = Array.isArray(permissions) ? permissions : [permissions];

    // Normalize permission codes to uppercase
    const normalizedRequiredPermissions = requiredPermissions.map((p) => p.toUpperCase());

    // Check if user has ALL permission
    if (user.permissions.includes('ALL')) {
      return next();
    }

    // Check if user has all required permissions
    // eslint-disable-next-line max-len
    const hasAllPermissions = normalizedRequiredPermissions.every((permission) => user.permissions.includes(permission));

    if (!hasAllPermissions) {
      return res.status(403).json(
        createApiError('FORBIDDEN', 'You do not have permission to perform this action'),
      );
    }

    next();
  } catch (error) {
    logger.error('Permission authorization error:', { error });
    return res.status(500).json(
      createApiError('SERVER_ERROR', 'An error occurred during authorization'),
    );
  }
  return undefined;
};

/**
 * Authorize user based on legacy roles (for backward compatibility)
 * @param {string|string[]} legacyRoles - Required legacy role(s)
 * @returns {Function} Express middleware
 */
const authorizeLegacyRoles = (legacyRoles) => async (req, res, next) => {
  // Check if authenticate middleware has been run
  if (!req.user) {
    return res.status(500).json(
      createApiError('SERVER_ERROR', 'Authentication middleware must be used before authorization'),
    );
  }

  try {
    // Get user from database to ensure we have the latest data
    const user = await userRepository.findById(req.user.id);
    if (!user) {
      return res.status(401).json(
        createApiError('UNAUTHORIZED', 'User not found'),
      );
    }

    // Convert single role to array
    const allowedLegacyRoles = Array.isArray(legacyRoles) ? legacyRoles : [legacyRoles];

    // Check if user has required legacy role
    if (!user.legacyRole || !allowedLegacyRoles.includes(user.legacyRole)) {
      return res.status(403).json(
        createApiError('FORBIDDEN', 'You do not have permission to perform this action'),
      );
    }

    next();
  } catch (error) {
    logger.error('Legacy role authorization error:', { error });
    return res.status(500).json(
      createApiError('SERVER_ERROR', 'An error occurred during authorization'),
    );
  }
  return undefined;
};

module.exports = {
  authenticate,
  authorizeRoles,
  authorizePermissions,
  authorizeLegacyRoles,
  // Export userRepository for testing
  userRepository,
};
