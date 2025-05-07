/**
 * Samudra Paket ERP - Branch Management Service
 * Provides business logic for branch management operations
 */

const branchRepository = require('../repositories/branchRepository');

/**
 * Branch Management Service
 * Encapsulates business logic for branch management
 */
class BranchManagementService {
  /**
   * Constructor
   */
  constructor() {
    this.branchRepository = branchRepository;
  }

  /**
   * Create a new branch
   * @param {Object} branchData - Branch data
   * @returns {Promise<Object>} Created branch
   */
  async createBranch(branchData) {
    // Generate branch code if not provided
    if (!branchData.code) {
      branchData.code = await this.generateBranchCode(branchData);
    }

    return this.branchRepository.createBranch(branchData);
  }

  /**
   * Generate a unique branch code
   * @param {Object} branchData - Branch data
   * @returns {Promise<string>} Generated code
   */
  async generateBranchCode(branchData) {
    // Extract first 2 letters of city name
    const cityPrefix = branchData.address && branchData.address.city
      ? branchData.address.city.substring(0, 2).toUpperCase()
      : 'BR';

    // Get count of branches in the same city
    const filter = branchData.address && branchData.address.city
      ? { 'address.city': branchData.address.city }
      : {};

    const result = await this.branchRepository.getAllBranches(filter);
    const count = result.meta.total + 1;

    // Format: [City Prefix][3-digit number]
    return `${cityPrefix}${count.toString().padStart(3, '0')}`;
  }

  /**
   * Get all branches with filtering, pagination, and sorting
   * @param {Object} filter - Filter criteria
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Branches with pagination metadata
   */
  async getAllBranches(filter = {}, options = {}) {
    return this.branchRepository.getAllBranches(filter, options);
  }

  /**
   * Get branch by ID
   * @param {string} id - Branch ID
   * @param {Array} populate - Fields to populate
   * @returns {Promise<Object>} Branch
   */
  async getBranchById(id, populate = []) {
    return this.branchRepository.getBranchById(id, populate);
  }

  /**
   * Get branch by code
   * @param {string} code - Branch code
   * @returns {Promise<Object>} Branch
   */
  async getBranchByCode(code) {
    return this.branchRepository.getBranchByCode(code);
  }

  /**
   * Update branch
   * @param {string} id - Branch ID
   * @param {Object} updateData - Updated branch data
   * @returns {Promise<Object>} Updated branch
   */
  async updateBranch(id, updateData) {
    return this.branchRepository.updateBranch(id, updateData);
  }

  /**
   * Delete branch
   * @param {string} id - Branch ID
   * @returns {Promise<Object>} Deleted branch
   */
  async deleteBranch(id) {
    // Check if branch has child branches
    const descendants = await this.branchRepository.getBranchDescendants(id);
    if (descendants && descendants.length > 0) {
      throw new Error(
        'Cannot delete branch with child branches. Please reassign or delete child branches first.',
      );
    }

    return this.branchRepository.deleteBranch(id);
  }

  /**
   * Get branch hierarchy
   * @param {string} branchId - Root branch ID (optional)
   * @returns {Promise<Array>} Branch hierarchy
   */
  async getBranchHierarchy(branchId = null) {
    return this.branchRepository.getBranchHierarchy(branchId);
  }

  /**
   * Get all descendants of a branch
   * @param {string} branchId - Branch ID
   * @returns {Promise<Array>} Branch descendants
   */
  async getBranchDescendants(branchId) {
    return this.branchRepository.getBranchDescendants(branchId);
  }

  /**
   * Search branches
   * @param {Object} searchParams - Search parameters
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Search results
   */
  async searchBranches(searchParams, options = {}) {
    return this.branchRepository.searchBranches(searchParams, options);
  }

