/**
 * Samudra Paket ERP - Integration Tests
 * Employee Management Integration Tests
 */

const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const app = require('../../../../src/app');
const { 
  createTestUser, 
  createTestBranch,
  createTestEmployee,
  clearDatabase, 
  generateTestToken 
} = require('../../testUtils');

let mongoServer;

// Setup test database
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

// Clean up after tests
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// Reset database before each test
beforeEach(async () => {
  await clearDatabase();
});

describe('Employee Management Integration Tests', () => {
  describe('Employee CRUD Operations', () => {
    it('should create a new employee', async () => {
      // Create admin user
      const adminUser = await createTestUser({
        username: 'admin',
        email: 'admin@example.com',
        role: 'ADMIN',
        permissions: ['ALL'],
        isActive: true,
        isEmailVerified: true
      });
      
      const token = generateTestToken(adminUser);
      
      // Create a branch for the employee
      const branch = await createTestBranch({
        code: 'JKT',
        name: 'Jakarta Branch'
      });
      
      // Create a position for the employee
      const PositionModel = mongoose.model('Position');
      const position = new PositionModel({
        name: 'Courier',
        department: 'Operations',
        level: 1
      });
      await position.save();
      
      // Create a new employee
      const employeeData = {
        employeeId: 'EMP001',
        fullName: 'John Doe',
        email: 'john.doe@samudrapaket.com',
        phoneNumber: '081234567890',
        address: 'Jl. Sudirman No. 123, Jakarta',
        branchId: branch.id,
        positionId: position.id,
        joinDate: '2025-01-15',
        isActive: true
      };
      
      const response = await request(app)
        .post('/api/employees')
        .set('Authorization', `Bearer ${token}`)
        .send(employeeData)
        .expect(201);
        
      expect(response.body.success).toBe(true);
      expect(response.body.data.employee.employeeId).toBe(employeeData.employeeId);
      expect(response.body.data.employee.fullName).toBe(employeeData.fullName);
      
      // Verify employee was created in database
      const employeeId = response.body.data.employee.id;
      const employee = await mongoose.model('Employee').findById(employeeId);
      expect(employee).toBeTruthy();
      expect(employee.employeeId).toBe(employeeData.employeeId);
    });
    
    it('should retrieve a list of employees', async () => {
      // Create user with employee view permission
      const user = await createTestUser({
        username: 'hrviewer',
        email: 'hr@example.com',
        permissions: ['employee.view'],
        isActive: true,
        isEmailVerified: true
      });
      
      const token = generateTestToken(user);
      
      // Create a branch for employees
      const branch = await createTestBranch({
        code: 'JKT',
        name: 'Jakarta Branch'
      });
      
      // Create a position for employees
      const PositionModel = mongoose.model('Position');
      const position = new PositionModel({
        name: 'Courier',
        department: 'Operations',
        level: 1
      });
      await position.save();
      
      // Create multiple test employees
      await createTestEmployee({ 
        employeeId: 'EMP001', 
        fullName: 'John Doe',
        branchId: branch.id,
        positionId: position.id
      });
      
      await createTestEmployee({ 
        employeeId: 'EMP002', 
        fullName: 'Jane Smith',
        branchId: branch.id,
        positionId: position.id
      });
      
      await createTestEmployee({ 
        employeeId: 'EMP003', 
        fullName: 'Bob Johnson',
        branchId: branch.id,
        positionId: position.id
      });
      
      // Retrieve employees
      const response = await request(app)
        .get('/api/employees')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
        
      expect(response.body.success).toBe(true);
      expect(response.body.data.employees.length).toBe(3);
      expect(response.body.data.employees.map(e => e.employeeId)).toContain('EMP001');
      expect(response.body.data.employees.map(e => e.employeeId)).toContain('EMP002');
      expect(response.body.data.employees.map(e => e.employeeId)).toContain('EMP003');
    });
    
    it('should update an existing employee', async () => {
      // Create admin user
      const adminUser = await createTestUser({
        username: 'admin',
        email: 'admin@example.com',
        role: 'ADMIN',
        permissions: ['ALL'],
        isActive: true,
        isEmailVerified: true
      });
      
      const token = generateTestToken(adminUser);
      
      // Create a branch
      const branch = await createTestBranch({
        code: 'JKT',
        name: 'Jakarta Branch'
      });
      
      // Create a position
      const PositionModel = mongoose.model('Position');
      const position = new PositionModel({
        name: 'Courier',
        department: 'Operations',
        level: 1
      });
      await position.save();
      
      // Create an employee to update
      const employee = await createTestEmployee({
        employeeId: 'EMP001',
        fullName: 'John Doe',
        email: 'john.doe@samudrapaket.com',
        branchId: branch.id,
        positionId: position.id
      });
      
      // Create a new position for promotion
      const seniorPosition = new PositionModel({
        name: 'Senior Courier',
        department: 'Operations',
        level: 2
      });
      await seniorPosition.save();
      
      // Update the employee
      const updateData = {
        fullName: 'John A. Doe',
        phoneNumber: '081234567891',
        positionId: seniorPosition.id,
        address: 'Jl. Gatot Subroto No. 456, Jakarta'
      };
      
      const response = await request(app)
        .put(`/api/employees/${employee.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(200);
        
      expect(response.body.success).toBe(true);
      expect(response.body.data.employee.fullName).toBe(updateData.fullName);
      expect(response.body.data.employee.phoneNumber).toBe(updateData.phoneNumber);
      
      // Verify employee was updated in database
      const updatedEmployee = await mongoose.model('Employee').findById(employee.id);
      expect(updatedEmployee.fullName).toBe(updateData.fullName);
      expect(updatedEmployee.phoneNumber).toBe(updateData.phoneNumber);
      expect(updatedEmployee.positionId.toString()).toBe(seniorPosition.id.toString());
    });
    
    it('should deactivate an employee', async () => {
      // Create admin user
      const adminUser = await createTestUser({
        username: 'admin',
        email: 'admin@example.com',
        role: 'ADMIN',
        permissions: ['ALL'],
        isActive: true,
        isEmailVerified: true
      });
      
      const token = generateTestToken(adminUser);
      
      // Create an employee to deactivate
      const employee = await createTestEmployee({
        employeeId: 'EMP001',
        fullName: 'John Doe',
        isActive: true
      });
      
      // Deactivate the employee
      const response = await request(app)
        .patch(`/api/employees/${employee.id}/status`)
        .set('Authorization', `Bearer ${token}`)
        .send({ isActive: false })
        .expect(200);
        
      expect(response.body.success).toBe(true);
      expect(response.body.data.employee.isActive).toBe(false);
      
      // Verify employee was deactivated in database
      const updatedEmployee = await mongoose.model('Employee').findById(employee.id);
      expect(updatedEmployee.isActive).toBe(false);
    });
  });
  
  describe('Employee Branch Transfer', () => {
    it('should transfer an employee to another branch', async () => {
      // Create admin user
      const adminUser = await createTestUser({
        username: 'admin',
        email: 'admin@example.com',
        role: 'ADMIN',
        permissions: ['ALL'],
        isActive: true,
        isEmailVerified: true
      });
      
      const token = generateTestToken(adminUser);
      
      // Create source and target branches
      const sourceBranch = await createTestBranch({
        code: 'JKT',
        name: 'Jakarta Branch'
      });
      
      const targetBranch = await createTestBranch({
        code: 'BDG',
        name: 'Bandung Branch'
      });
      
      // Create an employee to transfer
      const employee = await createTestEmployee({
        employeeId: 'EMP001',
        fullName: 'John Doe',
        branchId: sourceBranch.id
      });
      
      // Transfer the employee
      const transferData = {
        branchId: targetBranch.id,
        transferDate: '2025-05-01',
        reason: 'Business needs'
      };
      
      const response = await request(app)
        .post(`/api/employees/${employee.id}/transfer`)
        .set('Authorization', `Bearer ${token}`)
        .send(transferData)
        .expect(200);
        
      expect(response.body.success).toBe(true);
      expect(response.body.data.employee.branchId).toBe(targetBranch.id);
      
      // Verify employee was transferred in database
      const updatedEmployee = await mongoose.model('Employee').findById(employee.id);
      expect(updatedEmployee.branchId.toString()).toBe(targetBranch.id.toString());
      
      // Verify transfer history was created
      const TransferModel = mongoose.model('EmployeeTransfer');
      const transferHistory = await TransferModel.findOne({ employeeId: employee.id });
      expect(transferHistory).toBeTruthy();
      expect(transferHistory.fromBranchId.toString()).toBe(sourceBranch.id.toString());
      expect(transferHistory.toBranchId.toString()).toBe(targetBranch.id.toString());
      expect(transferHistory.reason).toBe(transferData.reason);
    });
  });
  
  describe('Employee Access Control', () => {
    it('should restrict employee operations based on user permissions', async () => {
      // Create a user with only employee view permission
      const viewOnlyUser = await createTestUser({
        username: 'viewonly',
        email: 'viewonly@example.com',
        permissions: ['employee.view'],
        isActive: true,
        isEmailVerified: true
      });
      
      const viewToken = generateTestToken(viewOnlyUser);
      
      // Create an employee
      const employee = await createTestEmployee({
        employeeId: 'EMP001',
        fullName: 'John Doe'
      });
      
      // Should allow viewing employees
      await request(app)
        .get('/api/employees')
        .set('Authorization', `Bearer ${viewToken}`)
        .expect(200);
        
      await request(app)
        .get(`/api/employees/${employee.id}`)
        .set('Authorization', `Bearer ${viewToken}`)
        .expect(200);
        
      // Should deny creating, updating, or deactivating employees
      await request(app)
        .post('/api/employees')
        .set('Authorization', `Bearer ${viewToken}`)
        .send({
          employeeId: 'EMP002',
          fullName: 'Jane Smith'
        })
        .expect(403);
        
      await request(app)
        .put(`/api/employees/${employee.id}`)
        .set('Authorization', `Bearer ${viewToken}`)
        .send({
          fullName: 'John A. Doe'
        })
        .expect(403);
        
      await request(app)
        .patch(`/api/employees/${employee.id}/status`)
        .set('Authorization', `Bearer ${viewToken}`)
        .send({ isActive: false })
        .expect(403);
    });
  });
});
