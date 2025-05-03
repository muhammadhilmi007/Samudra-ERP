/**
 * Samudra Paket ERP - Shipment Model
 * Defines the schema for inter-branch shipments
 */

const mongoose = require('mongoose');
const { Schema } = mongoose;
const Branch = require('./branch');

/**
 * GPS Location Schema
 * Used for tracking vehicle location during shipment
 */
const gpsLocationSchema = new Schema({
  timestamp: {
    type: Date,
    required: true,
    default: Date.now,
  },
  coordinates: {
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
    }
  },
  speed: {
    type: Number, // km/h
    min: 0,
  },
  heading: {
    type: Number, // degrees (0-360)
    min: 0,
    max: 360,
  },
  accuracy: {
    type: Number, // meters
    min: 0,
  },
  address: {
    type: String,
  },
  provider: {
    type: String,
    enum: ['gps', 'network', 'manual'],
    default: 'gps',
  },
});

/**
 * Status History Schema
 * Tracks status changes of the shipment
 */
const statusHistorySchema = new Schema({
  status: {
    type: String,
    enum: [
      'preparing', 
      'departed', 
      'in_transit', 
      'arrived_at_destination', 
      'unloaded', 
      'completed', 
      'cancelled',
      'delayed'
    ],
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true,
  },
  location: {
    type: String,
  },
  notes: {
    type: String,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

/**
 * Issue Schema
 * Tracks issues that occur during shipment
 */
const issueSchema = new Schema({
  type: {
    type: String,
    enum: ['mechanical', 'traffic', 'weather', 'security', 'other'],
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  reportedAt: {
    type: Date,
    default: Date.now,
    required: true,
  },
  reportedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  location: {
    type: String,
  },
  coordinates: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
    }
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    required: true,
  },
  status: {
    type: String,
    enum: ['reported', 'in_progress', 'resolved'],
    default: 'reported',
  },
  resolution: {
    description: String,
    resolvedAt: Date,
    resolvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
});

/**
 * Checkpoint Schema
 * Defines planned checkpoints during the shipment journey
 */
const checkpointSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['rest', 'fuel', 'inspection', 'custom'],
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  coordinates: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
    }
  },
  estimatedArrival: {
    type: Date,
  },
  actualArrival: {
    type: Date,
  },
  estimatedDeparture: {
    type: Date,
  },
  actualDeparture: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['planned', 'arrived', 'departed', 'skipped'],
    default: 'planned',
  },
  notes: {
    type: String,
  },
});

/**
 * Activity History Schema
 * Tracks activities related to the shipment
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
 * Shipment Schema
 */
const shipmentSchema = new Schema(
  {
    shipmentNo: {
      type: String,
      required: true,
      unique: true,
    },
    loadingForm: {
      type: Schema.Types.ObjectId,
      ref: 'LoadingForm',
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
    departureDate: {
      type: Date,
      required: true,
    },
    estimatedArrival: {
      type: Date,
      required: true,
    },
    actualArrival: {
      type: Date,
    },
    distance: {
      type: Number, // in kilometers
      required: true,
      min: 0,
    },
    estimatedDuration: {
      type: Number, // in minutes
      required: true,
      min: 0,
    },
    actualDuration: {
      type: Number, // in minutes
      min: 0,
    },
    route: {
      type: String, // Route description or reference
    },
    status: {
      type: String,
      enum: [
        'preparing', 
        'departed', 
        'in_transit', 
        'arrived_at_destination', 
        'unloaded', 
        'completed', 
        'cancelled',
        'delayed'
      ],
      default: 'preparing',
    },
    statusHistory: [statusHistorySchema],
    tracking: [gpsLocationSchema],
    checkpoints: [checkpointSchema],
    issues: [issueSchema],
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
 * Generate a unique shipment number
 * Format: SP + YYMMDD + BR + XXXX (BR = Branch code, XXXX = Sequence number)
 * @param {ObjectId} branchId - Branch ID
 * @returns {Promise<string>} - Generated shipment number
 */
shipmentSchema.statics.generateShipmentNo = async function(branchId) {
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
    
    // Find the latest shipment for this branch and date
    const latestShipment = await this.findOne(
      { 
        shipmentNo: new RegExp(`^SP${datePart}${branchCode}`),
      },
      { shipmentNo: 1 },
      { sort: { shipmentNo: -1 } }
    );
    
    let sequenceNumber = 1;
    if (latestShipment) {
      // Extract sequence number from the latest shipment number
      const latestSequence = parseInt(latestShipment.shipmentNo.slice(-4), 10);
      if (!isNaN(latestSequence)) {
        sequenceNumber = latestSequence + 1;
      }
    }
    
    // Format sequence number to 4 digits
    const sequencePart = sequenceNumber.toString().padStart(4, '0');
    
    // Combine all parts to form the shipment number
    return `SP${datePart}${branchCode}${sequencePart}`;
  } catch (error) {
    throw new Error(`Error generating shipment number: ${error.message}`);
  }
};

/**
 * Add activity to history
 * @param {string} action - Activity action
 * @param {ObjectId} userId - User ID who performed the action
 * @param {Object} details - Additional details about the activity
 */
shipmentSchema.methods.addActivity = function(action, userId, details = {}) {
  this.activityHistory.push({
    action,
    performedBy: userId,
    timestamp: new Date(),
    details,
  });
};

/**
 * Calculate ETA based on current position, speed, and remaining distance
 * @returns {Date} - Estimated time of arrival
 */
shipmentSchema.methods.calculateETA = function() {
  // If already arrived, return actual arrival time
  if (this.actualArrival) {
    return this.actualArrival;
  }
  
  // If no tracking data, return the original estimated arrival
  if (!this.tracking || this.tracking.length === 0) {
    return this.estimatedArrival;
  }
  
  // Get the latest tracking point
  const latestTracking = this.tracking[this.tracking.length - 1];
  
  // If no speed data available, return the original estimated arrival
  if (!latestTracking.speed || latestTracking.speed === 0) {
    return this.estimatedArrival;
  }
  
  // Calculate remaining distance (simplified - would need actual route calculation)
  // This is a simplification - in a real system, you would calculate the actual remaining distance
  const remainingDistance = this.distance * 0.3; // Assuming 30% of the journey remains
  
  // Calculate remaining time in hours
  const remainingTimeHours = remainingDistance / latestTracking.speed;
  
  // Calculate new ETA
  const newETA = new Date(latestTracking.timestamp);
  newETA.setHours(newETA.getHours() + remainingTimeHours);
  
  return newETA;
};

/**
 * Add GPS location to tracking
 * @param {Object} locationData - GPS location data
 */
shipmentSchema.methods.addTrackingLocation = function(locationData) {
  this.tracking.push(locationData);
  
  // Update status to in_transit if currently departed
  if (this.status === 'departed') {
    this.status = 'in_transit';
    this.statusHistory.push({
      status: 'in_transit',
      timestamp: new Date(),
      location: locationData.address || 'Unknown location',
      notes: 'Automatically updated based on GPS tracking',
      user: this.updatedBy || this.createdBy,
    });
  }
};

const Shipment = mongoose.model('Shipment', shipmentSchema);

module.exports = Shipment;
