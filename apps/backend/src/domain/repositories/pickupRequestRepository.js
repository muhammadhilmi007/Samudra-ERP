/**
 * Samudra Paket ERP - Pickup Request Repository
 * Handles data access and business logic for pickup requests
 */

const PickupRequest = require('../models/pickupRequest');
const Branch = require('../models/branch');
const mongoose = require('mongoose');

/**
 * Create a new pickup request
 * @param {Object} pickupData - Pickup request data
 * @returns {Promise<Object>} Created pickup request
 */
exports.createPickupRequest = async (pickupData) => {
  try {
    // Generate a unique code for the pickup request
    const code = await PickupRequest.generateCode(pickupData.branch);
    
    // Create the pickup request with the generated code
    const pickupRequest = new PickupRequest({
      ...pickupData,
      code,
    });
    
    // Add creation activity to history
    if (pickupData.createdBy) {
      pickupRequest.addActivity('created', pickupData.createdBy, { details: 'Pickup request created' });
    }
    
    await pickupRequest.save();
    return pickupRequest;
  } catch (error) {
    throw error;
  }
};

/**
 * Get all pickup requests with filtering and pagination
 * @param {Object} filter - Filter criteria
 * @param {Object} options - Query options (pagination, sorting, etc.)
 * @returns {Promise<Object>} Pickup requests and metadata
 */
