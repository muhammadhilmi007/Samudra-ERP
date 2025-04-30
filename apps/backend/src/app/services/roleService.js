/**
 * Samudra Paket ERP - Role Service
 * Service for managing roles in the RBAC system
 */

const { createApiError } = require('../../domain/utils/errorUtils');

/**
 * Role Service
 * Provides business logic for role management
 */
class RoleService {
  /**
   * Constructor
   * @param {Object} roleRepository - Role repository instance
   * @param {Object} permissionRepository - Permission repository instance
   */
  constructor(roleRepository, permissionRepository) {
    this.roleRepository = roleRepository;
    this.permissionRepository = permissionRepository;
  }

  /**
   * Get all roles
   * @param {Object} filters - Filter criteria
   * @returns {Promise<Array>} List of roles
   */
  async getAllRoles(filters = {}) {
    return this.roleRepository.findAll(filters);
  }

  /**
   * Get role by ID
   * @param {string} id - Role ID
   * @returns {Promise<Object>} Role object
   * @throws {Error} If role not found
   */
  async getRoleById(id) {
    const role = await this.roleRepository.findById(id);
    if (!role) {
      throw createApiError('NOT_FOUND', 'Role not found');
    }
    return role;
  }

  /**
   * Get role by name
   * @param {string} name - Role name
   * @returns {Promise<Object>} Role object
   * @throws {Error} If role not found
   */
  async getRoleByName(name) {
    const role = await this.roleRepository.findByName(name);
    if (!role) {
      throw createApiError('NOT_FOUND', 'Role not found');
    }
    return role;
  }

  /**
   * Create a new role
   * @param {Object} roleData - Role data
   * @param {string} userId - User ID creating the role
   * @returns {Promise<Object>} Created role
   * @throws {Error} If validation fails
   */
  async createRole(roleData, userId) {
    // Check if role with same name already exists
    const existingRole = await this.roleRepository.findByName(roleData.name);
    if (existingRole) {
      throw createApiError('VALIDATION_ERROR', 'Role with this name already exists');
    }

    // Validate permissions
    if (roleData.permissions && roleData.permissions.length > 0) {
      const permissions = await this.permissionRepository.findByIds(roleData.permissions);
      if (permissions.length !== roleData.permissions.length) {
        throw createApiError('VALIDATION_ERROR', 'One or more permissions are invalid');
      }
      roleData.permissions = permissions;
    }

    // Add audit fields
    const roleWithAudit = {
      ...roleData,
      createdBy: userId,
      updatedBy: userId,
    };

    return this.roleRepository.create(roleWithAudit);
  }

  /**
   * Update a role
   * @param {string} id - Role ID
   * @param {Object} roleData - Role data to update
   * @param {string} userId - User ID updating the role
   * @returns {Promise<Object>} Updated role
   * @throws {Error} If role not found or validation fails
   */
  async updateRole(id, roleData, userId) {
    // Check if role exists
    const role = await this.getRoleById(id);

    // Check if system role
    if (role.isSystem && (roleData.name || roleData.isActive === false)) {
      throw createApiError('FORBIDDEN', 'Cannot modify name or deactivate system roles');
    }

    // Check if name is being changed and already exists
    if (roleData.name && roleData.name !== role.name) {
      const existingRole = await this.roleRepository.findByName(roleData.name);
      if (existingRole && existingRole.id.toString() !== id) {
        throw createApiError('VALIDATION_ERROR', 'Role with this name already exists');
      }
    }

    // Validate permissions if provided
    if (roleData.permissions && roleData.permissions.length > 0) {
      const permissions = await this.permissionRepository.findByIds(roleData.permissions);
      if (permissions.length !== roleData.permissions.length) {
        throw createApiError('VALIDATION_ERROR', 'One or more permissions are invalid');
      }
      roleData.permissions = permissions;
    }

    // Add audit fields
    const roleWithAudit = {
      ...roleData,
      updatedBy: userId,
    };

    return this.roleRepository.update(id, roleWithAudit);
  }

  /**
   * Delete a role
   * @param {string} id - Role ID
   * @returns {Promise<boolean>} True if deleted
   * @throws {Error} If role not found or is a system role
   */
  async deleteRole(id) {
    // Check if role exists
    const role = await this.getRoleById(id);

    // Check if system role
    if (role.isSystem) {
      throw createApiError('FORBIDDEN', 'Cannot delete system roles');
    }

    const deleted = await this.roleRepository.delete(id);
    if (!deleted) {
      throw createApiError('SERVER_ERROR', 'Failed to delete role');
    }

    return true;
  }

  /**
   * Add permission to role
   * @param {string} roleId - Role ID
   * @param {string} permissionId - Permission ID
   * @param {string} userId - User ID making the change
   * @returns {Promise<Object>} Updated role
   * @throws {Error} If role or permission not found
   */
  async addPermissionToRole(roleId, permissionId, userId) {
    // Check if role exists
    const role = await this.getRoleById(roleId);

    // Check if permission exists
    const permission = await this.permissionRepository.findById(permissionId);
    if (!permission) {
      throw createApiError('NOT_FOUND', 'Permission not found');
    }

    // Check if role already has this permission
    // eslint-disable-next-line operator-linebreak
    const hasPermission = role.permissions &&
      role.permissions.some((p) => p === permissionId || p.id === permissionId);

    if (hasPermission) {
      throw createApiError('SERVER_ERROR', 'Failed to add permission to role');
    }

    const updatedRole = await this.roleRepository.addPermission(roleId, permissionId);
    if (!updatedRole) {
      throw createApiError('SERVER_ERROR', 'Failed to add permission to role');
    }

    // Update audit field
    await this.roleRepository.update(roleId, { updatedBy: userId });

    return updatedRole;
  }

  /**
   * Remove permission from role
   * @param {string} roleId - Role ID
   * @param {string} permissionId - Permission ID
   * @param {string} userId - User ID making the change
   * @returns {Promise<Object>} Updated role
   * @throws {Error} If role not found
   */
  async removePermissionFromRole(roleId, permissionId, userId) {
    // Check if role exists
    const role = await this.getRoleById(roleId);

    // Check if role has this permission
    if (!role.permissions || !role.permissions.some((p) => p.id === permissionId)) {
      throw createApiError('BAD_REQUEST', 'Role does not have this permission');
    }

    const updatedRole = await this.roleRepository.removePermission(roleId, permissionId);
    if (!updatedRole) {
      throw createApiError('SERVER_ERROR', 'Failed to remove permission from role');
    }

    // Update audit field
    await this.roleRepository.update(roleId, { updatedBy: userId });

    return updatedRole;
  }

  /**
   * Get all permissions for a role
   * @param {string} roleId - Role ID
   * @returns {Promise<Array>} List of permissions
   * @throws {Error} If role not found
   */
  async getRolePermissions(roleId) {
    // Check if role exists
    await this.getRoleById(roleId);

    return this.roleRepository.getPermissions(roleId);
  }

  /**
   * Get roles with specific permission
   * @param {string} permissionId - Permission ID
   * @returns {Promise<Array>} List of roles with the permission
   */
  async getRolesWithPermission(permissionId) {
    return this.roleRepository.getRolesWithPermission(permissionId);
  }
}

module.exports = RoleService;
