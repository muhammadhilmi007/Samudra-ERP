/**
 * Samudra Paket ERP - MongoDB User Repository
 * Implementation of the User Repository interface for MongoDB
 */

const crypto = require('crypto');
const UserRepository = require('../../domain/repositories/userRepository');
const User = require('../../domain/models/user');

/**
 * MongoDB User Repository
 * Concrete implementation of the User Repository interface
 */
/* eslint-disable class-methods-use-this */
class MongoUserRepository extends UserRepository {

  /**
   * Find all users with optional filters
   * @param {Object} filters - Filter criteria
   * @returns {Promise<Array>} List of users
   */
  async findAll(filters = {}) {
    return User.find(filters).select('-password -refreshTokens -mfaSecret').sort({ createdAt: -1 });
  }

  /**
   * Find user by ID
   * @param {string} id - User ID
   * @returns {Promise<Object>} User object
   */
  async findById(id) {
    return User.findById(id).select('-password -refreshTokens -mfaSecret');
  }

  /**
   * Find user by username
   * @param {string} username - Username
   * @returns {Promise<Object>} User object with password for authentication
   */
  async findByUsername(username) {
    return User.findOne({ username });
  }

  /**
   * Find user by email
   * @param {string} email - Email address
   * @returns {Promise<Object>} User object
   */
  async findByEmail(email) {
    return User.findOne({ email });
  }

