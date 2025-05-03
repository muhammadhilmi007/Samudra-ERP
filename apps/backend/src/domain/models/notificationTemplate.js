/**
 * Samudra Paket ERP - Notification Template Model
 * Defines the schema for notification templates
 */

const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * Notification Template Schema
 * Used for storing reusable notification templates with placeholders
 */
const notificationTemplateSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: [
        'shipment_status',
        'pickup_status',
        'delivery_status',
        'issue_alert',
        'system_alert',
        'payment_reminder',
        'assignment',
        'document_update',
        'custom'
      ],
      required: true,
    },
    titleTemplate: {
      type: String,
      required: true,
    },
    messageTemplate: {
      type: String,
      required: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    defaultChannels: [{
      type: String,
      enum: ['in_app', 'email', 'sms', 'push'],
      default: ['in_app'],
    }],
    emailTemplate: {
      subject: { type: String },
      htmlBody: { type: String },
      textBody: { type: String },
    },
    smsTemplate: {
      type: String,
    },
    pushTemplate: {
      title: { type: String },
      body: { type: String },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isActionable: {
      type: Boolean,
      default: false,
    },
    action: {
      type: {
        type: String,
        enum: ['link', 'button', 'form'],
      },
      label: { type: String },
      urlTemplate: { type: String },
    },
    expiryDays: {
      type: Number,
      default: 30, // Default expiry of 30 days
    },
    metadata: {
      type: Schema.Types.Mixed,
    }
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
notificationTemplateSchema.index({ code: 1 });
notificationTemplateSchema.index({ type: 1, isActive: 1 });

/**
 * Compile a template with provided data
 * @param {string} template - Template string with placeholders
 * @param {Object} data - Data object with values for placeholders
 * @returns {string} - Compiled template
 */
function compileTemplate(template, data) {
  if (!template) return '';
  
  return template.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
    const keys = key.trim().split('.');
    let value = data;
    
    for (const k of keys) {
      if (value === undefined || value === null) return match;
      value = value[k];
    }
    
    return value !== undefined && value !== null ? value : match;
  });
}

/**
 * Generate notification content from template and data
 * @param {Object} data - Data to populate the template
 * @returns {Object} - Generated notification content
 */
notificationTemplateSchema.methods.generateContent = function(data) {
  const content = {
    title: compileTemplate(this.titleTemplate, data),
    message: compileTemplate(this.messageTemplate, data),
    type: this.type,
    priority: this.priority,
    deliveryChannels: this.defaultChannels,
    isActionable: this.isActionable,
    action: null
  };
  
  // Generate channel-specific content
  if (this.defaultChannels.includes('email') && this.emailTemplate) {
    content.email = {
      subject: compileTemplate(this.emailTemplate.subject, data),
      htmlBody: compileTemplate(this.emailTemplate.htmlBody, data),
      textBody: compileTemplate(this.emailTemplate.textBody, data)
    };
  }
  
  if (this.defaultChannels.includes('sms') && this.smsTemplate) {
    content.sms = {
      message: compileTemplate(this.smsTemplate, data)
    };
  }
  
  if (this.defaultChannels.includes('push') && this.pushTemplate) {
    content.push = {
      title: compileTemplate(this.pushTemplate.title, data),
      body: compileTemplate(this.pushTemplate.body, data)
    };
  }
  
  // Generate action if applicable
  if (this.isActionable && this.action) {
    content.action = {
      type: this.action.type,
      label: this.action.label,
      url: compileTemplate(this.action.urlTemplate, data)
    };
  }
  
  // Calculate expiry date
  if (this.expiryDays) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + this.expiryDays);
    content.expiresAt = expiresAt;
  }
  
  return content;
};

const NotificationTemplate = mongoose.model('NotificationTemplate', notificationTemplateSchema);

module.exports = NotificationTemplate;
