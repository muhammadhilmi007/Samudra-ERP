/**
 * Samudra Paket ERP - Monitoring Repository Tests
 * Unit tests for monitoring repository functionality
 */

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const monitoringRepository = require('../../../../src/domain/repositories/monitoringRepository');
const OperationalMetric = require('../../../../src/domain/models/operationalMetric');
const PerformanceMetric = require('../../../../src/domain/models/performanceMetric');
const MonitoringAlert = require('../../../../src/domain/models/monitoringAlert');

let mongoServer;

// Mock the logger to prevent console output during tests
jest.mock('../../../../src/api/middleware/gateway/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
}));

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await OperationalMetric.deleteMany({});
  await PerformanceMetric.deleteMany({});
  await MonitoringAlert.deleteMany({});
});

describe('Monitoring Repository - Operational Metrics', () => {
  test('should create a new operational metric', async () => {
    const metricData = {
      metricType: 'shipment_volume',
      entityType: 'branch',
      entityId: new mongoose.Types.ObjectId(),
      timeframe: 'daily',
      startPeriod: new Date('2025-05-01'),
      endPeriod: new Date('2025-05-02'),
      value: 150,
      unit: 'shipments',
      createdBy: new mongoose.Types.ObjectId(),
    };

    const result = await monitoringRepository.createOperationalMetric(metricData);

    expect(result).toBeDefined();
    expect(result.metricType).toBe(metricData.metricType);
    expect(result.value).toBe(metricData.value);
    expect(result.unit).toBe(metricData.unit);

    // Verify it was saved to the database
    const savedMetric = await OperationalMetric.findById(result._id);
    expect(savedMetric).toBeDefined();
    expect(savedMetric.metricType).toBe(metricData.metricType);
  });

  test('should get operational metrics with filters', async () => {
    // Create test data
    const branchId = new mongoose.Types.ObjectId();
    const metrics = [
      {
        metricType: 'shipment_volume',
        entityType: 'branch',
        entityId: branchId,
        timeframe: 'daily',
        startPeriod: new Date('2025-05-01'),
        endPeriod: new Date('2025-05-02'),
        value: 150,
        unit: 'shipments',
      },
      {
        metricType: 'delivery_success_rate',
        entityType: 'branch',
        entityId: branchId,
        timeframe: 'daily',
        startPeriod: new Date('2025-05-01'),
        endPeriod: new Date('2025-05-02'),
        value: 95.5,
        unit: 'percent',
      },
      {
        metricType: 'shipment_volume',
        entityType: 'branch',
        entityId: new mongoose.Types.ObjectId(),
        timeframe: 'daily',
        startPeriod: new Date('2025-05-01'),
        endPeriod: new Date('2025-05-02'),
        value: 75,
        unit: 'shipments',
      },
    ];

    await OperationalMetric.insertMany(metrics);

    // Test filtering by metricType and entityId
    const filters = {
      metricType: 'shipment_volume',
      entityId: branchId.toString(),
    };

    const result = await monitoringRepository.getOperationalMetrics(filters);

    expect(result).toBeDefined();
    expect(result.data).toHaveLength(1);
    expect(result.data[0].metricType).toBe('shipment_volume');
    expect(result.data[0].entityId.toString()).toBe(branchId.toString());
    expect(result.pagination).toBeDefined();
    expect(result.pagination.totalCount).toBe(1);
  });
});

