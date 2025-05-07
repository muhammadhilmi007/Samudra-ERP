/**
 * Integration Test: Security Testing for API Endpoints
 * Covers: Authentication, Authorization, Input Validation, Rate Limiting, Data Protection
 * Tech: Jest + Supertest
 *
 * Follows project integration testing standards (see TDD Section 10, SRS Section 6.4.2)
 */

const request = require('supertest');
const app = require('../../src/index');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { setupTestDB, teardownTestDB } = require('../utils/testDB');

// Test data and variables
let adminToken;
let branchAdminToken;
let checkerToken;
let driverToken;
let customerToken;
let expiredToken;
let invalidToken;
let pickupAssignmentId;
let shipmentId;

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
  
  const checkerLogin = await request(app)
    .post('/api/auth/login')
    .send({ username: 'test_checker', password: 'password123' });
  checkerToken = checkerLogin.body.data.token;
  
  const driverLogin = await request(app)
    .post('/api/auth/login')
    .send({ username: 'test_driver', password: 'password123' });
  driverToken = driverLogin.body.data.token;
  
  const customerLogin = await request(app)
    .post('/api/auth/login')
    .send({ username: 'test_customer', password: 'password123' });
  customerToken = customerLogin.body.data.token;
  
  // Create expired token (signed 48 hours ago)
  const payload = { 
    userId: 'test_admin', 
    role: 'admin',
    iat: Math.floor(Date.now() / 1000) - (48 * 3600)
  };
  expiredToken = jwt.sign(
    payload, 
    process.env.JWT_SECRET || 'test-secret', 
    { expiresIn: '24h' }
  );
  
  // Create invalid token
  invalidToken = adminToken.substring(0, adminToken.length - 5) + 'xxxxx';
  
  // Create test data
  // Pickup assignment
  const pickupRes = await request(app)
    .post('/api/pickup-assignments')
    .set('Authorization', `Bearer ${branchAdminToken}`)
    .send({
      team: ['test_checker', 'test_driver'],
      vehicle: 'B1234XYZ',
      requests: [],
      status: 'assigned'
    });
  pickupAssignmentId = pickupRes.body.data._id;
  
  // Shipment
  const shipmentRes = await request(app)
    .post('/api/inter-branch-shipments')
    .set('Authorization', `Bearer ${branchAdminToken}`)
    .send({
      originBranchId: 'branch1',
      destinationBranchId: 'branch2',
      scheduledDepartureDate: new Date(Date.now() + 86400000).toISOString(),
      estimatedArrivalDate: new Date(Date.now() + 172800000).toISOString(),
      vehicle: {
        registrationNumber: 'B5678XYZ',
        type: 'truck',
        capacity: 1000
      },
      driver: 'test_driver',
      items: [],
      notes: 'Test shipment'
    });
  shipmentId = shipmentRes.body.data._id;
});

afterAll(async () => {
  await teardownTestDB();
  await mongoose.disconnect();
});

