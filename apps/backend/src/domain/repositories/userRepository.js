/**
 * Samudra Paket ERP - User Repository Interface
 * Defines the contract for user data access
 */

/**
 * User Repository Interface
 * Following the repository pattern for clean architecture
 */
class UserRepository {
  /**
   * Find all users with optional filters
   * @param {Object} filters - Filter criteria
   * @returns {Promise<Array>} List of users
   */
  async findAll(filters = {}) {
    throw new Error('Method not implemented');
  }

  /**
   * Find user by ID
   * @param {string} id - User ID
   * @returns {Promise<Object>} User object
   */
  async findById(id) {
    throw new Error('Method not implemented');
  }

  /**
   * Find user by username
   * @param {string} username - Username
   * @returns {Promise<Object>} User object
   */
  async findByUsername(username) {
    throw new Error('Method not implemented');
  }

  /**
   * Find user by email
   * @param {string} email - Email address
   * @returns {Promise<Object>} User object
   */
  async findByEmail(email) {
    throw new Error('Method not implemented');
  }

  /**
   * Create a new user
   * @param {Object} userData - User data
   * @returns {Promise<Object>} Created user
   */
  async create(userData) {
    throw new Error('Method not implemented');
  }

  /**
   * Update a user
   * @param {string} id - User ID
   * @param {Object} userData - User data to update
   * @returns {Promise<Object>} Updated user
   */
  async update(id, userData) {
    throw new Error('Method not implemented');
  }

  /**
   * Update user permissions
   * @param {string} id - User ID
   * @param {Array} permissions - New permissions
   * @returns {Promise<Object>} Updated user
   */
  async updatePermissions(id, permissions) {
    throw new Error('Method not implemented');
  }

  /**
   * Update user role
   * @param {string} id - User ID
   * @param {string} role - New role
   * @returns {Promise<Object>} Updated user
   */
  async updateRole(id, role) {
    throw new Error('Method not implemented');
  }

  /**
   * Delete a user
   * @param {string} id - User ID
   * @returns {Promise<boolean>} True if deleted
   */
  async delete(id) {
    throw new Error('Method not implemented');
  }
}

module.exports = UserRepository;