describe('Monitoring Repository - Performance Metrics', () => {
  test('should create a new performance metric', async () => {
    const metricData = {
      metricType: 'api_response_time',
      endpoint: '/api/shipments',
      service: 'shipment-service',
      method: 'GET',
      value: 120,
      unit: 'ms',
      sampleSize: 50,
      min: 80,
      max: 250,
      avg: 120,
      p95: 200,
    };

    const result = await monitoringRepository.createPerformanceMetric(metricData);

    expect(result).toBeDefined();
    expect(result.metricType).toBe(metricData.metricType);
    expect(result.endpoint).toBe(metricData.endpoint);
    expect(result.value).toBe(metricData.value);

    // Verify it was saved to the database
    const savedMetric = await PerformanceMetric.findById(result._id);
    expect(savedMetric).toBeDefined();
    expect(savedMetric.metricType).toBe(metricData.metricType);
  });

  test('should get performance metrics with filters', async () => {
    // Create test data
    const metrics = [
      {
        metricType: 'api_response_time',
        endpoint: '/api/shipments',
        service: 'shipment-service',
        method: 'GET',
        timestamp: new Date('2025-05-01T10:00:00Z'),
        value: 120,
        unit: 'ms',
      },
      {
        metricType: 'api_response_time',
        endpoint: '/api/shipments',
        service: 'shipment-service',
        method: 'POST',
        timestamp: new Date('2025-05-01T10:05:00Z'),
        value: 180,
        unit: 'ms',
      },
      {
        metricType: 'database_query_time',
        service: 'shipment-service',
        timestamp: new Date('2025-05-01T10:10:00Z'),
        value: 50,
        unit: 'ms',
      },
    ];

    await PerformanceMetric.insertMany(metrics);

    // Test filtering by metricType and service
    const filters = {
      metricType: 'api_response_time',
      service: 'shipment-service',
    };

    const result = await monitoringRepository.getPerformanceMetrics(filters);

    expect(result).toBeDefined();
    expect(result.data).toHaveLength(2);
    expect(result.data[0].metricType).toBe('api_response_time');
    expect(result.data[0].service).toBe('shipment-service');
    expect(result.pagination).toBeDefined();
    expect(result.pagination.totalCount).toBe(2);
  });
});

describe('Monitoring Repository - Alerts', () => {
  test('should create a new alert configuration', async () => {
    const alertData = {
      alertName: 'High API Response Time',
      metricType: 'api_response_time',
      entityType: 'system',
      condition: {
        operator: '>',
        value: 500,
        duration: 5,
      },
      severity: 'warning',
      message: 'API response time is too high',
      notificationChannels: ['email', 'in_app'],
      createdBy: new mongoose.Types.ObjectId(),
    };

    const result = await monitoringRepository.createAlertConfig(alertData);

    expect(result).toBeDefined();
    expect(result.alertName).toBe(alertData.alertName);
    expect(result.metricType).toBe(alertData.metricType);
    expect(result.condition.value).toBe(alertData.condition.value);
    expect(result.status).toBe('active');

    // Verify it was saved to the database
    const savedAlert = await MonitoringAlert.findById(result._id);
    expect(savedAlert).toBeDefined();
    expect(savedAlert.alertName).toBe(alertData.alertName);
  });

  test('should update an existing alert configuration', async () => {
    // Create an alert first
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
      status: 'active',
    };

    const alert = await MonitoringAlert.create(alertData);

    // Update the alert
    const updateData = {
      alertName: 'Updated Alert Name',
      condition: {
        operator: '>=',
        value: 600,
      },
      severity: 'critical',
    };

    const result = await monitoringRepository.updateAlertConfig(alert._id, updateData);

    expect(result).toBeDefined();
    expect(result.alertName).toBe(updateData.alertName);
    expect(result.condition.operator).toBe(updateData.condition.operator);
    expect(result.condition.value).toBe(updateData.condition.value);
    expect(result.severity).toBe(updateData.severity);

    // Verify it was updated in the database
    const updatedAlert = await MonitoringAlert.findById(alert._id);
    expect(updatedAlert.alertName).toBe(updateData.alertName);
  });

  test('should check alert thresholds and trigger alerts', async () => {
    // Create an alert configuration
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
      status: 'active',
    };

    await MonitoringAlert.create(alertData);

    // This should trigger the alert (value > 500)
    const triggeredAlerts = await monitoringRepository.checkAlertThresholds(
      'api_response_time',
      'system',
      null,
      600
    );

    expect(triggeredAlerts).toBeDefined();
    expect(triggeredAlerts).toHaveLength(1);
    expect(triggeredAlerts[0].status).toBe('triggered');
    expect(triggeredAlerts[0].triggerCount).toBe(1);
    expect(triggeredAlerts[0].lastTriggered).toBeDefined();

    // This should not trigger the alert (value <= 500)
    const noTriggeredAlerts = await monitoringRepository.checkAlertThresholds(
      'api_response_time',
      'system',
      null,
      400
    );

    expect(noTriggeredAlerts).toHaveLength(0);
  });
});

