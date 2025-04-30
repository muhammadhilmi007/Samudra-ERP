/* eslint-disable class-methods-use-this */
/* eslint-disable no-useless-catch */
/**
 * Samudra Paket ERP - Branch Repository
 * Handles database operations for branches
 */

const Branch = require('../models/branch');

/**
 * Branch Repository
 * Provides methods for branch data access
 */
class BranchRepository {
  /**
   * Create a new branch
   * @param {Object} branchData - Branch data
   * @returns {Promise<Object>} Created branch
   */
  // eslint-disable-next-line class-methods-use-this
  async createBranch(branchData) {
    try {
      const branch = new Branch(branchData);
      return await branch.save();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all branches
   * @param {Object} filter - Filter criteria
   * @param {Object} options - Query options (pagination, sorting)
   * @returns {Promise<Array>} List of branches
   */
  async getAllBranches(filter = {}, options = {}) {
    try {
      const {
        page = 1, limit = 10, sortBy = 'name', sortOrder = 'asc', populate = [],
      } = options;

      const skip = (page - 1) * limit;
      const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

      const query = Branch.find(filter).sort(sort).skip(skip).limit(limit);

      // Apply population if needed
      if (populate.includes('parentBranch')) {
        query.populate('parentBranch', 'name code');
      }

      if (populate.includes('manager')) {
        query.populate('manager', 'name email');
      }

      if (populate.includes('childBranches')) {
        query.populate('childBranches', 'name code');
      }

      const branches = await query.exec();
      const total = await Branch.countDocuments(filter);

      return {
        data: branches,
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
   * Get branch by ID
   * @param {string} id - Branch ID
   * @param {Array} populate - Fields to populate
   * @returns {Promise<Object>} Branch
   */
  async getBranchById(id, populate = []) {
    try {
      const query = Branch.findById(id);

      // Apply population if needed
      if (populate.includes('parentBranch')) {
        query.populate('parentBranch', 'name code');
      }

      if (populate.includes('manager')) {
        query.populate('manager', 'name email');
      }

      if (populate.includes('childBranches')) {
        query.populate('childBranches', 'name code');
      }

      const branch = await query.exec();
      return branch;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get branch by code
   * @param {string} code - Branch code
   * @returns {Promise<Object>} Branch
   */
  async getBranchByCode(code) {
    try {
      return await Branch.findOne({ code: code.toUpperCase() });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update branch
   * @param {string} id - Branch ID
   * @param {Object} updateData - Updated branch data
   * @returns {Promise<Object>} Updated branch
   */
  async updateBranch(id, updateData) {
    try {
      return await Branch.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete branch
   * @param {string} id - Branch ID
   * @returns {Promise<Object>} Deleted branch
   */
  async deleteBranch(id) {
    try {
      return await Branch.findByIdAndDelete(id);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get branch hierarchy
   * @param {string} branchId - Root branch ID (optional)
   * @returns {Promise<Array>} Branch hierarchy
   */
  async getBranchHierarchy(branchId = null) {
    try {
      return await Branch.getHierarchy(branchId);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all descendants of a branch
   * @param {string} branchId - Branch ID
   * @returns {Promise<Array>} Branch descendants
   */
  async getBranchDescendants(branchId) {
    try {
      const branch = await Branch.findById(branchId);
      if (!branch) {
        throw new Error('Branch not found');
      }
      return await branch.getAllDescendants();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Search branches
   * @param {Object} searchParams - Search parameters
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Search results
   */
  async searchBranches(searchParams, options = {}) {
    try {
      const {
        name, code, city, province, status, level,
      } = searchParams;

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
        filter.level = level;
      }

      return await this.getAllBranches(filter, options);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update branch status
   * @param {string} id - Branch ID
   * @param {string} status - New status
   * @returns {Promise<Object>} Updated branch
   */
  async updateBranchStatus(id, status) {
    try {
      if (!['active', 'inactive'].includes(status)) {
        throw new Error('Invalid status. Must be "active" or "inactive"');
      }

      return await Branch.findByIdAndUpdate(id, { status }, { new: true, runValidators: true });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Add division to branch
   * @param {string} branchId - Branch ID
   * @param {Object} divisionData - Division data
   * @returns {Promise<Object>} Updated branch
   */
  async addDivision(branchId, divisionData) {
    try {
      const branch = await Branch.findById(branchId);
      if (!branch) {
        throw new Error('Branch not found');
      }

      branch.divisions.push(divisionData);
      return await branch.save();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update division
   * @param {string} branchId - Branch ID
   * @param {string} divisionId - Division ID
   * @param {Object} divisionData - Updated division data
   * @returns {Promise<Object>} Updated branch
   */
  async updateDivision(branchId, divisionId, divisionData) {
    try {
      const branch = await Branch.findById(branchId);
      if (!branch) {
        throw new Error('Branch not found');
      }

      const divisionIndex = branch.divisions.findIndex((div) => div._id.toString() === divisionId);

      if (divisionIndex === -1) {
        throw new Error('Division not found');
      }

      // Update division fields
      Object.keys(divisionData).forEach((key) => {
        branch.divisions[divisionIndex][key] = divisionData[key];
      });

      return await branch.save();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Remove division
   * @param {string} branchId - Branch ID
   * @param {string} divisionId - Division ID
   * @returns {Promise<Object>} Updated branch
   */
  async removeDivision(branchId, divisionId) {
    try {
      const branch = await Branch.findById(branchId);
      if (!branch) {
        throw new Error('Branch not found');
      }

      branch.divisions = branch.divisions.filter((div) => div._id.toString() !== divisionId);

      return await branch.save();
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new BranchRepository();