describe('Security Testing for API Endpoints', () => {
  // 1. Authentication Tests
  describe('Authentication Tests', () => {
    it('should reject requests without authentication token', async () => {
      const res = await request(app)
        .get('/api/pickup-assignments');
      
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });
    
    it('should reject requests with expired token', async () => {
      const res = await request(app)
        .get('/api/pickup-assignments')
        .set('Authorization', `Bearer ${expiredToken}`);
      
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });
    
    it('should reject requests with invalid token', async () => {
      const res = await request(app)
        .get('/api/pickup-assignments')
        .set('Authorization', `Bearer ${invalidToken}`);
      
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });
    
    it('should reject login with incorrect credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'test_admin', password: 'wrong_password' });
      
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });
    
    it('should lock account after multiple failed login attempts', async () => {
      // Attempt login with incorrect password multiple times
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/api/auth/login')
          .send({ username: 'test_lockout_user', password: 'wrong_password' });
      }
      
      // Try with correct password
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'test_lockout_user', password: 'correct_password' });
      
      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('ACCOUNT_LOCKED');
    });
  });

  // 2. Authorization Tests (RBAC)
  describe('Authorization Tests (RBAC)', () => {
    it('should prevent access to admin endpoints by non-admin users', async () => {
      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${checkerToken}`);
      
      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
    });
    
    it('should prevent branch admin from accessing other branch data', async () => {
      // Try to access branch2 data with branch1 admin token
      const res = await request(app)
        .get('/api/branches/branch2/statistics')
        .set('Authorization', `Bearer ${branchAdminToken}`);
      
      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
    });
    
    it('should prevent checker from modifying completed assignments', async () => {
      // First complete the assignment
      await request(app)
        .patch(`/api/pickup-assignments/${pickupAssignmentId}/status`)
        .set('Authorization', `Bearer ${branchAdminToken}`)
        .send({ 
          status: 'completed',
          notes: 'Completed by branch admin'
        });
      
      // Try to modify as checker
      const res = await request(app)
        .patch(`/api/pickup-assignments/${pickupAssignmentId}/status`)
        .set('Authorization', `Bearer ${checkerToken}`)
        .send({ 
          status: 'in_progress',
          notes: 'Trying to reopen'
        });
      
      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
    });
    
    it('should prevent customer from accessing internal operational data', async () => {
      const res = await request(app)
        .get(`/api/inter-branch-shipments/${shipmentId}`)
        .set('Authorization', `Bearer ${customerToken}`);
      
      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  // 3. Input Validation Tests
  describe('Input Validation Tests', () => {
    it('should reject invalid input data format', async () => {
      const res = await request(app)
        .post('/api/pickup-assignments')
        .set('Authorization', `Bearer ${branchAdminToken}`)
        .send({
          team: 'not-an-array', // Should be array
          vehicle: 'B1234XYZ',
          requests: [],
        });
      
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toHaveProperty('details');
    });
    
    it('should sanitize input to prevent XSS attacks', async () => {
      const res = await request(app)
        .post('/api/pickup-assignments')
        .set('Authorization', `Bearer ${branchAdminToken}`)
        .send({
          team: ['test_checker', 'test_driver'],
          vehicle: 'B1234XYZ',
          notes: '<script>alert("XSS")</script>',
          requests: [],
        });
      
      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.notes).not.toContain('<script>');
    });
    
    it('should validate numeric ranges', async () => {
      const res = await request(app)
        .post('/api/warehouse-items')
        .set('Authorization', `Bearer ${branchAdminToken}`)
        .send({
          code: 'ITEM-INVALID',
          weight: -5, // Negative weight is invalid
          dimensions: { length: 20, width: 15, height: 10 },
          category: 'general',
          status: 'in_inventory'
        });
      
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
    
    it('should validate date formats', async () => {
      const res = await request(app)
        .post('/api/inter-branch-shipments')
        .set('Authorization', `Bearer ${branchAdminToken}`)
        .send({
          originBranchId: 'branch1',
          destinationBranchId: 'branch2',
          scheduledDepartureDate: 'not-a-date',
          estimatedArrivalDate: new Date(Date.now() + 172800000).toISOString(),
          vehicle: {
            registrationNumber: 'B5678XYZ',
            type: 'truck',
            capacity: 1000
          },
          driver: 'test_driver',
          items: []
        });
      
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // 4. SQL/NoSQL Injection Tests
  describe('SQL/NoSQL Injection Tests', () => {
    it('should prevent NoSQL injection in query parameters', async () => {
      const res = await request(app)
        .get('/api/pickup-assignments')
        .set('Authorization', `Bearer ${branchAdminToken}`)
        .query({ status: { $ne: null } }); // NoSQL injection attempt
      
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
    
    it('should prevent NoSQL injection in request body', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ 
          username: 'test_admin', 
          password: { $ne: null } // NoSQL injection attempt
        });
      
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // 5. Rate Limiting Tests
  describe('Rate Limiting Tests', () => {
    it('should enforce rate limits on authentication endpoints', async () => {
      // Make multiple rapid requests
      const promises = [];
      for (let i = 0; i < 20; i++) {
        promises.push(
          request(app)
            .post('/api/auth/login')
            .send({ username: `test_user_${i}`, password: 'password123' })
        );
      }
      
      const results = await Promise.all(promises);
      
      // At least some requests should be rate limited
      const rateLimited = results.some(res => res.statusCode === 429);
      expect(rateLimited).toBe(true);
    });
    
    it('should enforce rate limits on public tracking endpoints', async () => {
      // Make multiple rapid requests
      const promises = [];
      for (let i = 0; i < 30; i++) {
        promises.push(
          request(app)
            .get('/api/tracking/ABC123XYZ')
        );
      }
      
      const results = await Promise.all(promises);
      
      // At least some requests should be rate limited
      const rateLimited = results.some(res => res.statusCode === 429);
      expect(rateLimited).toBe(true);
    });
  });

  // 6. Data Protection Tests
  describe('Data Protection Tests', () => {
    it('should not expose sensitive user information', async () => {
      const res = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).not.toHaveProperty('password');
      expect(res.body.data).not.toHaveProperty('passwordHash');
      expect(res.body.data).not.toHaveProperty('passwordSalt');
    });
    
    it('should not expose internal system details in error messages', async () => {
      const res = await request(app)
        .get('/api/non-existent-endpoint')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).not.toContain('Error:');
      expect(res.body.error.message).not.toContain('at ');
      expect(res.body.error).not.toHaveProperty('stack');
    });
  });

  // 7. CSRF Protection Tests
  describe('CSRF Protection Tests', () => {
    it('should require CSRF token for state-changing operations', async () => {
      // First get CSRF token
      const csrfRes = await request(app)
        .get('/api/auth/csrf')
        .set('Authorization', `Bearer ${adminToken}`);
      
      const csrfToken = csrfRes.body.data.csrfToken;
      
      // Request with token should succeed
      const validRes = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('X-CSRF-Token', csrfToken)
        .send({
          username: 'new_test_user',
          password: 'password123',
          role: 'checker'
        });
      
      expect(validRes.statusCode).toBe(201);
      
      // Request without token should fail
      const invalidRes = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          username: 'another_test_user',
          password: 'password123',
          role: 'checker'
        });
      
      expect(invalidRes.statusCode).toBe(403);
      expect(invalidRes.body.success).toBe(false);
      expect(invalidRes.body.error.code).toBe('CSRF_ERROR');
    });
  });

  // 8. Secure Headers Tests
  describe('Secure Headers Tests', () => {
    it('should include security headers in responses', async () => {
      const res = await request(app)
        .get('/api/pickup-assignments')
        .set('Authorization', `Bearer ${branchAdminToken}`);
      
      expect(res.headers).toHaveProperty('x-content-type-options', 'nosniff');
      expect(res.headers).toHaveProperty('x-frame-options', 'DENY');
      expect(res.headers).toHaveProperty('strict-transport-security');
      expect(res.headers).toHaveProperty('x-xss-protection', '1; mode=block');
    });
  });

  // 9. File Upload Security Tests
  describe('File Upload Security Tests', () => {
    it('should reject uploads with invalid file types', async () => {
      const res = await request(app)
        .post('/api/pickup-items/test-item/images')
        .set('Authorization', `Bearer ${checkerToken}`)
        .attach('image', Buffer.from('fake executable content'), {
          filename: 'malicious.exe',
          contentType: 'application/octet-stream'
        });
      
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
    
    it('should reject uploads exceeding size limits', async () => {
      // Create a large buffer (6MB)
      const largeBuffer = Buffer.alloc(6 * 1024 * 1024);
      
      const res = await request(app)
        .post('/api/pickup-items/test-item/images')
        .set('Authorization', `Bearer ${checkerToken}`)
        .attach('image', largeBuffer, {
          filename: 'large_image.jpg',
          contentType: 'image/jpeg'
        });
      
      expect(res.statusCode).toBe(413);
      expect(res.body.success).toBe(false);
    });
  });

  // 10. API Endpoint Security Tests
  describe('API Endpoint Security Tests', () => {
    it('should prevent path traversal attacks', async () => {
      const res = await request(app)
        .get('/api/files/../../config/database.js') // Path traversal attempt
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
    
    it('should prevent HTTP method tampering', async () => {
      const res = await request(app)
        .get('/api/auth/login') // Should be POST
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ username: 'test_admin', password: 'password123' });
      
      expect(res.statusCode).toBe(405); // Method Not Allowed
      expect(res.body.success).toBe(false);
    });
  });
});
