/**
 * Samudra Paket ERP - Integration Tests
 * Performance Testing for Shipment Operational Endpoints
 */

const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const app = require('../../../../src/app');
const { 
  createTestUser, 
  createTestBranch,
  createTestVehicle,
  createTestEmployee,
  createTestWarehouseItem,
  createTestShipment,
  clearDatabase, 
  generateTestToken 
} = require('../../testUtils');

let mongoServer;
let authToken;
let originBranch;
let destinationBranch;

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
  
  // Create test branches
  originBranch = await createTestBranch({
    name: 'Jakarta Pusat',
    code: 'JKT01',
    address: 'Jl. Merdeka No. 1, Jakarta Pusat',
  });
  
  destinationBranch = await createTestBranch({
    name: 'Surabaya',
    code: 'SBY01',
    address: 'Jl. Pemuda No. 10, Surabaya',
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
  
  // Recreate branches after clearing
  originBranch = await createTestBranch({
    name: 'Jakarta Pusat',
    code: 'JKT01',
    address: 'Jl. Merdeka No. 1, Jakarta Pusat',
  });
  
  destinationBranch = await createTestBranch({
    name: 'Surabaya',
    code: 'SBY01',
    address: 'Jl. Pemuda No. 10, Surabaya',
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

describe('Performance Testing for Shipment Operational Endpoints', () => {
  describe('Inter-Branch Shipment Endpoints', () => {
    it('should handle shipment creation within acceptable time', async () => {
      // Create test vehicle
      const vehicle = await createTestVehicle();
      
      // Create test employees
      const driver = await createTestEmployee({ position: 'driver' });
      const helper = await createTestEmployee({ position: 'helper' });
      
      // Create test warehouse items
      const items = [];
      for (let i = 0; i < 20; i++) {
        items.push(await createTestWarehouseItem({
          status: 'ready_for_shipment',
          destinationBranchId: destinationBranch.id,
        }));
      }
      
      // Create shipment function
      const createShipmentFn = () => {
        return request(app)
          .post('/api/inter-branch-shipments')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            originBranchId: originBranch.id,
            destinationBranchId: destinationBranch.id,
            departureDate: '2025-05-15',
            departureTime: '08:00',
            estimatedArrivalDate: '2025-05-16',
            estimatedArrivalTime: '14:00',
            vehicleId: vehicle.id,
            driverId: driver.id,
            helperId: helper.id,
            itemIds: items.map(item => item.id),
            checkpoints: [
              {
                location: 'Semarang',
                estimatedArrivalDate: '2025-05-15',
                estimatedArrivalTime: '18:00',
                notes: 'Rest and refuel',
              },
              {
                location: 'Madiun',
                estimatedArrivalDate: '2025-05-16',
                estimatedArrivalTime: '06:00',
                notes: 'Driver change',
              }
            ],
            notes: 'Test shipment',
          });
      };
      
      // Measure average response time
      const avgResponseTime = await calculateAverageResponseTime(createShipmentFn);
      
      // Response time should be under 300ms for shipment creation with 20 items
      expect(avgResponseTime).toBeLessThan(300);
    });
    
    it('should handle shipment listing with pagination within acceptable time', async () => {
      // Create test vehicle
      const vehicle = await createTestVehicle();
      
      // Create test employees
      const driver = await createTestEmployee({ position: 'driver' });
      
      // Create 30 test shipments
      const createShipments = [];
      for (let i = 0; i < 30; i++) {
        const day = 10 + Math.floor(i / 10);
        createShipments.push(createTestShipment({
          originBranchId: originBranch.id,
          destinationBranchId: destinationBranch.id,
          departureDate: `2025-05-${day}`,
          vehicleId: vehicle.id,
          driverId: driver.id,
          status: i % 4 === 0 ? 'preparing' : (i % 4 === 1 ? 'departed' : (i % 4 === 2 ? 'in_transit' : 'completed')),
        }));
      }
      
      await Promise.all(createShipments);
      
      // List shipments function with pagination
      const listShipmentsFn = () => {
        return request(app)
          .get('/api/inter-branch-shipments')
          .query({ page: 1, limit: 10 })
          .set('Authorization', `Bearer ${authToken}`);
      };
      
      // Measure average response time
      const avgResponseTime = await calculateAverageResponseTime(listShipmentsFn);
      
      // Response time should be under 150ms for paginated shipment listing
      expect(avgResponseTime).toBeLessThan(150);
    });
    
    it('should handle shipment filtering and sorting within acceptable time', async () => {
      // Create test vehicle
      const vehicle = await createTestVehicle();
      
      // Create test employees
      const driver = await createTestEmployee({ position: 'driver' });
      
      // Create 30 test shipments with different statuses and dates
      const createShipments = [];
      for (let i = 0; i < 30; i++) {
        const day = 10 + Math.floor(i / 10);
        createShipments.push(createTestShipment({
          originBranchId: originBranch.id,
          destinationBranchId: destinationBranch.id,
          departureDate: `2025-05-${day}`,
          vehicleId: vehicle.id,
          driverId: driver.id,
          status: i % 4 === 0 ? 'preparing' : (i % 4 === 1 ? 'departed' : (i % 4 === 2 ? 'in_transit' : 'completed')),
        }));
      }
      
      await Promise.all(createShipments);
      
      // Filter and sort shipments function
      const filterShipmentsFn = () => {
        return request(app)
          .get('/api/inter-branch-shipments')
          .query({ 
            status: 'in_transit', 
            originBranchId: originBranch.id,
            destinationBranchId: destinationBranch.id,
            startDate: '2025-05-10', 
            endDate: '2025-05-15',
            sort: 'departureDate',
            order: 'asc'
          })
          .set('Authorization', `Bearer ${authToken}`);
      };
      
      // Measure average response time
      const avgResponseTime = await calculateAverageResponseTime(filterShipmentsFn);
      
      // Response time should be under 200ms for filtered and sorted shipment listing
      expect(avgResponseTime).toBeLessThan(200);
    });
  });
  
  describe('Shipment Tracking Endpoints', () => {
    it('should handle location updates within acceptable time', async () => {
      // Create test vehicle
      const vehicle = await createTestVehicle();
      
      // Create test employees
      const driver = await createTestEmployee({ position: 'driver' });
      
      // Create test shipment
      const shipment = await createTestShipment({
        originBranchId: originBranch.id,
        destinationBranchId: destinationBranch.id,
        departureDate: '2025-05-15',
        vehicleId: vehicle.id,
        driverId: driver.id,
        status: 'in_transit',
      });
      
      // Update location function
      const updateLocationFn = () => {
        return request(app)
          .post(`/api/inter-branch-shipments/${shipment.id}/location`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            latitude: -7.2575,
            longitude: 112.7521,
            speed: 60,
            address: 'Jl. Raya Surabaya-Malang KM 10',
            notes: 'On schedule',
          });
      };
      
      // Measure average response time
      const avgResponseTime = await calculateAverageResponseTime(updateLocationFn);
      
      // Response time should be under 150ms for location update
      expect(avgResponseTime).toBeLessThan(150);
    });
    
    it('should handle status updates within acceptable time', async () => {
      // Create test vehicle
      const vehicle = await createTestVehicle();
      
      // Create test employees
      const driver = await createTestEmployee({ position: 'driver' });
      
      // Create test shipment
      const shipment = await createTestShipment({
        originBranchId: originBranch.id,
        destinationBranchId: destinationBranch.id,
        departureDate: '2025-05-15',
        vehicleId: vehicle.id,
        driverId: driver.id,
        status: 'departed',
      });
      
      // Update status function
      const updateStatusFn = () => {
        return request(app)
          .patch(`/api/inter-branch-shipments/${shipment.id}/status`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            status: 'in_transit',
            notes: 'Left origin terminal',
          });
      };
      
      // Measure average response time
      const avgResponseTime = await calculateAverageResponseTime(updateStatusFn);
      
      // Response time should be under 150ms for status update
      expect(avgResponseTime).toBeLessThan(150);
    });
    
    it('should handle checkpoint updates within acceptable time', async () => {
      // Create test vehicle
      const vehicle = await createTestVehicle();
      
      // Create test employees
      const driver = await createTestEmployee({ position: 'driver' });
      
      // Create test shipment with checkpoints
      const shipment = await createTestShipment({
        originBranchId: originBranch.id,
        destinationBranchId: destinationBranch.id,
        departureDate: '2025-05-15',
        vehicleId: vehicle.id,
        driverId: driver.id,
        status: 'in_transit',
        checkpoints: [
          {
            location: 'Semarang',
            estimatedArrivalDate: '2025-05-15',
            estimatedArrivalTime: '18:00',
            notes: 'Rest and refuel',
          },
          {
            location: 'Madiun',
            estimatedArrivalDate: '2025-05-16',
            estimatedArrivalTime: '06:00',
            notes: 'Driver change',
          }
        ],
      });
      
      // Update checkpoint function
      const updateCheckpointFn = () => {
        return request(app)
          .patch(`/api/inter-branch-shipments/${shipment.id}/checkpoints/0`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            actualArrivalDate: '2025-05-15',
            actualArrivalTime: '18:30',
            status: 'completed',
            notes: 'Arrived 30 minutes late due to traffic',
          });
      };
      
      // Measure average response time
      const avgResponseTime = await calculateAverageResponseTime(updateCheckpointFn);
      
      // Response time should be under 150ms for checkpoint update
      expect(avgResponseTime).toBeLessThan(150);
    });
  });
  
  describe('Shipment Manifest Endpoints', () => {
    it('should generate shipment manifest within acceptable time', async () => {
      // Create test vehicle
      const vehicle = await createTestVehicle();
      
      // Create test employees
      const driver = await createTestEmployee({ position: 'driver' });
      
      // Create test warehouse items
      const items = [];
      for (let i = 0; i < 50; i++) {
        items.push(await createTestWarehouseItem({
          status: 'in_transit',
          destinationBranchId: destinationBranch.id,
        }));
      }
      
      // Create test shipment with items
      const shipment = await createTestShipment({
        originBranchId: originBranch.id,
        destinationBranchId: destinationBranch.id,
        departureDate: '2025-05-15',
        vehicleId: vehicle.id,
        driverId: driver.id,
        status: 'departed',
        items: items.map(item => item.id),
      });
      
      // Generate manifest function
      const generateManifestFn = () => {
        return request(app)
          .get(`/api/inter-branch-shipments/${shipment.id}/manifest`)
          .set('Authorization', `Bearer ${authToken}`)
          .set('Accept', 'application/pdf');
      };
      
      // Measure average response time
      const avgResponseTime = await calculateAverageResponseTime(generateManifestFn);
      
      // Response time should be under 500ms for manifest generation with 50 items
      expect(avgResponseTime).toBeLessThan(500);
    });
  });
});
