const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../../../src/index');

const adminToken = process.env.TEST_ADMIN_TOKEN || '';

let createdBranchId = '';

describe('Branch Controller Integration Test', () => {
  afterAll(async () => {
    if (createdBranchId) {
      await mongoose.connection.db.collection('branches').deleteOne({ _id: new mongoose.Types.ObjectId(createdBranchId) });
    }
    await mongoose.disconnect();
  });

  it('should create a new branch', async () => {
    const res = await request(app)
      .post('/api/branches')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Test Branch',
        code: 'BRTEST',
        address: 'Jl. Testing No. 1',
        city: 'Jakarta',
        isActive: true,
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('branch');
    createdBranchId = res.body.data.branch._id;
  });

  it('should get all branches (search/filter)', async () => {
    const res = await request(app)
      .get('/api/branches?search=Test')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.branches)).toBe(true);
  });

  it('should get a single branch by id', async () => {
    const res = await request(app)
      .get(`/api/branches/${createdBranchId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.branch._id).toBe(createdBranchId);
  });

  it('should update a branch', async () => {
    const res = await request(app)
      .put(`/api/branches/${createdBranchId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ address: 'Jl. Testing No. 2' });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.branch.address).toBe('Jl. Testing No. 2');
  });

  it('should update branch status (active/inactive)', async () => {
    const res = await request(app)
      .patch(`/api/branches/${createdBranchId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ isActive: false });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.branch.isActive).toBe(false);
  });

  it('should delete a branch', async () => {
    const res = await request(app)
      .delete(`/api/branches/${createdBranchId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    createdBranchId = '';
  });
}); 