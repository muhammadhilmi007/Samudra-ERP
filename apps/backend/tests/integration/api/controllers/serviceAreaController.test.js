const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../../../src/index');

const adminToken = process.env.TEST_ADMIN_TOKEN || '';

let createdServiceAreaId = '';

describe('Service Area Controller Integration Test', () => {
  afterAll(async () => {
    if (createdServiceAreaId) {
      await mongoose.connection.db.collection('serviceareas').deleteOne({ _id: new mongoose.Types.ObjectId(createdServiceAreaId) });
    }
    await mongoose.disconnect();
  });

  it('should create a new service area', async () => {
    const res = await request(app)
      .post('/api/service-areas')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Test Area',
        code: 'SATEST',
        city: 'Jakarta',
        polygon: [
          [106.800, -6.200],
          [106.801, -6.200],
          [106.801, -6.201],
          [106.800, -6.201],
          [106.800, -6.200]
        ],
        isActive: true,
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('serviceArea');
    createdServiceAreaId = res.body.data.serviceArea._id;
  });

  it('should get all service areas (search/filter)', async () => {
    const res = await request(app)
      .get('/api/service-areas?search=Test')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.serviceAreas)).toBe(true);
  });

  it('should get a single service area by id', async () => {
    const res = await request(app)
      .get(`/api/service-areas/${createdServiceAreaId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.serviceArea._id).toBe(createdServiceAreaId);
  });

  it('should update a service area', async () => {
    const res = await request(app)
      .put(`/api/service-areas/${createdServiceAreaId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ city: 'Depok' });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.serviceArea.city).toBe('Depok');
  });

  it('should check area coverage (point inside)', async () => {
    const res = await request(app)
      .post(`/api/service-areas/${createdServiceAreaId}/coverage`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ longitude: 106.8005, latitude: -6.2005 });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.covered).toBe(true);
  });

  it('should check area coverage (point outside)', async () => {
    const res = await request(app)
      .post(`/api/service-areas/${createdServiceAreaId}/coverage`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ longitude: 107.000, latitude: -6.000 });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.covered).toBe(false);
  });

  it('should delete a service area', async () => {
    const res = await request(app)
      .delete(`/api/service-areas/${createdServiceAreaId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    createdServiceAreaId = '';
  });
}); 