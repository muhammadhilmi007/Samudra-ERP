/**
 * Samudra Paket ERP - MongoDB Service Area Repository
 * Implementation of the Service Area Repository interface for MongoDB
 */

const mongoose = require('mongoose');
const ServiceArea = require('../../domain/models/serviceArea');
const { NotFoundError } = require('../../domain/utils/errorUtils');

/**
 * MongoDB Service Area Repository
 * Concrete implementation of the Service Area Repository interface
 */
class MongoServiceAreaRepository {
  /**
   * Create a new service area
   * @param {Object} serviceAreaData - Service area data
   * @returns {Promise<Object>} Created service area
   */
  // eslint-disable-next-line class-methods-use-this
  async create(serviceAreaData) {
    const serviceArea = new ServiceArea(serviceAreaData);
    return serviceArea.save();
  }

  /**
   * Find service area by ID
   * @param {string} id - Service area ID
   * @returns {Promise<Object|null>} Service area or null if not found
   */
  // eslint-disable-next-line class-methods-use-this
  async findById(id) {
    try {
      const serviceArea = await ServiceArea.findById(id);
      return serviceArea || null;
    } catch (error) {
      if (error instanceof mongoose.Error.CastError) {
        throw error;
      }
      return null;
    }
  }

  /**
   * Find service areas by query
   * @param {Object} query - Query criteria
   * @param {Object} options - Query options (pagination, sorting)
   * @returns {Promise<Object>} Service areas with pagination metadata
   */
  // eslint-disable-next-line class-methods-use-this
  async findAll(filter = {}, options = {}) {
    const {
      page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc',
    } = options;
    const skip = (page - 1) * limit;
    const sort = {
      [sortBy]: sortOrder === 'desc' ? -1 : 1,
    };

    const [results, totalResults] = await Promise.all([
      ServiceArea.find(filter).sort(sort).skip(skip).limit(limit),
      ServiceArea.countDocuments(filter),
    ]);

    return {
      results,
      totalResults,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalResults / limit),
      },
    };
  }

  /**
   * Find service areas by query
   * @param {Object} query - Query criteria
   * @param {Object} options - Query options (pagination, sorting)
   * @returns {Promise<Object>} Service areas with pagination metadata
   */
  // eslint-disable-next-line class-methods-use-this
  async findByQuery(query = {}, options = {}) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = options;

    // Handle isActive filter by converting it to status filter
    const mongoQuery = { ...query };
    if (mongoQuery.isActive !== undefined) {
      mongoQuery.status = mongoQuery.isActive ? 'active' : 'inactive';
      delete mongoQuery.isActive;
    }

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [results, totalResults] = await Promise.all([
      ServiceArea.find(mongoQuery).sort(sort).skip(skip).limit(limit),
      ServiceArea.countDocuments(mongoQuery),
    ]);

    const totalPages = Math.ceil(totalResults / limit);

    return {
      results,
      totalResults,
      pagination: {
        page,
        limit,
        totalPages,
      },
    };
  }

  /**
   * Update service area
   * @param {string} id - Service area ID
   * @param {Object} updateData - Updated service area data
   * @returns {Promise<Object>} Updated service area
   * @throws {NotFoundError} If service area not found
   */
  // eslint-disable-next-line class-methods-use-this
  async update(id, updateData) {
    const updatedArea = await ServiceArea.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true },
    );

    if (!updatedArea) {
      throw new NotFoundError(`Service area with ID ${id} not found`);
    }

    return updatedArea;
  }

  /**
   * Delete service area
   * @param {string} id - Service area ID
   * @returns {Promise<Object>} Deleted service area
   * @throws {NotFoundError} If service area not found
   */
  // eslint-disable-next-line class-methods-use-this
  async delete(id) {
    const deletedArea = await ServiceArea.findByIdAndDelete(id);

    if (!deletedArea) {
      throw new NotFoundError(`Service area with ID ${id} not found`);
    }

    return deletedArea;
  }

  /**
   * Find service areas by point
   * @param {Array} coordinates - [longitude, latitude] of the point
   * @param {Object} options - Query options
   */
  // eslint-disable-next-line class-methods-use-this
  async findByPoint(point) {
    const serviceArea = await ServiceArea.findOne({
      coverage: {
        $geoIntersects: {
          $geometry: {
            type: 'Point',
            coordinates: point.coordinates,
          },
        },
      },
    });
    return serviceArea || null;
  }

  /**
   * Find service areas that contain a point
   * @param {Object} point - GeoJSON point
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Service areas containing the point
   */
  // eslint-disable-next-line class-methods-use-this
  async findContainingPoint(point, options = {}) {
    try {
      // Ensure point is a valid GeoJSON point with numeric coordinates
      if (
        !point
        || !point.coordinates
        || !Array.isArray(point.coordinates)
        || point.coordinates.length !== 2
      ) {
        return {
          results: [],
          totalResults: 0,
          pagination: {
            page: options.page || 1,
            limit: options.limit || 10,
            totalPages: 0,
          },
        };
      }

      // Ensure coordinates are numbers
      const [longitude, latitude] = point.coordinates.map((coord) => parseFloat(coord));
      if (Number.isNaN(longitude) || Number.isNaN(latitude)) {
        return {
          results: [],
          totalResults: 0,
          pagination: {
            page: options.page || 1,
            limit: options.limit || 10,
            totalPages: 0,
          },
        };
      }

      const validPoint = {
        type: 'Point',
        coordinates: [longitude, latitude],
      };

      const query = {
        coverage: {
          $geoIntersects: {
            $geometry: validPoint,
          },
        },
      };

      const results = await ServiceArea.find(query);
      return {
        results,
        totalResults: results.length,
        pagination: {
          page: options.page || 1,
          limit: options.limit || 10,
          totalPages: Math.ceil(results.length / (options.limit || 10)),
        },
      };
    } catch (error) {
      console.error('Error in findContainingPoint:', error);
      return {
        results: [],
        totalResults: 0,
        pagination: {
          page: options.page || 1,
          limit: options.limit || 10,
          totalPages: 0,
        },
      };
    }
  }

  /**
   * Find service areas by branch
   * @param {string} branchId - Branch ID
   * @returns {Promise<Array>} Service areas for the branch
   */
  // eslint-disable-next-line class-methods-use-this
  async findByBranch(branchId) {
    return ServiceArea.find({ branch: branchId });
  }

  /**
   * Search service areas by name
   * @param {string} name - Name to search for
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Service areas matching the name
   */
  // eslint-disable-next-line class-methods-use-this
  async searchByName(name) {
    return ServiceArea.find({
      name: { $regex: name, $options: 'i' },
    });
  }
}

module.exports = MongoServiceAreaRepository;
