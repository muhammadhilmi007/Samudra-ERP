/**
 * Samudra Paket ERP - Pickup Assignment Repository
 * Handles business logic for pickup assignments
 */

const mongoose = require('mongoose');
const PickupAssignment = require('../models/pickupAssignment');
const PickupRequest = require('../models/pickupRequest');
const Vehicle = require('../models/vehicle');
const Employee = require('../models/employee');
const Branch = require('../models/branch');
const routeOptimizationService = require('../services/routeOptimizationService');
const logger = require('../../api/middleware/gateway/logger');

/**
 * Create a new pickup assignment
 * @param {Object} data - Pickup assignment data
 * @returns {Promise<Object>} Created pickup assignment
 */
const createPickupAssignment = async (data) => {
  try {
    // Generate a unique code for the assignment
    const code = await PickupAssignment.generateCode(data.branch);
    
    // Create a new pickup assignment
    const pickupAssignment = new PickupAssignment({
      ...data,
      code,
    });
    
    // Add creation activity
    pickupAssignment.addActivity('created', data.createdBy, {
      branch: data.branch,
      assignmentDate: data.assignmentDate,
    });
    
    // Save the pickup assignment
    await pickupAssignment.save();
    
    // If pickup requests are provided, update their status to 'scheduled'
    if (data.pickupRequests && data.pickupRequests.length > 0) {
      await Promise.all(data.pickupRequests.map(async (requestId) => {
        const pickupRequest = await PickupRequest.findById(requestId);
        if (pickupRequest) {
          pickupRequest.status = 'scheduled';
          pickupRequest.assignment = {
            team: data.team.driver,
            vehicle: data.vehicle,
            assignedAt: new Date(),
            assignedBy: data.createdBy,
          };
          pickupRequest.addActivity('assigned', data.createdBy, {
            assignmentCode: code,
            driver: data.team.driver,
            vehicle: data.vehicle,
          });
          await pickupRequest.save();
        }
      }));
    }
    
    return pickupAssignment;
  } catch (error) {
    logger.error(`Error creating pickup assignment: ${error.message}`, { error });
    throw error;
  }
};

/**
 * Get all pickup assignments with filtering and pagination
 * @param {Object} filter - Filter criteria
 * @param {Object} options - Pagination and sorting options
 * @returns {Promise<Object>} Pickup assignments with pagination metadata
 */
const getAllPickupAssignments = async (filter = {}, options = {}) => {
  try {
    const {
      branch,
      driver,
      vehicle,
      status,
      assignmentDateFrom,
      assignmentDateTo,
      sortBy = 'assignmentDate',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
      populate = [],
    } = options;
    
    // Build query
    const query = { ...filter };
    
    // Add branch filter if provided
    if (branch) {
      query.branch = branch;
    }
    
    // Add driver filter if provided
    if (driver) {
      query['team.driver'] = driver;
    }
    
    // Add vehicle filter if provided
    if (vehicle) {
      query.vehicle = vehicle;
    }
    
    // Add status filter if provided
    if (status) {
      query.status = status;
    }
    
    // Add date range filter if provided
    if (assignmentDateFrom || assignmentDateTo) {
      query.assignmentDate = {};
      
      if (assignmentDateFrom) {
        query.assignmentDate.$gte = new Date(assignmentDateFrom);
      }
      
      if (assignmentDateTo) {
        query.assignmentDate.$lte = new Date(assignmentDateTo);
      }
    }
    
    // Count total documents
    const total = await PickupAssignment.countDocuments(query);
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    const totalPages = Math.ceil(total / limit);
    
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    // Execute query with pagination
    let pickupAssignments = await PickupAssignment.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit);
    
    // Populate references if requested
    if (populate.length > 0) {
      pickupAssignments = await PickupAssignment.populate(pickupAssignments, populate);
    }
    
    return {
      data: pickupAssignments,
      meta: {
        total,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalPages,
      },
    };
  } catch (error) {
    logger.error(`Error getting pickup assignments: ${error.message}`, { error });
    throw error;
  }
};

/**
 * Get pickup assignment by ID
 * @param {string} id - Pickup assignment ID
 * @param {Array} populate - Fields to populate
 * @returns {Promise<Object>} Pickup assignment
 */
const getPickupAssignmentById = async (id, populate = []) => {
  try {
    let query = PickupAssignment.findById(id);
    
    // Populate references if requested
    if (populate.length > 0) {
      query = query.populate(populate);
    }
    
    const pickupAssignment = await query.exec();
    return pickupAssignment;
  } catch (error) {
    logger.error(`Error getting pickup assignment by ID: ${error.message}`, { error });
    throw error;
  }
};

