/**
 * Samudra Paket ERP - Tracking Event Model
 * Defines the schema for tracking events
 */

const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * Location Schema
 * Used for storing location data with tracking events
 */
const locationSchema = new Schema({
  type: {
    type: String,
    enum: ['Point'],
    default: 'Point',
    required: true,
  },
  coordinates: {
    type: [Number], // [longitude, latitude]
    required: true,
    validate: {
      validator: function(v) {
        return v.length === 2 && 
          v[0] >= -180 && v[0] <= 180 && 
          v[1] >= -90 && v[1] <= 90;
      },
      message: props => `${props.value} is not a valid coordinate pair!`
    }
  },
  address: {
    type: String,
  },
  city: {
    type: String,
  },
  province: {
    type: String,
  },
  postalCode: {
    type: String,
  }
});

/**
 * Tracking Event Schema
 */
const trackingEventSchema = new Schema(
  {
    trackingCode: {
      type: String,
      required: true,
      index: true,
    },
    entityType: {
      type: String,
      enum: ['shipment_order', 'shipment', 'pickup_request', 'delivery_order', 'return'],
      required: true,
    },
    entityId: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: 'entityType',
    },
    eventType: {
      type: String,
      enum: [
        'created',
        'status_updated',
        'location_updated',
        'pickup_scheduled',
        'pickup_started',
        'pickup_completed',
        'processing_started',
        'processing_completed',
        'loaded',
        'departed',
        'in_transit',
        'checkpoint_reached',
        'arrived_at_destination',
        'unloaded',
        'out_for_delivery',
        'delivery_attempted',
        'delivered',
        'delivery_failed',
        'returned',
        'issue_reported',
        'issue_resolved',
        'eta_updated',
        'custom'
      ],
      required: true,
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
    },
    status: {
      type: String,
    },
    location: {
      type: locationSchema,
    },
    branch: {
      type: Schema.Types.ObjectId,
      ref: 'Branch',
    },
    performer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    details: {
      type: Schema.Types.Mixed,
    },
    notes: {
      type: String,
    },
    visibleToCustomer: {
      type: Boolean,
      default: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
    }
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient querying
trackingEventSchema.index({ trackingCode: 1, timestamp: -1 });
trackingEventSchema.index({ entityType: 1, entityId: 1, timestamp: -1 });

/**
 * Generate tracking code based on entity type and ID
 * @param {string} entityType - Type of entity
 * @param {string} entityId - Entity ID
 * @param {string} referenceCode - Reference code (waybill, shipment number, etc.)
 * @returns {string} - Tracking code
 */
trackingEventSchema.statics.generateTrackingCode = function(entityType, entityId, referenceCode) {
  if (referenceCode) {
    return referenceCode;
  }
  
  // Generate a tracking code based on entity type and ID
  const prefix = entityType === 'shipment_order' ? 'WB' : 
                entityType === 'shipment' ? 'SH' : 
                entityType === 'pickup_request' ? 'PU' : 
                entityType === 'delivery_order' ? 'DO' : 'RT';
  
  return `${prefix}-${entityId.toString().substr(-8).toUpperCase()}`;
};

const TrackingEvent = mongoose.model('TrackingEvent', trackingEventSchema);

module.exports = TrackingEvent;
