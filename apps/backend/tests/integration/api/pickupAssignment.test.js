/**
 * Samudra Paket ERP - Pickup Assignment API Integration Tests
 * Tests for the pickup assignment API endpoints
 */

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../../src/app');
const PickupAssignment = require('../../../src/domain/models/pickupAssignment');
const PickupRequest = require('../../../src/domain/models/pickupRequest');
const Branch = require('../../../src/domain/models/branch');
const User = require('../../../src/domain/models/user');
const Employee = require('../../../src/domain/models/employee');
const Vehicle = require('../../../src/domain/models/vehicle');
const { generateToken } = require('../../../src/api/utils/tokenUtils');

let mongoServer;
let adminToken, driverToken;
let testBranch, testUser, testDriver, testHelper, testVehicle, testPickupRequest, testPickupAssignment;

// Setup before tests
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  // Create test data
  await setupTestData();
  
  // Generate tokens for testing
  adminToken = generateToken({
    _id: testUser._id,
    username: testUser.username,
    role: 'admin',
  });
  
  driverToken = generateToken({
    _id: testDriver._id,
    username: 'driver',
    role: 'driver',
  });
});

// Clean up after tests
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// Clear database between tests
beforeEach(async () => {
  await PickupAssignment.deleteMany({});
  
  // Create a test pickup assignment for each test
  await createTestPickupAssignment();
});

// Setup test data
async function setupTestData() {
  // Create a test branch
  testBranch = new Branch({
    code: 'JKT',
    name: 'Jakarta',
    address: {
      street: 'Jl. Test No. 123',
      city: 'Jakarta',
      province: 'DKI Jakarta',
      postalCode: '12345',
    },
    phoneNumber: '021-1234567',
    email: 'jakarta@samudrapaket.com',
    location: {
      type: 'Point',
      coordinates: [106.8456, -6.2088], // Jakarta coordinates
    },
  });
  await testBranch.save();

  // Create a test user
  testUser = new User({
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123',
    role: 'admin',
  });
  await testUser.save();

  // Create test employees
  testDriver = new Employee({
    employeeId: 'EMP001',
    firstName: 'John',
    lastName: 'Driver',
    position: new mongoose.Types.ObjectId(),
    branch: testBranch._id,
    status: 'active',
    user: new mongoose.Types.ObjectId(), // Simulating a user account
  });
  await testDriver.save();

  testHelper = new Employee({
    employeeId: 'EMP002',
    firstName: 'Jane',
    lastName: 'Helper',
    position: new mongoose.Types.ObjectId(),
    branch: testBranch._id,
    status: 'active',
  });
  await testHelper.save();

  // Create a test vehicle
  testVehicle = new Vehicle({
    vehicleNo: 'VEH001',
    plateNumber: 'B 1234 XYZ',
    type: 'pickup',
    capacity: {
      weight: 1000,
      volume: 5,
    },
    branch: testBranch._id,
    status: 'active',
  });
  await testVehicle.save();

  // Create a test pickup request
  testPickupRequest = new PickupRequest({
    code: 'PU230501JK0001',
    customer: new mongoose.Types.ObjectId(),
    branch: testBranch._id,
    pickupAddress: {
      street: 'Jl. Pickup No. 789',
      city: 'Jakarta',
      province: 'DKI Jakarta',
      postalCode: '12345',
      location: {
        type: 'Point',
        coordinates: [106.8500, -6.2100], // Near Jakarta
      },
    },
    contactPerson: {
      name: 'John Doe',
      phone: '08123456789',
      email: 'john@example.com',
    },
    scheduledDate: new Date(),
    scheduledTimeWindow: {
      start: '09:00',
      end: '12:00',
    },
    status: 'pending',
    createdBy: testUser._id,
  });
  await testPickupRequest.save();
}

// Create a test pickup assignment
async function createTestPickupAssignment() {
  const code = await PickupAssignment.generateCode(testBranch._id);
  
  testPickupAssignment = new PickupAssignment({
    code,
    branch: testBranch._id,
    assignmentDate: new Date(),
    team: {
      driver: testDriver._id,
      helpers: [testHelper._id],
    },
    vehicle: testVehicle._id,
    pickupRequests: [testPickupRequest._id],
    status: 'planned',
    createdBy: testUser._id,
  });
  
  await testPickupAssignment.save();
  
  // Update pickup request status
  testPickupRequest.status = 'scheduled';
  testPickupRequest.assignment = {
    assignmentId: testPickupAssignment._id,
    team: testDriver._id,
    vehicle: testVehicle._id,
  };
  await testPickupRequest.save();
}

