/**
 * Samudra Paket ERP - API Routes
 * Main router for the API endpoints
 */

const express = require('express');
const router = express.Router();

// Import controllers
const authController = require('./controllers/authController');
const packageController = require('./controllers/packageController');

// Auth routes
router.post('/auth/login', authController.login);
router.post('/auth/refresh', authController.refreshToken);
router.post('/auth/logout', authController.logout);

// Package routes
router.get('/packages', packageController.getAllPackages);
router.get('/packages/:id', packageController.getPackageById);
router.post('/packages', packageController.createPackage);
router.put('/packages/:id', packageController.updatePackage);
router.patch('/packages/:id/status', packageController.updatePackageStatus);

module.exports = router;
