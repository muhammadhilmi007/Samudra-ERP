/**
 * Samudra Paket ERP - Integration Tests
 * Security Testing for API Endpoints
 */

const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../../../../src/index');
const { 
  createTestUser, 
  createTestBranch,
  createTestCustomer,
  createTestPickupRequest,
  createTestWarehouseItem,
  createTestShipment,
  clearDatabase, 
  generateTestToken,
  generateExpiredToken
} = require('../../testUtils');

let mongoServer;
let adminToken;
let operatorToken;
let driverToken;
let expiredToken;
let malformedToken;

// Setup test database
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
  
  // Create test users with different roles
  const adminUser = await createTestUser({
    username: 'admin',
    email: 'admin@example.com',
    role: 'admin',
    permissions: ['all'],
    isActive: true,
    isEmailVerified: true,
  });
  
  const operatorUser = await createTestUser({
    username: 'operator',
    email: 'operator@example.com',
    role: 'operator',
    permissions: ['pickup:read', 'pickup:write', 'warehouse:read', 'warehouse:write'],
    isActive: true,
    isEmailVerified: true,
  });
  
  const driverUser = await createTestUser({
    username: 'driver',
    email: 'driver@example.com',
    role: 'driver',
    permissions: ['pickup:read', 'pickup:execute'],
    isActive: true,
    isEmailVerified: true,
  });
  
  // Generate tokens
  adminToken = generateTestToken(adminUser);
  operatorToken = generateTestToken(operatorUser);
  driverToken = generateTestToken(driverUser);
  expiredToken = generateExpiredToken(adminUser);
  malformedToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ';
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

