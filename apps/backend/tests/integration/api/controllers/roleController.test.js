const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../../../src/index');

const adminToken = process.env.TEST_ADMIN_TOKEN || '';

let createdRoleId = '';

describe('Role Controller Integration Test', () => {
  afterAll(async () => {
    if (createdRoleId) {
      await mongoose.connection.db.collection('roles').deleteOne({ _id: new mongoose.Types.ObjectId(createdRoleId) });
    }
    await mongoose.disconnect();
  });

  it('should create a new role', async () => {
    const res = await request(app)
      .post('/api/roles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'TestRole', description: 'Role untuk testing' });
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('role');
    createdRoleId = res.body.data.role._id;
  });

  it('should get all roles', async () => {
    const res = await request(app)
      .get('/api/roles')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.roles)).toBe(true);
  });

  it('should update a role', async () => {
    const res = await request(app)
      .put(`/api/roles/${createdRoleId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ description: 'Role updated' });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.role.description).toBe('Role updated');
  });

  it('should delete a role', async () => {
    const res = await request(app)
      .delete(`/api/roles/${createdRoleId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
}); 