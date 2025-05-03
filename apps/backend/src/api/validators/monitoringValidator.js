/**
 * Samudra Paket ERP - Monitoring Validator
 * Validates request data for monitoring endpoints
 */

const { body, param, query, validationResult } = require('express-validator');
const logger = require('../middleware/gateway/logger');

/**
 * Validate request and return errors if any
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  logger.warn('Validation error in monitoring request', { errors: errors.array() });
  
  return res.status(400).json({
    success: false,
    error: {
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      details: errors.array()
    }
  });
};

/**
 * Validation rules for creating operational metrics
 */
const validateCreateOperationalMetric = [
  body('metricType')
    .isString()
    .notEmpty()
    .withMessage('Metric type is required')
    .isIn([
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
    ])
    .withMessage('Invalid metric type'),
  
  body('entityType')
    .isString()
    .notEmpty()
    .withMessage('Entity type is required')
    .isIn(['branch', 'vehicle', 'employee', 'customer', 'route', 'system', 'global'])
    .withMessage('Invalid entity type'),
  
  body('entityId')
    .if(body('entityType').not().equals('global').and(body('entityType').not().equals('system')))
    .isMongoId()
    .withMessage('Valid entity ID is required for non-global and non-system entity types'),
  
  body('timeframe')
    .isString()
    .notEmpty()
    .withMessage('Timeframe is required')
    .isIn(['hourly', 'daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'custom'])
    .withMessage('Invalid timeframe'),
  
  body('startPeriod')
    .isISO8601()
    .withMessage('Start period must be a valid date'),
  
  body('endPeriod')
    .isISO8601()
    .withMessage('End period must be a valid date')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.startPeriod)) {
        throw new Error('End period must be after start period');
      }
      return true;
    }),
  
  body('value')
    .isNumeric()
    .withMessage('Value must be a number'),
  
  body('unit')
    .isString()
    .notEmpty()
    .withMessage('Unit is required'),
  
  body('target')
    .optional()
    .isNumeric()
    .withMessage('Target must be a number'),
  
  body('threshold.warning')
    .optional()
    .isNumeric()
    .withMessage('Warning threshold must be a number'),
  
  body('threshold.critical')
    .optional()
    .isNumeric()
    .withMessage('Critical threshold must be a number'),
  
  body('threshold.direction')
    .optional()
    .isIn(['above', 'below'])
    .withMessage('Threshold direction must be either "above" or "below"'),
  
  validate
];

/**
 * Validation rules for getting operational metrics
 */
