/**
 * Samudra Paket ERP - MongoDB Role Repository
 * MongoDB implementation of Role Repository interface
 */

const RoleRepository = require('../../domain/repositories/roleRepository');
const Role = require('../../domain/models/role');

/* eslint-disable class-methods-use-this */

/**
 * MongoDB Role Repository
 * Concrete implementation of the Role Repository interface
 */
class MongoRoleRepository extends RoleRepository {
  /**
   * Find all roles with optional filters
   * @param {Object} filters - Filter criteria
   * @returns {Promise<Array>} List of roles
   */
  async findAll(filters = {}) {
    return Role.find(filters)
      .populate('permissions', 'name code description')
      .sort({ name: 1 });
  }

  /**
   * Find role by ID
   * @param {string} id - Role ID
   * @returns {Promise<Object>} Role object
   */
  async findById(id) {
    return Role.findById(id)
      .populate('permissions', 'name code description');
  }

  /**
   * Find role by name
   * @param {string} name - Role name
   * @returns {Promise<Object>} Role object
   */
  async findByName(name) {
    return Role.findOne({ name: name.toUpperCase() })
      .populate('permissions', 'name code description');
  }

  /**
   * Create a new role
   * @param {Object} roleData - Role data
   * @returns {Promise<Object>} Created role
   */
  async create(roleData) {
    const role = new Role({
      ...roleData,
      name: roleData.name.toUpperCase(),
    });

    await role.save();
    return role;
  }

  /**
   * Update a role
   * @param {string} id - Role ID
   * @param {Object} roleData - Role data to update
   * @returns {Promise<Object>} Updated role
   */
  async update(id, roleData) {
    // Don't allow updating name to empty
    const updatedData = { ...roleData };
    if (updatedData.name) {
      updatedData.name = updatedData.name.toUpperCase();
    }

    const updatedRole = await Role.findByIdAndUpdate(
      id,
      { $set: updatedData },
      { new: true, runValidators: true },
    ).populate('permissions', 'name code description');

    return updatedRole;
  }

  /**
   * Delete a role
   * @param {string} id - Role ID
   * @returns {Promise<boolean>} True if deleted
   */
  async delete(id) {
    // Don't allow deleting system roles
    const role = await Role.findById(id);
    if (!role || role.isSystem) {
      return false;
    }

    const result = await Role.deleteOne({ _id: id });
    return result.deletedCount > 0;
  }

  /**
   * Add permission to role
   * @param {string} roleId - Role ID
   * @param {string} permissionId - Permission ID
   * @returns {Promise<Object>} Updated role
   */
  async addPermission(roleId, permissionId) {
    const role = await Role.findById(roleId);
    if (!role) return null;

    // Check if permission already exists
    if (role.permissions.includes(permissionId)) {
      return role;
    }

    role.permissions.push(permissionId);
    await role.save();

    return Role.findById(roleId)
      .populate('permissions', 'name code description');
  }

  /**
   * Remove permission from role
   * @param {string} roleId - Role ID
   * @param {string} permissionId - Permission ID
   * @returns {Promise<Object>} Updated role
   */
  async removePermission(roleId, permissionId) {
    const role = await Role.findById(roleId);
    if (!role) return null;

    role.permissions = role.permissions.filter(
      (permission) => permission.toString() !== permissionId.toString(),
    );

    await role.save();

    return Role.findById(roleId)
      .populate('permissions', 'name code description');
  }

  /**
   * Get roles with specific permission
   * @param {string} permissionId - Permission ID
   * @returns {Promise<Array>} List of roles with the permission
   */
  async getRolesWithPermission(permissionId) {
    return Role.find({ permissions: permissionId })
      .populate('permissions', 'name code description')
      .sort({ name: 1 });
  }

  /**
   * Get all permissions for a role
   * @param {string} roleId - Role ID
   * @returns {Promise<Array>} List of permissions
   */
  async getPermissions(roleId) {
    const role = await Role.findById(roleId)
      .populate('permissions');

    return role ? role.permissions : [];
  }
}

module.exports = MongoRoleRepository;
