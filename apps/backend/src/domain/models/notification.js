/**
 * Samudra Paket ERP - Notification Model
 * Defines the schema for notifications
 */

const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * Notification Schema
 */
const notificationSchema = new Schema(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
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
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    entityType: {
      type: String,
      enum: [
        'shipment_order',
        'shipment',
        'pickup_request',
        'pickup_assignment',
        'delivery_order',
        'return',
        'user',
        'system'
      ],
      required: true,
    },
    entityId: {
      type: Schema.Types.ObjectId,
      refPath: 'entityType',
      required: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['unread', 'read', 'archived'],
      default: 'unread',
    },
    deliveryChannels: [{
      type: String,
      enum: ['in_app', 'email', 'sms', 'push'],
      default: ['in_app'],
    }],
    deliveryStatus: {
      inApp: {
        delivered: { type: Boolean, default: false },
        deliveredAt: { type: Date },
      },
      email: {
        delivered: { type: Boolean, default: false },
        deliveredAt: { type: Date },
        emailAddress: { type: String },
      },
      sms: {
        delivered: { type: Boolean, default: false },
        deliveredAt: { type: Date },
        phoneNumber: { type: String },
      },
      push: {
        delivered: { type: Boolean, default: false },
        deliveredAt: { type: Date },
        deviceToken: { type: String },
      },
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
    expiresAt: {
      type: Date,
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
      url: { type: String },
      data: { type: Schema.Types.Mixed },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
notificationSchema.index({ recipient: 1, status: 1, createdAt: -1 });
notificationSchema.index({ entityType: 1, entityId: 1 });
notificationSchema.index({ type: 1, priority: 1 });
notificationSchema.index({ 'deliveryStatus.inApp.delivered': 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index for auto-deletion

/**
 * Mark notification as read
 */
notificationSchema.methods.markAsRead = function() {
  this.status = 'read';
  return this.save();
};

/**
 * Archive notification
 */
notificationSchema.methods.archive = function() {
  this.status = 'archived';
  return this.save();
};

/**
 * Update delivery status for a specific channel
 * @param {string} channel - The delivery channel (inApp, email, sms, push)
 * @param {boolean} delivered - Whether the notification was delivered
 * @param {Object} additionalInfo - Additional information about the delivery
 */
notificationSchema.methods.updateDeliveryStatus = function(channel, delivered, additionalInfo = {}) {
  if (!this.deliveryStatus[channel]) {
    return;
  }

  this.deliveryStatus[channel].delivered = delivered;
  
  if (delivered) {
    this.deliveryStatus[channel].deliveredAt = new Date();
  }
  
  // Add any additional info
  Object.keys(additionalInfo).forEach(key => {
    if (key !== 'delivered' && key !== 'deliveredAt') {
      this.deliveryStatus[channel][key] = additionalInfo[key];
    }
  });
  
  return this.save();
};

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
