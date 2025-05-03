/**
 * Samudra Paket ERP - Notification Repository
 * Handles data access operations for notifications
 */

const mongoose = require('mongoose');
const Notification = require('../models/notification');
const NotificationTemplate = require('../models/notificationTemplate');
const NotificationPreference = require('../models/notificationPreference');
const { NotFoundError, UnauthorizedError } = require('../utils/errors');
const logger = require('../../api/middleware/gateway/logger');

/**
 * Create a new notification
 * @param {Object} notificationData - Notification data
 * @returns {Promise<Object>} - Created notification
 */
const createNotification = async (notificationData) => {
  try {
    const notification = new Notification(notificationData);
    await notification.save();
    return notification;
  } catch (error) {
    logger.error(`Error creating notification: ${error.message}`, { error });
    throw error;
  }
};

/**
 * Get notification by ID
 * @param {string} id - Notification ID
 * @returns {Promise<Object>} - Notification object
 */
const getNotificationById = async (id) => {
  try {
    const notification = await Notification.findById(id);
    if (!notification) {
      throw new NotFoundError('Notification not found');
    }
    return notification;
  } catch (error) {
    logger.error(`Error getting notification by ID: ${error.message}`, { error });
    throw error;
  }
};

/**
 * Get notifications for a user
 * @param {string} userId - User ID
 * @param {Object} options - Query options (status, type, limit, skip, sort)
 * @returns {Promise<Object>} - Notifications with pagination
 */
const getUserNotifications = async (userId, options = {}) => {
  try {
    const {
      status,
      type,
      entityType,
      entityId,
      priority,
      limit = 20,
      skip = 0,
      sort = { createdAt: -1 }
    } = options;

    const query = { recipient: userId };

    if (status) {
      query.status = Array.isArray(status) ? { $in: status } : status;
    }

    if (type) {
      query.type = Array.isArray(type) ? { $in: type } : type;
    }

    if (entityType) {
      query.entityType = entityType;
    }

    if (entityId) {
      query.entityId = entityId;
    }

    if (priority) {
      query.priority = Array.isArray(priority) ? { $in: priority } : priority;
    }

    const notifications = await Notification.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Notification.countDocuments(query);

    return {
      notifications,
      pagination: {
        total,
        limit,
        skip,
        hasMore: skip + notifications.length < total
      }
    };
  } catch (error) {
    logger.error(`Error getting user notifications: ${error.message}`, { error });
    throw error;
  }
};

/**
 * Count unread notifications for a user
 * @param {string} userId - User ID
 * @returns {Promise<number>} - Count of unread notifications
 */
const countUnreadNotifications = async (userId) => {
  try {
    return await Notification.countDocuments({
      recipient: userId,
      status: 'unread'
    });
  } catch (error) {
    logger.error(`Error counting unread notifications: ${error.message}`, { error });
    throw error;
  }
};

/**
 * Mark notification as read
 * @param {string} id - Notification ID
 * @param {string} userId - User ID (for verification)
 * @returns {Promise<Object>} - Updated notification
 */
const markAsRead = async (id, userId) => {
  try {
    const notification = await Notification.findOne({
      _id: id,
      recipient: userId
    });

    if (!notification) {
      throw new NotFoundError('Notification not found or not authorized');
    }

    notification.status = 'read';
    await notification.save();
    return notification;
  } catch (error) {
    logger.error(`Error marking notification as read: ${error.message}`, { error });
    throw error;
  }
};

/**
 * Mark all notifications as read for a user
 * @param {string} userId - User ID
 * @param {Object} filter - Optional filter (type, entityType, etc.)
 * @returns {Promise<number>} - Number of notifications updated
 */
const markAllAsRead = async (userId, filter = {}) => {
  try {
    const query = {
      recipient: userId,
      status: 'unread',
      ...filter
    };

    const result = await Notification.updateMany(
      query,
      { $set: { status: 'read' } }
    );

    return result.modifiedCount;
  } catch (error) {
    logger.error(`Error marking all notifications as read: ${error.message}`, { error });
    throw error;
  }
};

/**
 * Archive notification
 * @param {string} id - Notification ID
 * @param {string} userId - User ID (for verification)
 * @returns {Promise<Object>} - Updated notification
 */
const archiveNotification = async (id, userId) => {
  try {
    const notification = await Notification.findOne({
      _id: id,
      recipient: userId
    });

    if (!notification) {
      throw new NotFoundError('Notification not found or not authorized');
    }

    notification.status = 'archived';
    await notification.save();
    return notification;
  } catch (error) {
    logger.error(`Error archiving notification: ${error.message}`, { error });
    throw error;
  }
};

/**
 * Update notification delivery status
 * @param {string} id - Notification ID
 * @param {string} channel - Delivery channel (inApp, email, sms, push)
 * @param {boolean} delivered - Whether the notification was delivered
 * @param {Object} additionalInfo - Additional delivery information
 * @returns {Promise<Object>} - Updated notification
 */
