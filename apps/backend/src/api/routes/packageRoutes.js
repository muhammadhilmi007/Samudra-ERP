/**
 * Samudra Paket ERP - Package Routes
 * Routes for package-related endpoints
 */

const express = require('express');
const packageController = require('../controllers/packageController');
const { authenticate, authorizeRoles, authorizePermissions } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @route   GET /api/packages
 * @desc    Get all packages with optional filters
 * @access  Private - Requires authentication
 */
router.get('/', 
  authenticate, 
  packageController.getAllPackages
);

/**
 * @route   GET /api/packages/:id
 * @desc    Get package by ID
 * @access  Private - Requires authentication
 */
router.get('/:id', 
  authenticate, 
  packageController.getPackageById
);

/**
 * @route   POST /api/packages
 * @desc    Create a new package
 * @access  Private - Requires create_package permission
 */
router.post('/', 
  authenticate, 
  authorizePermissions('create_package'),
  packageController.createPackage
);

/**
 * @route   PUT /api/packages/:id
 * @desc    Update package by ID
 * @access  Private - Requires update_package permission
 */
router.put('/:id', 
  authenticate, 
  authorizePermissions('update_package'),
  packageController.updatePackage
);

/**
 * @route   DELETE /api/packages/:id
 * @desc    Delete package by ID
 * @access  Private - Admin only
 */
router.delete('/:id', 
  authenticate, 
  authorizeRoles('ADMIN'),
  packageController.deletePackage
);

/**
 * @route   PATCH /api/packages/:id/status
 * @desc    Update package status
 * @access  Private - Requires update_package_status permission
 */
router.patch('/:id/status', 
  authenticate, 
  authorizePermissions('update_package_status'),
  packageController.updatePackageStatus
);

module.exports = router;
