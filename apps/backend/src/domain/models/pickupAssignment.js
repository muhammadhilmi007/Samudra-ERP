/**
 * Samudra Paket ERP - Pickup Assignment Model
 * Defines the schema for pickup assignments
 */

const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * GPS Location Schema
 * Used for tracking vehicle location during pickup
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
 * Route Stop Schema
 * Represents a stop in the pickup route
 */
const routeStopSchema = new Schema({
  pickupRequest: {
    type: Schema.Types.ObjectId,
    ref: 'PickupRequest',
    required: true,
  },
  sequenceNumber: {
    type: Number,
    required: true,
    min: 1,
  },
  estimatedArrival: {
    type: Date,
  },
  actualArrival: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'skipped', 'failed'],
    default: 'pending',
  },
  notes: {
    type: String,
  },
  distance: {
    type: Number, // in kilometers from previous stop
    min: 0,
  },
  duration: {
    type: Number, // in minutes from previous stop
    min: 0,
  },
});

/**
 * Pickup Assignment Schema
 */
const pickupAssignmentSchema = new Schema({
  code: {
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
  assignmentDate: {
    type: Date,
    required: true,
  },
  team: {
    driver: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    helpers: [{
      type: Schema.Types.ObjectId,
      ref: 'Employee',
    }],
  },
  vehicle: {
    type: Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true,
  },
  status: {
    type: String,
    enum: ['planned', 'assigned', 'in_progress', 'completed', 'cancelled'],
    default: 'planned',
  },
  pickupRequests: [{
    type: Schema.Types.ObjectId,
    ref: 'PickupRequest',
  }],
  route: {
    optimized: {
      type: Boolean,
      default: false,
    },
    stops: [routeStopSchema],
    totalDistance: {
      type: Number, // in kilometers
      min: 0,
    },
    totalDuration: {
      type: Number, // in minutes
      min: 0,
    },
    startLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
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
    },
    endLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
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
    },
  },
  execution: {
    startTime: {
      type: Date,
    },
    endTime: {
      type: Date,
    },
    tracking: [gpsLocationSchema],
    notes: {
      type: String,
    },
    issues: [{
      type: {
        type: String,
        enum: ['vehicle_breakdown', 'traffic', 'weather', 'customer_unavailable', 'address_issue', 'other'],
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
      resolved: {
        type: Boolean,
        default: false,
      },
      resolvedAt: {
        type: Date,
      },
      resolution: {
        type: String,
      },
    }],
  },
  activityHistory: [{
    action: {
      type: String,
      enum: [
        'created', 
        'updated', 
        'status_updated', 
        'pickup_request_added', 
        'pickup_request_removed', 
        'route_optimized', 
        'started', 
        'completed', 
        'cancelled', 
        'issue_reported', 
        'issue_resolved'
      ],
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
  }],
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

// Indexes for efficient queries
pickupAssignmentSchema.index({ code: 1 });
pickupAssignmentSchema.index({ branch: 1, assignmentDate: 1 });
pickupAssignmentSchema.index({ 'team.driver': 1, assignmentDate: 1 });
pickupAssignmentSchema.index({ vehicle: 1, assignmentDate: 1 });
pickupAssignmentSchema.index({ status: 1, assignmentDate: 1 });
pickupAssignmentSchema.index({ pickupRequests: 1 });

/**
 * Generate a unique assignment code
 * Format: PA + YYMMDD + BR + XXXX (BR = Branch code, XXXX = Sequence number)
 * @param {ObjectId} branchId - Branch ID
 * @returns {Promise<string>} - Generated code
 */
pickupAssignmentSchema.statics.generateCode = async function(branchId) {
  const Branch = mongoose.model('Branch');
  const branch = await Branch.findById(branchId);
  
  if (!branch) {
    throw new Error('Branch not found');
  }
  
  // Get branch code (first 2 letters)
  const branchCode = branch.code.substring(0, 2).toUpperCase();
  
  // Get current date in YYMMDD format
  const now = new Date();
  const year = now.getFullYear().toString().substr(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const dateStr = `${year}${month}${day}`;
  
  // Find the last assignment for this branch and date
  const prefix = `PA${dateStr}${branchCode}`;
  const regex = new RegExp(`^${prefix}`);
  
  const lastAssignment = await this.findOne({ 
    code: { $regex: regex } 
  }).sort({ code: -1 });
  
  let sequenceNumber = 1;
  
  if (lastAssignment) {
    // Extract sequence number from the last code
    const lastSequence = parseInt(lastAssignment.code.substring(10), 10);
    sequenceNumber = lastSequence + 1;
  }
  
  // Format sequence number with leading zeros
  const sequenceStr = sequenceNumber.toString().padStart(4, '0');
  
  return `${prefix}${sequenceStr}`;
};

/**
 * Add activity to history
 * @param {string} action - Activity action
 * @param {ObjectId} userId - User ID who performed the action
 * @param {Object} details - Additional details about the activity
 */
pickupAssignmentSchema.methods.addActivity = function(action, userId, details = {}) {
  this.activityHistory.push({
    action,
    performedBy: userId,
    timestamp: new Date(),
    details,
  });
};

const PickupAssignment = mongoose.model('PickupAssignment', pickupAssignmentSchema);

module.exports = PickupAssignment;
