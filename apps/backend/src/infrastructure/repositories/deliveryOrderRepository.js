/**
 * Samudra Paket ERP - Delivery Order Repository Implementation
 * Infrastructure layer implementation of the delivery order repository
 */

const BaseRepository = require('./baseRepository');
const DeliveryOrder = require('../../domain/models/deliveryOrder');
const DeliveryOrderDomainRepository = require('../../domain/repositories/deliveryOrderRepository');

class DeliveryOrderRepository extends BaseRepository {
  constructor() {
    super(DeliveryOrder);
    this.domainRepository = new DeliveryOrderDomainRepository();
  }

  /**
   * Create a new delivery order
   * 
   * @param {Object} data - Delivery order data
   * @returns {Promise<Object>} Created delivery order
   */
  async create(data) {
    return this.domainRepository.create(data);
  }

  /**
   * Find delivery order by ID
   * 
   * @param {String} id - Delivery order ID
   * @param {Boolean} populate - Whether to populate references
   * @returns {Promise<Object>} Found delivery order
   */
  async findById(id, populate = false) {
    return this.domainRepository.findById(id, populate);
  }

  /**
   * Find delivery order by delivery order number
   * 
   * @param {String} deliveryOrderNo - Delivery order number
   * @param {Boolean} populate - Whether to populate references
   * @returns {Promise<Object>} Found delivery order
   */
  async findByDeliveryOrderNo(deliveryOrderNo, populate = false) {
    return this.domainRepository.findByDeliveryOrderNo(deliveryOrderNo, populate);
  }

  /**
   * Find all delivery orders with optional filtering
   * 
   * @param {Object} filter - Filter criteria
   * @param {Object} options - Query options (pagination, sorting)
   * @param {Boolean} populate - Whether to populate references
   * @returns {Promise<Object>} Delivery orders and count
   */
  async findAll(filter = {}, options = {}, populate = false) {
    return this.domainRepository.findAll(filter, options, populate);
  }

  /**
   * Update delivery order
   * 
   * @param {String} id - Delivery order ID
   * @param {Object} data - Updated data
   * @param {String} userId - User making the update
   * @returns {Promise<Object>} Updated delivery order
   */
  async update(id, data, userId) {
    return this.domainRepository.update(id, data, userId);
  }

  /**
   * Update delivery order status
   * 
   * @param {String} id - Delivery order ID
   * @param {String} status - New status
   * @param {String} userId - User making the update
   * @param {Object} statusData - Additional status data
   * @returns {Promise<Object>} Updated delivery order
   */
  async updateStatus(id, status, userId, statusData = {}) {
    return this.domainRepository.updateStatus(id, status, userId, statusData);
  }

  /**
   * Add delivery item to delivery order
   * 
   * @param {String} id - Delivery order ID
   * @param {Object} itemData - Delivery item data
   * @param {String} userId - User making the update
   * @returns {Promise<Object>} Updated delivery order
   */
  async addDeliveryItem(id, itemData, userId) {
    return this.domainRepository.addDeliveryItem(id, itemData, userId);
  }

  /**
   * Remove delivery item from delivery order
   * 
   * @param {String} id - Delivery order ID
   * @param {String} itemId - Delivery item ID
   * @param {String} userId - User making the update
   * @returns {Promise<Object>} Updated delivery order
   */
  async removeDeliveryItem(id, itemId, userId) {
    return this.domainRepository.removeDeliveryItem(id, itemId, userId);
  }

  /**
   * Optimize delivery route
   * 
   * @param {String} id - Delivery order ID
   * @param {String} userId - User making the update
   * @returns {Promise<Object>} Updated delivery order with optimized route
   */
  async optimizeRoute(id, userId) {
    return this.domainRepository.optimizeRoute(id, userId);
  }

  /**
   * Record proof of delivery
   * 
   * @param {String} id - Delivery order ID
   * @param {String} itemId - Delivery item ID
   * @param {Object} podData - Proof of delivery data
   * @param {String} userId - User making the update
   * @returns {Promise<Object>} Updated delivery order
   */
  async recordProofOfDelivery(id, itemId, podData, userId) {
    return this.domainRepository.recordProofOfDelivery(id, itemId, podData, userId);
  }

  /**
   * Record COD payment
   * 
   * @param {String} id - Delivery order ID
   * @param {String} itemId - Delivery item ID
   * @param {Object} codData - COD payment data
   * @param {String} userId - User making the update
   * @returns {Promise<Object>} Updated delivery order
   */
  async recordCODPayment(id, itemId, codData, userId) {
    return this.domainRepository.recordCODPayment(id, itemId, codData, userId);
  }

  /**
   * Update delivery tracking location
   * 
   * @param {String} id - Delivery order ID
   * @param {Object} locationData - Location data
   * @param {String} userId - User making the update
   * @returns {Promise<Object>} Updated delivery order
   */
  async updateTrackingLocation(id, locationData, userId) {
    return this.domainRepository.updateTrackingLocation(id, locationData, userId);
  }

  /**
   * Assign delivery order to vehicle and driver
   * 
   * @param {String} id - Delivery order ID
   * @param {Object} assignmentData - Assignment data
   * @param {String} userId - User making the update
   * @returns {Promise<Object>} Updated delivery order
   */
  async assignDelivery(id, assignmentData, userId) {
    return this.domainRepository.assignDelivery(id, assignmentData, userId);
  }

  /**
   * Start delivery execution
   * 
   * @param {String} id - Delivery order ID
   * @param {Object} startData - Start data including location
   * @param {String} userId - User making the update
   * @returns {Promise<Object>} Updated delivery order
   */
  async startDelivery(id, startData, userId) {
    return this.domainRepository.startDelivery(id, startData, userId);
  }

  /**
   * Complete delivery
   * 
   * @param {String} id - Delivery order ID
   * @param {Object} completeData - Completion data
   * @param {String} userId - User making the update
   * @returns {Promise<Object>} Updated delivery order
   */
  async completeDelivery(id, completeData, userId) {
    return this.domainRepository.completeDelivery(id, completeData, userId);
  }
}

module.exports = DeliveryOrderRepository;
