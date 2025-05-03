/**
 * Samudra Paket ERP - Monitoring Routes
 * Defines API routes for monitoring functionality
 */

const express = require('express');
const router = express.Router();
const monitoringController = require('../controllers/monitoringController');
const monitoringValidator = require('../validators/monitoringValidator');
const authMiddleware = require('../middleware/authMiddleware');
const permissionMiddleware = require('../middleware/permissionMiddleware');

// Protected routes (require authentication)
router.use(authMiddleware);

// Operational metrics endpoints
router.post(
  '/operational-metrics',
  permissionMiddleware('monitoring_create'),
  monitoringValidator.validateCreateOperationalMetric,
  monitoringController.createOperationalMetric
);

router.get(
  '/operational-metrics',
  permissionMiddleware('monitoring_read'),
  monitoringValidator.validateGetOperationalMetrics,
  monitoringController.getOperationalMetrics
);

// Performance metrics endpoints
router.post(
  '/performance-metrics',
  permissionMiddleware('monitoring_create'),
  monitoringValidator.validateCreatePerformanceMetric,
  monitoringController.createPerformanceMetric
);

router.get(
  '/performance-metrics',
  permissionMiddleware('monitoring_read'),
  monitoringValidator.validateGetPerformanceMetrics,
  monitoringController.getPerformanceMetrics
);

// Alert configuration endpoints
router.post(
  '/alerts',
  permissionMiddleware('monitoring_create'),
  monitoringValidator.validateCreateAlertConfig,
  monitoringController.createAlertConfig
);

router.put(
  '/alerts/:alertId',
  permissionMiddleware('monitoring_update'),
  monitoringValidator.validateUpdateAlertConfig,
  monitoringController.updateAlertConfig
);

router.get(
  '/alerts',
  permissionMiddleware('monitoring_read'),
  monitoringValidator.validateGetAlertConfigs,
  monitoringController.getAlertConfigs
);

router.post(
  '/alerts/:alertId/acknowledge',
  permissionMiddleware('monitoring_update'),
  monitoringValidator.validateAlertAction,
  monitoringController.acknowledgeAlert
);

router.post(
  '/alerts/:alertId/resolve',
  permissionMiddleware('monitoring_update'),
  monitoringValidator.validateAlertAction,
  monitoringController.resolveAlert
);

// Dashboard data endpoints
router.get(
  '/dashboard/:metricType',
  permissionMiddleware('monitoring_read'),
  monitoringValidator.validateGenerateDashboardData,
  monitoringController.generateDashboardData
);

// Real-time monitoring endpoints
router.get(
  '/real-time',
  permissionMiddleware('monitoring_read'),
  monitoringController.getRealTimeMetrics
);

module.exports = router;
