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
  // eslint-disable-next-line class-methods-use-this
  async findAll(filters = {}) {
    return Package.find(filters).sort({ createdAt: -1 });
  }

  /**
   * Find package by ID
   * @param {string} id - Package ID
   * @returns {Promise<Object>} Package object
   */
  // eslint-disable-next-line class-methods-use-this
  async findById(id) {
    return Package.findById(id);
  }

  /**
   * Find package by tracking number
   * @param {string} trackingNumber - Package tracking number
   * @returns {Promise<Object>} Package object
   */
  // eslint-disable-next-line class-methods-use-this
  async findByTrackingNumber(trackingNumber) {
    return Package.findOne({ trackingNumber });
  }

  /**
   * Create a new package
   * @param {Object} packageData - Package data
   * @returns {Promise<Object>} Created package object
   */
  // eslint-disable-next-line class-methods-use-this
  async create(packageData) {
    const newPackage = new Package({
      ...packageData,
      // Default status is 'pending'
      status: 'pending',
      // Initialize history with creation event
      history: [{ status: 'pending', timestamp: new Date() }],
    });
    await newPackage.save();
    return newPackage;
  }

  /**
   * Update a package by ID
   * @param {string} id - Package ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated package object
   */
  // eslint-disable-next-line class-methods-use-this
  async update(id, updateData) {
    return Package.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
  }

  /**
   * Update package status and add history record
   * @param {string} id - Package ID
   * @param {string} newStatus - New status
   * @param {string} userId - User performing the update
   * @param {Object} additionalInfo - Optional additional info (location, etc.)
   * @returns {Promise<Object>} Updated package object
   */
  // eslint-disable-next-line class-methods-use-this
  async updateStatus(id, newStatus, userId, additionalInfo = {}) {
    const historyEntry = {
      status: newStatus,
      timestamp: new Date(),
      updatedBy: userId,
      ...additionalInfo,
    };
    return Package.findByIdAndUpdate(
      id,
      { $set: { status: newStatus }, $push: { history: historyEntry } },
      { new: true, runValidators: true },
    );
  }

  /**
   * Delete a package by ID
   * @param {string} id - Package ID
   * @returns {Promise<boolean>} True if deleted, false otherwise
   */
  // eslint-disable-next-line class-methods-use-this
  async delete(id) {
    const result = await Package.findByIdAndDelete(id);
    return !!result;
  }
}

module.exports = MongoPackageRepository;
