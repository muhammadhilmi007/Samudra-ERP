/**
 * Forwarder Management Routes
 */
const express = require('express');
const { authenticate } = require('../middleware/authMiddleware');
const { checkPermission } = require('../middleware/permissionMiddleware');

/**
 * Create forwarder routes
 * @param {Object} dependencies - Controller dependencies
 * @param {Object} dependencies.forwarderController - Forwarder controller
 * @returns {express.Router} Express router
 */
module.exports = ({ forwarderController }) => {
  const router = express.Router();

  // Apply authentication middleware to all routes
  router.use(authenticate);

  // Forwarder Partner Routes
  router.get(
    '/',
    checkPermission('forwarder.view'),
    forwarderController.getAllForwarderPartners.bind(forwarderController)
  );

  router.get(
    '/:id',
    checkPermission('forwarder.view'),
    forwarderController.getForwarderPartnerById.bind(forwarderController)
  );

  router.post(
    '/',
    checkPermission('forwarder.create'),
    forwarderController.createForwarderPartner.bind(forwarderController)
  );

  router.put(
    '/:id',
    checkPermission('forwarder.update'),
    forwarderController.updateForwarderPartner.bind(forwarderController)
  );

  router.delete(
    '/:id',
    checkPermission('forwarder.delete'),
    forwarderController.deleteForwarderPartner.bind(forwarderController)
  );

  router.put(
    '/:id/status',
    checkPermission('forwarder.update'),
    forwarderController.updateForwarderPartnerStatus.bind(forwarderController)
  );

  // Forwarder Area Routes
  router.get(
    '/:forwarderId/areas',
    checkPermission('forwarder.view'),
    forwarderController.getForwarderAreas.bind(forwarderController)
  );

  router.get(
    '/areas/:id',
    checkPermission('forwarder.view'),
    forwarderController.getForwarderAreaById.bind(forwarderController)
  );

  router.post(
    '/areas',
    checkPermission('forwarder.create'),
    forwarderController.createForwarderArea.bind(forwarderController)
  );

  router.put(
    '/areas/:id',
    checkPermission('forwarder.update'),
    forwarderController.updateForwarderArea.bind(forwarderController)
  );

  router.delete(
    '/areas/:id',
    checkPermission('forwarder.delete'),
    forwarderController.deleteForwarderArea.bind(forwarderController)
  );

  // Forwarder Rate Routes
  router.get(
    '/:forwarderId/rates',
    checkPermission('forwarder.view'),
    forwarderController.getForwarderRates.bind(forwarderController)
  );

  router.get(
    '/rates/:id',
    checkPermission('forwarder.view'),
    forwarderController.getForwarderRateById.bind(forwarderController)
  );

  router.get(
    '/:forwarderId/find-rates',
    checkPermission('forwarder.view'),
    forwarderController.findRatesForRoute.bind(forwarderController)
  );

  router.post(
    '/rates',
    checkPermission('forwarder.create'),
    forwarderController.createForwarderRate.bind(forwarderController)
  );

  router.put(
    '/rates/:id',
    checkPermission('forwarder.update'),
    forwarderController.updateForwarderRate.bind(forwarderController)
  );

  router.delete(
    '/rates/:id',
    checkPermission('forwarder.delete'),
    forwarderController.deleteForwarderRate.bind(forwarderController)
  );

  // Forwarder Integration Routes
  router.post(
    '/:forwarderId/test-integration',
    checkPermission('forwarder.update'),
    forwarderController.testForwarderIntegration.bind(forwarderController)
  );

  router.post(
    '/:id/shipping-rates',
    checkPermission('forwarder.view'),
    forwarderController.getForwarderShippingRates.bind(forwarderController)
  );

  router.post(
    '/:id/shipments',
    checkPermission('forwarder.create'),
    forwarderController.createForwarderShipment.bind(forwarderController)
  );

  router.get(
    '/:id/tracking/:trackingNumber',
    checkPermission('forwarder.view'),
    forwarderController.trackForwarderShipment.bind(forwarderController)
  );

  return router;
};
