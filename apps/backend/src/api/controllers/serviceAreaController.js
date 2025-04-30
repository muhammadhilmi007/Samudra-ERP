/**
 * Samudra Paket ERP - Service Area Controller
 * Handles HTTP requests for service area management
 */

const serviceAreaRepository = require('../../domain/repositories/serviceAreaRepository');
const branchRepository = require('../../domain/repositories/branchRepository');
// eslint-disable-next-line max-len
const {
  validateServiceAreaInput,
  validateCoordinatesInput,
} = require('../validators/serviceAreaValidator');

/**
 * Service Area Controller
 * Provides methods for handling service area-related HTTP requests
 */
class ServiceAreaController {
  /**
   * Create a new service area
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} Response with created service area
   */
  // eslint-disable-next-line class-methods-use-this
  async createServiceArea(req, res) {
    try {
      // Validate input
      const { error, value } = validateServiceAreaInput(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid service area data',
            details: error.details,
          },
        });
      }

      // Check if service area with same code already exists
      const existingServiceArea = await serviceAreaRepository.getServiceAreaByCode(value.code);
      if (existingServiceArea) {
        return res.status(409).json({
          success: false,
          error: {
            code: 'DUPLICATE_SERVICE_AREA',
            message: `Service area with code ${value.code} already exists`,
            details: { code: value.code },
          },
        });
      }

      // Check if branch exists
      const branch = await branchRepository.getBranchById(value.branch);
      if (!branch) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'BRANCH_NOT_FOUND',
            message: 'Branch not found',
            details: { branchId: value.branch },
          },
        });
      }

      // Create service area
      const serviceArea = await serviceAreaRepository.createServiceArea(value);

      return res.status(201).json({
        success: true,
        data: serviceArea,
        meta: {},
      });
    } catch (error) {
      console.error('Error creating service area:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Error creating service area',
          details: { error: error.message },
        },
      });
    }
  }

  /**
   * Get all service areas
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} Response with service areas
   */
  // eslint-disable-next-line class-methods-use-this
  async getAllServiceAreas(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'name',
        sortOrder = 'asc',
        name,
        code,
        branchId,
        province,
        city,
        status,
        level,
        populate = '',
      } = req.query;

      // Build filter
      const filter = {};

      if (name) {
        filter.name = { $regex: name, $options: 'i' };
      }

      if (code) {
        filter.code = { $regex: code, $options: 'i' };
      }

      if (branchId) {
        filter.branch = branchId;
      }

      if (province) {
        filter['administrativeData.province'] = { $regex: province, $options: 'i' };
      }

      if (city) {
        filter['administrativeData.city'] = { $regex: city, $options: 'i' };
      }

      if (status) {
        filter.status = status;
      }

      if (level) {
        filter.level = level;
      }

      // Build options
      const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sortBy,
        sortOrder,
        populate: populate ? populate.split(',') : [],
      };

      // Get service areas
      const result = await serviceAreaRepository.getAllServiceAreas(filter, options);

      return res.status(200).json({
        success: true,
        data: result.data,
        meta: result.meta,
      });
    } catch (error) {
      console.error('Error getting service areas:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Error getting service areas',
          details: { error: error.message },
        },
      });
    }
  }

  /**
   * Get service area by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} Response with service area
   */
  // eslint-disable-next-line class-methods-use-this
  async getServiceAreaById(req, res) {
    try {
      const { id } = req.params;
      const { populate = '' } = req.query;

      const populateFields = populate ? populate.split(',') : [];

      const serviceArea = await serviceAreaRepository.getServiceAreaById(id, populateFields);

      if (!serviceArea) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'SERVICE_AREA_NOT_FOUND',
            message: 'Service area not found',
            details: { id },
          },
        });
      }

      return res.status(200).json({
        success: true,
        data: serviceArea,
        meta: {},
      });
    } catch (error) {
      console.error('Error getting service area:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Error getting service area',
          details: { error: error.message },
        },
      });
    }
  }

  /**
   * Update service area
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} Response with updated service area
   */
  // eslint-disable-next-line class-methods-use-this
  async updateServiceArea(req, res) {
    try {
      const { id } = req.params;

      // Validate input
      const { error, value } = validateServiceAreaInput(req.body, true);
      if (error) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid service area data',
            details: error.details,
          },
        });
      }

      // Check if service area exists
      const existingServiceArea = await serviceAreaRepository.getServiceAreaById(id);
      if (!existingServiceArea) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'SERVICE_AREA_NOT_FOUND',
            message: 'Service area not found',
            details: { id },
          },
        });
      }

      // If code is being updated, check if it's already in use
      if (value.code && value.code !== existingServiceArea.code) {
        const serviceAreaWithCode = await serviceAreaRepository.getServiceAreaByCode(value.code);
        if (serviceAreaWithCode && serviceAreaWithCode._id.toString() !== id) {
          return res.status(409).json({
            success: false,
            error: {
              code: 'DUPLICATE_SERVICE_AREA',
              message: `Service area with code ${value.code} already exists`,
              details: { code: value.code },
            },
          });
        }
      }

      // If branch is being updated, check if it exists
      if (value.branch) {
        const branch = await branchRepository.getBranchById(value.branch);
        if (!branch) {
          return res.status(404).json({
            success: false,
            error: {
              code: 'BRANCH_NOT_FOUND',
              message: 'Branch not found',
              details: { branchId: value.branch },
            },
          });
        }
      }

      // Update service area
      const updatedServiceArea = await serviceAreaRepository.updateServiceArea(id, value);

      return res.status(200).json({
        success: true,
        data: updatedServiceArea,
        meta: {},
      });
    } catch (error) {
      console.error('Error updating service area:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Error updating service area',
          details: { error: error.message },
        },
      });
    }
  }

  /**
   * Delete service area
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} Response with deleted service area
   */
  // eslint-disable-next-line class-methods-use-this
  async deleteServiceArea(req, res) {
    try {
      const { id } = req.params;

      // Check if service area exists
      const serviceArea = await serviceAreaRepository.getServiceAreaById(id);
      if (!serviceArea) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'SERVICE_AREA_NOT_FOUND',
            message: 'Service area not found',
            details: { id },
          },
        });
      }

      // Delete service area
      await serviceAreaRepository.deleteServiceArea(id);

      return res.status(200).json({
        success: true,
        data: { id },
        meta: {},
      });
    } catch (error) {
      console.error('Error deleting service area:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Error deleting service area',
          details: { error: error.message },
        },
      });
    }
  }

  /**
   * Update service area status
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} Response with updated service area
   */
  // eslint-disable-next-line class-methods-use-this
  async updateServiceAreaStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status || !['active', 'inactive'].includes(status)) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid status. Must be "active" or "inactive"',
            details: { status },
          },
        });
      }

      // Check if service area exists
      const serviceArea = await serviceAreaRepository.getServiceAreaById(id);
      if (!serviceArea) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'SERVICE_AREA_NOT_FOUND',
            message: 'Service area not found',
            details: { id },
          },
        });
      }

      // Update service area status
      const updatedServiceArea = await serviceAreaRepository.updateServiceAreaStatus(id, status);

      return res.status(200).json({
        success: true,
        data: updatedServiceArea,
        meta: {},
      });
    } catch (error) {
      console.error('Error updating service area status:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Error updating service area status',
          details: { error: error.message },
        },
      });
    }
  }

  /**
   * Get service areas by branch
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} Response with service areas
   */
  // eslint-disable-next-line class-methods-use-this
  async getServiceAreasByBranch(req, res) {
    try {
      const { branchId } = req.params;
      const {
        page = 1,
        limit = 10,
        sortBy = 'name',
        sortOrder = 'asc',
        status,
        populate = '',
      } = req.query;

      // Check if branch exists
      const branch = await branchRepository.getBranchById(branchId);
      if (!branch) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'BRANCH_NOT_FOUND',
            message: 'Branch not found',
            details: { branchId },
          },
        });
      }

      // Build filter
      const filter = { branch: branchId };

      if (status) {
        filter.status = status;
      }

      // Build options
      const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sortBy,
        sortOrder,
        populate: populate ? populate.split(',') : [],
      };

      // Get service areas
      const result = await serviceAreaRepository.getAllServiceAreas(filter, options);

      return res.status(200).json({
        success: true,
        data: result.data,
        meta: result.meta,
      });
    } catch (error) {
      console.error('Error getting service areas by branch:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Error getting service areas by branch',
          details: { error: error.message },
        },
      });
    }
  }

  /**
   * Check if a point is within any service area
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} Response with check result
   */
  // eslint-disable-next-line class-methods-use-this
  async checkPointInServiceArea(req, res) {
    try {
      // Validate input
      const { error, value } = validateCoordinatesInput(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid coordinates',
            details: error.details,
          },
        });
      }

      const { longitude, latitude } = value;
      const { branchId, status = 'active' } = req.query;

      // Build filter
      const filter = { status };

      if (branchId) {
        filter.branch = branchId;
      }

      // Check if point is in any service area
      const coordinates = [longitude, latitude];
      const isInServiceArea = await serviceAreaRepository.isPointInServiceArea(coordinates, filter);

      // If in service area, find the service areas
      let serviceAreas = [];
      if (isInServiceArea) {
        const result = await serviceAreaRepository.findServiceAreasByPoint(coordinates, filter, {
          limit: 5,
          populate: ['branch'],
        });
        serviceAreas = result.data;
      }

      return res.status(200).json({
        success: true,
        data: {
          isInServiceArea,
          serviceAreas,
        },
        meta: {},
      });
    } catch (error) {
      console.error('Error checking point in service area:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Error checking point in service area',
          details: { error: error.message },
        },
      });
    }
  }

  /**
   * Find service areas by administrative data
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} Response with service areas
   */
  // eslint-disable-next-line class-methods-use-this
  async findServiceAreasByAdminData(req, res) {
    try {
      const {
        province,
        city,
        district,
        subdistrict,
        postalCode,
        page = 1,
        limit = 10,
        sortBy = 'name',
        sortOrder = 'asc',
        status = 'active',
        populate = '',
      } = req.query;

      // Build admin data filter
      const adminData = {};

      if (province) adminData.province = province;
      if (city) adminData.city = city;
      if (district) adminData.district = district;
      if (subdistrict) adminData.subdistrict = subdistrict;
      if (postalCode) adminData.postalCode = postalCode;

      if (Object.keys(adminData).length === 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'At least one administrative data filter is required',
            details: {},
          },
        });
      }

      // Build options
      const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sortBy,
        sortOrder,
        populate: populate ? populate.split(',') : [],
      };

      // Add status to admin data
      adminData.status = status;

      // Find service areas
      const result = await serviceAreaRepository.findServiceAreasByAdminData(adminData, options);

      return res.status(200).json({
        success: true,
        data: result.data,
        meta: result.meta,
      });
    } catch (error) {
      console.error('Error finding service areas by admin data:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Error finding service areas by admin data',
          details: { error: error.message },
        },
      });
    }
  }
}

module.exports = new ServiceAreaController();
