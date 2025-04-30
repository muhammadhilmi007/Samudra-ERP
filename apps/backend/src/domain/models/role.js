/**
 * Samudra Paket ERP - Role Model
 * Domain model for role entity in RBAC system
 */

const mongoose = require('mongoose');

/**
 * Role Schema
 * Represents a role in the RBAC system with associated permissions
 */
const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
    index: true,
  },
  description: {
    type: String,
    required: true,
  },
  permissions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Permission',
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
  isSystem: {
    type: Boolean,
    default: false, // True for built-in roles that cannot be deleted
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

/**
 * Pre-save middleware to update the updatedAt field
 */
roleSchema.pre('save', function preSave(next) {
  this.updatedAt = Date.now();
  next();
});

/**
 * Method to check if role has specific permission
 * @param {string} permissionId - Permission ID to check
 * @returns {boolean} True if role has permission
 */
roleSchema.methods.hasPermission = function hasPermission(permissionId) {
  return this.permissions.some((permission) => permission.toString() === permissionId.toString());
};

/**
 * Method to add permission to role
 * @param {string} permissionId - Permission ID to add
 * @returns {boolean} True if permission was added
 */
roleSchema.methods.addPermission = function addPermission(permissionId) {
  if (this.hasPermission(permissionId)) {
    return false;
  }

  this.permissions.push(permissionId);
  return true;
};

/**
 * Method to remove permission from role
 * @param {string} permissionId - Permission ID to remove
 * @returns {boolean} True if permission was removed
 */
roleSchema.methods.removePermission = function removePermission(permissionId) {
  const initialLength = this.permissions.length;
  // eslint-disable-next-line max-len
  this.permissions = this.permissions.filter((permission) => permission.toString() !== permissionId.toString());

  return this.permissions.length !== initialLength;
};

const Role = mongoose.model('Role', roleSchema);

module.exports = Role;
