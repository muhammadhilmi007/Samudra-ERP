const express = require('express');

const router = express.Router();
const employeeController = require('../controllers/employeeController');
const { authenticate } = require('../middleware/authMiddleware');
const { checkPermission } = require('../middleware/permissionMiddleware');

/**
 * Employee Routes
 * Base path: /api/employees
 */

// Create a new employee
router.post(
  '/',
  authenticate,
  checkPermission('employee:create'),
  employeeController.createEmployee,
);

// Get all employees with optional filtering
router.get('/', authenticate, checkPermission('employee:read'), employeeController.getAllEmployees);

// Get employee by ID
router.get(
  '/:id',
  authenticate,
  checkPermission('employee:read'),
  employeeController.getEmployeeById,
);

// Get employee by employee ID
router.get(
  '/employee-id/:employeeId',
  authenticate,
  checkPermission('employee:read'),
  employeeController.getEmployeeByEmployeeId,
);

// Update an employee
router.put(
  '/:id',
  authenticate,
  checkPermission('employee:update'),
  employeeController.updateEmployee,
);

// Delete an employee
router.delete(
  '/:id',
  authenticate,
  checkPermission('employee:delete'),
  employeeController.deleteEmployee,
);

// Get employees by branch
router.get(
  '/branch/:branchId',
  authenticate,
  checkPermission('employee:read'),
  employeeController.getEmployeesByBranch,
);

// Get employees by position
router.get(
  '/position/:positionId',
  authenticate,
  checkPermission('employee:read'),
  employeeController.getEmployeesByPosition,
);

// Get employees by status
router.get(
  '/status/:status',
  authenticate,
  checkPermission('employee:read'),
  employeeController.getEmployeesByStatus,
);

// Get employee by user ID
router.get(
  '/user/:userId',
  authenticate,
  checkPermission('employee:read'),
  employeeController.getEmployeeByUserId,
);

// Add document to employee
router.post(
  '/:id/documents',
  authenticate,
  checkPermission('employee:update'),
  employeeController.addEmployeeDocument,
);

// Update employee document
router.put(
  '/:id/documents/:documentId',
  authenticate,
  checkPermission('employee:update'),
  employeeController.updateEmployeeDocument,
);

// Remove document from employee
router.delete(
  '/:id/documents/:documentId',
  authenticate,
  checkPermission('employee:update'),
  employeeController.removeEmployeeDocument,
);

// Update employee status
router.put(
  '/:id/status',
  authenticate,
  checkPermission('employee:update'),
  employeeController.updateEmployeeStatus,
);

module.exports = router;