exports.getAllPickupRequests = async (filter = {}, options = {}) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      status,
      branch,
      customer,
      scheduledDateFrom,
      scheduledDateTo,
      priority,
      team,
      search,
      populate = [],
    } = options;

    // Build the query
    const query = {};
    
    // Add filters if provided
    if (status) query.status = status;
    if (branch) query.branch = branch;
    if (customer) query.customer = customer;
    if (priority) query.priority = priority;
    if (team) query['assignment.team'] = team;
    
    // Date range filter
    if (scheduledDateFrom || scheduledDateTo) {
      query.scheduledDate = {};
      if (scheduledDateFrom) query.scheduledDate.$gte = new Date(scheduledDateFrom);
      if (scheduledDateTo) query.scheduledDate.$lte = new Date(scheduledDateTo);
    }
    
    // Search functionality
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { code: searchRegex },
        { 'contactPerson.name': searchRegex },
        { 'contactPerson.phone': searchRegex },
        { 'pickupAddress.street': searchRegex },
        { 'pickupAddress.city': searchRegex },
      ];
    }
    
    // Apply additional filters if provided
    if (filter) {
      Object.assign(query, filter);
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
    
    // Execute query with pagination
    const pickupRequests = await PickupRequest.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .populate(populate);
    
    // Get total count for pagination
    const total = await PickupRequest.countDocuments(query);
    
    return {
      data: pickupRequests,
      meta: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Get a pickup request by ID
 * @param {string} id - Pickup request ID
 * @param {Array} populate - Fields to populate
 * @returns {Promise<Object>} Pickup request
 */
exports.getPickupRequestById = async (id, populate = []) => {
  try {
    const pickupRequest = await PickupRequest.findById(id).populate(populate);
    return pickupRequest;
  } catch (error) {
    throw error;
  }
};

/**
 * Get a pickup request by code
 * @param {string} code - Pickup request code
 * @param {Array} populate - Fields to populate
 * @returns {Promise<Object>} Pickup request
 */
exports.getPickupRequestByCode = async (code, populate = []) => {
  try {
    const pickupRequest = await PickupRequest.findOne({ code }).populate(populate);
    return pickupRequest;
  } catch (error) {
    throw error;
  }
};

/**
 * Update a pickup request
 * @param {string} id - Pickup request ID
 * @param {Object} updateData - Data to update
 * @param {Object} options - Update options
 * @returns {Promise<Object>} Updated pickup request
 */
exports.updatePickupRequest = async (id, updateData, options = {}) => {
  try {
    const { new: returnNew = true } = options;
    
    // Remove fields that shouldn't be updated directly
    const safeUpdateData = { ...updateData };
    delete safeUpdateData.code;
    delete safeUpdateData.createdBy;
    delete safeUpdateData.createdAt;
    delete safeUpdateData.activityHistory;
    
    // Add activity to history if user is provided
    if (updateData.updatedBy) {
      const pickupRequest = await PickupRequest.findById(id);
      if (!pickupRequest) {
        throw new Error('Pickup request not found');
      }
      
      pickupRequest.updatedBy = updateData.updatedBy;
      pickupRequest.addActivity(
        'updated',
        updateData.updatedBy,
        { details: 'Pickup request updated', updatedFields: Object.keys(safeUpdateData) }
      );
      
      // Apply updates
      Object.keys(safeUpdateData).forEach(key => {
        if (key !== 'updatedBy') {
          pickupRequest[key] = safeUpdateData[key];
        }
      });
      
      await pickupRequest.save();
      return pickupRequest;
    } else {
      // Simple update without activity tracking
      return await PickupRequest.findByIdAndUpdate(id, safeUpdateData, { new: returnNew });
    }
  } catch (error) {
    throw error;
  }
};

/**
 * Update pickup request status
 * @param {string} id - Pickup request ID
 * @param {string} status - New status
 * @param {string} userId - User ID making the update
 * @param {Object} details - Additional details about the status change
 * @returns {Promise<Object>} Updated pickup request
 */
exports.updateStatus = async (id, status, userId, details = {}) => {
  try {
    const pickupRequest = await PickupRequest.findById(id);
    if (!pickupRequest) {
      throw new Error('Pickup request not found');
    }
    
    const oldStatus = pickupRequest.status;
    pickupRequest.status = status;
    pickupRequest.updatedBy = userId;
    
    // Add activity to history
    pickupRequest.addActivity(
      'status_updated',
      userId,
      { 
        details: `Status changed from ${oldStatus} to ${status}`,
        oldStatus,
        newStatus: status,
        ...details
      }
    );
    
    // Handle specific status changes
    switch (status) {
      case 'cancelled':
        pickupRequest.cancellation = {
          reason: details.reason || 'No reason provided',
          cancelledBy: userId,
          cancelledAt: new Date(),
        };
        break;
      case 'rescheduled':
        if (details.newDate && details.newTimeWindow) {
          pickupRequest.rescheduling.push({
            previousDate: pickupRequest.scheduledDate,
            previousTimeWindow: pickupRequest.scheduledTimeWindow,
            newDate: details.newDate,
            newTimeWindow: details.newTimeWindow,
            reason: details.reason || 'No reason provided',
            rescheduledBy: userId,
            rescheduledAt: new Date(),
          });
          
          // Update the scheduled date and time window
          pickupRequest.scheduledDate = details.newDate;
          pickupRequest.scheduledTimeWindow = details.newTimeWindow;
        }
        break;
      case 'scheduled':
        if (details.team && details.vehicle) {
          pickupRequest.assignment = {
            team: details.team,
            vehicle: details.vehicle,
            assignedAt: new Date(),
            assignedBy: userId,
          };
        }
        break;
      case 'in_progress':
        if (!pickupRequest.execution) {
          pickupRequest.execution = {};
        }
        pickupRequest.execution.startTime = new Date();
        break;
      case 'arrived':
        if (!pickupRequest.execution) {
          pickupRequest.execution = {};
        }
        pickupRequest.execution.arrivalTime = new Date();
        break;
      case 'completed':
        if (!pickupRequest.execution) {
          pickupRequest.execution = {};
        }
        pickupRequest.execution.completionTime = new Date();
        
        // Update actual items if provided
        if (details.actualItems) {
          pickupRequest.execution.actualItems = details.actualItems;
        }
        
        // Update signatures if provided
        if (details.signatures) {
          pickupRequest.execution.signatures = {
            ...pickupRequest.execution.signatures,
            ...details.signatures,
          };
        }
        
        // Update notes if provided
        if (details.notes) {
          pickupRequest.execution.notes = details.notes;
        }
        break;
    }
    
    await pickupRequest.save();
    return pickupRequest;
  } catch (error) {
    throw error;
  }
};

/**
 * Assign a pickup request to a team and vehicle
 * @param {string} id - Pickup request ID
 * @param {string} teamId - Team/driver ID
 * @param {string} vehicleId - Vehicle ID
 * @param {string} userId - User ID making the assignment
 * @returns {Promise<Object>} Updated pickup request
 */
exports.assignPickupRequest = async (id, teamId, vehicleId, userId) => {
  try {
    const pickupRequest = await PickupRequest.findById(id);
    if (!pickupRequest) {
      throw new Error('Pickup request not found');
    }
    
    // Update assignment information
    pickupRequest.assignment = {
      team: teamId,
      vehicle: vehicleId,
      assignedAt: new Date(),
      assignedBy: userId,
    };
    
    // Update status to scheduled
    pickupRequest.status = 'scheduled';
    pickupRequest.updatedBy = userId;
    
    // Add activity to history
    pickupRequest.addActivity(
      'assigned',
      userId,
      { 
        details: 'Pickup request assigned to team and vehicle',
        team: teamId,
        vehicle: vehicleId
      }
    );
    
    await pickupRequest.save();
    return pickupRequest;
  } catch (error) {
    throw error;
  }
};

/**
 * Record pickup execution details
 * @param {string} id - Pickup request ID
 * @param {Object} executionData - Execution details
 * @param {string} userId - User ID recording the execution
 * @returns {Promise<Object>} Updated pickup request
 */
exports.recordExecution = async (id, executionData, userId) => {
  try {
    const pickupRequest = await PickupRequest.findById(id);
    if (!pickupRequest) {
      throw new Error('Pickup request not found');
    }
    
    // Update execution information
    pickupRequest.execution = {
      ...pickupRequest.execution,
      ...executionData,
    };
    
    // Update status if provided
    if (executionData.status) {
      pickupRequest.status = executionData.status;
    }
    
    pickupRequest.updatedBy = userId;
    
    // Add activity to history
    pickupRequest.addActivity(
      'execution_updated',
      userId,
      { 
        details: 'Pickup execution details updated',
        executionData
      }
    );
    
    await pickupRequest.save();
    return pickupRequest;
  } catch (error) {
    throw error;
  }
};

/**
 * Reschedule a pickup request
 * @param {string} id - Pickup request ID
 * @param {Date} newDate - New scheduled date
 * @param {Object} newTimeWindow - New time window
 * @param {string} reason - Reason for rescheduling
 * @param {string} userId - User ID making the reschedule
 * @returns {Promise<Object>} Updated pickup request
 */
exports.reschedulePickupRequest = async (id, newDate, newTimeWindow, reason, userId) => {
  try {
    const pickupRequest = await PickupRequest.findById(id);
    if (!pickupRequest) {
      throw new Error('Pickup request not found');
    }
    
    // Store the previous schedule
    const previousDate = pickupRequest.scheduledDate;
    const previousTimeWindow = pickupRequest.scheduledTimeWindow;
    
    // Update with new schedule
    pickupRequest.scheduledDate = newDate;
    pickupRequest.scheduledTimeWindow = newTimeWindow;
    pickupRequest.status = 'rescheduled';
    pickupRequest.updatedBy = userId;
    
    // Add to rescheduling history
    pickupRequest.rescheduling.push({
      previousDate,
      previousTimeWindow,
      newDate,
      newTimeWindow,
      reason: reason || 'No reason provided',
      rescheduledBy: userId,
      rescheduledAt: new Date(),
    });
    
    // Add activity to history
    pickupRequest.addActivity(
      'rescheduled',
      userId,
      { 
        details: 'Pickup request rescheduled',
        previousDate,
        previousTimeWindow,
        newDate,
        newTimeWindow,
        reason
      }
    );
    
    await pickupRequest.save();
    return pickupRequest;
  } catch (error) {
    throw error;
  }
};

/**
 * Cancel a pickup request
 * @param {string} id - Pickup request ID
 * @param {string} reason - Reason for cancellation
 * @param {string} userId - User ID making the cancellation
 * @returns {Promise<Object>} Updated pickup request
 */
exports.cancelPickupRequest = async (id, reason, userId) => {
  try {
    const pickupRequest = await PickupRequest.findById(id);
    if (!pickupRequest) {
      throw new Error('Pickup request not found');
    }
    
    // Update status and cancellation info
    pickupRequest.status = 'cancelled';
    pickupRequest.cancellation = {
      reason: reason || 'No reason provided',
      cancelledBy: userId,
      cancelledAt: new Date(),
    };
    pickupRequest.updatedBy = userId;
    
    // Add activity to history
    pickupRequest.addActivity(
      'cancelled',
      userId,
      { 
        details: 'Pickup request cancelled',
        reason
      }
    );
    
    await pickupRequest.save();
    return pickupRequest;
  } catch (error) {
    throw error;
  }
};

/**
 * Report an issue with a pickup request
 * @param {string} id - Pickup request ID
 * @param {Object} issueData - Issue details
 * @param {string} userId - User ID reporting the issue
 * @returns {Promise<Object>} Updated pickup request
 */
exports.reportIssue = async (id, issueData, userId) => {
  try {
    const pickupRequest = await PickupRequest.findById(id);
    if (!pickupRequest) {
      throw new Error('Pickup request not found');
    }
    
    // Ensure execution object exists
    if (!pickupRequest.execution) {
      pickupRequest.execution = {};
    }
    
    // Ensure issues array exists
    if (!pickupRequest.execution.issues) {
      pickupRequest.execution.issues = [];
    }
    
    // Add the new issue
    const issue = {
      type: issueData.type,
      description: issueData.description,
      reportedBy: userId,
      reportedAt: new Date(),
      resolved: false,
    };
    
    pickupRequest.execution.issues.push(issue);
    pickupRequest.updatedBy = userId;
    
    // Add activity to history
    pickupRequest.addActivity(
      'issue_reported',
      userId,
      { 
        details: `Issue reported: ${issueData.type}`,
        issueData
      }
    );
    
    await pickupRequest.save();
    return pickupRequest;
  } catch (error) {
    throw error;
  }
};

/**
 * Resolve an issue with a pickup request
 * @param {string} id - Pickup request ID
 * @param {number} issueIndex - Index of the issue in the issues array
 * @param {string} resolution - Resolution description
 * @param {string} userId - User ID resolving the issue
 * @returns {Promise<Object>} Updated pickup request
 */
exports.resolveIssue = async (id, issueIndex, resolution, userId) => {
  try {
    const pickupRequest = await PickupRequest.findById(id);
    if (!pickupRequest) {
      throw new Error('Pickup request not found');
    }
    
    // Check if execution and issues exist
    if (!pickupRequest.execution || !pickupRequest.execution.issues || 
        !pickupRequest.execution.issues[issueIndex]) {
      throw new Error('Issue not found');
    }
    
    // Update the issue
    pickupRequest.execution.issues[issueIndex].resolved = true;
    pickupRequest.execution.issues[issueIndex].resolvedAt = new Date();
    pickupRequest.execution.issues[issueIndex].resolution = resolution;
    pickupRequest.updatedBy = userId;
    
    // Add activity to history
    pickupRequest.addActivity(
      'issue_resolved',
      userId,
      { 
        details: `Issue resolved: ${pickupRequest.execution.issues[issueIndex].type}`,
        issueIndex,
        resolution
      }
    );
    
    await pickupRequest.save();
    return pickupRequest;
  } catch (error) {
    throw error;
  }
};

/**
 * Get pickup request activity history
 * @param {string} id - Pickup request ID
 * @param {Object} options - Query options (pagination, sorting)
 * @returns {Promise<Object>} Activity history and metadata
 */
exports.getPickupRequestActivityHistory = async (id, options = {}) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortOrder = 'desc',
    } = options;
    
    const pickupRequest = await PickupRequest.findById(id);
    if (!pickupRequest) {
      throw new Error('Pickup request not found');
    }
    
    // Get the total count
    const total = pickupRequest.activityHistory.length;
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const end = skip + parseInt(limit);
    
    // Get the activities for the current page
    let activities = [...pickupRequest.activityHistory];
    
    // Sort activities
    activities.sort((a, b) => {
      return sortOrder === 'desc' 
        ? b.timestamp - a.timestamp 
        : a.timestamp - b.timestamp;
    });
    
    // Apply pagination
    activities = activities.slice(skip, end);
    
    // Populate user information
    const populatedActivities = await Promise.all(
      activities.map(async (activity) => {
        try {
          // Use the mongoose model directly to populate
          const User = mongoose.model('User');
          const user = await User.findById(activity.performedBy).select('username name email');
          
          return {
            ...activity.toObject(),
            performedBy: user || activity.performedBy,
          };
        } catch (error) {
          console.error('Error populating user:', error);
          return activity;
        }
      })
    );
    
    return {
      data: populatedActivities,
      meta: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Add activity to pickup request history
 * @param {string} id - Pickup request ID
 * @param {string} action - Activity action
 * @param {string} userId - User ID performing the action
 * @param {Object} details - Activity details
 * @returns {Promise<Object>} Updated pickup request
 */
exports.addPickupRequestActivity = async (id, action, userId, details = {}) => {
  try {
    const pickupRequest = await PickupRequest.findById(id);
    if (!pickupRequest) {
      throw new Error('Pickup request not found');
    }
    
    pickupRequest.addActivity(action, userId, details);
    pickupRequest.updatedBy = userId;
    
    await pickupRequest.save();
    return pickupRequest;
  } catch (error) {
    throw error;
  }
};

/**
 * Validate if an address is within service area
 * @param {Object} address - Address to validate
 * @param {string} branchId - Branch ID to check against
 * @returns {Promise<Object>} Validation result
 */
exports.validateServiceAreaCoverage = async (address, branchId) => {
  try {
    const branch = await Branch.findById(branchId);
    if (!branch) {
      throw new Error('Branch not found');
    }
    
    // Check if the branch has service areas defined
    if (!branch.serviceAreas || branch.serviceAreas.length === 0) {
      return {
        valid: false,
        message: 'Branch has no defined service areas',
      };
    }
    
    // Check if the address is within any of the branch's service areas
    const { city, province } = address;
    
    // Simple validation based on city and province
    const matchingArea = branch.serviceAreas.find(area => 
      area.city.toLowerCase() === city.toLowerCase() && 
      area.province.toLowerCase() === province.toLowerCase()
    );
    
    if (matchingArea) {
      return {
        valid: true,
        message: 'Address is within service area',
        serviceArea: matchingArea,
      };
    }
    
    // If no direct match, check if there's a service area that covers the entire province
    const provinceWideArea = branch.serviceAreas.find(area => 
      area.province.toLowerCase() === province.toLowerCase() && 
      (!area.city || area.city === '*')
    );
    
    if (provinceWideArea) {
      return {
        valid: true,
        message: 'Address is within province-wide service area',
        serviceArea: provinceWideArea,
      };
    }
    
    return {
      valid: false,
      message: 'Address is outside service area',
      nearestServiceAreas: branch.serviceAreas.filter(area => 
        area.province.toLowerCase() === province.toLowerCase()
      ),
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Get pickup requests scheduled for today
 * @param {string} branchId - Branch ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Pickup requests and metadata
 */
exports.getTodayPickupRequests = async (branchId, options = {}) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const filter = {
      branch: branchId,
      scheduledDate: {
        $gte: today,
        $lt: tomorrow,
      },
      status: {
        $nin: ['completed', 'cancelled', 'failed'],
      },
    };
    
    return await exports.getAllPickupRequests(filter, options);
  } catch (error) {
    throw error;
  }
};

/**
 * Get pickup requests assigned to a specific team
 * @param {string} teamId - Team/driver ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Pickup requests and metadata
 */
exports.getTeamPickupRequests = async (teamId, options = {}) => {
  try {
    const filter = {
      'assignment.team': teamId,
      status: {
        $nin: ['completed', 'cancelled', 'failed'],
      },
    };
    
    return await exports.getAllPickupRequests(filter, options);
  } catch (error) {
    throw error;
  }
};

/**
 * Get pickup requests by status
 * @param {string} status - Status to filter by
 * @param {string} branchId - Branch ID (optional)
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Pickup requests and metadata
 */
exports.getPickupRequestsByStatus = async (status, branchId, options = {}) => {
  try {
    const filter = {
      status,
    };
    
    if (branchId) {
      filter.branch = branchId;
    }
    
    return await exports.getAllPickupRequests(filter, options);
  } catch (error) {
    throw error;
  }
};

/**
 * Get pickup requests by priority
 * @param {string} priority - Priority to filter by
 * @param {string} branchId - Branch ID (optional)
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Pickup requests and metadata
 */
exports.getPickupRequestsByPriority = async (priority, branchId, options = {}) => {
  try {
    const filter = {
      priority,
    };
    
    if (branchId) {
      filter.branch = branchId;
    }
    
    return await exports.getAllPickupRequests(filter, options);
  } catch (error) {
    throw error;
  }
};

/**
 * Search pickup requests
 * @param {string} query - Search query
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Pickup requests and metadata
 */
exports.searchPickupRequests = async (query, options = {}) => {
  try {
    // Add the search query to options
    const searchOptions = {
      ...options,
      search: query,
    };
    
    return await exports.getAllPickupRequests({}, searchOptions);
  } catch (error) {
    throw error;
  }
};
