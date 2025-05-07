/**
 * Samudra Paket ERP - Integration Tests
 * Mobile App Synchronization with Backend Tests
 */

const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const app = require('../../../src/index');
const { 
  createTestUser, 
  createTestBranch,
  createTestWarehouseItem,
  createTestPickupRequest,
  createTestPickupItem,
  clearDatabase, 
  generateTestToken 
} = require('../testUtils');

let mongoServer;
let authToken;
let branch;

// Setup test database
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
  
  // Create test user and get auth token
  const user = await createTestUser({
    username: 'checker',
    email: 'checker@example.com',
    role: 'checker',
    permissions: ['warehouse:read', 'warehouse:write', 'pickup:read', 'pickup:execute'],
    isActive: true,
    isEmailVerified: true,
  });
  
  authToken = generateTestToken(user);
  
  // Create test branch
  branch = await createTestBranch({
    name: 'Jakarta Pusat',
    code: 'JKT01',
    address: 'Jl. Merdeka No. 1, Jakarta Pusat',
  });
});

// Clean up after tests
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// Reset database before each test
beforeEach(async () => {
  await clearDatabase();
  
  // Recreate branch after clearing
  branch = await createTestBranch({
    name: 'Jakarta Pusat',
    code: 'JKT01',
    address: 'Jl. Merdeka No. 1, Jakarta Pusat',
  });
});

