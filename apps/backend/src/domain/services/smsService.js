/**
 * Samudra Paket ERP - SMS Service
 * Handles SMS delivery for notifications
 */

/**
 * @class SmsService
 * @description Service for sending SMS messages
 */
class SmsService {
  /**
   * @constructor
   * @param {Object} config - SMS service configuration
   * @param {string} config.provider - SMS provider name ('twilio', 'vonage', etc.)
   * @param {Object} config.credentials - Provider-specific credentials
   * @param {string} config.from - Default sender phone number or ID
   */
  constructor(config) {
    this.config = config;
    this.provider = config.provider;
    this.from = config.from;
    
    // Initialize provider-specific client
    switch (this.provider) {
      case 'twilio':
        const twilio = require('twilio');
        this.client = new twilio(config.credentials.accountSid, config.credentials.authToken);
        break;
        
      case 'vonage':
        const Vonage = require('@vonage/server-sdk');
        this.client = new Vonage({
          apiKey: config.credentials.apiKey,
          apiSecret: config.credentials.apiSecret
        });
        break;
        
      default:
        throw new Error(`Unsupported SMS provider: ${this.provider}`);
    }
  }

  /**
   * Send an SMS message
   * @param {Object} options - SMS options
   * @param {string} options.to - Recipient phone number
   * @param {string} options.message - SMS message content
   * @param {string} options.from - Sender ID (optional)
   * @param {Object} options.metadata - Additional metadata
   * @returns {Promise<Object>} - Send result
   */
  async sendSms({ to, message, from, metadata = {} }) {
    try {
      let result;
      
      switch (this.provider) {
        case 'twilio':
          result = await this.client.messages.create({
            body: message,
            from: from || this.from,
            to,
            statusCallback: metadata.statusCallback
          });
          
          return {
            success: true,
            messageId: result.sid,
            status: result.status
          };
          
        case 'vonage':
          result = await new Promise((resolve, reject) => {
            this.client.message.sendSms(
              from || this.from,
              to,
              message,
              { type: 'unicode' },
              (error, response) => {
                if (error) {
                  reject(error);
                } else {
                  resolve(response);
                }
              }
            );
          });
          
          return {
            success: result.messages[0].status === '0',
            messageId: result.messages[0]['message-id'],
            status: result.messages[0].status
          };
          
        default:
          throw new Error(`Unsupported SMS provider: ${this.provider}`);
      }
    } catch (error) {
      console.error('Failed to send SMS:', error);
      throw error;
    }
  }

  /**
   * Send a template-based SMS
   * @param {Object} options - SMS options
   * @param {string} options.to - Recipient phone number
   * @param {string} options.template - Template name
   * @param {Object} options.data - Template data
   * @param {string} options.from - Sender ID (optional)
   * @param {Object} options.metadata - Additional metadata
   * @returns {Promise<Object>} - Send result
   */
  async sendTemplateSms({ to, template, data, from, metadata = {} }) {
    // In a real implementation, this would load a template from a template engine
    // For simplicity, we'll just use a basic implementation
    let message;

    switch (template) {
      case 'shipment_status':
        message = `Samudra Paket: Shipment ${data.trackingCode} status updated to ${data.status} at ${new Date(data.timestamp).toLocaleString()}`;
        break;

      case 'delivery_notification':
        message = `Samudra Paket: Your shipment ${data.trackingCode} has been delivered at ${new Date(data.timestamp).toLocaleString()}. Received by: ${data.receivedBy || 'N/A'}`;
        break;

      case 'pickup_confirmation':
        message = `Samudra Paket: Your pickup request ${data.pickupCode} is confirmed for ${new Date(data.pickupDate).toLocaleDateString()} ${data.pickupTimeWindow || ''}`;
        break;

      case 'otp':
        message = `Samudra Paket: Your verification code is ${data.code}. Valid for ${data.validityMinutes || 5} minutes.`;
        break;

      default:
        message = data.message || 'You have a new notification from Samudra Paket.';
    }

    // Ensure message length is within SMS limits (160 chars for standard SMS)
    if (message.length > 160) {
      message = message.substring(0, 157) + '...';
    }

    return this.sendSms({
      to,
      message,
      from,
      metadata,
    });
  }
}

module.exports = SmsService;
