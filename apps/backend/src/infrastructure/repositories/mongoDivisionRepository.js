/**
 * Samudra Paket ERP - MongoDB Division Repository Implementation
 * Implements the Division Repository interface using MongoDB
 */

const DivisionRepository = require('../../domain/repositories/divisionRepository');
const Division = require('../../domain/models/division');
const { NotFoundError } = require('../../domain/utils/errorUtils');

/**
 * MongoDB implementation of Division Repository
 * @implements {DivisionRepository}
 */
class MongoDivisionRepository extends DivisionRepository {
  /**
   * Create a new division
   * @param {Object} divisionData - The division data
   * @returns {Promise<Object>} The created division
   */
  // eslint-disable-next-line class-methods-use-this
  async create(divisionData) {
    const division = new Division(divisionData);
    await division.save();
    return division;
  }

  /**
   * Find a division by ID
   * @param {string} id - The division ID
   * @returns {Promise<Object>} The division if found, null otherwise
   */
  // eslint-disable-next-line class-methods-use-this
  async findById(id) {
    const division = await Division.findById(id);
    return division;
  }

  /**
   * Find divisions by query
   * @param {Object} query - The query object
   * @param {Object} options - Query options (pagination, sorting)
   * @returns {Promise<Array>} Array of divisions matching the query
   */
  // eslint-disable-next-line class-methods-use-this
  async findByQuery(query, options = {}) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      populate = [],
    } = options;

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    let queryBuilder = Division.find(query).sort(sort).skip(skip).limit(limit);

    // Apply population if requested
    if (populate && populate.length > 0) {
      populate.forEach((path) => {
        queryBuilder = queryBuilder.populate(path);
      });
    }

    const divisions = await queryBuilder.exec();
    const total = await Division.countDocuments(query);

    return {
      data: divisions.map((doc) => ({
        ...doc.toObject(),
        id: doc._id.toString(), // Add id field
      })),
      pagination: {
        total,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update a division
   * @param {string} id - The division ID
   * @param {Object} updateData - The data to update
   * @returns {Promise<Object>} The updated division
   */
  // eslint-disable-next-line class-methods-use-this
  async update(id, updateData) {
    const division = await Division.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!division) {
      throw new NotFoundError(`Division with ID ${id} not found`);
    }

    return division;
  }

  /**
   * Delete a division
   * @param {string} id - The division ID
   * @returns {Promise<boolean>} True if deleted, false otherwise
   */
  // eslint-disable-next-line class-methods-use-this
  async delete(id) {
    const division = await Division.findById(id);
    if (!division) {
      throw new NotFoundError(`Division with ID ${id} not found`);
    }

    await Division.findByIdAndDelete(id);
    return true;
  }

  /**
   * Get division hierarchy
   * @param {string} [rootId] - Optional root division ID
   * @returns {Promise<Array>} Hierarchical structure of divisions
   */
  // eslint-disable-next-line class-methods-use-this
  async getHierarchy(rootId = null) {
    // First, get all divisions to build the hierarchy
    const allDivisions = await Division.find({}).populate('head');

    // Create a map for quick lookup
    const divisionsMap = {};
    allDivisions.forEach((division) => {
      divisionsMap[division._id.toString()] = {
        ...division.toObject(),
        childDivisions: [],
      };
    });

    // Build the hierarchy by adding children to their parents
    allDivisions.forEach((division) => {
      if (division.parentDivision) {
        const parentId = division.parentDivision.toString();
        if (divisionsMap[parentId]) {
          divisionsMap[parentId].childDivisions.push(divisionsMap[division._id.toString()]);
        }
      }
    });

    // Filter based on the rootId parameter
    if (rootId) {
      // Return the specific division and its hierarchy
      return [divisionsMap[rootId]];
    }

    // Return root divisions (those without a parent)
    return Object.values(divisionsMap).filter(
      (division) => !division.parentDivision,
    );
  }

  /**
   * Get divisions by branch
   * @param {string} branchId - The branch ID
   * @returns {Promise<Array>} Divisions belonging to the branch
   */
  // eslint-disable-next-line class-methods-use-this
  async findByBranch(branchId) {
    return Division.find({ branch: branchId }).populate('head');
  }

  /**
   * Get child divisions
   * @param {string} parentId - The parent division ID
   * @returns {Promise<Array>} Child divisions
   */
  // eslint-disable-next-line class-methods-use-this
  async findChildren(parentId) {
    return Division.find({ parentDivision: parentId }).populate('head');
  }
}

module.exports = MongoDivisionRepository;
