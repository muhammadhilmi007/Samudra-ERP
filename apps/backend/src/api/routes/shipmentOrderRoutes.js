/**
 * Samudra Paket ERP - Shipment Order Routes
 * Defines API routes for shipment order operations
 */

const express = require('express');
const ShipmentOrderController = require('../controllers/shipmentOrderController');
const MongoShipmentOrderRepository = require('../../infrastructure/repositories/mongoShipmentOrderRepository');
const MongoServiceAreaRepository = require('../../infrastructure/repositories/mongoServiceAreaRepository');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/permissionMiddleware');
const {
  validateCreateShipmentOrder,
  validateUpdateShipmentOrder,
  validateUpdateStatus,
  validateAddDocument,
  validateCalculatePrice,
  validateDestinationCheck,
  validateGetShipmentOrders,
} = require('../validators/shipmentOrderValidator');

// Initialize repositories
const shipmentOrderRepository = new MongoShipmentOrderRepository();
const serviceAreaRepository = new MongoServiceAreaRepository();

// Initialize controller
const shipmentOrderController = new ShipmentOrderController(
  shipmentOrderRepository,
  serviceAreaRepository
);

// Create router
const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

/**
 * @route GET /api/shipments
 * @desc Get all shipment orders with pagination and filtering
 * @access Private
 */
router.get(
  '/',
  authorize('shipments.read'),
  validateGetShipmentOrders,
  shipmentOrderController.getAllShipmentOrders.bind(shipmentOrderController)
);

/**
 * @route GET /api/shipments/:id
 * @desc Get shipment order by ID
 * @access Private
 */
router.get(
  '/:id',
  authorize('shipments.read'),
  shipmentOrderController.getShipmentOrderById.bind(shipmentOrderController)
);

/**
 * @route GET /api/shipments/waybill/:waybillNo
 * @desc Get shipment order by waybill number
 * @access Private
 */
router.get(
  '/waybill/:waybillNo',
  authorize('shipments.read'),
  shipmentOrderController.getShipmentOrderByWaybillNo.bind(shipmentOrderController)
);

/**
 * @route POST /api/shipments
 * @desc Create a new shipment order
 * @access Private
 */
router.post(
  '/',
  authorize('shipments.create'),
  validateCreateShipmentOrder,
  shipmentOrderController.createShipmentOrder.bind(shipmentOrderController)
);

/**
 * @route PUT /api/shipments/:id
 * @desc Update a shipment order
 * @access Private
 */
router.put(
  '/:id',
  authorize('shipments.update'),
  validateUpdateShipmentOrder,
  shipmentOrderController.updateShipmentOrder.bind(shipmentOrderController)
);

/**
 * @route PUT /api/shipments/:id/status
 * @desc Update shipment order status
 * @access Private
 */
router.put(
  '/:id/status',
  authorize('shipments.update_status'),
  validateUpdateStatus,
  shipmentOrderController.updateShipmentOrderStatus.bind(shipmentOrderController)
);

/**
 * @route POST /api/shipments/:id/documents
 * @desc Add document to shipment order
 * @access Private
 */
router.post(
  '/:id/documents',
  authorize('shipments.manage_documents'),
  validateAddDocument,
  shipmentOrderController.addDocument.bind(shipmentOrderController)
);

/**
 * @route DELETE /api/shipments/:id/documents/:documentId
 * @desc Remove document from shipment order
 * @access Private
 */
router.delete(
  '/:id/documents/:documentId',
  authorize('shipments.manage_documents'),
  shipmentOrderController.removeDocument.bind(shipmentOrderController)
);

/**
 * @route POST /api/shipments/calculate-price
 * @desc Calculate shipping price
 * @access Private
 */
router.post(
  '/calculate-price',
  authorize('shipments.read'),
  validateCalculatePrice,
  shipmentOrderController.calculatePrice.bind(shipmentOrderController)
);

/**
 * @route POST /api/shipments/validate-destination
 * @desc Validate destination
 * @access Private
 */
router.post(
  '/validate-destination',
  authorize('shipments.read'),
  validateDestinationCheck,
  shipmentOrderController.validateDestination.bind(shipmentOrderController)
);

/**
 * @route DELETE /api/shipments/:id
 * @desc Delete a shipment order
 * @access Private
 */
router.delete(
  '/:id',
  authorize('shipments.delete'),
  shipmentOrderController.deleteShipmentOrder.bind(shipmentOrderController)
);

/**
 * @route GET /api/shipments/:id/waybill-document
 * @desc Generate waybill document
 * @access Private
 */
router.get(
  '/:id/waybill-document',
  authorize('shipments.read'),
  shipmentOrderController.generateWaybillDocument.bind(shipmentOrderController)
);

module.exports = router;