describe('Pickup Assignment API', () => {
  describe('POST /api/pickup-assignments', () => {
    test('should create a new pickup assignment', async () => {
      const newPickupAssignment = {
        branch: testBranch._id,
        assignmentDate: new Date(),
        team: {
          driver: testDriver._id,
          helpers: [testHelper._id],
        },
        vehicle: testVehicle._id,
        pickupRequests: [testPickupRequest._id],
      };

      const response = await request(app)
        .post('/api/pickup-assignments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newPickupAssignment);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.code).toBeDefined();
      expect(response.body.data.status).toBe('planned');
    });

    test('should return 400 for missing required fields', async () => {
      const invalidPickupAssignment = {
        // Missing required fields
      };

      const response = await request(app)
        .post('/api/pickup-assignments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidPickupAssignment);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    test('should return 401 for unauthorized access', async () => {
      const newPickupAssignment = {
        branch: testBranch._id,
        assignmentDate: new Date(),
        team: {
          driver: testDriver._id,
        },
        vehicle: testVehicle._id,
      };

      const response = await request(app)
        .post('/api/pickup-assignments')
        .send(newPickupAssignment);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/pickup-assignments', () => {
    test('should get all pickup assignments with pagination', async () => {
      const response = await request(app)
        .get('/api/pickup-assignments')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ page: 1, limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.meta).toBeDefined();
      expect(response.body.meta.total).toBeDefined();
      expect(response.body.meta.page).toBe(1);
      expect(response.body.meta.limit).toBe(10);
    });

    test('should filter pickup assignments by status', async () => {
      const response = await request(app)
        .get('/api/pickup-assignments')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ status: 'planned' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0].status).toBe('planned');
    });
  });

  describe('GET /api/pickup-assignments/:id', () => {
    test('should get pickup assignment by ID', async () => {
      const response = await request(app)
        .get(`/api/pickup-assignments/${testPickupAssignment._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data._id).toBe(testPickupAssignment._id.toString());
      expect(response.body.data.code).toBe(testPickupAssignment.code);
    });

    test('should return 404 for non-existent ID', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .get(`/api/pickup-assignments/${nonExistentId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('PUT /api/pickup-assignments/:id', () => {
    test('should update pickup assignment', async () => {
      const updateData = {
        assignmentDate: new Date('2023-06-01'),
        team: {
          driver: testDriver._id,
          helpers: [],
        },
      };

      const response = await request(app)
        .put(`/api/pickup-assignments/${testPickupAssignment._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data._id).toBe(testPickupAssignment._id.toString());
      expect(new Date(response.body.data.assignmentDate).toISOString().split('T')[0]).toBe('2023-06-01');
      expect(response.body.data.team.helpers.length).toBe(0);
    });

    test('should return 404 for non-existent ID', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .put(`/api/pickup-assignments/${nonExistentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ assignmentDate: new Date() });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('PATCH /api/pickup-assignments/:id/status', () => {
    test('should update pickup assignment status', async () => {
      const response = await request(app)
        .patch(`/api/pickup-assignments/${testPickupAssignment._id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'assigned' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.status).toBe('assigned');
    });

    test('should return 400 for invalid status', async () => {
      const response = await request(app)
        .patch(`/api/pickup-assignments/${testPickupAssignment._id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'invalid_status' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('POST /api/pickup-assignments/:id/pickup-requests', () => {
    test('should add pickup request to assignment', async () => {
      // First remove the pickup request from the assignment
      await PickupAssignment.findByIdAndUpdate(
        testPickupAssignment._id,
        { $pull: { pickupRequests: testPickupRequest._id } }
      );
      
      // Reset pickup request status
      await PickupRequest.findByIdAndUpdate(
        testPickupRequest._id,
        { 
          status: 'pending',
          $unset: { assignment: 1 }
        }
      );

      const response = await request(app)
        .post(`/api/pickup-assignments/${testPickupAssignment._id}/pickup-requests`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ pickupRequestId: testPickupRequest._id });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.pickupRequests).toContain(testPickupRequest._id.toString());
    });
  });

  describe('DELETE /api/pickup-assignments/:id/pickup-requests/:pickupRequestId', () => {
    test('should remove pickup request from assignment', async () => {
      const response = await request(app)
        .delete(`/api/pickup-assignments/${testPickupAssignment._id}/pickup-requests/${testPickupRequest._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.pickupRequests).not.toContain(testPickupRequest._id.toString());
    });
  });

  describe('POST /api/pickup-assignments/:id/optimize-route', () => {
    test('should optimize route for pickup assignment', async () => {
      const response = await request(app)
        .post(`/api/pickup-assignments/${testPickupAssignment._id}/optimize-route`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ useGoogleMaps: false });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.route).toBeDefined();
      expect(response.body.data.route.optimized).toBe(true);
    });
  });

  describe('GET /api/pickup-assignments/driver/:driverId', () => {
    test('should get assignments for driver', async () => {
      const response = await request(app)
        .get(`/api/pickup-assignments/driver/${testDriver._id}`)
        .set('Authorization', `Bearer ${driverToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0].team.driver).toBe(testDriver._id.toString());
    });
  });

  describe('GET /api/pickup-assignments/branch/:branchId/today', () => {
    test('should get today\'s assignments for branch', async () => {
      const response = await request(app)
        .get(`/api/pickup-assignments/branch/${testBranch._id}/today`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/pickup-assignments/branch/:branchId/unassigned', () => {
    test('should get unassigned pickup requests for branch', async () => {
      // Create an unassigned pickup request
      const unassignedPickupRequest = new PickupRequest({
        code: 'PU230501JK0002',
        customer: new mongoose.Types.ObjectId(),
        branch: testBranch._id,
        pickupAddress: {
          street: 'Jl. Unassigned No. 123',
          city: 'Jakarta',
          province: 'DKI Jakarta',
          postalCode: '12345',
        },
        contactPerson: {
          name: 'Unassigned User',
          phone: '08123456789',
        },
        scheduledDate: new Date(),
        scheduledTimeWindow: {
          start: '09:00',
          end: '12:00',
        },
        status: 'pending',
        createdBy: testUser._id,
      });
      await unassignedPickupRequest.save();

      const response = await request(app)
        .get(`/api/pickup-assignments/branch/${testBranch._id}/unassigned`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data.some(pr => pr.code === 'PU230501JK0002')).toBe(true);
    });
  });
});
