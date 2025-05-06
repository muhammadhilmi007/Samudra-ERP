/**
 * Integration Test: Shipment Workflow (E2E)
 * Covers: Shipment Creation, Status Transitions, Tracking, and RBAC
 * Tech: Jest + Supertest
 *
 * Follows project integration testing standards (see TDD Section 10, SRS Section 6.4.2)
 */

const request = require('supertest');
const app = require('../../src/app');
const mongoose = require('mongoose');
const { setupTestDB, teardownTestDB } = require('../utils/testDB');

// Test data and variables
let adminToken;
let branchAdminToken;
let driverToken;
let shipmentId;
let originBranchId;
let destinationBranchId;
let itemIds = [];

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
  
  const driverLogin = await request(app)
    .post('/api/auth/login')
    .send({ username: 'test_driver', password: 'password123' });
  driverToken = driverLogin.body.data.token;
  
  // Get branch IDs for testing
  const branchesRes = await request(app)
    .get('/api/branches')
    .set('Authorization', `Bearer ${adminToken}`);
  
  originBranchId = branchesRes.body.data[0]._id;
  destinationBranchId = branchesRes.body.data[1]._id;
  
  // Create test items for shipment
  for (let i = 0; i < 5; i++) {
    const itemRes = await request(app)
      .post('/api/warehouse-items')
      .set('Authorization', `Bearer ${branchAdminToken}`)
      .send({
        code: `ITEM-${i}`,
        weight: 1.5 + i,
        dimensions: { length: 20, width: 15, height: 10 },
        category: 'general',
        status: 'ready_for_shipment',
        branchId: originBranchId
      });
    
    itemIds.push(itemRes.body.data._id);
  }
});

afterAll(async () => {
  await teardownTestDB();
  await mongoose.disconnect();
});

