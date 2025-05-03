/**
 * Samudra Paket ERP - Notification Routes
 * Defines API routes for notification management
 */

const express = require('express');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/authorizationMiddleware');
const {
  getUserNotifications,
  getNotificationById,
  countUnreadNotifications,
  markAsRead,
  markAllAsRead,
  archiveNotification,
  deleteNotification,
  getUserPreferences,
  updateUserPreferences,
  addPushToken,
  removePushToken,
  getTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  sendTestNotification
} = require('../controllers/notificationController');
const {
  validateGetUserNotifications,
  validateGetNotificationById,
  validateMarkAsRead,
  validateMarkAllAsRead,
  validateArchiveNotification,
  validateDeleteNotification,
  validateUpdateUserPreferences,
  validateAddPushToken,
  validateRemovePushToken,
  validateGetTemplates,
  validateCreateTemplate,
  validateUpdateTemplate,
  validateDeleteTemplate,
  validateSendTestNotification
} = require('../validators/notificationValidator');

/**
 * Creates and configures notification routes
 * @returns {Object} Express router
 */
const router = express.Router();
// User notification routes
router.get(
  '/',
  authenticate,
  validateGetUserNotifications,
  getUserNotifications
);

router.get(
  '/count',
  authenticate,
  countUnreadNotifications
);

router.get(
  '/:id',
  authenticate,
  validateGetNotificationById,
  getNotificationById
);

router.patch(
  '/:id/read',
  authenticate,
  validateMarkAsRead,
  markAsRead
);

router.patch(
  '/read-all',
  authenticate,
  validateMarkAllAsRead,
  markAllAsRead
);

router.patch(
  '/:id/archive',
  authenticate,
  validateArchiveNotification,
  archiveNotification
);

router.delete(
  '/:id',
  authenticate,
  validateDeleteNotification,
  deleteNotification
);

// User preferences routes
router.get(
  '/preferences',
  authenticate,
  getUserPreferences
);

router.put(
  '/preferences',
  authenticate,
  validateUpdateUserPreferences,
  updateUserPreferences
);

// Push notification token routes
router.post(
  '/push-token',
  authenticate,
  validateAddPushToken,
  addPushToken
);

router.delete(
  '/push-token',
  authenticate,
  validateRemovePushToken,
  removePushToken
);

// Admin notification template routes
router.get(
  '/templates',
  authenticate,
  authorize('NOTIFICATION_READ'),
  validateGetTemplates,
  getTemplates
);

router.post(
  '/templates',
  authenticate,
  authorize('NOTIFICATION_CREATE'),
  validateCreateTemplate,
  createTemplate
);

router.put(
  '/templates/:id',
  authenticate,
  authorize('NOTIFICATION_UPDATE'),
  validateUpdateTemplate,
  updateTemplate
);

router.delete(
  '/templates/:id',
  authenticate,
  authorize('NOTIFICATION_DELETE'),
  validateDeleteTemplate,
  deleteTemplate
);

// Test notification route (admin only)
router.post(
  '/test',
  authenticate,
  authorize('NOTIFICATION_CREATE'),
  validateSendTestNotification,
  sendTestNotification
);

module.exports = router;
