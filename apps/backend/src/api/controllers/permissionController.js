/**
 * Samudra Paket ERP - Permission Controller
 * Handles HTTP requests for permission management
 */

const { createApiResponse, createApiError } = require('../../domain/utils/errorUtils');
const PermissionService = require('../../app/services/permissionService');
// eslint-disable-next-line max-len
const MongoPermissionRepository = require('../../infrastructure/repositories/mongoPermissionRepository');
const MongoRoleRepository = require('../../infrastructure/repositories/mongoRoleRepository');

// Initialize repositories and services
const permissionRepository = new MongoPermissionRepository();
const roleRepository = new MongoRoleRepository();
const permissionService = new PermissionService(permissionRepository, roleRepository);

/**
 * Get all permissions
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllPermissions = async (req, res) => {
  try {
    const filters = {};

    // Apply filters if provided
    if (req.query.isActive) {
      filters.isActive = req.query.isActive === 'true';
    }

    if (req.query.isSystem) {
      filters.isSystem = req.query.isSystem === 'true';
    }

    if (req.query.module) {
      filters.module = req.query.module.toUpperCase();
    }

    if (req.query.action) {
      filters.action = req.query.action.toUpperCase();
    }

    const permissions = await permissionService.getAllPermissions(filters);

    return res.status(200).json(createApiResponse(permissions));
  } catch (error) {
    console.error('Error getting permissions:', error);
    return res.status(500).json(
      createApiError('SERVER_ERROR', 'An error occurred while fetching permissions'),
    );
  }
};

/**
 * Get permission by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getPermissionById = async (req, res) => {
  try {
    const { id } = req.params;
    const permission = await permissionService.getPermissionById(id);

    return res.status(200).json(createApiResponse(permission));
  } catch (error) {
    console.error('Error getting permission by ID:', error);

    if (error.code === 'NOT_FOUND') {
      return res.status(404).json(createApiError('NOT_FOUND', error.message));
    }

    return res.status(500).json(
      createApiError('SERVER_ERROR', 'An error occurred while fetching the permission'),
    );
  }
};

/**
 * Get permission by code
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getPermissionByCode = async (req, res) => {
  try {
    const { code } = req.params;
    const permission = await permissionService.getPermissionByCode(code);

    return res.status(200).json(createApiResponse(permission));
  } catch (error) {
    console.error('Error getting permission by code:', error);

    if (error.code === 'NOT_FOUND') {
      return res.status(404).json(createApiError('NOT_FOUND', error.message));
    }

    return res.status(500).json(
      createApiError('SERVER_ERROR', 'An error occurred while fetching the permission'),
    );
  }
};

/**
 * Get permissions by module
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getPermissionsByModule = async (req, res) => {
  try {
    const { module } = req.params;
    const permissions = await permissionService.getPermissionsByModule(module);

    return res.status(200).json(createApiResponse(permissions));
  } catch (error) {
    console.error('Error getting permissions by module:', error);
    return res.status(500).json(
      createApiError('SERVER_ERROR', 'An error occurred while fetching permissions'),
    );
  }
};

/**
 * Create a new permission
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createPermission = async (req, res) => {
  try {
    const permissionData = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!permissionData.name || !permissionData.module || !permissionData.action) {
      return res.status(400).json(
        createApiError('VALIDATION_ERROR', 'Name, module, and action are required'),
      );
    }

    // Generate code if not provided
    if (!permissionData.code) {
      permissionData.code = permissionService.generatePermissionCode(
        permissionData.module,
        permissionData.action,
      );
    }

    const newPermission = await permissionService.createPermission(permissionData, userId);

    return res.status(201).json(createApiResponse(newPermission));
  } catch (error) {
    console.error('Error creating permission:', error);

    if (error.code === 'VALIDATION_ERROR') {
      return res.status(400).json(createApiError('VALIDATION_ERROR', error.message));
    }

    return res.status(500).json(
      createApiError('SERVER_ERROR', 'An error occurred while creating the permission'),
    );
  }
};

/**
 * Update a permission
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updatePermission = async (req, res) => {
  try {
    const { id } = req.params;
    const permissionData = req.body;
    const userId = req.user.id;

    const updatedPermission = await permissionService.updatePermission(id, permissionData, userId);

    return res.status(200).json(createApiResponse(updatedPermission));
  } catch (error) {
    console.error('Error updating permission:', error);

    if (error.code === 'NOT_FOUND') {
      return res.status(404).json(createApiError('NOT_FOUND', error.message));
    }

    if (error.code === 'VALIDATION_ERROR') {
      return res.status(400).json(createApiError('VALIDATION_ERROR', error.message));
    }

    if (error.code === 'FORBIDDEN') {
      return res.status(403).json(createApiError('FORBIDDEN', error.message));
    }

    return res.status(500).json(
      createApiError('SERVER_ERROR', 'An error occurred while updating the permission'),
    );
  }
};

/**
 * Delete a permission
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deletePermission = async (req, res) => {
  try {
    const { id } = req.params;

    await permissionService.deletePermission(id);

    return res.status(200).json(
      createApiResponse({ message: 'Permission deleted successfully' }),
    );
  } catch (error) {
    console.error('Error deleting permission:', error);

    if (error.code === 'NOT_FOUND') {
      return res.status(404).json(createApiError('NOT_FOUND', error.message));
    }

    if (error.code === 'VALIDATION_ERROR') {
      return res.status(400).json(createApiError('VALIDATION_ERROR', error.message));
    }

    if (error.code === 'FORBIDDEN') {
      return res.status(403).json(createApiError('FORBIDDEN', error.message));
    }

    return res.status(500).json(
      createApiError('SERVER_ERROR', 'An error occurred while deleting the permission'),
    );
  }
};

/**
 * Check if permission code exists
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const checkPermissionCodeExists = async (req, res) => {
  try {
    const { code } = req.params;
    const exists = await permissionService.permissionCodeExists(code);

    return res.status(200).json(createApiResponse({ exists }));
  } catch (error) {
    console.error('Error checking permission code:', error);
    return res.status(500).json(
      createApiError('SERVER_ERROR', 'An error occurred while checking the permission code'),
    );
  }
};

module.exports = {
  getAllPermissions,
  getPermissionById,
  getPermissionByCode,
  getPermissionsByModule,
  createPermission,
  updatePermission,
  deletePermission,
  checkPermissionCodeExists,
};