const updateDeliveryStatus = async (id, channel, delivered, additionalInfo = {}) => {
  try {
    const notification = await Notification.findById(id);
    
    if (!notification) {
      throw new NotFoundError('Notification not found');
    }

    // Normalize channel name to match schema
    const normalizedChannel = channel === 'inApp' ? 'inApp' : channel.toLowerCase();
    
    if (!notification.deliveryStatus[normalizedChannel]) {
      throw new Error(`Invalid channel: ${channel}`);
    }

    notification.deliveryStatus[normalizedChannel].delivered = delivered;
    
    if (delivered) {
      notification.deliveryStatus[normalizedChannel].deliveredAt = new Date();
    }
    
    // Add any additional info
    Object.keys(additionalInfo).forEach(key => {
      if (key !== 'delivered' && key !== 'deliveredAt') {
        notification.deliveryStatus[normalizedChannel][key] = additionalInfo[key];
      }
    });
    
    await notification.save();
    return notification;
  } catch (error) {
    logger.error(`Error updating delivery status: ${error.message}`, { error });
    throw error;
  }
};

/**
 * Delete notification
 * @param {string} id - Notification ID
 * @param {string} userId - User ID (for verification)
 * @returns {Promise<boolean>} - Success status
 */
const deleteNotification = async (id, userId) => {
  try {
    const notification = await Notification.findOne({
      _id: id,
      recipient: userId
    });

    if (!notification) {
      throw new NotFoundError('Notification not found or not authorized');
    }

    await notification.deleteOne();
    return true;
  } catch (error) {
    logger.error(`Error deleting notification: ${error.message}`, { error });
    throw error;
  }
};

/**
 * Get notification template by code
 * @param {string} code - Template code
 * @returns {Promise<Object>} - Notification template
 */
const getTemplateByCode = async (code) => {
  try {
    const template = await NotificationTemplate.findOne({
      code,
      isActive: true
    });

    if (!template) {
      throw new NotFoundError(`Template with code ${code} not found or inactive`);
    }

    return template;
  } catch (error) {
    logger.error(`Error getting template by code: ${error.message}`, { error });
    throw error;
  }
};

/**
 * Create notification template
 * @param {Object} templateData - Template data
 * @returns {Promise<Object>} - Created template
 */
const createTemplate = async (templateData) => {
  try {
    // Check if template with the same code already exists
    const existingTemplate = await NotificationTemplate.findOne({
      code: templateData.code
    });

    if (existingTemplate) {
      throw new Error(`Template with code ${templateData.code} already exists`);
    }

    const template = new NotificationTemplate(templateData);
    await template.save();
    return template;
  } catch (error) {
    logger.error(`Error creating template: ${error.message}`, { error });
    throw error;
  }
};

/**
 * Update notification template
 * @param {string} id - Template ID
 * @param {Object} templateData - Template data
 * @returns {Promise<Object>} - Updated template
 */
const updateTemplate = async (id, templateData) => {
  try {
    const template = await NotificationTemplate.findById(id);
    
    if (!template) {
      throw new NotFoundError('Template not found');
    }

    // If code is being changed, check for duplicates
    if (templateData.code && templateData.code !== template.code) {
      const existingTemplate = await NotificationTemplate.findOne({
        code: templateData.code,
        _id: { $ne: id }
      });

      if (existingTemplate) {
        throw new Error(`Template with code ${templateData.code} already exists`);
      }
    }

    Object.keys(templateData).forEach(key => {
      template[key] = templateData[key];
    });

    await template.save();
    return template;
  } catch (error) {
    logger.error(`Error updating template: ${error.message}`, { error });
    throw error;
  }
};

/**
 * Delete notification template
 * @param {string} id - Template ID
 * @returns {Promise<boolean>} - Success status
 */
const deleteTemplate = async (id) => {
  try {
    const template = await NotificationTemplate.findById(id);
    
    if (!template) {
      throw new NotFoundError('Template not found');
    }

    await template.deleteOne();
    return true;
  } catch (error) {
    logger.error(`Error deleting template: ${error.message}`, { error });
    throw error;
  }
};

/**
 * Get notification templates
 * @param {Object} filter - Filter criteria
 * @returns {Promise<Object>} - Templates with pagination
 */
const getTemplates = async (filter = {}) => {
  try {
    const {
      type,
      isActive,
      limit = 50,
      skip = 0,
      sort = { code: 1 }
    } = filter;

    const query = {};

    if (type) {
      query.type = Array.isArray(type) ? { $in: type } : type;
    }

    if (isActive !== undefined) {
      query.isActive = isActive;
    }

    const templates = await NotificationTemplate.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await NotificationTemplate.countDocuments(query);

    return {
      templates,
      pagination: {
        total,
        limit,
        skip,
        hasMore: skip + templates.length < total
      }
    };
  } catch (error) {
    logger.error(`Error getting templates: ${error.message}`, { error });
    throw error;
  }
};

