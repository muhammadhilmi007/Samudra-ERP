/**
 * Samudra Paket ERP - Delivery Order Repository
 * Handles business logic for delivery order management
 */

const DeliveryOrder = require('../models/deliveryOrder');
const mongoose = require('mongoose');
const { NotFoundError, ValidationError } = require('../utils/errorUtils');

class DeliveryOrderRepository {
  /**
   * Create a new delivery order
   * 
   * @param {Object} data - Delivery order data
   * @returns {Promise<Object>} Created delivery order
   */
  async create(data) {
    try {
      const deliveryOrder = new DeliveryOrder(data);
      
      // Generate delivery order number if not provided
      if (!deliveryOrder.deliveryOrderNo) {
        deliveryOrder.deliveryOrderNo = await deliveryOrder.generateDeliveryOrderNo(data.branch);
      }
      
      // Update summary based on delivery items
      deliveryOrder.updateSummary();
      
      // Add creation activity
      deliveryOrder.addActivity('created', data.createdBy, { message: 'Delivery order created' });
      
      await deliveryOrder.save();
      return deliveryOrder;
    } catch (error) {
      if (error.name === 'ValidationError') {
        throw new ValidationError('Invalid delivery order data', error.errors);
      }
      throw error;
    }
  }

  /**
   * Find delivery order by ID
   * 
   * @param {String} id - Delivery order ID
   * @param {Boolean} populate - Whether to populate references
   * @returns {Promise<Object>} Found delivery order
   */
  async findById(id, populate = false) {
    try {
      let query = DeliveryOrder.findById(id);
      
      if (populate) {
        query = query.populate('branch')
                     .populate('vehicle')
                     .populate('driver')
                     .populate('helper')
                     .populate('deliveryItems.shipmentOrder')
                     .populate('createdBy', 'username firstName lastName')
                     .populate('updatedBy', 'username firstName lastName');
      }
      
      const deliveryOrder = await query.exec();
      
      if (!deliveryOrder) {
        throw new NotFoundError('Delivery order not found');
      }
      
      return deliveryOrder;
    } catch (error) {
      if (error.name === 'CastError') {
        throw new NotFoundError('Invalid delivery order ID');
      }
      throw error;
    }
  }

