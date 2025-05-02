/* eslint-disable class-methods-use-this */
const leaveService = require('../../app/services/leaveService');
const {
  ValidationError,
  NotFoundError,
  ConflictError,
} = require('../../infrastructure/errors/errors');
const { validateRequestBody } = require('../../infrastructure/utils/validationUtils');

/**
 * Leave Controller
 * Handles HTTP requests for leave management
 */
const leaveController = {
  /**
   * Create a new leave request
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  createLeaveRequest: async (req, res, next) => {
    try {
      // Validate request body
      validateRequestBody(req.body, ['employee', 'leaveType', 'startDate', 'endDate', 'reason', 'branch']);
      
      const leave = await leaveService.createLeaveRequest(req.body, req.user);
      
      res.status(201).json({
        success: true,
        data: leave,
        message: 'Leave request created successfully',
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: error.message,
          },
        });
      }
      
      if (error instanceof ConflictError) {
        return res.status(409).json({
          success: false,
          error: {
            code: 'CONFLICT_ERROR',
            message: error.message,
          },
        });
      }
      
      next(error);
    }
    return null;
  },

  /**
   * Get leave request by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  getLeaveRequestById: async (req, res, next) => {
    try {
      const { id } = req.params;
      
      const leave = await leaveService.getLeaveRequestById(id);
      
      res.status(200).json({
        success: true,
        data: leave,
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: error.message,
          },
        });
      }
      
      next(error);
    }
    return null;
  },

  /**
   * Get all leave requests with optional filtering
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  getAllLeaveRequests: async (req, res, next) => {
    try {
      // Extract filter criteria from query params
      const { 
        employee, branch, status, leaveType, startDate, endDate, 
        page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc',
      } = req.query;
      
      // Build filter object
      const filter = {};
      if (employee) filter.employee = employee;
      if (branch) filter.branch = branch;
      if (status) filter.status = status;
      if (leaveType) filter.leaveType = leaveType;
      if (startDate) filter.startDate = startDate;
      if (endDate) filter.endDate = endDate;
      
      // Build options object
      const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sortBy,
        sortOrder,
      };
      
      const leaveData = await leaveService.getAllLeaveRequests(filter, options);
      
      res.status(200).json({
        success: true,
        data: leaveData.data,
        meta: leaveData.meta,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update a leave request
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  updateLeaveRequest: async (req, res, next) => {
    try {
      const { id } = req.params;
      
      const leave = await leaveService.updateLeaveRequest(id, req.body, req.user);
      
      res.status(200).json({
        success: true,
        data: leave,
        message: 'Leave request updated successfully',
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: error.message,
          },
        });
      }
      
      if (error instanceof NotFoundError) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: error.message,
          },
        });
      }
      
      if (error instanceof ConflictError) {
        return res.status(409).json({
          success: false,
          error: {
            code: 'CONFLICT_ERROR',
            message: error.message,
          },
        });
      }
      
      next(error);
    }
    return null;
  },

  /**
   * Delete a leave request
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  deleteLeaveRequest: async (req, res, next) => {
    try {
      const { id } = req.params;
      
      await leaveService.deleteLeaveRequest(id);
      
      res.status(200).json({
        success: true,
        message: 'Leave request deleted successfully',
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: error.message,
          },
        });
      }
      
      if (error instanceof NotFoundError) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: error.message,
          },
        });
      }
      
      next(error);
    }
    return null;
  },

  /**
   * Get leave requests by employee ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  getLeaveRequestsByEmployee: async (req, res, next) => {
    try {
      const { employeeId } = req.params;
      const { 
        page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc',
      } = req.query;
      
      // Build options object
      const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sortBy,
        sortOrder,
      };
      
      const leaveData = await leaveService.getLeaveRequestsByEmployee(employeeId, options);
      
      res.status(200).json({
        success: true,
        data: leaveData.data,
        meta: leaveData.meta,
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: error.message,
          },
        });
      }
      
      next(error);
    }
    return null;
  },

  /**
   * Get leave requests by branch ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  getLeaveRequestsByBranch: async (req, res, next) => {
    try {
      const { branchId } = req.params;
      const { 
        page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc',
      } = req.query;
      
      // Build options object
      const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sortBy,
        sortOrder,
      };
      
      const leaveData = await leaveService.getLeaveRequestsByBranch(branchId, options);
      
      res.status(200).json({
        success: true,
        data: leaveData.data,
        meta: leaveData.meta,
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: error.message,
          },
        });
      }
      
      next(error);
    }
    return null;
  },

  /**
   * Approve a leave request
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  approveLeaveRequest: async (req, res, next) => {
    try {
      const { id } = req.params;
      
      const leave = await leaveService.approveLeaveRequest(id, req.body, req.user);
      
      res.status(200).json({
        success: true,
        data: leave,
        message: 'Leave request approved successfully',
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: error.message,
          },
        });
      }
      
      if (error instanceof NotFoundError) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: error.message,
          },
        });
      }
      
      next(error);
    }
    return null;
  },

  /**
   * Reject a leave request
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  rejectLeaveRequest: async (req, res, next) => {
    try {
      const { id } = req.params;
      
      // Validate request body
      validateRequestBody(req.body, ['rejectionReason']);
      
      const leave = await leaveService.rejectLeaveRequest(id, req.body, req.user);
      
      res.status(200).json({
        success: true,
        data: leave,
        message: 'Leave request rejected successfully',
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: error.message,
          },
        });
      }
      
      if (error instanceof NotFoundError) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: error.message,
          },
        });
      }
      
      next(error);
    }
    return null;
  },

  /**
   * Cancel a leave request
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  cancelLeaveRequest: async (req, res, next) => {
    try {
      const { id } = req.params;
      
      const leave = await leaveService.cancelLeaveRequest(id, req.user);
      
      res.status(200).json({
        success: true,
        data: leave,
        message: 'Leave request cancelled successfully',
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: error.message,
          },
        });
      }
      
      if (error instanceof NotFoundError) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: error.message,
          },
        });
      }
      
      next(error);
    }
    return null;
  },

  /**
   * Get leave statistics for an employee
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  getEmployeeLeaveStatistics: async (req, res, next) => {
    try {
      const { employeeId } = req.params;
      const { year = new Date().getFullYear() } = req.query;
      
      const statistics = await leaveService.getEmployeeLeaveStatistics(
        employeeId,
        parseInt(year, 10),
      );
      
      res.status(200).json({
        success: true,
        data: statistics,
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: error.message,
          },
        });
      }
      
      next(error);
    }
    return null;
  },

  /**
   * Get leave statistics for a branch
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  getBranchLeaveStatistics: async (req, res, next) => {
    try {
      const { branchId } = req.params;
      const { year = new Date().getFullYear(), month } = req.query;
      
      const options = {
        year: parseInt(year, 10),
      };
      
      if (month) {
        options.month = parseInt(month, 10);
      }
      
      const statistics = await leaveService.getBranchLeaveStatistics(branchId, options);
      
      res.status(200).json({
        success: true,
        data: statistics,
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: error.message,
          },
        });
      }
      
      next(error);
    }
    return null;
  },

  /**
   * Get leave balance for an employee
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  getEmployeeLeaveBalance: async (req, res, next) => {
    try {
      const { employeeId } = req.params;
      const { year = new Date().getFullYear() } = req.query;
      
      const balance = await leaveService.getEmployeeLeaveBalance(
        employeeId,
        parseInt(year, 10),
      );
      
      res.status(200).json({
        success: true,
        data: balance,
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: error.message,
          },
        });
      }
      
      if (error instanceof NotFoundError) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: error.message,
          },
        });
      }
      
      next(error);
    }
    return null;
  },
};

module.exports = leaveController;
