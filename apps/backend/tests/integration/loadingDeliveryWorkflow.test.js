/**
 * Integration Test: Loading and Delivery Workflow (E2E)
 * Covers: Loading Process, Delivery Assignment, Delivery Execution, and RBAC
 * Tech: Jest + Supertest
 *
 * Follows project integration testing standards (see TDD Section 10, SRS Section 6.4.2)
 */

const request = require('supertest');
const app = require('../../src/app');
const mongoose = require('mongoose');
const path = require('path');
const { setupTestDB, teardownTestDB } = require('../utils/testDB');

// Test data and variables
let branchAdminToken;
let checkerToken;
let driverToken;
let customerToken;
let warehouseItemIds = [];
let loadingManifestId;
let deliveryAssignmentId;
let deliveryItemIds = [];
let branchId;

// Mock image paths for testing file uploads
const testSignaturePath = path.join(__dirname, '../fixtures/test-signature.png');
const testProofOfDeliveryPath = path.join(__dirname, '../fixtures/test-pod.jpg');

beforeAll(async () => {
  await setupTestDB();
  
  // Login as different user roles
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
  
  const customerLogin = await request(app)
    .post('/api/auth/login')
    .send({ username: 'test_customer', password: 'password123' });
  customerToken = customerLogin.body.data.token;
  
  // Get branch ID for testing
  const branchesRes = await request(app)
    .get('/api/branches')
    .set('Authorization', `Bearer ${branchAdminToken}`);
  
  branchId = branchesRes.body.data[0]._id;
  
  // Create test warehouse items for loading
  for (let i = 0; i < 5; i++) {
    const itemRes = await request(app)
      .post('/api/warehouse-items')
      .set('Authorization', `Bearer ${branchAdminToken}`)
      .send({
        code: `ITEM-LOAD-${i}`,
        weight: 1.5 + i,
        dimensions: { length: 20, width: 15, height: 10 },
        category: 'general',
        status: 'ready_for_delivery',
        branchId,
        recipientName: `Recipient ${i}`,
        recipientAddress: `Address ${i}, Jakarta`,
        recipientPhone: `08123456${i}`,
        deliveryArea: 'Jakarta Selatan'
      });
    
    warehouseItemIds.push(itemRes.body.data._id);
  }
});

afterAll(async () => {
  await teardownTestDB();
  await mongoose.disconnect();
});

