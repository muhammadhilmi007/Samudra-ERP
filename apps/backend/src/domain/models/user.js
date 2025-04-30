/* eslint-disable max-len */
/**
 * Samudra Paket ERP - User Model
 * Domain model for user entity with RBAC support
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

/**
 * User Schema
 * Represents a system user with role-based access control and enhanced authentication features
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
  phoneNumber: {
    type: String,
    trim: true,
  },
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    required: true,
    index: true,
  },
  permissions: [{
    type: String, // Store permission codes for faster access
    uppercase: true,
    trim: true,
  }],
  // Legacy role field for backward compatibility
  legacyRole: {
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
    index: true,
  },
  isActive: {
    type: Boolean,
    default: false, // Users need to verify email before becoming active
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  emailVerificationToken: {
    type: String,
    index: true,
  },
  emailVerificationExpires: {
    type: Date,
  },
  passwordResetToken: {
    type: String,
    index: true,
  },
  passwordResetExpires: {
    type: Date,
  },
  mfaEnabled: {
    type: Boolean,
    default: false,
  },
  mfaSecret: {
    type: String,
  },
  lastLogin: {
    type: Date,
  },
  lastPasswordChange: {
    type: Date,
  },
  failedLoginAttempts: {
    type: Number,
    default: 0,
  },
  lockUntil: {
    type: Date,
  },
  refreshTokens: [{
    token: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    userAgent: String,
    ipAddress: String,
  }],
}, {
  timestamps: true,
});

/**
 * Pre-save hook to hash password and update lastPasswordChange
 */
userSchema.pre('save', async function hashPasswordHook(next) {
  // Only hash the password if it's modified or new
  if (this.isModified('password')) {
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
      this.lastPasswordChange = new Date();
    } catch (error) {
      return next(error);
    }
  }
  return next();
});

/**
 * Method to compare password
 * @param {string} candidatePassword - Password to compare
 * @returns {Promise<boolean>} True if password matches
 */
userSchema.methods.comparePassword = async function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

/**
 * Method to generate email verification token
 * @returns {string} Email verification token
 */
userSchema.methods.generateEmailVerificationToken = function generateEmailVerificationToken() {
  const token = crypto.randomBytes(32).toString('hex');

  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  // Token expires in 24 hours
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;

  return token;
};

/**
 * Method to generate password reset token
 * @returns {string} Password reset token
 */
userSchema.methods.generatePasswordResetToken = function generatePasswordResetToken() {
  const token = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  // Token expires in 1 hour
  this.passwordResetExpires = Date.now() + 60 * 60 * 1000;

  return token;
};

/**
 * Method to add a refresh token
 * @param {string} token - JWT refresh token
 * @param {Date} expiresAt - Token expiration date
 * @param {string} userAgent - User agent string
 * @param {string} ipAddress - IP address
 */
userSchema.methods.addRefreshToken = function addRefreshToken(token, expiresAt, userAgent, ipAddress) {
  // Store only a limited number of refresh tokens per user (e.g., 5)
  // This allows a user to be logged in from multiple devices
  if (this.refreshTokens.length >= 5) {
    // Remove the oldest token
    this.refreshTokens.sort((a, b) => a.createdAt - b.createdAt);
    this.refreshTokens.shift();
  }

  this.refreshTokens.push({
    token,
    expiresAt,
    userAgent,
    ipAddress,
  });
};

/**
 * Method to remove a refresh token
 * @param {string} token - JWT refresh token to remove
 * @returns {boolean} True if token was found and removed
 */
userSchema.methods.removeRefreshToken = function removeRefreshToken(token) {
  const initialLength = this.refreshTokens.length;
  this.refreshTokens = this.refreshTokens.filter((t) => t.token !== token);
  return initialLength > this.refreshTokens.length;
};

/**
 * Method to clear all refresh tokens
 */
userSchema.methods.clearAllRefreshTokens = function clearAllRefreshTokens() {
  this.refreshTokens = [];
};

/**
 * Method to check if a refresh token exists and is valid
 * @param {string} token - JWT refresh token to check
 * @returns {boolean} True if token exists and is not expired
 */
userSchema.methods.hasValidRefreshToken = function hasValidRefreshToken(token) {
  const tokenObj = this.refreshTokens.find((t) => t.token === token);
  return tokenObj && new Date(tokenObj.expiresAt) > new Date();
};

/**
 * Method to track failed login attempts
 */
userSchema.methods.incrementLoginAttempts = function incrementLoginAttempts() {
  // Increment login attempts
  this.failedLoginAttempts += 1;

  // Lock account after 5 failed attempts for 15 minutes
  if (this.failedLoginAttempts >= 5) {
    this.lockUntil = Date.now() + 15 * 60 * 1000; // 15 minutes
  }
};

/**
 * Method to reset failed login attempts
 */
userSchema.methods.resetLoginAttempts = function resetLoginAttempts() {
  this.failedLoginAttempts = 0;
  this.lockUntil = undefined;
};

/**
 * Method to check if account is locked
 * @returns {boolean} True if account is locked
 */
userSchema.methods.isAccountLocked = function isAccountLocked() {
  return this.lockUntil && new Date(this.lockUntil) > new Date();
};

/**
 * Method to check if user has specific permission
 * @param {string} permission - Permission code to check
 * @returns {boolean} True if user has permission
 */
userSchema.methods.hasPermission = function hasPermission(permission) {
  const permissionCode = permission.toUpperCase();
  return this.permissions.includes(permissionCode) || this.permissions.includes('ALL');
};

/**
 * Method to check if user has specific role
 * @param {string|string[]} roleIds - Role ID(s) to check
 * @returns {boolean} True if user has any of the roles
 */
userSchema.methods.hasRole = function hasRole(roleIds) {
  if (!this.role) return false;

  if (Array.isArray(roleIds)) {
    return roleIds.some((roleId) => this.role.toString() === roleId.toString());
  }
  return this.role.toString() === roleIds.toString();
};

/**
 * Method to check if user has specific legacy role
 * @param {string|string[]} roles - Legacy role(s) to check
 * @returns {boolean} True if user has any of the legacy roles
 */
userSchema.methods.hasLegacyRole = function hasLegacyRole(roles) {
  if (!this.legacyRole) return false;

  if (Array.isArray(roles)) {
    return roles.includes(this.legacyRole);
  }
  return this.legacyRole === roles;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
