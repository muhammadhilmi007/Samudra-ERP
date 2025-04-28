/**
 * Samudra Paket ERP - User Model
 * Domain model for user entity with RBAC support
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User Schema
 * Represents a system user with role-based access control
 */
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    index: true,
  },
  password: {
    type: String,
    required: true,
  },
  fullName: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: [
      'ADMIN',
      'MANAGER',
      'OPERATOR',
      'DRIVER',
      'CHECKER',
      'DEBT_COLLECTOR',
      'CUSTOMER',
    ],
    default: 'CUSTOMER',
    index: true,
  },
  permissions: [{
    type: String,
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
  lastLogin: {
    type: Date,
  },
}, { 
  timestamps: true 
});

/**
 * Pre-save hook to hash password
 */
userSchema.pre('save', async function(next) {
  // Only hash the password if it's modified or new
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Method to compare password
 * @param {string} candidatePassword - Password to compare
 * @returns {Promise<boolean>} True if password matches
 */
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

/**
 * Method to check if user has specific permission
 * @param {string} permission - Permission to check
 * @returns {boolean} True if user has permission
 */
userSchema.methods.hasPermission = function(permission) {
  return this.permissions.includes(permission) || this.permissions.includes('ALL');
};

/**
 * Method to check if user has specific role
 * @param {string|string[]} roles - Role(s) to check
 * @returns {boolean} True if user has any of the roles
 */
userSchema.methods.hasRole = function(roles) {
  if (Array.isArray(roles)) {
    return roles.includes(this.role);
  }
  return this.role === roles;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
