/**
 * Samudra Paket ERP - Service Area Routes
 * Defines API routes for service area management
 */

const express = require('express');

const router = express.Router();
const serviceAreaController = require('../controllers/serviceAreaController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/authorizationMiddleware');

// Service Area routes
router.post(
  '/',
  authenticate,
  authorize('SERVICE_AREA_CREATE'),
  serviceAreaController.createServiceArea,
);

router.get(
  '/',
  authenticate,
  authorize('SERVICE_AREA_READ'),
  serviceAreaController.getAllServiceAreas,
);

router.get(
  '/:id',
  authenticate,
  authorize('SERVICE_AREA_READ'),
  serviceAreaController.getServiceAreaById,
);

router.put(
  '/:id',
  authenticate,
  authorize('SERVICE_AREA_UPDATE'),
  serviceAreaController.updateServiceArea,
);

router.patch(
  '/:id/status',
  authenticate,
  authorize('SERVICE_AREA_UPDATE'),
  serviceAreaController.updateServiceAreaStatus,
);

router.delete(
  '/:id',
  authenticate,
  authorize('SERVICE_AREA_DELETE'),
  serviceAreaController.deleteServiceArea,
);

// Branch-specific service area routes
router.get(
  '/branch/:branchId',
  authenticate,
  authorize('SERVICE_AREA_READ'),
  serviceAreaController.getServiceAreasByBranch,
);

// Service area coverage checking
router.post(
  '/check-point',
  authenticate,
  authorize('SERVICE_AREA_READ'),
  serviceAreaController.checkPointInServiceArea,
);

// Administrative data search
router.get(
  '/search/administrative',
  authenticate,
  authorize('SERVICE_AREA_READ'),
  serviceAreaController.findServiceAreasByAdminData,
);

module.exports = router;
