/**
 * Samudra Paket ERP - Integration Tests
 * Performance Testing for Warehouse Operational Endpoints
 */

const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

// Import models to ensure they're registered with Mongoose
require('../../../src/domain/models/user');
require('../../../src/domain/models/branch');
require('../../../src/domain/models/warehouseItem');
require('../../../src/domain/models/itemAllocation');
require('../../../src/domain/models/loadingManifest');
const { 
  createTestUser, 
  createTestBranch,
  createTestWarehouseItem,
  createTestShipment,
  createTestItemAllocation,
  createTestLoadingManifest,
  clearDatabase, 
  generateTestToken 
} = require('../../testUtils');

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
    username: 'admin',
    email: 'admin@example.com',
    role: 'admin',
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

/**
 * Helper function to measure response time
 * @param {Function} requestFn - Function that returns a supertest request
 * @returns {Promise<number>} Response time in milliseconds
 */
const measureResponseTime = async (requestFn) => {
  const startTime = Date.now();
  await requestFn();
  return Date.now() - startTime;
};

/**
 * Helper function to run multiple requests and calculate average response time
 * @param {Function} requestFn - Function that returns a supertest request
 * @param {number} iterations - Number of iterations to run
 * @returns {Promise<number>} Average response time in milliseconds
 */
const calculateAverageResponseTime = async (requestFn, iterations = 5) => {
  let totalResponseTime = 0;
  
  for (let i = 0; i < iterations; i++) {
    const responseTime = await measureResponseTime(requestFn);
    totalResponseTime += responseTime;
  }
  
  return totalResponseTime / iterations;
};

