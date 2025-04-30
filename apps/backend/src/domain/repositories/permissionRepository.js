/**
 * Samudra Paket ERP - Permission Repository Interface
 * Repository interface for Permission entity
 */

/* eslint-disable class-methods-use-this, no-unused-vars */

/**
 * Permission Repository Interface
 * Defines methods for Permission data access
 */
class PermissionRepository {
  /**
   * Find all permissions with optional filters
   * @param {Object} filters - Filter criteria
   * @returns {Promise<Array>} List of permissions
   */
  async findAll(filters = {}) {
    this.throwNotImplemented('findAll');
  }

  /**
   * Find permission by ID
   * @param {string} id - Permission ID
   * @returns {Promise<Object>} Permission object
   */
  async findById(id) {
    this.throwNotImplemented('findById');
  }

  /**
   * Find permission by code
   * @param {string} code - Permission code
   * @returns {Promise<Object>} Permission object
   */
  async findByCode(code) {
    this.throwNotImplemented('findByCode');
  }

  /**
   * Find permission by name
   * @param {string} name - Permission name
   * @returns {Promise<Object>} Permission object
   */
  async findByName(name) {
    this.throwNotImplemented('findByName');
  }

  /**
   * Find permissions by module
   * @param {string} module - Module name
   * @returns {Promise<Array>} List of permissions for the module
   */
  async findByModule(module) {
    this.throwNotImplemented('findByModule');
  }

  /**
   * Create a new permission
   * @param {Object} permissionData - Permission data
   * @returns {Promise<Object>} Created permission
   */
  async create(permissionData) {
    this.throwNotImplemented('create');
  }

  /**
   * Update a permission
   * @param {string} id - Permission ID
   * @param {Object} permissionData - Permission data to update
   * @returns {Promise<Object>} Updated permission
   */
  async update(id, permissionData) {
    this.throwNotImplemented('update');
  }

  /**
   * Delete a permission
   * @param {string} id - Permission ID
   * @returns {Promise<boolean>} True if deleted
   */
  async delete(id) {
    this.throwNotImplemented('delete');
  }

  /**
   * Get permissions by action type
   * @param {string} action - Action type (CREATE, READ, UPDATE, DELETE, EXECUTE, ALL)
   * @returns {Promise<Array>} List of permissions with the action type
   */
  async getPermissionsByAction(action) {
    this.throwNotImplemented('getPermissionsByAction');
  }

  /**
   * Check if permission code exists
   * @param {string} code - Permission code
   * @returns {Promise<boolean>} True if permission code exists
   */
  async codeExists(code) {
    this.throwNotImplemented('codeExists');
  }

  /**
   * Generate permission code
   * @param {string} module - Module name
   * @param {string} action - Action type
   * @returns {string} Generated permission code
   */
  generateCode(module, action) {
    return `${module.toUpperCase()}_${action.toUpperCase()}`;
  }

  /**
   * Throw not implemented error
   * @param {string} methodName - Name of the method
   * @private
   */
  throwNotImplemented(methodName) {
    throw new Error(`Method ${methodName} in PermissionRepository is not implemented`);
  }
}

module.exports = PermissionRepository;
