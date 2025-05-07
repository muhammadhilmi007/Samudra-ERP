const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../../../src/index');

const adminToken = process.env.TEST_ADMIN_TOKEN || '';

let createdPermissionId = '';

describe('Permission Controller Integration Test', () => {
  afterAll(async () => {
    if (createdPermissionId) {
      await mongoose.connection.db.collection('permissions').deleteOne({ _id: new mongoose.Types.ObjectId(createdPermissionId) });
    }
    await mongoose.disconnect();
  });

  it('should create a new permission', async () => {
    const res = await request(app)
      .post('/api/permissions')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ code: 'TEST_PERMISSION', description: 'Permission untuk testing' });
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('permission');
    createdPermissionId = res.body.data.permission._id;
  });

  it('should get all permissions', async () => {
    const res = await request(app)
      .get('/api/permissions')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.permissions)).toBe(true);
  });

  it('should update a permission', async () => {
    const res = await request(app)
      .put(`/api/permissions/${createdPermissionId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ description: 'Permission updated' });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.permission.description).toBe('Permission updated');
  });

  it('should delete a permission', async () => {
    const res = await request(app)
      .delete(`/api/permissions/${createdPermissionId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
}); 