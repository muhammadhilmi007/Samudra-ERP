/**
 * Samudra Paket ERP - Monitoring Repository
 * Handles business logic for monitoring functionality
 */

const mongoose = require('mongoose');
const OperationalMetric = require('../models/operationalMetric');
const PerformanceMetric = require('../models/performanceMetric');
const MonitoringAlert = require('../models/monitoringAlert');
const logger = require('../../api/middleware/gateway/logger');
const { ValidationError } = require('../utils/errorUtils');

/**
 * Create a new operational metric
 * @param {Object} data - Operational metric data
 * @returns {Promise<Object>} Created operational metric
 */
const createOperationalMetric = async (data) => {
  try {
    const operationalMetric = new OperationalMetric(data);
    await operationalMetric.save();

    // Check if this metric should trigger any alerts
    await checkAlertThresholds(data.metricType, data.entityType, data.entityId, data.value);

    return operationalMetric;
  } catch (error) {
    logger.error(`Error creating operational metric: ${error.message}`, { error });
    throw error;
  }
};

/**
 * Get operational metrics with filtering and pagination
 * @param {Object} filters - Filter criteria
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Operational metrics with pagination metadata
 */
const getOperationalMetrics = async (filters = {}, options = {}) => {
  try {
    const {
      page = 1,
      limit = 50,
      sortBy = 'timestamp',
      sortOrder = 'desc',
      populate = []
    } = options;

    // Build query from filters
    const query = {};
    
    if (filters.metricType) {
      query.metricType = filters.metricType;
    }
    
    if (filters.entityType) {
      query.entityType = filters.entityType;
    }
    
    if (filters.entityId) {
      query.entityId = mongoose.Types.ObjectId(filters.entityId);
    }
    
    if (filters.timeframe) {
      query.timeframe = filters.timeframe;
    }
    
    if (filters.startDate && filters.endDate) {
      query.timestamp = {
        $gte: new Date(filters.startDate),
        $lte: new Date(filters.endDate)
      };
    } else if (filters.startDate) {
      query.timestamp = { $gte: new Date(filters.startDate) };
    } else if (filters.endDate) {
      query.timestamp = { $lte: new Date(filters.endDate) };
    }

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const metrics = await OperationalMetric.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate(populate);

    // Get total count
    const totalCount = await OperationalMetric.countDocuments(query);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return {
      data: metrics,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext,
        hasPrev,
      },
    };
  } catch (error) {
    logger.error(`Error getting operational metrics: ${error.message}`, { error });
    throw error;
  }
};

/**
 * Create a new performance metric
 * @param {Object} data - Performance metric data
 * @returns {Promise<Object>} Created performance metric
 */
const createPerformanceMetric = async (data) => {
  try {
    const performanceMetric = new PerformanceMetric(data);
    await performanceMetric.save();

    // Check if this metric should trigger any alerts
    if (data.metricType && data.value) {
      await checkAlertThresholds(data.metricType, 'system', null, data.value);
    }

    return performanceMetric;
  } catch (error) {
    logger.error(`Error creating performance metric: ${error.message}`, { error });
    throw error;
  }
};

/**
 * Get performance metrics with filtering and pagination
 * @param {Object} filters - Filter criteria
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Performance metrics with pagination metadata
 */
const getPerformanceMetrics = async (filters = {}, options = {}) => {
  try {
    const {
      page = 1,
      limit = 50,
      sortBy = 'timestamp',
      sortOrder = 'desc'
    } = options;

    // Build query from filters
    const query = {};
    
    if (filters.metricType) {
      query.metricType = filters.metricType;
    }
    
    if (filters.service) {
      query.service = filters.service;
    }
    
    if (filters.endpoint) {
      query.endpoint = filters.endpoint;
    }
    
    if (filters.method) {
      query.method = filters.method;
    }
    
    if (filters.startDate && filters.endDate) {
      query.timestamp = {
        $gte: new Date(filters.startDate),
        $lte: new Date(filters.endDate)
      };
    } else if (filters.startDate) {
      query.timestamp = { $gte: new Date(filters.startDate) };
    } else if (filters.endDate) {
      query.timestamp = { $lte: new Date(filters.endDate) };
    }

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const metrics = await PerformanceMetric.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    // Get total count
    const totalCount = await PerformanceMetric.countDocuments(query);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return {
      data: metrics,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext,
        hasPrev,
      },
    };
  } catch (error) {
    logger.error(`Error getting performance metrics: ${error.message}`, { error });
    throw error;
  }
};

/**
 * Create a new alert configuration
 * @param {Object} data - Alert configuration data
 * @returns {Promise<Object>} Created alert configuration
 */
const createAlertConfig = async (data) => {
  try {
    const alert = new MonitoringAlert(data);
    await alert.save();
    return alert;
  } catch (error) {
    logger.error(`Error creating alert configuration: ${error.message}`, { error });
    throw error;
  }
};

