/**
 * Samudra Paket ERP - MongoDB Position Repository Implementation
 * Implements the Position Repository interface using MongoDB
 */

const PositionRepository = require('../../domain/repositories/positionRepository');
const Position = require('../../domain/models/position');
const { NotFoundError } = require('../../domain/utils/errorUtils');

/**
 * MongoDB implementation of Position Repository
 * @implements {PositionRepository}
 */
class MongoPositionRepository extends PositionRepository {
  /**
   * Create a new position
   * @param {Object} positionData - The position data
   * @returns {Promise<Object>} The created position
   */
  // eslint-disable-next-line class-methods-use-this
  async create(positionData) {
    const position = new Position(positionData);
    await position.save();
    return position;
  }

  /**
   * Find a position by ID
   * @param {string} id - The position ID
   * @returns {Promise<Object>} The position if found, null otherwise
   */
  // eslint-disable-next-line class-methods-use-this
  async findById(id) {
    return Position.findById(id).populate('division').populate('reportsTo');
  }

  /**
   * Find positions based on query parameters with pagination and sorting
   * @param {Object} query - The query parameters
   * @param {Object} options - Pagination and sorting options
   * @returns {Promise<Object>} Paginated results with positions
   */
  // eslint-disable-next-line class-methods-use-this
  async findByQuery(query = {}, options = {}) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'name',
      sortOrder = 'asc',
      populate = [],
    } = options;
    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    // Base query filtering
    const filterQuery = { ...query };

    // Build the Mongoose query
    let mongooseQuery = Position.find(filterQuery)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    // Apply population
    const defaultPopulate = ['division', 'reportsTo'];
    // Combine and deduplicate population fields
    const fieldsToPopulate = [
      ...new Set([...defaultPopulate, ...populate]),
    ];
    fieldsToPopulate.forEach((field) => {
      mongooseQuery = mongooseQuery.populate(field);
    });

    const [results, totalResults] = await Promise.all([
      mongooseQuery.exec(),
      Position.countDocuments(filterQuery),
    ]);

    // Optionally transform results if needed, e.g., for specific formatting
    // Example: Return plain object or specific fields
    const formattedResults = results.map((doc) => doc);
    // Return Mongoose document by default
    // If transformation needed:
    // const formattedResults = results.map(doc => doc.toObject());

    return {
      results: formattedResults,
      page,
      limit,
      totalPages: Math.ceil(totalResults / limit),
      totalResults,
    };
  }

  /**
   * Update a position by ID
   * @param {string} id - The position ID
   * @param {Object} updateData - The data to update
   * @returns {Promise<Object>} The updated position
   */
  // eslint-disable-next-line class-methods-use-this
  async update(id, updateData) {
    const position = await Position.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate('division')
      .populate('reportsTo');

    if (!position) {
      throw new NotFoundError(`Position with ID ${id} not found`);
    }
    return position;
  }

  /**
   * Delete a position by ID
   * @param {string} id - The position ID
   * @returns {Promise<boolean>} True if deleted, false otherwise
   */
  // eslint-disable-next-line class-methods-use-this
  async delete(id) {
    const result = await Position.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundError(`Position with ID ${id} not found`);
    }
    // TODO: Handle potential cascading deletes or updates (e.g., subordinates' reportsTo)
    // This might involve finding all positions that report to the deleted one
    // and setting their reportsTo to null or reassigning them.
    return true;
  }

  /**
   * Get position hierarchy starting from a given position ID
   * @param {string} _positionId - The starting position ID
   * @returns {Promise<Object>} The hierarchy structure
   */
  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  async getHierarchy(_positionId) {
    // Implementation depends on the desired hierarchy structure and depth
    // This could involve recursive queries or specific aggregation pipelines
    throw new Error('Method not implemented.');
  }

  /**
   * Find positions by division ID
   * @param {string} divisionId - The division ID
   * @returns {Promise<Array>} List of positions in the division
   */
  // eslint-disable-next-line class-methods-use-this
  async findByDivision(divisionId) {
    return Position.find({ division: divisionId })
      .populate('division')
      .populate('reportsTo');
  }

  /**
   * Find direct subordinates for a given position ID
   * @param {string} positionId - The manager's position ID
   * @returns {Promise<Array>} List of subordinate positions
   */
  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  async findSubordinates(_positionId) {
    return Position.find({ reportsTo: _positionId })
      .populate('division')
      .populate('reportsTo');
  }
}

module.exports = MongoPositionRepository;
