/**
 * Samudra Paket ERP - Notification Service
 * Handles notification generation and delivery
 */

const { NotFoundError, UnauthorizedError } = require('../utils/errorUtils');

/**
 * @class NotificationService
 * @description Service for handling notification generation and delivery
 */
class NotificationService {
  /**
   * @constructor
   * @param {Object} dependencies - Service dependencies
   * @param {Object} dependencies.notificationRepository - Notification repository
   * @param {Object} dependencies.emailService - Email service (optional)
   * @param {Object} dependencies.smsService - SMS service (optional)
   * @param {Object} dependencies.pushService - Push notification service (optional)
   */
  constructor({ notificationRepository, emailService, smsService, pushService }) {
    this.notificationRepository = notificationRepository;
    this.emailService = emailService;
    this.smsService = smsService;
    this.pushService = pushService;
  }

  /**
   * Create a notification
   * @param {Object} notificationData - Notification data
   * @returns {Promise<Object>} - Created notification
   */
  async createNotification(notificationData) {
    return this.notificationRepository.createNotification(notificationData);
  }

  /**
   * Get notification by ID
   * @param {string} id - Notification ID
   * @returns {Promise<Object>} - Notification object
   */
  async getNotificationById(id) {
    return this.notificationRepository.getNotificationById(id);
  }

  /**
   * Get notifications for a user
   * @param {string} userId - User ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} - Notifications with pagination
   */
  async getUserNotifications(userId, options = {}) {
    return this.notificationRepository.getUserNotifications(userId, options);
  }

  /**
   * Count unread notifications for a user
   * @param {string} userId - User ID
   * @returns {Promise<number>} - Count of unread notifications
   */
  async countUnreadNotifications(userId) {
    return this.notificationRepository.countUnreadNotifications(userId);
  }

  /**
   * Mark notification as read
   * @param {string} id - Notification ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Updated notification
   */
  async markAsRead(id, userId) {
    return this.notificationRepository.markAsRead(id, userId);
  }

  /**
   * Mark all notifications as read for a user
   * @param {string} userId - User ID
   * @param {Object} filter - Optional filter
   * @returns {Promise<number>} - Number of notifications updated
   */
  async markAllAsRead(userId, filter = {}) {
    return this.notificationRepository.markAllAsRead(userId, filter);
  }

  /**
   * Archive notification
   * @param {string} id - Notification ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Updated notification
   */
  async archiveNotification(id, userId) {
    return this.notificationRepository.archiveNotification(id, userId);
  }

  /**
   * Delete notification
   * @param {string} id - Notification ID
   * @param {string} userId - User ID
   * @returns {Promise<boolean>} - Success status
   */
  async deleteNotification(id, userId) {
    return this.notificationRepository.deleteNotification(id, userId);
  }

  /**
   * Generate notification from template
   * @param {string} templateCode - Template code
   * @param {string} userId - Recipient user ID
   * @param {Object} data - Data to populate template
   * @param {Object} entityInfo - Entity information (type and ID)
   * @returns {Promise<Object>} - Generated notification
   */
  async generateFromTemplate(templateCode, userId, data, entityInfo) {
    // Get template
    const template = await this.notificationRepository.getTemplateByCode(templateCode);
    
    // Generate content from template
    const content = template.generateContent(data);
    
    // Get user preferences
    const preferences = await this.notificationRepository.getUserPreferences(userId);
    
    // Check if notification should be delivered based on preferences
    const { enabled, channels } = preferences.shouldDeliverNotification({
      type: template.type,
      priority: template.priority
    });
    
    if (!enabled) {
      // Log that notification was skipped due to user preferences
      console.log(`Notification skipped for user ${userId} due to preferences`);
      return null;
    }
    
    // Create notification
    const notificationData = {
      recipient: userId,
      type: content.type,
      title: content.title,
      message: content.message,
      entityType: entityInfo.type,
      entityId: entityInfo.id,
      priority: content.priority,
      deliveryChannels: channels,
      isActionable: content.isActionable,
      action: content.action,
      expiresAt: content.expiresAt
    };
    
    const notification = await this.notificationRepository.createNotification(notificationData);
    
    // Deliver notification through appropriate channels
    await this.deliverNotification(notification, preferences, content);
    
    return notification;
  }

  /**
   * Deliver notification through appropriate channels
   * @param {Object} notification - Notification object
   * @param {Object} preferences - User preferences
   * @param {Object} content - Channel-specific content
   * @returns {Promise<void>}
   */
  async deliverNotification(notification, preferences, content) {
    const deliveryPromises = [];
    
    // Mark in-app notification as delivered
    if (notification.deliveryChannels.includes('in_app')) {
      deliveryPromises.push(
        this.notificationRepository.updateDeliveryStatus(notification._id, 'inApp', true)
      );
    }
    
    // Send email if enabled
    if (notification.deliveryChannels.includes('email') && this.emailService) {
      const emailAddress = preferences.contactInfo.email;
      
      if (emailAddress) {
        deliveryPromises.push(
          this.sendEmailNotification(notification, emailAddress, content.email)
            .then(result => {
              return this.notificationRepository.updateDeliveryStatus(
                notification._id,
                'email',
                true,
                { emailAddress }
              );
            })
            .catch(error => {
              console.error('Failed to send email notification:', error);
              return this.notificationRepository.updateDeliveryStatus(
                notification._id,
                'email',
                false,
                { emailAddress, error: error.message }
              );
            })
        );
      }
    }
    
    // Send SMS if enabled
    if (notification.deliveryChannels.includes('sms') && this.smsService) {
      const phoneNumber = preferences.contactInfo.phone;
      
      if (phoneNumber) {
        deliveryPromises.push(
          this.sendSmsNotification(notification, phoneNumber, content.sms)
            .then(result => {
              return this.notificationRepository.updateDeliveryStatus(
                notification._id,
                'sms',
                true,
                { phoneNumber }
              );
            })
            .catch(error => {
              console.error('Failed to send SMS notification:', error);
              return this.notificationRepository.updateDeliveryStatus(
                notification._id,
                'sms',
                false,
                { phoneNumber, error: error.message }
              );
            })
        );
      }
    }
    
    // Send push notification if enabled
    if (notification.deliveryChannels.includes('push') && this.pushService) {
      const pushTokens = preferences.contactInfo.pushTokens || [];
      
      if (pushTokens.length > 0) {
        deliveryPromises.push(
          this.sendPushNotification(notification, pushTokens, content.push)
            .then(result => {
              return this.notificationRepository.updateDeliveryStatus(
                notification._id,
                'push',
                true,
                { 
                  deviceCount: pushTokens.length,
                  successCount: result.successCount,
                  failureCount: result.failureCount
                }
              );
            })
            .catch(error => {
              console.error('Failed to send push notification:', error);
              return this.notificationRepository.updateDeliveryStatus(
                notification._id,
                'push',
                false,
                { 
                  deviceCount: pushTokens.length,
                  error: error.message
                }
              );
            })
        );
      }
    }
    
    // Wait for all delivery promises to resolve
    await Promise.all(deliveryPromises);
  }

