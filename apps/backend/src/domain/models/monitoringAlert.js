/**
 * Samudra Paket ERP - Monitoring Alert Model
 * Defines the schema for monitoring alerts and thresholds
 */

const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * Monitoring Alert Schema
 * Used for storing alert configurations and triggered alerts
 */
const monitoringAlertSchema = new Schema(
  {
    alertName: {
      type: String,
      required: true,
      index: true,
    },
    metricType: {
      type: String,
      enum: [
        'shipment_volume', 
        'delivery_success_rate', 
        'pickup_completion_rate',
        'processing_time', 
        'transit_time', 
        'delivery_time',
        'issue_rate', 
        'return_rate', 
        'on_time_delivery_rate',
        'vehicle_utilization',
        'branch_performance',
        'employee_performance',
        'customer_satisfaction',
        'system_performance',
        'api_response_time',
        'error_rate',
        'database_performance',
        'memory_usage',
        'cpu_usage',
        'disk_usage',
        'custom'
      ],
      required: true,
    },
    entityType: {
      type: String,
      enum: ['branch', 'vehicle', 'employee', 'customer', 'route', 'system', 'global'],
      required: true,
    },
    entityId: {
      type: Schema.Types.ObjectId,
      refPath: 'entityType',
      required: function() {
        return this.entityType !== 'global' && this.entityType !== 'system';
      },
    },
    condition: {
      operator: {
        type: String,
        enum: ['>', '>=', '<', '<=', '==', '!='],
        required: true,
      },
      value: {
        type: Number,
        required: true,
      },
      duration: {
        type: Number, // Duration in minutes for which condition must be true to trigger alert
        default: 0,
      },
    },
    severity: {
      type: String,
      enum: ['info', 'warning', 'critical', 'emergency'],
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'triggered', 'acknowledged', 'resolved'],
      default: 'active',
    },
    message: {
      type: String,
      required: true,
    },
    notificationChannels: [{
      type: String,
      enum: ['email', 'sms', 'push', 'in_app', 'webhook'],
    }],
    notificationRecipients: [{
      type: Schema.Types.Mixed, // Can be user IDs, emails, phone numbers, etc.
    }],
    triggerCount: {
      type: Number,
      default: 0,
    },
    lastTriggered: {
      type: Date,
    },
    acknowledgedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    acknowledgedAt: {
      type: Date,
    },
    resolvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    resolvedAt: {
      type: Date,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient querying
monitoringAlertSchema.index({ metricType: 1, status: 1 });
monitoringAlertSchema.index({ entityType: 1, entityId: 1, status: 1 });
monitoringAlertSchema.index({ severity: 1, status: 1 });

const MonitoringAlert = mongoose.model('MonitoringAlert', monitoringAlertSchema);

module.exports = MonitoringAlert;
