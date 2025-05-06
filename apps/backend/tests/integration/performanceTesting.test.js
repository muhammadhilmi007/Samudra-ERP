/**
 * Integration Test: Performance Testing for Operational Endpoints
 * Covers: Response time, Throughput, Concurrent requests handling
 * Tech: Jest + Supertest + autocannon
 *
 * Follows project integration testing standards (see TDD Section 10, SRS Section 6.4.2)
 */

const request = require('supertest');
const autocannon = require('autocannon');
const app = require('../../src/app');
const mongoose = require('mongoose');
const { setupTestDB, teardownTestDB } = require('../utils/testDB');

// Test data and variables
let adminToken;
let branchAdminToken;
let checkerToken;
let driverToken;
let pickupAssignmentId;
let shipmentId;
let deliveryAssignmentId;

// Performance thresholds (as defined in TDD Section 10.3)
const RESPONSE_TIME_THRESHOLD_MS = 500; // 500ms max response time for operational endpoints
const THROUGHPUT_THRESHOLD_RPS = 50; // 50 requests per second minimum
const CONCURRENT_USERS_BENCHMARK = 50; // System should handle 50 concurrent users

beforeAll(async () => {
  await setupTestDB();
  
  // Login as different user roles
  const adminLogin = await request(app)
    .post('/api/auth/login')
    .send({ username: 'test_admin', password: 'password123' });
  adminToken = adminLogin.body.data.token;
  
  const branchAdminLogin = await request(app)
    .post('/api/auth/login')
    .send({ username: 'test_branch_admin', password: 'password123' });
  branchAdminToken = branchAdminLogin.body.data.token;
  
  const checkerLogin = await request(app)
    .post('/api/auth/login')
    .send({ username: 'test_checker', password: 'password123' });
  checkerToken = checkerLogin.body.data.token;
  
  const driverLogin = await request(app)
    .post('/api/auth/login')
    .send({ username: 'test_driver', password: 'password123' });
  driverToken = driverLogin.body.data.token;
  
  // Create test data
  // Pickup assignment
  const pickupRes = await request(app)
    .post('/api/pickup-assignments')
    .set('Authorization', `Bearer ${branchAdminToken}`)
    .send({
      team: ['test_checker', 'test_driver'],
      vehicle: 'B1234XYZ',
      requests: [],
      status: 'assigned'
    });
  pickupAssignmentId = pickupRes.body.data._id;
  
  // Shipment
  const shipmentRes = await request(app)
    .post('/api/inter-branch-shipments')
    .set('Authorization', `Bearer ${branchAdminToken}`)
    .send({
      originBranchId: 'branch1',
      destinationBranchId: 'branch2',
      scheduledDepartureDate: new Date(Date.now() + 86400000).toISOString(),
      estimatedArrivalDate: new Date(Date.now() + 172800000).toISOString(),
      vehicle: {
        registrationNumber: 'B5678XYZ',
        type: 'truck',
        capacity: 1000
      },
      driver: 'test_driver',
      items: [],
      notes: 'Test shipment'
    });
  shipmentId = shipmentRes.body.data._id;
  
  // Delivery assignment
  const deliveryRes = await request(app)
    .post('/api/delivery-assignments')
    .set('Authorization', `Bearer ${branchAdminToken}`)
    .send({
      driver: 'test_driver',
      vehicle: 'B9012XYZ',
      items: [],
      status: 'assigned'
    });
  deliveryAssignmentId = deliveryRes.body.data._id;
}, 30000); // Increased timeout for setup

afterAll(async () => {
  await teardownTestDB();
  await mongoose.disconnect();
});

// Helper function to measure response time
const measureResponseTime = async (endpoint, token) => {
  const start = Date.now();
  await request(app)
    .get(endpoint)
    .set('Authorization', `Bearer ${token}`);
  return Date.now() - start;
};