describe('Performance Testing for Warehouse Operational Endpoints', () => {
  describe('Warehouse Item Endpoints', () => {
    it('should handle warehouse item creation within acceptable time', async () => {
      // Create destination branch
      const destinationBranch = await createTestBranch({
        name: 'Surabaya',
        code: 'SBY01',
        address: 'Jl. Pemuda No. 10, Surabaya',
      });
      
      // Create warehouse item function
      const createWarehouseItemFn = () => {
        return request(app)
          .post('/api/warehouse-items')
          .set('Authorization', `Bearer ${authToken}`)
          .field('source', 'pickup')
          .field('sourceId', 'PU12345678')
          .field('description', 'Electronics Package')
          .field('weight', '5.5')
          .field('length', '40')
          .field('width', '30')
          .field('height', '20')
          .field('branchId', branch.id)
          .field('destinationBranchId', destinationBranch.id)
          .field('serviceType', 'regular')
          .attach('photos', Buffer.from('fake image data'), 'test-image.jpg');
      };
      
      // Measure average response time
      const avgResponseTime = await calculateAverageResponseTime(createWarehouseItemFn);
      
      // Response time should be under 250ms for warehouse item creation with file upload
      expect(avgResponseTime).toBeLessThan(250);
    });
    
    it('should handle warehouse item listing with pagination within acceptable time', async () => {
      // Create destination branch
      const destinationBranch = await createTestBranch({
        name: 'Surabaya',
        code: 'SBY01',
        address: 'Jl. Pemuda No. 10, Surabaya',
      });
      
      // Create 100 test warehouse items
      const createItems = [];
      for (let i = 0; i < 100; i++) {
        createItems.push(createTestWarehouseItem({
          branchId: branch.id,
          destinationBranchId: destinationBranch.id,
          status: i % 4 === 0 ? 'incoming' : (i % 4 === 1 ? 'ready_for_shipment' : (i % 4 === 2 ? 'allocated' : 'in_transit')),
        }));
      }
      
      await Promise.all(createItems);
      
      // List warehouse items function with pagination
      const listWarehouseItemsFn = () => {
        return request(app)
          .get('/api/warehouse-items')
          .query({ page: 1, limit: 20, branchId: branch.id })
          .set('Authorization', `Bearer ${authToken}`);
      };
      
      // Measure average response time
      const avgResponseTime = await calculateAverageResponseTime(listWarehouseItemsFn);
      
      // Response time should be under 200ms for paginated warehouse item listing
      expect(avgResponseTime).toBeLessThan(200);
    });
    
    it('should handle warehouse item filtering and sorting within acceptable time', async () => {
      // Create destination branch
      const destinationBranch = await createTestBranch({
        name: 'Surabaya',
        code: 'SBY01',
        address: 'Jl. Pemuda No. 10, Surabaya',
      });
      
      // Create 100 test warehouse items with different statuses and dates
      const createItems = [];
      for (let i = 0; i < 100; i++) {
        const day = 1 + Math.floor(i / 20);
        createItems.push(createTestWarehouseItem({
          branchId: branch.id,
          destinationBranchId: destinationBranch.id,
          status: i % 4 === 0 ? 'incoming' : (i % 4 === 1 ? 'ready_for_shipment' : (i % 4 === 2 ? 'allocated' : 'in_transit')),
          createdAt: `2025-05-${day < 10 ? '0' + day : day}T10:00:00Z`,
        }));
      }
      
      await Promise.all(createItems);
      
      // Filter and sort warehouse items function
      const filterWarehouseItemsFn = () => {
        return request(app)
          .get('/api/warehouse-items')
          .query({ 
            status: 'ready_for_shipment', 
            branchId: branch.id,
            destinationBranchId: destinationBranch.id,
            startDate: '2025-05-01', 
            endDate: '2025-05-05',
            sort: 'createdAt',
            order: 'desc'
          })
          .set('Authorization', `Bearer ${authToken}`);
      };
      
      // Measure average response time
      const avgResponseTime = await calculateAverageResponseTime(filterWarehouseItemsFn);
      
      // Response time should be under 200ms for filtered and sorted warehouse item listing
      expect(avgResponseTime).toBeLessThan(200);
    });
    
    it('should handle barcode scanning lookup within acceptable time', async () => {
      // Create destination branch
      const destinationBranch = await createTestBranch({
        name: 'Surabaya',
        code: 'SBY01',
        address: 'Jl. Pemuda No. 10, Surabaya',
      });
      
      // Create test warehouse item with specific item code
      const warehouseItem = await createTestWarehouseItem({
        branchId: branch.id,
        destinationBranchId: destinationBranch.id,
        itemCode: 'WH12345678',
        status: 'ready_for_shipment',
      });
      
      // Barcode scanning lookup function
      const barcodeScanFn = () => {
        return request(app)
          .get('/api/warehouse-items/barcode/WH12345678')
          .set('Authorization', `Bearer ${authToken}`);
      };
      
      // Measure average response time
      const avgResponseTime = await calculateAverageResponseTime(barcodeScanFn);
      
      // Response time should be under 100ms for barcode scanning lookup
      expect(avgResponseTime).toBeLessThan(100);
    });
  });
  
  describe('Item Allocation Endpoints', () => {
    it('should handle item allocation creation within acceptable time', async () => {
      // Create destination branch
      const destinationBranch = await createTestBranch({
        name: 'Surabaya',
        code: 'SBY01',
        address: 'Jl. Pemuda No. 10, Surabaya',
      });
      
      // Create test shipment
      const shipment = await createTestShipment({
        originBranchId: branch.id,
        destinationBranchId: destinationBranch.id,
        status: 'preparing',
      });
      
      // Create test warehouse items
      const items = [];
      for (let i = 0; i < 20; i++) {
        items.push(await createTestWarehouseItem({
          branchId: branch.id,
          destinationBranchId: destinationBranch.id,
          status: 'ready_for_shipment',
        }));
      }
      
      // Create item allocation function
      const createItemAllocationFn = () => {
        return request(app)
          .post('/api/item-allocations')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            shipmentId: shipment.id,
            itemIds: items.map(item => item.id),
            notes: 'Test allocation',
          });
      };
      
      // Measure average response time
      const avgResponseTime = await calculateAverageResponseTime(createItemAllocationFn);
      
      // Response time should be under 300ms for item allocation creation with 20 items
      expect(avgResponseTime).toBeLessThan(300);
    });
  });
  
  describe('Loading Management Endpoints', () => {
    it('should handle loading manifest creation within acceptable time', async () => {
      // Create destination branch
      const destinationBranch = await createTestBranch({
        name: 'Surabaya',
        code: 'SBY01',
        address: 'Jl. Pemuda No. 10, Surabaya',
      });
      
      // Create test shipment
      const shipment = await createTestShipment({
        originBranchId: branch.id,
        destinationBranchId: destinationBranch.id,
        status: 'preparing',
      });
      
      // Create test warehouse items
      const items = [];
      for (let i = 0; i < 30; i++) {
        items.push(await createTestWarehouseItem({
          branchId: branch.id,
          destinationBranchId: destinationBranch.id,
          status: 'ready_for_shipment',
        }));
      }
      
      // Create test item allocations
      for (const item of items) {
        await createTestItemAllocation({
          shipmentId: shipment.id,
          itemId: item.id,
          status: 'allocated',
        });
      }
      
      // Create loading manifest function
      const createLoadingManifestFn = () => {
        return request(app)
          .post('/api/loading-manifests')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            shipmentId: shipment.id,
            branchId: branch.id,
            notes: 'Test loading manifest',
          });
      };
      
      // Measure average response time
      const avgResponseTime = await calculateAverageResponseTime(createLoadingManifestFn);
      
      // Response time should be under 300ms for loading manifest creation with 30 items
      expect(avgResponseTime).toBeLessThan(300);
    });
    
    it('should handle batch scanning within acceptable time', async () => {
      // Create destination branch
      const destinationBranch = await createTestBranch({
        name: 'Surabaya',
        code: 'SBY01',
        address: 'Jl. Pemuda No. 10, Surabaya',
      });
      
      // Create test shipment
      const shipment = await createTestShipment({
        originBranchId: branch.id,
        destinationBranchId: destinationBranch.id,
        status: 'preparing',
      });
      
      // Create test warehouse item with specific item code
      const warehouseItem = await createTestWarehouseItem({
        branchId: branch.id,
        destinationBranchId: destinationBranch.id,
        itemCode: 'WH12345678',
        status: 'allocated',
      });
      
      // Create test item allocation
      await createTestItemAllocation({
        shipmentId: shipment.id,
        itemId: warehouseItem.id,
        status: 'allocated',
      });
      
      // Create test loading manifest
      const loadingManifest = await createTestLoadingManifest({
        shipmentId: shipment.id,
        branchId: branch.id,
        status: 'in_progress',
      });
      
      // Batch scanning function
      const batchScanFn = () => {
        return request(app)
          .post(`/api/loading-manifests/${loadingManifest.id}/scan`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            itemCode: 'WH12345678',
          });
      };
      
      // Measure average response time
      const avgResponseTime = await calculateAverageResponseTime(batchScanFn);
      
      // Response time should be under 150ms for batch scanning
      expect(avgResponseTime).toBeLessThan(150);
    });
    
    it('should handle loading manifest completion within acceptable time', async () => {
      // Create destination branch
      const destinationBranch = await createTestBranch({
        name: 'Surabaya',
        code: 'SBY01',
        address: 'Jl. Pemuda No. 10, Surabaya',
      });
      
      // Create test shipment
      const shipment = await createTestShipment({
        originBranchId: branch.id,
        destinationBranchId: destinationBranch.id,
        status: 'preparing',
      });
      
      // Create test loading manifest
      const loadingManifest = await createTestLoadingManifest({
        shipmentId: shipment.id,
        branchId: branch.id,
        status: 'in_progress',
      });
      
      // Complete loading manifest function
      const completeLoadingManifestFn = () => {
        return request(app)
          .patch(`/api/loading-manifests/${loadingManifest.id}/status`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            status: 'completed',
            notes: 'All items loaded',
          });
      };
      
      // Measure average response time
      const avgResponseTime = await calculateAverageResponseTime(completeLoadingManifestFn);
      
      // Response time should be under 200ms for loading manifest completion
      expect(avgResponseTime).toBeLessThan(200);
    });
  });
  
  describe('Inventory Management Endpoints', () => {
    it('should handle inventory report generation within acceptable time', async () => {
      // Create destination branch
      const destinationBranch = await createTestBranch({
        name: 'Surabaya',
        code: 'SBY01',
        address: 'Jl. Pemuda No. 10, Surabaya',
      });
      
      // Create 200 test warehouse items with different statuses
      const createItems = [];
      for (let i = 0; i < 200; i++) {
        createItems.push(createTestWarehouseItem({
          branchId: branch.id,
          destinationBranchId: destinationBranch.id,
          status: i % 4 === 0 ? 'incoming' : (i % 4 === 1 ? 'ready_for_shipment' : (i % 4 === 2 ? 'allocated' : 'in_transit')),
        }));
      }
      
      await Promise.all(createItems);
      
      // Generate inventory report function
      const generateInventoryReportFn = () => {
        return request(app)
          .get('/api/warehouse/inventory-report')
          .query({ branchId: branch.id })
          .set('Authorization', `Bearer ${authToken}`);
      };
      
      // Measure average response time
      const avgResponseTime = await calculateAverageResponseTime(generateInventoryReportFn);
      
      // Response time should be under 300ms for inventory report generation with 200 items
      expect(avgResponseTime).toBeLessThan(300);
    });
  });
});
