/**
 * Samudra Paket ERP - Integration Tests
 * Authentication Flow Integration Tests
 */

const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const app = require('../../../../src/index');
const { createTestUser, clearDatabase } = require('../../testUtils');

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

describe('Authentication Flow Integration Tests', () => {
  describe('User Registration and Login Flow', () => {
    it('should register a new user, verify email, and login successfully', async () => {
      // Step 1: Register a new user
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123!',
        fullName: 'Test User',
        phoneNumber: '081234567890'
      };

      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(registerResponse.body.success).toBe(true);
      expect(registerResponse.body.data.user).toHaveProperty('id');
      expect(registerResponse.body.data.user.username).toBe(userData.username);
      expect(registerResponse.body.data.user.email).toBe(userData.email);
      
      // Extract verification token from response (in a real app this would be sent via email)
      const verificationUrl = registerResponse.body.data.verificationUrl;
      const verificationToken = verificationUrl.split('token=')[1];
      
      // Step 2: Verify email
      const verifyResponse = await request(app)
        .post('/api/auth/verify-email')
        .send({ token: verificationToken })
        .expect(200);
        
      expect(verifyResponse.body.success).toBe(true);
      
      // Step 3: Login with verified account
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: userData.username,
          password: userData.password
        })
        .expect(200);
        
      expect(loginResponse.body.success).toBe(true);
      expect(loginResponse.body.data).toHaveProperty('token');
      expect(loginResponse.body.data).toHaveProperty('refreshToken');
      expect(loginResponse.body.data.user.username).toBe(userData.username);
    });
    
    it('should not allow login with unverified email', async () => {
      // Register a user but don't verify email
      const userData = {
        username: 'unverified',
        email: 'unverified@example.com',
        password: 'Password123!',
        fullName: 'Unverified User',
        phoneNumber: '081234567891'
      };

      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);
        
      // Attempt to login without verifying email
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: userData.username,
          password: userData.password
        })
        .expect(401);
        
      expect(loginResponse.body.success).toBe(false);
      expect(loginResponse.body.error.code).toBe('EMAIL_NOT_VERIFIED');
    });
  });
  
  describe('Token Refresh Flow', () => {
    it('should refresh the access token using a valid refresh token', async () => {
      // Create and login a test user
      const user = await createTestUser({
        username: 'refreshuser',
        email: 'refresh@example.com',
        isActive: true,
        isEmailVerified: true
      });
      
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: user.username,
          password: 'Password123!' // Default password from createTestUser
        })
        .expect(200);
        
      const refreshToken = loginResponse.body.data.refreshToken;
      
      // Use refresh token to get a new access token
      const refreshResponse = await request(app)
        .post('/api/auth/refresh-token')
        .send({ refreshToken })
        .expect(200);
        
      expect(refreshResponse.body.success).toBe(true);
      expect(refreshResponse.body.data).toHaveProperty('token');
      expect(refreshResponse.body.data).toHaveProperty('refreshToken');
    });
    
    it('should reject an invalid refresh token', async () => {
      const refreshResponse = await request(app)
        .post('/api/auth/refresh-token')
        .send({ refreshToken: 'invalid-token' })
        .expect(401);
        
      expect(refreshResponse.body.success).toBe(false);
      expect(refreshResponse.body.error.code).toBe('INVALID_TOKEN');
    });
  });
  
  describe('Password Management Flow', () => {
    it('should allow a user to request password reset and then reset password', async () => {
      // Create a test user
      const user = await createTestUser({
        username: 'resetuser',
        email: 'reset@example.com',
        isActive: true,
        isEmailVerified: true
      });
      
      // Request password reset
      const resetRequestResponse = await request(app)
        .post('/api/auth/request-password-reset')
        .send({ email: user.email })
        .expect(200);
        
      expect(resetRequestResponse.body.success).toBe(true);
      
      // In a real app, the reset token would be sent via email
      // For testing, we'll need to retrieve it from the database
      const updatedUser = await mongoose.model('User').findById(user.id);
      const resetToken = updatedUser.resetPasswordToken;
      
      // Reset password using token
      const newPassword = 'NewPassword456!';
      const resetResponse = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          password: newPassword,
          confirmPassword: newPassword
        })
        .expect(200);
        
      expect(resetResponse.body.success).toBe(true);
      
      // Try logging in with new password
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: user.username,
          password: newPassword
        })
        .expect(200);
        
      expect(loginResponse.body.success).toBe(true);
    });
  });
  
  describe('Logout Flow', () => {
    it('should successfully logout a user', async () => {
      // Create and login a test user
      const user = await createTestUser({
        username: 'logoutuser',
        email: 'logout@example.com',
        isActive: true,
        isEmailVerified: true
      });
      
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: user.username,
          password: 'Password123!' // Default password from createTestUser
        })
        .expect(200);
        
      const token = loginResponse.body.data.token;
      const refreshToken = loginResponse.body.data.refreshToken;
      
      // Logout
      const logoutResponse = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .send({ refreshToken })
        .expect(200);
        
      expect(logoutResponse.body.success).toBe(true);
      
      // Try using the refresh token after logout (should fail)
      const refreshResponse = await request(app)
        .post('/api/auth/refresh-token')
        .send({ refreshToken })
        .expect(401);
        
      expect(refreshResponse.body.success).toBe(false);
    });
  });
});
