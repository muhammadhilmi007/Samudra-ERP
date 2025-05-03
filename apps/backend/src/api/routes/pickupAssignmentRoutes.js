/**
 * Samudra Paket ERP - Pickup Assignment Routes
 * Defines API routes for pickup assignment management
 */

const express = require('express');
const pickupAssignmentController = require('../controllers/pickupAssignmentController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

/**
 * @route   POST /api/pickup-assignments
 * @desc    Create a new pickup assignment
 * @access  Private (Admin, Manager, Operations)
 */
router.post(
  '/',
  authorize(['admin', 'manager', 'operations', 'warehouse']),
  pickupAssignmentController.createPickupAssignment,
);

/**
 * @route   GET /api/pickup-assignments
 * @desc    Get all pickup assignments with filtering and pagination
 * @access  Private (Admin, Manager, Operations)
 */
router.get(
  '/',
  authorize(['admin', 'manager', 'operations', 'warehouse', 'driver']),
  pickupAssignmentController.getAllPickupAssignments,
);

/**
 * @route   GET /api/pickup-assignments/:id
 * @desc    Get pickup assignment by ID
 * @access  Private (Admin, Manager, Operations)
 */
router.get(
  '/:id',
  authorize(['admin', 'manager', 'operations', 'warehouse', 'driver']),
  pickupAssignmentController.getPickupAssignmentById,
);

/**
 * @route   GET /api/pickup-assignments/code/:code
 * @desc    Get pickup assignment by code
 * @access  Private (Admin, Manager, Operations)
 */
router.get(
  '/code/:code',
  authorize(['admin', 'manager', 'operations', 'warehouse', 'driver']),
  pickupAssignmentController.getPickupAssignmentByCode,
);

/**
 * @route   PUT /api/pickup-assignments/:id
 * @desc    Update pickup assignment
 * @access  Private (Admin, Manager, Operations)
 */
router.put(
  '/:id',
  authorize(['admin', 'manager', 'operations', 'warehouse']),
  pickupAssignmentController.updatePickupAssignment,
);

/**
 * @route   PATCH /api/pickup-assignments/:id/status
 * @desc    Update pickup assignment status
 * @access  Private (Admin, Manager, Operations, Driver)
 */
router.patch(
  '/:id/status',
  authorize(['admin', 'manager', 'operations', 'warehouse', 'driver']),
  pickupAssignmentController.updateStatus,
);

/**
 * @route   POST /api/pickup-assignments/:id/pickup-requests
 * @desc    Add pickup request to assignment
 * @access  Private (Admin, Manager, Operations)
 */
router.post(
  '/:id/pickup-requests',
  authorize(['admin', 'manager', 'operations', 'warehouse']),
  pickupAssignmentController.addPickupRequest,
);

/**
 * @route   DELETE /api/pickup-assignments/:id/pickup-requests/:pickupRequestId
 * @desc    Remove pickup request from assignment
 * @access  Private (Admin, Manager, Operations)
 */
router.delete(
  '/:id/pickup-requests/:pickupRequestId',
  authorize(['admin', 'manager', 'operations', 'warehouse']),
  pickupAssignmentController.removePickupRequest,
);

/**
 * @route   POST /api/pickup-assignments/:id/optimize-route
 * @desc    Optimize route for pickup assignment
 * @access  Private (Admin, Manager, Operations)
 */
router.post(
  '/:id/optimize-route',
  authorize(['admin', 'manager', 'operations', 'warehouse']),
  pickupAssignmentController.optimizeRoute,
);

/**
 * @route   POST /api/pickup-assignments/:id/gps-location
 * @desc    Record GPS location for pickup assignment
 * @access  Private (Driver)
 */
router.post(
  '/:id/gps-location',
  authorize(['admin', 'manager', 'operations', 'warehouse', 'driver']),
  pickupAssignmentController.recordGpsLocation,
);

/**
 * @route   PATCH /api/pickup-assignments/:id/stops/:pickupRequestId
 * @desc    Update stop status in route
 * @access  Private (Driver)
 */
router.patch(
  '/:id/stops/:pickupRequestId',
  authorize(['admin', 'manager', 'operations', 'warehouse', 'driver']),
  pickupAssignmentController.updateStopStatus,
);

/**
 * @route   POST /api/pickup-assignments/:id/issues
 * @desc    Report issue during pickup assignment
 * @access  Private (Driver)
 */
router.post(
  '/:id/issues',
  authorize(['admin', 'manager', 'operations', 'warehouse', 'driver']),
  pickupAssignmentController.reportIssue,
);

/**
 * @route   PATCH /api/pickup-assignments/:id/issues/:issueIndex/resolve
 * @desc    Resolve issue during pickup assignment
 * @access  Private (Admin, Manager, Operations)
 */
router.patch(
  '/:id/issues/:issueIndex/resolve',
  authorize(['admin', 'manager', 'operations', 'warehouse']),
  pickupAssignmentController.resolveIssue,
);

/**
 * @route   GET /api/pickup-assignments/driver/:driverId
 * @desc    Get assignments for driver
 * @access  Private (Admin, Manager, Operations, Driver)
 */
router.get(
  '/driver/:driverId',
  authorize(['admin', 'manager', 'operations', 'warehouse', 'driver']),
  pickupAssignmentController.getDriverAssignments,
);

/**
 * @route   GET /api/pickup-assignments/branch/:branchId/today
 * @desc    Get today's assignments for branch
 * @access  Private (Admin, Manager, Operations)
 */
router.get(
  '/branch/:branchId/today',
  authorize(['admin', 'manager', 'operations', 'warehouse']),
  pickupAssignmentController.getTodayAssignments,
);

/**
 * @route   GET /api/pickup-assignments/branch/:branchId/unassigned
 * @desc    Get unassigned pickup requests for branch
 * @access  Private (Admin, Manager, Operations)
 */
router.get(
  '/branch/:branchId/unassigned',
  authorize(['admin', 'manager', 'operations', 'warehouse']),
  pickupAssignmentController.getUnassignedPickupRequests,
);

module.exports = router;
