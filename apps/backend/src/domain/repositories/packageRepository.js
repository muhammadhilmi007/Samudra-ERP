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
   * @param {Object} filters - Filter criteria
   * @returns {Promise<Array>} List of packages
   */
  async findAll(filters = {}) {
    throw new Error('Method not implemented');
  }

  /**
   * Find package by ID
   * @param {string} id - Package ID
   * @returns {Promise<Object>} Package object
   */
  async findById(id) {
    throw new Error('Method not implemented');
  }

  /**
   * Find package by tracking number
   * @param {string} trackingNumber - Package tracking number
   * @returns {Promise<Object>} Package object
   */
  async findByTrackingNumber(trackingNumber) {
    throw new Error('Method not implemented');
  }

  /**
   * Create a new package
   * @param {Object} packageData - Package data
   * @returns {Promise<Object>} Created package
   */
  async create(packageData) {
    throw new Error('Method not implemented');
  }

  /**
   * Update a package
   * @param {string} id - Package ID
   * @param {Object} packageData - Package data to update
   * @returns {Promise<Object>} Updated package
   */
  async update(id, packageData) {
    throw new Error('Method not implemented');
  }

  /**
   * Update package status
   * @param {string} id - Package ID
   * @param {string} status - New status
   * @returns {Promise<Object>} Updated package
   */
  async updateStatus(id, status) {
    throw new Error('Method not implemented');
  }

  /**
   * Delete a package
   * @param {string} id - Package ID
   * @returns {Promise<boolean>} True if deleted
   */
  async delete(id) {
    throw new Error('Method not implemented');
  }
}

module.exports = PackageRepository;
