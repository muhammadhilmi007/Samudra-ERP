/**
 * Samudra Paket ERP - Notification Controller
 * Handles API requests for notifications
 */

const notificationRepository = require('../../domain/repositories/notificationRepository');
const NotificationService = require('../../domain/services/notificationService');
const EmailService = require('../../domain/services/emailService');
const SmsService = require('../../domain/services/smsService');
const PushNotificationService = require('../../domain/services/pushNotificationService');
const { NotFoundError, UnauthorizedError } = require('../../domain/utils/errors');
const logger = require('../middleware/gateway/logger');
const config = require('../../config/config');

// Initialize notification service with delivery services if configured
let emailService = null;
let smsService = null;
let pushService = null;

// Initialize email service if configured
if (config.email && config.email.enabled) {
  emailService = new EmailService(config.email);
}

// Initialize SMS service if configured
if (config.sms && config.sms.enabled) {
  smsService = new SmsService(config.sms);
}

// Initialize push notification service if configured
if (config.push && config.push.enabled) {
  pushService = new PushNotificationService(config.push);
}

// Initialize notification service
const notificationService = new NotificationService({
  notificationRepository,
  emailService,
  smsService,
  pushService
});

/**
 * Get notifications for the authenticated user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getUserNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { 
      status, 
      type, 
      entityType, 
      entityId, 
      priority,
      limit = 20, 
      skip = 0, 
      sort = 'createdAt:-1' 
    } = req.query;

    // Parse sort parameter
    const sortObj = {};
    if (sort) {
      const [field, order] = sort.split(':');
      sortObj[field] = order === '-1' ? -1 : 1;
    }

    const options = {
      status,
      type,
      entityType,
      entityId,
      priority,
      limit: parseInt(limit, 10),
      skip: parseInt(skip, 10),
      sort: sortObj
    };

    const result = await notificationRepository.getUserNotifications(userId, options);

    res.status(200).json({
      success: true,
      data: result.notifications,
      meta: {
        pagination: result.pagination
      }
    });
  } catch (error) {
    logger.error(`Error getting user notifications: ${error.message}`, { error });
    next(error);
  }
};

/**
 * Get notification by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getNotificationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await notificationRepository.getNotificationById(id);

    // Check if notification belongs to the user
    if (notification.recipient.toString() !== userId) {
      throw new UnauthorizedError('You are not authorized to access this notification');
    }

    res.status(200).json({
      success: true,
      data: notification
    });
  } catch (error) {
    logger.error(`Error getting notification by ID: ${error.message}`, { error });
    next(error);
  }
};

/**
 * Count unread notifications for the authenticated user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const countUnreadNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const count = await notificationRepository.countUnreadNotifications(userId);

    res.status(200).json({
      success: true,
      data: { count }
    });
  } catch (error) {
    logger.error(`Error counting unread notifications: ${error.message}`, { error });
    next(error);
  }
};

/**
 * Mark notification as read
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await notificationRepository.markAsRead(id, userId);

    res.status(200).json({
      success: true,
      data: notification
    });
  } catch (error) {
    logger.error(`Error marking notification as read: ${error.message}`, { error });
    next(error);
  }
};

/**
 * Mark all notifications as read
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { type, entityType, entityId } = req.query;

    const filter = {};
    if (type) filter.type = type;
    if (entityType) filter.entityType = entityType;
    if (entityId) filter.entityId = entityId;

    const count = await notificationRepository.markAllAsRead(userId, filter);

    res.status(200).json({
      success: true,
      data: { count }
    });
  } catch (error) {
    logger.error(`Error marking all notifications as read: ${error.message}`, { error });
    next(error);
  }
};

/**
 * Archive notification
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const archiveNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await notificationRepository.archiveNotification(id, userId);

    res.status(200).json({
      success: true,
      data: notification
    });
  } catch (error) {
    logger.error(`Error archiving notification: ${error.message}`, { error });
    next(error);
  }
};

/**
 * Delete notification
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await notificationRepository.deleteNotification(id, userId);

    res.status(200).json({
      success: true,
      data: { message: 'Notification deleted successfully' }
    });
  } catch (error) {
    logger.error(`Error deleting notification: ${error.message}`, { error });
    next(error);
  }
};

/**
 * Get user notification preferences
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getUserPreferences = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const preferences = await notificationRepository.getUserPreferences(userId);

    res.status(200).json({
      success: true,
      data: preferences
    });
  } catch (error) {
    logger.error(`Error getting user preferences: ${error.message}`, { error });
    next(error);
  }
};

/**
 * Update user notification preferences
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const updateUserPreferences = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const preferences = req.body;

    const updatedPreferences = await notificationRepository.updateUserPreferences(
      userId,
      preferences
    );

    res.status(200).json({
      success: true,
      data: updatedPreferences
    });
  } catch (error) {
    logger.error(`Error updating user preferences: ${error.message}`, { error });
    next(error);
  }
};

/**
 * Add push token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const addPushToken = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { token, device } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Push token is required'
        }
      });
    }

    await notificationRepository.addPushToken(
      userId,
      token,
      device || 'unknown'
    );

    res.status(200).json({
      success: true,
      data: { message: 'Push token added successfully' }
    });
  } catch (error) {
    logger.error(`Error adding push token: ${error.message}`, { error });
    next(error);
  }
};

/**
 * Remove push token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const removePushToken = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Push token is required'
        }
      });
    }

    await notificationRepository.removePushToken(userId, token);

    res.status(200).json({
      success: true,
      data: { message: 'Push token removed successfully' }
    });
  } catch (error) {
    logger.error(`Error removing push token: ${error.message}`, { error });
    next(error);
  }
};

/**
 * Get notification templates (admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getTemplates = async (req, res, next) => {
  try {
    const { type, isActive, limit = 50, skip = 0, sort = 'code:1' } = req.query;

    // Parse sort parameter
    const sortObj = {};
    if (sort) {
      const [field, order] = sort.split(':');
      sortObj[field] = order === '-1' ? -1 : 1;
    }

    const filter = {
      type,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      limit: parseInt(limit, 10),
      skip: parseInt(skip, 10),
      sort: sortObj
    };

    const result = await notificationRepository.getTemplates(filter);

    res.status(200).json({
      success: true,
      data: result.templates,
      meta: {
        pagination: result.pagination
      }
    });
  } catch (error) {
    logger.error(`Error getting templates: ${error.message}`, { error });
    next(error);
  }
};

/**
 * Create notification template (admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const createTemplate = async (req, res, next) => {
  try {
    const templateData = req.body;
    const template = await notificationRepository.createTemplate(templateData);

    res.status(201).json({
      success: true,
      data: template
    });
  } catch (error) {
    logger.error(`Error creating template: ${error.message}`, { error });
    next(error);
  }
};

/**
 * Update notification template (admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const updateTemplate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const templateData = req.body;
    const template = await notificationRepository.updateTemplate(id, templateData);

    res.status(200).json({
      success: true,
      data: template
    });
  } catch (error) {
    logger.error(`Error updating template: ${error.message}`, { error });
    next(error);
  }
};

/**
 * Delete notification template (admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const deleteTemplate = async (req, res, next) => {
  try {
    const { id } = req.params;
    await notificationRepository.deleteTemplate(id);

    res.status(200).json({
      success: true,
      data: { message: 'Template deleted successfully' }
    });
  } catch (error) {
    logger.error(`Error deleting template: ${error.message}`, { error });
    next(error);
  }
};

/**
 * Send test notification (admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const sendTestNotification = async (req, res, next) => {
  try {
    const { templateCode, userId, data, entityInfo } = req.body;

    if (!templateCode || !userId || !data || !entityInfo) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'templateCode, userId, data, and entityInfo are required'
        }
      });
    }

    const notification = await notificationService.generateFromTemplate(
      templateCode,
      userId,
      data,
      entityInfo
    );

    res.status(200).json({
      success: true,
      data: notification || { message: 'Notification skipped due to user preferences' }
    });
  } catch (error) {
    logger.error(`Error sending test notification: ${error.message}`, { error });
    next(error);
  }
};

module.exports = {
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
};