  /**
   * Send email notification
   * @param {Object} notification - Notification object
   * @param {string} emailAddress - Recipient email address
   * @param {Object} emailContent - Email-specific content
   * @returns {Promise<Object>} - Email send result
   */
  async sendEmailNotification(notification, emailAddress, emailContent = {}) {
    if (!this.emailService) {
      throw new Error('Email service not configured');
    }
    
    const subject = emailContent.subject || notification.title;
    const htmlBody = emailContent.htmlBody || `<h1>${notification.title}</h1><p>${notification.message}</p>`;
    const textBody = emailContent.textBody || notification.message;
    
    return this.emailService.sendEmail({
      to: emailAddress,
      subject,
      html: htmlBody,
      text: textBody,
      metadata: {
        notificationId: notification._id.toString(),
        type: notification.type
      }
    });
  }

  /**
   * Send SMS notification
   * @param {Object} notification - Notification object
   * @param {string} phoneNumber - Recipient phone number
   * @param {Object} smsContent - SMS-specific content
   * @returns {Promise<Object>} - SMS send result
   */
  async sendSmsNotification(notification, phoneNumber, smsContent = {}) {
    if (!this.smsService) {
      throw new Error('SMS service not configured');
    }
    
    const message = smsContent.message || notification.message;
    
    return this.smsService.sendSms({
      to: phoneNumber,
      message,
      metadata: {
        notificationId: notification._id.toString(),
        type: notification.type
      }
    });
  }

  /**
   * Send push notification
   * @param {Object} notification - Notification object
   * @param {Array} pushTokens - Array of push tokens
   * @param {Object} pushContent - Push-specific content
   * @returns {Promise<Object>} - Push send result
   */
  async sendPushNotification(notification, pushTokens, pushContent = {}) {
    if (!this.pushService) {
      throw new Error('Push service not configured');
    }
    
    const title = pushContent.title || notification.title;
    const body = pushContent.body || notification.message;
    
    const tokens = pushTokens.map(token => token.token);
    
    return this.pushService.sendPushNotification({
      tokens,
      title,
      body,
      data: {
        notificationId: notification._id.toString(),
        type: notification.type,
        entityType: notification.entityType,
        entityId: notification.entityId.toString()
      }
    });
  }

  /**
   * Create notification template
   * @param {Object} templateData - Template data
   * @returns {Promise<Object>} - Created template
   */
  async createTemplate(templateData) {
    return this.notificationRepository.createTemplate(templateData);
  }

  /**
   * Update notification template
   * @param {string} id - Template ID
   * @param {Object} templateData - Template data
   * @returns {Promise<Object>} - Updated template
   */
  async updateTemplate(id, templateData) {
    return this.notificationRepository.updateTemplate(id, templateData);
  }

  /**
   * Delete notification template
   * @param {string} id - Template ID
   * @returns {Promise<boolean>} - Success status
   */
  async deleteTemplate(id) {
    return this.notificationRepository.deleteTemplate(id);
  }

  /**
   * Get notification templates
   * @param {Object} filter - Filter criteria
   * @returns {Promise<Array>} - Array of templates
   */
  async getTemplates(filter = {}) {
    return this.notificationRepository.getTemplates(filter);
  }

  /**
   * Get user notification preferences
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Notification preferences
   */
  async getUserPreferences(userId) {
    return this.notificationRepository.getUserPreferences(userId);
  }

  /**
   * Update user notification preferences
   * @param {string} userId - User ID
   * @param {Object} preferences - Notification preferences
   * @returns {Promise<Object>} - Updated preferences
   */
  async updateUserPreferences(userId, preferences) {
    return this.notificationRepository.updateUserPreferences(userId, preferences);
  }

  /**
   * Add push token to user preferences
   * @param {string} userId - User ID
   * @param {string} token - Push token
   * @param {string} device - Device information
   * @returns {Promise<Object>} - Updated preferences
   */
  async addPushToken(userId, token, device) {
    return this.notificationRepository.addPushToken(userId, token, device);
  }

  /**
   * Remove push token from user preferences
   * @param {string} userId - User ID
   * @param {string} token - Push token
   * @returns {Promise<Object>} - Updated preferences
   */
  async removePushToken(userId, token) {
    return this.notificationRepository.removePushToken(userId, token);
  }
}

module.exports = NotificationService;
