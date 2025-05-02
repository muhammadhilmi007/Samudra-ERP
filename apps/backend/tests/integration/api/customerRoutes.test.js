/**
 * Samudra Paket ERP - Customer Routes Integration Tests
 * Integration tests for the customer API endpoints
 */

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../../src/app');
const Customer = require('../../../src/domain/models/customer');
const User = require('../../../src/domain/models/user');
const Branch = require('../../../src/domain/models/branch');
const { generateToken } = require('../../../src/api/middleware/authMiddleware');

describe('Customer API Endpoints', () => {
  let token;
  let adminToken;
  let testCustomerId;
  let testBranchId;
  let testUserId;
  let adminUserId;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/samudra_test', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Create test branch
    const branch = new Branch({
      code: 'TST01',
      name: 'Test Branch',
      address: {
        street: 'Test Street',
        city: 'Test City',
        province: 'Test Province',
        postalCode: '12345',
      },
      contactInfo: {
        phone: '08123456789',
        email: 'test@branch.com',
      },
    });
    await branch.save();
    testBranchId = branch._id;

    // Create test user
    const user = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'sales',
      permissions: ['customers.read', 'customers.create', 'customers.update'],
      branch: testBranchId,
    });
    await user.save();
    testUserId = user._id;

    // Create admin user
    const admin = new User({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin',
      permissions: ['customers.read', 'customers.create', 'customers.update', 'customers.delete'],
      branch: testBranchId,
    });
    await admin.save();
    adminUserId = admin._id;

    // Generate tokens
    token = generateToken(user);
    adminToken = generateToken(admin);
  });

  afterAll(async () => {
    // Clean up database
    await User.deleteMany({});
    await Branch.deleteMany({});
    await Customer.deleteMany({});

    // Disconnect from test database
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Create a test customer before each test
    const customer = new Customer({
      code: 'CUST001',
      name: 'Test Customer',
      type: 'business',
      category: 'regular',
      contactInfo: {
        primaryPhone: '08123456789',
        email: 'customer@example.com',
      },
      address: {
        street: 'Jl. Test No. 123',
        city: 'Jakarta',
        province: 'DKI Jakarta',
        postalCode: '12345',
      },
      branch: testBranchId,
      registeredBy: testUserId,
    });
    await customer.save();
    testCustomerId = customer._id;
  });

  afterEach(async () => {
    // Clean up customers after each test
    await Customer.deleteMany({});
  });

  describe('POST /api/customers', () => {
    it('should create a new customer', async () => {
      const customerData = {
        code: 'CUST002',
        name: 'New Test Customer',
        type: 'individual',
        category: 'premium',
        contactInfo: {
          primaryPhone: '08987654321',
          email: 'new@example.com',
        },
        address: {
          street: 'Jl. New No. 456',
          city: 'Bandung',
          province: 'Jawa Barat',
          postalCode: '54321',
        },
        branch: testBranchId,
      };

      const response = await request(app)
        .post('/api/customers')
        .set('Authorization', `Bearer ${token}`)
        .send(customerData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.code).toBe(customerData.code);
      expect(response.body.data.name).toBe(customerData.name);
      expect(response.body.data.type).toBe(customerData.type);
      expect(response.body.data.category).toBe(customerData.category);
      expect(response.body.data.registeredBy).toBe(testUserId.toString());
    });

    it('should return validation error for missing required fields', async () => {
      const incompleteData = {
        code: 'CUST003',
        name: 'Incomplete Customer',
        // Missing contactInfo and address
        branch: testBranchId,
      };

      const response = await request(app)
        .post('/api/customers')
        .set('Authorization', `Bearer ${token}`)
        .send(incompleteData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
      expect(response.body.error.code).toBe('ValidationError');
    });

    it('should return error for duplicate customer code', async () => {
      // Try to create customer with same code as existing one
      const duplicateData = {
        code: 'CUST001', // Same as test customer
        name: 'Duplicate Customer',
        contactInfo: {
          primaryPhone: '08123456789',
        },
        address: {
          street: 'Jl. Duplicate',
          city: 'Jakarta',
          province: 'DKI Jakarta',
          postalCode: '12345',
        },
        branch: testBranchId,
      };

      const response = await request(app)
        .post('/api/customers')
        .set('Authorization', `Bearer ${token}`)
        .send(duplicateData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
      expect(response.body.error.code).toBe('DuplicateError');
    });
  });

  describe('GET /api/customers', () => {
    it('should get all customers with pagination', async () => {
      // Create additional test customers
      await Customer.create({
        code: 'CUST002',
        name: 'Another Customer',
        contactInfo: { primaryPhone: '08111222333' },
        address: {
          street: 'Jl. Another',
          city: 'Surabaya',
          province: 'Jawa Timur',
          postalCode: '60000',
        },
        branch: testBranchId,
      });

      const response = await request(app)
        .get('/api/customers')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBe(2); // Our 2 test customers
      expect(response.body.meta).toBeDefined();
      expect(response.body.meta.total).toBe(2);
    });

    it('should filter customers by search query', async () => {
      // Create additional test customers with specific names for search
      await Customer.create({
        code: 'CUST002',
        name: 'Unique Name Customer',
        contactInfo: { primaryPhone: '08111222333' },
        address: {
          street: 'Jl. Another',
          city: 'Surabaya',
          province: 'Jawa Timur',
          postalCode: '60000',
        },
        branch: testBranchId,
      });

      const response = await request(app)
        .get('/api/customers?search=Unique')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].name).toBe('Unique Name Customer');
    });
  });

  describe('GET /api/customers/:id', () => {
    it('should get customer by ID', async () => {
      const response = await request(app)
        .get(`/api/customers/${testCustomerId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data._id).toBe(testCustomerId.toString());
      expect(response.body.data.code).toBe('CUST001');
      expect(response.body.data.name).toBe('Test Customer');
    });

    it('should return 404 for non-existent customer ID', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .get(`/api/customers/${nonExistentId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
      expect(response.body.error.code).toBe('Not Found');
    });
  });

  describe('PUT /api/customers/:id', () => {
    it('should update customer', async () => {
      const updateData = {
        name: 'Updated Customer Name',
        category: 'vip',
        contactInfo: {
          primaryPhone: '08999888777',
          email: 'updated@example.com',
        },
      };

      const response = await request(app)
        .put(`/api/customers/${testCustomerId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.category).toBe(updateData.category);
      expect(response.body.data.contactInfo.primaryPhone).toBe(updateData.contactInfo.primaryPhone);
      expect(response.body.data.contactInfo.email).toBe(updateData.contactInfo.email);
    });

    it('should return 404 for non-existent customer ID', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .put(`/api/customers/${nonExistentId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Updated Name' })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
      expect(response.body.error.code).toBe('Not Found');
    });
  });

  describe('DELETE /api/customers/:id', () => {
    it('should deactivate customer (admin only)', async () => {
      const response = await request(app)
        .delete(`/api/customers/${testCustomerId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Customer deactivated successfully');

      // Verify customer is deactivated
      const customer = await Customer.findById(testCustomerId);
      expect(customer.status).toBe('inactive');
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .delete(`/api/customers/${testCustomerId}`)
        .set('Authorization', `Bearer ${token}`) // Non-admin token
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
      expect(response.body.error.code).toBe('Forbidden');
    });
  });

  describe('GET /api/customers/:id/activity', () => {
    it('should get customer activity history', async () => {
      // Add activities to customer
      const customer = await Customer.findById(testCustomerId);
      await customer.addActivity('test-action', testUserId, { note: 'Test activity' });
      await customer.addActivity('another-action', testUserId, { note: 'Another activity' });

      const response = await request(app)
        .get(`/api/customers/${testCustomerId}/activity`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBe(2);
      expect(response.body.data[0].action).toBe('another-action'); // Most recent first
      expect(response.body.data[1].action).toBe('test-action');
    });
  });

  describe('POST /api/customers/:id/activity', () => {
    it('should add activity to customer history', async () => {
      const activityData = {
        action: 'custom-action',
        details: { note: 'Custom activity from API test' },
      };

      const response = await request(app)
        .post(`/api/customers/${testCustomerId}/activity`)
        .set('Authorization', `Bearer ${token}`)
        .send(activityData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Activity added successfully');

      // Verify activity was added
      const customer = await Customer.findById(testCustomerId);
      expect(customer.activityHistory).toHaveLength(1);
      expect(customer.activityHistory[0].action).toBe(activityData.action);
      expect(customer.activityHistory[0].details).toEqual(activityData.details);
    });
  });

  describe('GET /api/customers/category/:category', () => {
    it('should get customers by category', async () => {
      // Create additional test customers with different categories
      await Customer.create({
        code: 'CUST002',
        name: 'VIP Customer 1',
        category: 'vip',
        contactInfo: { primaryPhone: '08111222333' },
        address: {
          street: 'Jl. VIP 1',
          city: 'Jakarta',
          province: 'DKI Jakarta',
          postalCode: '12345',
        },
        branch: testBranchId,
      });

      await Customer.create({
        code: 'CUST003',
        name: 'VIP Customer 2',
        category: 'vip',
        contactInfo: { primaryPhone: '08444555666' },
        address: {
          street: 'Jl. VIP 2',
          city: 'Jakarta',
          province: 'DKI Jakarta',
          postalCode: '12345',
        },
        branch: testBranchId,
      });

      const response = await request(app)
        .get('/api/customers/category/vip')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBe(2);
      expect(response.body.data[0].category).toBe('vip');
      expect(response.body.data[1].category).toBe('vip');
    });
  });
});
