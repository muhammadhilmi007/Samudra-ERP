/**
 * Samudra Paket ERP - Integration Tests
 * Role and Permission Management Integration Tests
 */

const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const app = require('../../../../src/app');
const { 
  createTestUser, 
  createTestRole, 
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

describe('Role and Permission Management Integration Tests', () => {
  describe('Role CRUD Operations', () => {
    it('should create a new role with permissions', async () => {
      // Create admin user with ALL permission
      const adminUser = await createTestUser({
        username: 'admin',
        email: 'admin@example.com',
        role: 'ADMIN',
        permissions: ['ALL'],
        isActive: true,
        isEmailVerified: true
      });
      
      const token = generateTestToken(adminUser);
      
      // Create a new role
      const roleData = {
        name: 'Branch Manager',
        description: 'Manages branch operations',
        permissions: [
          'branch.view', 
          'branch.create', 
          'branch.update', 
          'employee.view', 
          'employee.create'
        ]
      };
      
      const response = await request(app)
        .post('/api/roles')
        .set('Authorization', `Bearer ${token}`)
        .send(roleData)
        .expect(201);
        
      expect(response.body.success).toBe(true);
      expect(response.body.data.role.name).toBe(roleData.name);
      expect(response.body.data.role.permissions).toEqual(expect.arrayContaining(roleData.permissions));
      
      // Verify role was created in database
      const roleId = response.body.data.role.id;
      const role = await mongoose.model('Role').findById(roleId);
      expect(role).toBeTruthy();
      expect(role.name).toBe(roleData.name);
    });
    
    it('should update an existing role with new permissions', async () => {
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
      
      // Create a role to update
      const role = await createTestRole({
        name: 'Customer Service',
        permissions: ['customer.view', 'order.view']
      });
      
      // Update the role
      const updateData = {
        name: 'Senior Customer Service',
        description: 'Updated description',
        permissions: ['customer.view', 'customer.update', 'order.view', 'order.update']
      };
      
      const response = await request(app)
        .put(`/api/roles/${role.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(200);
        
      expect(response.body.success).toBe(true);
      expect(response.body.data.role.name).toBe(updateData.name);
      expect(response.body.data.role.permissions).toEqual(expect.arrayContaining(updateData.permissions));
      
      // Verify role was updated in database
      const updatedRole = await mongoose.model('Role').findById(role.id);
      expect(updatedRole.name).toBe(updateData.name);
      expect(updatedRole.permissions).toEqual(expect.arrayContaining(updateData.permissions));
    });
    
    it('should delete a role', async () => {
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
      
      // Create a role to delete
      const role = await createTestRole({
        name: 'Temporary Role',
        permissions: ['temp.view']
      });
      
      // Delete the role
      const response = await request(app)
        .delete(`/api/roles/${role.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
        
      expect(response.body.success).toBe(true);
      
      // Verify role was deleted from database
      const deletedRole = await mongoose.model('Role').findById(role.id);
      expect(deletedRole).toBeNull();
    });
  });
  
  describe('Permission Enforcement', () => {
    it('should allow access to endpoints based on user permissions', async () => {
      // Create a role with specific permissions
      const managerRole = await createTestRole({
        name: 'Branch Manager',
        permissions: ['branch.view', 'branch.update', 'employee.view']
      });
      
      // Create a user with that role
      const managerUser = await createTestUser({
        username: 'manager',
        email: 'manager@example.com',
        role: managerRole.id,
        permissions: managerRole.permissions,
        isActive: true,
        isEmailVerified: true
      });
      
      const token = generateTestToken(managerUser);
      
      // Should allow access to endpoints with matching permissions
      await request(app)
        .get('/api/branches')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
        
      await request(app)
        .get('/api/employees')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
        
      // Should deny access to endpoints without matching permissions
      await request(app)
        .post('/api/employees')
        .set('Authorization', `Bearer ${token}`)
        .send({
          employeeId: 'EMP123',
          fullName: 'New Employee',
          email: 'new@example.com'
        })
        .expect(403);
    });
    
    it('should deny access to unauthorized users', async () => {
      // Create a regular user with minimal permissions
      const regularUser = await createTestUser({
        username: 'regular',
        email: 'regular@example.com',
        role: 'CUSTOMER',
        permissions: ['customer.view'],
        isActive: true,
        isEmailVerified: true
      });
      
      const token = generateTestToken(regularUser);
      
      // Should deny access to admin endpoints
      await request(app)
        .get('/api/roles')
        .set('Authorization', `Bearer ${token}`)
        .expect(403);
        
      await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${token}`)
        .expect(403);
    });
  });
  
  describe('Role Assignment', () => {
    it('should assign a role to a user', async () => {
      // Create admin user
      const adminUser = await createTestUser({
        username: 'admin',
        email: 'admin@example.com',
        role: 'ADMIN',
        permissions: ['ALL'],
        isActive: true,
        isEmailVerified: true
      });
      
      const adminToken = generateTestToken(adminUser);
      
      // Create a role to assign
      const role = await createTestRole({
        name: 'Supervisor',
        permissions: ['employee.view', 'employee.create', 'employee.update']
      });
      
      // Create a regular user
      const regularUser = await createTestUser({
        username: 'regular',
        email: 'regular@example.com',
        isActive: true,
        isEmailVerified: true
      });
      
      // Assign role to user
      const response = await request(app)
        .put(`/api/users/${regularUser.id}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ roleId: role.id })
        .expect(200);
        
      expect(response.body.success).toBe(true);
      
      // Verify role was assigned in database
      const updatedUser = await mongoose.model('User').findById(regularUser.id);
      expect(updatedUser.role.toString()).toBe(role.id.toString());
      expect(updatedUser.permissions).toEqual(expect.arrayContaining(role.permissions));
      
      // Login as the updated user
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: regularUser.username,
          password: 'Password123!' // Default from createTestUser
        })
        .expect(200);
        
      const userToken = loginResponse.body.data.token;
      
      // Should now have access to endpoints based on new role
      await request(app)
        .get('/api/employees')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);
    });
  });
});