/**
 * Get pickup assignment by code
 * @param {string} code - Pickup assignment code
 * @param {Array} populate - Fields to populate
 * @returns {Promise<Object>} Pickup assignment
 */
const getPickupAssignmentByCode = async (code, populate = []) => {
  try {
    let query = PickupAssignment.findOne({ code });
    
    // Populate references if requested
    if (populate.length > 0) {
      query = query.populate(populate);
    }
    
    const pickupAssignment = await query.exec();
    return pickupAssignment;
  } catch (error) {
    logger.error(`Error getting pickup assignment by code: ${error.message}`, { error });
    throw error;
  }
};

/**
 * Update pickup assignment
 * @param {string} id - Pickup assignment ID
 * @param {Object} data - Updated data
 * @returns {Promise<Object>} Updated pickup assignment
 */
const updatePickupAssignment = async (id, data) => {
  try {
    const pickupAssignment = await PickupAssignment.findById(id);
    
    if (!pickupAssignment) {
      throw new Error('Pickup assignment not found');
    }
    
    // Fields that should not be updated directly
    const protectedFields = ['code', 'createdBy', 'createdAt', 'activityHistory'];
    
    // Update fields
    Object.keys(data).forEach(key => {
      if (!protectedFields.includes(key)) {
        pickupAssignment[key] = data[key];
      }
    });
    
    // Add update activity
    pickupAssignment.addActivity('updated', data.updatedBy, {
      updatedFields: Object.keys(data).filter(key => !protectedFields.includes(key)),
    });
    
    // Set updatedBy
    pickupAssignment.updatedBy = data.updatedBy;
    
    // Save the updated pickup assignment
    await pickupAssignment.save();
    
    return pickupAssignment;
  } catch (error) {
    logger.error(`Error updating pickup assignment: ${error.message}`, { error });
    throw error;
  }
};

/**
 * Update pickup assignment status
 * @param {string} id - Pickup assignment ID
 * @param {string} status - New status
 * @param {string} userId - User ID who updates the status
 * @param {Object} additionalData - Additional data for specific status updates
 * @returns {Promise<Object>} Updated pickup assignment
 */
const updateStatus = async (id, status, userId, additionalData = {}) => {
  try {
    const pickupAssignment = await PickupAssignment.findById(id);
    
    if (!pickupAssignment) {
      throw new Error('Pickup assignment not found');
    }
    
    // Validate status transition
    const validStatusTransitions = {
      planned: ['assigned', 'cancelled'],
      assigned: ['in_progress', 'cancelled'],
      in_progress: ['completed', 'cancelled'],
      completed: [],
      cancelled: [],
    };
    
    if (!validStatusTransitions[pickupAssignment.status].includes(status)) {
      throw new Error(`Invalid status transition from ${pickupAssignment.status} to ${status}`);
    }
    
    // Update status
    pickupAssignment.status = status;
    
    // Handle specific status updates
    switch (status) {
      case 'assigned':
        // No additional actions needed as assignment is already created
        break;
        
      case 'in_progress':
        // Record start time
        if (!pickupAssignment.execution) {
          pickupAssignment.execution = {};
        }
        pickupAssignment.execution.startTime = new Date();
        break;
        
      case 'completed':
        // Record end time
        if (!pickupAssignment.execution) {
          pickupAssignment.execution = {};
        }
        pickupAssignment.execution.endTime = new Date();
        break;
        
      case 'cancelled':
        // Add cancellation reason if provided
        if (additionalData.reason) {
          if (!pickupAssignment.execution) {
            pickupAssignment.execution = {};
          }
          pickupAssignment.execution.notes = additionalData.reason;
        }
        
        // Update pickup requests status to 'pending' if they were scheduled
        await Promise.all(pickupAssignment.pickupRequests.map(async (requestId) => {
          const pickupRequest = await PickupRequest.findById(requestId);
          if (pickupRequest && pickupRequest.status === 'scheduled') {
            pickupRequest.status = 'pending';
            pickupRequest.assignment = null;
            pickupRequest.addActivity('unassigned', userId, {
              reason: additionalData.reason || 'Assignment cancelled',
            });
            await pickupRequest.save();
          }
        }));
        break;
    }
    
    // Add status update activity
    pickupAssignment.addActivity('status_updated', userId, {
      previousStatus: pickupAssignment.status,
      newStatus: status,
      ...additionalData,
    });
    
    // Set updatedBy
    pickupAssignment.updatedBy = userId;
    
    // Save the updated pickup assignment
    await pickupAssignment.save();
    
    return pickupAssignment;
  } catch (error) {
    logger.error(`Error updating pickup assignment status: ${error.message}`, { error });
    throw error;
  }
};

