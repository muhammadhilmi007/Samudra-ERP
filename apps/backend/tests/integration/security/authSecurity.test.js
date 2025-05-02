/**
 * Samudra Paket ERP - Integration Tests
 * Security Testing for Authentication and Authorization
 */

const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../../../src');
const {
  createTestUser,
  clearDatabase,
  generateTestToken,
} = require('../testUtils');

let mongoServer;

// Setup test database
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
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

describe('Security Testing for Authentication and Authorization', () => {
  describe('Authentication Security', () => {
    it('should prevent login with incorrect credentials', async () => {
      // Create a test user
      await createTestUser({
        username: 'securitytest',
        email: 'security@example.com',
        isActive: true,
        isEmailVerified: true,
      });

      // Attempt login with incorrect password
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'securitytest',
          password: 'WrongPassword123!',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('AUTHENTICATION_FAILED');
    });

    it('should lock account after multiple failed login attempts', async () => {
      // Create a test user
      const user = await createTestUser({
        username: 'locktest',
        email: 'lock@example.com',
        isActive: true,
        isEmailVerified: true,
      });

      // Configure max failed attempts (should match the actual implementation)
      const maxFailedAttempts = 5;

      // Make multiple failed login attempts
      for (let i = 0; i < maxFailedAttempts; i++) {
        await request(app)
          .post('/api/auth/login')
          .send({
            username: user.username,
            password: 'WrongPassword123!',
          })
          .expect(401);
      }

      // Next attempt should lock the account
      const lockResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: user.username,
          password: 'WrongPassword123!',
        })
        .expect(401);

      expect(lockResponse.body.success).toBe(false);
      expect(lockResponse.body.error.code).toBe('ACCOUNT_LOCKED');

      // Even correct password should be rejected now
      const correctPasswordResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: user.username,
          password: 'Password123!', // Default from createTestUser
        })
        .expect(401);

      expect(correctPasswordResponse.body.success).toBe(false);
      expect(correctPasswordResponse.body.error.code).toBe('ACCOUNT_LOCKED');
    });

    it('should reject expired tokens', async () => {
      // Create a test user
      const user = await createTestUser({
        username: 'expiredtoken',
        email: 'expired@example.com',
        isActive: true,
        isEmailVerified: true,
      });

      // Generate an expired token
      const expiredToken = jwt.sign(
        {
          id: user.id,
          username: user.username,
          role: user.role,
          permissions: user.permissions,
        },
        process.env.JWT_SECRET || 'your_jwt_secret_key_here',
        { expiresIn: '0s' }, // Expired immediately
      );

      // Wait a moment to ensure token is expired
      await new Promise((resolve) => {setTimeout(resolve, 1000)});

      // Attempt to access protected endpoint with expired token
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('TOKEN_EXPIRED');
    });

    it('should reject tampered tokens', async () => {
      // Create a test user
      const user = await createTestUser({
        username: 'tamperedtoken',
        email: 'tampered@example.com',
        isActive: true,
        isEmailVerified: true,
      });

      // Generate a valid token
      const validToken = generateTestToken(user);

      // Tamper with the token (change the last character)
      const tamperedToken = validToken.slice(0, -1) + (validToken.slice(-1) === 'a' ? 'b' : 'a');

      // Attempt to access protected endpoint with tampered token
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${tamperedToken}`)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_TOKEN');
    });
  });

  describe('Authorization Security', () => {
    it('should prevent access to resources without proper permissions', async () => {
      // Create a user with limited permissions
      const limitedUser = await createTestUser({
        username: 'limiteduser',
        email: 'limited@example.com',
        permissions: ['customer.view'],
        isActive: true,
        isEmailVerified: true,
      });

      const token = generateTestToken(limitedUser);

      // Attempt to access endpoints requiring different permissions
      const adminEndpoints = ['/api/roles', '/api/users', '/api/system/settings'];

      for (const endpoint of adminEndpoints) {
        const response = await request(app)
          .get(endpoint)
          .set('Authorization', `Bearer ${token}`)
          .expect(403);

        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('FORBIDDEN');
      }
    });

    it('should prevent elevation of privileges', async () => {
      // Create a regular user
      const regularUser = await createTestUser({
        username: 'regularuser',
        email: 'regular@example.com',
        role: 'CUSTOMER',
        permissions: ['customer.view'],
        isActive: true,
        isEmailVerified: true,
      });

      const token = generateTestToken(regularUser);

      // Attempt to create an admin user (privilege escalation)
      const newAdminData = {
        username: 'newadmin',
        email: 'newadmin@example.com',
        password: 'Admin123!',
        fullName: 'New Admin',
        role: 'ADMIN',
        permissions: ['ALL'],
      };

      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${token}`)
        .send(newAdminData)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('FORBIDDEN');

      // Verify admin was not created
      const UserModel = mongoose.model('User');
      const createdAdmin = await UserModel.findOne({ username: 'newadmin' });
      expect(createdAdmin).toBeNull();
    });

    it('should prevent unauthorized role modifications', async () => {
      // Create an admin user and a regular user
      const adminUser = await createTestUser({
        username: 'admin',
        email: 'admin@example.com',
        role: 'ADMIN',
        permissions: ['ALL'],
        isActive: true,
        isEmailVerified: true,
      });

      const regularUser = await createTestUser({
        username: 'regularuser',
        email: 'regular@example.com',
        role: 'CUSTOMER',
        permissions: ['customer.view'],
        isActive: true,
        isEmailVerified: true,
      });

      const regularToken = generateTestToken(regularUser);

      // Regular user attempts to modify admin's role
      const response = await request(app)
        .put(`/api/users/${adminUser.id}/role`)
        .set('Authorization', `Bearer ${regularToken}`)
        .send({ roleId: 'CUSTOMER' })
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('FORBIDDEN');

      // Verify admin's role was not changed
      const updatedAdmin = await mongoose.model('User').findById(adminUser.id);
      expect(updatedAdmin.role).toBe('ADMIN');
    });
  });

  describe('Input Validation Security', () => {
    it('should reject registration with weak passwords', async () => {
      const weakPasswords = [
        'short', // Too short
        'password123', // No uppercase or special chars
        'PASSWORD123', // No lowercase or special chars
        'Password', // No numbers or special chars
        '12345678', // Only numbers
        'aaaaaaaa', // Repeating characters
      ];

      for (const weakPassword of weakPasswords) {
        const userData = {
          username: 'secureuser',
          email: 'secure@example.com',
          password: weakPassword,
          fullName: 'Secure User',
        };

        const response = await request(app).post('/api/auth/register').send(userData).expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      }
    });

    it('should sanitize inputs to prevent XSS attacks', async () => {
      // Create admin user
      const adminUser = await createTestUser({
        username: 'admin',
        email: 'admin@example.com',
        role: 'ADMIN',
        permissions: ['ALL'],
        isActive: true,
        isEmailVerified: true,
      });

      const token = generateTestToken(adminUser);

      // Attempt to create a branch with XSS payload
      const xssPayload = '<script>alert("XSS")</script>';
      const branchData = {
        code: 'XSS',
        name: `Branch ${xssPayload}`,
        address: `Address ${xssPayload}`,
        city: 'Test City',
        province: 'Test Province',
        phoneNumber: '081234567890',
        email: 'branch@example.com',
      };

      const response = await request(app)
        .post('/api/branches')
        .set('Authorization', `Bearer ${token}`)
        .send(branchData)
        .expect(201);

      expect(response.body.success).toBe(true);

      // Verify XSS payload was sanitized
      const branch = await mongoose.model('Branch').findById(response.body.data.branch.id);
      expect(branch.name).not.toContain('<script>');
      expect(branch.address).not.toContain('<script>');
    });

    it('should validate and sanitize query parameters', async () => {
      // Create user with employee view permission
      const user = await createTestUser({
        username: 'viewer',
        email: 'viewer@example.com',
        permissions: ['employee.view'],
        isActive: true,
        isEmailVerified: true,
      });

      const token = generateTestToken(user);

      // Test SQL injection attempt in query parameter
      const sqlInjectionQuery = "'; DROP TABLE employees; --";

      const response = await request(app)
        .get(`/api/employees?search=${sqlInjectionQuery}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify employees table still exists
      const employeeCount = await mongoose.model('Employee').countDocuments();
      expect(employeeCount).toBe(0); // Should be 0 because we haven't created any employees
    });
  });

  describe('Rate Limiting', () => {
    it('should limit login attempts from the same IP', async () => {
      // Create a test user
      await createTestUser({
        username: 'ratelimit',
        email: 'rate@example.com',
        isActive: true,
        isEmailVerified: true,
      });

      // Make multiple rapid login requests (more than the rate limit)
      const requests = [];
      for (let i = 0; i < 50; i++) {
        requests.push(
          request(app).post('/api/auth/login').send({
            username: 'ratelimit',
            password: 'WrongPassword123!',
          })
        );
      }

      // Execute all requests
      const responses = await Promise.all(requests);

      // At least one of the responses should be rate limited (429 Too Many Requests)
      const rateLimitedResponses = responses.filter(res => res.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);

      if (rateLimitedResponses.length > 0) {
        expect(rateLimitedResponses[0].body.success).toBe(false);
        expect(rateLimitedResponses[0].body.error.code).toBe('RATE_LIMIT_EXCEEDED');
      }
    });
  });
});
