/**
 * Samudra Paket ERP - Loading Form Model
 * Defines the schema for loading forms
 */

const mongoose = require('mongoose');
const { Schema } = mongoose;
const Branch = require('./branch');

/**
 * Shipment Item Schema
 * Represents a shipment included in the loading form
 */
const shipmentItemSchema = new Schema({
  shipment: {
    type: Schema.Types.ObjectId,
    ref: 'ShipmentOrder',
    required: true,
  },
  waybillNo: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'loaded', 'rejected', 'damaged'],
    default: 'pending',
  },
  loadedAt: {
    type: Date,
  },
  notes: {
    type: String,
  },
  position: {
    section: {
      type: String,
      enum: ['front', 'middle', 'back', 'top', 'bottom'],
    },
    coordinates: {
      x: Number, // Relative position in vehicle (0-100%)
      y: Number,
      z: Number,
    },
  },
  handledBy: {
    type: Schema.Types.ObjectId,
    ref: 'Employee',
  },
});

/**
 * Loading Confirmation Schema
 * Represents confirmation of loading process
 */
const loadingConfirmationSchema = new Schema({
  confirmedBy: {
    type: Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
  },
  role: {
    type: String,
    enum: ['loader', 'checker', 'supervisor', 'driver'],
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true,
  },
  notes: {
    type: String,
  },
  signature: {
    type: String, // URL to signature image
  },
});

/**
 * Activity History Schema
 * Tracks activities related to the loading form
 */
const activityHistorySchema = new Schema({
  action: {
    type: String,
    required: true,
  },
  performedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true,
  },
  details: {
    type: Schema.Types.Mixed,
  },
});

/**
 * Loading Form Schema
 */
const loadingFormSchema = new Schema(
  {
    loadingNo: {
      type: String,
      required: true,
      unique: true,
    },
    branch: {
      type: Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
    },
    vehicle: {
      type: Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true,
    },
    driver: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    helper: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
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
    loadingDate: {
      type: Date,
      required: true,
    },
    scheduledDeparture: {
      type: Date,
      required: true,
    },
    actualDeparture: {
      type: Date,
    },
    totalItems: {
      type: Number,
      default: 0,
    },
    totalWeight: {
      type: Number,
      default: 0,
    },
    totalVolume: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['draft', 'planned', 'in_progress', 'loaded', 'departed', 'cancelled'],
      default: 'draft',
    },
    shipments: [shipmentItemSchema],
    loadingConfirmations: [loadingConfirmationSchema],
    notes: {
      type: String,
    },
    documents: [{
      type: {
        type: String,
        enum: ['manifest', 'checklist', 'receipt', 'other'],
        required: true,
      },
      fileUrl: {
        type: String,
        required: true,
      },
      fileName: {
        type: String,
        required: true,
      },
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
      uploadedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    }],
    activityHistory: [activityHistorySchema],
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
 * Generate a unique loading form number
 * Format: LF + YYMMDD + BR + XXXX (BR = Branch code, XXXX = Sequence number)
 * @param {ObjectId} branchId - Branch ID
 * @returns {Promise<string>} - Generated loading form number
 */
loadingFormSchema.statics.generateLoadingNo = async function(branchId) {
  try {
    // Get branch code
    const branch = await Branch.findById(branchId);
    if (!branch || !branch.code) {
      throw new Error('Branch not found or branch code not available');
    }
    
    const branchCode = branch.code;
    
    // Generate date part (YYMMDD)
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const datePart = `${year}${month}${day}`;
    
    // Find the latest loading form for this branch and date
    const latestLoadingForm = await this.findOne(
      { 
        loadingNo: new RegExp(`^LF${datePart}${branchCode}`),
      },
      { loadingNo: 1 },
      { sort: { loadingNo: -1 } }
    );
    
    let sequenceNumber = 1;
    if (latestLoadingForm) {
      // Extract sequence number from the latest loading form number
      const latestSequence = parseInt(latestLoadingForm.loadingNo.slice(-4), 10);
      if (!isNaN(latestSequence)) {
        sequenceNumber = latestSequence + 1;
      }
    }
    
    // Format sequence number to 4 digits
    const sequencePart = sequenceNumber.toString().padStart(4, '0');
    
    // Combine all parts to form the loading form number
    return `LF${datePart}${branchCode}${sequencePart}`;
  } catch (error) {
    throw new Error(`Error generating loading form number: ${error.message}`);
  }
};

/**
 * Add activity to history
 * @param {string} action - Activity action
 * @param {ObjectId} userId - User ID who performed the action
 * @param {Object} details - Additional details about the activity
 */
loadingFormSchema.methods.addActivity = function(action, userId, details = {}) {
  this.activityHistory.push({
    action,
    performedBy: userId,
    timestamp: new Date(),
    details,
  });
};

/**
 * Calculate totals (items, weight, volume)
 */
loadingFormSchema.methods.calculateTotals = function() {
  if (!this.shipments || this.shipments.length === 0) {
    this.totalItems = 0;
    this.totalWeight = 0;
    this.totalVolume = 0;
    return;
  }
  
  this.totalItems = this.shipments.length;
  
  // For weight and volume, we need to fetch the actual shipment data
  // This will typically be handled by the repository layer
};

const LoadingForm = mongoose.model('LoadingForm', loadingFormSchema);

module.exports = LoadingForm;
