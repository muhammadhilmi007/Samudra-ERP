/**
 * Samudra Paket ERP - Pickup Item Routes
 * Defines API routes for pickup item management
 */

const express = require('express');
const pickupItemController = require('../controllers/pickupItemController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

/**
 * @route   POST /api/pickup-items
 * @desc    Create a new pickup item
 * @access  Private (Driver, Checker, Operations)
 */
router.post(
  '/',
  authorize(['admin', 'manager', 'operations', 'warehouse', 'driver', 'checker']),
  pickupItemController.createPickupItem,
);

/**
 * @route   GET /api/pickup-items
 * @desc    Get all pickup items with filtering and pagination
 * @access  Private (Admin, Manager, Operations)
 */
router.get(
  '/',
  authorize(['admin', 'manager', 'operations', 'warehouse', 'checker']),
  pickupItemController.getAllPickupItems,
);

/**
 * @route   GET /api/pickup-items/:id
 * @desc    Get pickup item by ID
 * @access  Private (Admin, Manager, Operations)
 */
router.get(
  '/:id',
  authorize(['admin', 'manager', 'operations', 'warehouse', 'driver', 'checker']),
  pickupItemController.getPickupItemById,
);

/**
 * @route   GET /api/pickup-items/code/:code
 * @desc    Get pickup item by code
 * @access  Private (Admin, Manager, Operations)
 */
router.get(
  '/code/:code',
  authorize(['admin', 'manager', 'operations', 'warehouse', 'driver', 'checker']),
  pickupItemController.getPickupItemByCode,
);

/**
 * @route   PUT /api/pickup-items/:id
 * @desc    Update pickup item
 * @access  Private (Admin, Manager, Operations)
 */
router.put(
  '/:id',
  authorize(['admin', 'manager', 'operations', 'warehouse', 'checker']),
  pickupItemController.updatePickupItem,
);

/**
 * @route   PATCH /api/pickup-items/:id/status
 * @desc    Update pickup item status
 * @access  Private (Admin, Manager, Operations, Checker)
 */
router.patch(
  '/:id/status',
  authorize(['admin', 'manager', 'operations', 'warehouse', 'checker']),
  pickupItemController.updateStatus,
);

/**
 * @route   POST /api/pickup-items/:id/images
 * @desc    Add an image to a pickup item
 * @access  Private (Driver, Checker, Operations)
 */
router.post(
  '/:id/images',
  authorize(['admin', 'manager', 'operations', 'warehouse', 'driver', 'checker']),
  pickupItemController.addImage,
);

/**
 * @route   DELETE /api/pickup-items/:id/images/:imageId
 * @desc    Remove an image from a pickup item
 * @access  Private (Admin, Manager, Operations, Checker)
 */
router.delete(
  '/:id/images/:imageId',
  authorize(['admin', 'manager', 'operations', 'warehouse', 'checker']),
  pickupItemController.removeImage,
);

/**
 * @route   POST /api/pickup-items/:id/signature
 * @desc    Add a digital signature to a pickup item
 * @access  Private (Driver, Checker)
 */
router.post(
  '/:id/signature',
  authorize(['admin', 'manager', 'operations', 'warehouse', 'driver', 'checker']),
  pickupItemController.addSignature,
);

/**
 * @route   PATCH /api/pickup-items/:id/measurements
 * @desc    Update weight and dimensions of a pickup item
 * @access  Private (Checker, Operations)
 */
router.patch(
  '/:id/measurements',
  authorize(['admin', 'manager', 'operations', 'warehouse', 'checker']),
  pickupItemController.updateMeasurements,
);

/**
 * @route   GET /api/pickup-items/pickup-request/:pickupRequestId
 * @desc    Get pickup items by pickup request ID
 * @access  Private (Admin, Manager, Operations)
 */
router.get(
  '/pickup-request/:pickupRequestId',
  authorize(['admin', 'manager', 'operations', 'warehouse', 'driver', 'checker']),
  pickupItemController.getItemsByPickupRequest,
);

/**
 * @route   GET /api/pickup-items/pickup-assignment/:pickupAssignmentId
 * @desc    Get pickup items by pickup assignment ID
 * @access  Private (Admin, Manager, Operations, Driver)
 */
router.get(
  '/pickup-assignment/:pickupAssignmentId',
  authorize(['admin', 'manager', 'operations', 'warehouse', 'driver', 'checker']),
  pickupItemController.getItemsByPickupAssignment,
);

module.exports = router;