const validateGetOperationalMetrics = [
  query('metricType')
    .optional()
    .isString()
    .withMessage('Metric type must be a string'),
  
  query('entityType')
    .optional()
    .isString()
    .withMessage('Entity type must be a string'),
  
  query('entityId')
    .optional()
    .isMongoId()
    .withMessage('Entity ID must be a valid MongoDB ID'),
  
  query('timeframe')
    .optional()
    .isString()
    .withMessage('Timeframe must be a string'),
  
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date')
    .custom((value, { req }) => {
      if (req.query.startDate && new Date(value) <= new Date(req.query.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('sortBy')
    .optional()
    .isString()
    .withMessage('Sort by must be a string'),
  
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be either "asc" or "desc"'),
  
  validate
];

/**
 * Validation rules for creating performance metrics
 */
const validateCreatePerformanceMetric = [
  body('metricType')
    .isString()
    .notEmpty()
    .withMessage('Metric type is required')
    .isIn([
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
    ])
    .withMessage('Invalid metric type'),
  
  body('endpoint')
    .optional()
    .isString()
    .withMessage('Endpoint must be a string'),
  
  body('service')
    .optional()
    .isString()
    .withMessage('Service must be a string'),
  
  body('method')
    .optional()
    .isIn(['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD', 'N/A'])
    .withMessage('Invalid HTTP method'),
  
  body('value')
    .isNumeric()
    .withMessage('Value must be a number'),
  
  body('unit')
    .isString()
    .notEmpty()
    .withMessage('Unit is required'),
  
  body('sampleSize')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Sample size must be a positive integer'),
  
  body('min')
    .optional()
    .isNumeric()
    .withMessage('Min value must be a number'),
  
  body('max')
    .optional()
    .isNumeric()
    .withMessage('Max value must be a number'),
  
  body('avg')
    .optional()
    .isNumeric()
    .withMessage('Average value must be a number'),
  
  body('p50')
    .optional()
    .isNumeric()
    .withMessage('P50 value must be a number'),
  
  body('p90')
    .optional()
    .isNumeric()
    .withMessage('P90 value must be a number'),
  
  body('p95')
    .optional()
    .isNumeric()
    .withMessage('P95 value must be a number'),
  
  body('p99')
    .optional()
    .isNumeric()
    .withMessage('P99 value must be a number'),
  
  validate
];

/**
 * Validation rules for getting performance metrics
 */
const validateGetPerformanceMetrics = [
  query('metricType')
    .optional()
    .isString()
    .withMessage('Metric type must be a string'),
  
  query('service')
    .optional()
    .isString()
    .withMessage('Service must be a string'),
  
  query('endpoint')
    .optional()
    .isString()
    .withMessage('Endpoint must be a string'),
  
  query('method')
    .optional()
    .isIn(['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD', 'N/A'])
    .withMessage('Invalid HTTP method'),
  
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date')
    .custom((value, { req }) => {
      if (req.query.startDate && new Date(value) <= new Date(req.query.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('sortBy')
    .optional()
    .isString()
    .withMessage('Sort by must be a string'),
  
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be either "asc" or "desc"'),
  
  validate
];

/**
 * Validation rules for creating alert configurations
 */
const validateCreateAlertConfig = [
  body('alertName')
    .isString()
    .notEmpty()
    .withMessage('Alert name is required'),
  
  body('metricType')
    .isString()
    .notEmpty()
    .withMessage('Metric type is required'),
  
  body('entityType')
    .isString()
    .notEmpty()
    .withMessage('Entity type is required')
    .isIn(['branch', 'vehicle', 'employee', 'customer', 'route', 'system', 'global'])
    .withMessage('Invalid entity type'),
  
  body('entityId')
    .if(body('entityType').not().equals('global').and(body('entityType').not().equals('system')))
    .isMongoId()
    .withMessage('Valid entity ID is required for non-global and non-system entity types'),
  
  body('condition.operator')
    .isString()
    .notEmpty()
    .withMessage('Condition operator is required')
    .isIn(['>', '>=', '<', '<=', '==', '!='])
    .withMessage('Invalid condition operator'),
  
  body('condition.value')
    .isNumeric()
    .withMessage('Condition value must be a number'),
  
  body('condition.duration')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Duration must be a non-negative integer'),
  
  body('severity')
    .isString()
    .notEmpty()
    .withMessage('Severity is required')
    .isIn(['info', 'warning', 'critical', 'emergency'])
    .withMessage('Invalid severity level'),
  
  body('message')
    .isString()
    .notEmpty()
    .withMessage('Alert message is required'),
  
  body('notificationChannels')
    .optional()
    .isArray()
    .withMessage('Notification channels must be an array')
    .custom(channels => {
      const validChannels = ['email', 'sms', 'push', 'in_app', 'webhook'];
      return channels.every(channel => validChannels.includes(channel));
    })
    .withMessage('Invalid notification channel'),
  
  body('notificationRecipients')
    .optional()
    .isArray()
    .withMessage('Notification recipients must be an array'),
  
  validate
];

/**
 * Validation rules for updating alert configurations
 */
const validateUpdateAlertConfig = [
  param('alertId')
    .isMongoId()
    .withMessage('Alert ID must be a valid MongoDB ID'),
  
  body('alertName')
    .optional()
    .isString()
    .notEmpty()
    .withMessage('Alert name cannot be empty'),
  
  body('condition.operator')
    .optional()
    .isString()
    .notEmpty()
    .withMessage('Condition operator cannot be empty')
    .isIn(['>', '>=', '<', '<=', '==', '!='])
    .withMessage('Invalid condition operator'),
  
  body('condition.value')
    .optional()
    .isNumeric()
    .withMessage('Condition value must be a number'),
  
  body('condition.duration')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Duration must be a non-negative integer'),
  
  body('severity')
    .optional()
    .isString()
    .notEmpty()
    .withMessage('Severity cannot be empty')
    .isIn(['info', 'warning', 'critical', 'emergency'])
    .withMessage('Invalid severity level'),
  
  body('status')
    .optional()
    .isString()
    .notEmpty()
    .withMessage('Status cannot be empty')
    .isIn(['active', 'inactive'])
    .withMessage('Invalid status'),
  
  body('message')
    .optional()
    .isString()
    .notEmpty()
    .withMessage('Alert message cannot be empty'),
  
  body('notificationChannels')
    .optional()
    .isArray()
    .withMessage('Notification channels must be an array')
    .custom(channels => {
      const validChannels = ['email', 'sms', 'push', 'in_app', 'webhook'];
      return channels.every(channel => validChannels.includes(channel));
    })
    .withMessage('Invalid notification channel'),
  
  body('notificationRecipients')
    .optional()
    .isArray()
    .withMessage('Notification recipients must be an array'),
  
  validate
];

/**
 * Validation rules for getting alert configurations
 */
const validateGetAlertConfigs = [
  query('metricType')
    .optional()
    .isString()
    .withMessage('Metric type must be a string'),
  
  query('entityType')
    .optional()
    .isString()
    .withMessage('Entity type must be a string'),
  
  query('entityId')
    .optional()
    .isMongoId()
    .withMessage('Entity ID must be a valid MongoDB ID'),
  
  query('severity')
    .optional()
    .isString()
    .withMessage('Severity must be a string')
    .isIn(['info', 'warning', 'critical', 'emergency'])
    .withMessage('Invalid severity level'),
  
  query('status')
    .optional()
    .isString()
    .withMessage('Status must be a string')
    .isIn(['active', 'inactive', 'triggered', 'acknowledged', 'resolved'])
    .withMessage('Invalid status'),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('sortBy')
    .optional()
    .isString()
    .withMessage('Sort by must be a string'),
  
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be either "asc" or "desc"'),
  
  validate
];

/**
 * Validation rules for acknowledging or resolving alerts
 */
const validateAlertAction = [
  param('alertId')
    .isMongoId()
    .withMessage('Alert ID must be a valid MongoDB ID'),
  
  validate
];

/**
 * Validation rules for generating dashboard data
 */
const validateGenerateDashboardData = [
  param('metricType')
    .isString()
    .notEmpty()
    .withMessage('Metric type is required'),
  
  query('timeframe')
    .optional()
    .isString()
    .withMessage('Timeframe must be a string')
    .isIn(['hourly', 'daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'custom'])
    .withMessage('Invalid timeframe'),
  
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date')
    .custom((value, { req }) => {
      if (req.query.startDate && new Date(value) <= new Date(req.query.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
  
  query('entityType')
    .optional()
    .isString()
    .withMessage('Entity type must be a string'),
  
  query('entityId')
    .optional()
    .isMongoId()
    .withMessage('Entity ID must be a valid MongoDB ID'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
  
  validate
];

module.exports = {
  validateCreateOperationalMetric,
  validateGetOperationalMetrics,
  validateCreatePerformanceMetric,
  validateGetPerformanceMetrics,
  validateCreateAlertConfig,
  validateUpdateAlertConfig,
  validateGetAlertConfigs,
  validateAlertAction,
  validateGenerateDashboardData
};
