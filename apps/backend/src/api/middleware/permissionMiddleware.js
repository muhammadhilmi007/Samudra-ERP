/**
 * Samudra Paket ERP - Permission Middleware
 * Middleware for checking permissions in the RBAC system
 */

const { createApiError } = require('../../domain/utils/errorUtils');
const MongoUserRepository = require('../../infrastructure/repositories/mongoUserRepository');
// const MongoRoleRepository = require('../../infrastructure/repositories/mongoRoleRepository');
const { logger } = require('./gateway/logger');

// Initialize repositories
const userRepository = new MongoUserRepository();
// Role repository is commented out as it's not currently used

/**
 * Check if user has required permission
 * @param {string|string[]} requiredPermissions - Required permission code(s)
 * @returns {Function} Express middleware
 */
const checkPermission = (requiredPermissions) => async (req, res, next) => {
  try {
    // Ensure req.user exists
    if (!req.user || !req.user.id) {
      return res.status(500).json(
        createApiError(
          'SERVER_ERROR',
          'Authentication middleware must be used before permission check',
        ),
      );
    }

    // Normalize permissions to array
    const normalizedPermissions = Array.isArray(requiredPermissions)
      ? requiredPermissions
      : [requiredPermissions];

    // Get user from database to ensure we have the latest data
    const user = await userRepository.findById(req.user.id);
    if (!user) {
      return res.status(401).json(createApiError('UNAUTHORIZED', 'User not found'));
    }

    // Super admin check - if user has 'ALL' permission
    if (user.permissions && user.permissions.includes('ALL')) {
      return next();
    }

    // Check if user has all required permissions
    // Check if user has each required permission
    const hasAllPermissions = normalizedPermissions.every(
      (permission) => user.permissions && user.permissions.includes(permission),
    );

    if (!hasAllPermissions) {
      logger.warn('Permission denied', {
        userId: user.id,
        username: user.username,
        requiredPermissions: normalizedPermissions,
        userPermissions: user.permissions,
      });

      return res.status(403).json(
        createApiError('FORBIDDEN', 'You do not have permission to perform this action'),
      );
    }

    return next();
  } catch (error) {
    logger.error('Permission check error:', { error });
    return res.status(500).json(
      createApiError('SERVER_ERROR', 'An error occurred during permission check'),
    );
  }
};

/**
 * Check if user has required permission for a specific resource
 * @param {string|string[]} requiredPermissions - Required permission code(s)
 * @param {Function} resourceAccessFn - Function to determine if user has access to the resource
 * @returns {Function} Express middleware
 */
const checkResourcePermission = (
  requiredPermissions,
  resourceAccessFn,
) => async (req, res, next) => {
  try {
    // Ensure req.user exists
    if (!req.user || !req.user.id) {
      return res.status(500).json(
        createApiError(
          'SERVER_ERROR',
          'Authentication middleware must be used before permission check',
        ),
      );
    }

    // Get user from database to ensure we have the latest data
    const user = await userRepository.findById(req.user.id);
    if (!user) {
      return res.status(401).json(createApiError('UNAUTHORIZED', 'User not found'));
    }

    // Super admin check - if user has 'ALL' permission
    if (user.permissions && user.permissions.includes('ALL')) {
      // Check resource access
      const hasAccess = await resourceAccessFn(req);
      if (!hasAccess) {
        return res.status(403).json(
          createApiError('FORBIDDEN', 'You do not have permission to access this resource'),
        );
      }
      return next();
    }

    // Normalize permissions to array
    const normalizedPermissions = Array.isArray(requiredPermissions)
      ? requiredPermissions
      : [requiredPermissions];

    // Check if user has all required permissions
    const hasAllPermissions = normalizedPermissions.every(
      (permission) => user.permissions && user.permissions.includes(permission),
    );

    if (!hasAllPermissions) {
      return res.status(403).json(
        createApiError('FORBIDDEN', 'You do not have permission to perform this action'),
      );
    }

    // Check resource access
    const hasAccess = await resourceAccessFn(req);
    if (!hasAccess) {
      return res.status(403).json(
        createApiError('FORBIDDEN', 'You do not have permission to access this resource'),
      );
    }

    return next();
  } catch (error) {
    logger.error('Resource permission check error:', { error });
    return res.status(500).json(
      createApiError('SERVER_ERROR', 'An error occurred during resource permission check'),
    );
  }
};

/**
 * Check if user has ALL required permissions
 * @param {string[]} requiredPermissions - Required permission codes
 * @returns {Function} Express middleware
 */
const checkAllPermissions = (requiredPermissions) => async (req, res, next) => {
  // Check if authenticate middleware has been run
  if (!req.user) {
    return res.status(500).json(
      createApiError(
        'SERVER_ERROR',
        'Authentication middleware must be used before permission check',
      ),
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

    // Normalize permission codes to uppercase
    const normalizedPermissions = requiredPermissions.map((p) => p.toUpperCase());

    // Super admin check - if user has 'ALL' permission
    if (user.permissions.includes('ALL')) {
      return next();
    }

    // Check if user has ALL of the required permissions
    const hasAllPermissions = normalizedPermissions.every(
      (permission) => user.permissions.includes(permission),
    );

    if (!hasAllPermissions) {
      logger.warn('Multiple permissions check failed', {
        userId: user.id,
        username: user.username,
        requiredPermissions: normalizedPermissions,
        userPermissions: user.permissions,
      });

      return res.status(403).json(
        createApiError('FORBIDDEN', 'You do not have all required permissions'),
      );
    }

    return next();
  } catch (error) {
    logger.error('Multiple permissions check error:', { error });
    return res.status(500).json(
      createApiError('SERVER_ERROR', 'An error occurred during permission check'),
    );
  }
};

module.exports = {
  checkPermission,
  checkResourcePermission,
  checkAllPermissions,
  // Export userRepository for testing
  userRepository,
};
