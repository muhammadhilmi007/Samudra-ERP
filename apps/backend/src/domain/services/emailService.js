/**
 * Samudra Paket ERP - Email Service
 * Handles email delivery for notifications
 */

const nodemailer = require('nodemailer');

/**
 * @class EmailService
 * @description Service for sending emails
 */
class EmailService {
  /**
   * @constructor
   * @param {Object} config - Email service configuration
   * @param {string} config.host - SMTP host
   * @param {number} config.port - SMTP port
   * @param {boolean} config.secure - Whether to use TLS
   * @param {Object} config.auth - SMTP authentication details
   * @param {string} config.auth.user - SMTP username
   * @param {string} config.auth.pass - SMTP password
   * @param {string} config.from - Default sender email address
   */
  constructor(config) {
    this.config = config;
    this.transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.auth.user,
        pass: config.auth.pass,
      },
    });
    this.defaultFrom = config.from || `"Samudra Paket" <${config.auth.user}>`;
  }

  /**
   * Send an email
   * @param {Object} options - Email options
   * @param {string} options.to - Recipient email address
   * @param {string} options.subject - Email subject
   * @param {string} options.html - HTML content
   * @param {string} options.text - Plain text content
   * @param {string} options.from - Sender email address (optional)
   * @param {Object} options.metadata - Additional metadata
   * @returns {Promise<Object>} - Send result
   */
  async sendEmail({ to, subject, html, text, from, metadata = {} }) {
    try {
      const result = await this.transporter.sendMail({
        from: from || this.defaultFrom,
        to,
        subject,
        html,
        text,
        headers: {
          'X-Notification-ID': metadata.notificationId || '',
          'X-Notification-Type': metadata.type || '',
        },
      });

      return {
        success: true,
        messageId: result.messageId,
        response: result.response,
      };
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  }

  /**
   * Send a template-based email
   * @param {Object} options - Email options
   * @param {string} options.to - Recipient email address
   * @param {string} options.template - Template name
   * @param {Object} options.data - Template data
   * @param {string} options.from - Sender email address (optional)
   * @param {Object} options.metadata - Additional metadata
   * @returns {Promise<Object>} - Send result
   */
  async sendTemplateEmail({ to, template, data, from, metadata = {} }) {
    // In a real implementation, this would load a template from a template engine
    // For simplicity, we'll just use a basic implementation
    let subject, html, text;

    switch (template) {
      case 'shipment_status':
        subject = `Shipment Status Update: ${data.trackingCode}`;
        html = `
          <h1>Shipment Status Update</h1>
          <p>Your shipment with tracking code <strong>${data.trackingCode}</strong> has been updated.</p>
          <p>Current status: <strong>${data.status}</strong></p>
          <p>Updated at: ${new Date(data.timestamp).toLocaleString()}</p>
          ${data.notes ? `<p>Notes: ${data.notes}</p>` : ''}
          <p>Thank you for choosing Samudra Paket.</p>
        `;
        text = `
          Shipment Status Update
          
          Your shipment with tracking code ${data.trackingCode} has been updated.
          Current status: ${data.status}
          Updated at: ${new Date(data.timestamp).toLocaleString()}
          ${data.notes ? `Notes: ${data.notes}` : ''}
          
          Thank you for choosing Samudra Paket.
        `;
        break;

      case 'delivery_notification':
        subject = `Delivery Notification: ${data.trackingCode}`;
        html = `
          <h1>Delivery Notification</h1>
          <p>Your shipment with tracking code <strong>${data.trackingCode}</strong> has been delivered.</p>
          <p>Delivered at: ${new Date(data.timestamp).toLocaleString()}</p>
          <p>Received by: ${data.receivedBy || 'N/A'}</p>
          ${data.notes ? `<p>Notes: ${data.notes}</p>` : ''}
          <p>Thank you for choosing Samudra Paket.</p>
        `;
        text = `
          Delivery Notification
          
          Your shipment with tracking code ${data.trackingCode} has been delivered.
          Delivered at: ${new Date(data.timestamp).toLocaleString()}
          Received by: ${data.receivedBy || 'N/A'}
          ${data.notes ? `Notes: ${data.notes}` : ''}
          
          Thank you for choosing Samudra Paket.
        `;
        break;

      case 'pickup_confirmation':
        subject = `Pickup Confirmation: ${data.pickupCode}`;
        html = `
          <h1>Pickup Confirmation</h1>
          <p>Your pickup request with code <strong>${data.pickupCode}</strong> has been confirmed.</p>
          <p>Pickup date: ${new Date(data.pickupDate).toLocaleDateString()}</p>
          <p>Pickup time: ${data.pickupTimeWindow || 'N/A'}</p>
          ${data.notes ? `<p>Notes: ${data.notes}</p>` : ''}
          <p>Thank you for choosing Samudra Paket.</p>
        `;
        text = `
          Pickup Confirmation
          
          Your pickup request with code ${data.pickupCode} has been confirmed.
          Pickup date: ${new Date(data.pickupDate).toLocaleDateString()}
          Pickup time: ${data.pickupTimeWindow || 'N/A'}
          ${data.notes ? `Notes: ${data.notes}` : ''}
          
          Thank you for choosing Samudra Paket.
        `;
        break;

      default:
        subject = 'Notification from Samudra Paket';
        html = `
          <h1>Notification</h1>
          <p>${data.message || 'You have a new notification from Samudra Paket.'}</p>
        `;
        text = `
          Notification
          
          ${data.message || 'You have a new notification from Samudra Paket.'}
        `;
    }

    return this.sendEmail({
      to,
      subject,
      html,
      text,
      from,
      metadata,
    });
  }
}

module.exports = EmailService;
