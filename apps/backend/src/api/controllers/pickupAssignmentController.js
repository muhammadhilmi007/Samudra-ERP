/**
 * Samudra Paket ERP - Pickup Assignment Controller
 * Handles API endpoints for pickup assignments
 */

const pickupAssignmentRepository = require('../../domain/repositories/pickupAssignmentRepository');
const pickupRequestRepository = require('../../domain/repositories/pickupRequestRepository');
const { createApiError } = require('../../domain/utils/errorUtils');
const logger = require('../middleware/gateway/logger');

/**
 * Create a new pickup assignment
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const createPickupAssignment = async (req, res, next) => {
  try {
    const { branch, assignmentDate, team, vehicle, pickupRequests } = req.body;
    
    // Validate required fields
    if (!branch || !assignmentDate || !team || !team.driver || !vehicle) {
      return next(createApiError('Missing required fields', 400));
    }
    
    // Create pickup assignment
    const pickupAssignment = await pickupAssignmentRepository.createPickupAssignment({
      branch,
      assignmentDate: new Date(assignmentDate),
      team,
      vehicle,
      pickupRequests: pickupRequests || [],
      createdBy: req.user.id,
    });
    
    // Return success response
    return res.status(201).json({
      success: true,
      data: pickupAssignment,
    });
  } catch (error) {
    logger.error(`Error creating pickup assignment: ${error.message}`, { error });
    return next(createApiError(error.message, 500));
  }
};

/**
 * Get all pickup assignments with filtering and pagination
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getAllPickupAssignments = async (req, res, next) => {
  try {
    const {
      branch,
      driver,
      vehicle,
      status,
      assignmentDateFrom,
      assignmentDateTo,
      sortBy,
      sortOrder,
      page,
      limit,
    } = req.query;
    
    // Get pickup assignments
    const result = await pickupAssignmentRepository.getAllPickupAssignments({}, {
      branch,
      driver,
      vehicle,
      status,
      assignmentDateFrom,
      assignmentDateTo,
      sortBy,
      sortOrder,
      page: parseInt(page, 10) || 1,
      limit: parseInt(limit, 10) || 10,
      populate: ['branch', 'team.driver', 'team.helpers', 'vehicle', 'pickupRequests'],
    });
    
    // Return success response
    return res.status(200).json({
      success: true,
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    logger.error(`Error getting pickup assignments: ${error.message}`, { error });
    return next(createApiError(error.message, 500));
  }
};

/**
 * Get pickup assignment by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getPickupAssignmentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Get pickup assignment
    const pickupAssignment = await pickupAssignmentRepository.getPickupAssignmentById(id, [
      'branch',
      'team.driver',
      'team.helpers',
      'vehicle',
      'pickupRequests',
      {
        path: 'route.stops.pickupRequest',
        select: 'code customer pickupAddress contactPerson scheduledTimeWindow',
      },
    ]);
    
    // Check if pickup assignment exists
    if (!pickupAssignment) {
      return next(createApiError('Pickup assignment not found', 404));
    }
    
    // Return success response
    return res.status(200).json({
      success: true,
      data: pickupAssignment,
    });
  } catch (error) {
    logger.error(`Error getting pickup assignment by ID: ${error.message}`, { error });
    return next(createApiError(error.message, 500));
  }
};

/**
 * Get pickup assignment by code
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getPickupAssignmentByCode = async (req, res, next) => {
  try {
    const { code } = req.params;
    
    // Get pickup assignment
    const pickupAssignment = await pickupAssignmentRepository.getPickupAssignmentByCode(code, [
      'branch',
      'team.driver',
      'team.helpers',
      'vehicle',
      'pickupRequests',
      {
        path: 'route.stops.pickupRequest',
        select: 'code customer pickupAddress contactPerson scheduledTimeWindow',
      },
    ]);
    
    // Check if pickup assignment exists
    if (!pickupAssignment) {
      return next(createApiError('Pickup assignment not found', 404));
    }
    
    // Return success response
    return res.status(200).json({
      success: true,
      data: pickupAssignment,
    });
  } catch (error) {
    logger.error(`Error getting pickup assignment by code: ${error.message}`, { error });
    return next(createApiError(error.message, 500));
  }
};

/**
 * Update pickup assignment
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const updatePickupAssignment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Add updatedBy field
    updateData.updatedBy = req.user.id;
    
    // Update pickup assignment
    const pickupAssignment = await pickupAssignmentRepository.updatePickupAssignment(id, updateData);
    
    // Check if pickup assignment exists
    if (!pickupAssignment) {
      return next(createApiError('Pickup assignment not found', 404));
    }
    
    // Return success response
    return res.status(200).json({
      success: true,
      data: pickupAssignment,
    });
  } catch (error) {
    logger.error(`Error updating pickup assignment: ${error.message}`, { error });
    return next(createApiError(error.message, 500));
  }
};

/**
 * Update pickup assignment status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, ...additionalData } = req.body;
    
    // Validate status
    if (!status) {
      return next(createApiError('Status is required', 400));
    }
    
    // Update pickup assignment status
    const pickupAssignment = await pickupAssignmentRepository.updateStatus(
      id,
      status,
      req.user.id,
      additionalData
    );
    
    // Return success response
    return res.status(200).json({
      success: true,
      data: pickupAssignment,
    });
  } catch (error) {
    logger.error(`Error updating pickup assignment status: ${error.message}`, { error });
    return next(createApiError(error.message, 500));
  }
};

/**
 * Add pickup request to assignment
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const addPickupRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { pickupRequestId } = req.body;
    
    // Validate pickup request ID
    if (!pickupRequestId) {
      return next(createApiError('Pickup request ID is required', 400));
    }
    
    // Add pickup request to assignment
    const pickupAssignment = await pickupAssignmentRepository.addPickupRequest(
      id,
      pickupRequestId,
      req.user.id
    );
    
    // Return success response
    return res.status(200).json({
      success: true,
      data: pickupAssignment,
    });
  } catch (error) {
    logger.error(`Error adding pickup request to assignment: ${error.message}`, { error });
    return next(createApiError(error.message, 500));
  }
};

/**
 * Remove pickup request from assignment
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const removePickupRequest = async (req, res, next) => {
  try {
    const { id, pickupRequestId } = req.params;
    
    // Remove pickup request from assignment
    const pickupAssignment = await pickupAssignmentRepository.removePickupRequest(
      id,
      pickupRequestId,
      req.user.id
    );
    
    // Return success response
    return res.status(200).json({
      success: true,
      data: pickupAssignment,
    });
  } catch (error) {
    logger.error(`Error removing pickup request from assignment: ${error.message}`, { error });
    return next(createApiError(error.message, 500));
  }
};

/**
 * Optimize route for pickup assignment
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const optimizeRoute = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { useGoogleMaps } = req.body;
    
    // Optimize route
    const pickupAssignment = await pickupAssignmentRepository.optimizeAssignmentRoute(
      id,
      req.user.id,
      useGoogleMaps
    );
    
    // Return success response
    return res.status(200).json({
      success: true,
      data: pickupAssignment,
    });
  } catch (error) {
    logger.error(`Error optimizing route: ${error.message}`, { error });
    return next(createApiError(error.message, 500));
  }
};

/**
 * Record GPS location for pickup assignment
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const recordGpsLocation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const locationData = req.body;
    
    // Validate location data
    if (!locationData.latitude || !locationData.longitude) {
      return next(createApiError('Latitude and longitude are required', 400));
    }
    
    // Record GPS location
    const pickupAssignment = await pickupAssignmentRepository.recordGpsLocation(
      id,
      locationData,
      req.user.id
    );
    
    // Return success response
    return res.status(200).json({
      success: true,
      data: pickupAssignment,
    });
  } catch (error) {
    logger.error(`Error recording GPS location: ${error.message}`, { error });
    return next(createApiError(error.message, 500));
  }
};

/**
 * Update stop status in route
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const updateStopStatus = async (req, res, next) => {
  try {
    const { id, pickupRequestId } = req.params;
    const { status, ...additionalData } = req.body;
    
    // Validate status
    if (!status) {
      return next(createApiError('Status is required', 400));
    }
    
    // Update stop status
    const pickupAssignment = await pickupAssignmentRepository.updateStopStatus(
      id,
      pickupRequestId,
      status,
      req.user.id,
      additionalData
    );
    
    // Return success response
    return res.status(200).json({
      success: true,
      data: pickupAssignment,
    });
  } catch (error) {
    logger.error(`Error updating stop status: ${error.message}`, { error });
    return next(createApiError(error.message, 500));
  }
};

/**
 * Report issue during pickup assignment
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const reportIssue = async (req, res, next) => {
  try {
    const { id } = req.params;
    const issueData = req.body;
    
    // Validate issue data
    if (!issueData.type || !issueData.description) {
      return next(createApiError('Issue type and description are required', 400));
    }
    
    // Report issue
    const pickupAssignment = await pickupAssignmentRepository.reportIssue(
      id,
      issueData,
      req.user.id
    );
    
    // Return success response
    return res.status(200).json({
      success: true,
      data: pickupAssignment,
    });
  } catch (error) {
    logger.error(`Error reporting issue: ${error.message}`, { error });
    return next(createApiError(error.message, 500));
  }
};

/**
 * Resolve issue during pickup assignment
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const resolveIssue = async (req, res, next) => {
  try {
    const { id, issueIndex } = req.params;
    const { resolution } = req.body;
    
    // Validate resolution
    if (!resolution) {
      return next(createApiError('Resolution is required', 400));
    }
    
    // Resolve issue
    const pickupAssignment = await pickupAssignmentRepository.resolveIssue(
      id,
      parseInt(issueIndex, 10),
      resolution,
      req.user.id
    );
    
    // Return success response
    return res.status(200).json({
      success: true,
      data: pickupAssignment,
    });
  } catch (error) {
    logger.error(`Error resolving issue: ${error.message}`, { error });
    return next(createApiError(error.message, 500));
  }
};

/**
 * Get assignments for driver
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getDriverAssignments = async (req, res, next) => {
  try {
    const { driverId } = req.params;
    const { status, date, page, limit } = req.query;
    
    // Get driver assignments
    const result = await pickupAssignmentRepository.getDriverAssignments(driverId, {
      status,
      date,
      page: parseInt(page, 10) || 1,
      limit: parseInt(limit, 10) || 10,
      populate: ['branch', 'vehicle', 'pickupRequests'],
    });
    
    // Return success response
    return res.status(200).json({
      success: true,
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    logger.error(`Error getting driver assignments: ${error.message}`, { error });
    return next(createApiError(error.message, 500));
  }
};

/**
 * Get today's assignments for branch
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getTodayAssignments = async (req, res, next) => {
  try {
    const { branchId } = req.params;
    const { status, page, limit } = req.query;
    
    // Get today's assignments
    const result = await pickupAssignmentRepository.getTodayAssignments(branchId, {
      status,
      page: parseInt(page, 10) || 1,
      limit: parseInt(limit, 10) || 10,
      populate: ['team.driver', 'team.helpers', 'vehicle', 'pickupRequests'],
    });
    
    // Return success response
    return res.status(200).json({
      success: true,
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    logger.error(`Error getting today's assignments: ${error.message}`, { error });
    return next(createApiError(error.message, 500));
  }
};

/**
 * Get unassigned pickup requests for branch
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getUnassignedPickupRequests = async (req, res, next) => {
  try {
    const { branchId } = req.params;
    const { date, page, limit } = req.query;
    
    // Get unassigned pickup requests
    const result = await pickupRequestRepository.getAllPickupRequests(
      { branch: branchId, status: 'pending' },
      {
        scheduledDate: date,
        page: parseInt(page, 10) || 1,
        limit: parseInt(limit, 10) || 10,
        populate: ['customer'],
      }
    );
    
    // Return success response
    return res.status(200).json({
      success: true,
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    logger.error(`Error getting unassigned pickup requests: ${error.message}`, { error });
    return next(createApiError(error.message, 500));
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
  optimizeRoute,
  recordGpsLocation,
  updateStopStatus,
  reportIssue,
  resolveIssue,
  getDriverAssignments,
  getTodayAssignments,
  getUnassignedPickupRequests,
};
