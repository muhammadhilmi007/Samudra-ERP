/**
 * Integration Test: Mobile App Synchronization
 * Covers: Data Synchronization, Offline Operations, Queue Processing
 * Tech: Jest + Supertest
 *
 * Follows project integration testing standards (see TDD Section 10, SRS Section 6.4.2)
 */

const request = require('supertest');
const app = require('../../src/index');
const mongoose = require('mongoose');
const { setupTestDB, teardownTestDB } = require('../../src/test-db');

// Test data and variables
let checkerToken;
let driverToken;
let debtCollectorToken;
let syncTimestamp;
let offlineOperations = [];
let pickupAssignmentId;
let deliveryAssignmentId;
let collectionAssignmentId;

beforeAll(async () => {
  await setupTestDB();
  
  // Login as different mobile app user roles
  const checkerLogin = await request(app)
    .post('/api/auth/login')
    .send({ username: 'test_checker', password: 'password123' });
  checkerToken = checkerLogin.body.data.token;
  
  const driverLogin = await request(app)
    .post('/api/auth/login')
    .send({ username: 'test_driver', password: 'password123' });
  driverToken = driverLogin.body.data.token;
  
  const debtCollectorLogin = await request(app)
    .post('/api/auth/login')
    .send({ username: 'test_debt_collector', password: 'password123' });
  debtCollectorToken = debtCollectorLogin.body.data.token;
  
  // Create test assignments for each role
  // Pickup assignment for checker
  const pickupRes = await request(app)
    .post('/api/pickup-assignments')
    .set('Authorization', `Bearer ${checkerToken}`)
    .send({
      team: ['test_checker', 'test_driver'],
      vehicle: 'B1234XYZ',
      requests: [],
      status: 'assigned'
    });
  pickupAssignmentId = pickupRes.body.data._id;
  
  // Delivery assignment for driver
  const deliveryRes = await request(app)
    .post('/api/delivery-assignments')
    .set('Authorization', `Bearer ${driverToken}`)
    .send({
      driver: 'test_driver',
      vehicle: 'B5678XYZ',
      items: [],
      status: 'assigned'
    });
  deliveryAssignmentId = deliveryRes.body.data._id;
  
  // Collection assignment for debt collector
  const collectionRes = await request(app)
    .post('/api/collection-assignments')
    .set('Authorization', `Bearer ${debtCollectorToken}`)
    .send({
      collector: 'test_debt_collector',
      invoices: [],
      status: 'assigned'
    });
  collectionAssignmentId = collectionRes.body.data._id;
  
  // Get current timestamp for sync
  syncTimestamp = Date.now();
});

afterAll(async () => {
  await teardownTestDB();
  await mongoose.disconnect();
});

