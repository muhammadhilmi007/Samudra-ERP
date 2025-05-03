/**
 * Samudra Paket ERP - Pickup Item Model
 * Defines the schema for pickup items collected during pickup execution
 */

const mongoose = require('mongoose');
const { Schema } = mongoose;

// Schema for image documentation
const ImageSchema = new Schema({
  url: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['item', 'packaging', 'damage', 'document', 'signature', 'other'],
    default: 'item',
  },
  caption: {
    type: String,
    trim: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  takenBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
});

// Schema for dimensions
const DimensionSchema = new Schema({
  length: {
    type: Number,
    required: true,
    min: 0,
  },
  width: {
    type: Number,
    required: true,
    min: 0,
  },
  height: {
    type: Number,
    required: true,
    min: 0,
  },
  unit: {
    type: String,
    enum: ['cm', 'inch'],
    default: 'cm',
  },
});

// Schema for pickup item
const PickupItemSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    pickupRequest: {
      type: Schema.Types.ObjectId,
      ref: 'PickupRequest',
      required: true,
    },
    pickupAssignment: {
      type: Schema.Types.ObjectId,
      ref: 'PickupAssignment',
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ['document', 'parcel', 'electronics', 'fragile', 'perishable', 'dangerous', 'other'],
      default: 'parcel',
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    weight: {
      value: {
        type: Number,
        required: true,
        min: 0,
      },
      unit: {
        type: String,
        enum: ['kg', 'g', 'lb'],
        default: 'kg',
      },
    },
    dimensions: {
      type: DimensionSchema,
      required: true,
    },
    volumetricWeight: {
      type: Number,
      min: 0,
    },
    chargeableWeight: {
      type: Number,
      min: 0,
    },
    packaging: {
      type: String,
      enum: ['box', 'envelope', 'tube', 'pallet', 'crate', 'original', 'none', 'other'],
      default: 'box',
    },
    specialHandling: {
      required: {
        type: Boolean,
        default: false,
      },
      instructions: {
        type: String,
        trim: true,
      },
    },
    declaredValue: {
      type: Number,
      min: 0,
      default: 0,
    },
    insurance: {
      required: {
        type: Boolean,
        default: false,
      },
      value: {
        type: Number,
        min: 0,
        default: 0,
      },
    },
    images: [ImageSchema],
    signature: {
      image: {
        type: String,
      },
      name: {
        type: String,
        trim: true,
      },
      timestamp: {
        type: Date,
      },
    },
    notes: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'verified', 'rejected', 'processed', 'shipped'],
      default: 'pending',
    },
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    verifiedAt: {
      type: Date,
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
  },
  {
    timestamps: true,
  }
);

// Virtual for volumetric weight calculation (L x W x H / divisor)
PickupItemSchema.virtual('calculatedVolumetricWeight').get(function () {
  if (!this.dimensions) return 0;
  
  const { length, width, height, unit } = this.dimensions;
  const divisor = unit === 'cm' ? 5000 : 139; // 5000 for cm, 139 for inches
  
  return (length * width * height) / divisor;
});

// Pre-save hook to calculate volumetric and chargeable weight
PickupItemSchema.pre('save', function (next) {
  // Calculate volumetric weight
  this.volumetricWeight = this.calculatedVolumetricWeight;
  
  // Determine chargeable weight (greater of actual and volumetric)
  this.chargeableWeight = Math.max(this.weight.value, this.volumetricWeight);
  
  next();
});

// Static method to generate a unique code for a pickup item
PickupItemSchema.statics.generateCode = async function (pickupRequestId) {
  try {
    // Get the pickup request to access its code
    const PickupRequest = mongoose.model('PickupRequest');
    const pickupRequest = await PickupRequest.findById(pickupRequestId);
    
    if (!pickupRequest) {
      throw new Error('Pickup request not found');
    }
    
    // Get the base code from the pickup request
    const baseCode = pickupRequest.code;
    
    // Count existing items for this pickup request
    const count = await this.countDocuments({ pickupRequest: pickupRequestId });
    
    // Generate new code: PR code + item sequence (3 digits)
    const itemSequence = (count + 1).toString().padStart(3, '0');
    const code = `${baseCode}-${itemSequence}`;
    
    return code;
  } catch (error) {
    throw error;
  }
};

// Create and export the model
const PickupItem = mongoose.model('PickupItem', PickupItemSchema);

module.exports = PickupItem;
