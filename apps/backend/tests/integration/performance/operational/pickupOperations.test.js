/**
 * Samudra Paket ERP - Integration Tests
 * Performance Testing for Pickup Operational Endpoints
 */

const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const app = require('../../../../src/index');
const { 
  createTestUser, 
  createTestBranch,
  createTestCustomer,
  createTestPickupRequest,
  createTestPickupAssignment,
  createTestPickupItem,
  clearDatabase, 
  generateTestToken 
} = require('../../testUtils');

let mongoServer;
let authToken;

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
});

// Clean up after tests
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// Reset database before each test
beforeEach(async () => {
  await clearDatabase();
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

describe('Performance Testing for Pickup Operational Endpoints', () => {
  describe('Pickup Request Endpoints', () => {
    it('should handle pickup request creation within acceptable time', async () => {
      // Create test customer
      const customer = await createTestCustomer();
      
      // Create pickup request function
      const createPickupRequestFn = () => {
        return request(app)
          .post('/api/pickup-requests')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            customerId: customer.id,
            pickupDate: '2025-05-10',
            timeWindowStart: '09:00',
            timeWindowEnd: '12:00',
            address: 'Jl. Contoh No. 123, Jakarta Selatan',
            contactName: 'John Doe',
            contactPhone: '081234567890',
            estimatedItems: 10,
            notes: 'Please bring packaging materials',
          });
      };
      
      // Measure average response time
      const avgResponseTime = await calculateAverageResponseTime(createPickupRequestFn);
      
      // Response time should be under 200ms for pickup request creation
      expect(avgResponseTime).toBeLessThan(200);
    });
    
    it('should handle pickup request listing with pagination within acceptable time', async () => {
      // Create test customer
      const customer = await createTestCustomer();
      
      // Create 50 test pickup requests
      const createRequests = [];
      for (let i = 0; i < 50; i++) {
        createRequests.push(createTestPickupRequest({
          customerId: customer.id,
          pickupDate: '2025-05-10',
          status: i % 3 === 0 ? 'pending' : (i % 3 === 1 ? 'assigned' : 'completed'),
        }));
      }
      
      await Promise.all(createRequests);
      
      // List pickup requests function with pagination
      const listPickupRequestsFn = () => {
        return request(app)
          .get('/api/pickup-requests')
          .query({ page: 1, limit: 10 })
          .set('Authorization', `Bearer ${authToken}`);
      };
      
      // Measure average response time
      const avgResponseTime = await calculateAverageResponseTime(listPickupRequestsFn);
      
      // Response time should be under 150ms for paginated pickup request listing
      expect(avgResponseTime).toBeLessThan(150);
    });
    
    it('should handle pickup request filtering and sorting within acceptable time', async () => {
      // Create test customer
      const customer = await createTestCustomer();
      
      // Create 50 test pickup requests with different statuses and dates
      const createRequests = [];
      for (let i = 0; i < 50; i++) {
        const day = 10 + Math.floor(i / 10);
        createRequests.push(createTestPickupRequest({
          customerId: customer.id,
          pickupDate: `2025-05-${day}`,
          status: i % 3 === 0 ? 'pending' : (i % 3 === 1 ? 'assigned' : 'completed'),
        }));
      }
      
      await Promise.all(createRequests);
      
      // Filter and sort pickup requests function
      const filterPickupRequestsFn = () => {
        return request(app)
          .get('/api/pickup-requests')
          .query({ 
            status: 'pending', 
            startDate: '2025-05-10', 
            endDate: '2025-05-15',
            sort: 'pickupDate',
            order: 'asc'
          })
          .set('Authorization', `Bearer ${authToken}`);
      };
      
      // Measure average response time
      const avgResponseTime = await calculateAverageResponseTime(filterPickupRequestsFn);
      
      // Response time should be under 200ms for filtered and sorted pickup request listing
      expect(avgResponseTime).toBeLessThan(200);
    });
  });
  
  describe('Pickup Assignment Endpoints', () => {
    it('should handle pickup assignment creation within acceptable time', async () => {
      // Create test branch
      const branch = await createTestBranch();
      
      // Create test customer
      const customer = await createTestCustomer();
      
      // Create test pickup requests
      const requests = [];
      for (let i = 0; i < 5; i++) {
        requests.push(await createTestPickupRequest({
          customerId: customer.id,
          pickupDate: '2025-05-10',
          status: 'pending',
        }));
      }
      
      // Create pickup assignment function
      const createPickupAssignmentFn = () => {
        return request(app)
          .post('/api/pickup-assignments')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            branchId: branch.id,
            assignmentDate: '2025-05-10',
            driverId: 'driver-123',
            helperId: 'helper-123',
            vehicleId: 'vehicle-123',
            pickupRequestIds: requests.map(req => req.id),
            notes: 'Test assignment',
          });
      };
      
      // Measure average response time
      const avgResponseTime = await calculateAverageResponseTime(createPickupAssignmentFn);
      
      // Response time should be under 250ms for pickup assignment creation
      expect(avgResponseTime).toBeLessThan(250);
    });
    
    it('should handle route optimization within acceptable time', async () => {
      // Create test branch
      const branch = await createTestBranch();
      
      // Create test customer
      const customer = await createTestCustomer();
      
      // Create test pickup requests with different addresses
      const requests = [];
      const addresses = [
        'Jl. Sudirman No. 123, Jakarta Pusat',
        'Jl. Thamrin No. 45, Jakarta Pusat',
        'Jl. Gatot Subroto No. 67, Jakarta Selatan',
        'Jl. Rasuna Said No. 89, Jakarta Selatan',
        'Jl. Kuningan No. 12, Jakarta Selatan',
      ];
      
      for (let i = 0; i < addresses.length; i++) {
        requests.push(await createTestPickupRequest({
          customerId: customer.id,
          pickupDate: '2025-05-10',
          address: addresses[i],
          status: 'pending',
        }));
      }
      
      // Optimize route function
      const optimizeRouteFn = () => {
        return request(app)
          .post('/api/pickup-assignments/optimize-route')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            branchId: branch.id,
            pickupRequestIds: requests.map(req => req.id),
            startingPoint: 'Jl. Merdeka No. 1, Jakarta Pusat',
          });
      };
      
      // Measure average response time
      const avgResponseTime = await calculateAverageResponseTime(optimizeRouteFn);
      
      // Response time should be under 500ms for route optimization
      expect(avgResponseTime).toBeLessThan(500);
    });
  });
  
  describe('Pickup Execution Endpoints', () => {
    it('should handle pickup item creation within acceptable time', async () => {
      // Create test customer
      const customer = await createTestCustomer();
      
      // Create test pickup request
      const request = await createTestPickupRequest({
        customerId: customer.id,
        pickupDate: '2025-05-10',
        status: 'assigned',
      });
      
      // Create test pickup assignment
      const assignment = await createTestPickupAssignment({
        pickupRequestIds: [request.id],
        assignmentDate: '2025-05-10',
        status: 'in_progress',
      });
      
      // Create pickup item function
      const createPickupItemFn = () => {
        return request(app)
          .post('/api/pickup-items')
          .set('Authorization', `Bearer ${authToken}`)
          .field('pickupRequestId', request.id)
          .field('description', 'Electronics Package')
          .field('weight', '5.5')
          .field('length', '40')
          .field('width', '30')
          .field('height', '20')
          .field('notes', 'Handle with care')
          .attach('photos', Buffer.from('fake image data'), 'test-image.jpg')
          .attach('signature', Buffer.from('fake signature data'), 'signature.png');
      };
      
      // Measure average response time
      const avgResponseTime = await calculateAverageResponseTime(createPickupItemFn);
      
      // Response time should be under 300ms for pickup item creation with file uploads
      expect(avgResponseTime).toBeLessThan(300);
    });
    
    it('should handle pickup request status update within acceptable time', async () => {
      // Create test customer
      const customer = await createTestCustomer();
      
      // Create test pickup request
      const pickupRequest = await createTestPickupRequest({
        customerId: customer.id,
        pickupDate: '2025-05-10',
        status: 'assigned',
      });
      
      // Create test pickup assignment
      const assignment = await createTestPickupAssignment({
        pickupRequestIds: [pickupRequest.id],
        assignmentDate: '2025-05-10',
        status: 'in_progress',
      });
      
      // Create test pickup items
      await createTestPickupItem({ pickupRequestId: pickupRequest.id });
      await createTestPickupItem({ pickupRequestId: pickupRequest.id });
      
      // Update pickup request status function
      const updateStatusFn = () => {
        return request(app)
          .patch(`/api/pickup-requests/${pickupRequest.id}/status`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            status: 'completed',
            notes: 'All items picked up',
          });
      };
      
      // Measure average response time
      const avgResponseTime = await calculateAverageResponseTime(updateStatusFn);
      
      // Response time should be under 150ms for status update
      expect(avgResponseTime).toBeLessThan(150);
    });
  });
});
