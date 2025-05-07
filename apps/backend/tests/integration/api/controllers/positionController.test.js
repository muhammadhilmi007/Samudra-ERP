const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../../../src/index');

const adminToken = process.env.TEST_ADMIN_TOKEN || '';

let createdPositionId = '';
let createdSubPositionId = '';

describe('Position Controller Integration Test', () => {
  afterAll(async () => {
    if (createdSubPositionId) {
      await mongoose.connection.db.collection('positions').deleteOne({ _id: new mongoose.Types.ObjectId(createdSubPositionId) });
    }
    if (createdPositionId) {
      await mongoose.connection.db.collection('positions').deleteOne({ _id: new mongoose.Types.ObjectId(createdPositionId) });
    }
    await mongoose.disconnect();
  });

  it('should create a new position', async () => {
    const res = await request(app)
      .post('/api/positions')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Test Position',
        code: 'POSTEST',
        description: 'Posisi untuk testing',
        isActive: true,
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('position');
    createdPositionId = res.body.data.position._id;
  });

  it('should create a sub-position (hierarchy)', async () => {
    const res = await request(app)
      .post('/api/positions')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Sub Position',
        code: 'SUBPOS',
        parentId: createdPositionId,
        isActive: true,
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.position.parentId).toBe(createdPositionId);
    createdSubPositionId = res.body.data.position._id;
  });

  it('should get all positions (search/filter)', async () => {
    const res = await request(app)
      .get('/api/positions?search=Test')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.positions)).toBe(true);
  });

  it('should get a single position by id', async () => {
    const res = await request(app)
      .get(`/api/positions/${createdPositionId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.position._id).toBe(createdPositionId);
  });

  it('should update a position', async () => {
    const res = await request(app)
      .put(`/api/positions/${createdPositionId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ description: 'Posisi updated' });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.position.description).toBe('Posisi updated');
  });

  it('should delete a sub-position', async () => {
    const res = await request(app)
      .delete(`/api/positions/${createdSubPositionId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    createdSubPositionId = '';
  });

  it('should delete a position', async () => {
    const res = await request(app)
      .delete(`/api/positions/${createdPositionId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    createdPositionId = '';
  });
}); 