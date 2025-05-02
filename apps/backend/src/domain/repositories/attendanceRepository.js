/* eslint-disable class-methods-use-this */
const Attendance = require('../models/attendance');
const { NotFoundError } = require('../../infrastructure/errors/errors');

/**
 * Attendance Repository
 * Handles all data access operations for attendance records
 */
class AttendanceRepository {
  /**
   * Create a new attendance record
   * @param {Object} attendanceData - Attendance data
   * @param {Object} user - User performing the action
   * @returns {Promise<Object>} Created attendance record
   */
  async create(attendanceData, user) {
    const attendance = new Attendance({
      ...attendanceData,
      createdBy: user._id,
      updatedBy: user._id,
    });
    return attendance.save();
  }

  /**
   * Find attendance record by ID
   * @param {string} id - Attendance ID
   * @returns {Promise<Object>} Attendance document
   * @throws {NotFoundError} If attendance record is not found
   */
  async findById(id) {
    const attendance = await Attendance.findById(id)
      .populate('employee')
      .populate('branch')
      .populate('createdBy', '-passwordHash -salt')
      .populate('updatedBy', '-passwordHash -salt');

    if (!attendance) {
      throw new NotFoundError('Attendance record not found');
    }

    return attendance;
  }

  /**
   * Find attendance record by employee and date
   * @param {string} employeeId - Employee ID
   * @param {Date} date - Date of attendance
   * @returns {Promise<Object>} Attendance document
   * @throws {NotFoundError} If attendance record is not found
   */
  async findByEmployeeAndDate(employeeId, date) {
    // Convert date to start and end of day for query
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const attendance = await Attendance.findOne({
      employee: employeeId,
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    })
      .populate('employee')
      .populate('branch')
      .populate('createdBy', '-passwordHash -salt')
      .populate('updatedBy', '-passwordHash -salt');

    if (!attendance) {
      throw new NotFoundError('Attendance record not found');
    }

    return attendance;
  }

