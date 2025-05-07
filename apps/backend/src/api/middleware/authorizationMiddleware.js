/**
 * Samudra Paket ERP - Authorization Middleware
 * Provides middleware for permission-based authorization
 */

const { createApiError } = require('../../domain/utils/errorUtils');
const { logger } = require('./gateway/logger');
const AuthorizationService = require('../../domain/services/authorizationService');

// Initialize services
const authorizationService = new AuthorizationService();

/**
 * Authorize user based on permission code
 * @param {string|string[]} permissionCodes - Required permission code(s)
 * @param {boolean} requireAll - If true, user must have all permissions; if false, any one is sufficient
 * @returns {Function} Express middleware
 */
const authorizePermission = (permissionCodes, requireAll = true) => async (req, res, next) => {
  // Check if authenticate middleware has been run
  if (!req.user) {
    logger.error('Authorization middleware used without authentication');
    return res.status(500).json(
      createApiError('SERVER_ERROR', 'Authentication middleware must be used before authorization'),
    );
  }

  try {
    // Convert single permission to array
    const requiredPermissions = Array.isArray(permissionCodes) ? permissionCodes : [permissionCodes];

    // Check if user has required permissions
    const permissionChecks = await Promise.all(
      requiredPermissions.map((code) => (
        authorizationService.hasPermission(req.user.id, code)
      )),
    );

    // Determine if user has access based on requireAll flag
    const hasAccess = requireAll
      ? permissionChecks.every((result) => result === true)
      : permissionChecks.some((result) => result === true);

    if (!hasAccess) {
      logger.warn(`Forbidden access attempt to [${requiredPermissions.join(', ')}] by user ${req.user.id}`);
      return res.status(403).json(
        createApiError('FORBIDDEN', 'You do not have permission to perform this action'),
      );
    }

    return next();
  } catch (error) {
    logger.error('Permission authorization error:', error);
    return res.status(500).json(
      createApiError('SERVER_ERROR', 'An error occurred during authorization'),
    );
  }
};

/**
 * Authorize user based on role
 * @param {string|string[]} roleIds - Required role ID(s)
 * @returns {Function} Express middleware
 */
const authorizeRole = (roleIds) => async (req, res, next) => {
  // Check if authenticate middleware has been run
  if (!req.user) {
    logger.error('Authorization middleware used without authentication');
    return res.status(500).json(
      createApiError('SERVER_ERROR', 'Authentication middleware must be used before authorization'),
    );
  }

  try {
    // Check if user has required role
    const hasRole = await authorizationService.hasRole(req.user.id, roleIds);

    if (!hasRole) {
      logger.warn(`Forbidden role access attempt by user ${req.user.id}`);
      return res.status(403).json(
        createApiError('FORBIDDEN', 'You do not have permission to perform this action'),
      );
    }

    return next();
  } catch (error) {
    logger.error('Role authorization error:', error);
    return res.status(500).json(
      createApiError('SERVER_ERROR', 'An error occurred during authorization'),
    );
  }
};

/**
 * Authorize user based on module and action
 * @param {string} module - Module name
 * @param {string} action - Action type (CREATE, READ, UPDATE, DELETE, EXECUTE)
 * @returns {Function} Express middleware
 */
const authorizeAction = (module, action) => {
  const permissionCode = `${module.toUpperCase()}_${action.toUpperCase()}`;
  return authorizePermission(permissionCode);
};

module.exports = {
  authorizePermission,
  authorizeRole,
  authorizeAction,
};