describe('Mobile App Synchronization Integration', () => {
  // 1. Initial data pull for Checker App
  it('should pull initial data for Checker App', async () => {
    const res = await request(app)
      .post('/api/mobile/sync/checker')
      .set('Authorization', `Bearer ${checkerToken}`)
      .send({
        lastSyncTimestamp: 0, // First sync
        deviceInfo: {
          id: 'test-device-checker',
          model: 'Test Phone',
          os: 'Android 12',
          appVersion: '1.0.0'
        }
      });
    
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('pickupAssignments');
    expect(res.body.data).toHaveProperty('pickupRequests');
    expect(res.body.data).toHaveProperty('warehouseItems');
    expect(res.body.data).toHaveProperty('syncTimestamp');
    expect(res.body.data.pickupAssignments).toBeInstanceOf(Array);
    expect(res.body.data.pickupAssignments.length).toBeGreaterThan(0);
  });

  // 2. Initial data pull for Driver App
  it('should pull initial data for Driver App', async () => {
    const res = await request(app)
      .post('/api/mobile/sync/driver')
      .set('Authorization', `Bearer ${driverToken}`)
      .send({
        lastSyncTimestamp: 0, // First sync
        deviceInfo: {
          id: 'test-device-driver',
          model: 'Test Phone',
          os: 'Android 12',
          appVersion: '1.0.0'
        }
      });
    
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('deliveryAssignments');
    expect(res.body.data).toHaveProperty('deliveryItems');
    expect(res.body.data).toHaveProperty('syncTimestamp');
    expect(res.body.data.deliveryAssignments).toBeInstanceOf(Array);
    expect(res.body.data.deliveryAssignments.length).toBeGreaterThan(0);
  });

  // 3. Initial data pull for Debt Collector App
  it('should pull initial data for Debt Collector App', async () => {
    const res = await request(app)
      .post('/api/mobile/sync/collector')
      .set('Authorization', `Bearer ${debtCollectorToken}`)
      .send({
        lastSyncTimestamp: 0, // First sync
        deviceInfo: {
          id: 'test-device-collector',
          model: 'Test Phone',
          os: 'Android 12',
          appVersion: '1.0.0'
        }
      });
    
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('collectionAssignments');
    expect(res.body.data).toHaveProperty('invoices');
    expect(res.body.data).toHaveProperty('syncTimestamp');
    expect(res.body.data.collectionAssignments).toBeInstanceOf(Array);
    expect(res.body.data.collectionAssignments.length).toBeGreaterThan(0);
  });

  // 4. Simulate offline operations for Checker App
  it('should process offline operations from Checker App', async () => {
    // Create offline operations
    offlineOperations = [
      {
        id: 'offline-op-1',
        timestamp: Date.now(),
        endpoint: `/api/pickup-assignments/${pickupAssignmentId}/status`,
        method: 'PATCH',
        data: { 
          status: 'in_progress',
          notes: 'Started pickup process while offline'
        }
      },
      {
        id: 'offline-op-2',
        timestamp: Date.now() + 1000,
        endpoint: `/api/pickup-assignments/${pickupAssignmentId}/items`,
        method: 'POST',
        data: {
          itemCode: 'OFFLINE-ITEM-1',
          weight: 2.5,
          dimensions: { length: 30, width: 20, height: 10 },
          notes: 'Item added while offline'
        }
      }
    ];
    
    const res = await request(app)
      .post('/api/mobile/sync/checker')
      .set('Authorization', `Bearer ${checkerToken}`)
      .send({
        lastSyncTimestamp: syncTimestamp,
        offlineOperations,
        deviceInfo: {
          id: 'test-device-checker',
          model: 'Test Phone',
          os: 'Android 12',
          appVersion: '1.0.0'
        }
      });
    
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('operationResults');
    expect(res.body.data.operationResults).toBeInstanceOf(Array);
    expect(res.body.data.operationResults.length).toBe(offlineOperations.length);
    expect(res.body.data.operationResults[0].success).toBe(true);
    expect(res.body.data.operationResults[0].id).toBe('offline-op-1');
    
    // Update sync timestamp
    syncTimestamp = res.body.data.syncTimestamp;
  });

  // 5. Verify offline operations were applied
  it('should have applied offline operations to the server', async () => {
    const res = await request(app)
      .get(`/api/pickup-assignments/${pickupAssignmentId}`)
      .set('Authorization', `Bearer ${checkerToken}`);
    
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('in_progress');
    expect(res.body.data.items).toBeInstanceOf(Array);
    expect(res.body.data.items.length).toBeGreaterThan(0);
  });

  // 6. Simulate offline operations for Driver App
  it('should process offline operations from Driver App', async () => {
    // Create offline operations
    const driverOfflineOperations = [
      {
        id: 'driver-offline-op-1',
        timestamp: Date.now(),
        endpoint: `/api/delivery-assignments/${deliveryAssignmentId}/status`,
        method: 'PATCH',
        data: { 
          status: 'in_progress',
          notes: 'Started delivery route while offline'
        }
      },
      {
        id: 'driver-offline-op-2',
        timestamp: Date.now() + 1000,
        endpoint: `/api/delivery-assignments/${deliveryAssignmentId}/location`,
        method: 'POST',
        data: {
          coordinates: {
            latitude: -6.2088,
            longitude: 106.8456
          },
          speed: 30,
          address: 'Location recorded while offline'
        }
      }
    ];
    
    const res = await request(app)
      .post('/api/mobile/sync/driver')
      .set('Authorization', `Bearer ${driverToken}`)
      .send({
        lastSyncTimestamp: syncTimestamp,
        offlineOperations: driverOfflineOperations,
        deviceInfo: {
          id: 'test-device-driver',
          model: 'Test Phone',
          os: 'Android 12',
          appVersion: '1.0.0'
        }
      });
    
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('operationResults');
    expect(res.body.data.operationResults).toBeInstanceOf(Array);
    expect(res.body.data.operationResults.length).toBe(driverOfflineOperations.length);
    expect(res.body.data.operationResults[0].success).toBe(true);
  });

  // 7. Test conflict resolution
  it('should handle conflicts in offline operations', async () => {
    // Create conflicting operations
    const conflictingOperations = [
      {
        id: 'conflict-op-1',
        timestamp: Date.now() - 10000, // Older timestamp than server
        endpoint: `/api/pickup-assignments/${pickupAssignmentId}/status`,
        method: 'PATCH',
        data: { 
          status: 'completed', // This conflicts with current status
          notes: 'Conflicting status update'
        }
      }
    ];
    
    const res = await request(app)
      .post('/api/mobile/sync/checker')
      .set('Authorization', `Bearer ${checkerToken}`)
      .send({
        lastSyncTimestamp: syncTimestamp - 20000, // Old timestamp
        offlineOperations: conflictingOperations,
        deviceInfo: {
          id: 'test-device-checker',
          model: 'Test Phone',
          os: 'Android 12',
          appVersion: '1.0.0'
        }
      });
    
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('operationResults');
    expect(res.body.data.operationResults[0].success).toBe(false);
    expect(res.body.data.operationResults[0]).toHaveProperty('conflict');
    expect(res.body.data.operationResults[0].conflict).toHaveProperty('serverValue');
  });

  // 8. Test incremental sync for Checker App
  it('should perform incremental sync for Checker App', async () => {
    // First, make a server-side change
    await request(app)
      .post(`/api/pickup-assignments/${pickupAssignmentId}/items`)
      .set('Authorization', `Bearer ${checkerToken}`)
      .send({
        itemCode: 'SERVER-ITEM-1',
        weight: 3.5,
        dimensions: { length: 25, width: 15, height: 10 },
        notes: 'Item added on server'
      });
    
    // Now sync with the client
    const res = await request(app)
      .post('/api/mobile/sync/checker')
      .set('Authorization', `Bearer ${checkerToken}`)
      .send({
        lastSyncTimestamp: syncTimestamp,
        offlineOperations: [],
        deviceInfo: {
          id: 'test-device-checker',
          model: 'Test Phone',
          os: 'Android 12',
          appVersion: '1.0.0'
        }
      });
    
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('pickupAssignments');
    expect(res.body.data).toHaveProperty('pickupItems');
    expect(res.body.data.pickupItems).toBeInstanceOf(Array);
    expect(res.body.data.pickupItems.length).toBeGreaterThan(0);
    
    // Update sync timestamp
    syncTimestamp = res.body.data.syncTimestamp;
  });

  // 9. Test sync with large data volume
  it('should handle sync with large data volume', async () => {
    // Create many offline operations to simulate large data volume
    const largeOfflineOperations = [];
    for (let i = 0; i < 50; i++) {
      largeOfflineOperations.push({
        id: `large-op-${i}`,
        timestamp: Date.now() + i,
        endpoint: `/api/pickup-assignments/${pickupAssignmentId}/notes`,
        method: 'POST',
        data: {
          note: `Test note ${i} created while offline`,
          type: 'info'
        }
      });
    }
    
    const res = await request(app)
      .post('/api/mobile/sync/checker')
      .set('Authorization', `Bearer ${checkerToken}`)
      .send({
        lastSyncTimestamp: syncTimestamp,
        offlineOperations: largeOfflineOperations,
        deviceInfo: {
          id: 'test-device-checker',
          model: 'Test Phone',
          os: 'Android 12',
          appVersion: '1.0.0'
        }
      });
    
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('operationResults');
    expect(res.body.data.operationResults.length).toBe(largeOfflineOperations.length);
  });

  // 10. Test sync with network interruption simulation
  it('should handle sync resumption after network interruption', async () => {
    // First sync attempt (will be interrupted)
    const partialSyncRes = await request(app)
      .post('/api/mobile/sync/checker')
      .set('Authorization', `Bearer ${checkerToken}`)
      .set('X-Simulate-Network-Error', 'true') // Custom header to simulate network error
      .send({
        lastSyncTimestamp: syncTimestamp,
        offlineOperations: [
          {
            id: 'interrupted-op-1',
            timestamp: Date.now(),
            endpoint: `/api/pickup-assignments/${pickupAssignmentId}/notes`,
            method: 'POST',
            data: {
              note: 'This operation should be interrupted',
              type: 'warning'
            }
          }
        ],
        deviceInfo: {
          id: 'test-device-checker',
          model: 'Test Phone',
          os: 'Android 12',
          appVersion: '1.0.0'
        }
      });
    
    // Expect partial sync response or error
    expect([200, 408, 504]).toContain(partialSyncRes.statusCode);
    
    // Resume sync with the same operation
    const resumeSyncRes = await request(app)
      .post('/api/mobile/sync/checker')
      .set('Authorization', `Bearer ${checkerToken}`)
      .send({
        lastSyncTimestamp: syncTimestamp,
        offlineOperations: [
          {
            id: 'interrupted-op-1', // Same ID as before
            timestamp: Date.now(),
            endpoint: `/api/pickup-assignments/${pickupAssignmentId}/notes`,
            method: 'POST',
            data: {
              note: 'This operation should be resumed',
              type: 'warning'
            }
          }
        ],
        deviceInfo: {
          id: 'test-device-checker',
          model: 'Test Phone',
          os: 'Android 12',
          appVersion: '1.0.0'
        },
        resumeSync: true
      });
    
    expect(resumeSyncRes.statusCode).toBe(200);
    expect(resumeSyncRes.body.success).toBe(true);
    expect(resumeSyncRes.body.data).toHaveProperty('operationResults');
    expect(resumeSyncRes.body.data.operationResults[0]).toHaveProperty('id', 'interrupted-op-1');
    expect(resumeSyncRes.body.data.operationResults[0]).toHaveProperty('idempotent', true);
  });
});
