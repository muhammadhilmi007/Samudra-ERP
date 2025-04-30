/**
 * Samudra Paket ERP - Role Repository Interface
 * Repository interface for Role entity
 */

/* eslint-disable class-methods-use-this, no-unused-vars */

/**
 * Role Repository Interface
 * Defines methods for Role data access
 */
class RoleRepository {
  /**
   * Find all roles with optional filters
   * @param {Object} filters - Filter criteria
   * @returns {Promise<Array>} List of roles
   */
  async findAll(filters = {}) {
    this.throwNotImplemented('findAll');
  }

  /**
   * Find role by ID
   * @param {string} id - Role ID
   * @returns {Promise<Object>} Role object
   */
  async findById(id) {
    this.throwNotImplemented('findById');
  }

  /**
   * Find role by name
   * @param {string} name - Role name
   * @returns {Promise<Object>} Role object
   */
  async findByName(name) {
    this.throwNotImplemented('findByName');
  }

  /**
   * Create a new role
   * @param {Object} roleData - Role data
   * @returns {Promise<Object>} Created role
   */
  async create(roleData) {
    this.throwNotImplemented('create');
  }

  /**
   * Update a role
   * @param {string} id - Role ID
   * @param {Object} roleData - Role data to update
   * @returns {Promise<Object>} Updated role
   */
  async update(id, roleData) {
    this.throwNotImplemented('update');
  }

  /**
   * Delete a role
   * @param {string} id - Role ID
   * @returns {Promise<boolean>} True if deleted
   */
  async delete(id) {
    this.throwNotImplemented('delete');
  }

  /**
   * Add permission to role
   * @param {string} roleId - Role ID
   * @param {string} permissionId - Permission ID
   * @returns {Promise<Object>} Updated role
   */
  async addPermission(roleId, permissionId) {
    this.throwNotImplemented('addPermission');
  }

  /**
   * Remove permission from role
   * @param {string} roleId - Role ID
   * @param {string} permissionId - Permission ID
   * @returns {Promise<Object>} Updated role
   */
  async removePermission(roleId, permissionId) {
    this.throwNotImplemented('removePermission');
  }

  /**
   * Get roles with specific permission
   * @param {string} permissionId - Permission ID
   * @returns {Promise<Array>} List of roles with the permission
   */
  async getRolesWithPermission(permissionId) {
    this.throwNotImplemented('getRolesWithPermission');
  }

  /**
   * Get all permissions for a role
   * @param {string} roleId - Role ID
   * @returns {Promise<Array>} List of permissions
   */
  async getPermissions(roleId) {
    this.throwNotImplemented('getPermissions');
  }

  /**
   * Throw not implemented error
   * @param {string} methodName - Name of the method
   * @private
   */
  throwNotImplemented(methodName) {
    throw new Error(`Method ${methodName} in RoleRepository is not implemented`);
  }
}

module.exports = RoleRepository;
