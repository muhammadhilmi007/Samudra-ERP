const mongoose = require('mongoose');

const { Schema } = mongoose;

/**
 * Leave Schema
 * Represents an employee leave request in the system
 */
const leaveSchema = new Schema(
  {
    employee: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    leaveType: {
      type: String,
      enum: ['annual', 'sick', 'maternity', 'paternity', 'bereavement', 'unpaid', 'other'],
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    totalDays: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    attachments: [
      {
        fileUrl: {
          type: String,
          required: true,
          trim: true,
        },
        fileName: {
          type: String,
          required: true,
          trim: true,
        },
        fileType: {
          type: String,
          required: true,
          trim: true,
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'cancelled'],
      default: 'pending',
      required: true,
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    approvedAt: {
      type: Date,
      required: false,
    },
    rejectionReason: {
      type: String,
      required: false,
      trim: true,
    },
    branch: {
      type: Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance optimization
leaveSchema.index({ employee: 1 });
leaveSchema.index({ branch: 1 });
leaveSchema.index({ startDate: 1, endDate: 1 });
leaveSchema.index({ status: 1 });
leaveSchema.index({ leaveType: 1 });

// Pre-save middleware to calculate total days if not provided
leaveSchema.pre('save', function (next) {
  this.updatedAt = new Date();

  if (!this.totalDays && this.startDate && this.endDate) {
    const startDate = new Date(this.startDate);
    const endDate = new Date(this.endDate);

    // Calculate total days (including weekends and holidays)
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates
    this.totalDays = diffDays;
  }

  next();
});

// Create the Leave model
const Leave = mongoose.model('Leave', leaveSchema);

module.exports = Leave;
