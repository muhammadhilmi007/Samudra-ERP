/**
 * Samudra Paket ERP - Delivery Order Validator
 * Validates request data for delivery order endpoints
 */

const Joi = require('joi');
const mongoose = require('mongoose');

// Helper function to validate MongoDB ObjectId
const objectId = Joi.string().custom((value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error('any.invalid');
  }
  return value;
}, 'MongoDB ObjectId validation');

// Validation schema for location coordinates
const locationSchema = Joi.object({
  type: Joi.string().valid('Point').default('Point'),
  coordinates: Joi.array().items(Joi.number()).length(2).required()
    .description('Coordinates in [longitude, latitude] format'),
  address: Joi.string().allow('', null),
  speed: Joi.number().min(0).allow(null),
  accuracy: Joi.number().min(0).allow(null),
  altitude: Joi.number().allow(null),
  timestamp: Joi.date().allow(null)
});

// Validation schema for proof of delivery
const proofOfDeliverySchema = Joi.object({
  deliveredTo: Joi.string().required(),
  relationship: Joi.string().allow('', null),
  idNumber: Joi.string().allow('', null),
  signature: Joi.string().required(),
  photos: Joi.array().items(Joi.object({
    url: Joi.string().required(),
    caption: Joi.string().allow('', null),
    timestamp: Joi.date().default(Date.now)
  })),
  notes: Joi.string().allow('', null),
  location: locationSchema,
  codCollected: Joi.boolean().default(false),
  codAmount: Joi.number().min(0).default(0),
  paymentMethod: Joi.string().valid('cash', 'transfer', 'other').when('codCollected', {
    is: true,
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  receiptNumber: Joi.string().allow('', null)
});

// Validation schema for COD payment
const codPaymentSchema = Joi.object({
  amount: Joi.number().min(0).required(),
  paymentMethod: Joi.string().valid('cash', 'transfer', 'other').required(),
  receiptNumber: Joi.string().allow('', null),
  notes: Joi.string().allow('', null)
});

// Validation schema for delivery item
const deliveryItemSchema = Joi.object({
  shipmentOrder: objectId.required(),
  waybillNumber: Joi.string().required(),
  receiverName: Joi.string().required(),
  receiverAddress: Joi.string().required(),
  receiverPhone: Joi.string().required(),
  receiverEmail: Joi.string().email().allow('', null),
  receiverLocation: locationSchema,
  itemDescription: Joi.string().required(),
  weight: Joi.number().min(0).required(),
  dimensions: Joi.object({
    length: Joi.number().min(0),
    width: Joi.number().min(0),
    height: Joi.number().min(0)
  }),
  volume: Joi.number().min(0),
  quantity: Joi.number().integer().min(1).default(1),
  specialHandling: Joi.boolean().default(false),
  specialHandlingNotes: Joi.string().allow('', null),
  paymentType: Joi.string().valid('CASH', 'COD', 'CAD').required(),
  codAmount: Joi.number().min(0).when('paymentType', {
    is: 'COD',
    then: Joi.required(),
    otherwise: Joi.default(0)
  })
});

// Validation schema for route stop
const routeStopSchema = Joi.object({
  location: locationSchema.required(),
  shipmentOrder: objectId,
  waybillNumber: Joi.string(),
  estimatedArrival: Joi.date(),
  actualArrival: Joi.date(),
  sequence: Joi.number().integer().min(0),
  status: Joi.string().valid('pending', 'arrived', 'completed', 'skipped'),
  notes: Joi.string().allow('', null)
});

// Validation schema for delivery route
const routeSchema = Joi.object({
  startLocation: locationSchema,
  endLocation: locationSchema,
  stops: Joi.array().items(routeStopSchema),
  optimized: Joi.boolean().default(false),
  optimizedAt: Joi.date(),
  totalDistance: Joi.number().min(0),
  estimatedDuration: Joi.number().min(0),
  actualDuration: Joi.number().min(0)
});

// Validation schemas for API endpoints
const validators = {
  // Create delivery order validation
  createDeliveryOrder: Joi.object({
    branch: objectId.required(),
    deliveryOrderNo: Joi.string(),
    scheduledDate: Joi.date().required(),
    scheduledTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    vehicle: objectId,
    driver: objectId,
    helper: objectId,
    notes: Joi.string().allow('', null),
    deliveryItems: Joi.array().items(deliveryItemSchema),
    route: routeSchema,
    priority: Joi.string().valid('low', 'normal', 'high').default('normal')
  }),

  // Update delivery order validation
  updateDeliveryOrder: Joi.object({
    scheduledDate: Joi.date(),
    scheduledTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    vehicle: objectId,
    driver: objectId,
    helper: objectId,
    notes: Joi.string().allow('', null),
    route: routeSchema,
    priority: Joi.string().valid('low', 'normal', 'high')
  }),

  // Update status validation
  updateStatus: Joi.object({
    status: Joi.string().valid(
      'pending',
      'assigned',
      'in_progress',
      'completed',
      'partially_completed',
      'failed',
      'cancelled'
    ).required(),
    notes: Joi.string().allow('', null),
    location: locationSchema
  }),

  // Add delivery item validation
  addDeliveryItem: Joi.object({
    deliveryItem: deliveryItemSchema.required()
  }),

  // Record proof of delivery validation
  recordProofOfDelivery: Joi.object({
    proofOfDelivery: proofOfDeliverySchema.required()
  }),

  // Record COD payment validation
  recordCODPayment: Joi.object({
    codPayment: codPaymentSchema.required()
  }),

  // Update tracking location validation
  updateTrackingLocation: Joi.object({
    coordinates: Joi.array().items(Joi.number()).length(2).required()
      .description('Coordinates in [longitude, latitude] format'),
    address: Joi.string().allow('', null),
    speed: Joi.number().min(0).allow(null),
    accuracy: Joi.number().min(0).allow(null),
    altitude: Joi.number().allow(null),
    status: Joi.string().allow('', null)
  }),

  // Assign delivery validation
  assignDelivery: Joi.object({
    vehicle: objectId.required(),
    driver: objectId.required(),
    helper: objectId,
    scheduledDate: Joi.date(),
    scheduledTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    notes: Joi.string().allow('', null)
  }),

  // Start delivery validation
  startDelivery: Joi.object({
    notes: Joi.string().allow('', null),
    location: locationSchema.required()
  }),

  // Complete delivery validation
  completeDelivery: Joi.object({
    notes: Joi.string().allow('', null),
    location: locationSchema.required()
  })
};

module.exports = validators;
