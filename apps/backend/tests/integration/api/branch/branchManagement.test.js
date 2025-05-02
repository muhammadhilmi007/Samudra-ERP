/**
 * Samudra Paket ERP - Integration Tests
 * Branch Management Integration Tests
 */

const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const app = require('../../../../src/app');
const { 
  createTestUser, 
  createTestBranch, 
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

describe('Branch Management Integration Tests', () => {
  describe('Branch CRUD Operations', () => {
    it('should create a new branch', async () => {
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
      
      // Create a new branch
      const branchData = {
        code: 'JKT',
        name: 'Jakarta Branch',
        address: 'Jl. Sudirman No. 123',
        city: 'Jakarta',
        province: 'DKI Jakarta',
        phoneNumber: '021-5551234',
        email: 'jakarta@samudrapaket.com',
        isActive: true
      };
      
      const response = await request(app)
        .post('/api/branches')
        .set('Authorization', `Bearer ${token}`)
        .send(branchData)
        .expect(201);
        
      expect(response.body.success).toBe(true);
      expect(response.body.data.branch.code).toBe(branchData.code);
      expect(response.body.data.branch.name).toBe(branchData.name);
      
      // Verify branch was created in database
      const branchId = response.body.data.branch.id;
      const branch = await mongoose.model('Branch').findById(branchId);
      expect(branch).toBeTruthy();
      expect(branch.code).toBe(branchData.code);
    });
    
    it('should retrieve a list of branches', async () => {
      // Create user with branch view permission
      const user = await createTestUser({
        username: 'branchviewer',
        email: 'viewer@example.com',
        permissions: ['branch.view'],
        isActive: true,
        isEmailVerified: true
      });
      
      const token = generateTestToken(user);
      
      // Create multiple test branches
      await createTestBranch({ code: 'JKT', name: 'Jakarta Branch' });
      await createTestBranch({ code: 'BDG', name: 'Bandung Branch' });
      await createTestBranch({ code: 'SBY', name: 'Surabaya Branch' });
      
      // Retrieve branches
      const response = await request(app)
        .get('/api/branches')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
        
      expect(response.body.success).toBe(true);
      expect(response.body.data.branches.length).toBe(3);
      expect(response.body.data.branches.map(b => b.code)).toContain('JKT');
      expect(response.body.data.branches.map(b => b.code)).toContain('BDG');
      expect(response.body.data.branches.map(b => b.code)).toContain('SBY');
    });
    
    it('should update an existing branch', async () => {
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
      
      // Create a branch to update
      const branch = await createTestBranch({
        code: 'BDG',
        name: 'Bandung Branch',
        address: 'Jl. Asia Afrika No. 456',
        city: 'Bandung'
      });
      
      // Update the branch
      const updateData = {
        name: 'Bandung Main Branch',
        address: 'Jl. Braga No. 789',
        phoneNumber: '022-4445678',
        email: 'bandung.main@samudrapaket.com'
      };
      
      const response = await request(app)
        .put(`/api/branches/${branch.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(200);
        
      expect(response.body.success).toBe(true);
      expect(response.body.data.branch.name).toBe(updateData.name);
      expect(response.body.data.branch.address).toBe(updateData.address);
      
      // Verify branch was updated in database
      const updatedBranch = await mongoose.model('Branch').findById(branch.id);
      expect(updatedBranch.name).toBe(updateData.name);
      expect(updatedBranch.address).toBe(updateData.address);
    });
    
    it('should delete a branch', async () => {
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
      
      // Create a branch to delete
      const branch = await createTestBranch({
        code: 'TMP',
        name: 'Temporary Branch'
      });
      
      // Delete the branch
      const response = await request(app)
        .delete(`/api/branches/${branch.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
        
      expect(response.body.success).toBe(true);
      
      // Verify branch was deleted from database
      const deletedBranch = await mongoose.model('Branch').findById(branch.id);
      expect(deletedBranch).toBeNull();
    });
  });
  
  describe('Branch Service Area Management', () => {
    it('should add service areas to a branch', async () => {
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
      
      // Add service areas
      const serviceAreasData = {
        serviceAreas: [
          {
            postalCode: '10110',
            district: 'Menteng',
            city: 'Jakarta Pusat',
            province: 'DKI Jakarta'
          },
          {
            postalCode: '10210',
            district: 'Gambir',
            city: 'Jakarta Pusat',
            province: 'DKI Jakarta'
          }
        ]
      };
      
      const response = await request(app)
        .post(`/api/branches/${branch.id}/service-areas`)
        .set('Authorization', `Bearer ${token}`)
        .send(serviceAreasData)
        .expect(200);
        
      expect(response.body.success).toBe(true);
      expect(response.body.data.serviceAreas.length).toBe(2);
      
      // Verify service areas were added in database
      const updatedBranch = await mongoose.model('Branch').findById(branch.id).populate('serviceAreas');
      expect(updatedBranch.serviceAreas.length).toBe(2);
      expect(updatedBranch.serviceAreas[0].postalCode).toBe('10110');
      expect(updatedBranch.serviceAreas[1].postalCode).toBe('10210');
    });
    
    it('should retrieve service areas for a branch', async () => {
      // Create user with branch view permission
      const user = await createTestUser({
        username: 'viewer',
        email: 'viewer@example.com',
        permissions: ['branch.view'],
        isActive: true,
        isEmailVerified: true
      });
      
      const token = generateTestToken(user);
      
      // Create a branch with service areas
      const branch = await createTestBranch({
        code: 'SBY',
        name: 'Surabaya Branch'
      });
      
      // Create service areas
      const ServiceAreaModel = mongoose.model('ServiceArea');
      const serviceArea1 = new ServiceAreaModel({
        postalCode: '60111',
        district: 'Genteng',
        city: 'Surabaya',
        province: 'Jawa Timur',
        branchId: branch.id
      });
      await serviceArea1.save();
      
      const serviceArea2 = new ServiceAreaModel({
        postalCode: '60112',
        district: 'Bubutan',
        city: 'Surabaya',
        province: 'Jawa Timur',
        branchId: branch.id
      });
      await serviceArea2.save();
      
      // Update branch with service area references
      branch.serviceAreas = [serviceArea1.id, serviceArea2.id];
      await branch.save();
      
      // Retrieve service areas
      const response = await request(app)
        .get(`/api/branches/${branch.id}/service-areas`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
        
      expect(response.body.success).toBe(true);
      expect(response.body.data.serviceAreas.length).toBe(2);
      expect(response.body.data.serviceAreas[0].postalCode).toBe('60111');
      expect(response.body.data.serviceAreas[1].postalCode).toBe('60112');
    });
  });
  
  describe('Branch Access Control', () => {
    it('should restrict branch operations based on user permissions', async () => {
      // Create a user with only branch view permission
      const viewOnlyUser = await createTestUser({
        username: 'viewonly',
        email: 'viewonly@example.com',
        permissions: ['branch.view'],
        isActive: true,
        isEmailVerified: true
      });
      
      const viewToken = generateTestToken(viewOnlyUser);
      
      // Create a branch
      const branch = await createTestBranch({
        code: 'TST',
        name: 'Test Branch'
      });
      
      // Should allow viewing branches
      await request(app)
        .get('/api/branches')
        .set('Authorization', `Bearer ${viewToken}`)
        .expect(200);
        
      await request(app)
        .get(`/api/branches/${branch.id}`)
        .set('Authorization', `Bearer ${viewToken}`)
        .expect(200);
        
      // Should deny creating, updating, or deleting branches
      await request(app)
        .post('/api/branches')
        .set('Authorization', `Bearer ${viewToken}`)
        .send({
          code: 'NEW',
          name: 'New Branch'
        })
        .expect(403);
        
      await request(app)
        .put(`/api/branches/${branch.id}`)
        .set('Authorization', `Bearer ${viewToken}`)
        .send({
          name: 'Updated Branch'
        })
        .expect(403);
        
      await request(app)
        .delete(`/api/branches/${branch.id}`)
        .set('Authorization', `Bearer ${viewToken}`)
        .expect(403);
    });
  });
});
