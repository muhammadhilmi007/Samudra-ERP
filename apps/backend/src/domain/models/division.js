/**
 * Samudra Paket ERP - Division Model
 * Defines the schema for divisions in the organization
 */

const mongoose = require('mongoose');

const { Schema } = mongoose;

/**
 * Division Schema
 * Represents a division within the organization structure
 */
const divisionSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    branch: {
      type: Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
    },
    parentDivision: {
      type: Schema.Types.ObjectId,
      ref: 'Division',
      default: null,
    },
    level: {
      type: Number,
      default: 0,
    },
    head: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    metadata: {
      establishedDate: Date,
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
        // eslint-disable-next-line no-underscore-dangle
        delete ret.__v;
        return ret;
      },
    },
  },
);

// Virtual for getting child divisions
divisionSchema.virtual('childDivisions', {
  ref: 'Division',
  localField: '_id',
  foreignField: 'parentDivision',
});

// Pre-save hook to ensure level is set correctly based on parent
divisionSchema.pre('save', async function preSaveHook(next) {
  if (this.parentDivision) {
    try {
      const parentDivision = await this.constructor.findById(this.parentDivision);
      if (parentDivision) {
        this.level = parentDivision.level + 1;
      }
    } catch (error) {
      next(error);
    }
  }
  next();
});

// Static method to get full division hierarchy
divisionSchema.statics.getHierarchy = async function getHierarchy(divisionId = null) {
  const query = divisionId ? { _id: divisionId } : { parentDivision: null };

  const divisions = await this.find(query)
    .populate({
      path: 'childDivisions',
      populate: {
        path: 'childDivisions',
      },
    })
    .lean();

  return divisions;
};

// Method to get all descendants of a division
divisionSchema.methods.getAllDescendants = async function getAllDescendants() {
  const descendants = [];

  const getChildrenRecursively = async (divisionId) => {
    const children = await mongoose.model('Division').find({ parentDivision: divisionId });

    // Using Promise.all to handle async operations in parallel
    await Promise.all(
      children.map(async (child) => {
        descendants.push(child);
        await getChildrenRecursively(child._id);
      }),
    );
  };

  await getChildrenRecursively(this._id);
  return descendants;
};

// Create and export the model
const Division = mongoose.model('Division', divisionSchema);

module.exports = Division;
