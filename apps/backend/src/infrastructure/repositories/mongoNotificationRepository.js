/**
 * Samudra Paket ERP - MongoDB Notification Repository
 * Implements the notification repository interface using MongoDB
 */

const NotificationRepository = require('../../domain/repositories/notificationRepository');
const Notification = require('../../domain/models/notification');
const NotificationTemplate = require('../../domain/models/notificationTemplate');
const NotificationPreference = require('../../domain/models/notificationPreference');
const { NotFoundError, UnauthorizedError } = require('../../domain/utils/errors');

/**
 * @class MongoNotificationRepository
 * @implements {NotificationRepository}
 * @description MongoDB implementation of the notification repository
 */
class MongoNotificationRepository extends NotificationRepository {
  /**
   * Create a new notification
   * @param {Object} notificationData - Notification data
   * @returns {Promise<Object>} - Created notification
   */
  async createNotification(notificationData) {
    const notification = new Notification(notificationData);
    await notification.save();
    return notification;
  }

  /**
   * Get notification by ID
   * @param {string} id - Notification ID
   * @returns {Promise<Object>} - Notification object
   */
  async getNotificationById(id) {
    const notification = await Notification.findById(id);
    if (!notification) {
      throw new NotFoundError('Notification not found');
    }
    return notification;
  }

  /**
   * Get notifications for a user
   * @param {string} userId - User ID
   * @param {Object} options - Query options (status, type, limit, skip, sort)
   * @returns {Promise<Array>} - Array of notifications
   */
  async getUserNotifications(userId, options = {}) {
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
  }

  /**
   * Count unread notifications for a user
   * @param {string} userId - User ID
   * @returns {Promise<number>} - Count of unread notifications
   */
  async countUnreadNotifications(userId) {
    return Notification.countDocuments({
      recipient: userId,
      status: 'unread'
    });
  }

  /**
   * Mark notification as read
   * @param {string} id - Notification ID
   * @param {string} userId - User ID (for verification)
   * @returns {Promise<Object>} - Updated notification
   */
  async markAsRead(id, userId) {
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
  }

  /**
   * Mark all notifications as read for a user
   * @param {string} userId - User ID
   * @param {Object} filter - Optional filter (type, entityType, etc.)
   * @returns {Promise<number>} - Number of notifications updated
   */
  async markAllAsRead(userId, filter = {}) {
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
  }

  /**
   * Archive notification
   * @param {string} id - Notification ID
   * @param {string} userId - User ID (for verification)
   * @returns {Promise<Object>} - Updated notification
   */
  async archiveNotification(id, userId) {
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
  }

  /**
   * Update notification delivery status
   * @param {string} id - Notification ID
   * @param {string} channel - Delivery channel (inApp, email, sms, push)
   * @param {boolean} delivered - Whether the notification was delivered
   * @param {Object} additionalInfo - Additional delivery information
   * @returns {Promise<Object>} - Updated notification
   */
  async updateDeliveryStatus(id, channel, delivered, additionalInfo = {}) {
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
  }

  /**
   * Delete notification
   * @param {string} id - Notification ID
   * @param {string} userId - User ID (for verification)
   * @returns {Promise<boolean>} - Success status
   */
  async deleteNotification(id, userId) {
    const notification = await Notification.findOne({
      _id: id,
      recipient: userId
    });

    if (!notification) {
      throw new NotFoundError('Notification not found or not authorized');
    }

    await notification.deleteOne();
    return true;
  }

  /**
   * Get notification template by code
   * @param {string} code - Template code
   * @returns {Promise<Object>} - Notification template
   */
  async getTemplateByCode(code) {
    const template = await NotificationTemplate.findOne({
      code,
      isActive: true
    });

    if (!template) {
      throw new NotFoundError(`Template with code ${code} not found or inactive`);
    }

    return template;
  }

  /**
   * Create notification template
   * @param {Object} templateData - Template data
   * @returns {Promise<Object>} - Created template
   */
  async createTemplate(templateData) {
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
  }

  /**
   * Update notification template
   * @param {string} id - Template ID
   * @param {Object} templateData - Template data
   * @returns {Promise<Object>} - Updated template
   */
  async updateTemplate(id, templateData) {
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
  }

  /**
   * Delete notification template
   * @param {string} id - Template ID
   * @returns {Promise<boolean>} - Success status
   */
  async deleteTemplate(id) {
    const template = await NotificationTemplate.findById(id);
    
    if (!template) {
      throw new NotFoundError('Template not found');
    }

    await template.deleteOne();
    return true;
  }

  /**
   * Get notification templates
   * @param {Object} filter - Filter criteria
   * @returns {Promise<Array>} - Array of templates
   */
  async getTemplates(filter = {}) {
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
  }

  /**
   * Get user notification preferences
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Notification preferences
   */
  async getUserPreferences(userId) {
    let preferences = await NotificationPreference.findOne({ user: userId });
    
    // If preferences don't exist, create default preferences
    if (!preferences) {
      preferences = new NotificationPreference({ user: userId });
      await preferences.save();
    }
    
    return preferences;
  }

  /**
   * Create or update user notification preferences
   * @param {string} userId - User ID
   * @param {Object} preferences - Notification preferences
   * @returns {Promise<Object>} - Updated preferences
   */
  async updateUserPreferences(userId, preferences) {
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
  }

  /**
   * Add push token to user preferences
   * @param {string} userId - User ID
   * @param {string} token - Push token
   * @param {string} device - Device information
   * @returns {Promise<Object>} - Updated preferences
   */
  async addPushToken(userId, token, device) {
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
  }

  /**
   * Remove push token from user preferences
   * @param {string} userId - User ID
   * @param {string} token - Push token
   * @returns {Promise<Object>} - Updated preferences
   */
  async removePushToken(userId, token) {
    const preferences = await NotificationPreference.findOne({ user: userId });
    
    if (!preferences) {
      throw new NotFoundError('User preferences not found');
    }
    
    // Filter out the token
    preferences.contactInfo.pushTokens = preferences.contactInfo.pushTokens
      .filter(t => t.token !== token);
    
    await preferences.save();
    return preferences;
  }
}

module.exports = MongoNotificationRepository;
