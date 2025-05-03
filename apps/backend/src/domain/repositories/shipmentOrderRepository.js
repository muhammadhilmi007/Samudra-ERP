/**
 * Samudra Paket ERP - Shipment Order Repository Interface
 * Defines the contract for shipment order data access
 */

/**
 * Shipment Order Repository Interface
 * Following the repository pattern for clean architecture
 */
class ShipmentOrderRepository {
  /**
   * Find all shipment orders with optional filters
   * @param {Object} _filters - Filter criteria
   * @param {Object} _options - Query options (pagination, sorting)
   * @returns {Promise<Array>} List of shipment orders
   */
  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  async findAll(_filters = {}, _options = {}) {
    throw new Error('Method not implemented');
  }

  /**
   * Find shipment order by ID
   * @param {string} _id - Shipment order ID
   * @returns {Promise<Object>} Shipment order object
   */
  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  async findById(_id) {
    throw new Error('Method not implemented');
  }

  /**
   * Find shipment order by waybill number
   * @param {string} _waybillNo - Waybill number
   * @returns {Promise<Object>} Shipment order object
   */
  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  async findByWaybillNo(_waybillNo) {
    throw new Error('Method not implemented');
  }

  /**
   * Find shipment orders by customer ID
   * @param {string} _customerId - Customer ID
   * @param {Object} _options - Query options (pagination, sorting)
   * @returns {Promise<Array>} List of shipment orders
   */
  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  async findByCustomer(_customerId, _options = {}) {
    throw new Error('Method not implemented');
  }

  /**
   * Find shipment orders by branch ID
   * @param {string} _branchId - Branch ID
   * @param {Object} _options - Query options (pagination, sorting)
   * @returns {Promise<Array>} List of shipment orders
   */
  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  async findByBranch(_branchId, _options = {}) {
    throw new Error('Method not implemented');
  }

  /**
   * Create a new shipment order
   * @param {Object} _shipmentOrderData - Shipment order data
   * @returns {Promise<Object>} Created shipment order
   */
  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  async create(_shipmentOrderData) {
    throw new Error('Method not implemented');
  }

  /**
   * Update a shipment order
   * @param {string} _id - Shipment order ID
   * @param {Object} _updateData - Data to update
   * @returns {Promise<Object>} Updated shipment order
   */
  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  async update(_id, _updateData) {
    throw new Error('Method not implemented');
  }

  /**
   * Update shipment order status
   * @param {string} _id - Shipment order ID
   * @param {string} _status - New status
   * @param {string} _userId - User performing the update
   * @param {Object} _details - Additional details (location, notes)
   * @returns {Promise<Object>} Updated shipment order
   */
  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  async updateStatus(_id, _status, _userId, _details = {}) {
    throw new Error('Method not implemented');
  }

  /**
   * Add document to shipment order
   * @param {string} _id - Shipment order ID
   * @param {Object} _document - Document data
   * @returns {Promise<Object>} Updated shipment order
   */
  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  async addDocument(_id, _document) {
    throw new Error('Method not implemented');
  }

  /**
   * Remove document from shipment order
   * @param {string} _id - Shipment order ID
   * @param {string} _documentId - Document ID
   * @returns {Promise<Object>} Updated shipment order
   */
  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  async removeDocument(_id, _documentId) {
    throw new Error('Method not implemented');
  }

  /**
   * Generate waybill number
   * @param {string} _branchId - Branch ID
   * @returns {Promise<string>} Generated waybill number
   */
  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  async generateWaybillNo(_branchId) {
    throw new Error('Method not implemented');
  }

  /**
   * Delete a shipment order
   * @param {string} _id - Shipment order ID
   * @returns {Promise<boolean>} True if deleted
   */
  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  async delete(_id) {
    throw new Error('Method not implemented');
  }

  /**
   * Validate destination
   * @param {Object} _destinationData - Destination data (province, city, district)
   * @returns {Promise<boolean>} True if destination is valid
   */
  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  async validateDestination(_destinationData) {
    throw new Error('Method not implemented');
  }

  /**
   * Calculate shipping price
   * @param {Object} _shipmentData - Shipment data for price calculation
   * @returns {Promise<Object>} Calculated price details
   */
  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  async calculatePrice(_shipmentData) {
    throw new Error('Method not implemented');
  }
}

module.exports = ShipmentOrderRepository;
