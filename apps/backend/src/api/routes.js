/**
 * Samudra Paket ERP - API Routes
 * Main router for the API endpoints
 */

const express = require('express');

const router = express.Router();

// Import controllers
const authController = require('./controllers/authController');
const packageController = require('./controllers/packageController');

// Import middleware
const { authenticate, authorizePermissions } = require('./middleware/authMiddleware');
const { validateRequest, schemas } = require('./middleware/gateway/requestValidator');

// Documentation route
router.use('/docs', express.static('public/docs'));

// Auth routes
router.post('/auth/register', validateRequest(schemas.register), authController.register);
router.post('/auth/login', validateRequest(schemas.login), authController.login);
router.post('/auth/refresh', authController.refreshToken);
router.post('/auth/logout', authenticate, authController.logout);
router.get('/auth/verify-email/:token', authController.verifyEmail);
router.post('/auth/forgot-password', validateRequest(schemas.requestPasswordReset), authController.requestPasswordReset);
router.post('/auth/reset-password', validateRequest(schemas.resetPassword), authController.resetPassword);
router.post('/auth/change-password', authenticate, validateRequest(schemas.changePassword), authController.changePassword);
router.get('/auth/profile', authenticate, authController.getProfile);

// Package routes
router.get('/packages', authenticate, packageController.getAllPackages);
router.get('/packages/:id', 
  authenticate, 
  validateRequest(schemas.idParam, 'params'),
  packageController.getPackageById
);
router.post('/packages', 
  authenticate, 
  authorizePermissions(['packages.create']),
  validateRequest(schemas.packageCreate), 
  packageController.createPackage
);
router.put('/packages/:id', 
  authenticate, 
  authorizePermissions(['packages.update']),
  validateRequest(schemas.idParam, 'params'),
  validateRequest(schemas.packageUpdate),
  packageController.updatePackage
);
router.patch('/packages/:id/status', 
  authenticate, 
  authorizePermissions(['packages.update_status']),
  validateRequest(schemas.idParam, 'params'),
  validateRequest(schemas.packageStatusUpdate),
  packageController.updatePackageStatus
);

module.exports = router;
