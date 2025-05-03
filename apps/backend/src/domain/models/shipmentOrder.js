/**
 * Samudra Paket ERP - Shipment Order Model
 * Defines the schema for shipment orders (waybills)
 */

const mongoose = require('mongoose');
const { Schema } = mongoose;

// Schema for shipment items
const ShipmentItemSchema = new Schema({
  description: {
    type: String,
    required: true,
    trim: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },
  weight: {
    type: Number,
    required: true,
    min: 0,
  },
  volume: {
    type: Number,
    min: 0,
  },
  dimensions: {
    length: {
      type: Number,
      min: 0,
    },
    width: {
      type: Number,
      min: 0,
    },
    height: {
      type: Number,
      min: 0,
    },
    unit: {
      type: String,
      enum: ['cm', 'inch'],
      default: 'cm',
    },
  },
  value: {
    type: Number,
    min: 0,
  },
  category: {
    type: String,
    enum: ['document', 'parcel', 'electronics', 'fragile', 'perishable', 'dangerous', 'other'],
    default: 'parcel',
  },
  packaging: {
    type: String,
    enum: ['box', 'envelope', 'tube', 'pallet', 'crate', 'original', 'none', 'other'],
    default: 'box',
  },
  notes: {
    type: String,
    trim: true,
  },
});

