const request = require('supertest');
const app = require('../../../../src/index');

const adminToken = process.env.TEST_ADMIN_TOKEN || '';
const userToken = process.env.TEST_USER_TOKEN || '';

describe('Authorization Middleware Integration Test', () => {
  it('should allow access for user with correct permission', async () => {
    const res = await request(app)
      .get('/api/roles') // Endpoint yang butuh permission tertentu
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should block access for user without permission', async () => {
    const res = await request(app)
      .post('/api/roles')
      .set('Authorization', `Bearer ${userToken}`); // Token user biasa tanpa permission
    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });
}); 