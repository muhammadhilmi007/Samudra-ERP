/**
 * Samudra Paket ERP - Tracking Repository
 * Handles business logic for tracking events
 */

const mongoose = require('mongoose');
const TrackingEvent = require('../models/trackingEvent');
const ShipmentOrder = require('../models/shipmentOrder');
const Shipment = require('../models/shipment');
const PickupRequest = require('../models/pickupRequest');
const DeliveryOrder = require('../models/deliveryOrder');
const logger = require('../../api/middleware/gateway/logger');

/**
 * Create a new tracking event
 * @param {Object} data - Tracking event data
 * @returns {Promise<Object>} Created tracking event
 */
const createTrackingEvent = async (data) => {
  try {
    // Generate tracking code if not provided
    if (!data.trackingCode) {
      data.trackingCode = TrackingEvent.generateTrackingCode(
        data.entityType,
        data.entityId,
        data.referenceCode
      );
    }

    // Create and save the tracking event
    const trackingEvent = new TrackingEvent(data);
    await trackingEvent.save();

    return trackingEvent;
  } catch (error) {
    logger.error(`Error creating tracking event: ${error.message}`, { error });
    throw error;
  }
};

/**
 * Get tracking events by tracking code
 * @param {string} trackingCode - Tracking code
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Tracking events with pagination metadata
 */
const getTrackingEventsByCode = async (trackingCode, options = {}) => {
  try {
    const {
      page = 1,
      limit = 50,
      sortBy = 'timestamp',
      sortOrder = 'desc',
      visibleToCustomer = null,
      populate = []
    } = options;

    // Build query
    const query = { trackingCode };

    // Filter by visibility if specified
    if (visibleToCustomer !== null) {
      query.visibleToCustomer = visibleToCustomer;
    }

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const events = await TrackingEvent.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate(populate);

    // Get total count
    const totalCount = await TrackingEvent.countDocuments(query);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return {
      data: events,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext,
        hasPrev,
      },
    };
  } catch (error) {
    logger.error(`Error getting tracking events by code: ${error.message}`, { error });
    throw error;
  }
};

/**
 * Get tracking events by entity
 * @param {string} entityType - Entity type
 * @param {string} entityId - Entity ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Tracking events with pagination metadata
 */
const getTrackingEventsByEntity = async (entityType, entityId, options = {}) => {
  try {
    const {
      page = 1,
      limit = 50,
      sortBy = 'timestamp',
      sortOrder = 'desc',
      visibleToCustomer = null,
      populate = []
    } = options;

    // Build query
    const query = {
      entityType,
      entityId: typeof entityId === 'string' ? entityId : mongoose.Types.ObjectId(entityId)
    };

    // Filter by visibility if specified
    if (visibleToCustomer !== null) {
      query.visibleToCustomer = visibleToCustomer;
    }

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const events = await TrackingEvent.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate(populate);

    // Get total count
    const totalCount = await TrackingEvent.countDocuments(query);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return {
      data: events,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext,
        hasPrev,
      },
    };
  } catch (error) {
    logger.error(`Error getting tracking events by entity: ${error.message}`, { error });
    throw error;
  }
};

/**
 * Generate tracking timeline for a tracking code
 * @param {string} trackingCode - Tracking code
 * @param {boolean} customerView - Whether to show only customer-visible events
 * @returns {Promise<Array>} Tracking timeline
 */
