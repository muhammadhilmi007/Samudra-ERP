/* eslint-disable class-methods-use-this */
const attendanceService = require('../../app/services/attendanceService');
const {
  ValidationError,
  NotFoundError,
  ConflictError,
} = require('../../infrastructure/errors/errors');
const { validateRequestBody } = require('../../infrastructure/utils/validationUtils');

/**
 * Attendance Controller
 * Handles HTTP requests for attendance management
 */
const attendanceController = {
  /**
   * Create a new attendance record
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  createAttendance: async (req, res, next) => {
    try {
      // Validate request body
      validateRequestBody(req.body, ['employee', 'date', 'status', 'branch']);

      const attendance = await attendanceService.createAttendance(req.body, req.user);

      res.status(201).json({
        success: true,
        data: attendance,
        message: 'Attendance record created successfully',
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
   * Get attendance record by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  getAttendanceById: async (req, res, next) => {
    try {
      const { id } = req.params;

      const attendance = await attendanceService.getAttendanceById(id);

      res.status(200).json({
        success: true,
        data: attendance,
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
   * Get all attendance records with optional filtering
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  getAllAttendance: async (req, res, next) => {
    try {
      // Extract filter criteria from query params
      const {
        employee,
        branch,
        status,
        date,
        startDate,
        endDate,
        page = 1,
        limit = 10,
        sortBy = 'date',
        sortOrder = 'desc',
      } = req.query;

      // Build filter object
      const filter = {};
      if (employee) filter.employee = employee;
      if (branch) filter.branch = branch;
      if (status) filter.status = status;
      if (date) filter.date = date;
      if (startDate) filter.startDate = startDate;
      if (endDate) filter.endDate = endDate;

      // Build options object
      const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sortBy,
        sortOrder,
      };

      const attendanceData = await attendanceService.getAllAttendance(filter, options);

      res.status(200).json({
        success: true,
        data: attendanceData.data,
        meta: attendanceData.meta,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update an attendance record
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  updateAttendance: async (req, res, next) => {
    try {
      const { id } = req.params;

      const attendance = await attendanceService.updateAttendance(id, req.body, req.user);

      res.status(200).json({
        success: true,
        data: attendance,
        message: 'Attendance record updated successfully',
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
   * Delete an attendance record
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  deleteAttendance: async (req, res, next) => {
    try {
      const { id } = req.params;

      await attendanceService.deleteAttendance(id);

      res.status(200).json({
        success: true,
        message: 'Attendance record deleted successfully',
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
   * Get attendance records by employee ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  getAttendanceByEmployee: async (req, res, next) => {
    try {
      const { employeeId } = req.params;
      const { page = 1, limit = 10, sortBy = 'date', sortOrder = 'desc' } = req.query;

      // Build options object
      const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sortBy,
        sortOrder,
      };

      const attendanceData = await attendanceService.getAttendanceByEmployee(employeeId, options);

      res.status(200).json({
        success: true,
        data: attendanceData.data,
        meta: attendanceData.meta,
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
   * Get attendance records by branch ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  getAttendanceByBranch: async (req, res, next) => {
    try {
      const { branchId } = req.params;
      const { page = 1, limit = 10, sortBy = 'date', sortOrder = 'desc' } = req.query;

      // Build options object
      const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sortBy,
        sortOrder,
      };

      const attendanceData = await attendanceService.getAttendanceByBranch(branchId, options);

      res.status(200).json({
        success: true,
        data: attendanceData.data,
        meta: attendanceData.meta,
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
   * Record employee check-in
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  checkIn: async (req, res, next) => {
    try {
      const { employeeId } = req.params;

      // Validate request body
      validateRequestBody(req.body, ['time', 'location', 'branch']);

      const attendance = await attendanceService.checkIn(employeeId, req.body, req.user);

      res.status(200).json({
        success: true,
        data: attendance,
        message: 'Check-in recorded successfully',
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
   * Record employee check-out
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  checkOut: async (req, res, next) => {
    try {
      const { employeeId } = req.params;

      // Validate request body
      validateRequestBody(req.body, ['time', 'location']);

      const attendance = await attendanceService.checkOut(employeeId, req.body, req.user);

      res.status(200).json({
        success: true,
        data: attendance,
        message: 'Check-out recorded successfully',
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
   * Mark employee as absent
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  markAbsent: async (req, res, next) => {
    try {
      const { employeeId } = req.params;

      // Validate request body
      validateRequestBody(req.body, ['date', 'reason', 'branch']);

      const attendance = await attendanceService.markAbsent(employeeId, req.body, req.user);

      res.status(201).json({
        success: true,
        data: attendance,
        message: 'Employee marked as absent successfully',
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
   * Generate attendance report
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  generateAttendanceReport: async (req, res, next) => {
    try {
      // Extract filter criteria from query params
      const { employee, branch, startDate, endDate, groupBy = 'employee' } = req.query;

      // Build filter object
      const filter = {};
      if (employee) filter.employee = employee;
      if (branch) filter.branch = branch;
      if (startDate) filter.startDate = startDate;
      if (endDate) filter.endDate = endDate;

      // Build options object
      const options = {
        groupBy,
      };

      const reportData = await attendanceService.generateAttendanceReport(filter, options);

      res.status(200).json({
        success: true,
        data: reportData.data,
        summary: reportData.summary,
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
   * Get monthly attendance summary for an employee
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  getEmployeeMonthlyAttendanceSummary: async (req, res, next) => {
    try {
      const { employeeId } = req.params;
      const { year, month } = req.query;

      if (!year || !month) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Year and month are required',
          },
        });
      }

      const summaryData = await attendanceService.getEmployeeMonthlyAttendanceSummary(
        employeeId,
        parseInt(year, 10),
        parseInt(month, 10)
      );

      res.status(200).json({
        success: true,
        data: summaryData,
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
};

module.exports = attendanceController;
