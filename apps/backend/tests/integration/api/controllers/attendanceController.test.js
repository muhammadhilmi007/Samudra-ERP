const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../../../src/index');

const adminToken = process.env.TEST_ADMIN_TOKEN || '';
const employeeId = process.env.TEST_EMPLOYEE_ID || '';

let createdAttendanceId = '';
let createdLeaveId = '';

describe('Attendance Controller Integration Test', () => {
  afterAll(async () => {
    if (createdAttendanceId) {
      await mongoose.connection.db.collection('attendances').deleteOne({ _id: new mongoose.Types.ObjectId(createdAttendanceId) });
    }
    if (createdLeaveId) {
      await mongoose.connection.db.collection('leaves').deleteOne({ _id: new mongoose.Types.ObjectId(createdLeaveId) });
    }
    await mongoose.disconnect();
  });

  it('should record check-in attendance', async () => {
    const res = await request(app)
      .post('/api/attendances')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        employeeId,
        type: 'check-in',
        timestamp: new Date().toISOString(),
        location: { longitude: 106.8, latitude: -6.2 },
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('attendance');
    createdAttendanceId = res.body.data.attendance._id;
  });

  it('should get all attendance records (search/filter)', async () => {
    const res = await request(app)
      .get('/api/attendances?search=Test')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.attendances)).toBe(true);
  });

  it('should get a single attendance record by id', async () => {
    const res = await request(app)
      .get(`/api/attendances/${createdAttendanceId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.attendance._id).toBe(createdAttendanceId);
  });

  it('should update an attendance record', async () => {
    const res = await request(app)
      .put(`/api/attendances/${createdAttendanceId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ note: 'Updated note' });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.attendance.note).toBe('Updated note');
  });

  it('should delete an attendance record', async () => {
    const res = await request(app)
      .delete(`/api/attendances/${createdAttendanceId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    createdAttendanceId = '';
  });

  it('should get attendance report', async () => {
    const res = await request(app)
      .get(`/api/attendances/report?employeeId=${employeeId}&month=2024-06`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('report');
  });

  // Leave management
  it('should apply for leave', async () => {
    const res = await request(app)
      .post('/api/leaves')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        employeeId,
        type: 'annual',
        startDate: '2024-06-10',
        endDate: '2024-06-12',
        reason: 'Cuti tahunan',
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('leave');
    createdLeaveId = res.body.data.leave._id;
  });

  it('should approve leave', async () => {
    if (!createdLeaveId) return;
    const res = await request(app)
      .patch(`/api/leaves/${createdLeaveId}/approve`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.leave.status).toBe('approved');
  });

  it('should reject leave', async () => {
    // Simulasi reject leave (buat leave baru dulu jika perlu)
    const res = await request(app)
      .post('/api/leaves')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        employeeId,
        type: 'annual',
        startDate: '2024-06-15',
        endDate: '2024-06-16',
        reason: 'Cuti tahunan',
      });
    expect(res.statusCode).toBe(201);
    const leaveId = res.body.data.leave._id;
    const rejectRes = await request(app)
      .patch(`/api/leaves/${leaveId}/reject`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(rejectRes.statusCode).toBe(200);
    expect(rejectRes.body.success).toBe(true);
    expect(rejectRes.body.data.leave.status).toBe('rejected');
    // Cleanup
    await mongoose.connection.db.collection('leaves').deleteOne({ _id: new mongoose.Types.ObjectId(leaveId) });
  });
});
