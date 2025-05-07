/**
 * Integration Test: Pickup Workflow (E2E)
 * Covers: Assignment, Item Pickup, Status Transitions, and RBAC
 * Tech: Jest + Supertest
 *
 * Follows project integration testing standards (see TDD Section 10, SRS Section 6.4.2)
 */

const request = require('supertest');
const app = require('../../src/index'); // Adjust if your express app entry is elsewhere
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const { setupTestDB, teardownTestDB } = require('../utils/testDB');

// Test data and variables
let dispatcherToken;
let checkerToken;
let driverToken;
let pickupAssignmentId;
let pickupItemId;
let pickupRequestIds = [];

// Mock image paths for testing file uploads
const testImagePath = path.join(__dirname, '../fixtures/test-image.jpg');
const testSignaturePath = path.join(__dirname, '../fixtures/test-signature.png');

beforeAll(async () => {
  await setupTestDB();
  
  // Login as different user roles and get tokens
  const dispatcherLogin = await request(app)
    .post('/api/auth/login')
    .send({ username: 'test_dispatcher', password: 'password123' });
  dispatcherToken = dispatcherLogin.body.data.token;
  
  const checkerLogin = await request(app)
    .post('/api/auth/login')
    .send({ username: 'test_checker', password: 'password123' });
  checkerToken = checkerLogin.body.data.token;
  
  const driverLogin = await request(app)
    .post('/api/auth/login')
    .send({ username: 'test_driver', password: 'password123' });
  driverToken = driverLogin.body.data.token;
  
  // Create test pickup requests to use in assignment
  for (let i = 0; i < 3; i++) {
    const pickupRequest = await request(app)
      .post('/api/pickup-requests')
      .set('Authorization', `Bearer ${dispatcherToken}`)
      .send({
        customerName: `Test Customer ${i}`,
        address: `Test Address ${i}`,
        contactNumber: `08123456789${i}`,
        scheduledDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
        estimatedItems: i + 1,
        notes: `Test pickup request ${i}`
      });
    pickupRequestIds.push(pickupRequest.body.data._id);
  }
});

afterAll(async () => {
  await teardownTestDB();
  await mongoose.disconnect();
});

describe('Pickup Workflow Integration', () => {
  // 1. Create pickup assignment (by dispatcher)
  it('should create a pickup assignment with route optimization', async () => {
    const res = await request(app)
      .post('/api/pickup-assignments')
      .set('Authorization', `Bearer ${dispatcherToken}`)
      .send({
        team: ['test_checker', 'test_driver'],
        vehicle: 'B1234XYZ',
        requests: pickupRequestIds,
        optimizeRoute: true
      });
    
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('_id');
    expect(res.body.data).toHaveProperty('code');
    expect(res.body.data).toHaveProperty('optimizedRoute');
    expect(res.body.data.status).toBe('assigned');
    
    pickupAssignmentId = res.body.data._id;
  });

  // 2. RBAC test - Unauthorized role should not access assignment
  it('should reject access to pickup assignment for unauthorized role', async () => {
    // Create a customer token (not authorized for pickup operations)
    const customerLogin = await request(app)
      .post('/api/auth/login')
      .send({ username: 'test_customer', password: 'password123' });
    const customerToken = customerLogin.body.data.token;
    
    const res = await request(app)
      .get(`/api/pickup-assignments/${pickupAssignmentId}`)
      .set('Authorization', `Bearer ${customerToken}`);
    
    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
  });

  // 3. Checker accepts assignment
  it('should allow checker to accept the assignment', async () => {
    const res = await request(app)
      .patch(`/api/pickup-assignments/${pickupAssignmentId}/status`)
      .set('Authorization', `Bearer ${checkerToken}`)
      .send({ status: 'in_progress' });
    
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('in_progress');
  });

  // 4. Add pickup item
  it('should add an item to the pickup assignment', async () => {
    const res = await request(app)
      .post(`/api/pickup-assignments/${pickupAssignmentId}/items`)
      .set('Authorization', `Bearer ${checkerToken}`)
      .send({
        itemCode: 'PKP-001',
        weight: 2.5,
        dimensions: { length: 30, width: 20, height: 10 },
        notes: 'Fragile item',
        category: 'electronics',
        customerReference: pickupRequestIds[0]
      });
    
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('_id');
    expect(res.body.data).toHaveProperty('volumetricWeight');
    pickupItemId = res.body.data._id;
  });

  // 5. Upload item images
  it('should upload images for the pickup item', async () => {
    const res = await request(app)
      .post(`/api/pickup-items/${pickupItemId}/images`)
      .set('Authorization', `Bearer ${checkerToken}`)
      .attach('images', testImagePath);
    
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.images).toHaveLength(1);
  });

  // 6. Capture digital signature
  it('should capture digital signature for the pickup item', async () => {
    const res = await request(app)
      .post(`/api/pickup-items/${pickupItemId}/signature`)
      .set('Authorization', `Bearer ${checkerToken}`)
      .attach('signature', testSignaturePath);
    
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('signature');
  });

  // 7. Update item status to picked up
  it('should update item status to picked up', async () => {
    const res = await request(app)
      .patch(`/api/pickup-items/${pickupItemId}/status`)
      .set('Authorization', `Bearer ${checkerToken}`)
      .send({ status: 'picked_up' });
    
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('picked_up');
  });

  // 8. Update GPS location during pickup
  it('should update GPS location during pickup', async () => {
    const res = await request(app)
      .post(`/api/pickup-assignments/${pickupAssignmentId}/location`)
      .set('Authorization', `Bearer ${driverToken}`)
      .send({
        coordinates: {
          latitude: -6.2088,
          longitude: 106.8456
        },
        speed: 0,
        address: 'Customer location, Jakarta'
      });
    
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('gpsLocation');
  });

  // 9. Complete pickup assignment
  it('should complete the pickup assignment', async () => {
    const res = await request(app)
      .patch(`/api/pickup-assignments/${pickupAssignmentId}/status`)
      .set('Authorization', `Bearer ${checkerToken}`)
      .send({ 
        status: 'completed',
        notes: 'All items picked up successfully'
      });
    
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('completed');
  });

  // 10. Verify pickup assignment history
  it('should have recorded activity history for the pickup assignment', async () => {
    const res = await request(app)
      .get(`/api/pickup-assignments/${pickupAssignmentId}/history`)
      .set('Authorization', `Bearer ${dispatcherToken}`);
    
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.data.length).toBeGreaterThanOrEqual(3); // At least created, in_progress, completed
  });

  // 11. Verify item is ready for warehouse processing
  it('should have item ready for warehouse processing', async () => {
    const res = await request(app)
      .get(`/api/pickup-items/${pickupItemId}`)
      .set('Authorization', `Bearer ${dispatcherToken}`);
    
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('picked_up');
    expect(res.body.data.readyForWarehouse).toBe(true);
  });
});
