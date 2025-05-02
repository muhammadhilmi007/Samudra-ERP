/* eslint-disable class-methods-use-this */
const Leave = require('../models/leave');
const { NotFoundError } = require('../../infrastructure/errors/errors');

/**
 * Leave Repository
 * Handles all data access operations for leave requests
 */
class LeaveRepository {
  /**
   * Create a new leave request
   * @param {Object} leaveData - Leave request data
   * @param {Object} user - User performing the action
   * @returns {Promise<Object>} Created leave request
   */
  async create(leaveData, user) {
    const leave = new Leave({
      ...leaveData,
      createdBy: user._id,
      updatedBy: user._id,
    });
    return leave.save();
  }

  /**
   * Find leave request by ID
   * @param {string} id - Leave request ID
   * @returns {Promise<Object>} Leave document
   * @throws {NotFoundError} If leave request is not found
   */
  async findById(id) {
    const leave = await Leave.findById(id)
      .populate('employee')
      .populate('branch')
      .populate('approvedBy', '-passwordHash -salt')
      .populate('createdBy', '-passwordHash -salt')
      .populate('updatedBy', '-passwordHash -salt');

    if (!leave) {
      throw new NotFoundError('Leave request not found');
    }

    return leave;
  }

  /**
   * Find all leave requests with optional filtering
   * @param {Object} filter - Filter criteria
   * @param {Object} options - Query options (pagination, sorting)
   * @returns {Promise<Array>} List of leave requests
   */
  async findAll(filter = {}, options = {}) {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = options;
    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    // If date range filter is provided for leave period
    if (filter.startDate || filter.endDate) {
      const dateFilter = {};

      if (filter.startDate) {
        const startDate = new Date(filter.startDate);
        startDate.setHours(0, 0, 0, 0);
        dateFilter.$gte = startDate;
      }

      if (filter.endDate) {
        const endDate = new Date(filter.endDate);
        endDate.setHours(23, 59, 59, 999);
        dateFilter.$lte = endDate;
      }

      // Find leaves that overlap with the specified date range
      filter.$or = [
        { startDate: dateFilter },
        { endDate: dateFilter },
        {
          $and: [
            { startDate: { $lte: filter.endDate ? new Date(filter.endDate) : new Date() } },
            { endDate: { $gte: filter.startDate ? new Date(filter.startDate) : new Date() } },
          ],
        },
      ];

      // Remove startDate and endDate from filter
      delete filter.startDate;
      delete filter.endDate;
    }

    const leaves = await Leave.find(filter)
      .populate('employee')
      .populate('branch')
      .populate('approvedBy', '-passwordHash -salt')
      .populate('createdBy', '-passwordHash -salt')
      .populate('updatedBy', '-passwordHash -salt')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Leave.countDocuments(filter);

    return {
      data: leaves,
      meta: {
        total,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update a leave request
   * @param {string} id - Leave request ID
   * @param {Object} updateData - Data to update
   * @param {Object} user - User performing the action
   * @returns {Promise<Object>} Updated leave request
   * @throws {NotFoundError} If leave request is not found
   */
  async update(id, updateData, user) {
    const leave = await Leave.findByIdAndUpdate(
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
      .populate('approvedBy', '-passwordHash -salt')
      .populate('createdBy', '-passwordHash -salt')
      .populate('updatedBy', '-passwordHash -salt');

    if (!leave) {
      throw new NotFoundError('Leave request not found');
    }

    return leave;
  }

  /**
   * Delete a leave request
   * @param {string} id - Leave request ID
   * @returns {Promise<boolean>} True if deleted successfully
   * @throws {NotFoundError} If leave request is not found
   */
  async delete(id) {
    const result = await Leave.findByIdAndDelete(id);

    if (!result) {
      throw new NotFoundError('Leave request not found');
    }

    return true;
  }

  /**
   * Find leave requests by employee ID
   * @param {string} employeeId - Employee ID
   * @param {Object} options - Query options (pagination, sorting)
   * @returns {Promise<Array>} List of leave requests
   */
  async findByEmployee(employeeId, options = {}) {
    return this.findAll({ employee: employeeId }, options);
  }

  /**
   * Find leave requests by branch ID
   * @param {string} branchId - Branch ID
   * @param {Object} options - Query options (pagination, sorting)
   * @returns {Promise<Array>} List of leave requests
   */
  async findByBranch(branchId, options = {}) {
    return this.findAll({ branch: branchId }, options);
  }

  /**
   * Find leave requests by status
   * @param {string} status - Leave request status
   * @param {Object} options - Query options (pagination, sorting)
   * @returns {Promise<Array>} List of leave requests
   */
  async findByStatus(status, options = {}) {
    return this.findAll({ status }, options);
  }

  /**
   * Approve a leave request
   * @param {string} id - Leave request ID
   * @param {Object} approvalData - Approval data
   * @param {Object} user - User performing the action
   * @returns {Promise<Object>} Updated leave request
   */
  async approve(id, approvalData, user) {
    return this.update(
      id,
      {
        status: 'approved',
        approvedBy: user._id,
        approvedAt: new Date(),
        ...approvalData,
      },
      user
    );
  }

  /**
   * Reject a leave request
   * @param {string} id - Leave request ID
   * @param {Object} rejectionData - Rejection data
   * @param {Object} user - User performing the action
   * @returns {Promise<Object>} Updated leave request
   */
  async reject(id, rejectionData, user) {
    return this.update(
      id,
      {
        status: 'rejected',
        rejectionReason: rejectionData.rejectionReason,
        ...rejectionData,
      },
      user
    );
  }

  /**
   * Cancel a leave request
   * @param {string} id - Leave request ID
   * @param {Object} user - User performing the action
   * @returns {Promise<Object>} Updated leave request
   */
  async cancel(id, user) {
    return this.update(
      id,
      {
        status: 'cancelled',
      },
      user
    );
  }

  /**
   * Get leave statistics for an employee
   * @param {string} employeeId - Employee ID
   * @param {number} year - Year for statistics (defaults to current year)
   * @returns {Promise<Object>} Leave statistics
   */
  async getEmployeeLeaveStatistics(employeeId, year = new Date().getFullYear()) {
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31, 23, 59, 59, 999);

    const pipeline = [
      {
        $match: {
          employee: mongoose.Types.ObjectId(employeeId),
          startDate: { $gte: startOfYear },
          endDate: { $lte: endOfYear },
        },
      },
      {
        $group: {
          _id: '$leaveType',
          totalRequests: { $sum: 1 },
          approvedRequests: {
            $sum: {
              $cond: [{ $eq: ['$status', 'approved'] }, 1, 0],
            },
          },
          pendingRequests: {
            $sum: {
              $cond: [{ $eq: ['$status', 'pending'] }, 1, 0],
            },
          },
          rejectedRequests: {
            $sum: {
              $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0],
            },
          },
          cancelledRequests: {
            $sum: {
              $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0],
            },
          },
          totalDays: { $sum: '$totalDays' },
          approvedDays: {
            $sum: {
              $cond: [{ $eq: ['$status', 'approved'] }, '$totalDays', 0],
            },
          },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ];

    const leaveStats = await Leave.aggregate(pipeline);

    // Calculate total statistics across all leave types
    const totalStats = {
      totalRequests: 0,
      approvedRequests: 0,
      pendingRequests: 0,
      rejectedRequests: 0,
      cancelledRequests: 0,
      totalDays: 0,
      approvedDays: 0,
    };

    leaveStats.forEach(stat => {
      totalStats.totalRequests += stat.totalRequests;
      totalStats.approvedRequests += stat.approvedRequests;
      totalStats.pendingRequests += stat.pendingRequests;
      totalStats.rejectedRequests += stat.rejectedRequests;
      totalStats.cancelledRequests += stat.cancelledRequests;
      totalStats.totalDays += stat.totalDays;
      totalStats.approvedDays += stat.approvedDays;
    });

    return {
      byType: leaveStats,
      total: totalStats,
      year,
    };
  }

  /**
   * Get leave statistics for a branch
   * @param {string} branchId - Branch ID
   * @param {Object} options - Options for filtering
   * @returns {Promise<Object>} Leave statistics
   */
  async getBranchLeaveStatistics(branchId, options = {}) {
    const { year = new Date().getFullYear(), month } = options;

    let startDate;
    let endDate;

    if (month !== undefined) {
      // If month is specified, get statistics for that month
      startDate = new Date(year, month - 1, 1);
      endDate = new Date(year, month, 0, 23, 59, 59, 999);
    } else {
      // Otherwise, get statistics for the entire year
      startDate = new Date(year, 0, 1);
      endDate = new Date(year, 11, 31, 23, 59, 59, 999);
    }

    const pipeline = [
      {
        $match: {
          branch: mongoose.Types.ObjectId(branchId),
          $or: [
            { startDate: { $gte: startDate, $lte: endDate } },
            { endDate: { $gte: startDate, $lte: endDate } },
            {
              $and: [{ startDate: { $lte: startDate } }, { endDate: { $gte: endDate } }],
            },
          ],
        },
      },
      {
        $group: {
          _id: {
            leaveType: '$leaveType',
            status: '$status',
          },
          count: { $sum: 1 },
          totalDays: { $sum: '$totalDays' },
          employees: { $addToSet: '$employee' },
        },
      },
      {
        $group: {
          _id: '$_id.leaveType',
          statuses: {
            $push: {
              status: '$_id.status',
              count: '$count',
              totalDays: '$totalDays',
              uniqueEmployees: { $size: '$employees' },
            },
          },
          totalRequests: { $sum: '$count' },
          totalDays: { $sum: '$totalDays' },
          uniqueEmployees: { $addToSet: '$employees' },
        },
      },
      {
        $project: {
          _id: 0,
          leaveType: '$_id',
          statuses: 1,
          totalRequests: 1,
          totalDays: 1,
          uniqueEmployees: {
            $size: {
              $reduce: {
                input: '$uniqueEmployees',
                initialValue: [],
                in: { $setUnion: ['$$value', '$$this'] },
              },
            },
          },
        },
      },
      {
        $sort: { leaveType: 1 },
      },
    ];

    const leaveStats = await Leave.aggregate(pipeline);

    // Calculate overall statistics
    const overallPipeline = [
      {
        $match: {
          branch: mongoose.Types.ObjectId(branchId),
          $or: [
            { startDate: { $gte: startDate, $lte: endDate } },
            { endDate: { $gte: startDate, $lte: endDate } },
            {
              $and: [{ startDate: { $lte: startDate } }, { endDate: { $gte: endDate } }],
            },
          ],
        },
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalDays: { $sum: '$totalDays' },
          uniqueEmployees: { $addToSet: '$employee' },
        },
      },
      {
        $group: {
          _id: null,
          statuses: {
            $push: {
              status: '$_id',
              count: '$count',
              totalDays: '$totalDays',
              uniqueEmployees: { $size: '$uniqueEmployees' },
            },
          },
          totalRequests: { $sum: '$count' },
          totalDays: { $sum: '$totalDays' },
          allEmployees: { $push: '$uniqueEmployees' },
        },
      },
      {
        $project: {
          _id: 0,
          statuses: 1,
          totalRequests: 1,
          totalDays: 1,
          uniqueEmployees: {
            $size: {
              $reduce: {
                input: '$allEmployees',
                initialValue: [],
                in: { $setUnion: ['$$value', '$$this'] },
              },
            },
          },
        },
      },
    ];

    const overallStats = await Leave.aggregate(overallPipeline);

    return {
      byType: leaveStats,
      overall:
        overallStats.length > 0
          ? overallStats[0]
          : {
              statuses: [],
              totalRequests: 0,
              totalDays: 0,
              uniqueEmployees: 0,
            },
      period: {
        year,
        month: month !== undefined ? month : null,
        startDate,
        endDate,
      },
    };
  }
}

module.exports = new LeaveRepository();
