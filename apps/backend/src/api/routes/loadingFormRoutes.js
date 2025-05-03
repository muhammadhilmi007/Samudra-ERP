/**
 * Samudra Paket ERP - Loading Form Routes
 * Defines API routes for loading form management
 */

const express = require('express');
const loadingFormController = require('../controllers/loadingFormController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

/**
 * @route   POST /api/loading-forms
 * @desc    Create a new loading form
 * @access  Private (Admin, Manager, Operations, Warehouse)
 */
router.post(
  '/',
  authorize(['admin', 'manager', 'operations', 'warehouse']),
  loadingFormController.createLoadingForm,
);

/**
 * @route   GET /api/loading-forms
 * @desc    Get all loading forms with filtering and pagination
 * @access  Private (Admin, Manager, Operations, Warehouse, Driver)
 */
router.get(
  '/',
  authorize(['admin', 'manager', 'operations', 'warehouse', 'driver']),
  loadingFormController.getAllLoadingForms,
);

/**
 * @route   GET /api/loading-forms/:id
 * @desc    Get loading form by ID
 * @access  Private (Admin, Manager, Operations, Warehouse, Driver)
 */
router.get(
  '/:id',
  authorize(['admin', 'manager', 'operations', 'warehouse', 'driver']),
  loadingFormController.getLoadingFormById,
);

/**
 * @route   GET /api/loading-forms/loading-no/:loadingNo
 * @desc    Get loading form by loading number
 * @access  Private (Admin, Manager, Operations, Warehouse, Driver)
 */
router.get(
  '/loading-no/:loadingNo',
  authorize(['admin', 'manager', 'operations', 'warehouse', 'driver']),
  loadingFormController.getLoadingFormByLoadingNo,
);

/**
 * @route   PUT /api/loading-forms/:id
 * @desc    Update loading form
 * @access  Private (Admin, Manager, Operations, Warehouse)
 */
router.put(
  '/:id',
  authorize(['admin', 'manager', 'operations', 'warehouse']),
  loadingFormController.updateLoadingForm,
);

/**
 * @route   PUT /api/loading-forms/:id/status
 * @desc    Update loading form status
 * @access  Private (Admin, Manager, Operations, Warehouse)
 */
router.put(
  '/:id/status',
  authorize(['admin', 'manager', 'operations', 'warehouse']),
  loadingFormController.updateStatus,
);

/**
 * @route   POST /api/loading-forms/:id/shipments
 * @desc    Add shipment to loading form
 * @access  Private (Admin, Manager, Operations, Warehouse)
 */
router.post(
  '/:id/shipments',
  authorize(['admin', 'manager', 'operations', 'warehouse']),
  loadingFormController.addShipment,
);

/**
 * @route   DELETE /api/loading-forms/:id/shipments/:shipmentId
 * @desc    Remove shipment from loading form
 * @access  Private (Admin, Manager, Operations, Warehouse)
 */
router.delete(
  '/:id/shipments/:shipmentId',
  authorize(['admin', 'manager', 'operations', 'warehouse']),
  loadingFormController.removeShipment,
);

/**
 * @route   PUT /api/loading-forms/:id/shipments/:shipmentId/status
 * @desc    Update shipment status in loading form
 * @access  Private (Admin, Manager, Operations, Warehouse)
 */
router.put(
  '/:id/shipments/:shipmentId/status',
  authorize(['admin', 'manager', 'operations', 'warehouse']),
  loadingFormController.updateShipmentStatus,
);

/**
 * @route   POST /api/loading-forms/:id/confirmations
 * @desc    Add loading confirmation
 * @access  Private (Admin, Manager, Operations, Warehouse, Driver)
 */
router.post(
  '/:id/confirmations',
  authorize(['admin', 'manager', 'operations', 'warehouse', 'driver']),
  loadingFormController.addLoadingConfirmation,
);

/**
 * @route   POST /api/loading-forms/:id/documents
 * @desc    Generate loading document
 * @access  Private (Admin, Manager, Operations, Warehouse)
 */
router.post(
  '/:id/documents',
  authorize(['admin', 'manager', 'operations', 'warehouse']),
  loadingFormController.generateDocument,
);

/**
 * @route   POST /api/loading-forms/:id/optimize
 * @desc    Optimize loading allocation
 * @access  Private (Admin, Manager, Operations, Warehouse)
 */
router.post(
  '/:id/optimize',
  authorize(['admin', 'manager', 'operations', 'warehouse']),
  loadingFormController.optimizeLoading,
);

/**
 * @route   GET /api/loading-forms/vehicle/:vehicleId
 * @desc    Get loading forms for vehicle
 * @access  Private (Admin, Manager, Operations, Warehouse, Driver)
 */
router.get(
  '/vehicle/:vehicleId',
  authorize(['admin', 'manager', 'operations', 'warehouse', 'driver']),
  loadingFormController.getVehicleLoadingForms,
);

/**
 * @route   GET /api/loading-forms/branch/:branchId/today
 * @desc    Get today's loading forms for branch
 * @access  Private (Admin, Manager, Operations, Warehouse)
 */
router.get(
  '/branch/:branchId/today',
  authorize(['admin', 'manager', 'operations', 'warehouse']),
  loadingFormController.getTodayLoadingForms,
);

/**
 * @route   GET /api/loading-forms/eligible-shipments
 * @desc    Get shipments eligible for loading
 * @access  Private (Admin, Manager, Operations, Warehouse)
 */
router.get(
  '/eligible-shipments',
  authorize(['admin', 'manager', 'operations', 'warehouse']),
  loadingFormController.getEligibleShipments,
);

module.exports = router;
