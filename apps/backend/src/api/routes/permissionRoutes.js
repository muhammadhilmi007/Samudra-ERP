/**
 * Samudra Paket ERP - Permission Routes
 * API routes for permission management
 */

const express = require('express');
const permissionController = require('../controllers/permissionController');
const { authenticate, authorizePermissions } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @route   GET /api/permissions
 * @desc    Get all permissions
 * @access  Private (requires PERMISSION_READ permission)
 */
router.get(
  '/',
  authenticate,
  authorizePermissions('PERMISSION_READ'),
  permissionController.getAllPermissions,
);

/**
 * @route   GET /api/permissions/:id
 * @desc    Get permission by ID
 * @access  Private (requires PERMISSION_READ permission)
 */
router.get(
  '/:id',
  authenticate,
  authorizePermissions('PERMISSION_READ'),
  permissionController.getPermissionById,
);

/**
 * @route   GET /api/permissions/code/:code
 * @desc    Get permission by code
 * @access  Private (requires PERMISSION_READ permission)
 */
router.get(
  '/code/:code',
  authenticate,
  authorizePermissions('PERMISSION_READ'),
  permissionController.getPermissionByCode,
);

/**
 * @route   GET /api/permissions/module/:module
 * @desc    Get permissions by module
 * @access  Private (requires PERMISSION_READ permission)
 */
router.get(
  '/module/:module',
  authenticate,
  authorizePermissions('PERMISSION_READ'),
  permissionController.getPermissionsByModule,
);

/**
 * @route   POST /api/permissions
 * @desc    Create a new permission
 * @access  Private (requires PERMISSION_CREATE permission)
 */
router.post(
  '/',
  authenticate,
  authorizePermissions('PERMISSION_CREATE'),
  permissionController.createPermission,
);

/**
 * @route   PUT /api/permissions/:id
 * @desc    Update a permission
 * @access  Private (requires PERMISSION_UPDATE permission)
 */
router.put(
  '/:id',
  authenticate,
  authorizePermissions('PERMISSION_UPDATE'),
  permissionController.updatePermission,
);

/**
 * @route   DELETE /api/permissions/:id
 * @desc    Delete a permission
 * @access  Private (requires PERMISSION_DELETE permission)
 */
router.delete(
  '/:id',
  authenticate,
  authorizePermissions('PERMISSION_DELETE'),
  permissionController.deletePermission,
);

/**
 * @route   GET /api/permissions/check/:code
 * @desc    Check if permission code exists
 * @access  Private (requires PERMISSION_READ permission)
 */
router.get(
  '/check/:code',
  authenticate,
  authorizePermissions('PERMISSION_READ'),
  permissionController.checkPermissionCodeExists,
);

module.exports = router;
