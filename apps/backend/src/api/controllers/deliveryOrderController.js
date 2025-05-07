/**
 * Samudra Paket ERP - Delivery Order Controller
 * Handles HTTP requests for delivery order management
 */

const DeliveryOrderRepository = require('../../infrastructure/repositories/deliveryOrderRepository');
const { ValidationError, NotFoundError } = require('../../domain/utils/errorUtils');
const { successResponse, errorResponse } = require('../../domain/utils/responseFormatter');

class DeliveryOrderController {
  constructor() {
    this.repository = new DeliveryOrderRepository();
  }

  /**
   * Create a new delivery order
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async create(req, res) {
    try {
      const data = {
        ...req.body,
        createdBy: req.user.id
      };
      
      const deliveryOrder = await this.repository.create(data);
      
      return successResponse(res, {
        message: 'Delivery order created successfully',
        data: deliveryOrder
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        return errorResponse(res, 400, error.message, error.details);
      }
      return errorResponse(res, 500, 'Failed to create delivery order', error);
    }
  }

  /**
   * Get delivery order by ID
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getById(req, res) {
    try {
      const { id } = req.params;
      const populate = req.query.populate === 'true';
      
      const deliveryOrder = await this.repository.findById(id, populate);
      
      return successResponse(res, {
        data: deliveryOrder
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        return errorResponse(res, 404, error.message);
      }
      return errorResponse(res, 500, 'Failed to get delivery order', error);
    }
  }

  /**
   * Get delivery order by delivery order number
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getByDeliveryOrderNo(req, res) {
    try {
      const { deliveryOrderNo } = req.params;
      const populate = req.query.populate === 'true';
      
      const deliveryOrder = await this.repository.findByDeliveryOrderNo(deliveryOrderNo, populate);
      
      return successResponse(res, {
        data: deliveryOrder
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        return errorResponse(res, 404, error.message);
      }
      return errorResponse(res, 500, 'Failed to get delivery order', error);
    }
  }

  /**
   * Get all delivery orders with filtering and pagination
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getAll(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        status,
        branch,
        driver,
        vehicle,
        startDate,
        endDate,
        populate = false
      } = req.query;
      
      // Build filter
      const filter = {};
      
      if (status) {
        filter.status = status;
      }
      
      if (branch) {
        filter.branch = branch;
      }
      
      if (driver) {
        filter.driver = driver;
      }
      
      if (vehicle) {
        filter.vehicle = vehicle;
      }
      
      // Date range filter
      if (startDate || endDate) {
        filter.createdAt = {};
        
        if (startDate) {
          filter.createdAt.$gte = new Date(startDate);
        }
        
        if (endDate) {
          filter.createdAt.$lte = new Date(endDate);
        }
      }
      
      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sortBy,
        sortOrder
      };
      
      const result = await this.repository.findAll(filter, options, populate === 'true');
      
      return successResponse(res, {
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      return errorResponse(res, 500, 'Failed to get delivery orders', error);
    }
  }

  /**
   * Update delivery order
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async update(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;
      const userId = req.user.id;
      
      const deliveryOrder = await this.repository.update(id, data, userId);
      
      return successResponse(res, {
        message: 'Delivery order updated successfully',
        data: deliveryOrder
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        return errorResponse(res, 404, error.message);
      }
      if (error instanceof ValidationError) {
        return errorResponse(res, 400, error.message, error.details);
      }
      return errorResponse(res, 500, 'Failed to update delivery order', error);
    }
  }

  /**
   * Update delivery order status
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, notes, location } = req.body;
      const userId = req.user.id;
      
      const statusData = {
        notes,
        location
      };
      
      const deliveryOrder = await this.repository.updateStatus(id, status, userId, statusData);
      
      return successResponse(res, {
        message: `Delivery order status updated to ${status}`,
        data: deliveryOrder
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        return errorResponse(res, 404, error.message);
      }
      if (error instanceof ValidationError) {
        return errorResponse(res, 400, error.message, error.details);
      }
      return errorResponse(res, 500, 'Failed to update delivery order status', error);
    }
  }

  /**
   * Add delivery item to delivery order
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async addDeliveryItem(req, res) {
    try {
      const { id } = req.params;
      const itemData = req.body;
      const userId = req.user.id;
      
      const deliveryOrder = await this.repository.addDeliveryItem(id, itemData, userId);
      
      return successResponse(res, {
        message: 'Delivery item added successfully',
        data: deliveryOrder
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        return errorResponse(res, 404, error.message);
      }
      if (error instanceof ValidationError) {
        return errorResponse(res, 400, error.message, error.details);
      }
      return errorResponse(res, 500, 'Failed to add delivery item', error);
    }
  }

  /**
   * Remove delivery item from delivery order
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async removeDeliveryItem(req, res) {
    try {
      const { id, itemId } = req.params;
      const userId = req.user.id;
      
      const deliveryOrder = await this.repository.removeDeliveryItem(id, itemId, userId);
      
      return successResponse(res, {
        message: 'Delivery item removed successfully',
        data: deliveryOrder
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        return errorResponse(res, 404, error.message);
      }
      if (error instanceof ValidationError) {
        return errorResponse(res, 400, error.message, error.details);
      }
      return errorResponse(res, 500, 'Failed to remove delivery item', error);
    }
  }

  /**
   * Optimize delivery route
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async optimizeRoute(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      const deliveryOrder = await this.repository.optimizeRoute(id, userId);
      
      return successResponse(res, {
        message: 'Delivery route optimized successfully',
        data: deliveryOrder
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        return errorResponse(res, 404, error.message);
      }
      if (error instanceof ValidationError) {
        return errorResponse(res, 400, error.message, error.details);
      }
      return errorResponse(res, 500, 'Failed to optimize delivery route', error);
    }
  }

  /**
   * Record proof of delivery
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async recordProofOfDelivery(req, res) {
    try {
      const { id, itemId } = req.params;
      const podData = req.body;
      const userId = req.user.id;
      
      const deliveryOrder = await this.repository.recordProofOfDelivery(id, itemId, podData, userId);
      
      return successResponse(res, {
        message: 'Proof of delivery recorded successfully',
        data: deliveryOrder
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        return errorResponse(res, 404, error.message);
      }
      if (error instanceof ValidationError) {
        return errorResponse(res, 400, error.message, error.details);
      }
      return errorResponse(res, 500, 'Failed to record proof of delivery', error);
    }
  }

  /**
   * Record COD payment
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async recordCODPayment(req, res) {
    try {
      const { id, itemId } = req.params;
      const codData = req.body;
      const userId = req.user.id;
      
      const deliveryOrder = await this.repository.recordCODPayment(id, itemId, codData, userId);
      
      return successResponse(res, {
        message: 'COD payment recorded successfully',
        data: deliveryOrder
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        return errorResponse(res, 404, error.message);
      }
      if (error instanceof ValidationError) {
        return errorResponse(res, 400, error.message, error.details);
      }
      return errorResponse(res, 500, 'Failed to record COD payment', error);
    }
  }

  /**
   * Update delivery tracking location
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateTrackingLocation(req, res) {
    try {
      const { id } = req.params;
      const locationData = req.body;
      const userId = req.user.id;
      
      const deliveryOrder = await this.repository.updateTrackingLocation(id, locationData, userId);
      
      return successResponse(res, {
        message: 'Tracking location updated successfully',
        data: deliveryOrder
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        return errorResponse(res, 404, error.message);
      }
      if (error instanceof ValidationError) {
        return errorResponse(res, 400, error.message, error.details);
      }
      return errorResponse(res, 500, 'Failed to update tracking location', error);
    }
  }

  /**
   * Assign delivery order to vehicle and driver
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async assignDelivery(req, res) {
    try {
      const { id } = req.params;
      const assignmentData = req.body;
      const userId = req.user.id;
      
      const deliveryOrder = await this.repository.assignDelivery(id, assignmentData, userId);
      
      return successResponse(res, {
        message: 'Delivery order assigned successfully',
        data: deliveryOrder
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        return errorResponse(res, 404, error.message);
      }
      if (error instanceof ValidationError) {
        return errorResponse(res, 400, error.message, error.details);
      }
      return errorResponse(res, 500, 'Failed to assign delivery order', error);
    }
  }

  /**
   * Start delivery execution
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async startDelivery(req, res) {
    try {
      const { id } = req.params;
      const startData = req.body;
      const userId = req.user.id;
      
      const deliveryOrder = await this.repository.startDelivery(id, startData, userId);
      
      return successResponse(res, {
        message: 'Delivery started successfully',
        data: deliveryOrder
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        return errorResponse(res, 404, error.message);
      }
      if (error instanceof ValidationError) {
        return errorResponse(res, 400, error.message, error.details);
      }
      return errorResponse(res, 500, 'Failed to start delivery', error);
    }
  }

  /**
   * Complete delivery
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async completeDelivery(req, res) {
    try {
      const { id } = req.params;
      const completeData = req.body;
      const userId = req.user.id;
      
      const deliveryOrder = await this.repository.completeDelivery(id, completeData, userId);
      
      return successResponse(res, {
        message: 'Delivery completed successfully',
        data: deliveryOrder
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        return errorResponse(res, 404, error.message);
      }
      if (error instanceof ValidationError) {
        return errorResponse(res, 400, error.message, error.details);
      }
      return errorResponse(res, 500, 'Failed to complete delivery', error);
    }
  }
}

module.exports = new DeliveryOrderController();