// Schema for status history
const StatusHistorySchema = new Schema({
  status: {
    type: String,
    required: true,
    enum: [
      'created',
      'processed',
      'in_transit',
      'arrived_at_destination',
      'out_for_delivery',
      'delivered',
      'failed_delivery',
      'returned',
      'cancelled',
    ],
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now,
  },
  location: {
    type: String,
    trim: true,
  },
  notes: {
    type: String,
    trim: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

// Schema for attached documents
const DocumentSchema = new Schema({
  type: {
    type: String,
    required: true,
    enum: ['waybill', 'invoice', 'receipt', 'proof_of_delivery', 'customs', 'insurance', 'other'],
  },
  fileUrl: {
    type: String,
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  mimeType: {
    type: String,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
  uploadedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
});

// Main Shipment Order Schema
const ShipmentOrderSchema = new Schema(
  {
    waybillNo: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    branch: {
      type: Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
    },
    sender: {
      customer: {
        type: Schema.Types.ObjectId,
        ref: 'Customer',
      },
      name: {
        type: String,
        required: true,
        trim: true,
      },
      address: {
        street: {
          type: String,
          required: true,
          trim: true,
        },
        city: {
          type: String,
          required: true,
          trim: true,
        },
        district: {
          type: String,
          required: true,
          trim: true,
        },
        province: {
          type: String,
          required: true,
          trim: true,
        },
        postalCode: {
          type: String,
          required: true,
          trim: true,
        },
        country: {
          type: String,
          default: 'Indonesia',
          trim: true,
        },
      },
      phone: {
        type: String,
        required: true,
        trim: true,
      },
      email: {
        type: String,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address.'],
      },
    },
    receiver: {
      name: {
        type: String,
        required: true,
        trim: true,
      },
      address: {
        street: {
          type: String,
          required: true,
          trim: true,
        },
        city: {
          type: String,
          required: true,
          trim: true,
        },
        district: {
          type: String,
          required: true,
          trim: true,
        },
        province: {
          type: String,
          required: true,
          trim: true,
        },
        postalCode: {
          type: String,
          required: true,
          trim: true,
        },
        country: {
          type: String,
          default: 'Indonesia',
          trim: true,
        },
      },
      phone: {
        type: String,
        required: true,
        trim: true,
      },
      email: {
        type: String,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address.'],
      },
    },
    originBranch: {
      type: Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
    },
    destinationBranch: {
      type: Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
    },
    serviceType: {
      type: String,
      required: true,
      enum: ['regular', 'express', 'same_day', 'next_day', 'economy'],
      default: 'regular',
    },
    paymentType: {
      type: String,
      required: true,
      enum: ['CASH', 'COD', 'CAD', 'credit', 'prepaid'],
      default: 'CASH',
    },
    forwarderCode: {
      type: String,
      trim: true,
    },
    items: [ShipmentItemSchema],
    totalItems: {
      type: Number,
      required: true,
      min: 1,
    },
    totalWeight: {
      type: Number,
      required: true,
      min: 0,
    },
    totalVolume: {
      type: Number,
      min: 0,
    },
    amount: {
      baseRate: {
        type: Number,
        required: true,
        min: 0,
      },
      additionalServices: {
        type: Number,
        default: 0,
        min: 0,
      },
      insurance: {
        type: Number,
        default: 0,
        min: 0,
      },
      tax: {
        type: Number,
        default: 0,
        min: 0,
      },
      discount: {
        type: Number,
        default: 0,
        min: 0,
      },
      total: {
        type: Number,
        required: true,
        min: 0,
      },
    },
    pickupRequest: {
      type: Schema.Types.ObjectId,
      ref: 'PickupRequest',
    },
    status: {
      type: String,
      required: true,
      enum: [
        'created',
        'processed',
        'in_transit',
        'arrived_at_destination',
        'out_for_delivery',
        'delivered',
        'failed_delivery',
        'returned',
        'cancelled',
      ],
      default: 'created',
    },
    statusHistory: [StatusHistorySchema],
    documents: [DocumentSchema],
    notes: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Generate a unique waybill number
 * Format: SM + YYMMDD + BR + XXXX (BR = Branch code, XXXX = Sequence number)
 * @param {ObjectId} branchId - Branch ID
 * @returns {Promise<string>} - Generated waybill number
 */
ShipmentOrderSchema.statics.generateWaybillNo = async function (branchId) {
  const Branch = mongoose.model('Branch');
  const branch = await Branch.findById(branchId);
  
  if (!branch) {
    throw new Error('Branch not found');
  }
  
  // Get branch code (first 2 characters)
  const branchCode = branch.code.substring(0, 2).toUpperCase();
  
  // Get current date in YYMMDD format
  const now = new Date();
  const year = now.getFullYear().toString().substr(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const dateCode = year + month + day;
  
  // Find the latest waybill number for this branch and date
  const prefix = `SM${dateCode}${branchCode}`;
  const latestWaybill = await this.findOne(
    { waybillNo: new RegExp(`^${prefix}`) },
    { waybillNo: 1 },
    { sort: { waybillNo: -1 } }
  );
  
  let sequenceNumber = 1;
  if (latestWaybill) {
    // Extract the sequence number from the latest waybill
    const latestSequence = parseInt(latestWaybill.waybillNo.substr(-4), 10);
    sequenceNumber = latestSequence + 1;
  }
  
  // Format the sequence number to 4 digits
  const sequenceStr = sequenceNumber.toString().padStart(4, '0');
  
  return `${prefix}${sequenceStr}`;
};

/**
 * Add a status history entry
 * @param {string} status - New status
 * @param {ObjectId} userId - User ID who updated the status
 * @param {Object} details - Additional details (location, notes)
 * @returns {Object} - Updated shipment order
 */
ShipmentOrderSchema.methods.addStatusHistory = function (status, userId, details = {}) {
  const { location, notes } = details;
  
  this.status = status;
  this.statusHistory.push({
    status,
    timestamp: new Date(),
    location,
    notes,
    user: userId,
  });
  
  return this;
};

/**
 * Calculate volumetric weight for the shipment
 * @returns {number} - Volumetric weight in kg
 */
ShipmentOrderSchema.methods.calculateVolumetricWeight = function () {
  let totalVolumetricWeight = 0;
  
  this.items.forEach((item) => {
    if (item.dimensions && item.dimensions.length && item.dimensions.width && item.dimensions.height) {
      const { length, width, height, unit } = item.dimensions;
      const divisor = unit === 'cm' ? 5000 : 139; // 5000 for cm, 139 for inches
      const volumetricWeight = (length * width * height) / divisor;
      totalVolumetricWeight += volumetricWeight * item.quantity;
    }
  });
  
  return totalVolumetricWeight;
};

/**
 * Calculate the chargeable weight (greater of actual weight and volumetric weight)
 * @returns {number} - Chargeable weight in kg
 */
ShipmentOrderSchema.methods.calculateChargeableWeight = function () {
  const volumetricWeight = this.calculateVolumetricWeight();
  return Math.max(this.totalWeight, volumetricWeight);
};

// Create and export the model
const ShipmentOrder = mongoose.model('ShipmentOrder', ShipmentOrderSchema);

module.exports = ShipmentOrder;
