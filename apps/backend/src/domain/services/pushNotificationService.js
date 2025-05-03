/**
 * Samudra Paket ERP - Push Notification Service
 * Handles push notification delivery for mobile devices
 */

/**
 * @class PushNotificationService
 * @description Service for sending push notifications to mobile devices
 */
class PushNotificationService {
  /**
   * @constructor
   * @param {Object} config - Push notification service configuration
   * @param {string} config.provider - Provider name ('firebase', 'onesignal', etc.)
   * @param {Object} config.credentials - Provider-specific credentials
   */
  constructor(config) {
    this.config = config;
    this.provider = config.provider;
    
    // Initialize provider-specific client
    switch (this.provider) {
      case 'firebase':
        const admin = require('firebase-admin');
        
        if (!admin.apps.length) {
          admin.initializeApp({
            credential: admin.credential.cert(config.credentials),
          });
        }
        
        this.client = admin.messaging();
        break;
        
      case 'onesignal':
        const OneSignal = require('onesignal-node');
        this.client = new OneSignal.Client(
          config.credentials.appId,
          config.credentials.apiKey
        );
        break;
        
      default:
        throw new Error(`Unsupported push notification provider: ${this.provider}`);
    }
  }

  /**
   * Send push notification to devices
   * @param {Object} options - Push notification options
   * @param {Array} options.tokens - Device tokens
   * @param {string} options.title - Notification title
   * @param {string} options.body - Notification body
   * @param {Object} options.data - Additional data payload
   * @returns {Promise<Object>} - Send result
   */
  async sendPushNotification({ tokens, title, body, data = {} }) {
    try {
      if (!tokens || tokens.length === 0) {
        throw new Error('No device tokens provided');
      }
      
      let result;
      
      switch (this.provider) {
        case 'firebase':
          const message = {
            notification: {
              title,
              body,
            },
            data: {
              ...data,
              // Convert all values to strings as FCM requires string values
              ...Object.entries(data).reduce((acc, [key, value]) => {
                acc[key] = String(value);
                return acc;
              }, {})
            },
            tokens,
          };
          
          result = await this.client.sendMulticast(message);
          
          return {
            success: result.successCount > 0,
            successCount: result.successCount,
            failureCount: result.failureCount,
            responses: result.responses,
          };
          
        case 'onesignal':
          const notification = {
            headings: {
              en: title,
            },
            contents: {
              en: body,
            },
            data,
            include_player_ids: tokens,
          };
          
          result = await this.client.createNotification(notification);
          
          return {
            success: result.statusCode === 200,
            id: result.body.id,
            recipients: result.body.recipients,
            errors: result.body.errors,
          };
          
        default:
          throw new Error(`Unsupported push notification provider: ${this.provider}`);
      }
    } catch (error) {
      console.error('Failed to send push notification:', error);
      throw error;
    }
  }

  /**
   * Send push notification to a topic
   * @param {Object} options - Push notification options
   * @param {string} options.topic - Topic name
   * @param {string} options.title - Notification title
   * @param {string} options.body - Notification body
   * @param {Object} options.data - Additional data payload
   * @returns {Promise<Object>} - Send result
   */
  async sendTopicNotification({ topic, title, body, data = {} }) {
    try {
      if (!topic) {
        throw new Error('No topic provided');
      }
      
      let result;
      
      switch (this.provider) {
        case 'firebase':
          const message = {
            notification: {
              title,
              body,
            },
            data: {
              ...data,
              // Convert all values to strings as FCM requires string values
              ...Object.entries(data).reduce((acc, [key, value]) => {
                acc[key] = String(value);
                return acc;
              }, {})
            },
            topic,
          };
          
          result = await this.client.send(message);
          
          return {
            success: true,
            messageId: result,
          };
          
        case 'onesignal':
          const notification = {
            headings: {
              en: title,
            },
            contents: {
              en: body,
            },
            data,
            filters: [
              { field: 'tag', key: 'topic', relation: '=', value: topic },
            ],
          };
          
          result = await this.client.createNotification(notification);
          
          return {
            success: result.statusCode === 200,
            id: result.body.id,
            recipients: result.body.recipients,
            errors: result.body.errors,
          };
          
        default:
          throw new Error(`Unsupported push notification provider: ${this.provider}`);
      }
    } catch (error) {
      console.error('Failed to send topic notification:', error);
      throw error;
    }
  }

  /**
   * Subscribe devices to a topic
   * @param {Object} options - Subscription options
   * @param {Array} options.tokens - Device tokens
   * @param {string} options.topic - Topic name
   * @returns {Promise<Object>} - Subscription result
   */
  async subscribeToTopic({ tokens, topic }) {
    try {
      if (!tokens || tokens.length === 0) {
        throw new Error('No device tokens provided');
      }
      
      if (!topic) {
        throw new Error('No topic provided');
      }
      
      let result;
      
      switch (this.provider) {
        case 'firebase':
          result = await this.client.subscribeToTopic(tokens, topic);
          
          return {
            success: result.successCount > 0,
            successCount: result.successCount,
            failureCount: result.failureCount,
            errors: result.errors,
          };
          
        case 'onesignal':
          // OneSignal uses tags for topic-like functionality
          // This would require individual API calls per device
          throw new Error('Topic subscription not directly supported by OneSignal provider');
          
        default:
          throw new Error(`Unsupported push notification provider: ${this.provider}`);
      }
    } catch (error) {
      console.error('Failed to subscribe to topic:', error);
      throw error;
    }
  }

  /**
   * Unsubscribe devices from a topic
   * @param {Object} options - Unsubscription options
   * @param {Array} options.tokens - Device tokens
   * @param {string} options.topic - Topic name
   * @returns {Promise<Object>} - Unsubscription result
   */
  async unsubscribeFromTopic({ tokens, topic }) {
    try {
      if (!tokens || tokens.length === 0) {
        throw new Error('No device tokens provided');
      }
      
      if (!topic) {
        throw new Error('No topic provided');
      }
      
      let result;
      
      switch (this.provider) {
        case 'firebase':
          result = await this.client.unsubscribeFromTopic(tokens, topic);
          
          return {
            success: result.successCount > 0,
            successCount: result.successCount,
            failureCount: result.failureCount,
            errors: result.errors,
          };
          
        case 'onesignal':
          // OneSignal uses tags for topic-like functionality
          // This would require individual API calls per device
          throw new Error('Topic unsubscription not directly supported by OneSignal provider');
          
        default:
          throw new Error(`Unsupported push notification provider: ${this.provider}`);
      }
    } catch (error) {
      console.error('Failed to unsubscribe from topic:', error);
      throw error;
    }
  }
}

module.exports = PushNotificationService;
