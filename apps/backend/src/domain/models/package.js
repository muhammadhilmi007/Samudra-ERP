/**
 * Samudra Paket ERP - Package Model
 * Domain model for package entity
 */

const mongoose = require('mongoose');

/**
 * Address Schema
 * Represents a physical address
 */
const addressSchema = new mongoose.Schema({
  street: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  province: {
    type: String,
    required: true,
  },
  postalCode: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
    default: 'Indonesia',
  },
  coordinates: {
    latitude: Number,
    longitude: Number,
  },
});

/**
 * Contact Schema
 * Represents a contact person with address
 */
const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  address: {
    type: addressSchema,
    required: true,
  },
});

/**
 * Package Schema
 * Main entity for package/shipment
 */
const packageSchema = new mongoose.Schema(
  {
    trackingNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    status: {
      type: String,
      enum: [
        'PENDING',
        'PICKED_UP',
        'IN_TRANSIT',
        'OUT_FOR_DELIVERY',
        'DELIVERED',
        'FAILED_DELIVERY',
        'RETURNED',
        'CANCELLED',
      ],
      default: 'PENDING',
      index: true,
    },
    weight: {
      type: Number,
      required: true,
    },
    dimensions: {
      length: { type: Number, required: true },
      width: { type: Number, required: true },
      height: { type: Number, required: true },
    },
    sender: {
      type: contactSchema,
      required: true,
    },
    recipient: {
      type: contactSchema,
      required: true,
    },
    service: {
      type: String,
      enum: ['REGULAR', 'EXPRESS', 'SAME_DAY'],
      required: true,
      index: true,
    },
    price: {
      type: Number,
      required: true,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  },
);

// Create indexes for better query performance
packageSchema.index({ createdAt: -1 });
packageSchema.index({ 'sender.name': 1 });
packageSchema.index({ 'recipient.name': 1 });

/**
 * Generate a unique tracking number
 * @returns {string} Tracking number
 */
packageSchema.statics.generateTrackingNumber = function () {
  const prefix = 'SP';
  const randomNum = Math.floor(10000000 + Math.random() * 90000000);
  return `${prefix}${randomNum}`;
};

const Package = mongoose.model('Package', packageSchema);

module.exports = Package;