/**
 * Get user notification preferences
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - Notification preferences
 */
const getUserPreferences = async (userId) => {
  try {
    let preferences = await NotificationPreference.findOne({ user: userId });
    
    // If preferences don't exist, create default preferences
    if (!preferences) {
      preferences = new NotificationPreference({ user: userId });
      await preferences.save();
    }
    
    return preferences;
  } catch (error) {
    logger.error(`Error getting user preferences: ${error.message}`, { error });
    throw error;
  }
};

/**
 * Create or update user notification preferences
 * @param {string} userId - User ID
 * @param {Object} preferences - Notification preferences
 * @returns {Promise<Object>} - Updated preferences
 */
const updateUserPreferences = async (userId, preferences) => {
  try {
    let userPreferences = await NotificationPreference.findOne({ user: userId });
    
    if (!userPreferences) {
      userPreferences = new NotificationPreference({ 
        user: userId,
        ...preferences
      });
    } else {
      // Update only provided fields
      if (preferences.notificationTypes) {
        Object.keys(preferences.notificationTypes).forEach(type => {
          if (userPreferences.notificationTypes[type]) {
            const typePrefs = preferences.notificationTypes[type];
            
            if (typePrefs.enabled !== undefined) {
              userPreferences.notificationTypes[type].enabled = typePrefs.enabled;
            }
            
            if (typePrefs.channels) {
              Object.keys(typePrefs.channels).forEach(channel => {
                userPreferences.notificationTypes[type].channels[channel] = 
                  typePrefs.channels[channel];
              });
            }
            
            if (typePrefs.minPriority) {
              userPreferences.notificationTypes[type].minPriority = typePrefs.minPriority;
            }
          }
        });
      }
      
      if (preferences.quietHours) {
        Object.keys(preferences.quietHours).forEach(key => {
          userPreferences.quietHours[key] = preferences.quietHours[key];
        });
      }
      
      if (preferences.contactInfo) {
        if (preferences.contactInfo.email) {
          userPreferences.contactInfo.email = preferences.contactInfo.email;
        }
        
        if (preferences.contactInfo.phone) {
          userPreferences.contactInfo.phone = preferences.contactInfo.phone;
        }
      }
    }
    
    await userPreferences.save();
    return userPreferences;
  } catch (error) {
    logger.error(`Error updating user preferences: ${error.message}`, { error });
    throw error;
  }
};

/**
 * Add push token to user preferences
 * @param {string} userId - User ID
 * @param {string} token - Push token
 * @param {string} device - Device information
 * @returns {Promise<Object>} - Updated preferences
 */
const addPushToken = async (userId, token, device) => {
  try {
    let preferences = await NotificationPreference.findOne({ user: userId });
    
    if (!preferences) {
      preferences = new NotificationPreference({ 
        user: userId,
        contactInfo: {
          pushTokens: [{ token, device, lastUsed: new Date() }]
        }
      });
    } else {
      // Check if token already exists
      const existingTokenIndex = preferences.contactInfo.pushTokens
        .findIndex(t => t.token === token);
      
      if (existingTokenIndex >= 0) {
        // Update existing token
        preferences.contactInfo.pushTokens[existingTokenIndex].lastUsed = new Date();
        preferences.contactInfo.pushTokens[existingTokenIndex].device = device;
      } else {
        // Add new token
        preferences.contactInfo.pushTokens.push({
          token,
          device,
          lastUsed: new Date()
        });
      }
    }
    
    await preferences.save();
    return preferences;
  } catch (error) {
    logger.error(`Error adding push token: ${error.message}`, { error });
    throw error;
  }
};

/**
 * Remove push token from user preferences
 * @param {string} userId - User ID
 * @param {string} token - Push token
 * @returns {Promise<Object>} - Updated preferences
 */
const removePushToken = async (userId, token) => {
  try {
    const preferences = await NotificationPreference.findOne({ user: userId });
    
    if (!preferences) {
      throw new NotFoundError('User preferences not found');
    }
    
    // Filter out the token
    preferences.contactInfo.pushTokens = preferences.contactInfo.pushTokens
      .filter(t => t.token !== token);
    
    await preferences.save();
    return preferences;
  } catch (error) {
    logger.error(`Error removing push token: ${error.message}`, { error });
    throw error;
  }
};

module.exports = {
  createNotification,
  getNotificationById,
  getUserNotifications,
  countUnreadNotifications,
  markAsRead,
  markAllAsRead,
  archiveNotification,
  updateDeliveryStatus,
  deleteNotification,
  getTemplateByCode,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  getTemplates,
  getUserPreferences,
  updateUserPreferences,
  addPushToken,
  removePushToken
};