const generateTrackingTimeline = async (trackingCode, customerView = false) => {
  try {
    // Build query
    const query = { trackingCode };
    
    // Filter by visibility if customer view
    if (customerView) {
      query.visibleToCustomer = true;
    }

    // Get all events for the tracking code, sorted by timestamp
    const events = await TrackingEvent.find(query)
      .sort({ timestamp: 1 })
      .populate([
        { path: 'branch', select: 'name code' },
        { path: 'performer', select: 'firstName lastName' }
      ]);

    if (events.length === 0) {
      throw new Error('No tracking events found for the provided tracking code');
    }

    // Get entity details from the first event
    const firstEvent = events[0];
    let entityDetails = null;

    // Fetch entity details based on entity type
    switch (firstEvent.entityType) {
      case 'shipment_order':
        entityDetails = await ShipmentOrder.findById(firstEvent.entityId)
          .select('waybillNo sender receiver originBranch destinationBranch serviceType');
        break;
      case 'shipment':
        entityDetails = await Shipment.findById(firstEvent.entityId)
          .select('shipmentNo originBranch destinationBranch departureDate estimatedArrival');
        break;
      case 'pickup_request':
        entityDetails = await PickupRequest.findById(firstEvent.entityId)
          .select('requestCode customer branch pickupAddress scheduledDate');
        break;
      case 'delivery_order':
        entityDetails = await DeliveryOrder.findById(firstEvent.entityId)
          .select('deliveryNo branch deliveryDate');
        break;
      default:
        break;
    }

    // Format timeline
    const timeline = {
      trackingCode,
      entityType: firstEvent.entityType,
      entityId: firstEvent.entityId,
      entityDetails,
      currentStatus: events[events.length - 1].status || 'unknown',
      events: events.map(event => ({
        id: event._id,
        eventType: event.eventType,
        timestamp: event.timestamp,
        status: event.status,
        location: event.location,
        branch: event.branch,
        performer: event.performer,
        notes: event.notes,
        details: event.details
      }))
    };

    return timeline;
  } catch (error) {
    logger.error(`Error generating tracking timeline: ${error.message}`, { error });
    throw error;
  }
};

/**
 * Update location for a tracking entity
 * @param {string} entityType - Entity type
 * @param {string} entityId - Entity ID
 * @param {Object} locationData - Location data
 * @param {string} userId - User ID who updates the location
 * @returns {Promise<Object>} Created tracking event
 */
const updateLocation = async (entityType, entityId, locationData, userId) => {
  try {
    // Find the most recent tracking event for this entity to get the tracking code
    const latestEvent = await TrackingEvent.findOne({
      entityType,
      entityId: typeof entityId === 'string' ? entityId : mongoose.Types.ObjectId(entityId)
    }).sort({ timestamp: -1 });

    if (!latestEvent) {
      throw new Error(`No tracking events found for ${entityType} with ID ${entityId}`);
    }

    // Create a location update event
    const trackingEvent = await module.exports.createTrackingEvent({
      trackingCode: latestEvent.trackingCode,
      entityType,
      entityId,
      eventType: 'location_updated',
      timestamp: new Date(),
      status: latestEvent.status, // Maintain the current status
      location: locationData,
      performer: userId,
      visibleToCustomer: false, // Location updates are typically internal
      details: {
        previousLocation: latestEvent.location
      }
    });

    return trackingEvent;
  } catch (error) {
    logger.error(`Error updating location: ${error.message}`, { error });
    throw error;
  }
};

/**
 * Update ETA for a tracking entity
 * @param {string} entityType - Entity type
 * @param {string} entityId - Entity ID
 * @param {Date} newEta - New estimated time of arrival
 * @param {string} userId - User ID who updates the ETA
 * @param {string} reason - Reason for ETA update
 * @returns {Promise<Object>} Created tracking event
 */
