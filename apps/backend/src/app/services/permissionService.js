/**
 * Samudra Paket ERP - Permission Service
 * Service for managing permissions in the RBAC system
 */

const { createApiError } = require('../../domain/utils/errorUtils');

/**
 * Permission Service
 * Provides business logic for permission management
 */
class PermissionService {
  /**
   * Constructor
   * @param {Object} permissionRepository - Permission repository instance
   * @param {Object} roleRepository - Role repository instance
   */
  constructor(permissionRepository, roleRepository) {
    this.permissionRepository = permissionRepository;
    this.roleRepository = roleRepository;
  }

  /**
   * Get all permissions
   * @param {string|Object} moduleOrFilters - Module name or filter criteria
   * @returns {Promise<Array>} List of permissions
   */
  async getAllPermissions(moduleOrFilters = {}) {
    // If moduleOrFilters is a string, treat it as a module name
    if (typeof moduleOrFilters === 'string') {
      return this.permissionRepository.findByModule(moduleOrFilters);
    }
    // Otherwise, treat it as filters object
    return this.permissionRepository.findAll(moduleOrFilters);
  }

  /**
   * Get permission by ID
   * @param {string} id - Permission ID
   * @returns {Promise<Object>} Permission object
   * @throws {Error} If permission not found
   */
  async getPermissionById(id) {
    const permission = await this.permissionRepository.findById(id);
    if (!permission) {
      throw createApiError('NOT_FOUND', 'Permission not found');
    }
    return permission;
  }

  /**
   * Get permission by code
   * @param {string} code - Permission code
   * @returns {Promise<Object>} Permission object
   * @throws {Error} If permission not found
   */
  async getPermissionByCode(code) {
    const permission = await this.permissionRepository.findByCode(code);
    if (!permission) {
      throw createApiError('NOT_FOUND', 'Permission not found');
    }
    return permission;
  }

  /**
   * Get permissions by module
   * @param {string} module - Module name
   * @returns {Promise<Array>} List of permissions for the module
   */
  async getPermissionsByModule(module) {
    return this.permissionRepository.findByModule(module);
  }

  /**
   * Create a new permission
   * @param {Object} permissionData - Permission data
   * @param {string} userId - User ID creating the permission
   * @returns {Promise<Object>} Created permission
   * @throws {Error} If validation fails
   */
  async createPermission(permissionData, userId) {
    // Create a copy of the data to avoid modifying the parameter
    const permissionDataCopy = { ...permissionData };

    // Generate code if not provided
    if (!permissionDataCopy.code && permissionDataCopy.module && permissionDataCopy.action) {
      permissionDataCopy.code = this.permissionRepository.generateCode(
        permissionDataCopy.module,
        permissionDataCopy.action,
      );
    }

    // Check if permission with same code already exists
    const existingPermission = await this.permissionRepository.findByCode(permissionDataCopy.code);
    if (existingPermission) {
      throw createApiError('VALIDATION_ERROR', 'Permission with this code already exists');
    }

    // Add audit fields
    const permissionWithAudit = {
      ...permissionDataCopy,
      createdBy: userId,
      updatedBy: userId,
    };

    return this.permissionRepository.create(permissionWithAudit);
  }

  /**
   * Update a permission
   * @param {string} id - Permission ID
   * @param {Object} permissionData - Permission data to update
   * @param {string} userId - User ID updating the permission
   * @returns {Promise<Object>} Updated permission
   * @throws {Error} If permission not found or validation fails
   */
  async updatePermission(id, permissionData, userId) {
    // Check if permission exists
    const permission = await this.getPermissionById(id);

    // Check if system permission
    // eslint-disable-next-line max-len
    if (permission.isSystem && (permissionData.name || permissionData.code || permissionData.isActive === false)) {
      // eslint-disable-next-line max-len
      throw createApiError('FORBIDDEN', 'Cannot modify name, code, or deactivate system permissions');
    }

    // Check if code is being changed and already exists
    if (permissionData.code && permissionData.code !== permission.code) {
      const existingPermission = await this.permissionRepository.findByCode(permissionData.code);
      if (existingPermission && existingPermission.id.toString() !== id) {
        throw createApiError('VALIDATION_ERROR', 'Permission with this code already exists');
      }
    }

    // Add audit fields
    const permissionWithAudit = {
      ...permissionData,
      updatedBy: userId,
    };

    return this.permissionRepository.update(id, permissionWithAudit);
  }

  /**
   * Delete a permission
   * @param {string} id - Permission ID
   * @returns {Promise<boolean>} True if deleted
   * @throws {Error} If permission not found or is a system permission
   */
  async deletePermission(id) {
    // Check if permission exists
    const permission = await this.getPermissionById(id);

    // Check if system permission
    if (permission.isSystem) {
      throw createApiError('FORBIDDEN', 'Cannot delete system permissions');
    }

    // Check if permission is used by any roles
    const rolesWithPermission = await this.roleRepository.getRolesWithPermission(id);
    if (rolesWithPermission.length > 0) {
      const roleNames = rolesWithPermission.map((role) => role.name).join(', ');
      throw createApiError(
        'VALIDATION_ERROR',
        `Permission is used by the following roles: ${roleNames}`,
      );
    }

    const deleted = await this.permissionRepository.delete(id);
    if (!deleted) {
      throw createApiError('SERVER_ERROR', 'Failed to delete permission');
    }

    return true;
  }

  /**
   * Get permissions by action type
   * @param {string} action - Action type (CREATE, READ, UPDATE, DELETE, EXECUTE, ALL)
   * @returns {Promise<Array>} List of permissions with the action type
   */
  async getPermissionsByAction(action) {
    return this.permissionRepository.getPermissionsByAction(action);
  }

  /**
   * Check if permission code exists
   * @param {string} code - Permission code
   * @returns {Promise<boolean>} True if permission code exists
   */
  async permissionCodeExists(code) {
    return this.permissionRepository.codeExists(code);
  }

  /**
   * Generate permission code
   * @param {string} module - Module name
   * @param {string} action - Action type
   * @returns {string} Generated permission code
   */
  generatePermissionCode(module, action) {
    return this.permissionRepository.generateCode(module, action);
  }
}

module.exports = PermissionService;
