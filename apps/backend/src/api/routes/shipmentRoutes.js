/**
 * Samudra Paket ERP - Shipment Routes
 * Defines API routes for inter-branch shipment management
 */

const express = require('express');
const shipmentController = require('../controllers/shipmentController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

/**
 * @route   POST /api/shipments
 * @desc    Create a new shipment
 * @access  Private (Admin, Manager, Operations, Warehouse)
 */
router.post(
  '/',
  authorize(['admin', 'manager', 'operations', 'warehouse']),
  shipmentController.createShipment,
);

/**
 * @route   GET /api/shipments
 * @desc    Get all shipments with filtering and pagination
 * @access  Private (Admin, Manager, Operations, Warehouse, Driver)
 */
router.get(
  '/',
  authorize(['admin', 'manager', 'operations', 'warehouse', 'driver']),
  shipmentController.getAllShipments,
);

/**
 * @route   GET /api/shipments/:id
 * @desc    Get shipment by ID
 * @access  Private (Admin, Manager, Operations, Warehouse, Driver)
 */
router.get(
  '/:id',
  authorize(['admin', 'manager', 'operations', 'warehouse', 'driver']),
  shipmentController.getShipmentById,
);

/**
 * @route   GET /api/shipments/shipment-no/:shipmentNo
 * @desc    Get shipment by shipment number
 * @access  Private (Admin, Manager, Operations, Warehouse, Driver)
 */
router.get(
  '/shipment-no/:shipmentNo',
  authorize(['admin', 'manager', 'operations', 'warehouse', 'driver']),
  shipmentController.getShipmentByShipmentNo,
);

/**
 * @route   PUT /api/shipments/:id
 * @desc    Update shipment
 * @access  Private (Admin, Manager, Operations, Warehouse)
 */
router.put(
  '/:id',
  authorize(['admin', 'manager', 'operations', 'warehouse']),
  shipmentController.updateShipment,
);

/**
 * @route   PUT /api/shipments/:id/status
 * @desc    Update shipment status
 * @access  Private (Admin, Manager, Operations, Warehouse, Driver)
 */
router.put(
  '/:id/status',
  authorize(['admin', 'manager', 'operations', 'warehouse', 'driver']),
  shipmentController.updateStatus,
);

/**
 * @route   POST /api/shipments/:id/gps-location
 * @desc    Record GPS location for shipment
 * @access  Private (Driver)
 */
router.post(
  '/:id/gps-location',
  authorize(['admin', 'manager', 'operations', 'driver']),
  shipmentController.recordGpsLocation,
);

/**
 * @route   PUT /api/shipments/:id/eta
 * @desc    Update ETA for shipment
 * @access  Private (Admin, Manager, Operations, Driver)
 */
router.put(
  '/:id/eta',
  authorize(['admin', 'manager', 'operations', 'driver']),
  shipmentController.updateETA,
);

/**
 * @route   POST /api/shipments/:id/checkpoints
 * @desc    Add checkpoint to shipment
 * @access  Private (Admin, Manager, Operations)
 */
router.post(
  '/:id/checkpoints',
  authorize(['admin', 'manager', 'operations']),
  shipmentController.addCheckpoint,
);

/**
 * @route   PUT /api/shipments/:id/checkpoints/:checkpointIndex/status
 * @desc    Update checkpoint status
 * @access  Private (Admin, Manager, Operations, Driver)
 */
router.put(
  '/:id/checkpoints/:checkpointIndex/status',
  authorize(['admin', 'manager', 'operations', 'driver']),
  shipmentController.updateCheckpointStatus,
);

/**
 * @route   POST /api/shipments/:id/issues
 * @desc    Report issue during shipment
 * @access  Private (Admin, Manager, Operations, Driver)
 */
router.post(
  '/:id/issues',
  authorize(['admin', 'manager', 'operations', 'driver']),
  shipmentController.reportIssue,
);

/**
 * @route   PUT /api/shipments/:id/issues/:issueIndex/resolve
 * @desc    Resolve issue during shipment
 * @access  Private (Admin, Manager, Operations)
 */
router.put(
  '/:id/issues/:issueIndex/resolve',
  authorize(['admin', 'manager', 'operations']),
  shipmentController.resolveIssue,
);

/**
 * @route   GET /api/shipments/branch/:branchId/active
 * @desc    Get active shipments for branch
 * @access  Private (Admin, Manager, Operations, Warehouse)
 */
router.get(
  '/branch/:branchId/active',
  authorize(['admin', 'manager', 'operations', 'warehouse']),
  shipmentController.getActiveBranchShipments,
);

/**
 * @route   GET /api/shipments/coordination/:originBranchId/:destinationBranchId
 * @desc    Get shipments for coordination between branches
 * @access  Private (Admin, Manager, Operations)
 */
router.get(
  '/coordination/:originBranchId/:destinationBranchId',
  authorize(['admin', 'manager', 'operations']),
  shipmentController.getShipmentsBetweenBranches,
);

/**
 * @route   GET /api/shipments/today
 * @desc    Get today's shipments
 * @access  Private (Admin, Manager, Operations, Warehouse)
 */
router.get(
  '/today',
  authorize(['admin', 'manager', 'operations', 'warehouse']),
  shipmentController.getTodayShipments,
);

/**
 * @route   GET /api/shipments/branch/:branchId/for-delivery
 * @desc    Get shipments eligible for delivery
 * @access  Private (Admin, Manager, Operations, Warehouse)
 */
router.get(
  '/branch/:branchId/for-delivery',
  authorize(['admin', 'manager', 'operations', 'warehouse']),
  shipmentController.getShipmentsForDelivery,
);

module.exports = router;