const updateETA = async (entityType, entityId, newEta, userId, reason = '') => {
  try {
    // Find the most recent tracking event for this entity to get the tracking code
    const latestEvent = await TrackingEvent.findOne({
      entityType,
      entityId: typeof entityId === 'string' ? entityId : mongoose.Types.ObjectId(entityId)
    }).sort({ timestamp: -1 });

    if (!latestEvent) {
      throw new Error(`No tracking events found for ${entityType} with ID ${entityId}`);
    }

    // Update the entity's ETA in its respective collection
    let entity;
    switch (entityType) {
      case 'shipment':
        entity = await Shipment.findById(entityId);
        if (entity) {
          const oldEta = entity.estimatedArrival;
          entity.estimatedArrival = newEta;
          await entity.save();
          
          // Create an ETA update event
          const trackingEvent = await module.exports.createTrackingEvent({
            trackingCode: latestEvent.trackingCode,
            entityType,
            entityId,
            eventType: 'eta_updated',
            timestamp: new Date(),
            status: entity.status,
            performer: userId,
            visibleToCustomer: true, // ETA updates are visible to customers
            notes: reason,
            details: {
              previousEta: oldEta,
              newEta
            }
          });
          
          return trackingEvent;
        }
        break;
      
      case 'delivery_order':
        entity = await DeliveryOrder.findById(entityId);
        if (entity) {
          const oldEta = entity.estimatedArrival;
          entity.estimatedArrival = newEta;
          await entity.save();
          
          // Create an ETA update event
          const trackingEvent = await module.exports.createTrackingEvent({
            trackingCode: latestEvent.trackingCode,
            entityType,
            entityId,
            eventType: 'eta_updated',
            timestamp: new Date(),
            status: entity.status,
            performer: userId,
            visibleToCustomer: true, // ETA updates are visible to customers
            notes: reason,
            details: {
              previousEta: oldEta,
              newEta
            }
          });
          
          return trackingEvent;
        }
        break;
      
      default:
        throw new Error(`ETA updates not supported for entity type: ${entityType}`);
    }

    throw new Error(`Entity not found: ${entityType} with ID ${entityId}`);
  } catch (error) {
    logger.error(`Error updating ETA: ${error.message}`, { error });
    throw error;
  }
};

/**
 * Find tracking information by reference (waybill, shipment number, etc.)
 * @param {string} reference - Reference code
 * @returns {Promise<Object>} Tracking information
 */
const findTrackingByReference = async (reference) => {
  try {
    // Try to find a tracking event with this reference as tracking code
    const event = await TrackingEvent.findOne({ trackingCode: reference })
      .sort({ timestamp: -1 });

    if (event) {
      // Generate timeline for this tracking code
      return await generateTrackingTimeline(reference, true);
    }

    // If not found, try to find by entity reference
    // Check shipment order by waybill number
    const shipmentOrder = await ShipmentOrder.findOne({ waybillNo: reference });
    if (shipmentOrder) {
      const event = await TrackingEvent.findOne({
        entityType: 'shipment_order',
        entityId: shipmentOrder._id
      }).sort({ timestamp: -1 });

      if (event) {
        return await generateTrackingTimeline(event.trackingCode, true);
      }
    }

    // Check shipment by shipment number
    const shipment = await Shipment.findOne({ shipmentNo: reference });
    if (shipment) {
      const event = await TrackingEvent.findOne({
        entityType: 'shipment',
        entityId: shipment._id
      }).sort({ timestamp: -1 });

      if (event) {
        return await generateTrackingTimeline(event.trackingCode, true);
      }
    }

    // Check pickup request by request code
    const pickupRequest = await PickupRequest.findOne({ requestCode: reference });
    if (pickupRequest) {
      const event = await TrackingEvent.findOne({
        entityType: 'pickup_request',
        entityId: pickupRequest._id
      }).sort({ timestamp: -1 });

      if (event) {
        return await generateTrackingTimeline(event.trackingCode, true);
      }
    }

    // Check delivery order by delivery number
    const deliveryOrder = await DeliveryOrder.findOne({ deliveryNo: reference });
    if (deliveryOrder) {
      const event = await TrackingEvent.findOne({
        entityType: 'delivery_order',
        entityId: deliveryOrder._id
      }).sort({ timestamp: -1 });

      if (event) {
        return await generateTrackingTimeline(event.trackingCode, true);
      }
    }

    throw new Error('No tracking information found for the provided reference');
  } catch (error) {
    logger.error(`Error finding tracking by reference: ${error.message}`, { error });
    throw error;
  }
};

module.exports = {
  createTrackingEvent,
  getTrackingEventsByCode,
  getTrackingEventsByEntity,
  generateTrackingTimeline,
  updateLocation,
  updateETA,
  findTrackingByReference
};
