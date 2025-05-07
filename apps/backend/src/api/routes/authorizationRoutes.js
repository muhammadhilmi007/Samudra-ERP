/**
 * Samudra Paket ERP - Authorization Routes
 * Routes for role and permission management
 */

const express = require('express');
const { authenticate } = require('../middleware/authMiddleware');
const { authorizePermission } = require('../middleware/authorizationMiddleware');
const authorizationController = require('../controllers/authorizationController');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// User permission management
router.post(
  '/users/:userId/permissions/:permissionCode',
  authorizePermission('USER_PERMISSION_ASSIGN'),
  authorizationController.assignPermissionToUser,
);

router.delete(
  '/users/:userId/permissions/:permissionCode',
  authorizePermission('USER_PERMISSION_REMOVE'),
  authorizationController.removePermissionFromUser,
);

router.get(
  '/users/:userId/permissions/:permissionCode/check',
  authorizePermission('USER_PERMISSION_READ'),
  authorizationController.checkUserPermission,
);

// User role management
router.post(
  '/users/:userId/roles/:roleId',
  authorizePermission('USER_ROLE_ASSIGN'),
  authorizationController.assignRoleToUser,
);

router.get(
  '/users/:userId/roles/:roleId/check',
  authorizePermission('USER_ROLE_READ'),
  authorizationController.checkUserRole,
);

// Role permission management
router.post(
  '/roles/:roleId/permissions/:permissionId',
  authorizePermission('ROLE_PERMISSION_ASSIGN'),
  authorizationController.assignPermissionToRole,
);

router.delete(
  '/roles/:roleId/permissions/:permissionId',
  authorizePermission('ROLE_PERMISSION_REMOVE'),
  authorizationController.removePermissionFromRole,
);

router.get(
  '/roles/:roleId/permissions',
  authorizePermission('ROLE_PERMISSION_READ'),
  authorizationController.getPermissionsForRole,
);

router.get(
  '/permissions/:permissionId/roles',
  authorizePermission('PERMISSION_ROLE_READ'),
  authorizationController.getRolesWithPermission,
);

module.exports = router;
