/**
 * Samudra Paket ERP - MongoDB Permission Repository
 * MongoDB implementation of Permission Repository interface
 */

const PermissionRepository = require('../../domain/repositories/permissionRepository');
const Permission = require('../../domain/models/permission');

/* eslint-disable class-methods-use-this */

/**
 * MongoDB Permission Repository
 * Concrete implementation of the Permission Repository interface
 */
class MongoPermissionRepository extends PermissionRepository {
  /**
   * Find all permissions with optional filters
   * @param {Object} filters - Filter criteria
   * @returns {Promise<Array>} List of permissions
   */
  async findAll(filters = {}) {
    return Permission.find(filters).sort({ module: 1, name: 1 });
  }

  /**
   * Find permission by ID
   * @param {string} id - Permission ID
   * @returns {Promise<Object>} Permission object
   */
  async findById(id) {
    return Permission.findById(id);
  }

  /**
   * Find permission by code
   * @param {string} code - Permission code
   * @returns {Promise<Object>} Permission object
   */
  async findByCode(code) {
    return Permission.findOne({ code: code.toUpperCase() });
  }

  /**
   * Find permission by name
   * @param {string} name - Permission name
   * @returns {Promise<Object>} Permission object
   */
  async findByName(name) {
    return Permission.findOne({ name: name.toUpperCase() });
  }

  /**
   * Find permissions by module
   * @param {string} module - Module name
   * @returns {Promise<Array>} List of permissions for the module
   */
  async findByModule(module) {
    return Permission.find({ module: module.toUpperCase() }).sort({ name: 1 });
  }

  /**
   * Create a new permission
   * @param {Object} permissionData - Permission data
   * @returns {Promise<Object>} Created permission
   */
  async create(permissionData) {
    // Create a copy of the data to avoid modifying the parameter
    const permissionDataCopy = { ...permissionData };

    // Generate code if not provided
    if (!permissionDataCopy.code && permissionDataCopy.module && permissionDataCopy.action) {
      permissionDataCopy.code = this.generateCode(permissionDataCopy.module, permissionDataCopy.action);
    }

    const permission = new Permission({
      ...permissionDataCopy,
      name: permissionDataCopy.name.toUpperCase(),
      code: permissionDataCopy.code.toUpperCase(),
      module: permissionDataCopy.module.toUpperCase(),
      action: permissionDataCopy.action.toUpperCase(),
    });

    await permission.save();
    return permission;
  }

  /**
   * Update a permission
   * @param {string} id - Permission ID
   * @param {Object} permissionData - Permission data to update
   * @returns {Promise<Object>} Updated permission
   */
  async update(id, permissionData) {
    // Create a copy of the data to avoid modifying the parameter
    const updatedData = { ...permissionData };

    // Don't allow updating name or code to empty
    if (updatedData.name) {
      updatedData.name = updatedData.name.toUpperCase();
    }

    if (updatedData.code) {
      updatedData.code = updatedData.code.toUpperCase();
    }

    if (updatedData.module) {
      updatedData.module = updatedData.module.toUpperCase();
    }

    if (updatedData.action) {
      updatedData.action = updatedData.action.toUpperCase();
    }

    const updatedPermission = await Permission.findByIdAndUpdate(
      id,
      { $set: updatedData },
      { new: true, runValidators: true },
    );

    return updatedPermission;
  }

  /**
   * Delete a permission
   * @param {string} id - Permission ID
   * @returns {Promise<boolean>} True if deleted
   */
  async delete(id) {
    // Don't allow deleting system permissions
    const permission = await Permission.findById(id);
    if (!permission || permission.isSystem) {
      return false;
    }

    const result = await Permission.deleteOne({ _id: id });
    return result.deletedCount > 0;
  }

  /**
   * Get permissions by action type
   * @param {string} action - Action type (CREATE, READ, UPDATE, DELETE, EXECUTE, ALL)
   * @returns {Promise<Array>} List of permissions with the action type
   */
  async getPermissionsByAction(action) {
    return Permission.find({ action: action.toUpperCase() }).sort({ module: 1, name: 1 });
  }

  /**
   * Check if permission code exists
   * @param {string} code - Permission code
   * @returns {Promise<boolean>} True if permission code exists
   */
  async codeExists(code) {
    const permission = await Permission.findOne({ code: code.toUpperCase() });
    return !!permission;
  }
}

module.exports = MongoPermissionRepository;
