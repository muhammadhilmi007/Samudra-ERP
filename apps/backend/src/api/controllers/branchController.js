/**
 * Samudra Paket ERP - Branch Controller
 * Handles HTTP requests for branch management
 */

const branchManagementService = require('../../domain/services/branchManagementService');
const { validateBranchInput, validateDivisionInput } = require('../validators/branchValidator');

/**
 * Branch Controller
 * Provides methods for handling branch-related HTTP requests
 */
class BranchController {
  /**
   * Constructor
   */
  constructor() {
    this.branchService = branchManagementService;
  }

  /**
   * Create a new branch
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} Response with created branch
   */
  async createBranch(req, res) {
    try {
      // Validate input
      const { error, value } = validateBranchInput(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid branch data',
            details: error.details,
          },
        });
      }

      // Check if branch with same code already exists
      const existingBranch = await this.branchService.getBranchByCode(value.code);
      if (existingBranch) {
        return res.status(409).json({
          success: false,
          error: {
            code: 'DUPLICATE_BRANCH',
            message: `Branch with code ${value.code} already exists`,
            details: { code: value.code },
          },
        });
      }

      // Create branch
      const branch = await this.branchService.createBranch(value);

      return res.status(201).json({
        success: true,
        data: branch,
        meta: {},
      });
    } catch (error) {
      console.error('Error creating branch:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Error creating branch',
          details: { error: error.message },
        },
      });
    }
  }

  /**
   * Get all branches
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} Response with branches
   */
  async getAllBranches(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'name',
        sortOrder = 'asc',
        name,
        code,
        city,
        province,
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

      if (city) {
        filter['address.city'] = { $regex: city, $options: 'i' };
      }

      if (province) {
        filter['address.province'] = { $regex: province, $options: 'i' };
      }

      if (status) {
        filter.status = status;
      }

      if (level !== undefined) {
        filter.level = parseInt(level, 10);
      }

      // Build options
      const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sortBy,
        sortOrder,
        populate: populate ? populate.split(',') : [],
      };

      // Get branches
      const result = await this.branchService.getAllBranches(filter, options);

      return res.status(200).json({
        success: true,
        data: result.data,
        meta: result.meta,
      });
    } catch (error) {
      console.error('Error getting branches:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Error getting branches',
          details: { error: error.message },
        },
      });
    }
  }

  /**
   * Get branch by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} Response with branch
   */
  async getBranchById(req, res) {
    try {
      const { id } = req.params;
      const { populate = '' } = req.query;

      const populateFields = populate ? populate.split(',') : [];

      const branch = await this.branchService.getBranchById(id, populateFields);

      if (!branch) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'BRANCH_NOT_FOUND',
            message: 'Branch not found',
            details: { id },
          },
        });
      }

      return res.status(200).json({
        success: true,
        data: branch,
        meta: {},
      });
    } catch (error) {
      console.error('Error getting branch:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Error getting branch',
          details: { error: error.message },
        },
      });
    }
  }

  /**
   * Update branch
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} Response with updated branch
   */
  async updateBranch(req, res) {
    try {
      const { id } = req.params;

      // Validate input
      const { error, value } = validateBranchInput(req.body, true);
      if (error) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid branch data',
            details: error.details,
          },
        });
      }

      // Check if branch exists
      const existingBranch = await this.branchRepository.getBranchById(id);
      if (!existingBranch) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'BRANCH_NOT_FOUND',
            message: 'Branch not found',
            details: { id },
          },
        });
      }

      // If code is being updated, check if it's already in use
      if (value.code && value.code !== existingBranch.code) {
        const branchWithCode = await this.branchRepository.getBranchByCode(value.code);
        if (branchWithCode && branchWithCode._id.toString() !== id) {
          return res.status(409).json({
            success: false,
            error: {
              code: 'DUPLICATE_BRANCH',
              message: `Branch with code ${value.code} already exists`,
              details: { code: value.code },
            },
          });
        }
      }

      // Update branch
      const updatedBranch = await this.branchRepository.updateBranch(id, value);

      return res.status(200).json({
        success: true,
        data: updatedBranch,
        meta: {},
      });
    } catch (error) {
      console.error('Error updating branch:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Error updating branch',
          details: { error: error.message },
        },
      });
    }
  }

  /**
   * Delete branch
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} Response with deleted branch
   */
  async deleteBranch(req, res) {
    try {
      const { id } = req.params;

      // Check if branch exists
      const branch = await this.branchRepository.getBranchById(id);
      if (!branch) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'BRANCH_NOT_FOUND',
            message: 'Branch not found',
            details: { id },
          },
        });
      }

      // Check if branch has child branches
      const childBranches = await this.branchRepository.getAllBranches({ parentBranch: id });
      if (childBranches.data.length > 0) {
        return res.status(409).json({
          success: false,
          error: {
            code: 'BRANCH_HAS_CHILDREN',
            message: 'Cannot delete branch with child branches',
            details: { childCount: childBranches.data.length },
          },
        });
      }

      // Delete branch
      await this.branchRepository.deleteBranch(id);

      return res.status(200).json({
        success: true,
        data: { id },
        meta: {},
      });
    } catch (error) {
      console.error('Error deleting branch:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Error deleting branch',
          details: { error: error.message },
        },
      });
    }
  }

  /**
   * Get branch hierarchy
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} Response with branch hierarchy
   */
  async getBranchHierarchy(req, res) {
    try {
      const { rootId } = req.query;

      const hierarchy = await this.branchRepository.getBranchHierarchy(rootId || null);

      return res.status(200).json({
        success: true,
        data: hierarchy,
        meta: {},
      });
    } catch (error) {
      console.error('Error getting branch hierarchy:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Error getting branch hierarchy',
          details: { error: error.message },
        },
      });
    }
  }

  /**
   * Update branch status
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} Response with updated branch
   */
  async updateBranchStatus(req, res) {
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

      // Check if branch exists
      const branch = await this.branchRepository.getBranchById(id);
      if (!branch) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'BRANCH_NOT_FOUND',
            message: 'Branch not found',
            details: { id },
          },
        });
      }

      // Update branch status
      const updatedBranch = await this.branchService.updateBranchStatus(id, status);

      return res.status(200).json({
        success: true,
        data: updatedBranch,
        meta: {},
      });
    } catch (error) {
      console.error('Error updating branch status:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Error updating branch status',
          details: { error: error.message },
        },
      });
    }
  }

  /**
   * Add division to branch
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} Response with updated branch
   */
  async addDivision(req, res) {
    try {
      const { branchId } = req.params;

      // Validate input
      const { error, value } = validateDivisionInput(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid division data',
            details: error.details,
          },
        });
      }

      // Check if branch exists
      const branch = await this.branchRepository.getBranchById(branchId);
      if (!branch) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'BRANCH_NOT_FOUND',
            message: 'Branch not found',
            details: { id: branchId },
          },
        });
      }

      // Check if division with same code already exists
      const divisionExists = branch.divisions.some((div) => div.code === value.code);
      if (divisionExists) {
        return res.status(409).json({
          success: false,
          error: {
            code: 'DUPLICATE_DIVISION',
            message: `Division with code ${value.code} already exists in this branch`,
            details: { code: value.code },
          },
        });
      }

      // Add division
      const updatedBranch = await this.branchRepository.addDivision(branchId, value);

      return res.status(201).json({
        success: true,
        data: updatedBranch.divisions[updatedBranch.divisions.length - 1],
        meta: {},
      });
    } catch (error) {
      console.error('Error adding division:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Error adding division',
          details: { error: error.message },
        },
      });
    }
  }

  /**
   * Update division
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} Response with updated branch
   */
  async updateDivision(req, res) {
    try {
      const { branchId, divisionId } = req.params;

      // Validate input
      const { error, value } = validateDivisionInput(req.body, true);
      if (error) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid division data',
            details: error.details,
          },
        });
      }

      // Check if branch exists
      const branch = await this.branchRepository.getBranchById(branchId);
      if (!branch) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'BRANCH_NOT_FOUND',
            message: 'Branch not found',
            details: { id: branchId },
          },
        });
      }

      // Check if division exists
      const division = branch.divisions.find((div) => div._id.toString() === divisionId);
      if (!division) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'DIVISION_NOT_FOUND',
            message: 'Division not found',
            details: { id: divisionId },
          },
        });
      }

      // If code is being updated, check if it's already in use
      if (value.code && value.code !== division.code) {
        const divisionWithCode = branch.divisions.find(
          (div) => div.code === value.code && div._id.toString() !== divisionId,
        );

        if (divisionWithCode) {
          return res.status(409).json({
            success: false,
            error: {
              code: 'DUPLICATE_DIVISION',
              message: `Division with code ${value.code} already exists in this branch`,
              details: { code: value.code },
            },
          });
        }
      }

      // Update division
      const updatedBranch = await this.branchService.updateDivision(branchId, divisionId, value);
      const updatedDivision = updatedBranch.divisions.find(
        (div) => div._id.toString() === divisionId,
      );

      return res.status(200).json({
        success: true,
        data: updatedDivision,
        meta: {},
      });
    } catch (error) {
      console.error('Error updating division:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Error updating division',
          details: { error: error.message },
        },
      });
    }
  }

  /**
   * Delete division
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} Response with success message
   */
  async deleteDivision(req, res) {
    try {
      const { branchId, divisionId } = req.params;

      // Check if branch exists
      const branch = await this.branchRepository.getBranchById(branchId);
      if (!branch) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'BRANCH_NOT_FOUND',
            message: 'Branch not found',
            details: { id: branchId },
          },
        });
      }

      // Check if division exists
      const division = branch.divisions.find((div) => div._id.toString() === divisionId);
      if (!division) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'DIVISION_NOT_FOUND',
            message: 'Division not found',
            details: { id: divisionId },
          },
        });
      }

      // Delete division
      await this.branchRepository.removeDivision(branchId, divisionId);

      return res.status(200).json({
        success: true,
        data: { id: divisionId },
        meta: {},
      });
    } catch (error) {
      console.error('Error deleting division:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Error deleting division',
          details: { error: error.message },
        },
      });
    }
  }
}

module.exports = new BranchController();
