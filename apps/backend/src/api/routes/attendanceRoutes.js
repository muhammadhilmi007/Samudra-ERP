const express = require('express');
const attendanceController = require('../controllers/attendanceController');
const { authenticate } = require('../middleware/authMiddleware');
const { checkPermission } = require('../middleware/permissionMiddleware');

const router = express.Router();

/**
 * @route   POST /api/attendance
 * @desc    Create a new attendance record
 * @access  Private (requires manage_attendance permission)
 */
router.post(
  '/',
  authenticate,
  checkPermission('manage_attendance'),
  attendanceController.createAttendance,
);

/**
 * @route   GET /api/attendance/:id
 * @desc    Get attendance record by ID
 * @access  Private (requires view_attendance permission)
 */
router.get(
  '/:id',
  authenticate,
  checkPermission('view_attendance'),
  attendanceController.getAttendanceById,
);

/**
 * @route   GET /api/attendance
 * @desc    Get all attendance records with optional filtering
 * @access  Private (requires view_attendance permission)
 */
router.get(
  '/',
  authenticate,
  checkPermission('view_attendance'),
  attendanceController.getAllAttendance,
);

/**
 * @route   PUT /api/attendance/:id
 * @desc    Update an attendance record
 * @access  Private (requires manage_attendance permission)
 */
router.put(
  '/:id',
  authenticate,
  checkPermission('manage_attendance'),
  attendanceController.updateAttendance,
);

/**
 * @route   DELETE /api/attendance/:id
 * @desc    Delete an attendance record
 * @access  Private (requires manage_attendance permission)
 */
router.delete(
  '/:id',
  authenticate,
  checkPermission('manage_attendance'),
  attendanceController.deleteAttendance,
);

/**
 * @route   GET /api/attendance/employee/:employeeId
 * @desc    Get attendance records by employee ID
 * @access  Private (requires view_attendance permission)
 */
router.get(
  '/employee/:employeeId',
  authenticate,
  checkPermission('view_attendance'),
  attendanceController.getAttendanceByEmployee,
);

/**
 * @route   GET /api/attendance/branch/:branchId
 * @desc    Get attendance records by branch ID
 * @access  Private (requires view_attendance permission)
 */
router.get(
  '/branch/:branchId',
  authenticate,
  checkPermission('view_attendance'),
  attendanceController.getAttendanceByBranch,
);

/**
 * @route   POST /api/attendance/employee/:employeeId/check-in
 * @desc    Record employee check-in
 * @access  Private (requires record_attendance permission)
 */
router.post(
  '/employee/:employeeId/check-in',
  authenticate,
  checkPermission('record_attendance'),
  attendanceController.checkIn,
);

/**
 * @route   POST /api/attendance/employee/:employeeId/check-out
 * @desc    Record employee check-out
 * @access  Private (requires record_attendance permission)
 */
router.post(
  '/employee/:employeeId/check-out',
  authenticate,
  checkPermission('record_attendance'),
  attendanceController.checkOut,
);

/**
 * @route   POST /api/attendance/employee/:employeeId/absent
 * @desc    Mark employee as absent
 * @access  Private (requires manage_attendance permission)
 */
router.post(
  '/employee/:employeeId/absent',
  authenticate,
  checkPermission('manage_attendance'),
  attendanceController.markAbsent,
);

/**
 * @route   GET /api/attendance/reports/generate
 * @desc    Generate attendance report
 * @access  Private (requires view_attendance_reports permission)
 */
router.get(
  '/reports/generate',
  authenticate,
  checkPermission('view_attendance_reports'),
  attendanceController.generateAttendanceReport,
);

/**
 * @route   GET /api/attendance/employee/:employeeId/monthly-summary
 * @desc    Get monthly attendance summary for an employee
 * @access  Private (requires view_attendance permission)
 */
router.get(
  '/employee/:employeeId/monthly-summary',
  authenticate,
  checkPermission('view_attendance'),
  attendanceController.getEmployeeMonthlyAttendanceSummary,
);

module.exports = router;
