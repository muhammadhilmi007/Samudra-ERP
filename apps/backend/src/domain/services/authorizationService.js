/**
 * Samudra Paket ERP - Authorization Service
 * Provides role-based and permission-based authorization functionality
 */

const { createApiError } = require('../utils/errorUtils');
const MongoRoleRepository = require('../../infrastructure/repositories/mongoRoleRepository');
const MongoPermissionRepository = require('../../infrastructure/repositories/mongoPermissionRepository');
const MongoUserRepository = require('../../infrastructure/repositories/mongoUserRepository');

/**
 * Authorization Service
 * Handles role and permission management and authorization checks
 */
class AuthorizationService {
  constructor() {
    this.roleRepository = new MongoRoleRepository();
    this.permissionRepository = new MongoPermissionRepository();
    this.userRepository = new MongoUserRepository();
  }

  /**
   * Check if user has specific permission
   * @param {string} userId - User ID
   * @param {string} permissionCode - Permission code to check
   * @returns {Promise<boolean>} True if user has permission
   */
  async hasPermission(userId, permissionCode) {
    try {
      const user = await this.userRepository.findById(userId, { populate: ['role'] });
      if (!user) {
        return false;
      }

      // Super admin check - has all permissions
      if (user.permissions.includes('ALL')) {
        return true;
      }

      // Direct permission check
      if (user.permissions.includes(permissionCode.toUpperCase())) {
        return true;
      }

      // Role-based permission check
      if (user.role) {
        const roleWithPermissions = await this.roleRepository.findById(
          user.role.id || user.role,
        );
        if (roleWithPermissions) {
          const permissions = await this.roleRepository.getPermissions(roleWithPermissions.id);
          return permissions.some((permission) => permission.code === permissionCode.toUpperCase());
        }
      }

      return false;
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  }

  /**
   * Check if user has specific role
   * @param {string} userId - User ID
   * @param {string|string[]} roleIds - Role ID(s) to check
   * @returns {Promise<boolean>} True if user has any of the roles
   */
  async hasRole(userId, roleIds) {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        return false;
      }

      // Convert single role to array
      const allowedRoleIds = Array.isArray(roleIds) ? roleIds : [roleIds];

      // Check if user has required role
      return allowedRoleIds.some((roleId) => (
        user.role && user.role.toString() === roleId.toString()
      ));
    } catch (error) {
      console.error('Error checking role:', error);
      return false;
    }
  }

  /**
   * Assign permission to user
   * @param {string} userId - User ID
   * @param {string} permissionCode - Permission code
   * @returns {Promise<Object>} Updated user
   */
  async assignPermissionToUser(userId, permissionCode) {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw createApiError('NOT_FOUND', 'User not found');
      }

      const permission = await this.permissionRepository.findByCode(permissionCode);
      if (!permission) {
        throw createApiError('NOT_FOUND', 'Permission not found');
      }

      // Check if user already has permission
      if (user.permissions.includes(permission.code)) {
        return user;
      }

      // Add permission to user
      user.permissions.push(permission.code);
      await user.save();

      return user;
    } catch (error) {
      throw error.apiError ? error : createApiError(
        'SERVER_ERROR',
        'Error assigning permission to user',
      );
    }
  }

  /**
   * Remove permission from user
   * @param {string} userId - User ID
   * @param {string} permissionCode - Permission code
   * @returns {Promise<Object>} Updated user
   */
  async removePermissionFromUser(userId, permissionCode) {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw createApiError('NOT_FOUND', 'User not found');
      }

      // Remove permission from user
      user.permissions = user.permissions.filter(
        (code) => code !== permissionCode.toUpperCase(),
      );
      await user.save();

      return user;
    } catch (error) {
      throw error.apiError ? error : createApiError(
        'SERVER_ERROR',
        'Error removing permission from user',
      );
    }
  }

  /**
   * Assign role to user
   * @param {string} userId - User ID
   * @param {string} roleId - Role ID
   * @returns {Promise<Object>} Updated user
   */
  async assignRoleToUser(userId, roleId) {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw createApiError('NOT_FOUND', 'User not found');
      }

      const role = await this.roleRepository.findById(roleId);
      if (!role) {
        throw createApiError('NOT_FOUND', 'Role not found');
      }

      // Update user's role
      user.role = roleId;
      await user.save();

      return user;
    } catch (error) {
      throw error.apiError ? error : createApiError(
        'SERVER_ERROR',
        'Error assigning role to user',
      );
    }
  }

  /**
   * Get all roles
   * @param {Object} filters - Optional filters
   * @returns {Promise<Array>} List of roles
   */
  async getAllRoles(filters = {}) {
    try {
      return this.roleRepository.findAll(filters);
    } catch (error) {
      throw createApiError('SERVER_ERROR', 'Error fetching roles');
    }
  }

  /**
   * Get role by ID
   * @param {string} roleId - Role ID
   * @returns {Promise<Object>} Role object
   */
  async getRoleById(roleId) {
    try {
      const role = await this.roleRepository.findById(roleId);
      if (!role) {
        throw createApiError('NOT_FOUND', 'Role not found');
      }
      return role;
    } catch (error) {
      throw error.apiError ? error : createApiError(
        'SERVER_ERROR',
        'Error fetching role',
      );
    }
  }

  /**
   * Create a new role
   * @param {Object} roleData - Role data
   * @param {string} createdBy - User ID of creator
   * @returns {Promise<Object>} Created role
   */
  async createRole(roleData, createdBy) {
    try {
      // Check if role with same name already exists
      const existingRole = await this.roleRepository.findByName(roleData.name);
      if (existingRole) {
        throw createApiError(
          'CONFLICT',
          'Role with this name already exists',
        );
      }

      return this.roleRepository.create({
        ...roleData,
        createdBy,
        updatedBy: createdBy,
      });
    } catch (error) {
      throw error.apiError ? error : createApiError(
        'SERVER_ERROR',
        'Error creating role',
      );
    }
  }

  /**
   * Update a role
   * @param {string} roleId - Role ID
   * @param {Object} roleData - Role data
   * @param {string} updatedBy - User ID of updater
   * @returns {Promise<Object>} Updated role
   */
  async updateRole(roleId, roleData, updatedBy) {
    try {
      const role = await this.roleRepository.findById(roleId);
      if (!role) {
        throw createApiError('NOT_FOUND', 'Role not found');
      }

      // Don't allow updating system roles
      if (role.isSystem && (roleData.name || roleData.isSystem === false)) {
        throw createApiError('FORBIDDEN', 'Cannot modify system role properties');
      }

      // Check name uniqueness if name is being updated
      if (roleData.name && roleData.name !== role.name) {
        const existingRole = await this.roleRepository.findByName(roleData.name);
        if (existingRole && existingRole.id !== roleId) {
          throw createApiError(
            'CONFLICT',
            'Role with this name already exists',
          );
        }
      }

      return this.roleRepository.update(roleId, {
        ...roleData,
        updatedBy,
      });
    } catch (error) {
      throw error.apiError ? error : createApiError(
        'SERVER_ERROR',
        'Error updating role',
      );
    }
  }

  /**
   * Delete a role
   * @param {string} roleId - Role ID
   * @returns {Promise<boolean>} True if deleted
   */
  async deleteRole(roleId) {
    try {
      const role = await this.roleRepository.findById(roleId);
      if (!role) {
        throw createApiError('NOT_FOUND', 'Role not found');
      }

      // Don't allow deleting system roles
      if (role.isSystem) {
        throw createApiError('FORBIDDEN', 'Cannot delete system role');
      }

      // Check if role is assigned to any users
      const usersWithRole = await this.userRepository.findByRole(roleId);
      if (usersWithRole.length > 0) {
        throw createApiError(
          'CONFLICT',
          'Role is assigned to users and cannot be deleted',
        );
      }

      const deleted = await this.roleRepository.delete(roleId);
      if (!deleted) {
        throw createApiError('SERVER_ERROR', 'Failed to delete role');
      }

      return true;
    } catch (error) {
      throw error.apiError ? error : createApiError(
        'SERVER_ERROR',
        'Error deleting role',
      );
    }
  }

  /**
   * Get all permissions
   * @param {Object} filters - Optional filters
   * @returns {Promise<Array>} List of permissions
   */
  async getAllPermissions(filters = {}) {
    try {
      return this.permissionRepository.findAll(filters);
    } catch (error) {
      throw createApiError('SERVER_ERROR', 'Error fetching permissions');
    }
  }

  /**
   * Get permission by ID
   * @param {string} permissionId - Permission ID
   * @returns {Promise<Object>} Permission object
   */
  async getPermissionById(permissionId) {
    try {
      const permission = await this.permissionRepository.findById(permissionId);
      if (!permission) {
        throw createApiError('NOT_FOUND', 'Permission not found');
      }
      return permission;
    } catch (error) {
      throw error.apiError ? error : createApiError(
        'SERVER_ERROR',
        'Error fetching permission',
      );
    }
  }

  /**
   * Create a new permission
   * @param {Object} permissionData - Permission data
   * @param {string} createdBy - User ID of creator
   * @returns {Promise<Object>} Created permission
   */
  async createPermission(permissionData, createdBy) {
    try {
      // Generate code if not provided
      if (!permissionData.code && permissionData.module && permissionData.action) {
        permissionData.code = this.permissionRepository.generateCode(
          permissionData.module,
          permissionData.action,
        );
      }

      // Check if permission with same code already exists
      const existingPermission = await this.permissionRepository.findByCode(permissionData.code);
      if (existingPermission) {
        throw createApiError('CONFLICT', 'Permission with this code already exists');
      }

      return this.permissionRepository.create({
        ...permissionData,
        createdBy,
        updatedBy: createdBy,
      });
    } catch (error) {
      throw error.apiError ? error : createApiError(
        'SERVER_ERROR',
        'Error creating permission',
      );
    }
  }

  /**
   * Update a permission
   * @param {string} permissionId - Permission ID
   * @param {Object} permissionData - Permission data
   * @param {string} updatedBy - User ID of updater
   * @returns {Promise<Object>} Updated permission
   */
  async updatePermission(permissionId, permissionData, updatedBy) {
    try {
      const permission = await this.permissionRepository.findById(permissionId);
      if (!permission) {
        throw createApiError('NOT_FOUND', 'Permission not found');
      }

      // Don't allow updating system permissions
      if (permission.isSystem && (permissionData.code || permissionData.isSystem === false)) {
        throw createApiError('FORBIDDEN', 'Cannot modify system permission properties');
      }

      // Check code uniqueness if code is being updated
      if (permissionData.code && permissionData.code !== permission.code) {
        const existingPermission = await this.permissionRepository.findByCode(
          permissionData.code,
        );
        if (existingPermission && existingPermission.id !== permissionId) {
          throw createApiError('CONFLICT', 'Permission with this code already exists');
        }
      }

      return this.permissionRepository.update(permissionId, {
        ...permissionData,
        updatedBy,
      });
    } catch (error) {
      throw error.apiError ? error : createApiError(
        'SERVER_ERROR',
        'Error updating permission',
      );
    }
  }

  /**
   * Delete a permission
   * @param {string} permissionId - Permission ID
   * @returns {Promise<boolean>} True if deleted
   */
  async deletePermission(permissionId) {
    try {
      const permission = await this.permissionRepository.findById(permissionId);
      if (!permission) {
        throw createApiError('NOT_FOUND', 'Permission not found');
      }

      // Don't allow deleting system permissions
      if (permission.isSystem) {
        throw createApiError('FORBIDDEN', 'Cannot delete system permission');
      }

      // Check if permission is assigned to any roles
      const rolesWithPermission = await this.roleRepository.getRolesWithPermission(permissionId);
      if (rolesWithPermission.length > 0) {
        throw createApiError(
          'CONFLICT',
          'Permission is assigned to roles and cannot be deleted',
        );
      }

      const deleted = await this.permissionRepository.delete(permissionId);
      if (!deleted) {
        throw createApiError('SERVER_ERROR', 'Failed to delete permission');
      }

      return true;
    } catch (error) {
      throw error.apiError ? error : createApiError(
        'SERVER_ERROR',
        'Error deleting permission',
      );
    }
  }

  /**
   * Assign permission to role
   * @param {string} roleId - Role ID
   * @param {string} permissionId - Permission ID
   * @returns {Promise<Object>} Updated role
   */
  async assignPermissionToRole(roleId, permissionId) {
    try {
      const role = await this.roleRepository.findById(roleId);
      if (!role) {
        throw createApiError('NOT_FOUND', 'Role not found');
      }

      const permission = await this.permissionRepository.findById(permissionId);
      if (!permission) {
        throw createApiError('NOT_FOUND', 'Permission not found');
      }

      return this.roleRepository.addPermission(roleId, permissionId);
    } catch (error) {
      throw error.apiError ? error : createApiError(
        'SERVER_ERROR',
        'Error assigning permission to role',
      );
    }
  }

  /**
   * Remove permission from role
   * @param {string} roleId - Role ID
   * @param {string} permissionId - Permission ID
   * @returns {Promise<Object>} Updated role
   */
  async removePermissionFromRole(roleId, permissionId) {
    try {
      const role = await this.roleRepository.findById(roleId);
      if (!role) {
        throw createApiError('NOT_FOUND', 'Role not found');
      }

      return this.roleRepository.removePermission(roleId, permissionId);
    } catch (error) {
      throw error.apiError ? error : createApiError(
        'SERVER_ERROR',
        'Error removing permission from role',
      );
    }
  }

  /**
   * Get permissions for a role
   * @param {string} roleId - Role ID
   * @returns {Promise<Array>} List of permissions
   */
  async getPermissionsForRole(roleId) {
    try {
      const role = await this.roleRepository.findById(roleId);
      if (!role) {
        throw createApiError('NOT_FOUND', 'Role not found');
      }

      return this.roleRepository.getPermissions(roleId);
    } catch (error) {
      throw error.apiError ? error : createApiError(
        'SERVER_ERROR',
        'Error fetching permissions for role',
      );
    }
  }

  /**
   * Get roles with specific permission
   * @param {string} permissionId - Permission ID
   * @returns {Promise<Array>} List of roles
   */
  async getRolesWithPermission(permissionId) {
    try {
      const permission = await this.permissionRepository.findById(permissionId);
      if (!permission) {
        throw createApiError('NOT_FOUND', 'Permission not found');
      }

      return this.roleRepository.getRolesWithPermission(permissionId);
    } catch (error) {
      throw error.apiError ? error : createApiError(
        'SERVER_ERROR',
        'Error fetching roles with permission',
      );
    }
  }
}

module.exports = AuthorizationService;
