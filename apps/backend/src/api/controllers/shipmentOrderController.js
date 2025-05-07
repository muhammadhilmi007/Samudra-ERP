/**
 * Samudra Paket ERP - Shipment Order Controller
 * Handles HTTP requests for shipment order operations
 */

const ShipmentOrderRepository = require('../../domain/repositories/shipmentOrderRepository');
const ServiceAreaRepository = require('../../domain/repositories/serviceAreaRepository');
const { NotFoundError, ValidationError } = require('../../domain/utils/errorUtils');
const DocumentGenerationService = require('../../domain/services/documentGenerationService');
const MongoWaybillDocumentRepository = require('../../infrastructure/repositories/mongoWaybillDocumentRepository');
const FileUploadService = require('../../domain/services/fileUploadService');

/**
 * Shipment Order Controller
 */
class ShipmentOrderController {
  /**
   * Constructor
   * @param {ShipmentOrderRepository} shipmentOrderRepository - Repository for shipment orders
   * @param {ServiceAreaRepository} serviceAreaRepository - Repository for service areas
   * @param {DocumentGenerationService} documentGenerationService - Service for generating documents
   */
  constructor(shipmentOrderRepository, serviceAreaRepository, documentGenerationService) {
    this.shipmentOrderRepository = shipmentOrderRepository;
    this.serviceAreaRepository = serviceAreaRepository;
    this.documentGenerationService = documentGenerationService;
  }