describe('Monitoring Repository - Dashboard Data', () => {
  test('should generate dashboard data for a specific metric type', async () => {
    // Create test data
    const branchId = new mongoose.Types.ObjectId();
    const metrics = [
      {
        metricType: 'shipment_volume',
        entityType: 'branch',
        entityId: branchId,
        timeframe: 'daily',
        startPeriod: new Date('2025-05-01'),
        endPeriod: new Date('2025-05-02'),
        value: 100,
        unit: 'shipments',
      },
      {
        metricType: 'shipment_volume',
        entityType: 'branch',
        entityId: branchId,
        timeframe: 'daily',
        startPeriod: new Date('2025-05-02'),
        endPeriod: new Date('2025-05-03'),
        value: 120,
        unit: 'shipments',
      },
      {
        metricType: 'shipment_volume',
        entityType: 'branch',
        entityId: branchId,
        timeframe: 'daily',
        startPeriod: new Date('2025-05-03'),
        endPeriod: new Date('2025-05-04'),
        value: 150,
        unit: 'shipments',
      },
    ];

    await OperationalMetric.insertMany(metrics);

    const filters = {
      entityType: 'branch',
      entityId: branchId.toString(),
      timeframe: 'daily',
      startDate: new Date('2025-05-01'),
      endDate: new Date('2025-05-04'),
    };

    const result = await monitoringRepository.generateDashboardData('shipment_volume', filters);

    expect(result).toBeDefined();
    expect(result.metricType).toBe('shipment_volume');
    expect(result.timeSeriesData).toHaveLength(3);
    expect(result.currentValue).toBe(150); // Last value
    expect(result.averageValue).toBe((100 + 120 + 150) / 3);
    expect(result.trend).toBeCloseTo(50); // 50% increase from first to last
    expect(result.unit).toBe('shipments');
  });
});

describe('Monitoring Repository - Real-time Metrics', () => {
  test('should get real-time system metrics', async () => {
    // Create test data
    const metrics = [
      {
        metricType: 'api_response_time',
        value: 120,
        unit: 'ms',
        timestamp: new Date(),
      },
      {
        metricType: 'memory_usage',
        value: 75,
        unit: 'percent',
        timestamp: new Date(),
      },
      {
        metricType: 'cpu_usage',
        value: 45,
        unit: 'percent',
        timestamp: new Date(),
      },
    ];

    await PerformanceMetric.insertMany(metrics);

    // Create some alerts
    const alerts = [
      {
        alertName: 'High CPU Usage',
        metricType: 'cpu_usage',
        entityType: 'system',
        severity: 'warning',
        status: 'triggered',
      },
      {
        alertName: 'Critical Memory Usage',
        metricType: 'memory_usage',
        entityType: 'system',
        severity: 'critical',
        status: 'triggered',
      },
    ];

    await MonitoringAlert.insertMany(alerts);

    const result = await monitoringRepository.getRealTimeMetrics();

    expect(result).toBeDefined();
    expect(result.timestamp).toBeDefined();
    expect(result.metrics).toBeDefined();
    expect(result.metrics.api_response_time).toBeDefined();
    expect(result.metrics.api_response_time.value).toBe(120);
    expect(result.metrics.memory_usage).toBeDefined();
    expect(result.metrics.memory_usage.value).toBe(75);
    expect(result.alerts).toBeDefined();
    expect(result.alerts.warning).toBe(1);
    expect(result.alerts.critical).toBe(1);
  });
});
