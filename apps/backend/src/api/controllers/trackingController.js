/**
 * Samudra Paket ERP - Tracking Controller
 * Handles API endpoints for tracking functionality
 */

const trackingRepository = require('../../domain/repositories/trackingRepository');
const logger = require('../middleware/gateway/logger');

/**
 * Create a new tracking event
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {Object} Response with created tracking event
 */
const createTrackingEvent = async (req, res) => {
  try {
    const userId = req.user.id;
    const trackingEventData = {
      ...req.body,
      performer: userId
    };

    const trackingEvent = await trackingRepository.createTrackingEvent(trackingEventData);

    return res.status(201).json({
      success: true,
      data: trackingEvent
    });
  } catch (error) {
    logger.error(`Error creating tracking event: ${error.message}`, { error });
    return res.status(500).json({
      success: false,
      error: {
        code: 'TRACKING_EVENT_CREATION_FAILED',
        message: 'Failed to create tracking event',
        details: error.message
      }
    });
  }
};

/**
 * Get tracking events by tracking code
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {Object} Response with tracking events
 */
const getTrackingEventsByCode = async (req, res) => {
  try {
    const { trackingCode } = req.params;
    const options = {
      page: parseInt(req.query.page, 10) || 1,
      limit: parseInt(req.query.limit, 10) || 50,
      sortBy: req.query.sortBy || 'timestamp',
      sortOrder: req.query.sortOrder || 'desc',
      visibleToCustomer: req.query.visibleToCustomer === 'true' ? true : 
                         req.query.visibleToCustomer === 'false' ? false : null,
      populate: req.query.populate ? req.query.populate.split(',') : []
    };

    const result = await trackingRepository.getTrackingEventsByCode(trackingCode, options);

    return res.status(200).json({
      success: true,
      data: result.data,
      meta: {
        pagination: result.pagination
      }
    });
  } catch (error) {
    logger.error(`Error getting tracking events by code: ${error.message}`, { error });
    return res.status(500).json({
      success: false,
      error: {
        code: 'TRACKING_EVENTS_RETRIEVAL_FAILED',
        message: 'Failed to retrieve tracking events',
        details: error.message
      }
    });
  }
};

/**
 * Get tracking events by entity
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {Object} Response with tracking events
 */
const getTrackingEventsByEntity = async (req, res) => {
  try {
    const { entityType, entityId } = req.params;
    const options = {
      page: parseInt(req.query.page, 10) || 1,
      limit: parseInt(req.query.limit, 10) || 50,
      sortBy: req.query.sortBy || 'timestamp',
      sortOrder: req.query.sortOrder || 'desc',
      visibleToCustomer: req.query.visibleToCustomer === 'true' ? true : 
                         req.query.visibleToCustomer === 'false' ? false : null,
      populate: req.query.populate ? req.query.populate.split(',') : []
    };

    const result = await trackingRepository.getTrackingEventsByEntity(entityType, entityId, options);

    return res.status(200).json({
      success: true,
      data: result.data,
      meta: {
        pagination: result.pagination
      }
    });
  } catch (error) {
    logger.error(`Error getting tracking events by entity: ${error.message}`, { error });
    return res.status(500).json({
      success: false,
      error: {
        code: 'TRACKING_EVENTS_RETRIEVAL_FAILED',
        message: 'Failed to retrieve tracking events',
        details: error.message
      }
    });
  }
};

/**
 * Generate tracking timeline
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {Object} Response with tracking timeline
 */
const generateTrackingTimeline = async (req, res) => {
  try {
    const { trackingCode } = req.params;
    const customerView = req.query.customerView === 'true';

    const timeline = await trackingRepository.generateTrackingTimeline(trackingCode, customerView);

    return res.status(200).json({
      success: true,
      data: timeline
    });
  } catch (error) {
    logger.error(`Error generating tracking timeline: ${error.message}`, { error });
    return res.status(500).json({
      success: false,
      error: {
        code: 'TRACKING_TIMELINE_GENERATION_FAILED',
        message: 'Failed to generate tracking timeline',
        details: error.message
      }
    });
  }
};

/**
 * Update location for a tracking entity
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {Object} Response with updated tracking event
 */
const updateLocation = async (req, res) => {
  try {
    const { entityType, entityId } = req.params;
    const userId = req.user.id;
    const locationData = req.body;

    const trackingEvent = await trackingRepository.updateLocation(
      entityType,
      entityId,
      locationData,
      userId
    );

    return res.status(200).json({
      success: true,
      data: trackingEvent
    });
  } catch (error) {
    logger.error(`Error updating location: ${error.message}`, { error });
    return res.status(500).json({
      success: false,
      error: {
        code: 'LOCATION_UPDATE_FAILED',
        message: 'Failed to update location',
        details: error.message
      }
    });
  }
};

/**
 * Update ETA for a tracking entity
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {Object} Response with updated tracking event
 */
const updateETA = async (req, res) => {
  try {
    const { entityType, entityId } = req.params;
    const userId = req.user.id;
    const { newEta, reason } = req.body;

    const trackingEvent = await trackingRepository.updateETA(
      entityType,
      entityId,
      new Date(newEta),
      userId,
      reason
    );

    return res.status(200).json({
      success: true,
      data: trackingEvent
    });
  } catch (error) {
    logger.error(`Error updating ETA: ${error.message}`, { error });
    return res.status(500).json({
      success: false,
      error: {
        code: 'ETA_UPDATE_FAILED',
        message: 'Failed to update ETA',
        details: error.message
      }
    });
  }
};

/**
 * Find tracking information by reference
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {Object} Response with tracking information
 */
const findTrackingByReference = async (req, res) => {
  try {
    const { reference } = req.params;

    const trackingInfo = await trackingRepository.findTrackingByReference(reference);

    return res.status(200).json({
      success: true,
      data: trackingInfo
    });
  } catch (error) {
    logger.error(`Error finding tracking by reference: ${error.message}`, { error });
    return res.status(404).json({
      success: false,
      error: {
        code: 'TRACKING_INFO_NOT_FOUND',
        message: 'Tracking information not found',
        details: error.message
      }
    });
  }
};

/**
 * Public tracking endpoint (no authentication required)
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {Object} Response with tracking information
 */
const publicTracking = async (req, res) => {
  try {
    const { reference } = req.params;

    const trackingInfo = await trackingRepository.findTrackingByReference(reference);

    return res.status(200).json({
      success: true,
      data: trackingInfo
    });
  } catch (error) {
    logger.error(`Error in public tracking: ${error.message}`, { error });
    return res.status(404).json({
      success: false,
      error: {
        code: 'TRACKING_INFO_NOT_FOUND',
        message: 'Tracking information not found',
        details: error.message
      }
    });
  }
};

module.exports = {
  createTrackingEvent,
  getTrackingEventsByCode,
  getTrackingEventsByEntity,
  generateTrackingTimeline,
  updateLocation,
  updateETA,
  findTrackingByReference,
  publicTracking
};
