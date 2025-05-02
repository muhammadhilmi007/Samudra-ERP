const mongoose = require('mongoose');

const { Schema } = mongoose;

/**
 * Employee Schema
 * Represents an employee in the system
 */
const employeeSchema = new Schema(
  {
    employeeId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false, // Not all employees might have user accounts
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    birthDate: {
      type: Date,
      required: true,
    },
    gender: {
      type: String,
      enum: ['male', 'female'],
      required: true,
    },
    maritalStatus: {
      type: String,
      enum: ['single', 'married', 'divorced', 'widowed'],
      required: true,
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
        required: true,
        trim: true,
        default: 'Indonesia',
      },
    },
    contact: {
      phone: {
        type: String,
        required: true,
        trim: true,
      },
      email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
      },
      emergencyContact: {
        type: String,
        required: true,
        trim: true,
      },
      emergencyPhone: {
        type: String,
        required: true,
        trim: true,
      },
    },
    position: {
      type: Schema.Types.ObjectId,
      ref: 'Position',
      required: true,
    },
    branch: {
      type: Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
    },
    joinDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'on_leave', 'terminated'],
      default: 'active',
      required: true,
    },
    documents: [
      {
        type: {
          type: String,
          enum: ['id_card', 'passport', 'driving_license', 'certificate', 'contract', 'other'],
          required: true,
        },
        number: {
          type: String,
          required: true,
          trim: true,
        },
        issuedDate: {
          type: Date,
          required: true,
        },
        expiryDate: {
          type: Date,
          required: false,
        },
        fileUrl: {
          type: String,
          required: false,
          trim: true,
        },
      },
    ],
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
  },
);

// Indexes for performance optimization
employeeSchema.index({ employeeId: 1 }, { unique: true });
employeeSchema.index({ position: 1 });
employeeSchema.index({ branch: 1 });
employeeSchema.index({ status: 1 });
employeeSchema.index({ 'contact.email': 1 });

// Create a full name virtual property
employeeSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Pre-save middleware to update the updatedAt field
employeeSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

// Create the Employee model
const Employee = mongoose.model('Employee', employeeSchema);

module.exports = Employee;