/**
 * Update an existing alert configuration
 * @param {string} alertId - Alert ID
 * @param {Object} data - Updated alert data
 * @returns {Promise<Object>} Updated alert configuration
 */
const updateAlertConfig = async (alertId, data) => {
  try {
    const alert = await MonitoringAlert.findByIdAndUpdate(
      alertId,
      { $set: data },
      { new: true, runValidators: true }
    );
    
    if (!alert) {
      throw new Error('Alert configuration not found');
    }
    
    return alert;
  } catch (error) {
    logger.error(`Error updating alert configuration: ${error.message}`, { error });
    throw error;
  }
};

/**
 * Get alert configurations with filtering and pagination
 * @param {Object} filters - Filter criteria
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Alert configurations with pagination metadata
 */
const getAlertConfigs = async (filters = {}, options = {}) => {
  try {
    const {
      page = 1,
      limit = 50,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      populate = []
    } = options;

    // Build query from filters
    const query = {};
    
    if (filters.metricType) {
      query.metricType = filters.metricType;
    }
    
    if (filters.entityType) {
      query.entityType = filters.entityType;
    }
    
    if (filters.entityId) {
      query.entityId = mongoose.Types.ObjectId(filters.entityId);
    }
    
    if (filters.severity) {
      query.severity = filters.severity;
    }
    
    if (filters.status) {
      query.status = filters.status;
    }

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const alerts = await MonitoringAlert.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate(populate);

    // Get total count
    const totalCount = await MonitoringAlert.countDocuments(query);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return {
      data: alerts,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext,
        hasPrev,
      },
    };
  } catch (error) {
    logger.error(`Error getting alert configurations: ${error.message}`, { error });
    throw error;
  }
};

/**
 * Acknowledge an alert
 * @param {string} alertId - Alert ID
 * @param {string} userId - User ID who acknowledges the alert
 * @returns {Promise<Object>} Updated alert
 */
const acknowledgeAlert = async (alertId, userId) => {
  try {
    const alert = await MonitoringAlert.findByIdAndUpdate(
      alertId,
      {
        $set: {
          status: 'acknowledged',
          acknowledgedBy: mongoose.Types.ObjectId(userId),
          acknowledgedAt: new Date()
        }
      },
      { new: true, runValidators: true }
    );
    
    if (!alert) {
      throw new Error('Alert not found');
    }
    
    return alert;
  } catch (error) {
    logger.error(`Error acknowledging alert: ${error.message}`, { error });
    throw error;
  }
};

/**
 * Resolve an alert
 * @param {string} alertId - Alert ID
 * @param {string} userId - User ID who resolves the alert
 * @returns {Promise<Object>} Updated alert
 */
const resolveAlert = async (alertId, userId) => {
  try {
    const alert = await MonitoringAlert.findByIdAndUpdate(
      alertId,
      {
        $set: {
          status: 'resolved',
          resolvedBy: mongoose.Types.ObjectId(userId),
          resolvedAt: new Date()
        }
      },
      { new: true, runValidators: true }
    );
    
    if (!alert) {
      throw new Error('Alert not found');
    }
    
    return alert;
  } catch (error) {
    logger.error(`Error resolving alert: ${error.message}`, { error });
    throw error;
  }
};

/**
 * Check if a metric value should trigger any alerts
 * @param {string} metricType - Metric type
 * @param {string} entityType - Entity type
 * @param {string|null} entityId - Entity ID
 * @param {number} value - Metric value
 * @returns {Promise<Array>} Triggered alerts
 */
const checkAlertThresholds = async (metricType, entityType, entityId, value) => {
  try {
    // Find active alert configurations for this metric type
    const query = {
      metricType,
      status: 'active'
    };
    
    // Add entity filters if provided
    if (entityType) {
      query.entityType = entityType;
    }
    
    if (entityId) {
      query.entityId = mongoose.Types.ObjectId(entityId);
    }
    
    const alertConfigs = await MonitoringAlert.find(query);
    const triggeredAlerts = [];
    
    // Check each alert configuration
    for (const config of alertConfigs) {
      let shouldTrigger = false;
      
      // Evaluate the condition
      switch (config.condition.operator) {
        case '>':
          shouldTrigger = value > config.condition.value;
          break;
        case '>=':
          shouldTrigger = value >= config.condition.value;
          break;
        case '<':
          shouldTrigger = value < config.condition.value;
          break;
        case '<=':
          shouldTrigger = value <= config.condition.value;
          break;
        case '==':
          shouldTrigger = value === config.condition.value;
          break;
        case '!=':
          shouldTrigger = value !== config.condition.value;
          break;
      }
      
      if (shouldTrigger) {
        // Update the alert status to triggered
        const updatedAlert = await MonitoringAlert.findByIdAndUpdate(
          config._id,
          {
            $set: {
              status: 'triggered',
              lastTriggered: new Date()
            },
            $inc: { triggerCount: 1 }
          },
          { new: true }
        );
        
        triggeredAlerts.push(updatedAlert);
        
        // TODO: Send notifications based on alert configuration
        // This would typically call the notification service
      }
    }
    
    return triggeredAlerts;
  } catch (error) {
    logger.error(`Error checking alert thresholds: ${error.message}`, { error });
    throw error;
  }
};

