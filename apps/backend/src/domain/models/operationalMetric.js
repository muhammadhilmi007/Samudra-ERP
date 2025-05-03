/**
 * Samudra Paket ERP - Operational Metric Model
 * Defines the schema for operational metrics collection
 */

const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * Operational Metric Schema
 * Used for storing operational metrics data
 */
const operationalMetricSchema = new Schema(
  {
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
        'custom'
      ],
      required: true,
      index: true,
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
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    timeframe: {
      type: String,
      enum: ['hourly', 'daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'custom'],
      required: true,
    },
    startPeriod: {
      type: Date,
      required: true,
    },
    endPeriod: {
      type: Date,
      required: true,
    },
    value: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,
      required: true,
    },
    target: {
      type: Number,
    },
    threshold: {
      warning: {
        type: Number,
      },
      critical: {
        type: Number,
      },
      direction: {
        type: String,
        enum: ['above', 'below'],
      },
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
operationalMetricSchema.index({ metricType: 1, entityType: 1, entityId: 1, timestamp: -1 });
operationalMetricSchema.index({ metricType: 1, timeframe: 1, startPeriod: -1 });
operationalMetricSchema.index({ entityType: 1, entityId: 1, timeframe: 1, startPeriod: -1 });

const OperationalMetric = mongoose.model('OperationalMetric', operationalMetricSchema);

module.exports = OperationalMetric;
