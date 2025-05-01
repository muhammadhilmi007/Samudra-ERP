/**
 * Samudra Paket ERP - Branch Model
 * Defines the schema for branches in the system
 */

const mongoose = require('mongoose');

const { Schema } = mongoose;

/**
 * Branch Schema
 * Represents a branch office in the organization
 */
const branchSchema = new Schema(
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
    address: {
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
        required: true,
      },
      country: {
        type: String,
        default: 'Indonesia',
      },
      coordinates: {
        latitude: Number,
        longitude: Number,
      },
    },
    contactInfo: {
      phone: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
      fax: String,
      website: String,
    },
    parentBranch: {
      type: Schema.Types.ObjectId,
      ref: 'Branch',
      default: null,
    },
    level: {
      type: Number,
      default: 0, // 0 = Head Office, 1 = Regional, 2 = Branch, etc.
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    operationalHours: {
      monday: { open: String, close: String },
      tuesday: { open: String, close: String },
      wednesday: { open: String, close: String },
      thursday: { open: String, close: String },
      friday: { open: String, close: String },
      saturday: { open: String, close: String },
      sunday: { open: String, close: String },
    },
    manager: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    divisions: [{
      name: {
        type: String,
        required: true,
      },
      code: {
        type: String,
        required: true,
      },
      description: String,
      head: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
      status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active',
      },
    }],
    metadata: {
      establishedDate: Date,
      capacity: Number,
      serviceArea: [String],
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
        delete ret.v;
        return ret;
      },
    },
  },
);

// Virtual for getting child branches
branchSchema.virtual('childBranches', {
  ref: 'Branch',
  localField: '_id',
  foreignField: 'parentBranch',
});

// Pre-save hook to ensure level is set correctly based on parent
branchSchema.pre('save', async function preSaveHook(next) {
  if (this.parentBranch) {
    try {
      const parentBranch = await this.constructor.findById(this.parentBranch);
      if (parentBranch) {
        this.level = parentBranch.level + 1;
      }
    } catch (error) {
      next(error);
    }
  }
  next();
});

// Static method to get full branch hierarchy
branchSchema.statics.getHierarchy = async function getHierarchy(branchId = null) {
  const query = branchId ? { _id: branchId } : { parentBranch: null };

  // Use a more robust approach with explicit population at each level
  const branches = await this.find(query)
    .populate({
      path: 'childBranches',
      populate: {
        path: 'childBranches',
        populate: {
          path: 'childBranches',
        },
      },
    })
    .lean();

  return branches;
};

// Method to get all descendants of a branch
branchSchema.methods.getAllDescendants = async function getAllDescendants() {
  const descendants = [];

  // Use a more efficient approach to get all descendants
  const getDescendantsRecursively = async (parentId) => {
    // Find all direct children
    const directChildren = await mongoose.model('Branch')
      .find({ parentBranch: parentId })
      .lean();

    // Add direct children to descendants array
    if (directChildren && directChildren.length > 0) {
      descendants.push(...directChildren);

      // Process each child's descendants recursively
      await Promise.all(
        directChildren.map((child) => getDescendantsRecursively(child._id)),
      );
    }
  };

  // Start the recursive process
  await getDescendantsRecursively(this._id);

  // Ensure we're returning all descendants
  return descendants;
};

// Create and export the model
const Branch = mongoose.model('Branch', branchSchema);

module.exports = Branch;