describe('Shipment Workflow Integration', () => {
  // 1. Create inter-branch shipment
  it('should create an inter-branch shipment', async () => {
    const res = await request(app)
      .post('/api/inter-branch-shipments')
      .set('Authorization', `Bearer ${branchAdminToken}`)
      .send({
        originBranchId,
        destinationBranchId,
        scheduledDepartureDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        estimatedArrivalDate: new Date(Date.now() + 172800000).toISOString(), // Day after tomorrow
        vehicle: {
          registrationNumber: 'B5678XYZ',
          type: 'truck',
          capacity: 1000 // kg
        },
        driver: 'test_driver',
        items: itemIds,
        notes: 'Test shipment'
      });
    
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('_id');
    expect(res.body.data).toHaveProperty('code');
    expect(res.body.data.status).toBe('preparing');
    
    shipmentId = res.body.data._id;
  });

  // 2. RBAC test - Unauthorized role should not access shipment
  it('should reject access to shipment for unauthorized role', async () => {
    // Create a customer token (not authorized for shipment operations)
    const customerLogin = await request(app)
      .post('/api/auth/login')
      .send({ username: 'test_customer', password: 'password123' });
    const customerToken = customerLogin.body.data.token;
    
    const res = await request(app)
      .get(`/api/inter-branch-shipments/${shipmentId}`)
      .set('Authorization', `Bearer ${customerToken}`);
    
    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
  });

  // 3. Update shipment status to departed
  it('should update shipment status to departed', async () => {
    const res = await request(app)
      .patch(`/api/inter-branch-shipments/${shipmentId}/status`)
      .set('Authorization', `Bearer ${branchAdminToken}`)
      .send({ 
        status: 'departed',
        notes: 'Shipment departed on schedule'
      });
    
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('departed');
  });

  // 4. Add checkpoint to shipment
  it('should add a checkpoint to the shipment', async () => {
    const res = await request(app)
      .post(`/api/inter-branch-shipments/${shipmentId}/checkpoints`)
      .set('Authorization', `Bearer ${driverToken}`)
      .send({
        name: 'Rest Area KM 50',
        estimatedArrivalTime: new Date(Date.now() + 10800000).toISOString(), // 3 hours from now
        notes: 'Scheduled rest stop'
      });
    
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.checkpoints).toHaveLength(1);
  });

  // 5. Update GPS location during transit
  it('should update GPS location during transit', async () => {
    const res = await request(app)
      .post(`/api/inter-branch-shipments/${shipmentId}/location`)
      .set('Authorization', `Bearer ${driverToken}`)
      .send({
        coordinates: {
          latitude: -6.5088,
          longitude: 106.9456
        },
        speed: 60,
        address: 'Highway KM 30, Bogor'
      });
    
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('gpsLocation');
  });

  // 6. Report issue during transit
  it('should report an issue during transit', async () => {
    const res = await request(app)
      .post(`/api/inter-branch-shipments/${shipmentId}/issues`)
      .set('Authorization', `Bearer ${driverToken}`)
      .send({
        type: 'delay',
        description: 'Traffic jam on highway',
        severity: 'medium',
        estimatedResolutionTime: 60 // minutes
      });
    
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.issues).toHaveLength(1);
  });

  // 7. Resolve reported issue
  it('should resolve the reported issue', async () => {
    const getRes = await request(app)
      .get(`/api/inter-branch-shipments/${shipmentId}`)
      .set('Authorization', `Bearer ${driverToken}`);
    
    const issueId = getRes.body.data.issues[0]._id;
    
    const res = await request(app)
      .patch(`/api/inter-branch-shipments/${shipmentId}/issues/${issueId}`)
      .set('Authorization', `Bearer ${driverToken}`)
      .send({
        status: 'resolved',
        resolutionNotes: 'Traffic cleared, back on schedule'
      });
    
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.issues[0].status).toBe('resolved');
  });

  // 8. Update shipment status to in_transit
  it('should update shipment status to in_transit', async () => {
    const res = await request(app)
      .patch(`/api/inter-branch-shipments/${shipmentId}/status`)
      .set('Authorization', `Bearer ${driverToken}`)
      .send({ 
        status: 'in_transit',
        notes: 'On the road to destination'
      });
    
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('in_transit');
  });

  // 9. Update shipment status to arrived_at_destination
  it('should update shipment status to arrived_at_destination', async () => {
    const res = await request(app)
      .patch(`/api/inter-branch-shipments/${shipmentId}/status`)
      .set('Authorization', `Bearer ${driverToken}`)
      .send({ 
        status: 'arrived_at_destination',
        notes: 'Arrived at destination branch'
      });
    
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('arrived_at_destination');
  });

  // 10. Update shipment status to unloaded by destination branch admin
  it('should update shipment status to unloaded', async () => {
    // Get destination branch admin token
    const destBranchAdminLogin = await request(app)
      .post('/api/auth/login')
      .send({ username: 'test_dest_branch_admin', password: 'password123' });
    const destBranchAdminToken = destBranchAdminLogin.body.data.token;
    
    const res = await request(app)
      .patch(`/api/inter-branch-shipments/${shipmentId}/status`)
      .set('Authorization', `Bearer ${destBranchAdminToken}`)
      .send({ 
        status: 'unloaded',
        notes: 'All items unloaded and verified'
      });
    
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('unloaded');
  });

  // 11. Complete the shipment
  it('should complete the shipment', async () => {
    // Get destination branch admin token
    const destBranchAdminLogin = await request(app)
      .post('/api/auth/login')
      .send({ username: 'test_dest_branch_admin', password: 'password123' });
    const destBranchAdminToken = destBranchAdminLogin.body.data.token;
    
    const res = await request(app)
      .patch(`/api/inter-branch-shipments/${shipmentId}/status`)
      .set('Authorization', `Bearer ${destBranchAdminToken}`)
      .send({ 
        status: 'completed',
        notes: 'Shipment completed successfully'
      });
    
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('completed');
  });

  // 12. Verify shipment history
  it('should have recorded activity history for the shipment', async () => {
    const res = await request(app)
      .get(`/api/inter-branch-shipments/${shipmentId}/history`)
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.data.length).toBeGreaterThanOrEqual(5); // At least 5 status changes
  });

  // 13. Verify items have been transferred to destination branch
  it('should have items transferred to destination branch', async () => {
    // Check one of the items
    const res = await request(app)
      .get(`/api/warehouse-items/${itemIds[0]}`)
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.branchId).toBe(destinationBranchId);
    expect(res.body.data.status).toBe('in_inventory');
  });
});