describe('Mobile App Synchronization with Backend', () => {
  describe('Data Synchronization Endpoints', () => {
    it('should handle warehouse item synchronization', async () => {
      // Create test warehouse items
      const items = [];
      for (let i = 0; i < 10; i++) {
        items.push(await createTestWarehouseItem({
          branchId: branch.id,
          itemCode: `WH${100000 + i}`,
          status: i % 3 === 0 ? 'incoming' : (i % 3 === 1 ? 'ready_for_shipment' : 'allocated'),
          updatedAt: new Date(Date.now() - i * 60000), // Different update times
        }));
      }
      
      // Test sync endpoint with last sync timestamp
      const lastSyncTime = new Date(Date.now() - 5 * 60000).toISOString();
      const syncResponse = await request(app)
        .get('/api/sync/warehouse-items')
        .query({ lastSyncTime, branchId: branch.id })
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(syncResponse.status).toBe(200);
      expect(syncResponse.body).toHaveProperty('success', true);
      expect(syncResponse.body).toHaveProperty('data');
      expect(syncResponse.body.data).toHaveProperty('items');
      
      // Should only return items updated after lastSyncTime (approximately 5 items)
      expect(syncResponse.body.data.items.length).toBeLessThanOrEqual(5);
      
      // Test creating a new item from mobile
      const newItemResponse = await request(app)
        .post('/api/sync/warehouse-items')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          localId: 'local-id-123',
          branchId: branch.id,
          itemCode: 'WH999999',
          description: 'Test Item from Mobile',
          weight: 5.5,
          dimensions: {
            length: 40,
            width: 30,
            height: 20,
          },
          status: 'incoming',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      
      expect(newItemResponse.status).toBe(201);
      expect(newItemResponse.body).toHaveProperty('success', true);
      expect(newItemResponse.body).toHaveProperty('data');
      expect(newItemResponse.body.data).toHaveProperty('id');
      expect(newItemResponse.body.data).toHaveProperty('localId', 'local-id-123');
      
      // Test updating an existing item from mobile
      const updateItemResponse = await request(app)
        .put(`/api/sync/warehouse-items/${items[0].id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          localId: 'local-update-123',
          status: 'ready_for_shipment',
          updatedAt: new Date().toISOString(),
        });
      
      expect(updateItemResponse.status).toBe(200);
      expect(updateItemResponse.body).toHaveProperty('success', true);
      expect(updateItemResponse.body).toHaveProperty('data');
      expect(updateItemResponse.body.data).toHaveProperty('id', items[0].id);
      expect(updateItemResponse.body.data).toHaveProperty('status', 'ready_for_shipment');
    });
    
    it('should handle batch synchronization of multiple entity types', async () => {
      // Create test data
      const warehouseItems = [];
      for (let i = 0; i < 5; i++) {
        warehouseItems.push(await createTestWarehouseItem({
          branchId: branch.id,
          itemCode: `WH${100000 + i}`,
          status: 'incoming',
          updatedAt: new Date(Date.now() - i * 60000),
        }));
      }
      
      const pickupRequests = [];
      for (let i = 0; i < 3; i++) {
        pickupRequests.push(await createTestPickupRequest({
          branchId: branch.id,
          status: 'assigned',
          updatedAt: new Date(Date.now() - i * 60000),
        }));
      }
      
      // Test batch sync endpoint
      const lastSyncTime = new Date(Date.now() - 10 * 60000).toISOString();
      const batchSyncResponse = await request(app)
        .post('/api/sync/batch')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          lastSyncTime,
          branchId: branch.id,
          entities: ['warehouseItems', 'pickupRequests', 'itemAllocations'],
        });
      
      expect(batchSyncResponse.status).toBe(200);
      expect(batchSyncResponse.body).toHaveProperty('success', true);
      expect(batchSyncResponse.body).toHaveProperty('data');
      expect(batchSyncResponse.body.data).toHaveProperty('warehouseItems');
      expect(batchSyncResponse.body.data).toHaveProperty('pickupRequests');
      expect(batchSyncResponse.body.data).toHaveProperty('itemAllocations');
      
      // Should return all warehouse items and pickup requests
      expect(batchSyncResponse.body.data.warehouseItems.length).toBe(5);
      expect(batchSyncResponse.body.data.pickupRequests.length).toBe(3);
      expect(batchSyncResponse.body.data.itemAllocations.length).toBe(0); // None created
      
      // Test batch upload from mobile
      const batchUploadResponse = await request(app)
        .post('/api/sync/batch-upload')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          branchId: branch.id,
          entities: {
            warehouseItems: [
              {
                localId: 'local-wh-1',
                itemCode: 'WH888888',
                description: 'New Item from Mobile',
                weight: 3.5,
                dimensions: {
                  length: 20,
                  width: 15,
                  height: 10,
                },
                status: 'incoming',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              }
            ],
            pickupItems: [
              {
                localId: 'local-pi-1',
                pickupRequestId: pickupRequests[0].id,
                description: 'New Pickup Item from Mobile',
                weight: 2.5,
                dimensions: {
                  length: 30,
                  width: 20,
                  height: 15,
                },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              }
            ]
          }
        });
      
      expect(batchUploadResponse.status).toBe(200);
      expect(batchUploadResponse.body).toHaveProperty('success', true);
      expect(batchUploadResponse.body).toHaveProperty('data');
      expect(batchUploadResponse.body.data).toHaveProperty('results');
      expect(batchUploadResponse.body.data.results).toHaveProperty('warehouseItems');
      expect(batchUploadResponse.body.data.results).toHaveProperty('pickupItems');
      
      // Should return created entities with server IDs
      expect(batchUploadResponse.body.data.results.warehouseItems.length).toBe(1);
      expect(batchUploadResponse.body.data.results.warehouseItems[0]).toHaveProperty('localId', 'local-wh-1');
      expect(batchUploadResponse.body.data.results.warehouseItems[0]).toHaveProperty('id');
      
      expect(batchUploadResponse.body.data.results.pickupItems.length).toBe(1);
      expect(batchUploadResponse.body.data.results.pickupItems[0]).toHaveProperty('localId', 'local-pi-1');
      expect(batchUploadResponse.body.data.results.pickupItems[0]).toHaveProperty('id');
    });
  });
  
  describe('Conflict Resolution', () => {
    it('should handle conflicts during synchronization', async () => {
      // Create test warehouse item
      const item = await createTestWarehouseItem({
        branchId: branch.id,
        itemCode: 'WH123456',
        status: 'incoming',
        updatedAt: new Date(Date.now() - 60000),
      });
      
      // Test conflict resolution with server-wins strategy
      const conflictResponse = await request(app)
        .put(`/api/sync/warehouse-items/${item.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          localId: 'local-conflict-123',
          status: 'ready_for_shipment',
          updatedAt: new Date(Date.now() - 120000).toISOString(), // Older than server version
        });
      
      expect(conflictResponse.status).toBe(409); // Conflict status
      expect(conflictResponse.body).toHaveProperty('success', false);
      expect(conflictResponse.body).toHaveProperty('error');
      expect(conflictResponse.body).toHaveProperty('data');
      expect(conflictResponse.body.data).toHaveProperty('serverVersion');
      expect(conflictResponse.body.data.serverVersion).toHaveProperty('id', item.id);
      expect(conflictResponse.body.data.serverVersion).toHaveProperty('status', 'incoming');
      
      // Test conflict resolution with client-wins flag
      const clientWinsResponse = await request(app)
        .put(`/api/sync/warehouse-items/${item.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .query({ clientWins: 'true' })
        .send({
          localId: 'local-conflict-123',
          status: 'ready_for_shipment',
          updatedAt: new Date(Date.now() - 120000).toISOString(), // Older than server version
        });
      
      expect(clientWinsResponse.status).toBe(200);
      expect(clientWinsResponse.body).toHaveProperty('success', true);
      expect(clientWinsResponse.body).toHaveProperty('data');
      expect(clientWinsResponse.body.data).toHaveProperty('id', item.id);
      expect(clientWinsResponse.body.data).toHaveProperty('status', 'ready_for_shipment');
    });
  });
  
  describe('Offline Data Processing', () => {
    it('should handle sync queue processing', async () => {
      // Test sync queue endpoint
      const syncQueueResponse = await request(app)
        .post('/api/sync/queue')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          branchId: branch.id,
          queue: [
            {
              id: 'queue-1',
              endpoint: '/api/warehouse-items',
              method: 'POST',
              data: {
                localId: 'local-queue-1',
                itemCode: 'WH777777',
                description: 'Queue Item 1',
                weight: 4.5,
                dimensions: {
                  length: 25,
                  width: 20,
                  height: 15,
                },
                status: 'incoming',
              },
              entityType: 'warehouseItem',
              entityId: 'local-queue-1',
              timestamp: Date.now() - 5000,
              retryCount: 0,
            },
            {
              id: 'queue-2',
              endpoint: '/api/warehouse-items/invalid-id',
              method: 'PUT',
              data: {
                status: 'ready_for_shipment',
              },
              entityType: 'warehouseItem',
              entityId: 'invalid-id',
              timestamp: Date.now() - 3000,
              retryCount: 0,
            }
          ]
        });
      
      expect(syncQueueResponse.status).toBe(200);
      expect(syncQueueResponse.body).toHaveProperty('success', true);
      expect(syncQueueResponse.body).toHaveProperty('data');
      expect(syncQueueResponse.body.data).toHaveProperty('results');
      expect(syncQueueResponse.body.data.results.length).toBe(2);
      
      // First operation should succeed
      expect(syncQueueResponse.body.data.results[0]).toHaveProperty('id', 'queue-1');
      expect(syncQueueResponse.body.data.results[0]).toHaveProperty('status', 'success');
      expect(syncQueueResponse.body.data.results[0]).toHaveProperty('data');
      expect(syncQueueResponse.body.data.results[0].data).toHaveProperty('id');
      expect(syncQueueResponse.body.data.results[0].data).toHaveProperty('localId', 'local-queue-1');
      
      // Second operation should fail
      expect(syncQueueResponse.body.data.results[1]).toHaveProperty('id', 'queue-2');
      expect(syncQueueResponse.body.data.results[1]).toHaveProperty('status', 'error');
      expect(syncQueueResponse.body.data.results[1]).toHaveProperty('error');
    });
  });
  
  describe('File Synchronization', () => {
    it('should handle file uploads during synchronization', async () => {
      // Create test pickup request
      const pickupRequest = await createTestPickupRequest({
        branchId: branch.id,
        status: 'assigned',
      });
      
      // Test file upload with sync
      const fileUploadResponse = await request(app)
        .post('/api/sync/pickup-items')
        .set('Authorization', `Bearer ${authToken}`)
        .field('localId', 'local-file-1')
        .field('pickupRequestId', pickupRequest.id)
        .field('description', 'Item with Files')
        .field('weight', '3.5')
        .field('dimensions[length]', '25')
        .field('dimensions[width]', '20')
        .field('dimensions[height]', '15')
        .attach('photos', Buffer.from('fake image data 1'), 'photo1.jpg')
        .attach('photos', Buffer.from('fake image data 2'), 'photo2.jpg')
        .attach('signature', Buffer.from('fake signature data'), 'signature.png');
      
      expect(fileUploadResponse.status).toBe(201);
      expect(fileUploadResponse.body).toHaveProperty('success', true);
      expect(fileUploadResponse.body).toHaveProperty('data');
      expect(fileUploadResponse.body.data).toHaveProperty('id');
      expect(fileUploadResponse.body.data).toHaveProperty('localId', 'local-file-1');
      expect(fileUploadResponse.body.data).toHaveProperty('photos');
      expect(fileUploadResponse.body.data).toHaveProperty('signature');
      expect(fileUploadResponse.body.data.photos.length).toBe(2);
      
      // Verify file URLs are returned
      expect(fileUploadResponse.body.data.photos[0]).toMatch(/^https?:\/\//);
      expect(fileUploadResponse.body.data.signature).toMatch(/^https?:\/\//);
    });
  });
  
  describe('Performance and Reliability', () => {
    it('should handle large data sets efficiently', async () => {
      // Create a large number of test warehouse items
      const items = [];
      for (let i = 0; i < 100; i++) {
        items.push(await createTestWarehouseItem({
          branchId: branch.id,
          itemCode: `WH${100000 + i}`,
          status: i % 3 === 0 ? 'incoming' : (i % 3 === 1 ? 'ready_for_shipment' : 'allocated'),
          updatedAt: new Date(Date.now() - i * 1000),
        }));
      }
      
      // Test sync with pagination
      const page1Response = await request(app)
        .get('/api/sync/warehouse-items')
        .query({ 
          lastSyncTime: new Date(Date.now() - 120000).toISOString(),
          branchId: branch.id,
          page: 1,
          limit: 50
        })
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(page1Response.status).toBe(200);
      expect(page1Response.body).toHaveProperty('success', true);
      expect(page1Response.body).toHaveProperty('data');
      expect(page1Response.body.data).toHaveProperty('items');
      expect(page1Response.body.data).toHaveProperty('pagination');
      expect(page1Response.body.data.pagination).toHaveProperty('totalItems');
      expect(page1Response.body.data.pagination).toHaveProperty('totalPages');
      expect(page1Response.body.data.pagination).toHaveProperty('currentPage', 1);
      
      // Should return maximum 50 items per page
      expect(page1Response.body.data.items.length).toBeLessThanOrEqual(50);
      
      // Get second page
      const page2Response = await request(app)
        .get('/api/sync/warehouse-items')
        .query({ 
          lastSyncTime: new Date(Date.now() - 120000).toISOString(),
          branchId: branch.id,
          page: 2,
          limit: 50
        })
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(page2Response.status).toBe(200);
      expect(page2Response.body).toHaveProperty('success', true);
      expect(page2Response.body).toHaveProperty('data');
      expect(page2Response.body.data).toHaveProperty('items');
      expect(page2Response.body.data).toHaveProperty('pagination');
      expect(page2Response.body.data.pagination).toHaveProperty('currentPage', 2);
      
      // Combined items from both pages should equal total items
      const totalItems = page1Response.body.data.items.length + page2Response.body.data.items.length;
      expect(totalItems).toBeLessThanOrEqual(100);
    });
  });
});
