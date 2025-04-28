/**
 * Samudra Paket ERP - MongoDB Package Repository
 * Implementation of the Package Repository interface for MongoDB
 */

const PackageRepository = require('../../domain/repositories/packageRepository');
const Package = require('../../domain/models/package');

/**
 * MongoDB Package Repository
 * Concrete implementation of the Package Repository interface
 */
class MongoPackageRepository extends PackageRepository {
  /**
   * Find all packages with optional filters
   * @param {Object} filters - Filter criteria
   * @returns {Promise<Array>} List of packages
   */
  async findAll(filters = {}) {
    return Package.find(filters).sort({ createdAt: -1 });
  }

  /**
   * Find package by ID
   * @param {string} id - Package ID
   * @returns {Promise<Object>} Package object
   */
  async findById(id) {
    return Package.findById(id);
  }

  /**
   * Find package by tracking number
   * @param {string} trackingNumber - Package tracking number
   * @returns {Promise<Object>} Package object
   */
  async findByTrackingNumber(trackingNumber) {
    return Package.findOne({ trackingNumber });
  }

  /**
   * Create a new package
   * @param {Object} packageData - Package data
   * @returns {Promise<Object>} Created package
   */
  async create(packageData) {
    if (!packageData.trackingNumber) {
      packageData.trackingNumber = Package.generateTrackingNumber();
    }
    const newPackage = new Package(packageData);
    return newPackage.save();
  }

  /**
   * Update a package
   * @param {string} id - Package ID
   * @param {Object} packageData - Package data to update
   * @returns {Promise<Object>} Updated package
   */
  async update(id, packageData) {
    return Package.findByIdAndUpdate(
      id,
      { $set: packageData },
      { new: true, runValidators: true }
    );
  }

  /**
   * Update package status
   * @param {string} id - Package ID
   * @param {string} status - New status
   * @returns {Promise<Object>} Updated package
   */
  async updateStatus(id, status) {
    return Package.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true, runValidators: true }
    );
  }

  /**
   * Delete a package
   * @param {string} id - Package ID
   * @returns {Promise<boolean>} True if deleted
   */
  async delete(id) {
    const result = await Package.findByIdAndDelete(id);
    return !!result;
  }
}

module.exports = MongoPackageRepository;
