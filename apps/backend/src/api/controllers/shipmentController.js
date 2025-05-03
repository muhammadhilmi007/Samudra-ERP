/**
 * Samudra Paket ERP - Shipment Controller
 * Handles API endpoints for inter-branch shipments
 */

const shipmentRepository = require('../../domain/repositories/shipmentRepository');
const loadingFormRepository = require('../../domain/repositories/loadingFormRepository');
const { createApiError } = require('../../domain/utils/errorUtils');
const logger = require('../middleware/gateway/logger');

/**
 * Create a new shipment
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const createShipment = async (req, res, next) => {
  try {
    const { 
      loadingForm, 
      vehicle, 
      driver, 
      helper, 
      originBranch, 
      destinationBranch, 
      departureDate, 
      estimatedArrival, 
      distance, 
      estimatedDuration, 
      route, 
      notes 
    } = req.body;
    
    // Validate required fields
    if (!loadingForm || !vehicle || !driver || !originBranch || !destinationBranch || !departureDate || !estimatedArrival || !distance || !estimatedDuration) {
      return next(createApiError('Missing required fields', 400));
    }
    
    // Create shipment
    const shipment = await shipmentRepository.createShipment({
      loadingForm,
      vehicle,
      driver,
      helper,
      originBranch,
      destinationBranch,
      departureDate: new Date(departureDate),
      estimatedArrival: new Date(estimatedArrival),
      distance,
      estimatedDuration,
      route,
      notes,
      createdBy: req.user.id,
    });
    
    // Return success response
    return res.status(201).json({
      success: true,
      data: shipment,
    });
  } catch (error) {
    logger.error(`Error creating shipment: ${error.message}`, { error });
    return next(createApiError(error.message, 500));
  }
};

/**
 * Get all shipments with filtering and pagination
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getAllShipments = async (req, res, next) => {
  try {
    const { 
      originBranch, 
      destinationBranch, 
      vehicle, 
      driver, 
      status, 
      shipmentNo, 
      departureDateFrom, 
      departureDateTo, 
      page = 1, 
      limit = 10, 
      sortBy = 'createdAt', 
      sortOrder = 'desc' 
    } = req.query;
    
    // Build filter
    const filter = {};
    
    if (originBranch) filter.originBranch = originBranch;
    if (destinationBranch) filter.destinationBranch = destinationBranch;
    if (vehicle) filter.vehicle = vehicle;
    if (driver) filter.driver = driver;
    if (status) filter.status = status;
    if (shipmentNo) filter.shipmentNo = shipmentNo;
    if (departureDateFrom) filter.departureDateFrom = departureDateFrom;
    if (departureDateTo) filter.departureDateTo = departureDateTo;
    
    // Build options
    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sortBy,
      sortOrder,
      populate: ['loadingForm', 'vehicle', 'driver', 'helper', 'originBranch', 'destinationBranch', 'createdBy', 'updatedBy'],
    };
    
    // Get shipments
    const result = await shipmentRepository.getAllShipments(filter, options);
    
    // Return success response
    return res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    logger.error(`Error getting shipments: ${error.message}`, { error });
    return next(createApiError(error.message, 500));
  }
};

/**
 * Get shipment by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getShipmentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Get shipment
    const shipment = await shipmentRepository.getShipmentById(id, [
      'loadingForm', 
      'vehicle', 
      'driver', 
      'helper', 
      'originBranch', 
      'destinationBranch',
      'statusHistory.user',
      'issues.reportedBy',
      'issues.resolution.resolvedBy',
      'createdBy',
      'updatedBy',
    ]);
    
    // Return success response
    return res.status(200).json({
      success: true,
      data: shipment,
    });
  } catch (error) {
    logger.error(`Error getting shipment by ID: ${error.message}`, { error });
    return next(createApiError(error.message, 404));
  }
};

/**
 * Get shipment by shipment number
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getShipmentByShipmentNo = async (req, res, next) => {
  try {
    const { shipmentNo } = req.params;
    
    // Get shipment
    const shipment = await shipmentRepository.getShipmentByShipmentNo(shipmentNo, [
      'loadingForm', 
      'vehicle', 
      'driver', 
      'helper', 
      'originBranch', 
      'destinationBranch',
      'statusHistory.user',
      'issues.reportedBy',
      'issues.resolution.resolvedBy',
      'createdBy',
      'updatedBy',
    ]);
    
    // Return success response
    return res.status(200).json({
      success: true,
      data: shipment,
    });
  } catch (error) {
    logger.error(`Error getting shipment by shipment number: ${error.message}`, { error });
    return next(createApiError(error.message, 404));
  }
};

/**
 * Update shipment
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const updateShipment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { 
      vehicle, 
      driver, 
      helper, 
      departureDate, 
      estimatedArrival, 
      distance, 
      estimatedDuration, 
      route, 
      notes 
    } = req.body;
    
    // Update shipment
    const shipment = await shipmentRepository.updateShipment(id, {
      vehicle,
      driver,
      helper,
      departureDate: departureDate ? new Date(departureDate) : undefined,
      estimatedArrival: estimatedArrival ? new Date(estimatedArrival) : undefined,
      distance,
      estimatedDuration,
      route,
      notes,
      updatedBy: req.user.id,
    });
    
    // Return success response
    return res.status(200).json({
      success: true,
      data: shipment,
    });
  } catch (error) {
    logger.error(`Error updating shipment: ${error.message}`, { error });
    return next(createApiError(error.message, 400));
  }
};

/**
 * Update shipment status
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
    
    // Update status
    const shipment = await shipmentRepository.updateStatus(id, status, req.user.id, additionalData);
    
    // Return success response
    return res.status(200).json({
      success: true,
      data: shipment,
    });
  } catch (error) {
    logger.error(`Error updating shipment status: ${error.message}`, { error });
    return next(createApiError(error.message, 400));
  }
};

/**
 * Record GPS location for shipment
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const recordGpsLocation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { 
      coordinates, 
      timestamp, 
      speed, 
      heading, 
      accuracy, 
      address, 
      provider 
    } = req.body;
    
    // Validate coordinates
    if (!coordinates || !Array.isArray(coordinates) || coordinates.length !== 2) {
      return next(createApiError('Valid coordinates are required', 400));
    }
    
    // Record GPS location
    const shipment = await shipmentRepository.recordGpsLocation(id, {
      coordinates,
      timestamp: timestamp ? new Date(timestamp) : undefined,
      speed,
      heading,
      accuracy,
      address,
      provider,
    }, req.user.id);
    
    // Return success response
    return res.status(200).json({
      success: true,
      data: shipment,
    });
  } catch (error) {
    logger.error(`Error recording GPS location: ${error.message}`, { error });
    return next(createApiError(error.message, 400));
  }
};

/**
 * Update ETA for shipment
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const updateETA = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { manualETA, reason } = req.body;
    
    // Update ETA
    const shipment = await shipmentRepository.updateETA(id, req.user.id, {
      manualETA,
      reason,
    });
    
    // Return success response
    return res.status(200).json({
      success: true,
      data: shipment,
    });
  } catch (error) {
    logger.error(`Error updating ETA: ${error.message}`, { error });
    return next(createApiError(error.message, 400));
  }
};

/**
 * Add checkpoint to shipment
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const addCheckpoint = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      type, 
      location, 
      coordinates, 
      estimatedArrival, 
      estimatedDeparture, 
      notes 
    } = req.body;
    
    // Validate required fields
    if (!name || !type || !location) {
      return next(createApiError('Name, type, and location are required', 400));
    }
    
    // Add checkpoint
    const shipment = await shipmentRepository.addCheckpoint(id, {
      name,
      type,
      location,
      coordinates,
      estimatedArrival: estimatedArrival ? new Date(estimatedArrival) : undefined,
      estimatedDeparture: estimatedDeparture ? new Date(estimatedDeparture) : undefined,
      notes,
    }, req.user.id);
    
    // Return success response
    return res.status(200).json({
      success: true,
      data: shipment,
    });
  } catch (error) {
    logger.error(`Error adding checkpoint: ${error.message}`, { error });
    return next(createApiError(error.message, 400));
  }
};

/**
 * Update checkpoint status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const updateCheckpointStatus = async (req, res, next) => {
  try {
    const { id, checkpointIndex } = req.params;
    const { 
      status, 
      arrivalTime, 
      departureTime, 
      notes 
    } = req.body;
    
    // Validate status
    if (!status) {
      return next(createApiError('Status is required', 400));
    }
    
    // Update checkpoint status
    const shipment = await shipmentRepository.updateCheckpointStatus(
      id, 
      parseInt(checkpointIndex, 10), 
      status, 
      req.user.id, 
      {
        arrivalTime: arrivalTime ? new Date(arrivalTime) : undefined,
        departureTime: departureTime ? new Date(departureTime) : undefined,
        notes,
      }
    );
    
    // Return success response
    return res.status(200).json({
      success: true,
      data: shipment,
    });
  } catch (error) {
    logger.error(`Error updating checkpoint status: ${error.message}`, { error });
    return next(createApiError(error.message, 400));
  }
};

/**
 * Report issue during shipment
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const reportIssue = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { 
      type, 
      description, 
      location, 
      coordinates, 
      severity 
    } = req.body;
    
    // Validate required fields
    if (!type || !description || !severity) {
      return next(createApiError('Type, description, and severity are required', 400));
    }
    
    // Report issue
    const shipment = await shipmentRepository.reportIssue(id, {
      type,
      description,
      location,
      coordinates,
      severity,
    }, req.user.id);
    
    // Return success response
    return res.status(200).json({
      success: true,
      data: shipment,
    });
  } catch (error) {
    logger.error(`Error reporting issue: ${error.message}`, { error });
    return next(createApiError(error.message, 400));
  }
};

/**
 * Resolve issue during shipment
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const resolveIssue = async (req, res, next) => {
  try {
    const { id, issueIndex } = req.params;
    const { description } = req.body;
    
    // Validate required fields
    if (!description) {
      return next(createApiError('Resolution description is required', 400));
    }
    
    // Resolve issue
    const shipment = await shipmentRepository.resolveIssue(
      id, 
      parseInt(issueIndex, 10), 
      {
        description,
      }, 
      req.user.id
    );
    
    // Return success response
    return res.status(200).json({
      success: true,
      data: shipment,
    });
  } catch (error) {
    logger.error(`Error resolving issue: ${error.message}`, { error });
    return next(createApiError(error.message, 400));
  }
};

/**
 * Get active shipments for branch
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getActiveBranchShipments = async (req, res, next) => {
  try {
    const { branchId } = req.params;
    const { role = 'both' } = req.query;
    
    // Get active shipments
    const shipments = await shipmentRepository.getActiveBranchShipments(branchId, role);
    
    // Return success response
    return res.status(200).json({
      success: true,
      data: shipments,
    });
  } catch (error) {
    logger.error(`Error getting active branch shipments: ${error.message}`, { error });
    return next(createApiError(error.message, 400));
  }
};

/**
 * Get shipments for coordination between branches
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getShipmentsBetweenBranches = async (req, res, next) => {
  try {
    const { originBranchId, destinationBranchId } = req.params;
    const { status, startDate, endDate } = req.query;
    
    // Get shipments between branches
    const shipments = await shipmentRepository.getShipmentsBetweenBranches(
      originBranchId, 
      destinationBranchId, 
      {
        status,
        startDate,
        endDate,
      }
    );
    
    // Return success response
    return res.status(200).json({
      success: true,
      data: shipments,
    });
  } catch (error) {
    logger.error(`Error getting shipments between branches: ${error.message}`, { error });
    return next(createApiError(error.message, 400));
  }
};

/**
 * Get today's shipments
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getTodayShipments = async (req, res, next) => {
  try {
    const { branchId, role, status } = req.query;
    
    // Get today's shipments
    const shipments = await shipmentRepository.getTodayShipments({
      branchId,
      role,
      status,
    });
    
    // Return success response
    return res.status(200).json({
      success: true,
      data: shipments,
    });
  } catch (error) {
    logger.error(`Error getting today's shipments: ${error.message}`, { error });
    return next(createApiError(error.message, 400));
  }
};

/**
 * Get shipments eligible for delivery
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getShipmentsForDelivery = async (req, res, next) => {
  try {
    const { branchId } = req.params;
    
    // Get shipments with status 'arrived_at_destination'
    const shipments = await shipmentRepository.getAllShipments(
      {
        destinationBranch: branchId,
        status: 'arrived_at_destination',
      },
      {
        populate: ['loadingForm', 'vehicle', 'driver', 'originBranch'],
        sortBy: 'actualArrival',
        sortOrder: 'asc',
      }
    );
    
    // Return success response
    return res.status(200).json({
      success: true,
      data: shipments.data,
    });
  } catch (error) {
    logger.error(`Error getting shipments for delivery: ${error.message}`, { error });
    return next(createApiError(error.message, 400));
  }
};

module.exports = {
  createShipment,
  getAllShipments,
  getShipmentById,
  getShipmentByShipmentNo,
  updateShipment,
  updateStatus,
  recordGpsLocation,
  updateETA,
  addCheckpoint,
  updateCheckpointStatus,
  reportIssue,
  resolveIssue,
  getActiveBranchShipments,
  getShipmentsBetweenBranches,
  getTodayShipments,
  getShipmentsForDelivery,
};
