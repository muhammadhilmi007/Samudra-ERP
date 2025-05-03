/**
 * Samudra Paket ERP - Pickup Request Routes
 * Defines API routes for pickup request management
 */

const express = require('express');
const pickupRequestController = require('../controllers/pickupRequestController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

/**
 * @route   POST /api/pickup-requests
 * @desc    Create a new pickup request
 * @access  Private (Admin, Manager, Customer Service)
 */
router.post(
  '/',
  authorize(['admin', 'manager', 'customer_service', 'sales']),
  pickupRequestController.createPickupRequest,
);

/**
 * @route   GET /api/pickup-requests
 * @desc    Get all pickup requests with filtering and pagination
 * @access  Private (Admin, Manager, Customer Service, Operations)
 */
router.get(
  '/',
  authorize(['admin', 'manager', 'customer_service', 'operations', 'warehouse', 'driver']),
  pickupRequestController.getAllPickupRequests,
);

/**
 * @route   GET /api/pickup-requests/:id
 * @desc    Get pickup request by ID
 * @access  Private (Admin, Manager, Customer Service, Operations)
 */
router.get(
  '/:id',
  authorize(['admin', 'manager', 'customer_service', 'operations', 'warehouse', 'driver']),
  pickupRequestController.getPickupRequestById,
);

/**
 * @route   GET /api/pickup-requests/code/:code
 * @desc    Get pickup request by code
 * @access  Private (Admin, Manager, Customer Service, Operations)
 */
router.get(
  '/code/:code',
  authorize(['admin', 'manager', 'customer_service', 'operations', 'warehouse', 'driver']),
  pickupRequestController.getPickupRequestByCode,
);

/**
 * @route   PUT /api/pickup-requests/:id
 * @desc    Update pickup request
 * @access  Private (Admin, Manager, Customer Service)
 */
router.put(
  '/:id',
  authorize(['admin', 'manager', 'customer_service']),
  pickupRequestController.updatePickupRequest,
);

/**
 * @route   PATCH /api/pickup-requests/:id/status
 * @desc    Update pickup request status
 * @access  Private (Admin, Manager, Customer Service, Operations, Driver)
 */
router.patch(
  '/:id/status',
  authorize(['admin', 'manager', 'customer_service', 'operations', 'warehouse', 'driver']),
  pickupRequestController.updateStatus,
);

/**
 * @route   POST /api/pickup-requests/:id/assign
 * @desc    Assign pickup request to team and vehicle
 * @access  Private (Admin, Manager, Operations)
 */
router.post(
  '/:id/assign',
  authorize(['admin', 'manager', 'operations', 'warehouse']),
  pickupRequestController.assignPickupRequest,
);

/**
 * @route   POST /api/pickup-requests/:id/execution
 * @desc    Record pickup execution details
 * @access  Private (Admin, Manager, Operations, Driver)
 */
router.post(
  '/:id/execution',
  authorize(['admin', 'manager', 'operations', 'warehouse', 'driver']),
  pickupRequestController.recordExecution,
);

/**
 * @route   POST /api/pickup-requests/:id/reschedule
 * @desc    Reschedule pickup request
 * @access  Private (Admin, Manager, Customer Service, Operations)
 */
router.post(
  '/:id/reschedule',
  authorize(['admin', 'manager', 'customer_service', 'operations', 'warehouse']),
  pickupRequestController.reschedulePickupRequest,
);

/**
 * @route   POST /api/pickup-requests/:id/cancel
 * @desc    Cancel pickup request
 * @access  Private (Admin, Manager, Customer Service)
 */
router.post(
  '/:id/cancel',
  authorize(['admin', 'manager', 'customer_service']),
  pickupRequestController.cancelPickupRequest,
);

/**
 * @route   POST /api/pickup-requests/:id/issues
 * @desc    Report issue with pickup request
 * @access  Private (Admin, Manager, Customer Service, Operations, Driver)
 */
router.post(
  '/:id/issues',
  authorize(['admin', 'manager', 'customer_service', 'operations', 'warehouse', 'driver']),
  pickupRequestController.reportIssue,
);

/**
 * @route   PATCH /api/pickup-requests/:id/issues/:issueIndex/resolve
 * @desc    Resolve issue with pickup request
 * @access  Private (Admin, Manager, Operations)
 */
router.patch(
  '/:id/issues/:issueIndex/resolve',
  authorize(['admin', 'manager', 'operations', 'warehouse']),
  pickupRequestController.resolveIssue,
);

/**
 * @route   GET /api/pickup-requests/:id/activity
 * @desc    Get pickup request activity history
 * @access  Private (Admin, Manager, Customer Service, Operations)
 */
router.get(
  '/:id/activity',
  authorize(['admin', 'manager', 'customer_service', 'operations', 'warehouse']),
  pickupRequestController.getPickupRequestActivityHistory,
);

/**
 * @route   POST /api/pickup-requests/validate-service-area
 * @desc    Validate if an address is within service area
 * @access  Private (Admin, Manager, Customer Service, Sales)
 */
router.post(
  '/validate-service-area',
  authorize(['admin', 'manager', 'customer_service', 'sales']),
  pickupRequestController.validateServiceAreaCoverage,
);

/**
 * @route   GET /api/pickup-requests/branch/:branchId/today
 * @desc    Get today's pickup requests for a branch
 * @access  Private (Admin, Manager, Operations)
 */
router.get(
  '/branch/:branchId/today',
  authorize(['admin', 'manager', 'operations', 'warehouse']),
  pickupRequestController.getTodayPickupRequests,
);

/**
 * @route   GET /api/pickup-requests/team/:teamId
 * @desc    Get pickup requests assigned to a team
 * @access  Private (Admin, Manager, Operations, Driver)
 */
router.get(
  '/team/:teamId',
  authorize(['admin', 'manager', 'operations', 'warehouse', 'driver']),
  pickupRequestController.getTeamPickupRequests,
);

/**
 * @route   GET /api/pickup-requests/search
 * @desc    Search pickup requests
 * @access  Private (Admin, Manager, Customer Service, Operations)
 */
router.get(
  '/search',
  authorize(['admin', 'manager', 'customer_service', 'operations', 'warehouse']),
  pickupRequestController.searchPickupRequests,
);

module.exports = router;
