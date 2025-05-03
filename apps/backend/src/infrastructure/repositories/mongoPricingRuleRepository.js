/**
 * Samudra Paket ERP - MongoDB Pricing Rule Repository
 * Implementation of the Pricing Rule Repository interface for MongoDB
 */

const PricingRuleRepository = require('../../domain/repositories/pricingRuleRepository');
const PricingRule = require('../../domain/models/pricingRule');
const ServiceArea = require('../../domain/models/serviceArea');
const { calculateDistance } = require('../../domain/utils/geoUtils');

/**
 * MongoDB Pricing Rule Repository
 * Concrete implementation of the Pricing Rule Repository interface
 */
class MongoPricingRuleRepository extends PricingRuleRepository {
  /**
   * Find all pricing rules with optional filters
   * @param {Object} filters - Filter criteria
   * @param {Object} options - Query options (pagination, sorting)
   * @returns {Promise<Array>} List of pricing rules
   */
  // eslint-disable-next-line class-methods-use-this
  async findAll(filters = {}, options = {}) {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = -1 } = options;
    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder };

    return PricingRule.find(filters)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('branch')
      .populate('createdBy', 'username firstName lastName')
      .populate('updatedBy', 'username firstName lastName');
  }

  /**
   * Count pricing rules with optional filters
   * @param {Object} filters - Filter criteria
   * @returns {Promise<Number>} Count of pricing rules
   */
  // eslint-disable-next-line class-methods-use-this
  async count(filters = {}) {
    return PricingRule.countDocuments(filters);
  }

  /**
   * Find pricing rule by ID
   * @param {string} id - Pricing rule ID
   * @returns {Promise<Object>} Pricing rule object
   */
  // eslint-disable-next-line class-methods-use-this
  async findById(id) {
    return PricingRule.findById(id)
      .populate('branch')
      .populate('createdBy', 'username firstName lastName')
      .populate('updatedBy', 'username firstName lastName');
  }

  /**
   * Find pricing rule by code
   * @param {string} code - Pricing rule code
   * @returns {Promise<Object>} Pricing rule object
   */
  // eslint-disable-next-line class-methods-use-this
  async findByCode(code) {
    return PricingRule.findOne({ code })
      .populate('branch')
      .populate('createdBy', 'username firstName lastName')
      .populate('updatedBy', 'username firstName lastName');
  }

  /**
   * Find applicable pricing rules for a shipment
   * @param {Object} shipmentData - Shipment data for finding applicable rules
   * @returns {Promise<Array>} List of applicable pricing rules
   */
  // eslint-disable-next-line class-methods-use-this
  async findApplicableRules(shipmentData) {
    const {
      serviceType,
      originArea,
      destinationArea,
      customerType = 'regular',
      branch,
    } = shipmentData;

    const now = new Date();

    // Build query for finding applicable rules
    const query = {
      serviceType,
      isActive: true,
      effectiveDate: { $lte: now },
      $or: [
        { expiryDate: { $exists: false } },
        { expiryDate: null },
        { expiryDate: { $gte: now } },
      ],
      applicableCustomerTypes: customerType,
    };

    // Add origin area criteria
    if (originArea) {
      query['originArea.province'] = originArea.province;
      query['originArea.city'] = originArea.city;
      if (originArea.district) {
        query['originArea.district'] = originArea.district;
      }
    }

    // Add destination area criteria
    if (destinationArea) {
      query['destinationArea.province'] = destinationArea.province;
      query['destinationArea.city'] = destinationArea.city;
      if (destinationArea.district) {
        query['destinationArea.district'] = destinationArea.district;
      }
    }

    // Add branch criteria if specified
    if (branch) {
      query.$or = [
        { branch },
        { branch: { $exists: false } },
        { branch: null },
      ];
    }

    // Find applicable rules and sort by priority (highest first)
    const rules = await PricingRule.find(query).sort({ priority: -1 });

    return rules;
  }

  /**
   * Create a new pricing rule
   * @param {Object} pricingRuleData - Pricing rule data
   * @returns {Promise<Object>} Created pricing rule
   */
  // eslint-disable-next-line class-methods-use-this
  async create(pricingRuleData) {
    // Generate code if not provided
    if (!pricingRuleData.code) {
      pricingRuleData.code = await PricingRule.generateCode();
    }

    const newPricingRule = new PricingRule(pricingRuleData);
    await newPricingRule.save();

    return this.findById(newPricingRule._id);
  }

  /**
   * Update a pricing rule
   * @param {string} id - Pricing rule ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated pricing rule
   */
  // eslint-disable-next-line class-methods-use-this
  async update(id, updateData) {
    const updatedPricingRule = await PricingRule.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    return this.findById(updatedPricingRule._id);
  }

  /**
   * Delete a pricing rule
   * @param {string} id - Pricing rule ID
   * @returns {Promise<boolean>} True if deleted
   */
  // eslint-disable-next-line class-methods-use-this
  async delete(id) {
    const result = await PricingRule.findByIdAndDelete(id);
    return !!result;
  }

  /**
   * Activate a pricing rule
   * @param {string} id - Pricing rule ID
   * @returns {Promise<Object>} Updated pricing rule
   */
  // eslint-disable-next-line class-methods-use-this
  async activate(id) {
    const updatedPricingRule = await PricingRule.findByIdAndUpdate(
      id,
      { isActive: true },
      { new: true, runValidators: true }
    );

    return this.findById(updatedPricingRule._id);
  }

  /**
   * Deactivate a pricing rule
   * @param {string} id - Pricing rule ID
   * @returns {Promise<Object>} Updated pricing rule
   */
  // eslint-disable-next-line class-methods-use-this
  async deactivate(id) {
    const updatedPricingRule = await PricingRule.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true, runValidators: true }
    );

    return this.findById(updatedPricingRule._id);
  }

  /**
   * Calculate price for a shipment
   * @param {Object} shipmentData - Shipment data for price calculation
   * @returns {Promise<Object>} Calculated price details
   */
  // eslint-disable-next-line class-methods-use-this
  async calculatePrice(shipmentData) {
    const {
      weight,
      volumetricWeight,
      serviceType,
      originArea,
      destinationArea,
      specialServices = [],
      discountCode = null,
      customerType = 'regular',
      declaredValue = 0,
      originCoordinates,
      destinationCoordinates,
    } = shipmentData;

    // Find applicable pricing rules
    const applicableRules = await this.findApplicableRules({
      serviceType,
      originArea,
      destinationArea,
      customerType,
      branch: shipmentData.branch,
    });

    // If no applicable rules found, return error
    if (!applicableRules || applicableRules.length === 0) {
      throw new Error('No applicable pricing rules found for this shipment');
    }

    // Use the highest priority rule (first in the sorted list)
    const selectedRule = applicableRules[0];

    // Calculate distance if coordinates are provided and rule is distance-based
    let distance = 0;
    if (
      (selectedRule.pricingType === 'distance' || selectedRule.pricingType === 'combined') &&
      originCoordinates && destinationCoordinates
    ) {
      distance = calculateDistance(originCoordinates, destinationCoordinates);
    }

    // Calculate price using the selected rule
    const priceDetails = selectedRule.calculateTotalPrice({
      weight,
      distance,
      volumetricWeight,
      specialServices,
      discountCode,
      customerType,
      declaredValue,
    });

    return {
      ...priceDetails,
      pricingRuleId: selectedRule._id,
      pricingRuleCode: selectedRule.code,
      pricingRuleName: selectedRule.name,
    };
  }

  /**
   * Generate a unique pricing rule code
   * @returns {Promise<string>} Generated code
   */
  // eslint-disable-next-line class-methods-use-this
  async generateCode() {
    return PricingRule.generateCode();
  }

  /**
   * Add a special service to a pricing rule
   * @param {string} id - Pricing rule ID
   * @param {Object} serviceData - Special service data
   * @returns {Promise<Object>} Updated pricing rule
   */
  // eslint-disable-next-line class-methods-use-this
  async addSpecialService(id, serviceData) {
    const updatedPricingRule = await PricingRule.findByIdAndUpdate(
      id,
      { $push: { specialServices: serviceData } },
      { new: true, runValidators: true }
    );

    return this.findById(updatedPricingRule._id);
  }

  /**
   * Remove a special service from a pricing rule
   * @param {string} id - Pricing rule ID
   * @param {string} serviceCode - Special service code
   * @returns {Promise<Object>} Updated pricing rule
   */
  // eslint-disable-next-line class-methods-use-this
  async removeSpecialService(id, serviceCode) {
    const updatedPricingRule = await PricingRule.findByIdAndUpdate(
      id,
      { $pull: { specialServices: { serviceCode } } },
      { new: true }
    );

    return this.findById(updatedPricingRule._id);
  }

  /**
   * Add a discount to a pricing rule
   * @param {string} id - Pricing rule ID
   * @param {Object} discountData - Discount data
   * @returns {Promise<Object>} Updated pricing rule
   */
  // eslint-disable-next-line class-methods-use-this
  async addDiscount(id, discountData) {
    const updatedPricingRule = await PricingRule.findByIdAndUpdate(
      id,
      { $push: { discounts: discountData } },
      { new: true, runValidators: true }
    );

    return this.findById(updatedPricingRule._id);
  }

  /**
   * Remove a discount from a pricing rule
   * @param {string} id - Pricing rule ID
   * @param {string} discountId - Discount ID
   * @returns {Promise<Object>} Updated pricing rule
   */
  // eslint-disable-next-line class-methods-use-this
  async removeDiscount(id, discountId) {
    const updatedPricingRule = await PricingRule.findByIdAndUpdate(
      id,
      { $pull: { discounts: { _id: discountId } } },
      { new: true }
    );

    return this.findById(updatedPricingRule._id);
  }

  /**
   * Add a weight tier to a pricing rule
   * @param {string} id - Pricing rule ID
   * @param {Object} tierData - Weight tier data
   * @returns {Promise<Object>} Updated pricing rule
   */
  // eslint-disable-next-line class-methods-use-this
  async addWeightTier(id, tierData) {
    const updatedPricingRule = await PricingRule.findByIdAndUpdate(
      id,
      { $push: { weightTiers: tierData } },
      { new: true, runValidators: true }
    );

    return this.findById(updatedPricingRule._id);
  }

  /**
   * Remove a weight tier from a pricing rule
   * @param {string} id - Pricing rule ID
   * @param {string} tierId - Weight tier ID
   * @returns {Promise<Object>} Updated pricing rule
   */
  // eslint-disable-next-line class-methods-use-this
  async removeWeightTier(id, tierId) {
    const updatedPricingRule = await PricingRule.findByIdAndUpdate(
      id,
      { $pull: { weightTiers: { _id: tierId } } },
      { new: true }
    );

    return this.findById(updatedPricingRule._id);
  }

  /**
   * Add a distance tier to a pricing rule
   * @param {string} id - Pricing rule ID
   * @param {Object} tierData - Distance tier data
   * @returns {Promise<Object>} Updated pricing rule
   */
  // eslint-disable-next-line class-methods-use-this
  async addDistanceTier(id, tierData) {
    const updatedPricingRule = await PricingRule.findByIdAndUpdate(
      id,
      { $push: { distanceTiers: tierData } },
      { new: true, runValidators: true }
    );

    return this.findById(updatedPricingRule._id);
  }

  /**
   * Remove a distance tier from a pricing rule
   * @param {string} id - Pricing rule ID
   * @param {string} tierId - Distance tier ID
   * @returns {Promise<Object>} Updated pricing rule
   */
  // eslint-disable-next-line class-methods-use-this
  async removeDistanceTier(id, tierId) {
    const updatedPricingRule = await PricingRule.findByIdAndUpdate(
      id,
      { $pull: { distanceTiers: { _id: tierId } } },
      { new: true }
    );

    return this.findById(updatedPricingRule._id);
  }
}

module.exports = MongoPricingRuleRepository;
