/**
 * MongoDB Repository for Forwarder Rates
 */
// eslint-disable-next-line import/no-extraneous-dependencies
const { ObjectId } = require('mongodb');
const ForwarderRate = require('../../domain/models/forwarderRate');

class MongoForwarderRateRepository {
  /**
   * Create a new MongoDB Forwarder Rate repository
   * @param {Object} db - MongoDB database connection
   */
  constructor(db) {
    this.collection = db.collection('forwarderRates');
    this.setupIndexes();
  }

  /**
   * Setup necessary indexes for the collection
   */
  async setupIndexes() {
    try {
      await this.collection.createIndex({ forwarder: 1 });
      await this.collection.createIndex({ 'originArea.province': 1, 'originArea.city': 1 });
      await this.collection.createIndex({
        'destinationArea.province': 1,
        'destinationArea.city': 1,
      });
      await this.collection.createIndex({ effectiveDate: 1 });
      await this.collection.createIndex({ status: 1 });
      // Compound index for efficient rate lookups
      await this.collection.createIndex({
        forwarder: 1,
        'originArea.province': 1,
        'originArea.city': 1,
        'destinationArea.province': 1,
        'destinationArea.city': 1,
      });
    } catch (error) {
      console.error('Error setting up forwarder rate indexes:', error);
    }
  }

  /**
   * Find all forwarder rates with optional filtering
   * @param {Object} filter - Filter criteria
   * @param {Object} options - Query options (pagination, sorting)
   * @returns {Promise<Array<ForwarderRate>>} Array of forwarder rates
   */
  async findAll(filter = {}, options = {}) {
    const { skip = 0, limit = 50, sort = { effectiveDate: -1 } } = options;

    const query = { ...filter };

    // Convert forwarder ID string to ObjectId if present
    if (
      query.forwarder
      && typeof query.forwarder === 'string'
      && ObjectId.isValid(query.forwarder)
    ) {
      query.forwarder = new ObjectId(query.forwarder);
    }

    const cursor = this.collection.find(query).sort(sort).skip(skip).limit(limit);

    const forwarderRates = await cursor.toArray();
    return forwarderRates.map((doc) => new ForwarderRate(doc));
  }

  /**
   * Count forwarder rates with optional filtering
   * @param {Object} filter - Filter criteria
   * @returns {Promise<number>} Count of matching forwarder rates
   */
  async count(filter = {}) {
    const query = { ...filter };

    // Convert forwarder ID string to ObjectId if present
    if (
      query.forwarder
      && typeof query.forwarder === 'string'
      && ObjectId.isValid(query.forwarder)
    ) {
      query.forwarder = new ObjectId(query.forwarder);
    }

    return this.collection.countDocuments(query);
  }

  /**
   * Find a forwarder rate by ID
   * @param {string} id - Forwarder rate ID
   * @returns {Promise<ForwarderRate|null>} Forwarder rate or null if not found
   */
  async findById(id) {
    if (!ObjectId.isValid(id)) return null;

    const doc = await this.collection.findOne({ _id: new ObjectId(id) });
    return doc ? new ForwarderRate(doc) : null;
  }

  /**
   * Find forwarder rates by forwarder ID
   * @param {string} forwarderId - Forwarder partner ID
   * @param {Object} options - Query options (pagination, sorting)
   * @returns {Promise<Array<ForwarderRate>>} Array of forwarder rates
   */
  async findByForwarder(forwarderId, options = {}) {
    if (!ObjectId.isValid(forwarderId)) return [];

    return this.findAll({ forwarder: new ObjectId(forwarderId) }, options);
  }