  /**
   * Get all shipment orders with pagination and filtering
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getAllShipmentOrders(req, res, next) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = -1,
        status,
        branch,
        originBranch,
        destinationBranch,
        customer,
        startDate,
        endDate,
        waybillNo,
      } = req.query;

      // Build filters
      const filters = {};

      if (status) filters.status = status;
      if (branch) filters.branch = branch;
      if (originBranch) filters.originBranch = originBranch;
      if (destinationBranch) filters.destinationBranch = destinationBranch;
      if (customer) filters['sender.customer'] = customer;
      if (waybillNo) filters.waybillNo = { $regex: waybillNo, $options: 'i' };

      // Date range filter
      if (startDate || endDate) {
        filters.createdAt = {};
        if (startDate) filters.createdAt.$gte = new Date(startDate);
        if (endDate) filters.createdAt.$lte = new Date(endDate);
      }

      // Get shipment orders with pagination
      const shipmentOrders = await this.shipmentOrderRepository.findAll(filters, {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sortBy,
        sortOrder: parseInt(sortOrder, 10),
      });

      // Get total count for pagination
      const totalCount = await this.shipmentOrderRepository.count(filters);
      const totalPages = Math.ceil(totalCount / limit);

      res.status(200).json({
        success: true,
        data: {
          shipmentOrders,
          pagination: {
            total: totalCount,
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
            totalPages,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get shipment order by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getShipmentOrderById(req, res, next) {
    try {
      const { id } = req.params;
      const shipmentOrder = await this.shipmentOrderRepository.findById(id);

      if (!shipmentOrder) {
        throw new NotFoundError('Shipment order not found');
      }

      res.status(200).json({
        success: true,
        data: {
          shipmentOrder,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get shipment order by waybill number
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getShipmentOrderByWaybillNo(req, res, next) {
    try {
      const { waybillNo } = req.params;
      const shipmentOrder = await this.shipmentOrderRepository.findByWaybillNo(waybillNo);

      if (!shipmentOrder) {
        throw new NotFoundError('Shipment order not found');
      }

      res.status(200).json({
        success: true,
        data: {
          shipmentOrder,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create a new shipment order
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async createShipmentOrder(req, res, next) {
    try {
      const shipmentData = req.body;
      const userId = req.user.id;

      // Validate destination
      const destinationValid = await this.shipmentOrderRepository.validateDestination({
        province: shipmentData.receiver.address.province,
        city: shipmentData.receiver.address.city,
        district: shipmentData.receiver.address.district,
      });

      if (!destinationValid) {
        throw new ValidationError('Destination is not within service area');
      }

      // Calculate price if not provided
      if (!shipmentData.amount) {
        const priceDetails = await this.shipmentOrderRepository.calculatePrice({
          originBranch: shipmentData.originBranch,
          destinationBranch: shipmentData.destinationBranch,
          serviceType: shipmentData.serviceType,
          items: shipmentData.items,
          totalWeight: shipmentData.totalWeight,
          totalVolume: shipmentData.totalVolume,
          additionalServices: shipmentData.additionalServices,
          insuranceValue: shipmentData.insuranceValue,
        });

        shipmentData.amount = priceDetails;
      }

      // Set created by
      shipmentData.createdBy = userId;

      // Create shipment order
      const shipmentOrder = await this.shipmentOrderRepository.create(shipmentData);

      res.status(201).json({
        success: true,
        data: {
          shipmentOrder,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update a shipment order
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async updateShipmentOrder(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const userId = req.user.id;

      // Check if shipment order exists
      const existingShipmentOrder = await this.shipmentOrderRepository.findById(id);
      if (!existingShipmentOrder) {
        throw new NotFoundError('Shipment order not found');
      }

      // Validate destination if changed
      if (
        updateData.receiver &&
        updateData.receiver.address &&
        (updateData.receiver.address.province ||
          updateData.receiver.address.city ||
          updateData.receiver.address.district)
      ) {
        const destinationData = {
          province: updateData.receiver.address.province || existingShipmentOrder.receiver.address.province,
          city: updateData.receiver.address.city || existingShipmentOrder.receiver.address.city,
          district: updateData.receiver.address.district || existingShipmentOrder.receiver.address.district,
        };

        const destinationValid = await this.shipmentOrderRepository.validateDestination(destinationData);
        if (!destinationValid) {
          throw new ValidationError('Destination is not within service area');
        }
      }

      // Set updated by
      updateData.updatedBy = userId;

      // Update shipment order
      const shipmentOrder = await this.shipmentOrderRepository.update(id, updateData);

      res.status(200).json({
        success: true,
        data: {
          shipmentOrder,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update shipment order status
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async updateShipmentOrderStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status, location, notes } = req.body;
      const userId = req.user.id;

      // Check if shipment order exists
      const existingShipmentOrder = await this.shipmentOrderRepository.findById(id);
      if (!existingShipmentOrder) {
        throw new NotFoundError('Shipment order not found');
      }

      // Update status
      const shipmentOrder = await this.shipmentOrderRepository.updateStatus(id, status, userId, {
        location,
        notes,
      });

      res.status(200).json({
        success: true,
        data: {
          shipmentOrder,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Add document to shipment order
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async addDocument(req, res, next) {
    try {
      const { id } = req.params;
      const documentData = req.body;
      const userId = req.user.id;

      // Check if shipment order exists
      const existingShipmentOrder = await this.shipmentOrderRepository.findById(id);
      if (!existingShipmentOrder) {
        throw new NotFoundError('Shipment order not found');
      }

      // Set uploaded by
      documentData.uploadedBy = userId;

      // Add document
      const shipmentOrder = await this.shipmentOrderRepository.addDocument(id, documentData);

      res.status(200).json({
        success: true,
        data: {
          shipmentOrder,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Remove document from shipment order
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async removeDocument(req, res, next) {
    try {
      const { id, documentId } = req.params;

      // Check if shipment order exists
      const existingShipmentOrder = await this.shipmentOrderRepository.findById(id);
      if (!existingShipmentOrder) {
        throw new NotFoundError('Shipment order not found');
      }

      // Remove document
      const shipmentOrder = await this.shipmentOrderRepository.removeDocument(id, documentId);

      res.status(200).json({
        success: true,
        data: {
          shipmentOrder,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Calculate shipping price
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async calculatePrice(req, res, next) {
    try {
      const shipmentData = req.body;

      // Calculate price
      const priceDetails = await this.shipmentOrderRepository.calculatePrice(shipmentData);

      res.status(200).json({
        success: true,
        data: {
          priceDetails,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Validate destination
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async validateDestination(req, res, next) {
    try {
      const destinationData = req.body;

      // Validate destination
      const isValid = await this.shipmentOrderRepository.validateDestination(destinationData);

      res.status(200).json({
        success: true,
        data: {
          isValid,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a shipment order
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async deleteShipmentOrder(req, res, next) {
    try {
      const { id } = req.params;

      // Check if shipment order exists
      const existingShipmentOrder = await this.shipmentOrderRepository.findById(id);
      if (!existingShipmentOrder) {
        throw new NotFoundError('Shipment order not found');
      }

      // Only allow deletion of shipment orders in 'created' status
      if (existingShipmentOrder.status !== 'created') {
        throw new ValidationError('Only shipment orders in created status can be deleted');
      }

      // Delete shipment order
      await this.shipmentOrderRepository.delete(id);

      res.status(200).json({
        success: true,
        data: {
          message: 'Shipment order deleted successfully',
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Generate waybill document
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async generateWaybillDocument(req, res, next) {
    try {
      const { id } = req.params;
      const user = req.user;
      // Generate waybill document (PDF) via DocumentGenerationService
      const document = await this.documentGenerationService.generateDocument(
        id,
        'waybill',
        {},
        user
      );
      res.status(201).json({
        success: true,
        data: {
          document: {
            documentId: document.documentId,
            documentType: document.documentType,
            waybillNumber: document.waybillNumber,
            fileUrl: document.fileUrl,
            accessToken: document.accessToken,
            createdAt: document.createdAt,
          },
          viewUrl: `${req.protocol}://${req.get('host')}/api/documents/view/${document.accessToken}`,
          downloadUrl: `${req.protocol}://${req.get('host')}/api/documents/download/${document.accessToken}`,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ShipmentOrderController;