describe('API Security Testing', () => {
  describe('Authentication Security', () => {
    it('should reject requests without authentication token', async () => {
      // Test secured endpoints without token
      const endpoints = [
        { method: 'get', path: '/api/users' },
        { method: 'get', path: '/api/branches' },
        { method: 'get', path: '/api/pickup-requests' },
        { method: 'get', path: '/api/warehouse-items' },
        { method: 'get', path: '/api/inter-branch-shipments' },
      ];
      
      for (const endpoint of endpoints) {
        const response = await request(app)[endpoint.method](endpoint.path);
        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toHaveProperty('message', 'Authentication required');
      }
    });
    
    it('should reject requests with expired token', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${expiredToken}`);
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('message', 'Token expired');
    });
    
    it('should reject requests with malformed token', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${malformedToken}`);
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('message', 'Invalid token');
    });
    
    it('should reject requests with token for inactive user', async () => {
      // Create inactive user
      const inactiveUser = await createTestUser({
        username: 'inactive',
        email: 'inactive@example.com',
        role: 'operator',
        isActive: false,
        isEmailVerified: true,
      });
      
      const inactiveToken = generateTestToken(inactiveUser);
      
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${inactiveToken}`);
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('message', 'User account is inactive');
    });
  });
  
  describe('Authorization Security', () => {
    it('should enforce role-based access control', async () => {
      // Admin should have access to all endpoints
      const adminResponse = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(adminResponse.status).toBe(200);
      
      // Driver should not have access to user management
      const driverResponse = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${driverToken}`);
      
      expect(driverResponse.status).toBe(403);
      expect(driverResponse.body).toHaveProperty('success', false);
      expect(driverResponse.body).toHaveProperty('error');
      expect(driverResponse.body.error).toHaveProperty('message', 'Insufficient permissions');
    });
    
    it('should enforce permission-based access control', async () => {
      // Create test customer
      const customer = await createTestCustomer();
      
      // Create test pickup request
      const pickupRequest = await createTestPickupRequest({
        customerId: customer.id,
        status: 'pending',
      });
      
      // Operator should have access to pickup requests (has pickup:read permission)
      const operatorResponse = await request(app)
        .get('/api/pickup-requests')
        .set('Authorization', `Bearer ${operatorToken}`);
      
      expect(operatorResponse.status).toBe(200);
      
      // Driver should have access to pickup requests (has pickup:read permission)
      const driverResponse = await request(app)
        .get('/api/pickup-requests')
        .set('Authorization', `Bearer ${driverToken}`);
      
      expect(driverResponse.status).toBe(200);
      
      // Operator should be able to create pickup requests (has pickup:write permission)
      const operatorCreateResponse = await request(app)
        .post('/api/pickup-requests')
        .set('Authorization', `Bearer ${operatorToken}`)
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
      
      expect(operatorCreateResponse.status).toBe(201);
      
      // Driver should not be able to create pickup requests (no pickup:write permission)
      const driverCreateResponse = await request(app)
        .post('/api/pickup-requests')
        .set('Authorization', `Bearer ${driverToken}`)
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
      
      expect(driverCreateResponse.status).toBe(403);
      expect(driverCreateResponse.body).toHaveProperty('success', false);
      expect(driverCreateResponse.body).toHaveProperty('error');
      expect(driverCreateResponse.body.error).toHaveProperty('message', 'Insufficient permissions');
    });
    
    it('should prevent access to resources owned by other branches', async () => {
      // Create test branches
      const branch1 = await createTestBranch({
        name: 'Jakarta Pusat',
        code: 'JKT01',
      });
      
      const branch2 = await createTestBranch({
        name: 'Surabaya',
        code: 'SBY01',
      });
      
      // Create branch-specific user
      const branchUser = await createTestUser({
        username: 'branch1user',
        email: 'branch1@example.com',
        role: 'branch_admin',
        permissions: ['warehouse:read', 'warehouse:write'],
        branchId: branch1.id,
        isActive: true,
        isEmailVerified: true,
      });
      
      const branchToken = generateTestToken(branchUser);
      
      // Create warehouse items for both branches
      const item1 = await createTestWarehouseItem({
        branchId: branch1.id,
        status: 'incoming',
      });
      
      const item2 = await createTestWarehouseItem({
        branchId: branch2.id,
        status: 'incoming',
      });
      
      // Branch user should be able to access items from their branch
      const branch1Response = await request(app)
        .get(`/api/warehouse-items/${item1.id}`)
        .set('Authorization', `Bearer ${branchToken}`);
      
      expect(branch1Response.status).toBe(200);
      
      // Branch user should not be able to access items from other branches
      const branch2Response = await request(app)
        .get(`/api/warehouse-items/${item2.id}`)
        .set('Authorization', `Bearer ${branchToken}`);
      
      expect(branch2Response.status).toBe(403);
      expect(branch2Response.body).toHaveProperty('success', false);
      expect(branch2Response.body).toHaveProperty('error');
      expect(branch2Response.body.error).toHaveProperty('message', 'Access denied to resource from another branch');
    });
  });
  
  describe('Input Validation Security', () => {
    it('should validate and sanitize input data', async () => {
      // Create test customer
      const customer = await createTestCustomer();
      
      // Test with invalid data
      const invalidDataResponse = await request(app)
        .post('/api/pickup-requests')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          customerId: customer.id,
          pickupDate: 'not-a-date',
          timeWindowStart: 'invalid-time',
          timeWindowEnd: '25:00',
          address: '',
          contactName: '',
          contactPhone: 'not-a-phone',
          estimatedItems: 'ten',
          notes: '<script>alert("XSS")</script>',
        });
      
      expect(invalidDataResponse.status).toBe(400);
      expect(invalidDataResponse.body).toHaveProperty('success', false);
      expect(invalidDataResponse.body).toHaveProperty('error');
      expect(invalidDataResponse.body.error).toHaveProperty('details');
      
      // Ensure XSS attempt is caught
      const xssResponse = await request(app)
        .post('/api/customers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: '<script>alert("XSS")</script>',
          email: 'test@example.com',
          phone: '081234567890',
          address: 'Test Address',
        });
      
      expect(xssResponse.status).toBe(400);
      // or if sanitized instead of rejected
      if (xssResponse.status === 201) {
        expect(xssResponse.body.data.name).not.toContain('<script>');
      }
    });
    
    it('should prevent SQL injection attempts', async () => {
      // Test with SQL injection in query parameters
      const sqlInjectionResponse = await request(app)
        .get('/api/customers')
        .query({ name: "' OR '1'='1" })
        .set('Authorization', `Bearer ${adminToken}`);
      
      // Should either return empty results or 400 bad request, but not expose data
      if (sqlInjectionResponse.status === 200) {
        expect(sqlInjectionResponse.body.data.length).toBe(0);
      } else {
        expect(sqlInjectionResponse.status).toBe(400);
      }
    });
    
    it('should prevent NoSQL injection attempts', async () => {
      // Test with NoSQL injection in query parameters
      const noSqlInjectionResponse = await request(app)
        .get('/api/customers')
        .query({ email: { $ne: null } })
        .set('Authorization', `Bearer ${adminToken}`);
      
      // Should either return empty results or 400 bad request, but not expose data
      if (noSqlInjectionResponse.status === 200) {
        expect(noSqlInjectionResponse.body.data.length).toBe(0);
      } else {
        expect(noSqlInjectionResponse.status).toBe(400);
      }
    });
  });
  
  describe('Rate Limiting Security', () => {
    it('should enforce rate limits on authentication endpoints', async () => {
      // Make multiple rapid requests to login endpoint
      const requests = [];
      for (let i = 0; i < 10; i++) {
        requests.push(
          request(app)
            .post('/api/auth/login')
            .send({
              username: 'admin',
              password: 'wrongpassword',
            })
        );
      }
      
      const responses = await Promise.all(requests);
      
      // At least one of the later requests should be rate limited
      const rateLimitedResponses = responses.filter(res => res.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
      
      if (rateLimitedResponses.length > 0) {
        expect(rateLimitedResponses[0].body).toHaveProperty('success', false);
        expect(rateLimitedResponses[0].body).toHaveProperty('error');
        expect(rateLimitedResponses[0].body.error).toHaveProperty('message');
        expect(rateLimitedResponses[0].body.error.message).toContain('Too many requests');
      }
    });
  });
  
  describe('File Upload Security', () => {
    it('should validate file uploads for type and size', async () => {
      // Create test customer
      const customer = await createTestCustomer();
      
      // Create test pickup request
      const pickupRequest = await createTestPickupRequest({
        customerId: customer.id,
        status: 'assigned',
      });
      
      // Test with invalid file type
      const invalidFileResponse = await request(app)
        .post('/api/pickup-items')
        .set('Authorization', `Bearer ${adminToken}`)
        .field('pickupRequestId', pickupRequest.id)
        .field('description', 'Electronics Package')
        .field('weight', '5.5')
        .field('length', '40')
        .field('width', '30')
        .field('height', '20')
        .attach('photos', Buffer.from('fake executable data'), 'malicious.exe');
      
      expect(invalidFileResponse.status).toBe(400);
      expect(invalidFileResponse.body).toHaveProperty('success', false);
      expect(invalidFileResponse.body).toHaveProperty('error');
      expect(invalidFileResponse.body.error).toHaveProperty('message');
      expect(invalidFileResponse.body.error.message).toContain('Invalid file type');
      
      // Test with oversized file
      const largeBuf = Buffer.alloc(11 * 1024 * 1024); // 11MB buffer (if limit is 10MB)
      const oversizedFileResponse = await request(app)
        .post('/api/pickup-items')
        .set('Authorization', `Bearer ${adminToken}`)
        .field('pickupRequestId', pickupRequest.id)
        .field('description', 'Electronics Package')
        .field('weight', '5.5')
        .field('length', '40')
        .field('width', '30')
        .field('height', '20')
        .attach('photos', largeBuf, 'large-image.jpg');
      
      expect(oversizedFileResponse.status).toBe(400);
      expect(oversizedFileResponse.body).toHaveProperty('success', false);
      expect(oversizedFileResponse.body).toHaveProperty('error');
      expect(oversizedFileResponse.body.error).toHaveProperty('message');
      expect(oversizedFileResponse.body.error.message).toContain('File too large');
    });
  });
  
  describe('API Response Security', () => {
    it('should not expose sensitive information in error responses', async () => {
      // Test with invalid ObjectId
      const invalidIdResponse = await request(app)
        .get('/api/users/invalid-id')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(invalidIdResponse.status).toBe(400);
      expect(invalidIdResponse.body).toHaveProperty('success', false);
      expect(invalidIdResponse.body).toHaveProperty('error');
      expect(invalidIdResponse.body.error).toHaveProperty('message');
      
      // Error should not contain stack trace or detailed system information
      expect(invalidIdResponse.body.error).not.toHaveProperty('stack');
      expect(invalidIdResponse.body.error.message).not.toContain('at Object.');
      expect(invalidIdResponse.body.error.message).not.toContain('node_modules');
    });
    
    it('should not leak database information in error responses', async () => {
      // Create test customer with duplicate email to trigger unique constraint
      await createTestCustomer({
        name: 'Test Customer',
        email: 'duplicate@example.com',
      });
      
      // Try to create another customer with the same email
      const duplicateResponse = await request(app)
        .post('/api/customers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Another Customer',
          email: 'duplicate@example.com',
          phone: '081234567890',
          address: 'Test Address',
        });
      
      expect(duplicateResponse.status).toBe(400);
      expect(duplicateResponse.body).toHaveProperty('success', false);
      expect(duplicateResponse.body).toHaveProperty('error');
      
      // Error should not contain database details
      expect(duplicateResponse.body.error.message).not.toContain('E11000');
      expect(duplicateResponse.body.error.message).not.toContain('mongodb');
      expect(duplicateResponse.body.error.message).not.toContain('mongoose');
    });
  });
});
