/**
 * Samudra Paket ERP - Pricing Rule Repository Interface
 * Defines the contract for pricing rule data access
 */

/**
 * Pricing Rule Repository Interface
 * Following the repository pattern for clean architecture
 */
class PricingRuleRepository {
  /**
   * Find all pricing rules with optional filters
   * @param {Object} _filters - Filter criteria
   * @param {Object} _options - Query options (pagination, sorting)
   * @returns {Promise<Array>} List of pricing rules
   */
  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  async findAll(_filters = {}, _options = {}) {
    throw new Error('Method not implemented');
  }

  /**
   * Find pricing rule by ID
   * @param {string} _id - Pricing rule ID
   * @returns {Promise<Object>} Pricing rule object
   */
  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  async findById(_id) {
    throw new Error('Method not implemented');
  }

  /**
   * Find pricing rule by code
   * @param {string} _code - Pricing rule code
   * @returns {Promise<Object>} Pricing rule object
   */
  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  async findByCode(_code) {
    throw new Error('Method not implemented');
  }

  /**
   * Find applicable pricing rules for a shipment
   * @param {Object} _shipmentData - Shipment data for finding applicable rules
   * @returns {Promise<Array>} List of applicable pricing rules
   */
  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  async findApplicableRules(_shipmentData) {
    throw new Error('Method not implemented');
  }

  /**
   * Create a new pricing rule
   * @param {Object} _pricingRuleData - Pricing rule data
   * @returns {Promise<Object>} Created pricing rule
   */
  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  async create(_pricingRuleData) {
    throw new Error('Method not implemented');
  }

  /**
   * Update a pricing rule
   * @param {string} _id - Pricing rule ID
   * @param {Object} _updateData - Data to update
   * @returns {Promise<Object>} Updated pricing rule
   */
  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  async update(_id, _updateData) {
    throw new Error('Method not implemented');
  }

  /**
   * Delete a pricing rule
   * @param {string} _id - Pricing rule ID
   * @returns {Promise<boolean>} True if deleted
   */
  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  async delete(_id) {
    throw new Error('Method not implemented');
  }

  /**
   * Activate a pricing rule
   * @param {string} _id - Pricing rule ID
   * @returns {Promise<Object>} Updated pricing rule
   */
  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  async activate(_id) {
    throw new Error('Method not implemented');
  }

  /**
   * Deactivate a pricing rule
   * @param {string} _id - Pricing rule ID
   * @returns {Promise<Object>} Updated pricing rule
   */
  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  async deactivate(_id) {
    throw new Error('Method not implemented');
  }

  /**
   * Calculate price for a shipment
   * @param {Object} _shipmentData - Shipment data for price calculation
   * @returns {Promise<Object>} Calculated price details
   */
  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  async calculatePrice(_shipmentData) {
    throw new Error('Method not implemented');
  }

  /**
   * Generate a unique pricing rule code
   * @returns {Promise<string>} Generated code
   */
  // eslint-disable-next-line class-methods-use-this
  async generateCode() {
    throw new Error('Method not implemented');
  }

  /**
   * Add a special service to a pricing rule
   * @param {string} _id - Pricing rule ID
   * @param {Object} _serviceData - Special service data
   * @returns {Promise<Object>} Updated pricing rule
   */
  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  async addSpecialService(_id, _serviceData) {
    throw new Error('Method not implemented');
  }

  /**
   * Remove a special service from a pricing rule
   * @param {string} _id - Pricing rule ID
   * @param {string} _serviceCode - Special service code
   * @returns {Promise<Object>} Updated pricing rule
   */
  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  async removeSpecialService(_id, _serviceCode) {
    throw new Error('Method not implemented');
  }

  /**
   * Add a discount to a pricing rule
   * @param {string} _id - Pricing rule ID
   * @param {Object} _discountData - Discount data
   * @returns {Promise<Object>} Updated pricing rule
   */
  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  async addDiscount(_id, _discountData) {
    throw new Error('Method not implemented');
  }

  /**
   * Remove a discount from a pricing rule
   * @param {string} _id - Pricing rule ID
   * @param {string} _discountCode - Discount code
   * @returns {Promise<Object>} Updated pricing rule
   */
  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  async removeDiscount(_id, _discountCode) {
    throw new Error('Method not implemented');
  }

  /**
   * Add a weight tier to a pricing rule
   * @param {string} _id - Pricing rule ID
   * @param {Object} _tierData - Weight tier data
   * @returns {Promise<Object>} Updated pricing rule
   */
  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  async addWeightTier(_id, _tierData) {
    throw new Error('Method not implemented');
  }

  /**
   * Remove a weight tier from a pricing rule
   * @param {string} _id - Pricing rule ID
   * @param {string} _tierId - Weight tier ID
   * @returns {Promise<Object>} Updated pricing rule
   */
  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  async removeWeightTier(_id, _tierId) {
    throw new Error('Method not implemented');
  }

  /**
   * Add a distance tier to a pricing rule
   * @param {string} _id - Pricing rule ID
   * @param {Object} _tierData - Distance tier data
   * @returns {Promise<Object>} Updated pricing rule
   */
  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  async addDistanceTier(_id, _tierData) {
    throw new Error('Method not implemented');
  }

  /**
   * Remove a distance tier from a pricing rule
   * @param {string} _id - Pricing rule ID
   * @param {string} _tierId - Distance tier ID
   * @returns {Promise<Object>} Updated pricing rule
   */
  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  async removeDistanceTier(_id, _tierId) {
    throw new Error('Method not implemented');
  }
}

module.exports = PricingRuleRepository;