/**
 * Add pickup request to assignment
 * @param {string} id - Pickup assignment ID
 * @param {string} pickupRequestId - Pickup request ID
 * @param {string} userId - User ID who adds the pickup request
 * @returns {Promise<Object>} Updated pickup assignment
 */
const addPickupRequest = async (id, pickupRequestId, userId) => {
  try {
    const pickupAssignment = await PickupAssignment.findById(id);
    
    if (!pickupAssignment) {
      throw new Error('Pickup assignment not found');
    }
    
    const pickupRequest = await PickupRequest.findById(pickupRequestId);
    
    if (!pickupRequest) {
      throw new Error('Pickup request not found');
    }
    
    // Check if pickup request is already assigned
    if (pickupRequest.status === 'scheduled' && pickupRequest.assignment) {
      throw new Error('Pickup request is already assigned');
    }
    
    // Check if pickup request is already in this assignment
    if (pickupAssignment.pickupRequests.includes(pickupRequestId)) {
      throw new Error('Pickup request is already in this assignment');
    }
    
    // Add pickup request to assignment
    pickupAssignment.pickupRequests.push(pickupRequestId);
    
    // Update pickup request status and assignment
    pickupRequest.status = 'scheduled';
    pickupRequest.assignment = {
      team: pickupAssignment.team.driver,
      vehicle: pickupAssignment.vehicle,
      assignedAt: new Date(),
      assignedBy: userId,
    };
    
    // Add activity to pickup request
    pickupRequest.addActivity('assigned', userId, {
      assignmentCode: pickupAssignment.code,
      driver: pickupAssignment.team.driver,
      vehicle: pickupAssignment.vehicle,
    });
    
    // Add activity to pickup assignment
    pickupAssignment.addActivity('pickup_request_added', userId, {
      pickupRequestId,
      pickupRequestCode: pickupRequest.code,
    });
    
    // Set updatedBy
    pickupAssignment.updatedBy = userId;
    
    // Save both documents
    await Promise.all([
      pickupAssignment.save(),
      pickupRequest.save(),
    ]);
    
    return pickupAssignment;
  } catch (error) {
    logger.error(`Error adding pickup request to assignment: ${error.message}`, { error });
    throw error;
  }
};

/**
 * Remove pickup request from assignment
 * @param {string} id - Pickup assignment ID
 * @param {string} pickupRequestId - Pickup request ID
 * @param {string} userId - User ID who removes the pickup request
 * @returns {Promise<Object>} Updated pickup assignment
 */
const removePickupRequest = async (id, pickupRequestId, userId) => {
  try {
    const pickupAssignment = await PickupAssignment.findById(id);
    
    if (!pickupAssignment) {
      throw new Error('Pickup assignment not found');
    }
    
    const pickupRequest = await PickupRequest.findById(pickupRequestId);
    
    if (!pickupRequest) {
      throw new Error('Pickup request not found');
    }
    
    // Check if pickup request is in this assignment
    if (!pickupAssignment.pickupRequests.includes(pickupRequestId)) {
      throw new Error('Pickup request is not in this assignment');
    }
    
    // Remove pickup request from assignment
    pickupAssignment.pickupRequests = pickupAssignment.pickupRequests.filter(
      id => id.toString() !== pickupRequestId
    );
    
    // Update pickup request status and assignment
    pickupRequest.status = 'pending';
    pickupRequest.assignment = null;
    
    // Add activity to pickup request
    pickupRequest.addActivity('unassigned', userId, {
      reason: 'Removed from assignment',
    });
    
    // Add activity to pickup assignment
    pickupAssignment.addActivity('pickup_request_removed', userId, {
      pickupRequestId,
      pickupRequestCode: pickupRequest.code,
    });
    
    // Set updatedBy
    pickupAssignment.updatedBy = userId;
    
    // Save both documents
    await Promise.all([
      pickupAssignment.save(),
      pickupRequest.save(),
    ]);
    
    return pickupAssignment;
  } catch (error) {
    logger.error(`Error removing pickup request from assignment: ${error.message}`, { error });
    throw error;
  }
};

