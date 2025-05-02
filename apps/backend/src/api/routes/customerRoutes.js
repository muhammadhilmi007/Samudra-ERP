/**
 * Samudra Paket ERP - Customer Routes
 * Defines API routes for customer management
 */

const express = require('express');
const customerController = require('../controllers/customerController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

/**
 * @route   POST /api/customers
 * @desc    Create a new customer
 * @access  Private (Admin, Manager, Sales)
 */
router.post(
  '/',
  authorize(['admin', 'manager', 'sales', 'customer_service']),
  customerController.createCustomer,
);

/**
 * @route   GET /api/customers
 * @desc    Get all customers with pagination and filtering
 * @access  Private (Admin, Manager, Sales)
 */
router.get(
  '/',
  authorize(['admin', 'manager', 'sales', 'customer_service', 'operations']),
  customerController.getAllCustomers,
);

/**
 * @route   GET /api/customers/:id
 * @desc    Get customer by ID
 * @access  Private (Admin, Manager, Sales)
 */
router.get(
  '/:id',
  authorize(['admin', 'manager', 'sales', 'customer_service', 'operations']),
  customerController.getCustomerById,
);

/**
 * @route   PUT /api/customers/:id
 * @desc    Update customer
 * @access  Private (Admin, Manager, Sales)
 */
router.put(
  '/:id',
  authorize(['admin', 'manager', 'sales', 'customer_service']),
  customerController.updateCustomer,
);

/**
 * @route   DELETE /api/customers/:id
 * @desc    Delete customer (mark as inactive)
 * @access  Private (Admin, Manager)
 */
router.delete(
  '/:id',
  authorize(['admin', 'manager']),
  customerController.deleteCustomer,
);

/**
 * @route   GET /api/customers/:id/activity
 * @desc    Get customer activity history
 * @access  Private (Admin, Manager, Sales)
 */
router.get(
  '/:id/activity',
  authorize(['admin', 'manager', 'sales', 'customer_service']),
  customerController.getCustomerActivityHistory,
);

/**
 * @route   POST /api/customers/:id/activity
 * @desc    Add activity to customer history
 * @access  Private (Admin, Manager, Sales)
 */
router.post(
  '/:id/activity',
  authorize(['admin', 'manager', 'sales', 'customer_service', 'operations']),
  customerController.addCustomerActivity,
);

/**
 * @route   GET /api/customers/category/:category
 * @desc    Get customers by category
 * @access  Private (Admin, Manager, Sales)
 */
router.get(
  '/category/:category',
  authorize(['admin', 'manager', 'sales', 'customer_service']),
  customerController.getCustomersByCategory,
);

/**
 * @route   GET /api/customers/search
 * @desc    Search customers
 * @access  Private (Admin, Manager, Sales)
 */
router.get(
  '/search',
  authorize(['admin', 'manager', 'sales', 'customer_service', 'operations']),
  customerController.searchCustomers,
);

module.exports = router;
