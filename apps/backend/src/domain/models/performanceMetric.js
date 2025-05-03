/**
 * Samudra Paket ERP - Performance Metric Model
 * Defines the schema for system performance metrics
 */

const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * Performance Metric Schema
 * Used for storing system performance metrics
 */
const performanceMetricSchema = new Schema(
  {
    metricType: {
      type: String,
      enum: [
        'api_response_time',
        'database_query_time',
        'error_rate',
        'request_count',
        'memory_usage',
        'cpu_usage',
        'disk_usage',
        'network_traffic',
        'active_users',
        'concurrent_sessions',
        'cache_hit_rate',
        'background_job_performance',
        'custom'
      ],
      required: true,
      index: true,
    },
    endpoint: {
      type: String,
      index: true,
    },
    service: {
      type: String,
      index: true,
    },
    method: {
      type: String,
      enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD', 'N/A'],
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    value: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,
      required: true,
    },
    sampleSize: {
      type: Number,
      default: 1,
    },
    min: {
      type: Number,
    },
    max: {
      type: Number,
    },
    avg: {
      type: Number,
    },
    p50: { // 50th percentile (median)
      type: Number,
    },
    p90: { // 90th percentile
      type: Number,
    },
    p95: { // 95th percentile
      type: Number,
    },
    p99: { // 99th percentile
      type: Number,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient querying
performanceMetricSchema.index({ metricType: 1, timestamp: -1 });
performanceMetricSchema.index({ service: 1, endpoint: 1, timestamp: -1 });
performanceMetricSchema.index({ metricType: 1, service: 1, timestamp: -1 });

const PerformanceMetric = mongoose.model('PerformanceMetric', performanceMetricSchema);

module.exports = PerformanceMetric;
