/**
 * Samudra Paket ERP - Performance Monitoring Middleware
 * Automatically collects performance metrics for API requests
 */

const PerformanceMetric = require('../../domain/models/performanceMetric');
const logger = require('./gateway/logger');

/**
 * Middleware to monitor API performance
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
const performanceMonitoringMiddleware = (req, res, next) => {
  // Skip monitoring for certain endpoints
  if (req.path === '/monitoring/performance-metrics' || req.path === '/health') {
    return next();
  }

  // Record start time
  const startTime = process.hrtime();
  
  // Store original end method
  const originalEnd = res.end;
  
  // Override end method to capture response time
  res.end = function(...args) {
    // Calculate response time
    const diff = process.hrtime(startTime);
    const responseTimeMs = Math.round((diff[0] * 1e9 + diff[1]) / 1e6);
    
    // Get request details
    const method = req.method;
    const endpoint = req.originalUrl || req.url;
    const statusCode = res.statusCode;
    
    // Determine service based on path
    const pathParts = endpoint.split('/');
    const service = pathParts.length > 1 ? `${pathParts[1]}-service` : 'api-gateway';
    
    // Create performance metric asynchronously (don't wait for it)
    createPerformanceMetric({
      metricType: 'api_response_time',
      endpoint,
      service,
      method,
      value: responseTimeMs,
      unit: 'ms',
      metadata: {
        statusCode,
        userAgent: req.headers['user-agent'],
        contentLength: res.getHeader('content-length'),
      }
    }).catch(error => {
      logger.error('Failed to create performance metric', { error });
    });
    
    // Call original end method
    return originalEnd.apply(this, args);
  };
  
  next();
};

/**
 * Create a performance metric record
 * @param {Object} data - Performance metric data
 * @returns {Promise<Object>} Created performance metric
 */
const createPerformanceMetric = async (data) => {
  try {
    const performanceMetric = new PerformanceMetric(data);
    await performanceMetric.save();
    return performanceMetric;
  } catch (error) {
    logger.error(`Error creating performance metric: ${error.message}`, { error });
    throw error;
  }
};

module.exports = performanceMonitoringMiddleware;
