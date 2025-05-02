/* eslint-disable class-methods-use-this */
const attendanceRepository = require('../../domain/repositories/attendanceRepository');
const employeeRepository = require('../../domain/repositories/employeeRepository');
const {
  ValidationError,
  NotFoundError,
  ConflictError,
} = require('../../infrastructure/errors/errors');
const { validatePastDate } = require('../../infrastructure/utils/validationUtils');

/**
 * Attendance Service
 * Implements business logic for employee attendance management
 */
const attendanceService = {
  /**
   * Create a new attendance record
   * @param {Object} attendanceData - Attendance data
   * @param {Object} user - User performing the action
   * @returns {Promise<Object>} Created attendance record
   */
  async createAttendance(attendanceData, user) {
    // Validate required fields
    if (
      !attendanceData.employee ||
      !attendanceData.date ||
      !attendanceData.status ||
      !attendanceData.branch
    ) {
      throw new ValidationError('Employee ID, date, status, and branch are required');
    }

    // Validate date is not in the future
    if (!validatePastDate(attendanceData.date)) {
      throw new ValidationError('Attendance date cannot be in the future');
    }

    // Check if employee exists
    try {
      await employeeRepository.findById(attendanceData.employee);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw new ValidationError('Employee not found');
      }
      throw error;
    }

    // Check if attendance record already exists for this employee and date
    try {
      const existingAttendance = await attendanceRepository.findByEmployeeAndDate(
        attendanceData.employee,
        new Date(attendanceData.date)
      );

      if (existingAttendance) {
        throw new ConflictError('Attendance record already exists for this employee and date');
      }
    } catch (error) {
      // If error is NotFoundError, it means no record exists, which is what we want
      if (!(error instanceof NotFoundError)) {
        throw error;
      }
    }

    // Calculate work hours if check-in and check-out times are provided
    if (attendanceData.checkIn?.time && attendanceData.checkOut?.time) {
      const checkInTime = new Date(attendanceData.checkIn.time);
      const checkOutTime = new Date(attendanceData.checkOut.time);

      if (checkOutTime <= checkInTime) {
        throw new ValidationError('Check-out time must be after check-in time');
      }

      // Calculate work hours (in hours, with 2 decimal places)
      const workHours = parseFloat(((checkOutTime - checkInTime) / (1000 * 60 * 60)).toFixed(2));
      attendanceData.workHours = workHours;
    }

    // Create attendance record
    return attendanceRepository.create(attendanceData, user);
  },

  /**
   * Get attendance record by ID
   * @param {string} id - Attendance ID
   * @returns {Promise<Object>} Attendance record
   */
  async getAttendanceById(id) {
    if (!id) {
      throw new ValidationError('Attendance ID is required');
    }

    return attendanceRepository.findById(id);
  },

  /**
   * Get all attendance records with optional filtering
   * @param {Object} filter - Filter criteria
   * @param {Object} options - Query options (pagination, sorting)
   * @returns {Promise<Array>} List of attendance records
   */
  async getAllAttendance(filter = {}, options = {}) {
    return attendanceRepository.findAll(filter, options);
  },

  /**
   * Update an attendance record
   * @param {string} id - Attendance ID
   * @param {Object} updateData - Data to update
   * @param {Object} user - User performing the action
   * @returns {Promise<Object>} Updated attendance record
   */
  async updateAttendance(id, updateData, user) {
    if (!id) {
      throw new ValidationError('Attendance ID is required');
    }

    // Get existing attendance record
    const existingAttendance = await attendanceRepository.findById(id);

    // Calculate work hours if check-in or check-out times are updated
    if (
      (updateData.checkIn?.time || existingAttendance.checkIn?.time) &&
      (updateData.checkOut?.time || existingAttendance.checkOut?.time)
    ) {
      const checkInTime = new Date(updateData.checkIn?.time || existingAttendance.checkIn?.time);
      const checkOutTime = new Date(updateData.checkOut?.time || existingAttendance.checkOut?.time);

      if (checkOutTime <= checkInTime) {
        throw new ValidationError('Check-out time must be after check-in time');
      }

      // Calculate work hours (in hours, with 2 decimal places)
      const workHours = parseFloat(((checkOutTime - checkInTime) / (1000 * 60 * 60)).toFixed(2));
      updateData.workHours = workHours;
    }

    return attendanceRepository.update(id, updateData, user);
  },

  /**
   * Delete an attendance record
   * @param {string} id - Attendance ID
   * @returns {Promise<boolean>} True if deleted successfully
   */
  async deleteAttendance(id) {
    if (!id) {
      throw new ValidationError('Attendance ID is required');
    }

    return attendanceRepository.delete(id);
  },

  /**
   * Get attendance records by employee ID
   * @param {string} employeeId - Employee ID
   * @param {Object} options - Query options (pagination, sorting)
   * @returns {Promise<Array>} List of attendance records
   */
  async getAttendanceByEmployee(employeeId, options = {}) {
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

    return attendanceRepository.findByEmployee(employeeId, options);
  },

  /**
   * Get attendance records by branch ID
   * @param {string} branchId - Branch ID
   * @param {Object} options - Query options (pagination, sorting)
   * @returns {Promise<Array>} List of attendance records
   */
  async getAttendanceByBranch(branchId, options = {}) {
    if (!branchId) {
      throw new ValidationError('Branch ID is required');
    }

    return attendanceRepository.findByBranch(branchId, options);
  },

  /**
   * Record employee check-in
   * @param {string} employeeId - Employee ID
   * @param {Object} checkInData - Check-in data
   * @param {Object} user - User performing the action
   * @returns {Promise<Object>} Updated attendance record
   */
  async checkIn(employeeId, checkInData, user) {
    if (!employeeId) {
      throw new ValidationError('Employee ID is required');
    }

    if (!checkInData.time) {
      throw new ValidationError('Check-in time is required');
    }

    if (!checkInData.location) {
      throw new ValidationError('Check-in location is required');
    }

    if (!checkInData.branch) {
      throw new ValidationError('Branch ID is required for check-in');
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

    // Validate check-in time is not in the future
    if (new Date(checkInData.time) > new Date()) {
      throw new ValidationError('Check-in time cannot be in the future');
    }

    return attendanceRepository.checkIn(employeeId, checkInData, user);
  },

  /**
   * Record employee check-out
   * @param {string} employeeId - Employee ID
   * @param {Object} checkOutData - Check-out data
   * @param {Object} user - User performing the action
   * @returns {Promise<Object>} Updated attendance record
   */
  async checkOut(employeeId, checkOutData, user) {
    if (!employeeId) {
      throw new ValidationError('Employee ID is required');
    }

    if (!checkOutData.time) {
      throw new ValidationError('Check-out time is required');
    }

    if (!checkOutData.location) {
      throw new ValidationError('Check-out location is required');
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

    // Validate check-out time is not in the future
    if (new Date(checkOutData.time) > new Date()) {
      throw new ValidationError('Check-out time cannot be in the future');
    }

    return attendanceRepository.checkOut(employeeId, checkOutData, user);
  },

  /**
   * Mark employee as absent
   * @param {string} employeeId - Employee ID
   * @param {Object} absentData - Absent data
   * @param {Object} user - User performing the action
   * @returns {Promise<Object>} Created attendance record
   */
  async markAbsent(employeeId, absentData, user) {
    if (!employeeId) {
      throw new ValidationError('Employee ID is required');
    }

    if (!absentData.date) {
      throw new ValidationError('Absent date is required');
    }

    if (!absentData.reason) {
      throw new ValidationError('Reason for absence is required');
    }

    if (!absentData.branch) {
      throw new ValidationError('Branch ID is required');
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

    // Validate date is not in the future
    if (!validatePastDate(absentData.date)) {
      throw new ValidationError('Absent date cannot be in the future');
    }

    // Check if attendance record already exists for this date
    try {
      const existingAttendance = await attendanceRepository.findByEmployeeAndDate(
        employeeId,
        new Date(absentData.date)
      );

      if (existingAttendance) {
        throw new ConflictError('Attendance record already exists for this date');
      }
    } catch (error) {
      // If error is NotFoundError, it means no record exists, which is what we want
      if (!(error instanceof NotFoundError)) {
        throw error;
      }
    }

    // Create attendance record with absent status
    return attendanceRepository.create(
      {
        employee: employeeId,
        date: new Date(absentData.date),
        status: 'absent',
        reason: absentData.reason,
        branch: absentData.branch,
        workHours: 0,
      },
      user
    );
  },

  /**
   * Generate attendance report
   * @param {Object} filter - Filter criteria
   * @param {Object} options - Report options
   * @returns {Promise<Object>} Attendance report data
   */
  async generateAttendanceReport(filter = {}, options = {}) {
    // Validate date range if provided
    if (filter.startDate && filter.endDate) {
      const startDate = new Date(filter.startDate);
      const endDate = new Date(filter.endDate);

      if (endDate < startDate) {
        throw new ValidationError('End date must be after start date');
      }
    }

    return attendanceRepository.generateReport(filter, options);
  },

  /**
   * Get monthly attendance summary for an employee
   * @param {string} employeeId - Employee ID
   * @param {number} year - Year for summary
   * @param {number} month - Month for summary (1-12)
   * @returns {Promise<Object>} Monthly attendance summary
   */
  async getEmployeeMonthlyAttendanceSummary(employeeId, year, month) {
    if (!employeeId) {
      throw new ValidationError('Employee ID is required');
    }

    if (!year || !month) {
      throw new ValidationError('Year and month are required');
    }

    // Validate year and month
    if (year < 2000 || year > 2100) {
      throw new ValidationError('Invalid year');
    }

    if (month < 1 || month > 12) {
      throw new ValidationError('Invalid month (must be 1-12)');
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

    // Calculate start and end dates for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    // Get attendance records for the month
    const attendanceData = await attendanceRepository.findAll(
      {
        employee: employeeId,
        date: {
          $gte: startDate,
          $lte: endDate,
        },
      },
      { limit: 31, sortBy: 'date', sortOrder: 'asc' }
    );

    // Calculate summary statistics
    const summary = {
      totalWorkDays: 0, // Will be calculated based on calendar
      presentDays: 0,
      absentDays: 0,
      lateDays: 0,
      leaveDays: 0,
      halfDays: 0,
      totalWorkHours: 0,
      averageWorkHours: 0,
      attendancePercentage: 0,
    };

    // Calculate total work days in the month (excluding weekends)
    const daysInMonth = new Date(year, month, 0).getDate();
    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = new Date(year, month - 1, day);
      const dayOfWeek = date.getDay();

      // Skip weekends (0 = Sunday, 6 = Saturday)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        summary.totalWorkDays += 1;
      }
    }

    // Calculate statistics from attendance records
    attendanceData.data.forEach(record => {
      switch (record.status) {
        case 'present':
          summary.presentDays += 1;
          break;
        case 'absent':
          summary.absentDays += 1;
          break;
        case 'late':
          summary.lateDays += 1;
          summary.presentDays += 1; // Late is still counted as present
          break;
        case 'leave':
          summary.leaveDays += 1;
          break;
        case 'half_day':
          summary.halfDays += 1;
          summary.presentDays += 0.5; // Half day is counted as half present
          break;
        default:
          break;
      }

      // Add work hours
      if (record.workHours) {
        summary.totalWorkHours += record.workHours;
      }
    });

    // Calculate average work hours and attendance percentage
    if (summary.presentDays > 0) {
      summary.averageWorkHours = parseFloat(
        (summary.totalWorkHours / summary.presentDays).toFixed(2)
      );
    }

    if (summary.totalWorkDays > 0) {
      summary.attendancePercentage = parseFloat(
        ((summary.presentDays / summary.totalWorkDays) * 100).toFixed(2)
      );
    }

    return {
      employee: employeeId,
      year,
      month,
      startDate,
      endDate,
      records: attendanceData.data,
      summary,
    };
  },
};

module.exports = attendanceService;
