/**
 * Samudra Paket ERP - Role Controller
 * Handles HTTP requests for role management
 */

const { createApiResponse, createApiError } = require('../../domain/utils/errorUtils');
const RoleService = require('../../app/services/roleService');
const MongoRoleRepository = require('../../infrastructure/repositories/mongoRoleRepository');
// eslint-disable-next-line max-len
const MongoPermissionRepository = require('../../infrastructure/repositories/mongoPermissionRepository');

// Initialize repositories and services
const roleRepository = new MongoRoleRepository();
const permissionRepository = new MongoPermissionRepository();
const roleService = new RoleService(roleRepository, permissionRepository);

/**
 * Get all roles
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllRoles = async (req, res) => {
  try {
    const filters = {};

    // Apply filters if provided
    if (req.query.isActive) {
      filters.isActive = req.query.isActive === 'true';
    }

    if (req.query.isSystem) {
      filters.isSystem = req.query.isSystem === 'true';
    }

    const roles = await roleService.getAllRoles(filters);

    return res.status(200).json(createApiResponse(roles));
  } catch (error) {
    console.error('Error getting roles:', error);
    return res.status(500).json(
      createApiError('SERVER_ERROR', 'An error occurred while fetching roles'),
    );
  }
};

/**
 * Get role by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getRoleById = async (req, res) => {
  try {
    const { id } = req.params;
    const role = await roleService.getRoleById(id);

    return res.status(200).json(createApiResponse(role));
  } catch (error) {
    console.error('Error getting role by ID:', error);

    if (error.code === 'NOT_FOUND') {
      return res.status(404).json(createApiError('NOT_FOUND', error.message));
    }

    return res.status(500).json(
      createApiError('SERVER_ERROR', 'An error occurred while fetching the role'),
    );
  }
};

/**
 * Create a new role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createRole = async (req, res) => {
  try {
    const roleData = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!roleData.name || !roleData.description) {
      return res.status(400).json(
        createApiError('VALIDATION_ERROR', 'Name and description are required'),
      );
    }

    const newRole = await roleService.createRole(roleData, userId);

    return res.status(201).json(createApiResponse(newRole));
  } catch (error) {
    console.error('Error creating role:', error);

    if (error.code === 'VALIDATION_ERROR') {
      return res.status(400).json(createApiError('VALIDATION_ERROR', error.message));
    }

    return res.status(500).json(
      createApiError('SERVER_ERROR', 'An error occurred while creating the role'),
    );
  }
};

/**
 * Update a role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const roleData = req.body;
    const userId = req.user.id;

    const updatedRole = await roleService.updateRole(id, roleData, userId);

    return res.status(200).json(createApiResponse(updatedRole));
  } catch (error) {
    console.error('Error updating role:', error);

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
      createApiError('SERVER_ERROR', 'An error occurred while updating the role'),
    );
  }
};

/**
 * Delete a role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteRole = async (req, res) => {
  try {
    const { id } = req.params;

    await roleService.deleteRole(id);

    return res.status(200).json(
      createApiResponse({ message: 'Role deleted successfully' }),
    );
  } catch (error) {
    console.error('Error deleting role:', error);

    if (error.code === 'NOT_FOUND') {
      return res.status(404).json(createApiError('NOT_FOUND', error.message));
    }

    if (error.code === 'FORBIDDEN') {
      return res.status(403).json(createApiError('FORBIDDEN', error.message));
    }

    return res.status(500).json(
      createApiError('SERVER_ERROR', 'An error occurred while deleting the role'),
    );
  }
};

/**
 * Get role permissions
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getRolePermissions = async (req, res) => {
  try {
    const { id } = req.params;
    const permissions = await roleService.getRolePermissions(id);

    return res.status(200).json(createApiResponse(permissions));
  } catch (error) {
    console.error('Error getting role permissions:', error);

    if (error.code === 'NOT_FOUND') {
      return res.status(404).json(createApiError('NOT_FOUND', error.message));
    }

    return res.status(500).json(
      createApiError('SERVER_ERROR', 'An error occurred while fetching role permissions'),
    );
  }
};

/**
 * Add permission to role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const addPermissionToRole = async (req, res) => {
  try {
    const { id, permissionId } = req.params;
    const userId = req.user.id;

    const updatedRole = await roleService.addPermissionToRole(id, permissionId, userId);

    return res.status(200).json(createApiResponse(updatedRole));
  } catch (error) {
    console.error('Error adding permission to role:', error);

    if (error.code === 'NOT_FOUND') {
      return res.status(404).json(createApiError('NOT_FOUND', error.message));
    }

    return res.status(500).json(
      createApiError('SERVER_ERROR', 'An error occurred while adding permission to role'),
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
    const { id, permissionId } = req.params;
    const userId = req.user.id;

    const updatedRole = await roleService.removePermissionFromRole(id, permissionId, userId);

    return res.status(200).json(createApiResponse(updatedRole));
  } catch (error) {
    console.error('Error removing permission from role:', error);

    if (error.code === 'NOT_FOUND') {
      return res.status(404).json(createApiError('NOT_FOUND', error.message));
    }

    return res.status(500).json(
      createApiError('SERVER_ERROR', 'An error occurred while removing permission from role'),
    );
  }
};

module.exports = {
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  getRolePermissions,
  addPermissionToRole,
  removePermissionFromRole,
};
