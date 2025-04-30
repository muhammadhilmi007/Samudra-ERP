/* eslint-disable no-underscore-dangle */
/**
 * Samudra Paket ERP - Position Model
 * Defines the schema for positions in the organization
 */

const mongoose = require('mongoose');

const { Schema } = mongoose;

/**
 * Position Schema
 * Represents a job position within the organization structure
 */
const positionSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    division: {
      type: Schema.Types.ObjectId,
      ref: 'Division',
      required: true,
    },
    parentPosition: {
      type: Schema.Types.ObjectId,
      ref: 'Position',
      default: null,
    },
    level: {
      type: Number,
      default: 0,
    },
    responsibilities: [{
      type: String,
      trim: true,
    }],
    requirements: {
      education: String,
      experience: String,
      skills: [String],
      certifications: [String],
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    metadata: {
      createdDate: Date,
      salaryGrade: String,
      notes: String,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

// Virtual for getting child positions (reporting positions)
positionSchema.virtual('subordinatePositions', {
  ref: 'Position',
  localField: '_id',
  foreignField: 'parentPosition',
});

// Virtual for getting assigned employees
positionSchema.virtual('assignedEmployees', {
  ref: 'User',
  localField: '_id',
  foreignField: 'position',
});

// Pre-save hook to ensure level is set correctly based on parent
positionSchema.pre('save', async function preSaveHook(next) {
  if (this.parentPosition) {
    try {
      const parentPosition = await this.constructor.findById(this.parentPosition);
      if (parentPosition) {
        this.level = parentPosition.level + 1;
      }
    } catch (error) {
      next(error);
    }
  }
  next();
});

// Static method to get position hierarchy
positionSchema.statics.getHierarchy = async function getHierarchy(positionId = null) {
  const query = positionId ? { _id: positionId } : { parentPosition: null };

  const positions = await this.find(query)
    .populate({
      path: 'subordinatePositions',
      populate: {
        path: 'subordinatePositions',
      },
    })
    .lean();

  return positions;
};

// Method to get all subordinate positions
positionSchema.methods.getAllSubordinates = async function getAllSubordinates() {
  const subordinates = [];

  const getSubordinatesRecursively = async (positionId) => {
    const children = await mongoose.model('Position').find({ parentPosition: positionId });

    // Using Promise.all to handle async operations in parallel
    await Promise.all(children.map(async (child) => {
      subordinates.push(child);
      await getSubordinatesRecursively(child._id);
    }));
  };

  await getSubordinatesRecursively(this._id);
  return subordinates;
};

// Create and export the model
const Position = mongoose.model('Position', positionSchema);

module.exports = Position;
