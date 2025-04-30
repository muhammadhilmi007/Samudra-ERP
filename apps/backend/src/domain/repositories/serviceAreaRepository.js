/**
 * Samudra Paket ERP - Service Area Repository
 * Handles database operations for service areas
 */

const ServiceArea = require('../models/serviceArea');

/**
 * Service Area Repository
 * Provides methods for service area data access
 */
class ServiceAreaRepository {
  /**
   * Create a new service area
   * @param {Object} serviceAreaData - Service area data
   * @returns {Promise<Object>} Created service area
   */
  // eslint-disable-next-line class-methods-use-this
  async createServiceArea(serviceAreaData) {
    // eslint-disable-next-line no-useless-catch
    try {
      const serviceArea = new ServiceArea(serviceAreaData);
      return await serviceArea.save();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all service areas
   * @param {Object} filter - Filter criteria
   * @param {Object} options - Query options (pagination, sorting)
   * @returns {Promise<Object>} List of service areas with metadata
   */
  // eslint-disable-next-line class-methods-use-this
  async getAllServiceAreas(filter = {}, options = {}) {
    // eslint-disable-next-line no-useless-catch
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'name',
        sortOrder = 'asc',
        populate = [],
      } = options;

      const skip = (page - 1) * limit;
      const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

      const query = ServiceArea.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit);

      // Apply population if needed
      if (populate.includes('branch')) {
        query.populate('branch', 'name code');
      }

      const serviceAreas = await query.exec();
      const total = await ServiceArea.countDocuments(filter);

      return {
        data: serviceAreas,
        meta: {
          total,
          page: parseInt(page, 10),
          limit: parseInt(limit, 10),
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get service area by ID
   * @param {string} id - Service area ID
   * @param {Array} populate - Fields to populate
   * @returns {Promise<Object>} Service area
   */
  // eslint-disable-next-line class-methods-use-this
  async getServiceAreaById(id, populate = []) {
    // eslint-disable-next-line no-useless-catch
    try {
      const query = ServiceArea.findById(id);

      // Apply population if needed
      if (populate.includes('branch')) {
        query.populate('branch', 'name code');
      }

      const serviceArea = await query.exec();
      return serviceArea;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get service area by code
   * @param {string} code - Service area code
   * @returns {Promise<Object>} Service area
   */
  // eslint-disable-next-line class-methods-use-this
  async getServiceAreaByCode(code) {
    // eslint-disable-next-line no-useless-catch
    try {
      return await ServiceArea.findOne({ code: code.toUpperCase() });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update service area
   * @param {string} id - Service area ID
   * @param {Object} updateData - Updated service area data
   * @returns {Promise<Object>} Updated service area
   */
  // eslint-disable-next-line class-methods-use-this
  async updateServiceArea(id, updateData) {
    // eslint-disable-next-line no-useless-catch
    try {
      return await ServiceArea.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true },
      );
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete service area
   * @param {string} id - Service area ID
   * @returns {Promise<Object>} Deleted service area
   */
  // eslint-disable-next-line class-methods-use-this
  async deleteServiceArea(id) {
    // eslint-disable-next-line no-useless-catch
    try {
      return await ServiceArea.findByIdAndDelete(id);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update service area status
   * @param {string} id - Service area ID
   * @param {string} status - New status ('active' or 'inactive')
   * @returns {Promise<Object>} Updated service area
   */
  // eslint-disable-next-line class-methods-use-this
  async updateServiceAreaStatus(id, status) {
    // eslint-disable-next-line no-useless-catch
    try {
      return await ServiceArea.findByIdAndUpdate(
        id,
        { status },
        { new: true, runValidators: true },
      );
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get service areas by branch
   * @param {string} branchId - Branch ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} List of service areas with metadata
   */
  async getServiceAreasByBranch(branchId, options = {}) {
    // eslint-disable-next-line no-useless-catch
    try {
      return await this.getAllServiceAreas({ branch: branchId }, options);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find service areas that contain a point
   * @param {Array} coordinates - [longitude, latitude] of the point
   * @param {Object} filter - Additional filter criteria
   * @param {Object} options - Query options
   * @returns {Promise<Object>} List of service areas with metadata
   */
  async findServiceAreasByPoint(coordinates, filter = {}, options = {}) {
    // eslint-disable-next-line no-useless-catch
    try {
      const point = {
        type: 'Point',
        coordinates,
      };

      const geoFilter = {
        ...filter,
        coverage: {
          $geoIntersects: {
            $geometry: point,
          },
        },
      };

      return await this.getAllServiceAreas(geoFilter, options);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Check if a point is within any service area
   * @param {Array} coordinates - [longitude, latitude] of the point
   * @param {Object} filter - Additional filter criteria (e.g., status: 'active')
   * @returns {Promise<Boolean>} Whether the point is within any service area
   */
  // eslint-disable-next-line class-methods-use-this
  async isPointInServiceArea(coordinates, filter = {}) {
    // eslint-disable-next-line no-useless-catch
    try {
      const point = {
        type: 'Point',
        coordinates,
      };

      const geoFilter = {
        ...filter,
        coverage: {
          $geoIntersects: {
            $geometry: point,
          },
        },
      };

      const count = await ServiceArea.countDocuments(geoFilter);
      return count > 0;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find service areas by administrative data
   * @param {Object} adminData - Administrative data (province, city, etc.)
   * @param {Object} options - Query options
   * @returns {Promise<Object>} List of service areas with metadata
   */
  async findServiceAreasByAdminData(adminData, options = {}) {
    // eslint-disable-next-line no-useless-catch
    try {
      const filter = {};

      if (adminData.province) {
        filter['administrativeData.province'] = adminData.province;
      }

      if (adminData.city) {
        filter['administrativeData.city'] = adminData.city;
      }

      if (adminData.district) {
        filter['administrativeData.district'] = adminData.district;
      }

      if (adminData.subdistrict) {
        filter['administrativeData.subdistrict'] = adminData.subdistrict;
      }

      if (adminData.postalCode) {
        filter['administrativeData.postalCodes'] = adminData.postalCode;
      }

      return await this.getAllServiceAreas(filter, options);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new ServiceAreaRepository();