/**
 * Optimize route for pickup assignment
 * @param {string} id - Pickup assignment ID
 * @param {string} userId - User ID who optimizes the route
 * @param {boolean} useGoogleMaps - Whether to use Google Maps API
 * @returns {Promise<Object>} Updated pickup assignment with optimized route
 */
const optimizeAssignmentRoute = async (id, userId, useGoogleMaps = true) => {
  try {
    const pickupAssignment = await PickupAssignment.findById(id)
      .populate('pickupRequests')
      .populate('branch');
    
    if (!pickupAssignment) {
      throw new Error('Pickup assignment not found');
    }
    
    // Check if there are pickup requests
    if (!pickupAssignment.pickupRequests || pickupAssignment.pickupRequests.length === 0) {
      throw new Error('No pickup requests to optimize');
    }
    
    // Get branch for start/end location
    const branch = pickupAssignment.branch;
    
    // Set start time (use assignment date + current time)
    const assignmentDate = new Date(pickupAssignment.assignmentDate);
    const now = new Date();
    const startTime = new Date(assignmentDate.setHours(now.getHours(), now.getMinutes()));
    
    // Optimize route
    const optimizedRoute = await routeOptimizationService.optimizeRoute(
      pickupAssignment.pickupRequests,
      branch,
      startTime,
      useGoogleMaps
    );
    
    // Update pickup assignment with optimized route
    pickupAssignment.route = {
      optimized: true,
      stops: optimizedRoute.stops.map(stop => ({
        pickupRequest: stop.pickupRequest,
        sequenceNumber: stop.sequenceNumber,
        estimatedArrival: stop.estimatedArrival,
        status: 'pending',
        distance: stop.distance,
        duration: stop.duration,
      })),
      totalDistance: optimizedRoute.totalDistance,
      totalDuration: optimizedRoute.totalDuration,
      startLocation: optimizedRoute.startLocation,
      endLocation: optimizedRoute.endLocation,
    };
    
    // Add activity
    pickupAssignment.addActivity('route_optimized', userId, {
      totalStops: optimizedRoute.stops.length,
      totalDistance: optimizedRoute.totalDistance,
      totalDuration: optimizedRoute.totalDuration,
    });
    
    // Set updatedBy
    pickupAssignment.updatedBy = userId;
    
    // Save the updated pickup assignment
    await pickupAssignment.save();
    
    return pickupAssignment;
  } catch (error) {
    logger.error(`Error optimizing assignment route: ${error.message}`, { error });
    throw error;
  }
};

/**
 * Record GPS location for pickup assignment
 * @param {string} id - Pickup assignment ID
 * @param {Object} locationData - GPS location data
 * @param {string} userId - User ID who records the location
 * @returns {Promise<Object>} Updated pickup assignment
 */
const recordGpsLocation = async (id, locationData, userId) => {
  try {
    const pickupAssignment = await PickupAssignment.findById(id);
    
    if (!pickupAssignment) {
      throw new Error('Pickup assignment not found');
    }
    
    // Check if assignment is in progress
    if (pickupAssignment.status !== 'in_progress') {
      throw new Error('Cannot record GPS location for assignment that is not in progress');
    }
    
    // Initialize execution if not exists
    if (!pickupAssignment.execution) {
      pickupAssignment.execution = {};
    }
    
    // Initialize tracking array if not exists
    if (!pickupAssignment.execution.tracking) {
      pickupAssignment.execution.tracking = [];
    }
    
    // Add GPS location to tracking
    pickupAssignment.execution.tracking.push({
      timestamp: new Date(),
      coordinates: {
        type: 'Point',
        coordinates: [locationData.longitude, locationData.latitude],
      },
      speed: locationData.speed,
      heading: locationData.heading,
      accuracy: locationData.accuracy,
      address: locationData.address,
      provider: locationData.provider || 'gps',
    });
    
    // Set updatedBy
    pickupAssignment.updatedBy = userId;
    
    // Save the updated pickup assignment
    await pickupAssignment.save();
    
    return pickupAssignment;
  } catch (error) {
    logger.error(`Error recording GPS location: ${error.message}`, { error });
    throw error;
  }
};

/**
 * Update stop status in route
 * @param {string} id - Pickup assignment ID
 * @param {string} pickupRequestId - Pickup request ID
 * @param {string} status - New status
 * @param {string} userId - User ID who updates the status
 * @param {Object} additionalData - Additional data for the status update
 * @returns {Promise<Object>} Updated pickup assignment
 */
