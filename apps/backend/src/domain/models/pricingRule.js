/**
 * Samudra Paket ERP - Pricing Rule Model
 * Defines the schema for pricing rules used in shipment cost calculations
 */

const mongoose = require('mongoose');
const { Schema } = mongoose;

// Schema for weight-based pricing tiers
const WeightTierSchema = new Schema({
  minWeight: {
    type: Number,
    required: true,
    min: 0,
  },
  maxWeight: {
    type: Number,
    min: 0,
  },
  pricePerKg: {
    type: Number,
    required: true,
    min: 0,
  },
  flatPrice: {
    type: Number,
    min: 0,
    default: 0,
  },
});

// Schema for distance-based pricing tiers
const DistanceTierSchema = new Schema({
  minDistance: {
    type: Number,
    required: true,
    min: 0,
  },
  maxDistance: {
    type: Number,
    min: 0,
  },
  pricePerKm: {
    type: Number,
    required: true,
    min: 0,
  },
  flatPrice: {
    type: Number,
    min: 0,
    default: 0,
  },
});

// Schema for special service pricing
const SpecialServiceSchema = new Schema({
  serviceCode: {
    type: String,
    required: true,
    trim: true,
  },
  serviceName: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  isPercentage: {
    type: Boolean,
    default: false,
  },
  applicableServiceTypes: {
    type: [String],
    default: ['regular', 'express', 'same_day', 'next_day', 'economy'],
  },
});

