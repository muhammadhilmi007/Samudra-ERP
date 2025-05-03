/**
 * Samudra Paket ERP - Pickup Item Controller
 * Handles API endpoints for pickup items
 */

const pickupItemRepository = require('../../domain/repositories/pickupItemRepository');
const { createApiError } = require('../../utils/apiError');
const logger = require('../../utils/logger');

/**
 * Create a new pickup item
 * @route POST /api/pickup-items
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} Response with created pickup item
 */
const createPickupItem = async (req, res, next) => {
  try {
    // Validate required fields
    const { pickupRequest, pickupAssignment, description, category, weight, dimensions } = req.body;
    
    if (!pickupRequest || !pickupAssignment || !description || !weight || !dimensions) {
      return next(createApiError(400, 'Missing required fields'));
    }
    
    // Create pickup item with user ID as creator
    const itemData = {
      ...req.body,
      createdBy: req.user._id,
    };
    
    const pickupItem = await pickupItemRepository.createPickupItem(itemData);
    
    res.status(201).json({
      success: true,
      data: pickupItem,
    });
  } catch (error) {
    logger.error(`Error creating pickup item: ${error.message}`, { stack: error.stack });
    next(error);
  }
};

/**
 * Get all pickup items with filtering and pagination
 * @route GET /api/pickup-items
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} Response with pickup items and metadata
 */
const getAllPickupItems = async (req, res, next) => {
  try {
    const { 
      page, 
      limit, 
      sortBy, 
      sortOrder,
      status,
      pickupRequest,
      pickupAssignment,
      category,
      createdBy,
      verifiedBy,
      code,
      description,
      createdAtFrom,
      createdAtTo,
      weightFrom,
      weightTo
    } = req.query;
    
    // Build filter object
    const filter = {};
    
    if (code) filter.code = code;
    if (description) filter.description = description;
    if (createdAtFrom) filter.createdAtFrom = createdAtFrom;
    if (createdAtTo) filter.createdAtTo = createdAtTo;
    if (weightFrom) filter.weightFrom = weightFrom;
    if (weightTo) filter.weightTo = weightTo;
    
    // Build options object
    const options = {
      page,
      limit,
      sortBy,
      sortOrder,
      status,
      pickupRequest,
      pickupAssignment,
      category,
      createdBy,
      verifiedBy
    };
    
    const result = await pickupItemRepository.getAllPickupItems(filter, options);
    
    res.status(200).json({
      success: true,
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    logger.error(`Error getting pickup items: ${error.message}`, { stack: error.stack });
    next(error);
  }
};

/**
 * Get a pickup item by ID
 * @route GET /api/pickup-items/:id
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} Response with pickup item
 */
const getPickupItemById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const populate = req.query.populate ? req.query.populate.split(',') : [];
    
    const pickupItem = await pickupItemRepository.getPickupItemById(id, populate);
    
    if (!pickupItem) {
      return next(createApiError(404, 'Pickup item not found'));
    }
    
    res.status(200).json({
      success: true,
      data: pickupItem,
    });
  } catch (error) {
    logger.error(`Error getting pickup item by ID: ${error.message}`, { stack: error.stack });
    next(error);
  }
};

/**
 * Get a pickup item by code
 * @route GET /api/pickup-items/code/:code
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} Response with pickup item
 */
const getPickupItemByCode = async (req, res, next) => {
  try {
    const { code } = req.params;
    const populate = req.query.populate ? req.query.populate.split(',') : [];
    
    const pickupItem = await pickupItemRepository.getPickupItemByCode(code, populate);
    
    if (!pickupItem) {
      return next(createApiError(404, 'Pickup item not found'));
    }
    
    res.status(200).json({
      success: true,
      data: pickupItem,
    });
  } catch (error) {
    logger.error(`Error getting pickup item by code: ${error.message}`, { stack: error.stack });
    next(error);
  }
};

/**
 * Update a pickup item
 * @route PUT /api/pickup-items/:id
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} Response with updated pickup item
 */
const updatePickupItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Add user ID as updater
    const updateData = {
      ...req.body,
      updatedBy: req.user._id,
    };
    
    const pickupItem = await pickupItemRepository.updatePickupItem(id, updateData);
    
    res.status(200).json({
      success: true,
      data: pickupItem,
    });
  } catch (error) {
    logger.error(`Error updating pickup item: ${error.message}`, { stack: error.stack });
    next(error);
  }
};

/**
 * Update pickup item status
 * @route PATCH /api/pickup-items/:id/status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} Response with updated pickup item
 */
const updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    
    if (!status) {
      return next(createApiError(400, 'Status is required'));
    }
    
    // Validate status
    const validStatuses = ['pending', 'verified', 'rejected', 'processed', 'shipped'];
    if (!validStatuses.includes(status)) {
      return next(createApiError(400, 'Invalid status'));
    }
    
    const pickupItem = await pickupItemRepository.updateStatus(id, status, req.user._id, { notes });
    
    res.status(200).json({
      success: true,
      data: pickupItem,
    });
  } catch (error) {
    logger.error(`Error updating pickup item status: ${error.message}`, { stack: error.stack });
    next(error);
  }
};

/**
 * Add an image to a pickup item
 * @route POST /api/pickup-items/:id/images
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} Response with updated pickup item
 */
const addImage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { url, type, caption } = req.body;
    
    if (!url) {
      return next(createApiError(400, 'Image URL is required'));
    }
    
    const imageData = { url, type, caption };
    const pickupItem = await pickupItemRepository.addImage(id, imageData, req.user._id);
    
    res.status(200).json({
      success: true,
      data: pickupItem,
    });
  } catch (error) {
    logger.error(`Error adding image to pickup item: ${error.message}`, { stack: error.stack });
    next(error);
  }
};

/**
 * Remove an image from a pickup item
 * @route DELETE /api/pickup-items/:id/images/:imageId
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} Response with updated pickup item
 */
const removeImage = async (req, res, next) => {
  try {
    const { id, imageId } = req.params;
    
    const pickupItem = await pickupItemRepository.removeImage(id, imageId, req.user._id);
    
    res.status(200).json({
      success: true,
      data: pickupItem,
    });
  } catch (error) {
    logger.error(`Error removing image from pickup item: ${error.message}`, { stack: error.stack });
    next(error);
  }
};

/**
 * Add a digital signature to a pickup item
 * @route POST /api/pickup-items/:id/signature
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} Response with updated pickup item
 */
const addSignature = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { image, name } = req.body;
    
    if (!image) {
      return next(createApiError(400, 'Signature image is required'));
    }
    
    if (!name) {
      return next(createApiError(400, 'Signer name is required'));
    }
    
    const signatureData = { image, name };
    const pickupItem = await pickupItemRepository.addSignature(id, signatureData, req.user._id);
    
    res.status(200).json({
      success: true,
      data: pickupItem,
    });
  } catch (error) {
    logger.error(`Error adding signature to pickup item: ${error.message}`, { stack: error.stack });
    next(error);
  }
};

/**
 * Update weight and dimensions of a pickup item
 * @route PATCH /api/pickup-items/:id/measurements
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} Response with updated pickup item
 */
const updateMeasurements = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { weight, dimensions } = req.body;
    
    if (!weight && !dimensions) {
      return next(createApiError(400, 'Weight or dimensions are required'));
    }
    
    const measurementData = {};
    
    if (weight) {
      measurementData.weight = weight;
    }
    
    if (dimensions) {
      measurementData.dimensions = dimensions;
    }
    
    const pickupItem = await pickupItemRepository.updateMeasurements(id, measurementData, req.user._id);
    
    res.status(200).json({
      success: true,
      data: pickupItem,
    });
  } catch (error) {
    logger.error(`Error updating measurements for pickup item: ${error.message}`, { stack: error.stack });
    next(error);
  }
};

/**
 * Get pickup items by pickup request ID
 * @route GET /api/pickup-items/pickup-request/:pickupRequestId
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} Response with pickup items
 */
const getItemsByPickupRequest = async (req, res, next) => {
  try {
    const { pickupRequestId } = req.params;
    
    const items = await pickupItemRepository.getItemsByPickupRequest(pickupRequestId);
    
    res.status(200).json({
      success: true,
      data: items,
    });
  } catch (error) {
    logger.error(`Error getting items by pickup request: ${error.message}`, { stack: error.stack });
    next(error);
  }
};

/**
 * Get pickup items by pickup assignment ID
 * @route GET /api/pickup-items/pickup-assignment/:pickupAssignmentId
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} Response with pickup items
 */
const getItemsByPickupAssignment = async (req, res, next) => {
  try {
    const { pickupAssignmentId } = req.params;
    
    const items = await pickupItemRepository.getItemsByPickupAssignment(pickupAssignmentId);
    
    res.status(200).json({
      success: true,
      data: items,
    });
  } catch (error) {
    logger.error(`Error getting items by pickup assignment: ${error.message}`, { stack: error.stack });
    next(error);
  }
};

module.exports = {
  createPickupItem,
  getAllPickupItems,
  getPickupItemById,
  getPickupItemByCode,
  updatePickupItem,
  updateStatus,
  addImage,
  removeImage,
  addSignature,
  updateMeasurements,
  getItemsByPickupRequest,
  getItemsByPickupAssignment
};