const updateStopStatus = async (id, pickupRequestId, status, userId, additionalData = {}) => {
  try {
    const pickupAssignment = await PickupAssignment.findById(id);
    
    if (!pickupAssignment) {
      throw new Error('Pickup assignment not found');
    }
    
    // Check if route exists
    if (!pickupAssignment.route || !pickupAssignment.route.stops) {
      throw new Error('Route not found');
    }
    
    // Find the stop
    const stopIndex = pickupAssignment.route.stops.findIndex(
      stop => stop.pickupRequest.toString() === pickupRequestId
    );
    
    if (stopIndex === -1) {
      throw new Error('Stop not found in route');
    }
    
    // Validate status transition
    const validStatusTransitions = {
      pending: ['in_progress', 'skipped'],
      in_progress: ['completed', 'failed'],
      completed: [],
      skipped: [],
      failed: [],
    };
    
    const currentStatus = pickupAssignment.route.stops[stopIndex].status;
    
    if (!validStatusTransitions[currentStatus].includes(status)) {
      throw new Error(`Invalid status transition from ${currentStatus} to ${status}`);
    }
    
    // Update stop status
    pickupAssignment.route.stops[stopIndex].status = status;
    
    // Add actual arrival time if status is in_progress
    if (status === 'in_progress') {
      pickupAssignment.route.stops[stopIndex].actualArrival = new Date();
    }
    
    // Add notes if provided
    if (additionalData.notes) {
      pickupAssignment.route.stops[stopIndex].notes = additionalData.notes;
    }
    
    // Update pickup request status if needed
    const pickupRequest = await PickupRequest.findById(pickupRequestId);
    
    if (pickupRequest) {
      let pickupRequestStatus;
      
      switch (status) {
        case 'in_progress':
          pickupRequestStatus = 'in_progress';
          break;
        case 'completed':
          pickupRequestStatus = 'completed';
          break;
        case 'failed':
          pickupRequestStatus = 'failed';
          break;
        case 'skipped':
          pickupRequestStatus = 'pending'; // Reset to pending for rescheduling
          break;
      }
      
      if (pickupRequestStatus) {
        await PickupRequest.findByIdAndUpdate(pickupRequestId, {
          status: pickupRequestStatus,
          $push: {
            activityHistory: {
              action: 'status_updated',
              performedBy: userId,
              timestamp: new Date(),
              details: {
                previousStatus: pickupRequest.status,
                newStatus: pickupRequestStatus,
                assignmentCode: pickupAssignment.code,
                ...additionalData,
              },
            },
          },
        });
      }
    }
    
    // Set updatedBy
    pickupAssignment.updatedBy = userId;
    
    // Save the updated pickup assignment
    await pickupAssignment.save();
    
    return pickupAssignment;
  } catch (error) {
    logger.error(`Error updating stop status: ${error.message}`, { error });
    throw error;
  }
};

/**
 * Report issue during pickup assignment
 * @param {string} id - Pickup assignment ID
 * @param {Object} issueData - Issue data
 * @param {string} userId - User ID who reports the issue
 * @returns {Promise<Object>} Updated pickup assignment
 */
const reportIssue = async (id, issueData, userId) => {
  try {
    const pickupAssignment = await PickupAssignment.findById(id);
    
    if (!pickupAssignment) {
      throw new Error('Pickup assignment not found');
    }
    
    // Initialize execution if not exists
    if (!pickupAssignment.execution) {
      pickupAssignment.execution = {};
    }
    
    // Initialize issues array if not exists
    if (!pickupAssignment.execution.issues) {
      pickupAssignment.execution.issues = [];
    }
    
    // Add issue
    pickupAssignment.execution.issues.push({
      type: issueData.type,
      description: issueData.description,
      reportedAt: new Date(),
      reportedBy: userId,
      resolved: false,
    });
    
    // Add activity
    pickupAssignment.addActivity('issue_reported', userId, {
      issueType: issueData.type,
      description: issueData.description,
    });
    
    // Set updatedBy
    pickupAssignment.updatedBy = userId;
    
    // Save the updated pickup assignment
    await pickupAssignment.save();
    
    return pickupAssignment;
  } catch (error) {
    logger.error(`Error reporting issue: ${error.message}`, { error });
    throw error;
  }
};

/**
 * Resolve issue during pickup assignment
 * @param {string} id - Pickup assignment ID
 * @param {number} issueIndex - Issue index
 * @param {string} resolution - Resolution description
 * @param {string} userId - User ID who resolves the issue
 * @returns {Promise<Object>} Updated pickup assignment
 */
