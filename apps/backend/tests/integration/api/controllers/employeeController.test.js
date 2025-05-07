const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../../../src/index');

const adminToken = process.env.TEST_ADMIN_TOKEN || '';

let createdEmployeeId = '';

describe('Employee Controller Integration Test', () => {
  afterAll(async () => {
    if (createdEmployeeId) {
      await mongoose.connection.db.collection('employees').deleteOne({ _id: new mongoose.Types.ObjectId(createdEmployeeId) });
    }
    await mongoose.disconnect();
  });

  it('should create a new employee', async () => {
    const res = await request(app)
      .post('/api/employees')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Test Employee',
        nik: 'EMP123456',
        email: 'employee@example.com',
        phone: '08123456789',
        isActive: true,
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('employee');
    createdEmployeeId = res.body.data.employee._id;
  });

  it('should get all employees (search/filter)', async () => {
    const res = await request(app)
      .get('/api/employees?search=Test')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.employees)).toBe(true);
  });

  it('should get a single employee by id', async () => {
    const res = await request(app)
      .get(`/api/employees/${createdEmployeeId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.employee._id).toBe(createdEmployeeId);
  });

  it('should update an employee', async () => {
    const res = await request(app)
      .put(`/api/employees/${createdEmployeeId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ phone: '08999999999' });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.employee.phone).toBe('08999999999');
  });

  it('should assign user to employee', async () => {
    // Simulasi: assign userId ke employee (pastikan userId valid di DB)
    const userId = process.env.TEST_USER_ID || '';
    if (!userId) return;
    const res = await request(app)
      .patch(`/api/employees/${createdEmployeeId}/assign-user`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ userId });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.employee.userId).toBe(userId);
  });

  it('should assign branch & position to employee', async () => {
    // Simulasi: assign branchId & positionId ke employee (pastikan id valid di DB)
    const branchId = process.env.TEST_BRANCH_ID || '';
    const positionId = process.env.TEST_POSITION_ID || '';
    if (!branchId || !positionId) return;
    const res = await request(app)
      .patch(`/api/employees/${createdEmployeeId}/assign`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ branchId, positionId });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.employee.branchId).toBe(branchId);
    expect(res.body.data.employee.positionId).toBe(positionId);
  });

  it('should update employee status', async () => {
    const res = await request(app)
      .patch(`/api/employees/${createdEmployeeId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ isActive: false });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.employee.isActive).toBe(false);
  });

  it('should upload employee document', async () => {
    // Simulasi upload dokumen (pastikan endpoint ada)
    const res = await request(app)
      .post(`/api/employees/${createdEmployeeId}/documents`)
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('file', Buffer.from('dummy file content'), 'testfile.txt');
    expect([200, 201]).toContain(res.statusCode);
    expect(res.body.success).toBe(true);
  });

  it('should delete an employee', async () => {
    const res = await request(app)
      .delete(`/api/employees/${createdEmployeeId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    createdEmployeeId = '';
  });
}); 