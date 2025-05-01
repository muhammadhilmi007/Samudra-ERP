/**
 * MongoDB Repository for Forwarder Areas
 */
// eslint-disable-next-line import/no-extraneous-dependencies
const { ObjectId } = require('mongodb');
const ForwarderArea = require('../../domain/models/forwarderArea');

class MongoForwarderAreaRepository {
  /**
   * Create a new MongoDB Forwarder Area repository
   * @param {Object} db - MongoDB database connection
   */
  constructor(db) {
    this.collection = db.collection('forwarderAreas');
    this.setupIndexes();
  }

  /**
   * Setup necessary indexes for the collection
   */
  async setupIndexes() {
    try {
      await this.collection.createIndex({ forwarder: 1 });
      await this.collection.createIndex({ province: 1, city: 1 });
      await this.collection.createIndex({ postalCode: 1 });
      await this.collection.createIndex({ status: 1 });
      // Compound index for efficient area lookups
      await this.collection.createIndex({
        forwarder: 1,
        province: 1,
        city: 1,
        district: 1,
      });
    } catch (error) {
      console.error('Error setting up forwarder area indexes:', error);
    }
  }

  /**
   * Find all forwarder areas with optional filtering
   * @param {Object} filter - Filter criteria
   * @param {Object} options - Query options (pagination, sorting)
   * @returns {Promise<Array<ForwarderArea>>} Array of forwarder areas
   */
  async findAll(filter = {}, options = {}) {
    const { skip = 0, limit = 50, sort = { province: 1, city: 1 } } = options;

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

    const forwarderAreas = await cursor.toArray();
    return forwarderAreas.map((doc) => new ForwarderArea(doc));
  }

  /**
   * Count forwarder areas with optional filtering
   * @param {Object} filter - Filter criteria
   * @returns {Promise<number>} Count of matching forwarder areas
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
   * Find a forwarder area by ID
   * @param {string} id - Forwarder area ID
   * @returns {Promise<ForwarderArea|null>} Forwarder area or null if not found
   */
  async findById(id) {
    if (!ObjectId.isValid(id)) return null;

    const doc = await this.collection.findOne({ _id: new ObjectId(id) });
    return doc ? new ForwarderArea(doc) : null;
  }

  /**
   * Find forwarder areas by forwarder ID
   * @param {string} forwarderId - Forwarder partner ID
   * @param {Object} options - Query options (pagination, sorting)
   * @returns {Promise<Array<ForwarderArea>>} Array of forwarder areas
   */
  async findByForwarder(forwarderId, options = {}) {
    if (!ObjectId.isValid(forwarderId)) return [];

    return this.findAll({ forwarder: new ObjectId(forwarderId) }, options);
  }

  /**
   * Find forwarder areas by location criteria
   * @param {Object} criteria - Location criteria (province, city, district, postalCode)
   * @param {Object} options - Query options (pagination, sorting)
   * @returns {Promise<Array<ForwarderArea>>} Array of forwarder areas
   */
  async findByLocation(criteria, options = {}) {
    const query = {};

    if (criteria.province) query.province = criteria.province;
    if (criteria.city) query.city = criteria.city;
    if (criteria.district) query.district = criteria.district;
    if (criteria.postalCode) query.postalCode = criteria.postalCode;

    return this.findAll(query, options);
  }

  /**
   * Create a new forwarder area
   * @param {ForwarderArea} forwarderArea - Forwarder area to create
   * @returns {Promise<ForwarderArea>} Created forwarder area
   */
  async create(forwarderArea) {
    const doc = { ...forwarderArea };
    delete doc._id;

    // Convert forwarder ID string to ObjectId
    if (doc.forwarder && typeof doc.forwarder === 'string' && ObjectId.isValid(doc.forwarder)) {
      doc.forwarder = new ObjectId(doc.forwarder);
    }

    const result = await this.collection.insertOne(doc);
    return this.findById(result.insertedId);
  }

  /**
   * Update an existing forwarder area
   * @param {string} id - Forwarder area ID
   * @param {ForwarderArea} forwarderArea - Updated forwarder area data
   * @returns {Promise<ForwarderArea|null>} Updated forwarder area or null if not found
   */
  async update(id, forwarderArea) {
    if (!ObjectId.isValid(id)) return null;

    const updateDoc = { ...forwarderArea };
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

    await this.collection.updateOne({ _id: new ObjectId(id) }, { $set: updateDoc });

    return this.findById(id);
  }

  /**
   * Delete a forwarder area
   * @param {string} id - Forwarder area ID
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  async delete(id) {
    if (!ObjectId.isValid(id)) return false;

    const result = await this.collection.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount === 1;
  }

  /**
   * Delete all areas for a specific forwarder
   * @param {string} forwarderId - Forwarder partner ID
   * @returns {Promise<number>} Number of deleted areas
   */
  async deleteByForwarder(forwarderId) {
    if (!ObjectId.isValid(forwarderId)) return 0;

    const result = await this.collection.deleteMany({
      forwarder: new ObjectId(forwarderId),
    });

    return result.deletedCount;
  }

  /**
   * Update forwarder area status
   * @param {string} id - Forwarder area ID
   * @param {string} status - New status ('active' or 'inactive')
   * @param {string} updatedBy - User ID who updated
   * @returns {Promise<ForwarderArea|null>} Updated forwarder area or null if not found
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

module.exports = MongoForwarderAreaRepository;
