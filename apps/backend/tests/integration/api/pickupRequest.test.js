/**
 * Samudra Paket ERP - Pickup Request API Integration Tests
 * Tests for the pickup request API endpoints
 */

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../../src/app');
const PickupRequest = require('../../../src/domain/models/pickupRequest');
const Branch = require('../../../src/domain/models/branch');
const User = require('../../../src/domain/models/user');
const Customer = require('../../../src/domain/models/customer');
const jwt = require('jsonwebtoken');

let mongoServer;
let token;
let adminToken;
let driverToken;

// Setup before tests
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  
  // Connect to the in-memory database
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  // Create test users for authentication
  const adminUser = new User({
    username: 'admin',
    email: 'admin@example.com',
    password: '$2a$10$iqJSHD.BGr0E2IxQwYgJmeP3NvhPrXAeLSaGCj6IR/XU5QtjVu5Tm', // 'password123'
    role: 'admin',
  });
  await adminUser.save();

  const csUser = new User({
    username: 'cs_user',
    email: 'cs@example.com',
    password: '$2a$10$iqJSHD.BGr0E2IxQwYgJmeP3NvhPrXAeLSaGCj6IR/XU5QtjVu5Tm', // 'password123'
    role: 'customer_service',
  });
  await csUser.save();

  const driverUser = new User({
    username: 'driver',
    email: 'driver@example.com',
    password: '$2a$10$iqJSHD.BGr0E2IxQwYgJmeP3NvhPrXAeLSaGCj6IR/XU5QtjVu5Tm', // 'password123'
    role: 'driver',
  });
  await driverUser.save();

  // Generate JWT tokens
  const secret = process.env.JWT_SECRET || 'samudrapaket-secret-key';
  token = jwt.sign({ id: csUser._id, role: csUser.role }, secret, { expiresIn: '1h' });
  adminToken = jwt.sign({ id: adminUser._id, role: adminUser.role }, secret, { expiresIn: '1h' });
  driverToken = jwt.sign({ id: driverUser._id, role: driverUser.role }, secret, { expiresIn: '1h' });
});

// Clean up after tests
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// Clear database between tests
beforeEach(async () => {
  await PickupRequest.deleteMany({});
  await Branch.deleteMany({});
  await Customer.deleteMany({});
});

