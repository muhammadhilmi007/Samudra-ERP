/**
 * Samudra Paket ERP - Authorization Controller
 * Handles HTTP requests for authorization management
 */

const { createApiResponse, createApiError } = require('../../domain/utils/errorUtils');
const AuthorizationService = require('../../domain/services/authorizationService');

// Initialize services
const authorizationService = new AuthorizationService();

/**
 * Assign permission to user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const assignPermissionToUser = async (req, res) => {
  try {
    const { userId, permissionCode } = req.params;

    // Validate required parameters
    if (!userId || !permissionCode) {
      return res.status(400).json(
        createApiError('VALIDATION_ERROR', 'User ID and permission code are required'),
      );
    }

    const updatedUser = await authorizationService.assignPermissionToUser(userId, permissionCode);
    return res.status(200).json(createApiResponse(updatedUser));
  } catch (error) {
    console.error('Error assigning permission to user:', error);

    if (error.apiError) {
      return res.status(error.status || 500).json(error);
    }

    return res.status(500).json(
      createApiError('SERVER_ERROR', 'An error occurred while assigning permission to user'),
    );
  }
};

/**
 * Remove permission from user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const removePermissionFromUser = async (req, res) => {
  try {
    const { userId, permissionCode } = req.params;

    // Validate required parameters
    if (!userId || !permissionCode) {
      return res.status(400).json(
        createApiError('VALIDATION_ERROR', 'User ID and permission code are required'),
      );
    }

    const updatedUser = await authorizationService.removePermissionFromUser(
      userId,
      permissionCode,
    );
    return res.status(200).json(createApiResponse(updatedUser));
  } catch (error) {
    console.error('Error removing permission from user:', error);

    if (error.apiError) {
      return res.status(error.status || 500).json(error);
    }

    return res.status(500).json(
      createApiError('SERVER_ERROR', 'An error occurred while removing permission from user'),
    );
  }
};

/**
 * Assign role to user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const assignRoleToUser = async (req, res) => {
  try {
    const { userId, roleId } = req.params;

    // Validate required parameters
    if (!userId || !roleId) {
      return res.status(400).json(
        createApiError('VALIDATION_ERROR', 'User ID and role ID are required'),
      );
    }

    const updatedUser = await authorizationService.assignRoleToUser(userId, roleId);
    return res.status(200).json(createApiResponse(updatedUser));
  } catch (error) {
    console.error('Error assigning role to user:', error);

    if (error.apiError) {
      return res.status(error.status || 500).json(error);
    }

    return res.status(500).json(
      createApiError('SERVER_ERROR', 'An error occurred while assigning role to user'),
    );
  }
};

/**
 * Check if user has permission
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const checkUserPermission = async (req, res) => {
  try {
    const { userId, permissionCode } = req.params;

    // Validate required parameters
    if (!userId || !permissionCode) {
      return res.status(400).json(
        createApiError('VALIDATION_ERROR', 'User ID and permission code are required'),
      );
    }

    const hasPermission = await authorizationService.hasPermission(userId, permissionCode);
    return res.status(200).json(
      createApiResponse({ hasPermission }),
    );
  } catch (error) {
    console.error('Error checking user permission:', error);
    return res.status(500).json(
      createApiError('SERVER_ERROR', 'An error occurred while checking user permission'),
    );
  }
};

/**
 * Check if user has role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const checkUserRole = async (req, res) => {
  try {
    const { userId, roleId } = req.params;

    // Validate required parameters
    if (!userId || !roleId) {
      return res.status(400).json(
        createApiError('VALIDATION_ERROR', 'User ID and role ID are required'),
      );
    }

    const hasRole = await authorizationService.hasRole(userId, roleId);
    return res.status(200).json(
      createApiResponse({ hasRole }),
    );
  } catch (error) {
    console.error('Error checking user role:', error);
    return res.status(500).json(
      createApiError('SERVER_ERROR', 'An error occurred while checking user role'),
    );
  }
};

/**
 * Assign permission to role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const assignPermissionToRole = async (req, res) => {
  try {
    const { roleId, permissionId } = req.params;

    // Validate required parameters
    if (!roleId || !permissionId) {
      return res.status(400).json(
        createApiError('VALIDATION_ERROR', 'Role ID and permission ID are required'),
      );
    }

    const updatedRole = await authorizationService.assignPermissionToRole(roleId, permissionId);
    return res.status(200).json(createApiResponse(updatedRole));
  } catch (error) {
    console.error('Error assigning permission to role:', error);

    if (error.apiError) {
      return res.status(error.status || 500).json(error);
    }

    return res.status(500).json(
      createApiError('SERVER_ERROR', 'An error occurred while assigning permission to role'),
    );
  }
};

/**
 * Remove permission from role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const removePermissionFromRole = async (req, res) => {
  try {
    const { roleId, permissionId } = req.params;

    // Validate required parameters
    if (!roleId || !permissionId) {
      return res.status(400).json(
        createApiError('VALIDATION_ERROR', 'Role ID and permission ID are required'),
      );
    }

    const updatedRole = await authorizationService.removePermissionFromRole(
      roleId,
      permissionId,
    );
    return res.status(200).json(createApiResponse(updatedRole));
  } catch (error) {
    console.error('Error removing permission from role:', error);

    if (error.apiError) {
      return res.status(error.status || 500).json(error);
    }

    return res.status(500).json(
      createApiError('SERVER_ERROR', 'An error occurred while removing permission from role'),
    );
  }
};

/**
 * Get permissions for a role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getPermissionsForRole = async (req, res) => {
  try {
    const { roleId } = req.params;

    // Validate required parameters
    if (!roleId) {
      return res.status(400).json(
        createApiError('VALIDATION_ERROR', 'Role ID is required'),
      );
    }

    const permissions = await authorizationService.getPermissionsForRole(roleId);
    return res.status(200).json(createApiResponse(permissions));
  } catch (error) {
    console.error('Error getting permissions for role:', error);

    if (error.apiError) {
      return res.status(error.status || 500).json(error);
    }

    return res.status(500).json(
      createApiError('SERVER_ERROR', 'An error occurred while getting permissions for role'),
    );
  }
};

/**
 * Get roles with specific permission
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getRolesWithPermission = async (req, res) => {
  try {
    const { permissionId } = req.params;

    // Validate required parameters
    if (!permissionId) {
      return res.status(400).json(
        createApiError('VALIDATION_ERROR', 'Permission ID is required'),
      );
    }

    const roles = await authorizationService.getRolesWithPermission(permissionId);
    return res.status(200).json(createApiResponse(roles));
  } catch (error) {
    console.error('Error getting roles with permission:', error);

    if (error.apiError) {
      return res.status(error.status || 500).json(error);
    }

    return res.status(500).json(
      createApiError('SERVER_ERROR', 'An error occurred while getting roles with permission'),
    );
  }
};

module.exports = {
  assignPermissionToUser,
  removePermissionFromUser,
  assignRoleToUser,
  checkUserPermission,
  checkUserRole,
  assignPermissionToRole,
  removePermissionFromRole,
  getPermissionsForRole,
  getRolesWithPermission,
};