  /**
   * Update branch status
   * @param {string} id - Branch ID
   * @param {string} status - New status
   * @returns {Promise<Object>} Updated branch
   */
  async updateBranchStatus(id, status) {
    // Validate status
    if (!['active', 'inactive'].includes(status)) {
      throw new Error('Invalid status. Must be "active" or "inactive"');
    }

    // If setting to inactive, check if branch has active child branches
    if (status === 'inactive') {
      const descendants = await this.branchRepository.getBranchDescendants(id);
      const hasActiveChildren = descendants.some((child) => child.status === 'active');

      if (hasActiveChildren) {
        throw new Error('Cannot set branch to inactive while it has active child branches.');
      }
    }

    return this.branchRepository.updateBranchStatus(id, status);
  }

  /**
   * Add division to branch
   * @param {string} branchId - Branch ID
   * @param {Object} divisionData - Division data
   * @returns {Promise<Object>} Updated branch
   */
  async addDivision(branchId, divisionData) {
    // Generate division code if not provided
    if (!divisionData.code) {
      divisionData.code = await this.generateDivisionCode(branchId, divisionData);
    }

    return this.branchRepository.addDivision(branchId, divisionData);
  }

  /**
   * Generate a unique division code
   * @param {string} branchId - Branch ID
   * @param {Object} divisionData - Division data
   * @returns {Promise<string>} Generated code
   */
  async generateDivisionCode(branchId, divisionData) {
    // Extract first 3 letters of division name
    const namePrefix = divisionData.name
      ? divisionData.name.substring(0, 3).toUpperCase()
      : 'DIV';

    // Get branch
    const branch = await this.branchRepository.getBranchById(branchId);
    if (!branch) {
      throw new Error('Branch not found');
    }

    // Count existing divisions
    const count = branch.divisions ? branch.divisions.length + 1 : 1;

    // Format: [Name Prefix][2-digit number]
    return `${namePrefix}${count.toString().padStart(2, '0')}`;
  }

  /**
   * Update division
   * @param {string} branchId - Branch ID
   * @param {string} divisionId - Division ID
   * @param {Object} divisionData - Updated division data
   * @returns {Promise<Object>} Updated branch
   */
  async updateDivision(branchId, divisionId, divisionData) {
    return this.branchRepository.updateDivision(branchId, divisionId, divisionData);
  }

  /**
   * Remove division
   * @param {string} branchId - Branch ID
   * @param {string} divisionId - Division ID
   * @returns {Promise<Object>} Updated branch
   */
  async removeDivision(branchId, divisionId) {
    return this.branchRepository.removeDivision(branchId, divisionId);
  }

  /**
   * Get divisions by branch
   * @param {string} branchId - Branch ID
   * @returns {Promise<Array>} Divisions
   */
  async getDivisionsByBranch(branchId) {
    const branch = await this.branchRepository.getBranchById(branchId);
    if (!branch) {
      throw new Error('Branch not found');
    }

    return branch.divisions || [];
  }

  /**
   * Get division by ID within a branch
   * @param {string} branchId - Branch ID
   * @param {string} divisionId - Division ID
   * @returns {Promise<Object>} Division
   */
  async getDivisionById(branchId, divisionId) {
    const branch = await this.branchRepository.getBranchById(branchId);
    if (!branch) {
      throw new Error('Branch not found');
    }

    const division = branch.divisions.find((div) => div._id.toString() === divisionId);
    if (!division) {
      throw new Error('Division not found');
    }

    return division;
  }

  /**
   * Update division status
   * @param {string} branchId - Branch ID
   * @param {string} divisionId - Division ID
   * @param {string} status - New status
   * @returns {Promise<Object>} Updated branch
   */
  async updateDivisionStatus(branchId, divisionId, status) {
    // Validate status
    if (!['active', 'inactive'].includes(status)) {
      throw new Error('Invalid status. Must be "active" or "inactive"');
    }

    return this.branchRepository.updateDivision(branchId, divisionId, { status });
  }
}

module.exports = new BranchManagementService();
