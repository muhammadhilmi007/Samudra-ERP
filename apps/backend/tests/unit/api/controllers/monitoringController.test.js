/**
 * Samudra Paket ERP - Monitoring Controller Tests
 * Unit tests for monitoring controller functionality
 */

const monitoringController = require('../../../../src/api/controllers/monitoringController');
const monitoringRepository = require('../../../../src/domain/repositories/monitoringRepository');
const mongoose = require('mongoose');

// Mock the monitoring repository
jest.mock('../../../../src/domain/repositories/monitoringRepository');

// Mock the logger to prevent console output during tests
jest.mock('../../../../src/api/middleware/gateway/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
}));

describe('Monitoring Controller', () => {
  let req, res;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Mock request and response
    req = {
      user: { id: 'user123' },
      params: {},
      query: {},
      body: {},
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe('createOperationalMetric', () => {
    test('should create an operational metric and return 201 status', async () => {
      // Setup
      const metricData = {
        metricType: 'shipment_volume',
        entityType: 'branch',
        entityId: new mongoose.Types.ObjectId().toString(),
        timeframe: 'daily',
        startPeriod: '2025-05-01T00:00:00Z',
        endPeriod: '2025-05-02T00:00:00Z',
        value: 150,
        unit: 'shipments',
      };

      req.body = metricData;

      const createdMetric = { ...metricData, _id: 'metric123' };
      monitoringRepository.createOperationalMetric.mockResolvedValue(createdMetric);

      // Execute
      await monitoringController.createOperationalMetric(req, res);

      // Assert
      expect(monitoringRepository.createOperationalMetric).toHaveBeenCalledWith({
        ...metricData,
        createdBy: 'user123',
        updatedBy: 'user123',
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: createdMetric,
      });
    });

    test('should handle errors and return 500 status', async () => {
      // Setup
      req.body = { metricType: 'invalid_type' };
      const error = new Error('Invalid metric type');
      monitoringRepository.createOperationalMetric.mockRejectedValue(error);

      // Execute
      await monitoringController.createOperationalMetric(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'OPERATIONAL_METRIC_CREATION_FAILED',
          message: 'Failed to create operational metric',
          details: error.message,
        },
      });
    });
  });

  describe('getOperationalMetrics', () => {
    test('should get operational metrics and return 200 status', async () => {
      // Setup
      req.query = {
        metricType: 'shipment_volume',
        entityType: 'branch',
        page: '1',
        limit: '10',
      };

      const metrics = [
        { _id: 'metric1', metricType: 'shipment_volume', value: 150 },
        { _id: 'metric2', metricType: 'shipment_volume', value: 200 },
      ];

      const pagination = {
        page: 1,
        limit: 10,
        totalCount: 2,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      };

      monitoringRepository.getOperationalMetrics.mockResolvedValue({
        data: metrics,
        pagination,
      });

      // Execute
      await monitoringController.getOperationalMetrics(req, res);

      // Assert
      expect(monitoringRepository.getOperationalMetrics).toHaveBeenCalledWith(
        { metricType: 'shipment_volume', entityType: 'branch' },
        { page: 1, limit: 10, sortBy: 'timestamp', sortOrder: 'desc', populate: [] }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: metrics,
        meta: { pagination },
      });
    });

    test('should handle errors and return 500 status', async () => {
      // Setup
      const error = new Error('Database error');
      monitoringRepository.getOperationalMetrics.mockRejectedValue(error);

      // Execute
      await monitoringController.getOperationalMetrics(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'OPERATIONAL_METRICS_RETRIEVAL_FAILED',
          message: 'Failed to retrieve operational metrics',
          details: error.message,
        },
      });
    });
  });

  describe('createPerformanceMetric', () => {
    test('should create a performance metric and return 201 status', async () => {
      // Setup
      const metricData = {
        metricType: 'api_response_time',
        endpoint: '/api/shipments',
        service: 'shipment-service',
        method: 'GET',
        value: 120,
        unit: 'ms',
      };

      req.body = metricData;

      const createdMetric = { ...metricData, _id: 'metric123' };
      monitoringRepository.createPerformanceMetric.mockResolvedValue(createdMetric);

      // Execute
      await monitoringController.createPerformanceMetric(req, res);

      // Assert
      expect(monitoringRepository.createPerformanceMetric).toHaveBeenCalledWith(metricData);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: createdMetric,
      });
    });
  });

  describe('createAlertConfig', () => {
    test('should create an alert configuration and return 201 status', async () => {
      // Setup
      const alertData = {
        alertName: 'High API Response Time',
        metricType: 'api_response_time',
        entityType: 'system',
        condition: {
          operator: '>',
          value: 500,
        },
        severity: 'warning',
        message: 'API response time is too high',
      };

      req.body = alertData;

      const createdAlert = { ...alertData, _id: 'alert123' };
      monitoringRepository.createAlertConfig.mockResolvedValue(createdAlert);

      // Execute
      await monitoringController.createAlertConfig(req, res);

      // Assert
      expect(monitoringRepository.createAlertConfig).toHaveBeenCalledWith({
        ...alertData,
        createdBy: 'user123',
        updatedBy: 'user123',
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: createdAlert,
      });
    });
  });

  describe('updateAlertConfig', () => {
    test('should update an alert configuration and return 200 status', async () => {
      // Setup
      const alertId = 'alert123';
      req.params = { alertId };
      
      const updateData = {
        alertName: 'Updated Alert Name',
        severity: 'critical',
      };

      req.body = updateData;

      const updatedAlert = { _id: alertId, ...updateData };
      monitoringRepository.updateAlertConfig.mockResolvedValue(updatedAlert);

      // Execute
      await monitoringController.updateAlertConfig(req, res);

      // Assert
      expect(monitoringRepository.updateAlertConfig).toHaveBeenCalledWith(alertId, {
        ...updateData,
        updatedBy: 'user123',
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: updatedAlert,
      });
    });
  });

  describe('acknowledgeAlert', () => {
    test('should acknowledge an alert and return 200 status', async () => {
      // Setup
      const alertId = 'alert123';
      req.params = { alertId };
      
      const acknowledgedAlert = { 
        _id: alertId, 
        status: 'acknowledged',
        acknowledgedBy: 'user123',
        acknowledgedAt: new Date()
      };
      
      monitoringRepository.acknowledgeAlert.mockResolvedValue(acknowledgedAlert);

      // Execute
      await monitoringController.acknowledgeAlert(req, res);

      // Assert
      expect(monitoringRepository.acknowledgeAlert).toHaveBeenCalledWith(alertId, 'user123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: acknowledgedAlert,
      });
    });
  });

  describe('resolveAlert', () => {
    test('should resolve an alert and return 200 status', async () => {
      // Setup
      const alertId = 'alert123';
      req.params = { alertId };
      
      const resolvedAlert = { 
        _id: alertId, 
        status: 'resolved',
        resolvedBy: 'user123',
        resolvedAt: new Date()
      };
      
      monitoringRepository.resolveAlert.mockResolvedValue(resolvedAlert);

      // Execute
      await monitoringController.resolveAlert(req, res);

      // Assert
      expect(monitoringRepository.resolveAlert).toHaveBeenCalledWith(alertId, 'user123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: resolvedAlert,
      });
    });
  });

  describe('generateDashboardData', () => {
    test('should generate dashboard data and return 200 status', async () => {
      // Setup
      const metricType = 'shipment_volume';
      req.params = { metricType };
      req.query = {
        timeframe: 'daily',
        startDate: '2025-05-01',
        endDate: '2025-05-10',
        entityType: 'branch',
      };
      
      const dashboardData = {
        metricType,
        timeframe: 'daily',
        currentValue: 150,
        averageValue: 125,
        trend: 20,
        unit: 'shipments',
        timeSeriesData: [
          { startPeriod: '2025-05-01', value: 100 },
          { startPeriod: '2025-05-02', value: 120 },
          { startPeriod: '2025-05-03', value: 150 },
        ],
      };
      
      monitoringRepository.generateDashboardData.mockResolvedValue(dashboardData);

      // Execute
      await monitoringController.generateDashboardData(req, res);

      // Assert
      expect(monitoringRepository.generateDashboardData).toHaveBeenCalledWith(
        metricType,
        {
          timeframe: 'daily',
          startDate: '2025-05-01',
          endDate: '2025-05-10',
          entityType: 'branch',
          limit: 10,
        }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: dashboardData,
      });
    });
  });

  describe('getRealTimeMetrics', () => {
    test('should get real-time metrics and return 200 status', async () => {
      // Setup
      const metrics = {
        timestamp: new Date(),
        metrics: {
          api_response_time: { value: 120, unit: 'ms' },
          memory_usage: { value: 75, unit: 'percent' },
        },
        alerts: {
          info: 0,
          warning: 1,
          critical: 0,
          emergency: 0,
        },
      };
      
      monitoringRepository.getRealTimeMetrics.mockResolvedValue(metrics);

      // Execute
      await monitoringController.getRealTimeMetrics(req, res);

      // Assert
      expect(monitoringRepository.getRealTimeMetrics).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: metrics,
      });
    });
  });
});