  /**
   * Find delivery order by delivery order number
   * 
   * @param {String} deliveryOrderNo - Delivery order number
   * @param {Boolean} populate - Whether to populate references
   * @returns {Promise<Object>} Found delivery order
   */
  async findByDeliveryOrderNo(deliveryOrderNo, populate = false) {
    try {
      let query = DeliveryOrder.findOne({ deliveryOrderNo });
      
      if (populate) {
        query = query.populate('branch')
                     .populate('vehicle')
                     .populate('driver')
                     .populate('helper')
                     .populate('deliveryItems.shipmentOrder')
                     .populate('createdBy', 'username firstName lastName')
                     .populate('updatedBy', 'username firstName lastName');
      }
      
      const deliveryOrder = await query.exec();
      
      if (!deliveryOrder) {
        throw new NotFoundError('Delivery order not found');
      }
      
      return deliveryOrder;
    } catch (error) {
      throw error;
    }
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
    try {
      const { 
        page = 1, 
        limit = 10, 
        sortBy = 'createdAt', 
        sortOrder = 'desc' 
      } = options;
      
      const skip = (page - 1) * limit;
      const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
      
      let query = DeliveryOrder.find(filter)
                              .sort(sort)
                              .skip(skip)
                              .limit(limit);
      
      if (populate) {
        query = query.populate('branch')
                     .populate('vehicle')
                     .populate('driver')
                     .populate('helper')
                     .populate('createdBy', 'username firstName lastName')
                     .populate('updatedBy', 'username firstName lastName');
      }
      
      const [deliveryOrders, totalCount] = await Promise.all([
        query.exec(),
        DeliveryOrder.countDocuments(filter)
      ]);
      
      return {
        data: deliveryOrders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          totalCount,
          totalPages: Math.ceil(totalCount / limit)
        }
      };
    } catch (error) {
      throw error;
    }
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
    try {
      const deliveryOrder = await this.findById(id);
      
      // Update fields
      Object.keys(data).forEach(key => {
        if (key !== '_id' && key !== 'deliveryOrderNo' && key !== 'createdAt' && key !== 'createdBy') {
          deliveryOrder[key] = data[key];
        }
      });
      
      // Update metadata
      deliveryOrder.updatedAt = new Date();
      deliveryOrder.updatedBy = userId;
      
      // Update summary based on delivery items
      deliveryOrder.updateSummary();
      
      // Add update activity
      deliveryOrder.addActivity('updated', userId, { message: 'Delivery order updated' });
      
      await deliveryOrder.save();
      return deliveryOrder;
    } catch (error) {
      if (error.name === 'ValidationError') {
        throw new ValidationError('Invalid delivery order data', error.errors);
      }
      throw error;
    }
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
    try {
      const deliveryOrder = await this.findById(id);
      
      // Validate status transition
      const validTransitions = {
        'pending': ['assigned', 'cancelled'],
        'assigned': ['in_progress', 'cancelled'],
        'in_progress': ['completed', 'partially_completed', 'failed'],
        'completed': [],
        'partially_completed': [],
        'failed': ['pending'],
        'cancelled': ['pending']
      };
      
      if (!validTransitions[deliveryOrder.status].includes(status)) {
        throw new ValidationError(`Invalid status transition from ${deliveryOrder.status} to ${status}`);
      }
      
      // Update status
      deliveryOrder.status = status;
      
      // Add status history entry
      deliveryOrder.statusHistory.push({
        status,
        timestamp: new Date(),
        notes: statusData.notes || '',
        location: statusData.location || null,
        user: userId
      });
      
      // Update metadata
      deliveryOrder.updatedAt = new Date();
      deliveryOrder.updatedBy = userId;
      
      // Add status update activity
      deliveryOrder.addActivity('status_updated', userId, { 
        message: `Delivery order status updated to ${status}`,
        previousStatus: deliveryOrder.status,
        newStatus: status
      });
      
      await deliveryOrder.save();
      return deliveryOrder;
    } catch (error) {
      throw error;
    }
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
    try {
      const deliveryOrder = await this.findById(id);
      
      // Validate delivery order status
      if (!['pending', 'assigned'].includes(deliveryOrder.status)) {
        throw new ValidationError('Cannot add items to delivery order in current status');
      }
      
      // Add item
      deliveryOrder.deliveryItems.push(itemData);
      
      // Update summary
      deliveryOrder.updateSummary();
      
      // Update metadata
      deliveryOrder.updatedAt = new Date();
      deliveryOrder.updatedBy = userId;
      
      // Add activity
      deliveryOrder.addActivity('item_added', userId, { 
        message: 'Delivery item added',
        itemId: itemData.shipmentOrder || itemData.waybillNumber
      });
      
      await deliveryOrder.save();
      return deliveryOrder;
    } catch (error) {
      throw error;
    }
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
    try {
      const deliveryOrder = await this.findById(id);
      
      // Validate delivery order status
      if (!['pending', 'assigned'].includes(deliveryOrder.status)) {
        throw new ValidationError('Cannot remove items from delivery order in current status');
      }
      
      // Find item index
      const itemIndex = deliveryOrder.deliveryItems.findIndex(
        item => item._id.toString() === itemId
      );
      
      if (itemIndex === -1) {
        throw new NotFoundError('Delivery item not found');
      }
      
      // Remove item
      deliveryOrder.deliveryItems.splice(itemIndex, 1);
      
      // Update summary
      deliveryOrder.updateSummary();
      
      // Update metadata
      deliveryOrder.updatedAt = new Date();
      deliveryOrder.updatedBy = userId;
      
      // Add activity
      deliveryOrder.addActivity('item_removed', userId, { 
        message: 'Delivery item removed',
        itemId
      });
      
      await deliveryOrder.save();
      return deliveryOrder;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Optimize delivery route
   * 
   * @param {String} id - Delivery order ID
   * @param {String} userId - User making the update
   * @returns {Promise<Object>} Updated delivery order with optimized route
   */
  async optimizeRoute(id, userId) {
    try {
      const deliveryOrder = await this.findById(id);
      
      // Validate delivery order status
      if (!['pending', 'assigned'].includes(deliveryOrder.status)) {
        throw new ValidationError('Cannot optimize route for delivery order in current status');
      }
      
      // Get delivery locations from items
      const stops = deliveryOrder.deliveryItems.map(item => ({
        location: {
          type: 'Point',
          coordinates: item.receiverLocation?.coordinates || [0, 0],
          address: item.receiverAddress
        },
        shipmentOrder: item.shipmentOrder,
        waybillNumber: item.waybillNumber
      }));
      
      // Simple nearest neighbor algorithm for route optimization
      // In a real implementation, this would use a more sophisticated algorithm
      // or integrate with a routing service like Google Maps Directions API
      const optimizedStops = this._optimizeStopsWithNearestNeighbor(
        deliveryOrder.route.startLocation.coordinates,
        stops
      );
      
      // Update route
      deliveryOrder.route.stops = optimizedStops;
      deliveryOrder.route.optimized = true;
      deliveryOrder.route.optimizedAt = new Date();
      
      // Calculate total distance (simplified)
      let totalDistance = 0;
      let previousCoords = deliveryOrder.route.startLocation.coordinates;
      
      for (const stop of optimizedStops) {
        totalDistance += deliveryOrder.calculateDistance(
          previousCoords,
          stop.location.coordinates
        );
        previousCoords = stop.location.coordinates;
      }
      
      // Add distance to end location if specified
      if (deliveryOrder.route.endLocation && deliveryOrder.route.endLocation.coordinates) {
        totalDistance += deliveryOrder.calculateDistance(
          previousCoords,
          deliveryOrder.route.endLocation.coordinates
        );
      }
      
      deliveryOrder.route.totalDistance = totalDistance;
      
      // Estimate duration (assuming average speed of 30 km/h in urban areas)
      deliveryOrder.route.estimatedDuration = Math.ceil(totalDistance / 30 * 60); // in minutes
      
      // Update ETAs
      await deliveryOrder.calculateETAs(
        deliveryOrder.route.startLocation.coordinates,
        30 // average speed in km/h
      );
      
      // Update metadata
      deliveryOrder.updatedAt = new Date();
      deliveryOrder.updatedBy = userId;
      
      // Add activity
      deliveryOrder.addActivity('route_optimized', userId, { 
        message: 'Delivery route optimized',
        totalDistance,
        estimatedDuration: deliveryOrder.route.estimatedDuration
      });
      
      await deliveryOrder.save();
      return deliveryOrder;
    } catch (error) {
      throw error;
    }
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
    try {
      const deliveryOrder = await this.findById(id);
      
      // Find item
      const item = deliveryOrder.deliveryItems.id(itemId);
      if (!item) {
        throw new NotFoundError('Delivery item not found');
      }
      
      // Validate delivery order and item status
      if (deliveryOrder.status !== 'in_progress') {
        throw new ValidationError('Delivery order must be in progress to record proof of delivery');
      }
      
      if (!['pending', 'assigned', 'in_transit'].includes(item.status)) {
        throw new ValidationError('Cannot record proof of delivery for item in current status');
      }
      
      // Update item with proof of delivery
      item.proofOfDelivery = {
        ...podData,
        timestamp: new Date()
      };
      
      // Update item status
      item.status = 'delivered';
      item.statusHistory.push({
        status: 'delivered',
        timestamp: new Date(),
        notes: 'Item delivered successfully',
        location: podData.location,
        user: userId
      });
      
      // Check if all items are delivered
      const allDelivered = deliveryOrder.deliveryItems.every(
        item => item.status === 'delivered' || item.status === 'failed' || item.status === 'returned'
      );
      
      // If all items are delivered, update delivery order status
      if (allDelivered) {
        const allSuccessful = deliveryOrder.deliveryItems.every(
          item => item.status === 'delivered'
        );
        
        deliveryOrder.status = allSuccessful ? 'completed' : 'partially_completed';
        deliveryOrder.statusHistory.push({
          status: deliveryOrder.status,
          timestamp: new Date(),
          notes: `Delivery ${allSuccessful ? 'completed' : 'partially completed'}`,
          user: userId
        });
      }
      
      // Update metadata
      deliveryOrder.updatedAt = new Date();
      deliveryOrder.updatedBy = userId;
      
      // Add activity
      deliveryOrder.addActivity('pod_recorded', userId, { 
        message: 'Proof of delivery recorded',
        itemId,
        receiverName: podData.deliveredTo
      });
      
      await deliveryOrder.save();
      return deliveryOrder;
    } catch (error) {
      throw error;
    }
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
    try {
      const deliveryOrder = await this.findById(id);
      
      // Find item
      const item = deliveryOrder.deliveryItems.id(itemId);
      if (!item) {
        throw new NotFoundError('Delivery item not found');
      }
      
      // Validate item payment type
      if (item.paymentType !== 'COD') {
        throw new ValidationError('Item is not Cash on Delivery (COD)');
      }
      
      // Update proof of delivery with COD information
      if (!item.proofOfDelivery) {
        throw new ValidationError('Proof of delivery must be recorded before COD payment');
      }
      
      item.proofOfDelivery.codCollected = true;
      item.proofOfDelivery.codAmount = codData.amount;
      item.proofOfDelivery.paymentMethod = codData.paymentMethod;
      
      if (codData.receiptNumber) {
        item.proofOfDelivery.receiptNumber = codData.receiptNumber;
      }
      
      // Update metadata
      deliveryOrder.updatedAt = new Date();
      deliveryOrder.updatedBy = userId;
      
      // Add activity
      deliveryOrder.addActivity('cod_collected', userId, { 
        message: 'COD payment collected',
        itemId,
        amount: codData.amount,
        paymentMethod: codData.paymentMethod
      });
      
      await deliveryOrder.save();
      return deliveryOrder;
    } catch (error) {
      throw error;
    }
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
    try {
      const deliveryOrder = await this.findById(id);
      
      // Add tracking location
      deliveryOrder.addTrackingLocation({
        ...locationData,
        timestamp: new Date(),
        user: userId
      });
      
      // Update ETAs if delivery is in progress
      if (deliveryOrder.status === 'in_progress') {
        await deliveryOrder.calculateETAs(
          locationData.coordinates,
          locationData.speed || 30 // Use provided speed or default to 30 km/h
        );
      }
      
      // Update metadata
      deliveryOrder.updatedAt = new Date();
      deliveryOrder.updatedBy = userId;
      
      await deliveryOrder.save();
      return deliveryOrder;
    } catch (error) {
      throw error;
    }
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
    try {
      const deliveryOrder = await this.findById(id);
      
      // Validate delivery order status
      if (deliveryOrder.status !== 'pending') {
        throw new ValidationError('Only pending delivery orders can be assigned');
      }
      
      // Update assignment data
      deliveryOrder.vehicle = assignmentData.vehicle;
      deliveryOrder.driver = assignmentData.driver;
      
      if (assignmentData.helper) {
        deliveryOrder.helper = assignmentData.helper;
      }
      
      if (assignmentData.scheduledDate) {
        deliveryOrder.scheduledDate = assignmentData.scheduledDate;
      }
      
      if (assignmentData.scheduledTime) {
        deliveryOrder.scheduledTime = assignmentData.scheduledTime;
      }
      
      // Update status
      deliveryOrder.status = 'assigned';
      deliveryOrder.statusHistory.push({
        status: 'assigned',
        timestamp: new Date(),
        notes: assignmentData.notes || 'Delivery order assigned',
        user: userId
      });
      
      // Update delivery items status
      deliveryOrder.deliveryItems.forEach(item => {
        item.status = 'assigned';
        item.statusHistory.push({
          status: 'assigned',
          timestamp: new Date(),
          notes: 'Item assigned for delivery',
          user: userId
        });
      });
      
      // Update metadata
      deliveryOrder.updatedAt = new Date();
      deliveryOrder.updatedBy = userId;
      
      // Add activity
      deliveryOrder.addActivity('assigned', userId, { 
        message: 'Delivery order assigned',
        vehicle: assignmentData.vehicle,
        driver: assignmentData.driver,
        helper: assignmentData.helper
      });
      
      await deliveryOrder.save();
      return deliveryOrder;
    } catch (error) {
      throw error;
    }
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
    try {
      const deliveryOrder = await this.findById(id);
      
      // Validate delivery order status
      if (deliveryOrder.status !== 'assigned') {
        throw new ValidationError('Only assigned delivery orders can be started');
      }
      
      // Update status
      deliveryOrder.status = 'in_progress';
      deliveryOrder.statusHistory.push({
        status: 'in_progress',
        timestamp: new Date(),
        notes: startData.notes || 'Delivery started',
        location: startData.location,
        user: userId
      });
      
      // Update actual start time
      deliveryOrder.actualStartTime = new Date();
      
      // Update delivery items status
      deliveryOrder.deliveryItems.forEach(item => {
        item.status = 'in_transit';
        item.statusHistory.push({
          status: 'in_transit',
          timestamp: new Date(),
          notes: 'Item in transit for delivery',
          location: startData.location,
          user: userId
        });
      });
      
      // Add tracking location
      deliveryOrder.addTrackingLocation({
        ...startData.location,
        timestamp: new Date(),
        status: 'started',
        user: userId
      });
      
      // Update metadata
      deliveryOrder.updatedAt = new Date();
      deliveryOrder.updatedBy = userId;
      
      // Add activity
      deliveryOrder.addActivity('started', userId, { 
        message: 'Delivery started',
        location: startData.location
      });
      
      await deliveryOrder.save();
      return deliveryOrder;
    } catch (error) {
      throw error;
    }
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
    try {
      const deliveryOrder = await this.findById(id);
      
      // Validate delivery order status
      if (deliveryOrder.status !== 'in_progress') {
        throw new ValidationError('Only in-progress delivery orders can be completed');
      }
      
      // Check if all items have been delivered or failed
      const pendingItems = deliveryOrder.deliveryItems.filter(
        item => !['delivered', 'failed', 'returned'].includes(item.status)
      );
      
      if (pendingItems.length > 0) {
        throw new ValidationError('All items must be delivered, failed, or returned before completing delivery');
      }
      
      // Determine final status
      const allDelivered = deliveryOrder.deliveryItems.every(
        item => item.status === 'delivered'
      );
      
      deliveryOrder.status = allDelivered ? 'completed' : 'partially_completed';
      deliveryOrder.statusHistory.push({
        status: deliveryOrder.status,
        timestamp: new Date(),
        notes: completeData.notes || `Delivery ${allDelivered ? 'completed' : 'partially completed'}`,
        location: completeData.location,
        user: userId
      });
      
      // Update actual end time
      deliveryOrder.actualEndTime = new Date();
      
      // Add tracking location
      deliveryOrder.addTrackingLocation({
        ...completeData.location,
        timestamp: new Date(),
        status: 'completed',
        user: userId
      });
      
      // Update metadata
      deliveryOrder.updatedAt = new Date();
      deliveryOrder.updatedBy = userId;
      
      // Add activity
      deliveryOrder.addActivity('completed', userId, { 
        message: `Delivery ${allDelivered ? 'completed' : 'partially completed'}`,
        location: completeData.location,
        successRate: `${deliveryOrder.deliveryItems.filter(item => item.status === 'delivered').length}/${deliveryOrder.deliveryItems.length}`
      });
      
      await deliveryOrder.save();
      return deliveryOrder;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Optimize stops using nearest neighbor algorithm
   * This is a simple implementation and would be replaced with a more
   * sophisticated algorithm or external service in production
   * 
   * @param {Array} startCoordinates - Starting coordinates [lng, lat]
   * @param {Array} stops - Array of stop objects with location
   * @returns {Array} Optimized sequence of stops
   */
  _optimizeStopsWithNearestNeighbor(startCoordinates, stops) {
    if (!stops || stops.length === 0) {
      return [];
    }
    
    const unvisited = [...stops];
    const optimized = [];
    let currentCoordinates = startCoordinates;
    
    while (unvisited.length > 0) {
      // Find nearest unvisited stop
      let nearestIndex = 0;
      let nearestDistance = Infinity;
      
      for (let i = 0; i < unvisited.length; i++) {
        const stop = unvisited[i];
        const distance = this._calculateHaversineDistance(
          currentCoordinates,
          stop.location.coordinates
        );
        
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = i;
        }
      }
      
      // Add nearest stop to optimized route
      const nearestStop = unvisited.splice(nearestIndex, 1)[0];
      optimized.push(nearestStop);
      
      // Update current coordinates
      currentCoordinates = nearestStop.location.coordinates;
    }
    
    return optimized;
  }

  /**
   * Calculate Haversine distance between two coordinates
   * 
   * @param {Array} coord1 - First coordinates [lng, lat]
   * @param {Array} coord2 - Second coordinates [lng, lat]
   * @returns {Number} Distance in kilometers
   */
  _calculateHaversineDistance(coord1, coord2) {
    const toRad = value => (value * Math.PI) / 180;
    const R = 6371; // Earth's radius in km
    
    const dLat = toRad(coord2[1] - coord1[1]);
    const dLon = toRad(coord2[0] - coord1[0]);
    
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(toRad(coord1[1])) * Math.cos(toRad(coord2[1])) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
}

module.exports = DeliveryOrderRepository;
