/**
 * MongoDB Repository for Forwarder Partners
 */
// eslint-disable-next-line import/no-extraneous-dependencies
const { ObjectId } = require('mongodb');
const ForwarderPartner = require('../../domain/models/forwarderPartner');

class MongoForwarderPartnerRepository {
  /**
   * Create a new MongoDB Forwarder Partner repository
   * @param {Object} db - MongoDB database connection
   */
  constructor(db) {
    this.collection = db.collection('forwarderPartners');
    this.setupIndexes();
  }

  /**
   * Setup necessary indexes for the collection
   */
  async setupIndexes() {
    try {
      // Note: We're using the MongoDB native driver's createIndex which doesn't cause duplicate index warnings
      // unlike Mongoose's schema.index() when combined with field-level index definitions
      await this.collection.createIndex({ name: 1 });
      await this.collection.createIndex({ status: 1 });
    } catch (error) {
      console.error('Error setting up forwarder partner indexes:', error);
    }
  }

  /**
   * Find all forwarder partners with optional filtering
   * @param {Object} filter - Filter criteria
   * @param {Object} options - Query options (pagination, sorting)
   * @returns {Promise<Array<ForwarderPartner>>} Array of forwarder partners
   */
  async findAll(filter = {}, options = {}) {
    const { skip = 0, limit = 50, sort = { name: 1 } } = options;

    const query = { ...filter };

    const cursor = this.collection.find(query).sort(sort).skip(skip).limit(limit);

    const forwarderPartners = await cursor.toArray();
    return forwarderPartners.map((doc) => new ForwarderPartner(doc));
  }

  /**
   * Count forwarder partners with optional filtering
   * @param {Object} filter - Filter criteria
   * @returns {Promise<number>} Count of matching forwarder partners
   */
  async count(filter = {}) {
    const query = { ...filter };
    return this.collection.countDocuments(query);
  }

  /**
   * Find a forwarder partner by ID
   * @param {string} id - Forwarder partner ID
   * @returns {Promise<ForwarderPartner|null>} Forwarder partner or null if not found
   */
  async findById(id) {
    if (!ObjectId.isValid(id)) return null;

    const doc = await this.collection.findOne({ _id: new ObjectId(id) });
    return doc ? new ForwarderPartner(doc) : null;
  }

  /**
   * Find a forwarder partner by code
   * @param {string} code - Forwarder partner code
   * @returns {Promise<ForwarderPartner|null>} Forwarder partner or null if not found
   */
  async findByCode(code) {
    const doc = await this.collection.findOne({ code });
    return doc ? new ForwarderPartner(doc) : null;
  }

  /**
   * Create a new forwarder partner
   * @param {ForwarderPartner} forwarderPartner - Forwarder partner to create
   * @returns {Promise<ForwarderPartner>} Created forwarder partner
   */
  async create(forwarderPartner) {
    const doc = { ...forwarderPartner };
    delete doc._id;

    const result = await this.collection.insertOne(doc);
    return this.findById(result.insertedId);
  }

  /**
   * Update an existing forwarder partner
   * @param {string} id - Forwarder partner ID
   * @param {ForwarderPartner} forwarderPartner - Updated forwarder partner data
   * @returns {Promise<ForwarderPartner|null>} Updated forwarder partner or null if not found
   */
  async update(id, forwarderPartner) {
    if (!ObjectId.isValid(id)) return null;

    const updateDoc = { ...forwarderPartner };
    delete updateDoc._id;
    updateDoc.updatedAt = new Date();

    await this.collection.updateOne({ _id: new ObjectId(id) }, { $set: updateDoc });

    return this.findById(id);
  }

  /**
   * Delete a forwarder partner
   * @param {string} id - Forwarder partner ID
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  async delete(id) {
    if (!ObjectId.isValid(id)) return false;

    const result = await this.collection.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount === 1;
  }

  /**
   * Update forwarder partner status
   * @param {string} id - Forwarder partner ID
   * @param {string} status - New status ('active' or 'inactive')
   * @param {string} updatedBy - User ID who updated
   * @returns {Promise<ForwarderPartner|null>} Updated forwarder partner or null if not found
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

module.exports = MongoForwarderPartnerRepository;
