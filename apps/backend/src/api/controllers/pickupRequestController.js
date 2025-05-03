/**
 * Samudra Paket ERP - Pickup Request Controller
 * Handles API requests for pickup request management
 */

const pickupRequestRepository = require('../../domain/repositories/pickupRequestRepository');
const { createApiError } = require('../../domain/utils/errorUtils');
const { logger } = require('../middleware/gateway/logger');

/**
 * Create a new pickup request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
exports.createPickupRequest = async (req, res, next) => {
  try {
    logger.info('Creating pickup request', { data: req.body });
    
    // Add the current user as the createdBy
    const pickupData = {
      ...req.body,
      createdBy: req.user.id,
    };
    
    // Validate service area coverage if address is provided
    if (pickupData.pickupAddress && pickupData.branch) {
      const validationResult = await pickupRequestRepository.validateServiceAreaCoverage(
        pickupData.pickupAddress,
        pickupData.branch
      );
      
      if (!validationResult.valid) {
        logger.info('Service area validation failed', validationResult);
        return res.status(400).json(
          createApiError('INVALID_ADDRESS', validationResult.message, {
            nearestServiceAreas: validationResult.nearestServiceAreas
          })
        );
      }
    }
    
    // Create pickup request
    const pickupRequest = await pickupRequestRepository.createPickupRequest(pickupData);
    
    // Add creation activity to history
    await pickupRequestRepository.addPickupRequestActivity(
      pickupRequest._id,
      'created',
      req.user.id,
      { details: 'Pickup request created' },
    );
    
    logger.info('Pickup request created successfully', { id: pickupRequest._id });
    
    res.status(201).json({
      success: true,
      data: pickupRequest,
      message: 'Pickup request created successfully',
    });
  } catch (error) {
    logger.error('Error creating pickup request', { error });
    
    if (error.name === 'ValidationError') {
      return res.status(400).json(
        createApiError('VALIDATION_ERROR', error.message)
      );
    }
    if (error.code === 11000) {
      return res.status(409).json(
        createApiError('CONFLICT', 'Pickup request code already exists')
      );
    }
    
    next(error);
  }
};

/**
 * Get all pickup requests
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
exports.getAllPickupRequests = async (req, res, next) => {
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
      populate = '',
    } = req.query;
    
    // Convert populate string to array if provided
    const populateArray = populate ? populate.split(',') : [];
    
    // Get pickup requests with filters and pagination
    const result = await pickupRequestRepository.getAllPickupRequests(
      {},
      {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sortBy,
        sortOrder,
        status,
        branch,
        customer,
        scheduledDateFrom,
        scheduledDateTo,
        priority,
        team,
        search,
        populate: populateArray,
      },
    );
    
    res.status(200).json({
      success: true,
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    logger.error('Error getting pickup requests', { error });
    next(error);
  }
};

/**
 * Get pickup request by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
exports.getPickupRequestById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { populate = '' } = req.query;
    
    // Convert populate string to array if provided
    const populateArray = populate ? populate.split(',') : [];
    
    const pickupRequest = await pickupRequestRepository.getPickupRequestById(id, populateArray);
    
    if (!pickupRequest) {
      return res.status(404).json(
        createApiError('NOT_FOUND', 'Pickup request not found')
      );
    }
    
    res.status(200).json({
      success: true,
      data: pickupRequest,
    });
  } catch (error) {
    logger.error('Error getting pickup request by ID', { error, id: req.params.id });
    
    if (error.name === 'CastError') {
      return res.status(400).json(
        createApiError('INVALID_ID', 'Invalid pickup request ID format')
      );
    }
    
    next(error);
  }
};

/**
 * Get pickup request by code
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
exports.getPickupRequestByCode = async (req, res, next) => {
  try {
    const { code } = req.params;
    const { populate = '' } = req.query;
    
    // Convert populate string to array if provided
    const populateArray = populate ? populate.split(',') : [];
    
    const pickupRequest = await pickupRequestRepository.getPickupRequestByCode(code, populateArray);
    
    if (!pickupRequest) {
      return res.status(404).json(
        createApiError('NOT_FOUND', 'Pickup request not found')
      );
    }
    
    res.status(200).json({
      success: true,
      data: pickupRequest,
    });
  } catch (error) {
    logger.error('Error getting pickup request by code', { error, code: req.params.code });
    next(error);
  }
};

/**
 * Update pickup request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
exports.updatePickupRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updatedBy: req.user.id,
    };
    
    // Validate service area coverage if address is updated
    if (updateData.pickupAddress && updateData.branch) {
      const validationResult = await pickupRequestRepository.validateServiceAreaCoverage(
        updateData.pickupAddress,
        updateData.branch
      );
      
      if (!validationResult.valid) {
        return res.status(400).json(
          createApiError('INVALID_ADDRESS', validationResult.message, {
            nearestServiceAreas: validationResult.nearestServiceAreas
          })
        );
      }
    }
    
    const pickupRequest = await pickupRequestRepository.updatePickupRequest(id, updateData);
    
    if (!pickupRequest) {
      return res.status(404).json(
        createApiError('NOT_FOUND', 'Pickup request not found')
      );
    }
    
    res.status(200).json({
      success: true,
      data: pickupRequest,
      message: 'Pickup request updated successfully',
    });
  } catch (error) {
    logger.error('Error updating pickup request', { error, id: req.params.id });
    
    if (error.name === 'ValidationError') {
      return res.status(400).json(
        createApiError('VALIDATION_ERROR', error.message)
      );
    }
    if (error.name === 'CastError') {
      return res.status(400).json(
        createApiError('INVALID_ID', 'Invalid pickup request ID format')
      );
    }
    
    next(error);
  }
};

/**
 * Update pickup request status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
exports.updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, details = {} } = req.body;
    
    if (!status) {
      return res.status(400).json(
        createApiError('MISSING_FIELD', 'Status is required')
      );
    }
    
    const pickupRequest = await pickupRequestRepository.updateStatus(
      id,
      status,
      req.user.id,
      details
    );
    
    if (!pickupRequest) {
      return res.status(404).json(
        createApiError('NOT_FOUND', 'Pickup request not found')
      );
    }
    
    res.status(200).json({
      success: true,
      data: pickupRequest,
      message: `Pickup request status updated to ${status}`,
    });
  } catch (error) {
    logger.error('Error updating pickup request status', { error, id: req.params.id });
    
    if (error.message === 'Pickup request not found') {
      return res.status(404).json(
        createApiError('NOT_FOUND', 'Pickup request not found')
      );
    }
    if (error.name === 'CastError') {
      return res.status(400).json(
        createApiError('INVALID_ID', 'Invalid pickup request ID format')
      );
    }
    
    next(error);
  }
};

/**
 * Assign pickup request to team and vehicle
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
exports.assignPickupRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { teamId, vehicleId } = req.body;
    
    if (!teamId || !vehicleId) {
      return res.status(400).json(
        createApiError('MISSING_FIELD', 'Team ID and Vehicle ID are required')
      );
    }
    
    const pickupRequest = await pickupRequestRepository.assignPickupRequest(
      id,
      teamId,
      vehicleId,
      req.user.id
    );
    
    if (!pickupRequest) {
      return res.status(404).json(
        createApiError('NOT_FOUND', 'Pickup request not found')
      );
    }
    
    res.status(200).json({
      success: true,
      data: pickupRequest,
      message: 'Pickup request assigned successfully',
    });
  } catch (error) {
    logger.error('Error assigning pickup request', { error, id: req.params.id });
    
    if (error.message === 'Pickup request not found') {
      return res.status(404).json(
        createApiError('NOT_FOUND', 'Pickup request not found')
      );
    }
    if (error.name === 'CastError') {
      return res.status(400).json(
        createApiError('INVALID_ID', 'Invalid pickup request ID format')
      );
    }
    
    next(error);
  }
};

/**
 * Record pickup execution details
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
exports.recordExecution = async (req, res, next) => {
  try {
    const { id } = req.params;
    const executionData = req.body;
    
    const pickupRequest = await pickupRequestRepository.recordExecution(
      id,
      executionData,
      req.user.id
    );
    
    if (!pickupRequest) {
      return res.status(404).json(
        createApiError('NOT_FOUND', 'Pickup request not found')
      );
    }
    
    res.status(200).json({
      success: true,
      data: pickupRequest,
      message: 'Pickup execution details recorded successfully',
    });
  } catch (error) {
    logger.error('Error recording pickup execution', { error, id: req.params.id });
    
    if (error.message === 'Pickup request not found') {
      return res.status(404).json(
        createApiError('NOT_FOUND', 'Pickup request not found')
      );
    }
    if (error.name === 'CastError') {
      return res.status(400).json(
        createApiError('INVALID_ID', 'Invalid pickup request ID format')
      );
    }
    
    next(error);
  }
};

/**
 * Reschedule pickup request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
exports.reschedulePickupRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { newDate, newTimeWindow, reason } = req.body;
    
    if (!newDate || !newTimeWindow) {
      return res.status(400).json(
        createApiError('MISSING_FIELD', 'New date and time window are required')
      );
    }
    
    const pickupRequest = await pickupRequestRepository.reschedulePickupRequest(
      id,
      new Date(newDate),
      newTimeWindow,
      reason,
      req.user.id
    );
    
    if (!pickupRequest) {
      return res.status(404).json(
        createApiError('NOT_FOUND', 'Pickup request not found')
      );
    }
    
    res.status(200).json({
      success: true,
      data: pickupRequest,
      message: 'Pickup request rescheduled successfully',
    });
  } catch (error) {
    logger.error('Error rescheduling pickup request', { error, id: req.params.id });
    
    if (error.message === 'Pickup request not found') {
      return res.status(404).json(
        createApiError('NOT_FOUND', 'Pickup request not found')
      );
    }
    if (error.name === 'CastError') {
      return res.status(400).json(
        createApiError('INVALID_ID', 'Invalid pickup request ID format')
      );
    }
    
    next(error);
  }
};

/**
 * Cancel pickup request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
exports.cancelPickupRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    const pickupRequest = await pickupRequestRepository.cancelPickupRequest(
      id,
      reason,
      req.user.id
    );
    
    if (!pickupRequest) {
      return res.status(404).json(
        createApiError('NOT_FOUND', 'Pickup request not found')
      );
    }
    
    res.status(200).json({
      success: true,
      data: pickupRequest,
      message: 'Pickup request cancelled successfully',
    });
  } catch (error) {
    logger.error('Error cancelling pickup request', { error, id: req.params.id });
    
    if (error.message === 'Pickup request not found') {
      return res.status(404).json(
        createApiError('NOT_FOUND', 'Pickup request not found')
      );
    }
    if (error.name === 'CastError') {
      return res.status(400).json(
        createApiError('INVALID_ID', 'Invalid pickup request ID format')
      );
    }
    
    next(error);
  }
};

/**
 * Report issue with pickup request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
exports.reportIssue = async (req, res, next) => {
  try {
    const { id } = req.params;
    const issueData = req.body;
    
    if (!issueData.type || !issueData.description) {
      return res.status(400).json(
        createApiError('MISSING_FIELD', 'Issue type and description are required')
      );
    }
    
    const pickupRequest = await pickupRequestRepository.reportIssue(
      id,
      issueData,
      req.user.id
    );
    
    if (!pickupRequest) {
      return res.status(404).json(
        createApiError('NOT_FOUND', 'Pickup request not found')
      );
    }
    
    res.status(200).json({
      success: true,
      data: pickupRequest,
      message: 'Issue reported successfully',
    });
  } catch (error) {
    logger.error('Error reporting issue', { error, id: req.params.id });
    
    if (error.message === 'Pickup request not found') {
      return res.status(404).json(
        createApiError('NOT_FOUND', 'Pickup request not found')
      );
    }
    if (error.name === 'CastError') {
      return res.status(400).json(
        createApiError('INVALID_ID', 'Invalid pickup request ID format')
      );
    }
    
    next(error);
  }
};

/**
 * Resolve issue with pickup request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
exports.resolveIssue = async (req, res, next) => {
  try {
    const { id, issueIndex } = req.params;
    const { resolution } = req.body;
    
    if (!resolution) {
      return res.status(400).json(
        createApiError('MISSING_FIELD', 'Resolution is required')
      );
    }
    
    const pickupRequest = await pickupRequestRepository.resolveIssue(
      id,
      parseInt(issueIndex, 10),
      resolution,
      req.user.id
    );
    
    if (!pickupRequest) {
      return res.status(404).json(
        createApiError('NOT_FOUND', 'Pickup request not found')
      );
    }
    
    res.status(200).json({
      success: true,
      data: pickupRequest,
      message: 'Issue resolved successfully',
    });
  } catch (error) {
    logger.error('Error resolving issue', { error, id: req.params.id });
    
    if (error.message === 'Pickup request not found') {
      return res.status(404).json(
        createApiError('NOT_FOUND', 'Pickup request not found')
      );
    }
    if (error.message === 'Issue not found') {
      return res.status(404).json(
        createApiError('NOT_FOUND', 'Issue not found')
      );
    }
    if (error.name === 'CastError') {
      return res.status(400).json(
        createApiError('INVALID_ID', 'Invalid pickup request ID format')
      );
    }
    
    next(error);
  }
};

/**
 * Get pickup request activity history
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
exports.getPickupRequestActivityHistory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10, sortOrder = 'desc' } = req.query;
    
    const result = await pickupRequestRepository.getPickupRequestActivityHistory(id, {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sortOrder,
    });
    
    res.status(200).json({
      success: true,
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    logger.error('Error getting pickup request activity history', { error, id: req.params.id });
    
    if (error.message === 'Pickup request not found') {
      return res.status(404).json(
        createApiError('NOT_FOUND', 'Pickup request not found')
      );
    }
    if (error.name === 'CastError') {
      return res.status(400).json(
        createApiError('INVALID_ID', 'Invalid pickup request ID format')
      );
    }
    
    next(error);
  }
};

/**
 * Validate service area coverage
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
exports.validateServiceAreaCoverage = async (req, res, next) => {
  try {
    const { address, branchId } = req.body;
    
    if (!address || !branchId) {
      return res.status(400).json(
        createApiError('MISSING_FIELD', 'Address and branch ID are required')
      );
    }
    
    const result = await pickupRequestRepository.validateServiceAreaCoverage(address, branchId);
    
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Error validating service area coverage', { error });
    
    if (error.message === 'Branch not found') {
      return res.status(404).json(
        createApiError('NOT_FOUND', 'Branch not found')
      );
    }
    if (error.name === 'CastError') {
      return res.status(400).json(
        createApiError('INVALID_ID', 'Invalid branch ID format')
      );
    }
    
    next(error);
  }
};

/**
 * Get today's pickup requests
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
exports.getTodayPickupRequests = async (req, res, next) => {
  try {
    const { branchId } = req.params;
    const { page = 1, limit = 10, sortBy = 'scheduledDate', sortOrder = 'asc', populate = '' } = req.query;
    
    // Convert populate string to array if provided
    const populateArray = populate ? populate.split(',') : [];
    
    const result = await pickupRequestRepository.getTodayPickupRequests(
      branchId,
      {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sortBy,
        sortOrder,
        populate: populateArray,
      }
    );
    
    res.status(200).json({
      success: true,
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    logger.error('Error getting today pickup requests', { error, branchId: req.params.branchId });
    
    if (error.name === 'CastError') {
      return res.status(400).json(
        createApiError('INVALID_ID', 'Invalid branch ID format')
      );
    }
    
    next(error);
  }
};

/**
 * Get pickup requests by team
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
exports.getTeamPickupRequests = async (req, res, next) => {
  try {
    const { teamId } = req.params;
    const { page = 1, limit = 10, sortBy = 'scheduledDate', sortOrder = 'asc', populate = '' } = req.query;
    
    // Convert populate string to array if provided
    const populateArray = populate ? populate.split(',') : [];
    
    const result = await pickupRequestRepository.getTeamPickupRequests(
      teamId,
      {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sortBy,
        sortOrder,
        populate: populateArray,
      }
    );
    
    res.status(200).json({
      success: true,
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    logger.error('Error getting team pickup requests', { error, teamId: req.params.teamId });
    
    if (error.name === 'CastError') {
      return res.status(400).json(
        createApiError('INVALID_ID', 'Invalid team ID format')
      );
    }
    
    next(error);
  }
};

/**
 * Search pickup requests
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
exports.searchPickupRequests = async (req, res, next) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json(
        createApiError('MISSING_FIELD', 'Search query is required')
      );
    }
    
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      populate = '',
    } = req.query;
    
    // Convert populate string to array if provided
    const populateArray = populate ? populate.split(',') : [];
    
    const result = await pickupRequestRepository.searchPickupRequests(
      query,
      {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sortBy,
        sortOrder,
        populate: populateArray,
      }
    );
    
    res.status(200).json({
      success: true,
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    logger.error('Error searching pickup requests', { error, query: req.query.query });
    next(error);
  }
};