/**
 * Generate dashboard data for a specific metric type
 * @param {string} metricType - Metric type
 * @param {Object} filters - Additional filters
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Dashboard data
 */
const generateDashboardData = async (metricType, filters = {}, options = {}) => {
  try {
    const {
      timeframe = 'daily',
      startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Default to last 30 days
      endDate = new Date(),
      entityType,
      entityId,
      limit = 10
    } = filters;
    
    // Build base query
    const query = { metricType, timeframe };
    
    // Add date range
    query.startPeriod = { $gte: new Date(startDate) };
    query.endPeriod = { $lte: new Date(endDate) };
    
    // Add entity filters if provided
    if (entityType) {
      query.entityType = entityType;
    }
    
    if (entityId) {
      query.entityId = mongoose.Types.ObjectId(entityId);
    }
    
    // Get time series data
    const timeSeriesData = await OperationalMetric.find(query)
      .sort({ startPeriod: 1 })
      .select('startPeriod value unit target');
    
    // Calculate summary statistics
    const values = timeSeriesData.map(item => item.value);
    const currentValue = values.length > 0 ? values[values.length - 1] : 0;
    const averageValue = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
    
    // Calculate trend (percentage change)
    let trend = 0;
    if (values.length >= 2) {
      const oldValue = values[0];
      const newValue = values[values.length - 1];
      trend = oldValue !== 0 ? ((newValue - oldValue) / oldValue) * 100 : 0;
    }
    
    // Get top performers if entity data is available
    let topPerformers = [];
    if (metricType.includes('performance') && !entityId) {
      const performerQuery = { metricType };
      
      if (entityType) {
        performerQuery.entityType = entityType;
      }
      
      // Aggregate to get top performers
      topPerformers = await OperationalMetric.aggregate([
        { $match: performerQuery },
        { $sort: { timestamp: -1 } },
        {
          $group: {
            _id: '$entityId',
            entityType: { $first: '$entityType' },
            latestValue: { $first: '$value' },
            latestTimestamp: { $first: '$timestamp' }
          }
        },
        { $sort: { latestValue: -1 } },
        { $limit: limit }
      ]);
      
      // Populate entity details
      if (topPerformers.length > 0 && entityType) {
        const EntityModel = mongoose.model(
          entityType.charAt(0).toUpperCase() + entityType.slice(1)
        );
        
        for (let i = 0; i < topPerformers.length; i++) {
          if (topPerformers[i]._id) {
            const entity = await EntityModel.findById(topPerformers[i]._id)
              .select('name code');
            
            if (entity) {
              topPerformers[i].entityName = entity.name;
              topPerformers[i].entityCode = entity.code;
            }
          }
        }
      }
    }
    
    return {
      metricType,
      timeframe,
      currentValue,
      averageValue,
      trend,
      unit: timeSeriesData.length > 0 ? timeSeriesData[0].unit : '',
      timeSeriesData,
      topPerformers,
      summary: {
        min: Math.min(...values),
        max: Math.max(...values),
        count: values.length
      }
    };
  } catch (error) {
    logger.error(`Error generating dashboard data: ${error.message}`, { error });
    throw error;
  }
};

/**
 * Get real-time system metrics
 * @returns {Promise<Object>} Real-time system metrics
 */
const getRealTimeMetrics = async () => {
  try {
    // Get the latest performance metrics for various system components
    const latestMetrics = {};
    
    const metricTypes = [
      'api_response_time',
      'database_query_time',
      'error_rate',
      'request_count',
      'memory_usage',
      'cpu_usage',
      'disk_usage',
      'network_traffic',
      'active_users',
      'concurrent_sessions'
    ];
    
    for (const metricType of metricTypes) {
      const latest = await PerformanceMetric.findOne({ metricType })
        .sort({ timestamp: -1 })
        .limit(1);
      
      if (latest) {
        latestMetrics[metricType] = {
          value: latest.value,
          unit: latest.unit,
          timestamp: latest.timestamp
        };
      }
    }
    
    // Get active alerts count
    const alertCounts = await MonitoringAlert.aggregate([
      {
        $match: {
          status: { $in: ['triggered', 'acknowledged'] }
        }
      },
      {
        $group: {
          _id: '$severity',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const alerts = {
      info: 0,
      warning: 0,
      critical: 0,
      emergency: 0
    };
    
    alertCounts.forEach(item => {
      alerts[item._id] = item.count;
    });
    
    return {
      timestamp: new Date(),
      metrics: latestMetrics,
      alerts
    };
  } catch (error) {
    logger.error(`Error getting real-time metrics: ${error.message}`, { error });
    throw error;
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
