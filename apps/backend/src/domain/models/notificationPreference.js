/**
 * Samudra Paket ERP - Notification Preference Model
 * Defines the schema for user notification preferences
 */

const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * Notification Preference Schema
 * Used for storing user preferences for receiving notifications
 */
const notificationPreferenceSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    notificationTypes: {
      shipment_status: {
        enabled: { type: Boolean, default: true },
        channels: {
          in_app: { type: Boolean, default: true },
          email: { type: Boolean, default: true },
          sms: { type: Boolean, default: false },
          push: { type: Boolean, default: true },
        },
        minPriority: {
          type: String,
          enum: ['low', 'medium', 'high', 'urgent'],
          default: 'low',
        },
      },
      pickup_status: {
        enabled: { type: Boolean, default: true },
        channels: {
          in_app: { type: Boolean, default: true },
          email: { type: Boolean, default: true },
          sms: { type: Boolean, default: false },
          push: { type: Boolean, default: true },
        },
        minPriority: {
          type: String,
          enum: ['low', 'medium', 'high', 'urgent'],
          default: 'low',
        },
      },
      delivery_status: {
        enabled: { type: Boolean, default: true },
        channels: {
          in_app: { type: Boolean, default: true },
          email: { type: Boolean, default: true },
          sms: { type: Boolean, default: false },
          push: { type: Boolean, default: true },
        },
        minPriority: {
          type: String,
          enum: ['low', 'medium', 'high', 'urgent'],
          default: 'low',
        },
      },
      issue_alert: {
        enabled: { type: Boolean, default: true },
        channels: {
          in_app: { type: Boolean, default: true },
          email: { type: Boolean, default: true },
          sms: { type: Boolean, default: true },
          push: { type: Boolean, default: true },
        },
        minPriority: {
          type: String,
          enum: ['low', 'medium', 'high', 'urgent'],
          default: 'medium',
        },
      },
      system_alert: {
        enabled: { type: Boolean, default: true },
        channels: {
          in_app: { type: Boolean, default: true },
          email: { type: Boolean, default: true },
          sms: { type: Boolean, default: false },
          push: { type: Boolean, default: true },
        },
        minPriority: {
          type: String,
          enum: ['low', 'medium', 'high', 'urgent'],
          default: 'medium',
        },
      },
      payment_reminder: {
        enabled: { type: Boolean, default: true },
        channels: {
          in_app: { type: Boolean, default: true },
          email: { type: Boolean, default: true },
          sms: { type: Boolean, default: true },
          push: { type: Boolean, default: true },
        },
        minPriority: {
          type: String,
          enum: ['low', 'medium', 'high', 'urgent'],
          default: 'medium',
        },
      },
      assignment: {
        enabled: { type: Boolean, default: true },
        channels: {
          in_app: { type: Boolean, default: true },
          email: { type: Boolean, default: true },
          sms: { type: Boolean, default: true },
          push: { type: Boolean, default: true },
        },
        minPriority: {
          type: String,
          enum: ['low', 'medium', 'high', 'urgent'],
          default: 'low',
        },
      },
      document_update: {
        enabled: { type: Boolean, default: true },
        channels: {
          in_app: { type: Boolean, default: true },
          email: { type: Boolean, default: true },
          sms: { type: Boolean, default: false },
          push: { type: Boolean, default: true },
        },
        minPriority: {
          type: String,
          enum: ['low', 'medium', 'high', 'urgent'],
          default: 'low',
        },
      },
      custom: {
        enabled: { type: Boolean, default: true },
        channels: {
          in_app: { type: Boolean, default: true },
          email: { type: Boolean, default: true },
          sms: { type: Boolean, default: false },
          push: { type: Boolean, default: true },
        },
        minPriority: {
          type: String,
          enum: ['low', 'medium', 'high', 'urgent'],
          default: 'low',
        },
      },
    },
    quietHours: {
      enabled: { type: Boolean, default: false },
      start: { type: String, default: '22:00' }, // 24-hour format
      end: { type: String, default: '07:00' }, // 24-hour format
      timezone: { type: String, default: 'Asia/Jakarta' },
      excludeUrgent: { type: Boolean, default: true }, // Urgent notifications bypass quiet hours
    },
    contactInfo: {
      email: { type: String },
      phone: { type: String },
      pushTokens: [{ 
        token: { type: String },
        device: { type: String },
        lastUsed: { type: Date, default: Date.now }
      }],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
notificationPreferenceSchema.index({ user: 1 }, { unique: true });

/**
 * Check if a notification should be delivered to a user based on their preferences
 * @param {Object} notification - Notification object with type and priority
 * @returns {Object} - Object with enabled status and channels to use
 */
notificationPreferenceSchema.methods.shouldDeliverNotification = function(notification) {
  const { type, priority } = notification;
  const typePrefs = this.notificationTypes[type];
  
  if (!typePrefs || !typePrefs.enabled) {
    return { enabled: false, channels: [] };
  }
  
  // Check priority threshold
  const priorityLevels = ['low', 'medium', 'high', 'urgent'];
  const notifPriorityIndex = priorityLevels.indexOf(priority);
  const minPriorityIndex = priorityLevels.indexOf(typePrefs.minPriority);
  
  if (notifPriorityIndex < minPriorityIndex) {
    return { enabled: false, channels: [] };
  }
  
  // Check quiet hours (if not urgent or if urgent notifications aren't excluded)
  if (this.quietHours.enabled && 
      !(priority === 'urgent' && this.quietHours.excludeUrgent)) {
    const now = new Date();
    const userTz = this.quietHours.timezone || 'Asia/Jakarta';
    
    // Convert current time to user's timezone
    const userTime = now.toLocaleTimeString('en-US', { 
      timeZone: userTz, 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });
    
    const quietStart = this.quietHours.start;
    const quietEnd = this.quietHours.end;
    
    // Check if current time is within quiet hours
    // Handle cases where quiet hours span midnight
    if (quietStart <= quietEnd) {
      if (userTime >= quietStart && userTime <= quietEnd) {
        return { enabled: false, channels: [] };
      }
    } else {
      if (userTime >= quietStart || userTime <= quietEnd) {
        return { enabled: false, channels: [] };
      }
    }
  }
  
  // Determine which channels to use
  const channels = Object.entries(typePrefs.channels)
    .filter(([_, enabled]) => enabled)
    .map(([channel]) => channel);
  
  return { enabled: true, channels };
};

/**
 * Get contact information for specific channels
 * @param {Array} channels - Array of channel names
 * @returns {Object} - Contact info for requested channels
 */
notificationPreferenceSchema.methods.getContactInfo = function(channels) {
  const contactInfo = {};
  
  if (channels.includes('email') && this.contactInfo.email) {
    contactInfo.email = this.contactInfo.email;
  }
  
  if (channels.includes('sms') && this.contactInfo.phone) {
    contactInfo.phone = this.contactInfo.phone;
  }
  
  if (channels.includes('push') && this.contactInfo.pushTokens && this.contactInfo.pushTokens.length > 0) {
    contactInfo.pushTokens = this.contactInfo.pushTokens
      .filter(token => token.lastUsed > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) // Only tokens used in the last 30 days
      .map(token => ({
        token: token.token,
        device: token.device
      }));
  }
  
  return contactInfo;
};

const NotificationPreference = mongoose.model('NotificationPreference', notificationPreferenceSchema);

module.exports = NotificationPreference;
