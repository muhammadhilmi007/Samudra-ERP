/**
 * Samudra Paket ERP - Customer Model
 * Defines the schema for customers in the system
 */

const mongoose = require('mongoose');

const { Schema } = mongoose;

/**
 * Customer Schema
 * Represents a customer in the organization
 */
const customerSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['individual', 'business'],
      default: 'individual',
    },
    category: {
      type: String,
      enum: ['regular', 'premium', 'vip', 'corporate'],
      default: 'regular',
    },
    contactInfo: {
      primaryPhone: {
        type: String,
        required: true,
      },
      secondaryPhone: String,
      email: String,
      whatsapp: String,
    },
    address: {
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
        default: 'Indonesia',
      },
      coordinates: {
        latitude: Number,
        longitude: Number,
      },
      notes: String,
    },
    businessDetails: {
      companyName: String,
      taxId: String,
      industry: String,
      website: String,
    },
    billingInfo: {
      paymentTerms: {
        type: String,
        enum: ['prepaid', 'cod', 'net15', 'net30', 'net60'],
        default: 'prepaid',
      },
      creditLimit: {
        type: Number,
        default: 0,
      },
      bankName: String,
      bankAccountNumber: String,
      bankAccountName: String,
    },
    shippingPreferences: {
      preferredService: String,
      specialInstructions: String,
      defaultPackaging: String,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'blacklisted'],
      default: 'active',
    },
    registeredBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    branch: {
      type: Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
    },
    activityHistory: [
      {
        action: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        performedBy: {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
        details: Schema.Types.Mixed,
      },
    ],
    notes: String,
    tags: [String],
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  },
);

// Index for faster search
customerSchema.index({ name: 'text', 'contactInfo.primaryPhone': 'text', 'contactInfo.email': 'text' });
customerSchema.index({ 'address.city': 1, 'address.province': 1 });
customerSchema.index({ category: 1, status: 1 });

/**
 * Add activity to customer history
 * @param {String} action - The action performed
 * @param {ObjectId} userId - The user who performed the action
 * @param {Object} details - Additional details about the action
 */
customerSchema.methods.addActivity = async function addActivity(action, userId, details = {}) {
  this.activityHistory.push({
    action,
    performedBy: userId,
    details,
    timestamp: new Date(),
  });
  return this.save();
};

// Create and export the model
const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;
