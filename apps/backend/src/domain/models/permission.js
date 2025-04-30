/**
 * Samudra Paket ERP - Permission Model
 * Domain model for permission entity in RBAC system
 */

const mongoose = require('mongoose');

/**
 * Permission Schema
 * Represents a permission in the RBAC system
 */
const permissionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
    index: true,
  },
  code: {
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
  module: {
    type: String,
    required: true,
    trim: true,
    uppercase: true,
    index: true,
  },
  action: {
    type: String,
    required: true,
    enum: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'EXECUTE', 'ALL'],
    default: 'READ',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isSystem: {
    type: Boolean,
    default: false, // True for built-in permissions that cannot be deleted
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
permissionSchema.pre('save', function preSave(next) {
  this.updatedAt = Date.now();
  next();
});

/**
 * Static method to generate permission code
 * @param {string} module - Module name
 * @param {string} action - Action type
 * @returns {string} Permission code
 */
permissionSchema.statics.generateCode = function generateCode(module, action) {
  return `${module.toUpperCase()}_${action.toUpperCase()}`;
};

const Permission = mongoose.model('Permission', permissionSchema);

module.exports = Permission;