// Helper function to run load test with autocannon
const runLoadTest = (endpoint, token, duration = 10) => {
  return new Promise((resolve) => {
    const instance = autocannon({
      url: `http://localhost:${process.env.PORT || 3000}${endpoint}`,
      connections: CONCURRENT_USERS_BENCHMARK,
      duration,
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    autocannon.track(instance);
    
    instance.on('done', resolve);
  });
};

describe('Performance Testing for Operational Endpoints', () => {
  // 1. Response time tests for critical operational endpoints
  describe('Response Time Tests', () => {
    it('pickup assignment endpoint should respond within threshold', async () => {
      const responseTime = await measureResponseTime(`/api/pickup-assignments/${pickupAssignmentId}`, checkerToken);
      expect(responseTime).toBeLessThanOrEqual(RESPONSE_TIME_THRESHOLD_MS);
    });
    
    it('shipment tracking endpoint should respond within threshold', async () => {
      const responseTime = await measureResponseTime(`/api/inter-branch-shipments/${shipmentId}`, branchAdminToken);
      expect(responseTime).toBeLessThanOrEqual(RESPONSE_TIME_THRESHOLD_MS);
    });
    
    it('delivery assignment endpoint should respond within threshold', async () => {
      const responseTime = await measureResponseTime(`/api/delivery-assignments/${deliveryAssignmentId}`, driverToken);
      expect(responseTime).toBeLessThanOrEqual(RESPONSE_TIME_THRESHOLD_MS);
    });
    
    it('dashboard overview endpoint should respond within threshold', async () => {
      const responseTime = await measureResponseTime('/api/dashboard/overview', adminToken);
      expect(responseTime).toBeLessThanOrEqual(RESPONSE_TIME_THRESHOLD_MS * 2); // Dashboard can be slightly slower
    });
  });

  // 2. Throughput tests for high-volume endpoints
  describe('Throughput Tests', () => {
    it('tracking API should handle minimum throughput requirement', async () => {
      // Create a public tracking code first
      const trackingRes = await request(app)
        .post('/api/tracking/generate')
        .set('Authorization', `Bearer ${branchAdminToken}`)
        .send({
          itemId: 'test-item-1',
          type: 'delivery'
        });
      
      const trackingCode = trackingRes.body.data.trackingCode;
      
      // Run load test on public tracking endpoint
      const results = await runLoadTest(`/api/tracking/${trackingCode}`);
      
      expect(results.requests.average).toBeGreaterThanOrEqual(THROUGHPUT_THRESHOLD_RPS);
    }, 30000); // Increased timeout for load testing
    
    it('mobile sync API should handle minimum throughput requirement', async () => {
      // Run load test on mobile sync endpoint
      const results = await runLoadTest('/api/mobile/sync/checker', checkerToken);
      
      expect(results.requests.average).toBeGreaterThanOrEqual(THROUGHPUT_THRESHOLD_RPS * 0.5); // Sync can be slower
    }, 30000); // Increased timeout for load testing
  });

  // 3. Database query performance tests
  describe('Database Query Performance Tests', () => {
    it('should efficiently query large shipment history', async () => {
      // First, generate a large history
      for (let i = 0; i < 100; i++) {
        await request(app)
          .post(`/api/inter-branch-shipments/${shipmentId}/history`)
          .set('Authorization', `Bearer ${branchAdminToken}`)
          .send({
            action: `Test action ${i}`,
            details: `Test details ${i}`,
            userId: 'test_branch_admin'
          });
      }
      
      // Measure query time
      const start = Date.now();
      await request(app)
        .get(`/api/inter-branch-shipments/${shipmentId}/history`)
        .set('Authorization', `Bearer ${branchAdminToken}`);
      const queryTime = Date.now() - start;
      
      expect(queryTime).toBeLessThanOrEqual(RESPONSE_TIME_THRESHOLD_MS);
    });
    
    it('should efficiently perform geospatial queries', async () => {
      // Add location data first
      for (let i = 0; i < 50; i++) {
        await request(app)
          .post(`/api/delivery-assignments/${deliveryAssignmentId}/location`)
          .set('Authorization', `Bearer ${driverToken}`)
          .send({
            coordinates: {
              latitude: -6.2088 + (Math.random() * 0.1),
              longitude: 106.8456 + (Math.random() * 0.1)
            },
            speed: Math.floor(Math.random() * 60),
            address: `Location ${i}`
          });
      }
      
      // Measure geospatial query time
      const start = Date.now();
      await request(app)
        .get(`/api/delivery-assignments/nearby`)
        .set('Authorization', `Bearer ${branchAdminToken}`)
        .query({
          latitude: -6.2088,
          longitude: 106.8456,
          radius: 5000 // 5km radius
        });
      const queryTime = Date.now() - start;
      
      expect(queryTime).toBeLessThanOrEqual(RESPONSE_TIME_THRESHOLD_MS * 1.5); // Geospatial queries can be slower
    });
  });

  // 4. Concurrent requests handling
  describe('Concurrent Request Handling', () => {
    it('should handle multiple concurrent status updates', async () => {
      // Create promises for concurrent requests
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(
          request(app)
            .post(`/api/pickup-assignments/${pickupAssignmentId}/notes`)
            .set('Authorization', `Bearer ${checkerToken}`)
            .send({
              note: `Concurrent note ${i}`,
              type: 'info'
            })
        );
      }
      
      // Execute all promises concurrently
      const results = await Promise.all(promises);
      
      // All requests should succeed
      results.forEach(res => {
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
      });
    });
  });

  // 5. Cache performance tests
  describe('Cache Performance Tests', () => {
    it('should improve performance with Redis caching', async () => {
      // First request (uncached)
      const start1 = Date.now();
      await request(app)
        .get('/api/dashboard/statistics')
        .set('Authorization', `Bearer ${adminToken}`);
      const uncachedTime = Date.now() - start1;
      
      // Second request (should be cached)
      const start2 = Date.now();
      await request(app)
        .get('/api/dashboard/statistics')
        .set('Authorization', `Bearer ${adminToken}`);
      const cachedTime = Date.now() - start2;
      
      // Cached response should be significantly faster
      expect(cachedTime).toBeLessThan(uncachedTime * 0.5);
    });
  });

  // 6. Pagination performance tests
  describe('Pagination Performance Tests', () => {
    it('should efficiently handle paginated results for large datasets', async () => {
      // Create a large dataset first
      const createItems = [];
      for (let i = 0; i < 10; i++) {
        createItems.push(
          request(app)
            .post('/api/warehouse-items')
            .set('Authorization', `Bearer ${branchAdminToken}`)
            .send({
              code: `PERF-ITEM-${i}`,
              weight: 1.5,
              dimensions: { length: 20, width: 15, height: 10 },
              category: 'general',
              status: 'in_inventory'
            })
        );
      }
      await Promise.all(createItems);
      
      // Test first page
      const start1 = Date.now();
      await request(app)
        .get('/api/warehouse-items')
        .set('Authorization', `Bearer ${branchAdminToken}`)
        .query({
          page: 1,
          limit: 10
        });
      const firstPageTime = Date.now() - start1;
      
      // Test second page
      const start2 = Date.now();
      await request(app)
        .get('/api/warehouse-items')
        .set('Authorization', `Bearer ${branchAdminToken}`)
        .query({
          page: 2,
          limit: 10
        });
      const secondPageTime = Date.now() - start2;
      
      // Both should be within threshold and similar in performance
      expect(firstPageTime).toBeLessThanOrEqual(RESPONSE_TIME_THRESHOLD_MS);
      expect(secondPageTime).toBeLessThanOrEqual(RESPONSE_TIME_THRESHOLD_MS);
      // Second page shouldn't be significantly slower than first
      expect(secondPageTime).toBeLessThan(firstPageTime * 1.5);
    });
  });
});