  /**
   * Find user by email verification token
   * @param {string} token - Email verification token
   * @returns {Promise<Object>} User object
   */
  async findByEmailVerificationToken(token) {
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    return User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() }
    });
  }

  /**
   * Find user by password reset token
   * @param {string} token - Password reset token
   * @returns {Promise<Object>} User object
   */
  async findByPasswordResetToken(token) {
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    return User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });
  }

  /**
   * Find user by refresh token
   * @param {string} token - Refresh token
   * @returns {Promise<Object>} User object
   */
  async findByRefreshToken(token) {
    return User.findOne({
      'refreshTokens.token': token,
      'refreshTokens.expiresAt': { $gt: new Date() }
    });
  }

  /**
   * Create a new user
   * @param {Object} userData - User data
   * @returns {Promise<Object>} Created user
   */
  async create(userData) {
    const newUser = new User(userData);
    
    // Generate email verification token if not already verified
    if (!userData.isEmailVerified) {
      newUser.generateEmailVerificationToken();
    }
    
    await newUser.save();
    
    return newUser.toObject({ 
      getters: true, 
      versionKey: false, 
      transform: (doc, ret) => {
        const userObj = { ...ret };
        delete userObj.password;
        delete userObj.refreshTokens;
        delete userObj.mfaSecret;
        return userObj;
      }
    });
  }

  /**
   * Update a user
   * @param {string} id - User ID
   * @param {Object} userData - User data to update
   * @returns {Promise<Object>} Updated user
   */
  async update(id, userData) {
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: userData },
      { new: true, runValidators: true }
    ).select('-password -refreshTokens -mfaSecret');
    
    return updatedUser;
  }

  /**
   * Update user permissions
   * @param {string} id - User ID
   * @param {Array} permissions - New permissions
   * @returns {Promise<Object>} Updated user
   */
  async updatePermissions(id, permissions) {
    return User.findByIdAndUpdate(
      id,
      { $set: { permissions } },
      { new: true, runValidators: true }
    ).select('-password -refreshTokens -mfaSecret');
  }

  /**
   * Update user role
   * @param {string} id - User ID
   * @param {string} role - New role
   * @returns {Promise<Object>} Updated user
   */
  async updateRole(id, role) {
    return User.findByIdAndUpdate(
      id,
      { $set: { role } },
      { new: true, runValidators: true }
    ).select('-password -refreshTokens -mfaSecret');
  }

  /**
   * Add refresh token to user
   * @param {string} id - User ID
   * @param {string} token - Refresh token
   * @param {Date} expiresAt - Token expiration date
   * @param {string} userAgent - User agent string
   * @param {string} ipAddress - IP address
   * @returns {Promise<Object>} Updated user
   */
  async addRefreshToken(id, token, expiresAt, userAgent, ipAddress) {
    const user = await User.findById(id);
    if (!user) return null;

    user.addRefreshToken(token, expiresAt, userAgent, ipAddress);
    await user.save();

    return user.toObject({ 
      getters: true, 
      versionKey: false, 
      transform: (doc, ret) => {
        const userObj = { ...ret };
        delete userObj.password;
        delete userObj.refreshTokens;
        delete userObj.mfaSecret;
        return userObj;
      }
    });
  }

  /**
   * Remove refresh token from user
   * @param {string} id - User ID
   * @param {string} token - Refresh token
   * @returns {Promise<boolean>} True if token was removed
   */
  async removeRefreshToken(id, token) {
    const user = await User.findById(id);
    if (!user) return false;

    const removed = user.removeRefreshToken(token);
    if (!removed) return false;

    await user.save();
    return true;
  }

  /**
   * Clear all refresh tokens for a user
   * @param {string} id - User ID
   * @returns {Promise<boolean>} True if tokens were cleared
   */
  async clearAllRefreshTokens(id) {
    const result = await User.updateOne(
      { _id: id },
      { $set: { refreshTokens: [] } }
    );
    
    return result.modifiedCount > 0;
  }

  /**
   * Verify email for a user
   * @param {string} token - Email verification token
   * @returns {Promise<Object>} Updated user
   */
  async verifyEmail(token) {
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) return null;

    // Clear verification token and set email as verified
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    user.isEmailVerified = true;
    user.emailVerifiedAt = new Date();

    await user.save();

    return user.toObject({ 
      getters: true, 
      versionKey: false, 
      transform: (doc, ret) => {
        const userObj = { ...ret };
        delete userObj.password;
        delete userObj.refreshTokens;
        delete userObj.mfaSecret;
        return userObj;
      }
    });
  }

  /**
   * Reset password for a user
   * @param {string} token - Password reset token
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} Updated user
   */
  async resetPassword(token, newPassword) {
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) return null;

    // Update password and clear reset token
    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.passwordChangedAt = new Date();

    await user.save();

    return user.toObject({ 
      getters: true, 
      versionKey: false, 
      transform: (doc, ret) => {
        const userObj = { ...ret };
        delete userObj.password;
        delete userObj.refreshTokens;
        delete userObj.mfaSecret;
        return userObj;
      }
    });
  }

  /**
   * Change password for a user
   * @param {string} id - User ID
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<boolean>} True if password was changed
   */
  async changePassword(id, currentPassword, newPassword) {
    const user = await User.findById(id);
    if (!user) return false;

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return false;

    // Update password
    user.password = newPassword;
    user.passwordChangedAt = new Date();
    await user.save();

    return true;
  }

  /**
   * Enable MFA for a user
   * @param {string} id - User ID
   * @param {string} secret - MFA secret
   * @returns {Promise<Object>} Updated user
   */
  async enableMfa(id, secret) {
    const user = await User.findByIdAndUpdate(
      id,
      { 
        $set: { 
          mfaSecret: secret,
          isMfaEnabled: true 
        } 
      },
      { new: true, runValidators: true }
    ).select('-password -refreshTokens');
    
    return user;
  }

  /**
   * Disable MFA for a user
   * @param {string} id - User ID
   * @returns {Promise<Object>} Updated user
   */
  async disableMfa(id) {
    const user = await User.findByIdAndUpdate(
      id,
      { 
        $set: { 
          isMfaEnabled: false 
        },
        $unset: {
          mfaSecret: ""
        }
      },
      { new: true, runValidators: true }
    ).select('-password -refreshTokens');
    
    return user;
  }

  /**
   * Track failed login attempt for a user
   * @param {string} id - User ID
   * @returns {Promise<Object>} Updated user
   */
  async trackFailedLogin(id) {
    const user = await User.findById(id);
    if (!user) return null;

    user.failedLoginAttempts += 1;
    user.lastFailedLoginAt = new Date();

    // Lock account if too many failed attempts
    if (user.failedLoginAttempts >= 5) {
      user.isLocked = true;
      user.lockedUntil = new Date(Date.now() + 30 * 60 * 1000); // Lock for 30 minutes
    }

    await user.save();
    return user.toObject({ getters: true, versionKey: false });
  }

  /**
   * Reset failed login attempts for a user
   * @param {string} id - User ID
   * @returns {Promise<Object>} Updated user
   */
  async resetFailedLogins(id) {
    const user = await User.findByIdAndUpdate(
      id,
      { 
        $set: { 
          failedLoginAttempts: 0,
          isLocked: false,
          lockedUntil: null
        } 
      },
      { new: true, runValidators: true }
    ).select('-password -refreshTokens -mfaSecret');
    
    return user;
  }

  /**
   * Delete a user
   * @param {string} id - User ID
   * @returns {Promise<boolean>} True if deleted
   */
  async delete(id) {
    const result = await User.deleteOne({ _id: id });
    return result.deletedCount > 0;
  }
}

module.exports = MongoUserRepository;