const resolveIssue = async (id, issueIndex, resolution, userId) => {
  try {
    const pickupAssignment = await PickupAssignment.findById(id);
    
    if (!pickupAssignment) {
      throw new Error('Pickup assignment not found');
    }
    
    // Check if execution and issues exist
    if (!pickupAssignment.execution || !pickupAssignment.execution.issues) {
      throw new Error('No issues found');
    }
    
    // Check if issue exists
    if (!pickupAssignment.execution.issues[issueIndex]) {
      throw new Error('Issue not found');
    }
    
    // Check if issue is already resolved
    if (pickupAssignment.execution.issues[issueIndex].resolved) {
      throw new Error('Issue is already resolved');
    }
    
    // Resolve issue
    pickupAssignment.execution.issues[issueIndex].resolved = true;
    pickupAssignment.execution.issues[issueIndex].resolvedAt = new Date();
    pickupAssignment.execution.issues[issueIndex].resolution = resolution;
    
    // Add activity
    pickupAssignment.addActivity('issue_resolved', userId, {
      issueType: pickupAssignment.execution.issues[issueIndex].type,
      resolution,
    });
    
    // Set updatedBy
    pickupAssignment.updatedBy = userId;
    
    // Save the updated pickup assignment
    await pickupAssignment.save();
    
    return pickupAssignment;
  } catch (error) {
    logger.error(`Error resolving issue: ${error.message}`, { error });
    throw error;
  }
};

/**
 * Get assignments for driver
 * @param {string} driverId - Driver ID
 * @param {Object} options - Filter options
 * @returns {Promise<Object>} Pickup assignments for driver
 */
const getDriverAssignments = async (driverId, options = {}) => {
  try {
    const {
      status,
      date,
      page = 1,
      limit = 10,
      populate = [],
    } = options;
    
    // Build query
    const query = {
      'team.driver': driverId,
    };
    
    // Add status filter if provided
    if (status) {
      query.status = status;
    }
    
    // Add date filter if provided
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      
      query.assignmentDate = {
        $gte: startDate,
        $lte: endDate,
      };
    }
    
    // Count total documents
    const total = await PickupAssignment.countDocuments(query);
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    const totalPages = Math.ceil(total / limit);
    
    // Execute query with pagination
    let pickupAssignments = await PickupAssignment.find(query)
      .sort({ assignmentDate: -1 })
      .skip(skip)
      .limit(limit);
    
    // Populate references if requested
    if (populate.length > 0) {
      pickupAssignments = await PickupAssignment.populate(pickupAssignments, populate);
    }
    
    return {
      data: pickupAssignments,
      meta: {
        total,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalPages,
      },
    };
  } catch (error) {
    logger.error(`Error getting driver assignments: ${error.message}`, { error });
    throw error;
  }
};

/**
 * Get today's assignments for branch
 * @param {string} branchId - Branch ID
 * @param {Object} options - Filter options
 * @returns {Promise<Object>} Today's pickup assignments for branch
 */
const getTodayAssignments = async (branchId, options = {}) => {
  try {
    const {
      status,
      page = 1,
      limit = 10,
      populate = [],
    } = options;
    
    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Build query
    const query = {
      branch: branchId,
      assignmentDate: {
        $gte: today,
        $lt: tomorrow,
      },
    };
    
    // Add status filter if provided
    if (status) {
      query.status = status;
    }
    
    // Count total documents
    const total = await PickupAssignment.countDocuments(query);
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    const totalPages = Math.ceil(total / limit);
    
    // Execute query with pagination
    let pickupAssignments = await PickupAssignment.find(query)
      .sort({ assignmentDate: 1 })
      .skip(skip)
      .limit(limit);
    
    // Populate references if requested
    if (populate.length > 0) {
      pickupAssignments = await PickupAssignment.populate(pickupAssignments, populate);
    }
    
    return {
      data: pickupAssignments,
      meta: {
        total,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalPages,
      },
    };
  } catch (error) {
    logger.error(`Error getting today's assignments: ${error.message}`, { error });
    throw error;
  }
};

module.exports = {
  createPickupAssignment,
  getAllPickupAssignments,
  getPickupAssignmentById,
  getPickupAssignmentByCode,
  updatePickupAssignment,
  updateStatus,
  addPickupRequest,
  removePickupRequest,
  optimizeAssignmentRoute,
  recordGpsLocation,
  updateStopStatus,
  reportIssue,
  resolveIssue,
  getDriverAssignments,
  getTodayAssignments,
};
