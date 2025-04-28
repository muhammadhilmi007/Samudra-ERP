/**
 * Samudra Paket ERP - MongoDB User Repository
 * Implementation of the User Repository interface for MongoDB
 */

const UserRepository = require('../../domain/repositories/userRepository');
const User = require('../../domain/models/user');

/**
 * MongoDB User Repository
 * Concrete implementation of the User Repository interface
 */
class MongoUserRepository extends UserRepository {
  /**
   * Find all users with optional filters
   * @param {Object} filters - Filter criteria
   * @returns {Promise<Array>} List of users
   */
  async findAll(filters = {}) {
    return User.find(filters).select('-password').sort({ createdAt: -1 });
  }

  /**
   * Find user by ID
   * @param {string} id - User ID
   * @returns {Promise<Object>} User object
   */
  async findById(id) {
    return User.findById(id).select('-password');
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
    return User.findOne({ email }).select('-password');
  }

  /**
   * Create a new user
   * @param {Object} userData - User data
   * @returns {Promise<Object>} Created user
   */
  async create(userData) {
    const newUser = new User(userData);
    await newUser.save();
    return newUser.toObject({ getters: true, versionKey: false, transform: (doc, ret) => {
      delete ret.password;
      return ret;
    }});
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
    ).select('-password');
    
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
    ).select('-password');
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
    ).select('-password');
  }

  /**
   * Delete a user
   * @param {string} id - User ID
   * @returns {Promise<boolean>} True if deleted
   */
  async delete(id) {
    const result = await User.findByIdAndDelete(id);
    return !!result;
  }
}

module.exports = MongoUserRepository;
