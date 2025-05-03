/**
 * Samudra Paket ERP - Pickup Request Model
 * Defines the schema for pickup requests
 */

const mongoose = require('mongoose');
const { Schema } = mongoose;

const pickupRequestSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    customer: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
    },
    branch: {
      type: Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
    },
    pickupAddress: {
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
    contactPerson: {
      name: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
      email: String,
    },
    scheduledDate: {
      type: Date,
      required: true,
    },
    scheduledTimeWindow: {
      start: {
        type: String, // Format: HH:MM in 24-hour format
        required: true,
      },
      end: {
        type: String, // Format: HH:MM in 24-hour format
        required: true,
      },
    },
    items: [
      {
        description: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        weight: {
          value: {
            type: Number,
            min: 0,
          },
          unit: {
            type: String,
            enum: ['kg', 'g'],
            default: 'kg',
          },
        },
        dimensions: {
          length: Number,
          width: Number,
          height: Number,
          unit: {
            type: String,
            enum: ['cm', 'm'],
            default: 'cm',
          },
        },
        packageType: {
          type: String,
          enum: ['box', 'document', 'pallet', 'other'],
          default: 'box',
        },
        specialHandling: [String],
        notes: String,
      },
    ],
    estimatedTotalWeight: {
      value: {
        type: Number,
        min: 0,
      },
      unit: {
        type: String,
        enum: ['kg', 'g'],
        default: 'kg',
      },
    },
    status: {
      type: String,
      enum: [
        'pending', // Initial state when request is created
        'scheduled', // Assigned to a pickup team
        'in_progress', // Pickup team is on the way
        'arrived', // Pickup team has arrived at the location
        'completed', // Pickup has been completed successfully
        'cancelled', // Pickup was cancelled
        'failed', // Pickup attempt failed
        'rescheduled', // Pickup was rescheduled
      ],
      default: 'pending',
    },
    assignment: {
      team: {
        type: Schema.Types.ObjectId,
        ref: 'Employee', // Driver/team leader
      },
      vehicle: {
        type: Schema.Types.ObjectId,
        ref: 'Vehicle',
      },
      assignedAt: Date,
      assignedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    },
    execution: {
      startTime: Date, // When team started the journey
      arrivalTime: Date, // When team arrived at location
      completionTime: Date, // When pickup was completed
      actualItems: [
        {
          description: String,
          quantity: Number,
          weight: {
            value: Number,
            unit: {
              type: String,
              enum: ['kg', 'g'],
              default: 'kg',
            },
          },
          dimensions: {
            length: Number,
            width: Number,
            height: Number,
            unit: {
              type: String,
              enum: ['cm', 'm'],
              default: 'cm',
            },
          },
          photos: [String], // URLs to photos
          notes: String,
        },
      ],
      signatures: {
        customer: String, // URL to customer signature image
        driver: String, // URL to driver signature image
      },
      notes: String,
      issues: [
        {
          type: {
            type: String,
            enum: ['delay', 'damage', 'missing_item', 'address_issue', 'other'],
          },
          description: String,
          reportedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
          },
          reportedAt: {
            type: Date,
            default: Date.now,
          },
          resolved: {
            type: Boolean,
            default: false,
          },
          resolvedAt: Date,
          resolution: String,
        },
      ],
    },
    cancellation: {
      reason: String,
      cancelledBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
      cancelledAt: Date,
    },
    rescheduling: [
      {
        previousDate: Date,
        previousTimeWindow: {
          start: String,
          end: String,
        },
        newDate: Date,
        newTimeWindow: {
          start: String,
          end: String,
        },
        reason: String,
        rescheduledBy: {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
        rescheduledAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    priority: {
      type: String,
      enum: ['low', 'normal', 'high', 'urgent'],
      default: 'normal',
    },
    specialInstructions: String,
    notificationPreferences: {
      sms: {
        type: Boolean,
        default: false,
      },
      email: {
        type: Boolean,
        default: false,
      },
      whatsapp: {
        type: Boolean,
        default: false,
      },
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
    activityHistory: [
      {
        action: {
          type: String,
          required: true,
        },
        status: String,
        performedBy: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        details: Schema.Types.Mixed,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
pickupRequestSchema.index({ code: 1 });
pickupRequestSchema.index({ customer: 1 });
pickupRequestSchema.index({ branch: 1 });
pickupRequestSchema.index({ status: 1 });
pickupRequestSchema.index({ 'pickupAddress.city': 1 });
pickupRequestSchema.index({ 'pickupAddress.province': 1 });
pickupRequestSchema.index({ scheduledDate: 1 });
pickupRequestSchema.index({ 'assignment.team': 1 });
pickupRequestSchema.index({ 'assignment.vehicle': 1 });
pickupRequestSchema.index({ createdAt: 1 });
pickupRequestSchema.index({ priority: 1 });

// Generate a unique pickup request code
pickupRequestSchema.statics.generateCode = async function (branch) {
  const today = new Date();
  const year = today.getFullYear().toString().substr(-2);
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const day = today.getDate().toString().padStart(2, '0');
  const datePrefix = `PU${year}${month}${day}`;

  // Get branch code (if available)
  let branchPrefix = 'XX';
  if (branch) {
    try {
      const Branch = mongoose.model('Branch');
      const branchDoc = await Branch.findById(branch);
      if (branchDoc && branchDoc.code) {
        branchPrefix = branchDoc.code.substring(0, 2);
      }
    } catch (error) {
      console.error('Error getting branch code:', error);
    }
  }

  // Find the highest sequence number for today
  const latestPickup = await this.findOne({
    code: new RegExp(`^${datePrefix}${branchPrefix}\\d{4}$`),
  })
    .sort({ code: -1 })
    .exec();

  let sequenceNumber = 1;
  if (latestPickup) {
    const latestSequence = parseInt(latestPickup.code.slice(-4), 10);
    sequenceNumber = latestSequence + 1;
  }

  // Format the sequence number with leading zeros
  const sequenceStr = sequenceNumber.toString().padStart(4, '0');
  return `${datePrefix}${branchPrefix}${sequenceStr}`;
};

// Add activity to history
pickupRequestSchema.methods.addActivity = function (action, user, details = {}) {
  this.activityHistory.push({
    action,
    status: this.status,
    performedBy: user,
    timestamp: new Date(),
    details,
  });
};

const PickupRequest = mongoose.model('PickupRequest', pickupRequestSchema);

module.exports = PickupRequest;
