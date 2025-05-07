const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../../../src/index');

const adminToken = process.env.TEST_ADMIN_TOKEN || '';

let createdForwarderId = '';

describe('Forwarder Controller Integration Test', () => {
  afterAll(async () => {
    if (createdForwarderId) {
      await mongoose.connection.db.collection('forwarders').deleteOne({ _id: new mongoose.Types.ObjectId(createdForwarderId) });
    }
    await mongoose.disconnect();
  });

  it('should create a new forwarder partner', async () => {
    const res = await request(app)
      .post('/api/forwarders')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Test Forwarder',
        code: 'FWDTEST',
        contact: '08123456789',
        email: 'forwarder@example.com',
        isActive: true,
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('forwarder');
    createdForwarderId = res.body.data.forwarder._id;
  });

  it('should get all forwarders (search/filter)', async () => {
    const res = await request(app)
      .get('/api/forwarders?search=Test')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.forwarders)).toBe(true);
  });

  it('should get a single forwarder by id', async () => {
    const res = await request(app)
      .get(`/api/forwarders/${createdForwarderId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.forwarder._id).toBe(createdForwarderId);
  });

  it('should update a forwarder', async () => {
    const res = await request(app)
      .put(`/api/forwarders/${createdForwarderId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ contact: '08999999999' });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.forwarder.contact).toBe('08999999999');
  });

  it('should assign area to forwarder', async () => {
    const res = await request(app)
      .post(`/api/forwarders/${createdForwarderId}/areas`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        areaCode: 'JKT01',
        areaName: 'Jakarta Area',
      });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.forwarder.areas.some(a => a.areaCode === 'JKT01')).toBe(true);
  });

  it('should assign/update rate to forwarder', async () => {
    const res = await request(app)
      .post(`/api/forwarders/${createdForwarderId}/rates`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        origin: 'JKT',
        destination: 'BDG',
        rate: 15000,
        service: 'REG',
      });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.forwarder.rates.some(r => r.origin === 'JKT' && r.destination === 'BDG')).toBe(true);
  });

  it('should call integration endpoint (simulate integration)', async () => {
    const res = await request(app)
      .post(`/api/forwarders/${createdForwarderId}/integrate`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ action: 'sync' });
    expect([200, 201, 202]).toContain(res.statusCode);
    expect(res.body.success).toBe(true);
  });

  it('should delete a forwarder', async () => {
    const res = await request(app)
      .delete(`/api/forwarders/${createdForwarderId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    createdForwarderId = '';
  });
}); 