/**
 * Samudra Paket ERP - Package Repository Interface
 * Defines the contract for package data access
 */

/**
 * Package Repository Interface
 * Following the repository pattern for clean architecture
 */
class PackageRepository {
  /**
   * Find all packages with optional filters
   * @param {Object} _filters - Filter criteria
   * @returns {Promise<Array>} List of packages
   */
  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  async findAll(_filters = {}) {
    throw new Error('Method not implemented');
  }

  /**
   * Find package by ID
   * @param {string} _id - Package ID
   * @returns {Promise<Object>} Package object
   */
  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  async findById(_id) {
    throw new Error('Method not implemented');
  }

  /**
   * Find package by tracking number
   * @param {string} _trackingNumber - Package tracking number
   * @returns {Promise<Object>} Package object
   */
  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  async findByTrackingNumber(_trackingNumber) {
    throw new Error('Method not implemented');
  }

  /**
   * Create a new package
   * @param {Object} _packageData - Package data
   * @returns {Promise<Object>} Created package
   */
  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  async create(_packageData) {
    throw new Error('Method not implemented');
  }

  /**
   * Update a package
   * @param {string} _id - Package ID
   * @param {Object} _packageData - Package data to update
   * @returns {Promise<Object>} Updated package
   */
  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  async update(_id, _packageData) {
    throw new Error('Method not implemented');
  }

  /**
   * Update package status
   * @param {string} _id - Package ID
   * @param {string} _status - New status
   * @returns {Promise<Object>} Updated package
   */
  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  async updateStatus(_id, _status) {
    throw new Error('Method not implemented');
  }

  /**
   * Delete a package
   * @param {string} _id - Package ID
   * @returns {Promise<boolean>} True if deleted
   */
  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  async delete(_id) {
    throw new Error('Method not implemented');
  }
}

module.exports = PackageRepository;
