/**
 * Samudra Paket ERP - Delivery Order Model
 * Defines the schema for delivery orders in the system
 */

const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * Schema for delivery items
 * Represents individual items to be delivered
 */
const deliveryItemSchema = new Schema({
  shipmentOrder: {
    type: Schema.Types.ObjectId,
    ref: 'ShipmentOrder',
    required: true,
  },
  waybillNumber: {
    type: String,
    required: true,
  },
  receiverName: {
    type: String,
    required: true,
  },
  receiverAddress: {
    type: String,
    required: true,
  },
  receiverPhone: {
    type: String,
    required: true,
  },
  receiverEmail: {
    type: String,
  },
  itemDescription: {
    type: String,
    required: true,
  },
  weight: {
    type: Number,
    required: true,
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
  },
  volume: {
    type: Number,
  },
  quantity: {
    type: Number,
    default: 1,
  },
  specialHandling: {
    type: Boolean,
    default: false,
  },
  specialHandlingNotes: {
    type: String,
  },
  paymentType: {
    type: String,
    enum: ['CASH', 'COD', 'CAD'],
    required: true,
  },
  codAmount: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: [
      'pending',
      'assigned',
      'in_transit',
      'delivered',
      'failed',
      'returned',
      'cancelled',
    ],
    default: 'pending',
  },
  statusHistory: [{
    status: {
      type: String,
      enum: [
        'pending',
        'assigned',
        'in_transit',
        'delivered',
        'failed',
        'returned',
        'cancelled',
      ],
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    notes: String,
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
      address: String,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  }],
  deliveryAttempts: [{
    attemptNumber: {
      type: Number,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['successful', 'failed'],
      required: true,
    },
    reason: String,
    notes: String,
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
      },
      address: String,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    photos: [{
      url: String,
      caption: String,
      timestamp: {
        type: Date,
        default: Date.now,
      },
    }],
  }],
  proofOfDelivery: {
    deliveredTo: String,
    relationship: String,
    idNumber: String,
    signature: String,
    photos: [{
      url: String,
      caption: String,
      timestamp: {
        type: Date,
        default: Date.now,
      },
    }],
    notes: String,
    timestamp: Date,
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
      },
      address: String,
    },
    codCollected: {
      type: Boolean,
      default: false,
    },
    codAmount: {
      type: Number,
      default: 0,
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'transfer', 'other'],
    },
    paymentNotes: String,
  },
});

/**
 * Schema for route stops
 * Represents individual stops in a delivery route
 */
const routeStopSchema = new Schema({
  sequenceNumber: {
    type: Number,
    required: true,
  },
  deliveryItem: {
    type: Schema.Types.ObjectId,
    ref: 'DeliveryItem',
    required: true,
  },
  estimatedArrival: {
    type: Date,
  },
  actualArrival: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'skipped', 'failed'],
    default: 'pending',
  },
  notes: String,
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
  },
  timeSpent: {
    type: Number, // in minutes
  },
});

/**
 * Schema for delivery orders
 * Represents a delivery assignment for a driver
 */
