/**
 * Samudra Paket ERP - Monitoring Controller
 * Handles API endpoints for monitoring functionality
 */

const monitoringRepository = require('../../domain/repositories/monitoringRepository');
const logger = require('../middleware/gateway/logger');

/**
 * Create a new operational metric
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {Object} Response with created operational metric
 */
const createOperationalMetric = async (req, res) => {
  try {
    const userId = req.user.id;
    const metricData = {
      ...req.body,
      createdBy: userId,
      updatedBy: userId
    };

    const operationalMetric = await monitoringRepository.createOperationalMetric(metricData);

    return res.status(201).json({
      success: true,
      data: operationalMetric
    });
  } catch (error) {
    logger.error(`Error creating operational metric: ${error.message}`, { error });
    return res.status(500).json({
      success: false,
      error: {
        code: 'OPERATIONAL_METRIC_CREATION_FAILED',
        message: 'Failed to create operational metric',
        details: error.message
      }
    });
  }
};

/**
 * Get operational metrics with filtering and pagination
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {Object} Response with operational metrics
 */
const getOperationalMetrics = async (req, res) => {
  try {
    // Extract filters from query parameters
    const filters = {
      metricType: req.query.metricType,
      entityType: req.query.entityType,
      entityId: req.query.entityId,
      timeframe: req.query.timeframe,
      startDate: req.query.startDate,
      endDate: req.query.endDate
    };

    // Clean up undefined filters
    Object.keys(filters).forEach(key => {
      if (filters[key] === undefined) {
        delete filters[key];
      }
    });

    // Extract pagination and sorting options
    const options = {
      page: parseInt(req.query.page, 10) || 1,
      limit: parseInt(req.query.limit, 10) || 50,
      sortBy: req.query.sortBy || 'timestamp',
      sortOrder: req.query.sortOrder || 'desc',
      populate: req.query.populate ? req.query.populate.split(',') : []
    };

    const result = await monitoringRepository.getOperationalMetrics(filters, options);

    return res.status(200).json({
      success: true,
      data: result.data,
      meta: {
        pagination: result.pagination
      }
    });
  } catch (error) {
    logger.error(`Error getting operational metrics: ${error.message}`, { error });
    return res.status(500).json({
      success: false,
      error: {
        code: 'OPERATIONAL_METRICS_RETRIEVAL_FAILED',
        message: 'Failed to retrieve operational metrics',
        details: error.message
      }
    });
  }
};

/**
 * Create a new performance metric
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {Object} Response with created performance metric
 */
const createPerformanceMetric = async (req, res) => {
  try {
    const performanceMetric = await monitoringRepository.createPerformanceMetric(req.body);

    return res.status(201).json({
      success: true,
      data: performanceMetric
    });
  } catch (error) {
    logger.error(`Error creating performance metric: ${error.message}`, { error });
    return res.status(500).json({
      success: false,
      error: {
        code: 'PERFORMANCE_METRIC_CREATION_FAILED',
        message: 'Failed to create performance metric',
        details: error.message
      }
    });
  }
};

/**
 * Get performance metrics with filtering and pagination
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {Object} Response with performance metrics
 */
const getPerformanceMetrics = async (req, res) => {
  try {
    // Extract filters from query parameters
    const filters = {
      metricType: req.query.metricType,
      service: req.query.service,
      endpoint: req.query.endpoint,
      method: req.query.method,
      startDate: req.query.startDate,
      endDate: req.query.endDate
    };

    // Clean up undefined filters
    Object.keys(filters).forEach(key => {
      if (filters[key] === undefined) {
        delete filters[key];
      }
    });

    // Extract pagination and sorting options
    const options = {
      page: parseInt(req.query.page, 10) || 1,
      limit: parseInt(req.query.limit, 10) || 50,
      sortBy: req.query.sortBy || 'timestamp',
      sortOrder: req.query.sortOrder || 'desc'
    };

    const result = await monitoringRepository.getPerformanceMetrics(filters, options);

    return res.status(200).json({
      success: true,
      data: result.data,
      meta: {
        pagination: result.pagination
      }
    });
  } catch (error) {
    logger.error(`Error getting performance metrics: ${error.message}`, { error });
    return res.status(500).json({
      success: false,
      error: {
        code: 'PERFORMANCE_METRICS_RETRIEVAL_FAILED',
        message: 'Failed to retrieve performance metrics',
        details: error.message
      }
    });
  }
};

/**
 * Create a new alert configuration
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {Object} Response with created alert configuration
 */
const createAlertConfig = async (req, res) => {
  try {
    const userId = req.user.id;
    const alertData = {
      ...req.body,
      createdBy: userId,
      updatedBy: userId
    };

    const alert = await monitoringRepository.createAlertConfig(alertData);

    return res.status(201).json({
      success: true,
      data: alert
    });
  } catch (error) {
    logger.error(`Error creating alert configuration: ${error.message}`, { error });
    return res.status(500).json({
      success: false,
      error: {
        code: 'ALERT_CONFIG_CREATION_FAILED',
        message: 'Failed to create alert configuration',
        details: error.message
      }
    });
  }
};

/**
 * Update an existing alert configuration
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {Object} Response with updated alert configuration
 */