  /**
   * Find active rates for a route
   * @param {string} forwarderId - Forwarder partner ID
   * @param {Object} originArea - Origin area (province, city)
   * @param {Object} destinationArea - Destination area (province, city)
   * @returns {Promise<Array<ForwarderRate>>} Array of matching rates
   */
  async findRatesForRoute(forwarderId, originArea, destinationArea) {
    if (!ObjectId.isValid(forwarderId)) return [];

    const now = new Date();

    const query = {
      forwarder: new ObjectId(forwarderId),
      'originArea.province': originArea.province,
      'originArea.city': originArea.city,
      'destinationArea.province': destinationArea.province,
      'destinationArea.city': destinationArea.city,
      status: 'active',
      effectiveDate: { $lte: now },
      $or: [{ expiryDate: null }, { expiryDate: { $gt: now } }],
    };

    return this.findAll(query, { sort: { rate: 1 } });
  }

  /**
   * Create a new forwarder rate
   * @param {ForwarderRate} forwarderRate - Forwarder rate to create
   * @returns {Promise<ForwarderRate>} Created forwarder rate
   */
  async create(forwarderRate) {
    const doc = { ...forwarderRate };
    delete doc._id;

    // Convert forwarder ID string to ObjectId
    if (doc.forwarder && typeof doc.forwarder === 'string' && ObjectId.isValid(doc.forwarder)) {
      doc.forwarder = new ObjectId(doc.forwarder);
    }

    // Convert date strings to Date objects
    if (doc.effectiveDate && typeof doc.effectiveDate === 'string') {
      doc.effectiveDate = new Date(doc.effectiveDate);
    }

    if (doc.expiryDate && typeof doc.expiryDate === 'string') {
      doc.expiryDate = new Date(doc.expiryDate);
    }

    const result = await this.collection.insertOne(doc);
    return this.findById(result.insertedId);
  }

  /**
   * Update an existing forwarder rate
   * @param {string} id - Forwarder rate ID
   * @param {ForwarderRate} forwarderRate - Updated forwarder rate data
   * @returns {Promise<ForwarderRate|null>} Updated forwarder rate or null if not found
   */
  async update(id, forwarderRate) {
    if (!ObjectId.isValid(id)) return null;

    const updateDoc = { ...forwarderRate };
    delete updateDoc._id;
    updateDoc.updatedAt = new Date();

    // Convert forwarder ID string to ObjectId
    if (
      updateDoc.forwarder
      && typeof updateDoc.forwarder === 'string'
      && ObjectId.isValid(updateDoc.forwarder)
    ) {
      updateDoc.forwarder = new ObjectId(updateDoc.forwarder);
    }

    // Convert date strings to Date objects
    if (updateDoc.effectiveDate && typeof updateDoc.effectiveDate === 'string') {
      updateDoc.effectiveDate = new Date(updateDoc.effectiveDate);
    }

    if (updateDoc.expiryDate && typeof updateDoc.expiryDate === 'string') {
      updateDoc.expiryDate = new Date(updateDoc.expiryDate);
    }

    await this.collection.updateOne({ _id: new ObjectId(id) }, { $set: updateDoc });

    return this.findById(id);
  }

  /**
   * Delete a forwarder rate
   * @param {string} id - Forwarder rate ID
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  async delete(id) {
    if (!ObjectId.isValid(id)) return false;

    const result = await this.collection.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount === 1;
  }

  /**
   * Delete all rates for a specific forwarder
   * @param {string} forwarderId - Forwarder partner ID
   * @returns {Promise<number>} Number of deleted rates
   */
  async deleteByForwarder(forwarderId) {
    if (!ObjectId.isValid(forwarderId)) return 0;

    const result = await this.collection.deleteMany({
      forwarder: new ObjectId(forwarderId),
    });

    return result.deletedCount;
  }

  /**
   * Update forwarder rate status
   * @param {string} id - Forwarder rate ID
   * @param {string} status - New status ('active' or 'inactive')
   * @param {string} updatedBy - User ID who updated
   * @returns {Promise<ForwarderRate|null>} Updated forwarder rate or null if not found
   */
  async updateStatus(id, status, updatedBy) {
    if (!ObjectId.isValid(id)) return null;

    await this.collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status,
          updatedAt: new Date(),
          updatedBy,
        },
      },
    );

    return this.findById(id);
  }
}

module.exports = MongoForwarderRateRepository;