const deliveryOrderSchema = new Schema({
  deliveryOrderNo: {
    type: String,
    required: true,
    unique: true,
  },
  branch: {
    type: Schema.Types.ObjectId,
    ref: 'Branch',
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
  vehicle: {
    type: Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true,
  },
  deliveryDate: {
    type: Date,
    required: true,
  },
  deliveryItems: [deliveryItemSchema],
  route: {
    optimized: {
      type: Boolean,
      default: false,
    },
    totalDistance: {
      type: Number, // in kilometers
    },
    estimatedDuration: {
      type: Number, // in minutes
    },
    startLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
      address: {
        type: String,
        required: true,
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
        required: true,
      },
      address: {
        type: String,
        required: true,
      },
    },
    stops: [routeStopSchema],
  },
  status: {
    type: String,
    enum: [
      'planning',
      'assigned',
      'in_progress',
      'completed',
      'partially_completed',
      'cancelled',
    ],
    default: 'planning',
  },
  statusHistory: [{
    status: {
      type: String,
      enum: [
        'planning',
        'assigned',
        'in_progress',
        'completed',
        'partially_completed',
        'cancelled',
      ],
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    notes: String,
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  }],
  tracking: [{
    timestamp: {
      type: Date,
      default: Date.now,
    },
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    speed: {
      type: Number, // in km/h
    },
    heading: {
      type: Number, // in degrees
    },
    accuracy: {
      type: Number, // in meters
    },
    address: String,
    provider: String, // gps, network, etc.
  }],
  summary: {
    totalItems: {
      type: Number,
      default: 0,
    },
    deliveredItems: {
      type: Number,
      default: 0,
    },
    failedItems: {
      type: Number,
      default: 0,
    },
    returnedItems: {
      type: Number,
      default: 0,
    },
    totalCodAmount: {
      type: Number,
      default: 0,
    },
    collectedCodAmount: {
      type: Number,
      default: 0,
    },
    startTime: Date,
    endTime: Date,
    totalDuration: {
      type: Number, // in minutes
    },
    totalDistance: {
      type: Number, // in kilometers
    },
    fuelConsumption: {
      type: Number, // in liters
    },
  },
  issues: [{
    type: {
      type: String,
      enum: ['vehicle', 'traffic', 'weather', 'customer', 'other'],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    reportedAt: {
      type: Date,
      default: Date.now,
    },
    reportedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
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
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
      },
      address: String,
    },
  }],
  activityHistory: [{
    action: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    details: Schema.Types.Mixed,
  }],
  notes: String,
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  updatedAt: Date,
}, {
  timestamps: true,
});

// Create geospatial indexes for efficient location queries
deliveryOrderSchema.index({ 'route.startLocation.coordinates': '2dsphere' });
deliveryOrderSchema.index({ 'route.endLocation.coordinates': '2dsphere' });
deliveryOrderSchema.index({ 'route.stops.location.coordinates': '2dsphere' });
deliveryOrderSchema.index({ 'deliveryItems.receiverAddress': 'text' });

/**
 * Generate a unique delivery order number
 * Format: DO-YYMMDD-BRXXX-NNN where:
 * - YYMMDD is the date
 * - BRXXX is the branch code
 * - NNN is a sequential number
 * 
 * @param {String} branchId - The branch ID
 * @returns {Promise<String>} - The generated delivery order number
 */
deliveryOrderSchema.statics.generateDeliveryOrderNo = async function(branchId) {
  try {
    const Branch = mongoose.model('Branch');
    const branch = await Branch.findById(branchId);
    
    if (!branch) {
      throw new Error('Branch not found');
    }
    
    const branchCode = branch.code;
    const today = new Date();
    const dateStr = today.toISOString().slice(2, 10).replace(/-/g, '');
    
    // Find the latest delivery order for this branch and date
    const latestDeliveryOrder = await this.findOne({
      deliveryOrderNo: new RegExp(`DO-${dateStr}-${branchCode}-\\d{3}$`),
    }).sort({ deliveryOrderNo: -1 });
    
    let sequenceNumber = 1;
    
    if (latestDeliveryOrder) {
      // Extract the sequence number from the latest delivery order
      const latestSequence = parseInt(latestDeliveryOrder.deliveryOrderNo.slice(-3), 10);
      sequenceNumber = latestSequence + 1;
    }
    
    // Format the sequence number with leading zeros
    const formattedSequence = sequenceNumber.toString().padStart(3, '0');
    
    return `DO-${dateStr}-${branchCode}-${formattedSequence}`;
  } catch (error) {
    throw new Error(`Failed to generate delivery order number: ${error.message}`);
  }
};

/**
 * Add an activity to the delivery order's activity history
 * 
 * @param {String} action - The action performed
 * @param {String} userId - The user who performed the action
 * @param {Object} details - Additional details about the action
 */
deliveryOrderSchema.methods.addActivity = function(action, userId, details = {}) {
  this.activityHistory.push({
    action,
    user: userId,
    details,
    timestamp: new Date(),
  });
};