const updateAlertConfig = async (req, res) => {
  try {
    const { alertId } = req.params;
    const userId = req.user.id;
    const alertData = {
      ...req.body,
      updatedBy: userId
    };

    const alert = await monitoringRepository.updateAlertConfig(alertId, alertData);

    return res.status(200).json({
      success: true,
      data: alert
    });
  } catch (error) {
    logger.error(`Error updating alert configuration: ${error.message}`, { error });
    return res.status(500).json({
      success: false,
      error: {
        code: 'ALERT_CONFIG_UPDATE_FAILED',
        message: 'Failed to update alert configuration',
        details: error.message
      }
    });
  }
};

/**
 * Get alert configurations with filtering and pagination
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {Object} Response with alert configurations
 */
const getAlertConfigs = async (req, res) => {
  try {
    // Extract filters from query parameters
    const filters = {
      metricType: req.query.metricType,
      entityType: req.query.entityType,
      entityId: req.query.entityId,
      severity: req.query.severity,
      status: req.query.status
    };

    // Clean up undefined filters
    Object.keys(filters).forEach(key => {
      if (filters[key] === undefined) {
        delete filters[key];
      }
    });

    // Extract pagination and sorting options
    const options = {
      page: parseInt(req.query.page, 10) || 1,
      limit: parseInt(req.query.limit, 10) || 50,
      sortBy: req.query.sortBy || 'createdAt',
      sortOrder: req.query.sortOrder || 'desc',
      populate: req.query.populate ? req.query.populate.split(',') : []
    };

    const result = await monitoringRepository.getAlertConfigs(filters, options);

    return res.status(200).json({
      success: true,
      data: result.data,
      meta: {
        pagination: result.pagination
      }
    });
  } catch (error) {
    logger.error(`Error getting alert configurations: ${error.message}`, { error });
    return res.status(500).json({
      success: false,
      error: {
        code: 'ALERT_CONFIGS_RETRIEVAL_FAILED',
        message: 'Failed to retrieve alert configurations',
        details: error.message
      }
    });
  }
};

/**
 * Acknowledge an alert
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {Object} Response with updated alert
 */
const acknowledgeAlert = async (req, res) => {
  try {
    const { alertId } = req.params;
    const userId = req.user.id;

    const alert = await monitoringRepository.acknowledgeAlert(alertId, userId);

    return res.status(200).json({
      success: true,
      data: alert
    });
  } catch (error) {
    logger.error(`Error acknowledging alert: ${error.message}`, { error });
    return res.status(500).json({
      success: false,
      error: {
        code: 'ALERT_ACKNOWLEDGEMENT_FAILED',
        message: 'Failed to acknowledge alert',
        details: error.message
      }
    });
  }
};

/**
 * Resolve an alert
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {Object} Response with updated alert
 */
const resolveAlert = async (req, res) => {
  try {
    const { alertId } = req.params;
    const userId = req.user.id;

    const alert = await monitoringRepository.resolveAlert(alertId, userId);

    return res.status(200).json({
      success: true,
      data: alert
    });
  } catch (error) {
    logger.error(`Error resolving alert: ${error.message}`, { error });
    return res.status(500).json({
      success: false,
      error: {
        code: 'ALERT_RESOLUTION_FAILED',
        message: 'Failed to resolve alert',
        details: error.message
      }
    });
  }
};

/**
 * Generate dashboard data for a specific metric type
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {Object} Response with dashboard data
 */
const generateDashboardData = async (req, res) => {
  try {
    const { metricType } = req.params;
    
    // Extract filters from query parameters
    const filters = {
      timeframe: req.query.timeframe,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      entityType: req.query.entityType,
      entityId: req.query.entityId,
      limit: parseInt(req.query.limit, 10) || 10
    };

    // Clean up undefined filters
    Object.keys(filters).forEach(key => {
      if (filters[key] === undefined) {
        delete filters[key];
      }
    });

    const dashboardData = await monitoringRepository.generateDashboardData(metricType, filters);

    return res.status(200).json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    logger.error(`Error generating dashboard data: ${error.message}`, { error });
    return res.status(500).json({
      success: false,
      error: {
        code: 'DASHBOARD_DATA_GENERATION_FAILED',
        message: 'Failed to generate dashboard data',
        details: error.message
      }
    });
  }
};

/**
 * Get real-time system metrics
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {Object} Response with real-time metrics
 */
const getRealTimeMetrics = async (req, res) => {
  try {
    const metrics = await monitoringRepository.getRealTimeMetrics();

    return res.status(200).json({
      success: true,
      data: metrics
    });
  } catch (error) {
    logger.error(`Error getting real-time metrics: ${error.message}`, { error });
    return res.status(500).json({
      success: false,
      error: {
        code: 'REAL_TIME_METRICS_RETRIEVAL_FAILED',
        message: 'Failed to retrieve real-time metrics',
        details: error.message
      }
    });
  }
};

module.exports = {
  createOperationalMetric,
  getOperationalMetrics,
  createPerformanceMetric,
  getPerformanceMetrics,
  createAlertConfig,
  updateAlertConfig,
  getAlertConfigs,
  acknowledgeAlert,
  resolveAlert,
  generateDashboardData,
  getRealTimeMetrics
};