describe('Pickup Request API', () => {
  let testBranch, testCustomer, testUser;

  // Setup test data
  beforeEach(async () => {
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
      serviceAreas: [
        {
          city: 'Jakarta',
          province: 'DKI Jakarta',
        },
      ],
    });
    await testBranch.save();

    // Get a user for reference
    testUser = await User.findOne({ role: 'customer_service' });

    // Create a test customer
    testCustomer = new Customer({
      code: 'CUST001',
      name: 'Test Customer',
      contactInfo: {
        email: 'customer@example.com',
        phone: '08123456789',
      },
      address: {
        street: 'Jl. Customer No. 456',
        city: 'Jakarta',
        province: 'DKI Jakarta',
        postalCode: '12345',
      },
      category: 'regular',
      status: 'active',
      registeredBy: testUser._id,
    });
    await testCustomer.save();
  });

  describe('POST /api/pickup-requests', () => {
    test('should create a new pickup request', async () => {
      const pickupRequestData = {
        customer: testCustomer._id,
        branch: testBranch._id,
        pickupAddress: {
          street: 'Jl. Pickup No. 789',
          city: 'Jakarta',
          province: 'DKI Jakarta',
          postalCode: '12345',
        },
        contactPerson: {
          name: 'John Doe',
          phone: '08123456789',
          email: 'john@example.com',
        },
        scheduledDate: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
        scheduledTimeWindow: {
          start: '09:00',
          end: '12:00',
        },
        items: [
          {
            description: 'Test Item',
            quantity: 2,
            weight: {
              value: 5,
              unit: 'kg',
            },
            dimensions: {
              length: 30,
              width: 20,
              height: 10,
              unit: 'cm',
            },
            packageType: 'box',
          },
        ],
        estimatedTotalWeight: {
          value: 10,
          unit: 'kg',
        },
        priority: 'normal',
        specialInstructions: 'Handle with care',
      };

      const response = await request(app)
        .post('/api/pickup-requests')
        .set('Authorization', `Bearer ${token}`)
        .send(pickupRequestData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.code).toBeDefined();
      expect(response.body.data.status).toBe('pending');
      expect(response.body.data.customer.toString()).toBe(testCustomer._id.toString());
      expect(response.body.data.branch.toString()).toBe(testBranch._id.toString());
      expect(response.body.data.items.length).toBe(1);
      expect(response.body.data.activityHistory.length).toBe(1);
      expect(response.body.data.activityHistory[0].action).toBe('created');
    });

    test('should return 400 when required fields are missing', async () => {
      const pickupRequestData = {
        // Missing required fields
      };

      const response = await request(app)
        .post('/api/pickup-requests')
        .set('Authorization', `Bearer ${token}`)
        .send(pickupRequestData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    test('should return 401 when not authenticated', async () => {
      const pickupRequestData = {
        customer: testCustomer._id,
        branch: testBranch._id,
        pickupAddress: {
          street: 'Jl. Pickup No. 789',
          city: 'Jakarta',
          province: 'DKI Jakarta',
          postalCode: '12345',
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
        items: [
          {
            description: 'Test Item',
            quantity: 2,
          },
        ],
      };

      const response = await request(app)
        .post('/api/pickup-requests')
        .send(pickupRequestData);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/pickup-requests', () => {
    beforeEach(async () => {
      // Create multiple pickup requests for testing
      const baseData = {
        customer: testCustomer._id,
        branch: testBranch._id,
        pickupAddress: {
          street: 'Jl. Pickup No. 789',
          city: 'Jakarta',
          province: 'DKI Jakarta',
          postalCode: '12345',
        },
        contactPerson: {
          name: 'John Doe',
          phone: '08123456789',
          email: 'john@example.com',
        },
        scheduledTimeWindow: {
          start: '09:00',
          end: '12:00',
        },
        items: [
          {
            description: 'Test Item',
            quantity: 2,
          },
        ],
        createdBy: testUser._id,
      };

      // Create 5 pickup requests with different statuses and dates
      const pickupRequest1 = new PickupRequest({
        ...baseData,
        code: 'PU230501JK0001',
        scheduledDate: new Date('2023-05-01'),
        status: 'pending',
      });
      await pickupRequest1.save();

      const pickupRequest2 = new PickupRequest({
        ...baseData,
        code: 'PU230502JK0002',
        scheduledDate: new Date('2023-05-02'),
        status: 'scheduled',
      });
      await pickupRequest2.save();

      const pickupRequest3 = new PickupRequest({
        ...baseData,
        code: 'PU230503JK0003',
        scheduledDate: new Date('2023-05-03'),
        status: 'in_progress',
      });
      await pickupRequest3.save();

      const pickupRequest4 = new PickupRequest({
        ...baseData,
        code: 'PU230504JK0004',
        scheduledDate: new Date('2023-05-04'),
        status: 'completed',
      });
      await pickupRequest4.save();

      const pickupRequest5 = new PickupRequest({
        ...baseData,
        code: 'PU230505JK0005',
        scheduledDate: new Date('2023-05-05'),
        status: 'cancelled',
      });
      await pickupRequest5.save();
    });

    test('should get all pickup requests with pagination', async () => {
      const response = await request(app)
        .get('/api/pickup-requests')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.meta).toBeDefined();
      expect(response.body.data.length).toBe(5);
      expect(response.body.meta.total).toBe(5);
      expect(response.body.meta.page).toBe(1);
    });

    test('should filter pickup requests by status', async () => {
      const response = await request(app)
        .get('/api/pickup-requests?status=pending')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].status).toBe('pending');
    });

    test('should filter pickup requests by date range', async () => {
      const response = await request(app)
        .get('/api/pickup-requests?scheduledDateFrom=2023-05-02&scheduledDateTo=2023-05-04')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBe(3);
    });

    test('should sort pickup requests', async () => {
      const response = await request(app)
        .get('/api/pickup-requests?sortBy=scheduledDate&sortOrder=asc')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBe(5);
      expect(response.body.data[0].code).toBe('PU230501JK0001');
      expect(response.body.data[4].code).toBe('PU230505JK0005');
    });
  });

  describe('GET /api/pickup-requests/:id', () => {
    let testPickupRequest;

    beforeEach(async () => {
      // Create a test pickup request
      const pickupRequestData = {
        code: 'PU230501JK0001',
        customer: testCustomer._id,
        branch: testBranch._id,
        pickupAddress: {
          street: 'Jl. Pickup No. 789',
          city: 'Jakarta',
          province: 'DKI Jakarta',
          postalCode: '12345',
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
        items: [
          {
            description: 'Test Item',
            quantity: 2,
          },
        ],
        createdBy: testUser._id,
      };

      testPickupRequest = new PickupRequest(pickupRequestData);
      await testPickupRequest.save();
    });

    test('should get pickup request by ID', async () => {
      const response = await request(app)
        .get(`/api/pickup-requests/${testPickupRequest._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data._id).toBe(testPickupRequest._id.toString());
      expect(response.body.data.code).toBe(testPickupRequest.code);
    });

    test('should return 404 for non-existent ID', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/pickup-requests/${nonExistentId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET /api/pickup-requests/code/:code', () => {
    let testPickupRequest;

    beforeEach(async () => {
      // Create a test pickup request
      const pickupRequestData = {
        code: 'PU230501JK0001',
        customer: testCustomer._id,
        branch: testBranch._id,
        pickupAddress: {
          street: 'Jl. Pickup No. 789',
          city: 'Jakarta',
          province: 'DKI Jakarta',
          postalCode: '12345',
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
        items: [
          {
            description: 'Test Item',
            quantity: 2,
          },
        ],
        createdBy: testUser._id,
      };

      testPickupRequest = new PickupRequest(pickupRequestData);
      await testPickupRequest.save();
    });

    test('should get pickup request by code', async () => {
      const response = await request(app)
        .get(`/api/pickup-requests/code/${testPickupRequest.code}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data._id).toBe(testPickupRequest._id.toString());
      expect(response.body.data.code).toBe(testPickupRequest.code);
    });

    test('should return 404 for non-existent code', async () => {
      const nonExistentCode = 'PU230501JK9999';
      const response = await request(app)
        .get(`/api/pickup-requests/code/${nonExistentCode}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('PUT /api/pickup-requests/:id', () => {
    let testPickupRequest;

    beforeEach(async () => {
      // Create a test pickup request
      const pickupRequestData = {
        code: 'PU230501JK0001',
        customer: testCustomer._id,
        branch: testBranch._id,
        pickupAddress: {
          street: 'Jl. Pickup No. 789',
          city: 'Jakarta',
          province: 'DKI Jakarta',
          postalCode: '12345',
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
        items: [
          {
            description: 'Test Item',
            quantity: 2,
          },
        ],
        createdBy: testUser._id,
      };

      testPickupRequest = new PickupRequest(pickupRequestData);
      await testPickupRequest.save();
    });

    test('should update pickup request', async () => {
      const updateData = {
        contactPerson: {
          name: 'Jane Doe',
          phone: '08987654321',
          email: 'jane@example.com',
        },
        scheduledTimeWindow: {
          start: '10:00',
          end: '13:00',
        },
        specialInstructions: 'Updated instructions',
      };

      const response = await request(app)
        .put(`/api/pickup-requests/${testPickupRequest._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.contactPerson.name).toBe('Jane Doe');
      expect(response.body.data.contactPerson.phone).toBe('08987654321');
      expect(response.body.data.scheduledTimeWindow.start).toBe('10:00');
      expect(response.body.data.scheduledTimeWindow.end).toBe('13:00');
      expect(response.body.data.specialInstructions).toBe('Updated instructions');
    });

    test('should return 404 for non-existent ID', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const updateData = {
        contactPerson: {
          name: 'Jane Doe',
          phone: '08987654321',
          email: 'jane@example.com',
        },
      };

      const response = await request(app)
        .put(`/api/pickup-requests/${nonExistentId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('PATCH /api/pickup-requests/:id/status', () => {
    let testPickupRequest;

    beforeEach(async () => {
      // Create a test pickup request
      const pickupRequestData = {
        code: 'PU230501JK0001',
        customer: testCustomer._id,
        branch: testBranch._id,
        pickupAddress: {
          street: 'Jl. Pickup No. 789',
          city: 'Jakarta',
          province: 'DKI Jakarta',
          postalCode: '12345',
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
        items: [
          {
            description: 'Test Item',
            quantity: 2,
          },
        ],
        createdBy: testUser._id,
      };

      testPickupRequest = new PickupRequest(pickupRequestData);
      await testPickupRequest.save();
    });

    test('should update status to scheduled', async () => {
      const updateData = {
        status: 'scheduled',
        team: new mongoose.Types.ObjectId(),
        vehicle: new mongoose.Types.ObjectId(),
      };

      const response = await request(app)
        .patch(`/api/pickup-requests/${testPickupRequest._id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.status).toBe('scheduled');
      expect(response.body.data.assignment).toBeDefined();
      expect(response.body.data.assignment.team).toBeDefined();
      expect(response.body.data.assignment.vehicle).toBeDefined();
    });

    test('should update status to in_progress', async () => {
      const updateData = {
        status: 'in_progress',
      };

      const response = await request(app)
        .patch(`/api/pickup-requests/${testPickupRequest._id}/status`)
        .set('Authorization', `Bearer ${driverToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.status).toBe('in_progress');
      expect(response.body.data.execution).toBeDefined();
      expect(response.body.data.execution.startTime).toBeDefined();
    });

    test('should update status to cancelled with reason', async () => {
      const updateData = {
        status: 'cancelled',
        reason: 'Customer requested cancellation',
      };

      const response = await request(app)
        .patch(`/api/pickup-requests/${testPickupRequest._id}/status`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.status).toBe('cancelled');
      expect(response.body.data.cancellation).toBeDefined();
      expect(response.body.data.cancellation.reason).toBe('Customer requested cancellation');
    });

    test('should return 400 for invalid status', async () => {
      const updateData = {
        status: 'invalid_status',
      };

      const response = await request(app)
        .patch(`/api/pickup-requests/${testPickupRequest._id}/status`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('POST /api/pickup-requests/validate-service-area', () => {
    test('should validate address within service area', async () => {
      const addressData = {
        address: {
          street: 'Jl. Test No. 123',
          city: 'Jakarta',
          province: 'DKI Jakarta',
          postalCode: '12345',
        },
        branchId: testBranch._id,
      };

      const response = await request(app)
        .post('/api/pickup-requests/validate-service-area')
        .set('Authorization', `Bearer ${token}`)
        .send(addressData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.valid).toBe(true);
      expect(response.body.data.message).toBe('Address is within service area');
    });

    test('should invalidate address outside service area', async () => {
      const addressData = {
        address: {
          street: 'Jl. Test No. 123',
          city: 'Bandung',
          province: 'Jawa Barat',
          postalCode: '40111',
        },
        branchId: testBranch._id,
      };

      const response = await request(app)
        .post('/api/pickup-requests/validate-service-area')
        .set('Authorization', `Bearer ${token}`)
        .send(addressData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.valid).toBe(false);
      expect(response.body.data.message).toBe('Address is outside service area');
    });
  });
});