/**
 * Update delivery order summary based on delivery items
 */
deliveryOrderSchema.methods.updateSummary = function() {
  const summary = {
    totalItems: this.deliveryItems.length,
    deliveredItems: 0,
    failedItems: 0,
    returnedItems: 0,
    totalCodAmount: 0,
    collectedCodAmount: 0,
  };
  
  this.deliveryItems.forEach(item => {
    if (item.paymentType === 'COD') {
      summary.totalCodAmount += item.codAmount || 0;
      
      if (item.proofOfDelivery && item.proofOfDelivery.codCollected) {
        summary.collectedCodAmount += item.proofOfDelivery.codAmount || 0;
      }
    }
    
    if (item.status === 'delivered') {
      summary.deliveredItems += 1;
    } else if (item.status === 'failed') {
      summary.failedItems += 1;
    } else if (item.status === 'returned') {
      summary.returnedItems += 1;
    }
  });
  
  // Calculate duration if start and end times are available
  if (this.summary.startTime && this.summary.endTime) {
    const duration = (this.summary.endTime - this.summary.startTime) / (1000 * 60); // in minutes
    summary.totalDuration = Math.round(duration);
  }
  
  this.summary = {
    ...this.summary,
    ...summary,
  };
};

/**
 * Add GPS location to tracking
 * 
 * @param {Object} locationData - The location data to add
 */
deliveryOrderSchema.methods.addTrackingLocation = function(locationData) {
  const { coordinates, speed, heading, accuracy, address, provider } = locationData;
  
  this.tracking.push({
    timestamp: new Date(),
    coordinates: {
      type: 'Point',
      coordinates,
    },
    speed,
    heading,
    accuracy,
    address,
    provider,
  });
};

/**
 * Calculate estimated time of arrival for each stop based on current location
 * 
 * @param {Array} currentCoordinates - [longitude, latitude] of current position
 * @param {Number} averageSpeed - Average speed in km/h
 * @returns {Promise<Object>} - Updated route with ETAs
 */
deliveryOrderSchema.methods.calculateETAs = async function(currentCoordinates, averageSpeed = 30) {
  try {
    if (!this.route || !this.route.stops || this.route.stops.length === 0) {
      throw new Error('No route stops defined');
    }
    
    let lastCoordinates = currentCoordinates || this.route.startLocation.coordinates;
    let cumulativeTime = 0; // in minutes
    const now = new Date();
    
    // Update ETAs for each stop
    for (let i = 0; i < this.route.stops.length; i++) {
      const stop = this.route.stops[i];
      
      // Skip stops that are already completed
      if (stop.status === 'completed' || stop.status === 'skipped') {
        lastCoordinates = stop.location.coordinates;
        continue;
      }
      
      // Calculate distance from last point to this stop
      const distance = calculateDistance(lastCoordinates, stop.location.coordinates);
      
      // Calculate time in minutes based on average speed
      const timeToReach = (distance / averageSpeed) * 60;
      
      // Add time to cumulative time
      cumulativeTime += timeToReach;
      
      // Set estimated arrival time
      const eta = new Date(now.getTime() + (cumulativeTime * 60 * 1000));
      this.route.stops[i].estimatedArrival = eta;
      
      // Update last coordinates
      lastCoordinates = stop.location.coordinates;
    }
    
    return this.route;
  } catch (error) {
    throw new Error(`Failed to calculate ETAs: ${error.message}`);
  }
};

/**
 * Calculate distance between two coordinates using Haversine formula
 * 
 * @param {Array} coord1 - [longitude, latitude] of first point
 * @param {Array} coord2 - [longitude, latitude] of second point
 * @returns {Number} - Distance in kilometers
 */
function calculateDistance(coord1, coord2) {
  const [lon1, lat1] = coord1;
  const [lon2, lat2] = coord2;
  
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in km
  
  return distance;
}

const DeliveryOrder = mongoose.model('DeliveryOrder', deliveryOrderSchema);

module.exports = DeliveryOrder;
