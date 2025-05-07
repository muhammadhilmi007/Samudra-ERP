const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../../../src/index'); // Pastikan path ke express app benar

// Mock data user
const testUser = {
  username: 'testuser',
  email: 'testuser@example.com',
  password: 'TestPassword123!',
  fullName: 'Test User',
  phoneNumber: '08123456789',
};

let refreshToken = '';
let accessToken = '';

describe('Auth Controller Integration Test', () => {
  afterAll(async () => {
    // Hapus user test dari database
    await mongoose.connection.db.collection('users').deleteOne({ email: testUser.email });
    await mongoose.disconnect();
  });

  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('user');
    expect(res.body.data.user.email).toBe(testUser.email);
  });

  it('should login with registered user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: testUser.username, password: testUser.password });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('accessToken');
    expect(res.body.data).toHaveProperty('refreshToken');
    accessToken = res.body.data.accessToken;
    refreshToken = res.body.data.refreshToken;
  });

  it('should refresh JWT token', async () => {
    const res = await request(app)
      .post('/api/auth/refresh-token')
      .send({ refreshToken });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('accessToken');
    expect(res.body.data).toHaveProperty('refreshToken');
  });

  it('should logout user', async () => {
    const res = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ refreshToken });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should request password reset', async () => {
    const res = await request(app)
      .post('/api/auth/request-password-reset')
      .send({ email: testUser.email });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
}); 