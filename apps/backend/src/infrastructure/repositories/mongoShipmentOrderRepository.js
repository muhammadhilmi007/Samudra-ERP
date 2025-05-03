/**
 * Samudra Paket ERP - MongoDB Shipment Order Repository
 * Implementation of the Shipment Order Repository interface for MongoDB
 */

const ShipmentOrderRepository = require('../../domain/repositories/shipmentOrderRepository');
const ShipmentOrder = require('../../domain/models/shipmentOrder');
const ServiceArea = require('../../domain/models/serviceArea');

/**
 * MongoDB Shipment Order Repository
 * Concrete implementation of the Shipment Order Repository interface
 */
class MongoShipmentOrderRepository extends ShipmentOrderRepository {
  /**
   * Find all shipment orders with optional filters
   * @param {Object} filters - Filter criteria
   * @param {Object} options - Query options (pagination, sorting)
   * @returns {Promise<Array>} List of shipment orders
   */
  // eslint-disable-next-line class-methods-use-this
  async findAll(filters = {}, options = {}) {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = -1 } = options;
    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder };

    return ShipmentOrder.find(filters)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('branch')
      .populate('originBranch')
      .populate('destinationBranch')
      .populate('sender.customer')
      .populate('createdBy', 'username firstName lastName')
      .populate('updatedBy', 'username firstName lastName');
  }

  /**
   * Count shipment orders with optional filters
   * @param {Object} filters - Filter criteria
   * @returns {Promise<Number>} Count of shipment orders
   */
  // eslint-disable-next-line class-methods-use-this
  async count(filters = {}) {
    return ShipmentOrder.countDocuments(filters);
  }

  /**
   * Find shipment order by ID
   * @param {string} id - Shipment order ID
   * @returns {Promise<Object>} Shipment order object
   */
  // eslint-disable-next-line class-methods-use-this
  async findById(id) {
    return ShipmentOrder.findById(id)
      .populate('branch')
      .populate('originBranch')
      .populate('destinationBranch')
      .populate('sender.customer')
      .populate('pickupRequest')
      .populate('createdBy', 'username firstName lastName')
      .populate('updatedBy', 'username firstName lastName')
      .populate('statusHistory.user', 'username firstName lastName');
  }

  /**
   * Find shipment order by waybill number
   * @param {string} waybillNo - Waybill number
   * @returns {Promise<Object>} Shipment order object
   */
  // eslint-disable-next-line class-methods-use-this
  async findByWaybillNo(waybillNo) {
    return ShipmentOrder.findOne({ waybillNo })
      .populate('branch')
      .populate('originBranch')
      .populate('destinationBranch')
      .populate('sender.customer')
      .populate('pickupRequest')
      .populate('createdBy', 'username firstName lastName')
      .populate('updatedBy', 'username firstName lastName')
      .populate('statusHistory.user', 'username firstName lastName');
  }

  /**
   * Find shipment orders by customer ID
   * @param {string} customerId - Customer ID
   * @param {Object} options - Query options (pagination, sorting)
   * @returns {Promise<Array>} List of shipment orders
   */
  // eslint-disable-next-line class-methods-use-this
  async findByCustomer(customerId, options = {}) {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = -1 } = options;
    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder };

    return ShipmentOrder.find({ 'sender.customer': customerId })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('branch')
      .populate('originBranch')
      .populate('destinationBranch')
      .populate('sender.customer')
      .populate('createdBy', 'username firstName lastName')
      .populate('updatedBy', 'username firstName lastName');
  }

  /**
   * Find shipment orders by branch ID
   * @param {string} branchId - Branch ID
   * @param {Object} options - Query options (pagination, sorting)
   * @returns {Promise<Array>} List of shipment orders
   */
  // eslint-disable-next-line class-methods-use-this
  async findByBranch(branchId, options = {}) {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = -1 } = options;
    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder };

    return ShipmentOrder.find({ branch: branchId })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('branch')
      .populate('originBranch')
      .populate('destinationBranch')
      .populate('sender.customer')
      .populate('createdBy', 'username firstName lastName')
      .populate('updatedBy', 'username firstName lastName');
  }

  /**
   * Create a new shipment order
   * @param {Object} shipmentOrderData - Shipment order data
   * @returns {Promise<Object>} Created shipment order
   */
  // eslint-disable-next-line class-methods-use-this
  async create(shipmentOrderData) {
    // Generate waybill number if not provided
    if (!shipmentOrderData.waybillNo) {
      shipmentOrderData.waybillNo = await ShipmentOrder.generateWaybillNo(shipmentOrderData.branch);
    }

    // Calculate total items and weight if not provided
    if (!shipmentOrderData.totalItems && shipmentOrderData.items && shipmentOrderData.items.length > 0) {
      shipmentOrderData.totalItems = shipmentOrderData.items.reduce((sum, item) => sum + item.quantity, 0);
    }

    if (!shipmentOrderData.totalWeight && shipmentOrderData.items && shipmentOrderData.items.length > 0) {
      shipmentOrderData.totalWeight = shipmentOrderData.items.reduce(
        (sum, item) => sum + (item.weight * item.quantity), 0
      );
    }

    // Calculate total volume if dimensions are provided
    if (shipmentOrderData.items && shipmentOrderData.items.length > 0) {
      let totalVolume = 0;
      shipmentOrderData.items.forEach((item) => {
        if (item.dimensions && item.dimensions.length && item.dimensions.width && item.dimensions.height) {
          const { length, width, height } = item.dimensions;
          const volume = length * width * height;
          totalVolume += volume * item.quantity;
        }
      });
      shipmentOrderData.totalVolume = totalVolume;
    }

    // Initialize status history
    if (!shipmentOrderData.statusHistory) {
      shipmentOrderData.statusHistory = [{
        status: shipmentOrderData.status || 'created',
        timestamp: new Date(),
        user: shipmentOrderData.createdBy,
      }];
    }

    const newShipmentOrder = new ShipmentOrder(shipmentOrderData);
    await newShipmentOrder.save();
    
    return this.findById(newShipmentOrder._id);
  }

  /**
   * Update a shipment order
   * @param {string} id - Shipment order ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated shipment order
   */
  // eslint-disable-next-line class-methods-use-this
  async update(id, updateData) {
    // Recalculate totals if items are updated
    if (updateData.items) {
      updateData.totalItems = updateData.items.reduce((sum, item) => sum + item.quantity, 0);
      updateData.totalWeight = updateData.items.reduce(
        (sum, item) => sum + (item.weight * item.quantity), 0
      );

      let totalVolume = 0;
      updateData.items.forEach((item) => {
        if (item.dimensions && item.dimensions.length && item.dimensions.width && item.dimensions.height) {
          const { length, width, height } = item.dimensions;
          const volume = length * width * height;
          totalVolume += volume * item.quantity;
        }
      });
      updateData.totalVolume = totalVolume;
    }

    const updatedShipmentOrder = await ShipmentOrder.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    return this.findById(updatedShipmentOrder._id);
  }

  /**
   * Update shipment order status
   * @param {string} id - Shipment order ID
   * @param {string} status - New status
   * @param {string} userId - User performing the update
   * @param {Object} details - Additional details (location, notes)
   * @returns {Promise<Object>} Updated shipment order
   */
  // eslint-disable-next-line class-methods-use-this
  async updateStatus(id, status, userId, details = {}) {
    const shipmentOrder = await ShipmentOrder.findById(id);
    
    if (!shipmentOrder) {
      throw new Error('Shipment order not found');
    }
    
    shipmentOrder.addStatusHistory(status, userId, details);
    await shipmentOrder.save();
    
    return this.findById(id);
  }

  /**
   * Add document to shipment order
   * @param {string} id - Shipment order ID
   * @param {Object} document - Document data
   * @returns {Promise<Object>} Updated shipment order
   */
  // eslint-disable-next-line class-methods-use-this
  async addDocument(id, document) {
    const updatedShipmentOrder = await ShipmentOrder.findByIdAndUpdate(
      id,
      { $push: { documents: document } },
      { new: true, runValidators: true }
    );
    
    return this.findById(updatedShipmentOrder._id);
  }

  /**
   * Remove document from shipment order
   * @param {string} id - Shipment order ID
   * @param {string} documentId - Document ID
   * @returns {Promise<Object>} Updated shipment order
   */
  // eslint-disable-next-line class-methods-use-this
  async removeDocument(id, documentId) {
    const updatedShipmentOrder = await ShipmentOrder.findByIdAndUpdate(
      id,
      { $pull: { documents: { _id: documentId } } },
      { new: true }
    );
    
    return this.findById(updatedShipmentOrder._id);
  }

  /**
   * Generate waybill number
   * @param {string} branchId - Branch ID
   * @returns {Promise<string>} Generated waybill number
   */
  // eslint-disable-next-line class-methods-use-this
  async generateWaybillNo(branchId) {
    return ShipmentOrder.generateWaybillNo(branchId);
  }

  /**
   * Delete a shipment order
   * @param {string} id - Shipment order ID
   * @returns {Promise<boolean>} True if deleted
   */
  // eslint-disable-next-line class-methods-use-this
  async delete(id) {
    const result = await ShipmentOrder.findByIdAndDelete(id);
    return !!result;
  }

  /**
   * Validate destination
   * @param {Object} destinationData - Destination data (province, city, district)
   * @returns {Promise<boolean>} True if destination is valid
   */
  // eslint-disable-next-line class-methods-use-this
  async validateDestination(destinationData) {
    const { province, city, district } = destinationData;
    
    // Check if the destination is covered by any service area
    const serviceArea = await ServiceArea.findOne({
      province,
      city,
      district,
      status: 'active',
    });
    
    return !!serviceArea;
  }

  /**
   * Calculate shipping price
   * @param {Object} shipmentData - Shipment data for price calculation
   * @returns {Promise<Object>} Calculated price details
   */
  // eslint-disable-next-line class-methods-use-this
  async calculatePrice(shipmentData) {
    const {
      originBranch,
      destinationBranch,
      serviceType,
      items,
      totalWeight,
      totalVolume,
      additionalServices = [],
      insuranceValue = 0,
    } = shipmentData;

    // Calculate volumetric weight
    let volumetricWeight = 0;
    if (items && items.length > 0) {
      items.forEach((item) => {
        if (item.dimensions && item.dimensions.length && item.dimensions.width && item.dimensions.height) {
          const { length, width, height, unit } = item.dimensions;
          const divisor = unit === 'cm' ? 5000 : 139; // 5000 for cm, 139 for inches
          const itemVolumetricWeight = (length * width * height) / divisor;
          volumetricWeight += itemVolumetricWeight * item.quantity;
        }
      });
    } else if (totalVolume) {
      // If dimensions not provided but total volume is
      volumetricWeight = totalVolume / 5000; // Assuming cm³ to kg conversion
    }

    // Use the greater of actual weight and volumetric weight
    const chargeableWeight = Math.max(totalWeight || 0, volumetricWeight);

    // TODO: In a real implementation, we would query a pricing table based on
    // origin, destination, service type, and weight. For now, use a simplified calculation.
    
    // Base rate calculation (simplified)
    let baseRate = 0;
    switch (serviceType) {
      case 'express':
        baseRate = chargeableWeight * 20000; // Rp 20,000 per kg
        break;
      case 'same_day':
        baseRate = chargeableWeight * 25000; // Rp 25,000 per kg
        break;
      case 'next_day':
        baseRate = chargeableWeight * 18000; // Rp 18,000 per kg
        break;
      case 'economy':
        baseRate = chargeableWeight * 12000; // Rp 12,000 per kg
        break;
      default: // regular
        baseRate = chargeableWeight * 15000; // Rp 15,000 per kg
    }

    // Minimum charge
    const minimumCharge = 10000; // Rp 10,000
    baseRate = Math.max(baseRate, minimumCharge);

    // Additional services calculation
    let additionalServicesCharge = 0;
    if (additionalServices && additionalServices.length > 0) {
      additionalServices.forEach((service) => {
        switch (service) {
          case 'packaging':
            additionalServicesCharge += 10000; // Rp 10,000 for packaging
            break;
          case 'pickup':
            additionalServicesCharge += 15000; // Rp 15,000 for pickup
            break;
          case 'delivery_notification':
            additionalServicesCharge += 5000; // Rp 5,000 for delivery notification
            break;
          // Add more services as needed
        }
      });
    }

    // Insurance calculation (0.2% of declared value)
    const insuranceCharge = insuranceValue > 0 ? insuranceValue * 0.002 : 0;

    // Tax calculation (11% of subtotal)
    const subtotal = baseRate + additionalServicesCharge + insuranceCharge;
    const tax = subtotal * 0.11;

    // Total amount
    const total = subtotal + tax;

    return {
      baseRate,
      additionalServices: additionalServicesCharge,
      insurance: insuranceCharge,
      tax,
      total,
      chargeableWeight,
      actualWeight: totalWeight,
      volumetricWeight,
    };
  }
}

module.exports = MongoShipmentOrderRepository;
