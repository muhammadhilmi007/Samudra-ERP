/**
 * Samudra Paket ERP - Loading Form Controller
 * Handles API endpoints for loading forms
 */

const loadingFormRepository = require('../../domain/repositories/loadingFormRepository');
const shipmentOrderRepository = require('../../domain/repositories/shipmentOrderRepository');
const { createApiError } = require('../../domain/utils/errorUtils');
const logger = require('../middleware/gateway/logger');

/**
 * Create a new loading form
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const createLoadingForm = async (req, res, next) => {
  try {
    const { 
      branch, 
      vehicle, 
      driver, 
      helper, 
      originBranch, 
      destinationBranch, 
      loadingDate, 
      scheduledDeparture, 
      notes 
    } = req.body;
    
    // Validate required fields
    if (!branch || !vehicle || !driver || !originBranch || !destinationBranch || !loadingDate || !scheduledDeparture) {
      return next(createApiError('Missing required fields', 400));
    }
    
    // Create loading form
    const loadingForm = await loadingFormRepository.createLoadingForm({
      branch,
      vehicle,
      driver,
      helper,
      originBranch,
      destinationBranch,
      loadingDate: new Date(loadingDate),
      scheduledDeparture: new Date(scheduledDeparture),
      notes,
      createdBy: req.user.id,
    });
    
    // Return success response
    return res.status(201).json({
      success: true,
      data: loadingForm,
    });
  } catch (error) {
    logger.error(`Error creating loading form: ${error.message}`, { error });
    return next(createApiError(error.message, 500));
  }
};

/**
 * Get all loading forms with filtering and pagination
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getAllLoadingForms = async (req, res, next) => {
  try {
    const { 
      branch, 
      originBranch, 
      destinationBranch, 
      vehicle, 
      driver, 
      status, 
      loadingNo, 
      loadingDateFrom, 
      loadingDateTo, 
      page = 1, 
      limit = 10, 
      sortBy = 'createdAt', 
      sortOrder = 'desc' 
    } = req.query;
    
    // Build filter
    const filter = {};
    
    if (branch) filter.branch = branch;
    if (originBranch) filter.originBranch = originBranch;
    if (destinationBranch) filter.destinationBranch = destinationBranch;
    if (vehicle) filter.vehicle = vehicle;
    if (driver) filter.driver = driver;
    if (status) filter.status = status;
    if (loadingNo) filter.loadingNo = loadingNo;
    if (loadingDateFrom) filter.loadingDateFrom = loadingDateFrom;
    if (loadingDateTo) filter.loadingDateTo = loadingDateTo;
    
    // Build options
    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sortBy,
      sortOrder,
      populate: ['branch', 'vehicle', 'driver', 'helper', 'originBranch', 'destinationBranch'],
    };
    
    // Get loading forms
    const result = await loadingFormRepository.getAllLoadingForms(filter, options);
    
    // Return success response
    return res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    logger.error(`Error getting loading forms: ${error.message}`, { error });
    return next(createApiError(error.message, 500));
  }
};

/**
 * Get loading form by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getLoadingFormById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Get loading form
    const loadingForm = await loadingFormRepository.getLoadingFormById(id, [
      'branch', 
      'vehicle', 
      'driver', 
      'helper', 
      'originBranch', 
      'destinationBranch',
      'shipments.shipment',
      'shipments.handledBy',
      'loadingConfirmations.confirmedBy',
      'createdBy',
      'updatedBy',
    ]);
    
    // Return success response
    return res.status(200).json({
      success: true,
      data: loadingForm,
    });
  } catch (error) {
    logger.error(`Error getting loading form by ID: ${error.message}`, { error });
    return next(createApiError(error.message, 404));
  }
};

/**
 * Get loading form by loading number
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getLoadingFormByLoadingNo = async (req, res, next) => {
  try {
    const { loadingNo } = req.params;
    
    // Get loading form
    const loadingForm = await loadingFormRepository.getLoadingFormByLoadingNo(loadingNo, [
      'branch', 
      'vehicle', 
      'driver', 
      'helper', 
      'originBranch', 
      'destinationBranch',
      'shipments.shipment',
      'shipments.handledBy',
      'loadingConfirmations.confirmedBy',
      'createdBy',
      'updatedBy',
    ]);
    
    // Return success response
    return res.status(200).json({
      success: true,
      data: loadingForm,
    });
  } catch (error) {
    logger.error(`Error getting loading form by loading number: ${error.message}`, { error });
    return next(createApiError(error.message, 404));
  }
};

/**
 * Update loading form
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const updateLoadingForm = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { 
      vehicle, 
      driver, 
      helper, 
      loadingDate, 
      scheduledDeparture, 
      notes 
    } = req.body;
    
    // Update loading form
    const loadingForm = await loadingFormRepository.updateLoadingForm(id, {
      vehicle,
      driver,
      helper,
      loadingDate: loadingDate ? new Date(loadingDate) : undefined,
      scheduledDeparture: scheduledDeparture ? new Date(scheduledDeparture) : undefined,
      notes,
      updatedBy: req.user.id,
    });
    
    // Return success response
    return res.status(200).json({
      success: true,
      data: loadingForm,
    });
  } catch (error) {
    logger.error(`Error updating loading form: ${error.message}`, { error });
    return next(createApiError(error.message, 400));
  }
};

/**
 * Update loading form status
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
    const loadingForm = await loadingFormRepository.updateStatus(id, status, req.user.id, additionalData);
    
    // Return success response
    return res.status(200).json({
      success: true,
      data: loadingForm,
    });
  } catch (error) {
    logger.error(`Error updating loading form status: ${error.message}`, { error });
    return next(createApiError(error.message, 400));
  }
};

/**
 * Add shipment to loading form
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const addShipment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { shipmentId } = req.body;
    
    // Validate shipment ID
    if (!shipmentId) {
      return next(createApiError('Shipment ID is required', 400));
    }
    
    // Add shipment
    const loadingForm = await loadingFormRepository.addShipment(id, shipmentId, req.user.id);
    
    // Return success response
    return res.status(200).json({
      success: true,
      data: loadingForm,
    });
  } catch (error) {
    logger.error(`Error adding shipment to loading form: ${error.message}`, { error });
    return next(createApiError(error.message, 400));
  }
};

/**
 * Remove shipment from loading form
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const removeShipment = async (req, res, next) => {
  try {
    const { id, shipmentId } = req.params;
    
    // Remove shipment
    const loadingForm = await loadingFormRepository.removeShipment(id, shipmentId, req.user.id);
    
    // Return success response
    return res.status(200).json({
      success: true,
      data: loadingForm,
    });
  } catch (error) {
    logger.error(`Error removing shipment from loading form: ${error.message}`, { error });
    return next(createApiError(error.message, 400));
  }
};

/**
 * Update shipment status in loading form
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const updateShipmentStatus = async (req, res, next) => {
  try {
    const { id, shipmentId } = req.params;
    const { status, ...additionalData } = req.body;
    
    // Validate status
    if (!status) {
      return next(createApiError('Status is required', 400));
    }
    
    // Update shipment status
    const loadingForm = await loadingFormRepository.updateShipmentStatus(
      id, 
      shipmentId, 
      status, 
      req.user.id, 
      additionalData
    );
    
    // Return success response
    return res.status(200).json({
      success: true,
      data: loadingForm,
    });
  } catch (error) {
    logger.error(`Error updating shipment status in loading form: ${error.message}`, { error });
    return next(createApiError(error.message, 400));
  }
};

/**
 * Add loading confirmation
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const addLoadingConfirmation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { confirmedBy, role, notes, signature } = req.body;
    
    // Validate required fields
    if (!confirmedBy || !role) {
      return next(createApiError('Confirmed by and role are required', 400));
    }
    
    // Add confirmation
    const loadingForm = await loadingFormRepository.addLoadingConfirmation(
      id, 
      { confirmedBy, role, notes, signature }, 
      req.user.id
    );
    
    // Return success response
    return res.status(200).json({
      success: true,
      data: loadingForm,
    });
  } catch (error) {
    logger.error(`Error adding loading confirmation: ${error.message}`, { error });
    return next(createApiError(error.message, 400));
  }
};

/**
 * Generate loading document
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const generateDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { documentType } = req.body;
    
    // Validate document type
    if (!documentType) {
      return next(createApiError('Document type is required', 400));
    }
    
    // Generate document
    const documentData = await loadingFormRepository.generateDocument(id, documentType, req.user.id);
    
    // Return success response
    return res.status(200).json({
      success: true,
      data: documentData,
    });
  } catch (error) {
    logger.error(`Error generating loading document: ${error.message}`, { error });
    return next(createApiError(error.message, 400));
  }
};

/**
 * Optimize loading allocation
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const optimizeLoading = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Optimize loading
    const loadingForm = await loadingFormRepository.optimizeLoading(id, req.user.id);
    
    // Return success response
    return res.status(200).json({
      success: true,
      data: loadingForm,
    });
  } catch (error) {
    logger.error(`Error optimizing loading: ${error.message}`, { error });
    return next(createApiError(error.message, 400));
  }
};

/**
 * Get loading forms for vehicle
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getVehicleLoadingForms = async (req, res, next) => {
  try {
    const { vehicleId } = req.params;
    const { status, startDate, endDate } = req.query;
    
    // Get loading forms
    const loadingForms = await loadingFormRepository.getVehicleLoadingForms(vehicleId, {
      status,
      startDate,
      endDate,
    });
    
    // Return success response
    return res.status(200).json({
      success: true,
      data: loadingForms,
    });
  } catch (error) {
    logger.error(`Error getting vehicle loading forms: ${error.message}`, { error });
    return next(createApiError(error.message, 400));
  }
};

/**
 * Get today's loading forms for branch
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getTodayLoadingForms = async (req, res, next) => {
  try {
    const { branchId } = req.params;
    const { status } = req.query;
    
    // Get loading forms
    const loadingForms = await loadingFormRepository.getTodayLoadingForms(branchId, {
      status,
    });
    
    // Return success response
    return res.status(200).json({
      success: true,
      data: loadingForms,
    });
  } catch (error) {
    logger.error(`Error getting today's loading forms: ${error.message}`, { error });
    return next(createApiError(error.message, 400));
  }
};

/**
 * Get shipments eligible for loading
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getEligibleShipments = async (req, res, next) => {
  try {
    const { originBranch, destinationBranch } = req.query;
    
    // Validate required fields
    if (!originBranch || !destinationBranch) {
      return next(createApiError('Origin and destination branches are required', 400));
    }
    
    // Get eligible shipments
    const shipments = await shipmentOrderRepository.getShipmentsByStatus(
      'ready_for_loading',
      {
        originBranch,
        destinationBranch,
      }
    );
    
    // Return success response
    return res.status(200).json({
      success: true,
      data: shipments,
    });
  } catch (error) {
    logger.error(`Error getting eligible shipments: ${error.message}`, { error });
    return next(createApiError(error.message, 400));
  }
};

module.exports = {
  createLoadingForm,
  getAllLoadingForms,
  getLoadingFormById,
  getLoadingFormByLoadingNo,
  updateLoadingForm,
  updateStatus,
  addShipment,
  removeShipment,
  updateShipmentStatus,
  addLoadingConfirmation,
  generateDocument,
  optimizeLoading,
  getVehicleLoadingForms,
  getTodayLoadingForms,
  getEligibleShipments,
};
