/**
 * Samudra Paket ERP - Role Routes
 * API routes for role management
 */

const express = require('express');
const roleController = require('../controllers/roleController');
const { authenticate, authorizePermissions } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @route   GET /api/roles
 * @desc    Get all roles
 * @access  Private (requires ROLE_READ permission)
 */
router.get(
  '/',
  authenticate,
  authorizePermissions('ROLE_READ'),
  roleController.getAllRoles,
);

/**
 * @route   GET /api/roles/:id
 * @desc    Get role by ID
 * @access  Private (requires ROLE_READ permission)
 */
router.get(
  '/:id',
  authenticate,
  authorizePermissions('ROLE_READ'),
  roleController.getRoleById,
);

/**
 * @route   POST /api/roles
 * @desc    Create a new role
 * @access  Private (requires ROLE_CREATE permission)
 */
router.post(
  '/',
  authenticate,
  authorizePermissions('ROLE_CREATE'),
  roleController.createRole,
);

/**
 * @route   PUT /api/roles/:id
 * @desc    Update a role
 * @access  Private (requires ROLE_UPDATE permission)
 */
router.put(
  '/:id',
  authenticate,
  authorizePermissions('ROLE_UPDATE'),
  roleController.updateRole,
);

/**
 * @route   DELETE /api/roles/:id
 * @desc    Delete a role
 * @access  Private (requires ROLE_DELETE permission)
 */
router.delete(
  '/:id',
  authenticate,
  authorizePermissions('ROLE_DELETE'),
  roleController.deleteRole,
);

/**
 * @route   GET /api/roles/:id/permissions
 * @desc    Get role permissions
 * @access  Private (requires ROLE_READ permission)
 */
router.get(
  '/:id/permissions',
  authenticate,
  authorizePermissions('ROLE_READ'),
  roleController.getRolePermissions,
);

/**
 * @route   POST /api/roles/:id/permissions/:permissionId
 * @desc    Add permission to role
 * @access  Private (requires ROLE_UPDATE permission)
 */
router.post(
  '/:id/permissions/:permissionId',
  authenticate,
  authorizePermissions('ROLE_UPDATE'),
  roleController.addPermissionToRole,
);

/**
 * @route   DELETE /api/roles/:id/permissions/:permissionId
 * @desc    Remove permission from role
 * @access  Private (requires ROLE_UPDATE permission)
 */
router.delete(
  '/:id/permissions/:permissionId',
  authenticate,
  authorizePermissions('ROLE_UPDATE'),
  roleController.removePermissionFromRole,
);

module.exports = router;