  /**
   * Find all attendance records with optional filtering
   * @param {Object} filter - Filter criteria
   * @param {Object} options - Query options (pagination, sorting)
   * @returns {Promise<Array>} List of attendance records
   */
  async findAll(filter = {}, options = {}) {
    const { page = 1, limit = 10, sortBy = 'date', sortOrder = 'desc' } = options;
    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    // If date filter is provided, convert to start and end of day
    if (filter.date) {
      const date = new Date(filter.date);
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      filter.date = {
        $gte: startOfDay,
        $lte: endOfDay,
      };
    }

    // If date range filter is provided
    if (filter.startDate && filter.endDate) {
      const startDate = new Date(filter.startDate);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(filter.endDate);
      endDate.setHours(23, 59, 59, 999);

      filter.date = {
        $gte: startDate,
        $lte: endDate,
      };

      // Remove startDate and endDate from filter
      delete filter.startDate;
      delete filter.endDate;
    }

    const attendances = await Attendance.find(filter)
      .populate('employee')
      .populate('branch')
      .populate('createdBy', '-passwordHash -salt')
      .populate('updatedBy', '-passwordHash -salt')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Attendance.countDocuments(filter);

    return {
      data: attendances,
      meta: {
        total,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update an attendance record
   * @param {string} id - Attendance ID
   * @param {Object} updateData - Data to update
   * @param {Object} user - User performing the action
   * @returns {Promise<Object>} Updated attendance record
   * @throws {NotFoundError} If attendance record is not found
   */
  async update(id, updateData, user) {
    const attendance = await Attendance.findByIdAndUpdate(
      id,
      {
        ...updateData,
        updatedBy: user._id,
        updatedAt: new Date(),
      },
      { new: true, runValidators: true }
    )
      .populate('employee')
      .populate('branch')
      .populate('createdBy', '-passwordHash -salt')
      .populate('updatedBy', '-passwordHash -salt');

    if (!attendance) {
      throw new NotFoundError('Attendance record not found');
    }

    return attendance;
  }

  /**
   * Delete an attendance record
   * @param {string} id - Attendance ID
   * @returns {Promise<boolean>} True if deleted successfully
   * @throws {NotFoundError} If attendance record is not found
   */
  async delete(id) {
    const result = await Attendance.findByIdAndDelete(id);

    if (!result) {
      throw new NotFoundError('Attendance record not found');
    }

    return true;
  }

  /**
   * Find attendance records by employee ID
   * @param {string} employeeId - Employee ID
   * @param {Object} options - Query options (pagination, sorting)
   * @returns {Promise<Array>} List of attendance records
   */
  async findByEmployee(employeeId, options = {}) {
    return this.findAll({ employee: employeeId }, options);
  }

  /**
   * Find attendance records by branch ID
   * @param {string} branchId - Branch ID
   * @param {Object} options - Query options (pagination, sorting)
   * @returns {Promise<Array>} List of attendance records
   */
  async findByBranch(branchId, options = {}) {
    return this.findAll({ branch: branchId }, options);
  }

  /**
   * Find attendance records by status
   * @param {string} status - Attendance status
   * @param {Object} options - Query options (pagination, sorting)
   * @returns {Promise<Array>} List of attendance records
   */
  async findByStatus(status, options = {}) {
    return this.findAll({ status }, options);
  }

  /**
   * Check in an employee
   * @param {string} employeeId - Employee ID
   * @param {Object} checkInData - Check-in data
   * @param {Object} user - User performing the action
   * @returns {Promise<Object>} Updated attendance record
   */
  async checkIn(employeeId, checkInData, user) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if attendance record already exists for today
    let attendance;
    try {
      attendance = await this.findByEmployeeAndDate(employeeId, today);

      // If record exists, update it with check-in data
      return this.update(
        attendance._id,
        {
          checkIn: checkInData,
          status: 'present',
        },
        user
      );
    } catch (error) {
      if (error instanceof NotFoundError) {
        // If no record exists, create a new one
        return this.create(
          {
            employee: employeeId,
            date: today,
            checkIn: checkInData,
            status: 'present',
            branch: checkInData.branch,
          },
          user
        );
      }
      throw error;
    }
  }

  /**
   * Check out an employee
   * @param {string} employeeId - Employee ID
   * @param {Object} checkOutData - Check-out data
   * @param {Object} user - User performing the action
   * @returns {Promise<Object>} Updated attendance record
   * @throws {NotFoundError} If no check-in record is found
   */
  async checkOut(employeeId, checkOutData, user) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find today's attendance record
    const attendance = await this.findByEmployeeAndDate(employeeId, today);

    // Ensure employee has checked in
    if (!attendance.checkIn || !attendance.checkIn.time) {
      throw new NotFoundError('No check-in record found for today');
    }

    // Update with check-out data
    return this.update(
      attendance._id,
      {
        checkOut: checkOutData,
      },
      user
    );
  }

  /**
   * Generate attendance report
   * @param {Object} filter - Filter criteria
   * @param {Object} options - Report options
   * @returns {Promise<Object>} Attendance report data
   */
  async generateReport(filter = {}, options = {}) {
    const { groupBy = 'employee' } = options;

    // Define the group stage based on groupBy parameter
    let groupStage = {};

    if (groupBy === 'employee') {
      groupStage = {
        _id: '$employee',
        totalDays: { $sum: 1 },
        presentDays: {
          $sum: {
            $cond: [{ $eq: ['$status', 'present'] }, 1, 0],
          },
        },
        lateDays: {
          $sum: {
            $cond: [{ $eq: ['$status', 'late'] }, 1, 0],
          },
        },
        absentDays: {
          $sum: {
            $cond: [{ $eq: ['$status', 'absent'] }, 1, 0],
          },
        },
        halfDays: {
          $sum: {
            $cond: [{ $eq: ['$status', 'half_day'] }, 1, 0],
          },
        },
        leaveDays: {
          $sum: {
            $cond: [{ $eq: ['$status', 'leave'] }, 1, 0],
          },
        },
        totalWorkHours: { $sum: '$workHours' },
        records: { $push: '$$ROOT' },
      };
    } else if (groupBy === 'date') {
      groupStage = {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
        totalEmployees: { $sum: 1 },
        presentEmployees: {
          $sum: {
            $cond: [{ $eq: ['$status', 'present'] }, 1, 0],
          },
        },
        lateEmployees: {
          $sum: {
            $cond: [{ $eq: ['$status', 'late'] }, 1, 0],
          },
        },
        absentEmployees: {
          $sum: {
            $cond: [{ $eq: ['$status', 'absent'] }, 1, 0],
          },
        },
        onLeaveEmployees: {
          $sum: {
            $cond: [{ $eq: ['$status', 'leave'] }, 1, 0],
          },
        },
        totalWorkHours: { $sum: '$workHours' },
        records: { $push: '$$ROOT' },
      };
    } else if (groupBy === 'branch') {
      groupStage = {
        _id: '$branch',
        totalEmployees: { $addToSet: '$employee' },
        totalDays: { $sum: 1 },
        presentDays: {
          $sum: {
            $cond: [{ $eq: ['$status', 'present'] }, 1, 0],
          },
        },
        lateDays: {
          $sum: {
            $cond: [{ $eq: ['$status', 'late'] }, 1, 0],
          },
        },
        absentDays: {
          $sum: {
            $cond: [{ $eq: ['$status', 'absent'] }, 1, 0],
          },
        },
        leaveDays: {
          $sum: {
            $cond: [{ $eq: ['$status', 'leave'] }, 1, 0],
          },
        },
        totalWorkHours: { $sum: '$workHours' },
      };
    }

    // Build the aggregation pipeline
    const pipeline = [{ $match: filter }, { $group: groupStage }, { $sort: { _id: 1 } }];

    // Add lookup stage for employee or branch details if needed
    if (groupBy === 'employee') {
      pipeline.push({
        $lookup: {
          from: 'employees',
          localField: '_id',
          foreignField: '_id',
          as: 'employeeDetails',
        },
      });
      pipeline.push({
        $unwind: {
          path: '$employeeDetails',
          preserveNullAndEmptyArrays: true,
        },
      });
    } else if (groupBy === 'branch') {
      pipeline.push({
        $lookup: {
          from: 'branches',
          localField: '_id',
          foreignField: '_id',
          as: 'branchDetails',
        },
      });
      pipeline.push({
        $unwind: {
          path: '$branchDetails',
          preserveNullAndEmptyArrays: true,
        },
      });
      // Calculate total unique employees
      pipeline.push({
        $addFields: {
          totalEmployeesCount: { $size: '$totalEmployees' },
        },
      });
    }

    // Execute the aggregation
    const results = await Attendance.aggregate(pipeline);

    // Calculate summary statistics
    const summary = {
      totalRecords: await Attendance.countDocuments(filter),
      presentPercentage: 0,
      latePercentage: 0,
      absentPercentage: 0,
      leavePercentage: 0,
      averageWorkHours: 0,
    };

    if (summary.totalRecords > 0) {
      const stats = await Attendance.aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
            presentCount: {
              $sum: {
                $cond: [{ $eq: ['$status', 'present'] }, 1, 0],
              },
            },
            lateCount: {
              $sum: {
                $cond: [{ $eq: ['$status', 'late'] }, 1, 0],
              },
            },
            absentCount: {
              $sum: {
                $cond: [{ $eq: ['$status', 'absent'] }, 1, 0],
              },
            },
            leaveCount: {
              $sum: {
                $cond: [{ $eq: ['$status', 'leave'] }, 1, 0],
              },
            },
            totalWorkHours: { $sum: '$workHours' },
          },
        },
      ]);

      if (stats.length > 0) {
        const { presentCount, lateCount, absentCount, leaveCount, totalWorkHours } = stats[0];
        summary.presentPercentage = (presentCount / summary.totalRecords) * 100;
        summary.latePercentage = (lateCount / summary.totalRecords) * 100;
        summary.absentPercentage = (absentCount / summary.totalRecords) * 100;
        summary.leavePercentage = (leaveCount / summary.totalRecords) * 100;
        summary.averageWorkHours = totalWorkHours / summary.totalRecords;
      }
    }

    return {
      data: results,
      summary,
    };
  }
}

module.exports = new AttendanceRepository();
