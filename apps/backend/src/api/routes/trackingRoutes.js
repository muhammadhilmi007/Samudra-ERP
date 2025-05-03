/**
 * Samudra Paket ERP - Tracking Routes
 * Defines API routes for tracking functionality
 */

const express = require('express');
const router = express.Router();
const trackingController = require('../controllers/trackingController');
const authMiddleware = require('../middleware/authMiddleware');
const permissionMiddleware = require('../middleware/permissionMiddleware');

// Public tracking endpoint (no authentication required)
router.get('/public/:reference', trackingController.publicTracking);

// Protected routes (require authentication)
router.use(authMiddleware);

// Create tracking event (requires tracking_create permission)
router.post(
  '/',
  permissionMiddleware('tracking_create'),
  trackingController.createTrackingEvent
);

// Get tracking events by tracking code
router.get(
  '/code/:trackingCode',
  permissionMiddleware('tracking_read'),
  trackingController.getTrackingEventsByCode
);

// Get tracking events by entity
router.get(
  '/entity/:entityType/:entityId',
  permissionMiddleware('tracking_read'),
  trackingController.getTrackingEventsByEntity
);

// Generate tracking timeline
router.get(
  '/timeline/:trackingCode',
  permissionMiddleware('tracking_read'),
  trackingController.generateTrackingTimeline
);

// Update location for a tracking entity
router.post(
  '/location/:entityType/:entityId',
  permissionMiddleware('tracking_update'),
  trackingController.updateLocation
);

// Update ETA for a tracking entity
router.post(
  '/eta/:entityType/:entityId',
  permissionMiddleware('tracking_update'),
  trackingController.updateETA
);

// Find tracking information by reference
router.get(
  '/find/:reference',
  permissionMiddleware('tracking_read'),
  trackingController.findTrackingByReference
);

module.exports = router;