describe('Loading and Delivery Workflow Integration', () => {
  // 1. Create loading manifest
  it('should create a loading manifest', async () => {
    const res = await request(app)
      .post('/api/loading-manifests')
      .set('Authorization', `Bearer ${branchAdminToken}`)
      .send({
        branchId,
        items: warehouseItemIds,
        scheduledLoadingTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
        vehicle: {
          registrationNumber: 'B9012XYZ',
          type: 'van',
          capacity: 500 // kg
        },
        notes: 'Test loading manifest'
      });
    
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('_id');
    expect(res.body.data).toHaveProperty('code');
    expect(res.body.data.status).toBe('created');
    
    loadingManifestId = res.body.data._id;
  });

  // 2. RBAC test - Unauthorized role should not access loading manifest
  it('should reject access to loading manifest for unauthorized role', async () => {
    const res = await request(app)
      .get(`/api/loading-manifests/${loadingManifestId}`)
      .set('Authorization', `Bearer ${customerToken}`);
    
    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
  });

  // 3. Start loading process
  it('should start the loading process', async () => {
    const res = await request(app)
      .patch(`/api/loading-manifests/${loadingManifestId}/status`)
      .set('Authorization', `Bearer ${checkerToken}`)
      .send({ 
        status: 'loading',
        notes: 'Starting loading process'
      });
    
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('loading');
  });

  // 4. Scan items during loading
  it('should scan items during loading', async () => {
    // Scan each item
    for (const itemId of warehouseItemIds) {
      const res = await request(app)
        .post(`/api/loading-manifests/${loadingManifestId}/scan`)
        .set('Authorization', `Bearer ${checkerToken}`)
        .send({ 
          itemId,
          action: 'load',
          notes: `Item ${itemId} loaded`
        });
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    }
    
    // Verify all items are scanned
    const manifestRes = await request(app)
      .get(`/api/loading-manifests/${loadingManifestId}`)
      .set('Authorization', `Bearer ${checkerToken}`);
    
    expect(manifestRes.statusCode).toBe(200);
    expect(manifestRes.body.success).toBe(true);
    expect(manifestRes.body.data.scannedItems).toHaveLength(warehouseItemIds.length);
  });

  // 5. Complete loading process
  it('should complete the loading process', async () => {
    const res = await request(app)
      .patch(`/api/loading-manifests/${loadingManifestId}/status`)
      .set('Authorization', `Bearer ${checkerToken}`)
      .send({ 
        status: 'loaded',
        notes: 'All items loaded successfully'
      });
    
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('loaded');
  });

  // 6. Create delivery assignment
  it('should create a delivery assignment', async () => {
    const res = await request(app)
      .post('/api/delivery-assignments')
      .set('Authorization', `Bearer ${branchAdminToken}`)
      .send({
        loadingManifestId,
        driver: 'test_driver',
        optimizeRoute: true,
        scheduledDepartureTime: new Date(Date.now() + 7200000).toISOString(), // 2 hours from now
        notes: 'Test delivery assignment'
      });
    
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('_id');
    expect(res.body.data).toHaveProperty('code');
    expect(res.body.data).toHaveProperty('optimizedRoute');
    expect(res.body.data.status).toBe('assigned');
    
    deliveryAssignmentId = res.body.data._id;
    
    // Get delivery item IDs
    const deliveryItemsRes = await request(app)
      .get(`/api/delivery-assignments/${deliveryAssignmentId}/items`)
      .set('Authorization', `Bearer ${driverToken}`);
    
    deliveryItemIds = deliveryItemsRes.body.data.map(item => item._id);
  });

  // 7. Start delivery process
  it('should start the delivery process', async () => {
    const res = await request(app)
      .patch(`/api/delivery-assignments/${deliveryAssignmentId}/status`)
      .set('Authorization', `Bearer ${driverToken}`)
      .send({ 
        status: 'in_progress',
        notes: 'Starting delivery route'
      });
    
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('in_progress');
  });

  // 8. Update GPS location during delivery
  it('should update GPS location during delivery', async () => {
    const res = await request(app)
      .post(`/api/delivery-assignments/${deliveryAssignmentId}/location`)
      .set('Authorization', `Bearer ${driverToken}`)
      .send({
        coordinates: {
          latitude: -6.2088,
          longitude: 106.8456
        },
        speed: 25,
        address: 'On the way to first delivery, Jakarta'
      });
    
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('gpsLocation');
  });

  // 9. Deliver first item
  it('should deliver the first item', async () => {
    // Update item status to delivered
    const res = await request(app)
      .patch(`/api/delivery-items/${deliveryItemIds[0]}/status`)
      .set('Authorization', `Bearer ${driverToken}`)
      .send({ 
        status: 'delivered',
        notes: 'Delivered to recipient'
      });
    
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('delivered');
  });

  // 10. Upload proof of delivery
  it('should upload proof of delivery', async () => {
    const res = await request(app)
      .post(`/api/delivery-items/${deliveryItemIds[0]}/proof`)
      .set('Authorization', `Bearer ${driverToken}`)
      .attach('image', testProofOfDeliveryPath);
    
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('proofOfDelivery');
  });

  // 11. Capture recipient signature
  it('should capture recipient signature', async () => {
    const res = await request(app)
      .post(`/api/delivery-items/${deliveryItemIds[0]}/signature`)
      .set('Authorization', `Bearer ${driverToken}`)
      .attach('signature', testSignaturePath);
    
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('recipientSignature');
  });

  // 12. Report delivery issue for second item
  it('should report a delivery issue', async () => {
    const res = await request(app)
      .post(`/api/delivery-items/${deliveryItemIds[1]}/issues`)
      .set('Authorization', `Bearer ${driverToken}`)
      .send({
        type: 'recipient_not_available',
        description: 'Recipient not at home',
        action: 'reschedule',
        rescheduledDate: new Date(Date.now() + 86400000).toISOString() // Tomorrow
      });
    
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('failed_delivery_attempt');
    expect(res.body.data).toHaveProperty('issues');
  });

  // 13. Deliver remaining items
  it('should deliver remaining items', async () => {
    // Skip the second item (has issue) and deliver items 3-5
    for (let i = 2; i < deliveryItemIds.length; i++) {
      // Update item status to delivered
      const statusRes = await request(app)
        .patch(`/api/delivery-items/${deliveryItemIds[i]}/status`)
        .set('Authorization', `Bearer ${driverToken}`)
        .send({ 
          status: 'delivered',
          notes: `Delivered item ${i+1}`
        });
      
      expect(statusRes.statusCode).toBe(200);
      expect(statusRes.body.success).toBe(true);
      
      // Upload proof and signature
      const proofRes = await request(app)
        .post(`/api/delivery-items/${deliveryItemIds[i]}/proof`)
        .set('Authorization', `Bearer ${driverToken}`)
        .attach('image', testProofOfDeliveryPath);
      
      expect(proofRes.statusCode).toBe(200);
      
      const sigRes = await request(app)
        .post(`/api/delivery-items/${deliveryItemIds[i]}/signature`)
        .set('Authorization', `Bearer ${driverToken}`)
        .attach('signature', testSignaturePath);
      
      expect(sigRes.statusCode).toBe(200);
    }
  });

  // 14. Complete delivery assignment
  it('should complete the delivery assignment', async () => {
    const res = await request(app)
      .patch(`/api/delivery-assignments/${deliveryAssignmentId}/status`)
      .set('Authorization', `Bearer ${driverToken}`)
      .send({ 
        status: 'completed',
        notes: 'Delivery route completed with one failed attempt'
      });
    
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('completed');
    expect(res.body.data.completionRate).toBe(80); // 4 out of 5 delivered
  });

  // 15. Verify delivery assignment history
  it('should have recorded activity history for the delivery assignment', async () => {
    const res = await request(app)
      .get(`/api/delivery-assignments/${deliveryAssignmentId}/history`)
      .set('Authorization', `Bearer ${branchAdminToken}`);
    
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.data.length).toBeGreaterThanOrEqual(3); // At least assigned, in_progress, completed
  });

  // 16. Customer should be able to track their delivery
  it('should allow customer to track their delivery', async () => {
    // Get the first item's tracking code
    const itemRes = await request(app)
      .get(`/api/delivery-items/${deliveryItemIds[0]}`)
      .set('Authorization', `Bearer ${branchAdminToken}`);
    
    const trackingCode = itemRes.body.data.trackingCode;
    
    // Customer tracks the delivery
    const trackRes = await request(app)
      .get(`/api/tracking/${trackingCode}`)
      .set('Authorization', `Bearer ${customerToken}`);
    
    expect(trackRes.statusCode).toBe(200);
    expect(trackRes.body.success).toBe(true);
    expect(trackRes.body.data.status).toBe('delivered');
    expect(trackRes.body.data).toHaveProperty('deliveryHistory');
  });
});
