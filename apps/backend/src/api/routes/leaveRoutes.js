const express = require('express');
const leaveController = require('../controllers/leaveController');
const { authenticate } = require('../middleware/authMiddleware');
const { checkPermission } = require('../middleware/permissionMiddleware');

const router = express.Router();

/**
 * @route   POST /api/leaves
 * @desc    Create a new leave request
 * @access  Private (requires create_leave_request permission)
 */
router.post(
  '/',
  authenticate,
  checkPermission('create_leave_request'),
  leaveController.createLeaveRequest,
);

/**
 * @route   GET /api/leaves/:id
 * @desc    Get leave request by ID
 * @access  Private (requires view_leave_requests permission)
 */
router.get(
  '/:id',
  authenticate,
  checkPermission('view_leave_requests'),
  leaveController.getLeaveRequestById,
);

/**
 * @route   GET /api/leaves
 * @desc    Get all leave requests with optional filtering
 * @access  Private (requires view_leave_requests permission)
 */
router.get(
  '/',
  authenticate,
  checkPermission('view_leave_requests'),
  leaveController.getAllLeaveRequests,
);

/**
 * @route   PUT /api/leaves/:id
 * @desc    Update a leave request
 * @access  Private (requires manage_leave_requests permission)
 */
router.put(
  '/:id',
  authenticate,
  checkPermission('manage_leave_requests'),
  leaveController.updateLeaveRequest,
);

/**
 * @route   DELETE /api/leaves/:id
 * @desc    Delete a leave request
 * @access  Private (requires manage_leave_requests permission)
 */
router.delete(
  '/:id',
  authenticate,
  checkPermission('manage_leave_requests'),
  leaveController.deleteLeaveRequest,
);

/**
 * @route   GET /api/leaves/employee/:employeeId
 * @desc    Get leave requests by employee ID
 * @access  Private (requires view_leave_requests permission)
 */
router.get(
  '/employee/:employeeId',
  authenticate,
  checkPermission('view_leave_requests'),
  leaveController.getLeaveRequestsByEmployee,
);

/**
 * @route   GET /api/leaves/branch/:branchId
 * @desc    Get leave requests by branch ID
 * @access  Private (requires view_leave_requests permission)
 */
router.get(
  '/branch/:branchId',
  authenticate,
  checkPermission('view_leave_requests'),
  leaveController.getLeaveRequestsByBranch,
);

/**
 * @route   PUT /api/leaves/:id/approve
 * @desc    Approve a leave request
 * @access  Private (requires approve_leave_requests permission)
 */
router.put(
  '/:id/approve',
  authenticate,
  checkPermission('approve_leave_requests'),
  leaveController.approveLeaveRequest,
);

/**
 * @route   PUT /api/leaves/:id/reject
 * @desc    Reject a leave request
 * @access  Private (requires approve_leave_requests permission)
 */
router.put(
  '/:id/reject',
  authenticate,
  checkPermission('approve_leave_requests'),
  leaveController.rejectLeaveRequest,
);

/**
 * @route   PUT /api/leaves/:id/cancel
 * @desc    Cancel a leave request
 * @access  Private (requires manage_leave_requests or own request)
 */
router.put(
  '/:id/cancel',
  authenticate,
  leaveController.cancelLeaveRequest,
);

/**
 * @route   GET /api/leaves/employee/:employeeId/statistics
 * @desc    Get leave statistics for an employee
 * @access  Private (requires view_leave_reports permission)
 */
router.get(
  '/employee/:employeeId/statistics',
  authenticate,
  checkPermission('view_leave_reports'),
  leaveController.getEmployeeLeaveStatistics,
);

/**
 * @route   GET /api/leaves/branch/:branchId/statistics
 * @desc    Get leave statistics for a branch
 * @access  Private (requires view_leave_reports permission)
 */
router.get(
  '/branch/:branchId/statistics',
  authenticate,
  checkPermission('view_leave_reports'),
  leaveController.getBranchLeaveStatistics,
);

/**
 * @route   GET /api/leaves/employee/:employeeId/balance
 * @desc    Get leave balance for an employee
 * @access  Private (requires view_leave_reports permission)
 */
router.get(
  '/employee/:employeeId/balance',
  authenticate,
  checkPermission('view_leave_reports'),
  leaveController.getEmployeeLeaveBalance,
);

module.exports = router;
