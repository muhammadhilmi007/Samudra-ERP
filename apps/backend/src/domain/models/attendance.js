const mongoose = require('mongoose');

const { Schema } = mongoose;

/**
 * Attendance Schema
 * Represents an employee attendance record in the system
 */
const attendanceSchema = new Schema(
  {
    employee: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    checkIn: {
      time: {
        type: Date,
        required: false,
      },
      location: {
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point',
        },
        coordinates: {
          type: [Number], // [longitude, latitude]
          required: false,
        },
      },
      device: {
        type: String,
        required: false,
        trim: true,
      },
      ipAddress: {
        type: String,
        required: false,
        trim: true,
      },
      notes: {
        type: String,
        required: false,
        trim: true,
      },
    },
    checkOut: {
      time: {
        type: Date,
        required: false,
      },
      location: {
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point',
        },
        coordinates: {
          type: [Number], // [longitude, latitude]
          required: false,
        },
      },
      device: {
        type: String,
        required: false,
        trim: true,
      },
      ipAddress: {
        type: String,
        required: false,
        trim: true,
      },
      notes: {
        type: String,
        required: false,
        trim: true,
      },
    },
    status: {
      type: String,
      enum: ['present', 'absent', 'late', 'half_day', 'leave'],
      default: 'present',
      required: true,
    },
    workHours: {
      type: Number,
      required: false,
      default: 0,
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
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });
attendanceSchema.index({ branch: 1 });
attendanceSchema.index({ date: 1 });
attendanceSchema.index({ status: 1 });

// Pre-save middleware to update workHours if both checkIn and checkOut exist
attendanceSchema.pre('save', function (next) {
  this.updatedAt = new Date();

  if (this.checkIn && this.checkIn.time && this.checkOut && this.checkOut.time) {
    const checkInTime = new Date(this.checkIn.time);
    const checkOutTime = new Date(this.checkOut.time);

    // Calculate work hours (in hours, with 2 decimal places)
    const diffMs = checkOutTime - checkInTime;
    this.workHours = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;
  }

  next();
});

// Create the Attendance model
const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;