// Schema for discount rules
const DiscountSchema = new Schema({
  code: {
    type: String,
    trim: true,
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
  discountType: {
    type: String,
    required: true,
    enum: ['percentage', 'fixed', 'free_service'],
    default: 'percentage',
  },
  value: {
    type: Number,
    required: true,
    min: 0,
  },
  maxDiscountAmount: {
    type: Number,
    min: 0,
  },
  minOrderValue: {
    type: Number,
    min: 0,
    default: 0,
  },
  applicableServiceTypes: {
    type: [String],
    default: ['regular', 'express', 'same_day', 'next_day', 'economy'],
  },
  applicableCustomerTypes: {
    type: [String],
    default: ['regular', 'corporate', 'vip'],
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
  },
  usageLimit: {
    type: Number,
    min: 0,
  },
  usageCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

// Main Pricing Rule Schema
const PricingRuleSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
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
    serviceType: {
      type: String,
      required: true,
      enum: ['regular', 'express', 'same_day', 'next_day', 'economy'],
      default: 'regular',
    },
    originArea: {
      province: {
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
        trim: true,
      },
    },
    destinationArea: {
      province: {
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
        trim: true,
      },
    },
    pricingType: {
      type: String,
      required: true,
      enum: ['weight', 'distance', 'flat', 'combined'],
      default: 'weight',
    },
    basePrice: {
      type: Number,
      min: 0,
      default: 0,
    },
    minimumPrice: {
      type: Number,
      min: 0,
      default: 0,
    },
    weightTiers: [WeightTierSchema],
    distanceTiers: [DistanceTierSchema],
    specialServices: [SpecialServiceSchema],
    discounts: [DiscountSchema],
    taxPercentage: {
      type: Number,
      min: 0,
      default: 11, // Default tax rate 11%
    },
    insurancePercentage: {
      type: Number,
      min: 0,
      default: 0.2, // Default insurance rate 0.2%
    },
    volumetricDivisor: {
      type: Number,
      min: 1,
      default: 5000, // Default volumetric divisor for cm³ to kg conversion
    },
    effectiveDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
    },
    priority: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    branch: {
      type: Schema.Types.ObjectId,
      ref: 'Branch',
    },
    applicableCustomerTypes: {
      type: [String],
      default: ['regular', 'corporate', 'vip'],
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

/**
 * Calculate price based on weight
 * @param {number} weight - Weight in kg
 * @returns {number} - Calculated price
 */
PricingRuleSchema.methods.calculateWeightPrice = function (weight) {
  // If no weight tiers are defined, return base price
  if (!this.weightTiers || this.weightTiers.length === 0) {
    return this.basePrice;
  }

  // Find the applicable weight tier
  const applicableTier = this.weightTiers.find(
    (tier) => weight >= tier.minWeight && (!tier.maxWeight || weight <= tier.maxWeight)
  );

  // If no applicable tier found, use the last tier
  if (!applicableTier && this.weightTiers.length > 0) {
    const lastTier = this.weightTiers[this.weightTiers.length - 1];
    return lastTier.flatPrice + (weight * lastTier.pricePerKg);
  }

  // Calculate price based on the tier
  if (applicableTier) {
    return applicableTier.flatPrice + (weight * applicableTier.pricePerKg);
  }

  // Fallback to base price if no tiers match
  return this.basePrice;
};

/**
 * Calculate price based on distance
 * @param {number} distance - Distance in km
 * @returns {number} - Calculated price
 */
PricingRuleSchema.methods.calculateDistancePrice = function (distance) {
  // If no distance tiers are defined, return base price
  if (!this.distanceTiers || this.distanceTiers.length === 0) {
    return this.basePrice;
  }

  // Find the applicable distance tier
  const applicableTier = this.distanceTiers.find(
    (tier) => distance >= tier.minDistance && (!tier.maxDistance || distance <= tier.maxDistance)
  );

  // If no applicable tier found, use the last tier
  if (!applicableTier && this.distanceTiers.length > 0) {
    const lastTier = this.distanceTiers[this.distanceTiers.length - 1];
    return lastTier.flatPrice + (distance * lastTier.pricePerKm);
  }

  // Calculate price based on the tier
  if (applicableTier) {
    return applicableTier.flatPrice + (distance * applicableTier.pricePerKm);
  }

  // Fallback to base price if no tiers match
  return this.basePrice;
};

/**
 * Calculate price for special services
 * @param {Array} selectedServices - Array of service codes
 * @param {number} baseAmount - Base amount for percentage-based services
 * @returns {number} - Total price for special services
 */
PricingRuleSchema.methods.calculateSpecialServicesPrice = function (selectedServices, baseAmount = 0) {
  if (!selectedServices || selectedServices.length === 0 || !this.specialServices || this.specialServices.length === 0) {
    return 0;
  }

  let totalPrice = 0;

  // Filter special services that match the selected services
  const applicableServices = this.specialServices.filter(
    (service) => selectedServices.includes(service.serviceCode) && 
    service.applicableServiceTypes.includes(this.serviceType)
  );

  // Calculate total price for all applicable services
  applicableServices.forEach((service) => {
    if (service.isPercentage) {
      totalPrice += (baseAmount * service.price) / 100;
    } else {
      totalPrice += service.price;
    }
  });

  return totalPrice;
};

/**
 * Calculate discount amount
 * @param {Object} params - Parameters for discount calculation
 * @param {string} params.discountCode - Discount code (optional)
 * @param {string} params.customerType - Customer type
 * @param {number} params.subtotal - Subtotal amount before discount
 * @returns {number} - Discount amount
 */
PricingRuleSchema.methods.calculateDiscount = function ({ discountCode, customerType, subtotal }) {
  if (!this.discounts || this.discounts.length === 0 || subtotal <= 0) {
    return 0;
  }

  // Find applicable discounts
  const now = new Date();
  const applicableDiscounts = this.discounts.filter((discount) => {
    // Check if discount is active
    if (!discount.isActive) return false;

    // Check date validity
    if (discount.startDate > now) return false;
    if (discount.endDate && discount.endDate < now) return false;

    // Check usage limit
    if (discount.usageLimit && discount.usageCount >= discount.usageLimit) return false;

    // Check minimum order value
    if (subtotal < discount.minOrderValue) return false;

    // Check if customer type is applicable
    if (!discount.applicableCustomerTypes.includes(customerType)) return false;

    // Check if service type is applicable
    if (!discount.applicableServiceTypes.includes(this.serviceType)) return false;

    // Check discount code if provided
    if (discountCode && discount.code && discount.code !== discountCode) return false;

    return true;
  });

  // If no applicable discounts, return 0
  if (applicableDiscounts.length === 0) {
    return 0;
  }

  // Sort discounts by value (highest first)
  applicableDiscounts.sort((a, b) => {
    if (a.discountType === 'percentage' && b.discountType === 'percentage') {
      return b.value - a.value;
    }
    if (a.discountType === 'fixed' && b.discountType === 'fixed') {
      return b.value - a.value;
    }
    // Prioritize fixed discounts over percentage discounts
    return a.discountType === 'fixed' ? -1 : 1;
  });

  // Apply the best discount
  const bestDiscount = applicableDiscounts[0];
  let discountAmount = 0;

  switch (bestDiscount.discountType) {
    case 'percentage':
      discountAmount = (subtotal * bestDiscount.value) / 100;
      // Apply maximum discount amount if specified
      if (bestDiscount.maxDiscountAmount && discountAmount > bestDiscount.maxDiscountAmount) {
        discountAmount = bestDiscount.maxDiscountAmount;
      }
      break;
    case 'fixed':
      discountAmount = bestDiscount.value;
      // Ensure discount doesn't exceed subtotal
      if (discountAmount > subtotal) {
        discountAmount = subtotal;
      }
      break;
    case 'free_service':
      // This would typically be handled separately for specific services
      discountAmount = 0;
      break;
    default:
      discountAmount = 0;
  }

  return discountAmount;
};

/**
 * Calculate total price for a shipment
 * @param {Object} params - Parameters for price calculation
 * @param {number} params.weight - Weight in kg
 * @param {number} params.distance - Distance in km (optional)
 * @param {number} params.volumetricWeight - Volumetric weight in kg (optional)
 * @param {Array} params.specialServices - Array of special service codes (optional)
 * @param {string} params.discountCode - Discount code (optional)
 * @param {string} params.customerType - Customer type (default: 'regular')
 * @param {number} params.declaredValue - Declared value for insurance calculation (optional)
 * @returns {Object} - Detailed price breakdown
 */
PricingRuleSchema.methods.calculateTotalPrice = function ({
  weight,
  distance = 0,
  volumetricWeight = 0,
  specialServices = [],
  discountCode = null,
  customerType = 'regular',
  declaredValue = 0,
}) {
  // Use the greater of actual weight and volumetric weight
  const chargeableWeight = Math.max(weight, volumetricWeight);

  let baseRate = 0;

  // Calculate base rate according to pricing type
  switch (this.pricingType) {
    case 'weight':
      baseRate = this.calculateWeightPrice(chargeableWeight);
      break;
    case 'distance':
      baseRate = this.calculateDistancePrice(distance);
      break;
    case 'flat':
      baseRate = this.basePrice;
      break;
    case 'combined':
      // Combined pricing uses both weight and distance
      const weightPrice = this.calculateWeightPrice(chargeableWeight);
      const distancePrice = this.calculateDistancePrice(distance);
      baseRate = weightPrice + distancePrice;
      break;
    default:
      baseRate = this.basePrice;
  }

  // Apply minimum price if base rate is lower
  if (baseRate < this.minimumPrice) {
    baseRate = this.minimumPrice;
  }

  // Calculate special services price
  const additionalServices = this.calculateSpecialServicesPrice(specialServices, baseRate);

  // Calculate insurance if declared value is provided
  const insurance = declaredValue > 0 ? (declaredValue * this.insurancePercentage) / 100 : 0;

  // Calculate subtotal before discount
  const subtotal = baseRate + additionalServices + insurance;

  // Calculate discount
  const discount = this.calculateDiscount({
    discountCode,
    customerType,
    subtotal,
  });

  // Calculate tax
  const taxableAmount = subtotal - discount;
  const tax = (taxableAmount * this.taxPercentage) / 100;

  // Calculate total
  const total = taxableAmount + tax;

  // Return detailed price breakdown
  return {
    baseRate,
    additionalServices,
    insurance,
    subtotal,
    discount,
    tax,
    total,
    chargeableWeight,
    actualWeight: weight,
    volumetricWeight,
    appliedPricingRule: {
      code: this.code,
      name: this.name,
      serviceType: this.serviceType,
    },
  };
};

/**
 * Generate a unique pricing rule code
 * Format: PR-YYYYMMDD-XXX (XXX = Sequence number)
 * @returns {Promise<string>} - Generated code
 */
PricingRuleSchema.statics.generateCode = async function () {
  // Get current date in YYYYMMDD format
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const dateCode = `${year}${month}${day}`;
  
  // Find the latest code for this date
  const prefix = `PR-${dateCode}-`;
  const latestRule = await this.findOne(
    { code: new RegExp(`^${prefix}`) },
    { code: 1 },
    { sort: { code: -1 } }
  );
  
  let sequenceNumber = 1;
  if (latestRule) {
    // Extract the sequence number from the latest code
    const latestSequence = parseInt(latestRule.code.split('-')[2], 10);
    sequenceNumber = latestSequence + 1;
  }
  
  // Format the sequence number to 3 digits
  const sequenceStr = sequenceNumber.toString().padStart(3, '0');
  
  return `${prefix}${sequenceStr}`;
};

// Create and export the model
const PricingRule = mongoose.model('PricingRule', PricingRuleSchema);

module.exports = PricingRule;
