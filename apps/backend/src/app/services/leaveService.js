/* eslint-disable class-methods-use-this */
const mongoose = require('mongoose');
const leaveRepository = require('../../domain/repositories/leaveRepository');
const employeeRepository = require('../../domain/repositories/employeeRepository');
const {
  ValidationError,
  NotFoundError,
  ConflictError,
} = require('../../infrastructure/errors/errors');
const { validateFutureDate } = require('../../infrastructure/utils/validationUtils');

/**
 * Leave Service
 * Implements business logic for employee leave management
 */
const leaveService = {
  /**
   * Create a new leave request
   * @param {Object} leaveData - Leave request data
   * @param {Object} user - User performing the action
   * @returns {Promise<Object>} Created leave request
   */
  async createLeaveRequest(leaveData, user) {
    // Validate required fields
    if (
      !leaveData.employee ||
      !leaveData.leaveType ||
      !leaveData.startDate ||
      !leaveData.endDate ||
      !leaveData.reason ||
      !leaveData.branch
    ) {
      throw new ValidationError(
        'Employee ID, leave type, start date, end date, reason, and branch are required'
      );
    }

    // Check if employee exists
    try {
      await employeeRepository.findById(leaveData.employee);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw new ValidationError('Employee not found');
      }
      throw error;
    }

    // Validate dates
    const startDate = new Date(leaveData.startDate);
    const endDate = new Date(leaveData.endDate);

    if (endDate < startDate) {
      throw new ValidationError('End date must be after or equal to start date');
    }

    // Calculate total days (including weekends and holidays)
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates

    // Check for overlapping leave requests
    const existingLeaves = await leaveRepository.findAll({
      employee: leaveData.employee,
      $or: [{ startDate: { $lte: endDate }, endDate: { $gte: startDate } }],
      status: { $in: ['pending', 'approved'] },
    });

    if (existingLeaves.data.length > 0) {
      throw new ConflictError('Employee already has an overlapping leave request for this period');
    }

    // Create leave request
    return leaveRepository.create(
      {
        ...leaveData,
        totalDays: diffDays,
      },
      user
    );
  },

  /**
   * Get leave request by ID
   * @param {string} id - Leave request ID
   * @returns {Promise<Object>} Leave request
   */
  async getLeaveRequestById(id) {
    if (!id) {
      throw new ValidationError('Leave request ID is required');
    }

    return leaveRepository.findById(id);
  },

  /**
   * Get all leave requests with optional filtering
   * @param {Object} filter - Filter criteria
   * @param {Object} options - Query options (pagination, sorting)
   * @returns {Promise<Array>} List of leave requests
   */
  async getAllLeaveRequests(filter = {}, options = {}) {
    return leaveRepository.findAll(filter, options);
  },

  /**
   * Update a leave request
   * @param {string} id - Leave request ID
   * @param {Object} updateData - Data to update
   * @param {Object} user - User performing the action
   * @returns {Promise<Object>} Updated leave request
   */
  async updateLeaveRequest(id, updateData, user) {
    if (!id) {
      throw new ValidationError('Leave request ID is required');
    }

    // Get existing leave request
    const existingLeave = await leaveRepository.findById(id);

    // Prevent updates to approved, rejected, or cancelled leave requests
    if (existingLeave.status !== 'pending' && !user.permissions?.includes('manage_all_leaves')) {
      throw new ValidationError(`Cannot update leave request with status: ${existingLeave.status}`);
    }

    // If dates are being updated, validate them
    if (updateData.startDate || updateData.endDate) {
      const startDate = new Date(updateData.startDate || existingLeave.startDate);
      const endDate = new Date(updateData.endDate || existingLeave.endDate);

      if (endDate < startDate) {
        throw new ValidationError('End date must be after or equal to start date');
      }

      // Recalculate total days
      const diffTime = Math.abs(endDate - startDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      updateData.totalDays = diffDays;

      // Check for overlapping leave requests
      const existingLeaves = await leaveRepository.findAll({
        employee: existingLeave.employee,
        _id: { $ne: id }, // Exclude current leave request
        $or: [{ startDate: { $lte: endDate }, endDate: { $gte: startDate } }],
        status: { $in: ['pending', 'approved'] },
      });

      if (existingLeaves.data.length > 0) {
        throw new ConflictError(
          'Employee already has an overlapping leave request for this period'
        );
      }
    }

    return leaveRepository.update(id, updateData, user);
  },

  /**
   * Delete a leave request
   * @param {string} id - Leave request ID
   * @returns {Promise<boolean>} True if deleted successfully
   */
  async deleteLeaveRequest(id) {
    if (!id) {
      throw new ValidationError('Leave request ID is required');
    }

    // Get existing leave request
    const existingLeave = await leaveRepository.findById(id);

    // Only allow deletion of pending leave requests
    if (existingLeave.status !== 'pending') {
      throw new ValidationError(`Cannot delete leave request with status: ${existingLeave.status}`);
    }

    return leaveRepository.delete(id);
  },

  /**
   * Get leave requests by employee ID
   * @param {string} employeeId - Employee ID
   * @param {Object} options - Query options (pagination, sorting)
   * @returns {Promise<Array>} List of leave requests
   */
  async getLeaveRequestsByEmployee(employeeId, options = {}) {
    if (!employeeId) {
      throw new ValidationError('Employee ID is required');
    }

    // Check if employee exists
    try {
      await employeeRepository.findById(employeeId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw new ValidationError('Employee not found');
      }
      throw error;
    }

    return leaveRepository.findByEmployee(employeeId, options);
  },

  /**
   * Get leave requests by branch ID
   * @param {string} branchId - Branch ID
   * @param {Object} options - Query options (pagination, sorting)
   * @returns {Promise<Array>} List of leave requests
   */
  async getLeaveRequestsByBranch(branchId, options = {}) {
    if (!branchId) {
      throw new ValidationError('Branch ID is required');
    }

    return leaveRepository.findByBranch(branchId, options);
  },

  /**
   * Approve a leave request
   * @param {string} id - Leave request ID
   * @param {Object} approvalData - Approval data
   * @param {Object} user - User performing the action
   * @returns {Promise<Object>} Updated leave request
   */
  async approveLeaveRequest(id, approvalData, user) {
    if (!id) {
      throw new ValidationError('Leave request ID is required');
    }

    // Get existing leave request
    const existingLeave = await leaveRepository.findById(id);

    // Only allow approval of pending leave requests
    if (existingLeave.status !== 'pending') {
      throw new ValidationError(
        `Cannot approve leave request with status: ${existingLeave.status}`
      );
    }

    return leaveRepository.approve(id, approvalData, user);
  },

  /**
   * Reject a leave request
   * @param {string} id - Leave request ID
   * @param {Object} rejectionData - Rejection data
   * @param {Object} user - User performing the action
   * @returns {Promise<Object>} Updated leave request
   */
  async rejectLeaveRequest(id, rejectionData, user) {
    if (!id) {
      throw new ValidationError('Leave request ID is required');
    }

    if (!rejectionData.rejectionReason) {
      throw new ValidationError('Rejection reason is required');
    }

    // Get existing leave request
    const existingLeave = await leaveRepository.findById(id);

    // Only allow rejection of pending leave requests
    if (existingLeave.status !== 'pending') {
      throw new ValidationError(`Cannot reject leave request with status: ${existingLeave.status}`);
    }

    return leaveRepository.reject(id, rejectionData, user);
  },

  /**
   * Cancel a leave request
   * @param {string} id - Leave request ID
   * @param {Object} user - User performing the action
   * @returns {Promise<Object>} Updated leave request
   */
  async cancelLeaveRequest(id, user) {
    if (!id) {
      throw new ValidationError('Leave request ID is required');
    }

    // Get existing leave request
    const existingLeave = await leaveRepository.findById(id);

    // Only allow cancellation of pending or approved leave requests
    if (!['pending', 'approved'].includes(existingLeave.status)) {
      throw new ValidationError(`Cannot cancel leave request with status: ${existingLeave.status}`);
    }

    // Only allow employees to cancel their own leave requests or users with manage_all_leaves permission
    if (
      existingLeave.employee.toString() !== user._id.toString() &&
      !user.permissions?.includes('manage_all_leaves')
    ) {
      throw new ValidationError('You are not authorized to cancel this leave request');
    }

    return leaveRepository.cancel(id, user);
  },

  /**
   * Get leave statistics for an employee
   * @param {string} employeeId - Employee ID
   * @param {number} year - Year for statistics (defaults to current year)
   * @returns {Promise<Object>} Leave statistics
   */
  async getEmployeeLeaveStatistics(employeeId, year = new Date().getFullYear()) {
    if (!employeeId) {
      throw new ValidationError('Employee ID is required');
    }

    // Check if employee exists
    try {
      await employeeRepository.findById(employeeId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw new ValidationError('Employee not found');
      }
      throw error;
    }

    return leaveRepository.getEmployeeLeaveStatistics(employeeId, year);
  },

  /**
   * Get leave statistics for a branch
   * @param {string} branchId - Branch ID
   * @param {Object} options - Options for filtering
   * @returns {Promise<Object>} Leave statistics
   */
  async getBranchLeaveStatistics(branchId, options = {}) {
    if (!branchId) {
      throw new ValidationError('Branch ID is required');
    }

    return leaveRepository.getBranchLeaveStatistics(branchId, options);
  },

  /**
   * Get leave balance for an employee
   * @param {string} employeeId - Employee ID
   * @param {number} year - Year for balance (defaults to current year)
   * @returns {Promise<Object>} Leave balance
   */
  async getEmployeeLeaveBalance(employeeId, year = new Date().getFullYear()) {
    if (!employeeId) {
      throw new ValidationError('Employee ID is required');
    }

    // Check if employee exists
    const employee = await employeeRepository.findById(employeeId);

    // Get leave statistics for the employee
    const leaveStats = await leaveRepository.getEmployeeLeaveStatistics(employeeId, year);

    // Define default leave entitlements (this would typically come from company policy or employee contract)
    const defaultEntitlements = {
      annual: 14, // 14 days of annual leave
      sick: 10, // 10 days of sick leave
      maternity: 90, // 90 days of maternity leave
      paternity: 7, // 7 days of paternity leave
      bereavement: 3, // 3 days of bereavement leave
      unpaid: 0, // Unlimited unpaid leave (tracked but no limit)
      other: 5, // 5 days of other leave
    };

    // Get actual entitlements from employee data if available
    const entitlements = employee.leaveEntitlements?.[year] || defaultEntitlements;

    // Calculate balance for each leave type
    const balance = {};

    leaveStats.byType.forEach(stat => {
      const leaveType = stat._id;
      const entitled = entitlements[leaveType] || 0;
      const used = stat.approvedDays || 0;
      const pending = stat.totalDays - stat.approvedDays || 0;
      const remaining = entitled - used;

      balance[leaveType] = {
        entitled,
        used,
        pending,
        remaining,
      };
    });

    // Add leave types that have no records yet
    Object.keys(entitlements).forEach(leaveType => {
      if (!balance[leaveType]) {
        balance[leaveType] = {
          entitled: entitlements[leaveType] || 0,
          used: 0,
          pending: 0,
          remaining: entitlements[leaveType] || 0,
        };
      }
    });

    return {
      employee: employeeId,
      year,
      balance,
      leaveStats,
    };
  },
};

module.exports = leaveService;
