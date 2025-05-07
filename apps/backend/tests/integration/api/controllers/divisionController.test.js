const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../../../src/index');

const adminToken = process.env.TEST_ADMIN_TOKEN || '';

let createdDivisionId = '';
let createdSubDivisionId = '';

describe('Division Controller Integration Test', () => {
  afterAll(async () => {
    if (createdSubDivisionId) {
      await mongoose.connection.db.collection('divisions').deleteOne({ _id: new mongoose.Types.ObjectId(createdSubDivisionId) });
    }
    if (createdDivisionId) {
      await mongoose.connection.db.collection('divisions').deleteOne({ _id: new mongoose.Types.ObjectId(createdDivisionId) });
    }
    await mongoose.disconnect();
  });

  it('should create a new division', async () => {
    const res = await request(app)
      .post('/api/divisions')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Test Division',
        code: 'DIVTEST',
        description: 'Divisi untuk testing',
        isActive: true,
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('division');
    createdDivisionId = res.body.data.division._id;
  });

  it('should create a sub-division (hierarchy)', async () => {
    const res = await request(app)
      .post('/api/divisions')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Sub Division',
        code: 'SUBDIV',
        parentId: createdDivisionId,
        isActive: true,
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.division.parentId).toBe(createdDivisionId);
    createdSubDivisionId = res.body.data.division._id;
  });

  it('should get all divisions (search/filter)', async () => {
    const res = await request(app)
      .get('/api/divisions?search=Test')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.divisions)).toBe(true);
  });

  it('should get a single division by id', async () => {
    const res = await request(app)
      .get(`/api/divisions/${createdDivisionId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.division._id).toBe(createdDivisionId);
  });

  it('should update a division', async () => {
    const res = await request(app)
      .put(`/api/divisions/${createdDivisionId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ description: 'Divisi updated' });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.division.description).toBe('Divisi updated');
  });

  it('should delete a sub-division', async () => {
    const res = await request(app)
      .delete(`/api/divisions/${createdSubDivisionId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    createdSubDivisionId = '';
  });

  it('should delete a division', async () => {
    const res = await request(app)
      .delete(`/api/divisions/${createdDivisionId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    createdDivisionId = '';
  });
}); 