/**
 * Samudra Paket ERP - Delivery Order Routes
 * Defines API routes for delivery order management
 */

const express = require('express');
const router = express.Router();
const deliveryOrderController = require('../controllers/deliveryOrderController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/authorizationMiddleware');
const { validateRequest } = require('../middleware/validationMiddleware');
const deliveryOrderValidator = require('../validators/deliveryOrderValidator');

/**
 * @route   POST /api/delivery-orders
 * @desc    Create a new delivery order
 * @access  Private (requires authentication and authorization)
 */
router.post(
  '/',
  authenticate,
  authorize('delivery_orders.create'),
  validateRequest(deliveryOrderValidator.createDeliveryOrder),
  deliveryOrderController.create.bind(deliveryOrderController)
);

/**
 * @route   GET /api/delivery-orders
 * @desc    Get all delivery orders with filtering and pagination
 * @access  Private (requires authentication and authorization)
 */
router.get(
  '/',
  authenticate,
  authorize('delivery_orders.read'),
  deliveryOrderController.getAll.bind(deliveryOrderController)
);

/**
 * @route   GET /api/delivery-orders/:id
 * @desc    Get delivery order by ID
 * @access  Private (requires authentication and authorization)
 */
router.get(
  '/:id',
  authenticate,
  authorize('delivery_orders.read'),
  deliveryOrderController.getById.bind(deliveryOrderController)
);

/**
 * @route   GET /api/delivery-orders/number/:deliveryOrderNo
 * @desc    Get delivery order by delivery order number
 * @access  Private (requires authentication and authorization)
 */
router.get(
  '/number/:deliveryOrderNo',
  authenticate,
  authorize('delivery_orders.read'),
  deliveryOrderController.getByDeliveryOrderNo.bind(deliveryOrderController)
);

/**
 * @route   PUT /api/delivery-orders/:id
 * @desc    Update delivery order
 * @access  Private (requires authentication and authorization)
 */
router.put(
  '/:id',
  authenticate,
  authorize('delivery_orders.update'),
  validateRequest(deliveryOrderValidator.updateDeliveryOrder),
  deliveryOrderController.update.bind(deliveryOrderController)
);

/**
 * @route   PUT /api/delivery-orders/:id/status
 * @desc    Update delivery order status
 * @access  Private (requires authentication and authorization)
 */
router.put(
  '/:id/status',
  authenticate,
  authorize('delivery_orders.update_status'),
  validateRequest(deliveryOrderValidator.updateStatus),
  deliveryOrderController.updateStatus.bind(deliveryOrderController)
);

/**
 * @route   POST /api/delivery-orders/:id/items
 * @desc    Add delivery item to delivery order
 * @access  Private (requires authentication and authorization)
 */
router.post(
  '/:id/items',
  authenticate,
  authorize('delivery_orders.update'),
  validateRequest(deliveryOrderValidator.addDeliveryItem),
  deliveryOrderController.addDeliveryItem.bind(deliveryOrderController)
);

/**
 * @route   DELETE /api/delivery-orders/:id/items/:itemId
 * @desc    Remove delivery item from delivery order
 * @access  Private (requires authentication and authorization)
 */
router.delete(
  '/:id/items/:itemId',
  authenticate,
  authorize('delivery_orders.update'),
  deliveryOrderController.removeDeliveryItem.bind(deliveryOrderController)
);

/**
 * @route   POST /api/delivery-orders/:id/optimize-route
 * @desc    Optimize delivery route
 * @access  Private (requires authentication and authorization)
 */
router.post(
  '/:id/optimize-route',
  authenticate,
  authorize('delivery_orders.optimize_route'),
  deliveryOrderController.optimizeRoute.bind(deliveryOrderController)
);

/**
 * @route   POST /api/delivery-orders/:id/items/:itemId/proof-of-delivery
 * @desc    Record proof of delivery
 * @access  Private (requires authentication and authorization)
 */
router.post(
  '/:id/items/:itemId/proof-of-delivery',
  authenticate,
  authorize('delivery_orders.record_pod'),
  validateRequest(deliveryOrderValidator.recordProofOfDelivery),
  deliveryOrderController.recordProofOfDelivery.bind(deliveryOrderController)
);

/**
 * @route   POST /api/delivery-orders/:id/items/:itemId/cod-payment
 * @desc    Record COD payment
 * @access  Private (requires authentication and authorization)
 */
router.post(
  '/:id/items/:itemId/cod-payment',
  authenticate,
  authorize('delivery_orders.record_cod'),
  validateRequest(deliveryOrderValidator.recordCODPayment),
  deliveryOrderController.recordCODPayment.bind(deliveryOrderController)
);

/**
 * @route   POST /api/delivery-orders/:id/tracking-location
 * @desc    Update delivery tracking location
 * @access  Private (requires authentication and authorization)
 */
router.post(
  '/:id/tracking-location',
  authenticate,
  authorize('delivery_orders.update_tracking'),
  validateRequest(deliveryOrderValidator.updateTrackingLocation),
  deliveryOrderController.updateTrackingLocation.bind(deliveryOrderController)
);

/**
 * @route   POST /api/delivery-orders/:id/assign
 * @desc    Assign delivery order to vehicle and driver
 * @access  Private (requires authentication and authorization)
 */
router.post(
  '/:id/assign',
  authenticate,
  authorize('delivery_orders.assign'),
  validateRequest(deliveryOrderValidator.assignDelivery),
  deliveryOrderController.assignDelivery.bind(deliveryOrderController)
);

/**
 * @route   POST /api/delivery-orders/:id/start
 * @desc    Start delivery execution
 * @access  Private (requires authentication and authorization)
 */
router.post(
  '/:id/start',
  authenticate,
  authorize('delivery_orders.start'),
  validateRequest(deliveryOrderValidator.startDelivery),
  deliveryOrderController.startDelivery.bind(deliveryOrderController)
);

/**
 * @route   POST /api/delivery-orders/:id/complete
 * @desc    Complete delivery
 * @access  Private (requires authentication and authorization)
 */
router.post(
  '/:id/complete',
  authenticate,
  authorize('delivery_orders.complete'),
  validateRequest(deliveryOrderValidator.completeDelivery),
  deliveryOrderController.completeDelivery.bind(deliveryOrderController)
);

module.exports = router;
