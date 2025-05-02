/**
 * Samudra Paket ERP - Role Middleware
 * Handles role-based authorization for API routes
 */

const { createApiError } = require('../../domain/utils/errorUtils');
const { logger } = require('./gateway/logger');

/**
 * Authorize based on user roles
 * @param {Array} roles - Allowed roles for the route
 * @returns {Function} Middleware function
 */
const authorize = (roles = []) => {
  return (req, res, next) => {
    try {
      // Check if user exists and has a role
      if (!req.user || !req.user.role) {
        logger.info('No user or role, returning 401');
        return res.status(401).json(
          createApiError('UNAUTHORIZED', 'User not authenticated or missing role')
        );
      }

      // If roles is a string, convert to array
      const allowedRoles = Array.isArray(roles) ? roles : [roles];
      
      // Check if user's role is in the allowed roles
      logger.info('Checking role authorization:', { userRole: req.user.role, allowedRoles });
      if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
        logger.info('Role not authorized, returning 403');
        return res.status(403).json(
          createApiError('FORBIDDEN', `Access denied. Required role: ${allowedRoles.join(' or ')}`)
        );
      }

      // User has required role, proceed
      logger.info('Role authorized, proceeding');
      next();
    } catch (error) {
      logger.error('Role authorization error:', error);
      return res.status(500).json(
        createApiError('SERVER_ERROR', 'An error occurred during authorization')
      );
    }
  };
};

/**
 * Authorize based on user permissions
 * @param {Array} requiredPermissions - Required permissions for the route
 * @returns {Function} Middleware function
 */
const authorizePermissions = (requiredPermissions = []) => {
  return (req, res, next) => {
    try {
      // Check if user exists and has permissions
      if (!req.user || !req.user.permissions) {
        logger.info('No user or permissions, returning 401');
        return res.status(401).json(
          createApiError('UNAUTHORIZED', 'User not authenticated or missing permissions')
        );
      }

      // If requiredPermissions is a string, convert to array
      const permissions = Array.isArray(requiredPermissions) 
        ? requiredPermissions 
        : [requiredPermissions];

      // Check if user has all required permissions
      logger.info('Checking permissions authorization:', { 
        userPermissions: req.user.permissions, 
        requiredPermissions: permissions 
      });
      
      const hasAllPermissions = permissions.every(permission => 
        req.user.permissions.includes(permission)
      );

      if (permissions.length > 0 && !hasAllPermissions) {
        logger.info('Permissions not authorized, returning 403');
        return res.status(403).json(
          createApiError('FORBIDDEN', `Access denied. Required permissions: ${permissions.join(', ')}`)
        );
      }

      // User has required permissions, proceed
      logger.info('Permissions authorized, proceeding');
      next();
    } catch (error) {
      logger.error('Permissions authorization error:', error);
      return res.status(500).json(
        createApiError('SERVER_ERROR', 'An error occurred during authorization')
      );
    }
  };
};

/**
 * Authorize based on branch access
 * @param {String} paramName - Parameter name containing branch ID
 * @returns {Function} Middleware function
 */
const authorizeBranchAccess = (paramName = 'branchId') => {
  return (req, res, next) => {
    try {
      // Check if user exists and has branch
      if (!req.user || !req.user.branch) {
        logger.info('No user or branch assignment, returning 401');
        return res.status(401).json(
          createApiError('UNAUTHORIZED', 'User not authenticated or missing branch assignment')
        );
      }

      // Get branch ID from request parameters
      const branchId = req.params[paramName];
      
      // Skip check if no branch ID in parameters
      if (!branchId) {
        logger.info('No branch ID in parameters, skipping branch access check');
        return next();
      }

      // For admin and regional roles, allow access to all branches
      if (['admin', 'regional_manager'].includes(req.user.role)) {
        logger.info('Admin or regional manager, allowing access to all branches');
        return next();
      }

      // Check if user's branch matches the requested branch
      logger.info('Checking branch access authorization:', { 
        userBranch: req.user.branch, 
        requestedBranch: branchId 
      });
      
      if (req.user.branch.toString() !== branchId.toString()) {
        logger.info('Branch access not authorized, returning 403');
        return res.status(403).json(
          createApiError('FORBIDDEN', 'Access denied. You can only access data from your assigned branch')
        );
      }

      // User has branch access, proceed
      logger.info('Branch access authorized, proceeding');
      next();
    } catch (error) {
      logger.error('Branch access authorization error:', error);
      return res.status(500).json(
        createApiError('SERVER_ERROR', 'An error occurred during authorization')
      );
    }
  };
};

module.exports = {
  authorize,
  authorizePermissions,
  authorizeBranchAccess
};
