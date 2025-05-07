/**
 * Samudra Paket ERP - Integration Tests
 * Performance Testing for Critical API Endpoints
 */

const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const app = require('../../../src/index');
const { 
  createTestUser, 
  createTestBranch,
  createTestEmployee,
  clearDatabase, 
  generateTestToken 
} = require('../testUtils');

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

/**
 * Helper function to measure response time
 * @param {Function} requestFn - Function that returns a supertest request
 * @returns {Promise<number>} Response time in milliseconds
 */
const measureResponseTime = async (requestFn) => {
  const startTime = Date.now();
  await requestFn();
  return Date.now() - startTime;
};

/**
 * Helper function to run multiple requests and calculate average response time
 * @param {Function} requestFn - Function that returns a supertest request
 * @param {number} count - Number of requests to make
 * @returns {Promise<number>} Average response time in milliseconds
 */
const calculateAverageResponseTime = async (requestFn, count = 5) => {
  const times = [];
  for (let i = 0; i < count; i++) {
    const time = await measureResponseTime(requestFn);
    times.push(time);
  }
  return times.reduce((sum, time) => sum + time, 0) / times.length;
};

describe('Performance Testing for Critical API Endpoints', () => {
  describe('Authentication Endpoints', () => {
    it('should respond to login requests within acceptable time', async () => {
      // Create a test user
      const user = await createTestUser({
        username: 'perftest',
        email: 'perf@example.com',
        isActive: true,
        isEmailVerified: true
      });
      
      // Measure login response time
      const loginRequestFn = () => request(app)
        .post('/api/auth/login')
        .send({
          username: user.username,
          password: 'Password123!' // Default from createTestUser
        })
        .expect(200);
      
      const avgResponseTime = await calculateAverageResponseTime(loginRequestFn);
      
      // Response time should be under 200ms for login
      expect(avgResponseTime).toBeLessThan(200);
    });
  });
  
  describe('Branch Management Endpoints', () => {
    it('should retrieve branches list within acceptable time', async () => {
      // Create user with branch view permission
      const user = await createTestUser({
        username: 'branchviewer',
        email: 'viewer@example.com',
        permissions: ['branch.view'],
        isActive: true,
        isEmailVerified: true
      });
      
      const token = generateTestToken(user);
      
      // Create multiple test branches (20 branches)
      for (let i = 1; i <= 20; i++) {
        await createTestBranch({ 
          code: `BR${i.toString().padStart(2, '0')}`, 
          name: `Branch ${i}` 
        });
      }
      
      // Measure branches list response time
      const branchesRequestFn = () => request(app)
        .get('/api/branches')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      const avgResponseTime = await calculateAverageResponseTime(branchesRequestFn);
      
      // Response time should be under 150ms for branches list with 20 branches
      expect(avgResponseTime).toBeLessThan(150);
    });
    
    it('should retrieve branch details with service areas within acceptable time', async () => {
      // Create user with branch view permission
      const user = await createTestUser({
        username: 'branchviewer',
        email: 'viewer@example.com',
        permissions: ['branch.view'],
        isActive: true,
        isEmailVerified: true
      });
      
      const token = generateTestToken(user);
      
      // Create a branch with service areas
      const branch = await createTestBranch({
        code: 'JKT',
        name: 'Jakarta Branch'
      });
      
      // Create service areas (30 service areas)
      const ServiceAreaModel = mongoose.model('ServiceArea');
      const serviceAreas = [];
      
      for (let i = 1; i <= 30; i++) {
        const serviceArea = new ServiceAreaModel({
          postalCode: `1011${i}`,
          district: `District ${i}`,
          city: 'Jakarta',
          province: 'DKI Jakarta',
          branchId: branch.id
        });
        await serviceArea.save();
        serviceAreas.push(serviceArea.id);
      }
      
      // Update branch with service area references
      branch.serviceAreas = serviceAreas;
      await branch.save();
      
      // Measure branch details response time
      const branchDetailsRequestFn = () => request(app)
        .get(`/api/branches/${branch.id}?include=serviceAreas`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      const avgResponseTime = await calculateAverageResponseTime(branchDetailsRequestFn);
      
      // Response time should be under 200ms for branch details with 30 service areas
      expect(avgResponseTime).toBeLessThan(200);
    });
  });
  
  describe('Employee Management Endpoints', () => {
    it('should retrieve employees list with pagination within acceptable time', async () => {
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
      
      // Create multiple test employees (50 employees)
      for (let i = 1; i <= 50; i++) {
        await createTestEmployee({ 
          employeeId: `EMP${i.toString().padStart(3, '0')}`, 
          fullName: `Employee ${i}`,
          branchId: branch.id,
          positionId: position.id
        });
      }
      
      // Measure employees list response time (first page, 10 per page)
      const employeesRequestFn = () => request(app)
        .get('/api/employees?page=1&limit=10')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      const avgResponseTime = await calculateAverageResponseTime(employeesRequestFn);
      
      // Response time should be under 150ms for employees list with pagination
      expect(avgResponseTime).toBeLessThan(150);
    });
    
    it('should filter employees by branch within acceptable time', async () => {
      // Create user with employee view permission
      const user = await createTestUser({
        username: 'hrviewer',
        email: 'hr@example.com',
        permissions: ['employee.view'],
        isActive: true,
        isEmailVerified: true
      });
      
      const token = generateTestToken(user);
      
      // Create multiple branches
      const branch1 = await createTestBranch({
        code: 'JKT',
        name: 'Jakarta Branch'
      });
      
      const branch2 = await createTestBranch({
        code: 'BDG',
        name: 'Bandung Branch'
      });
      
      // Create a position for employees
      const PositionModel = mongoose.model('Position');
      const position = new PositionModel({
        name: 'Courier',
        department: 'Operations',
        level: 1
      });
      await position.save();
      
      // Create employees in different branches (30 in branch1, 20 in branch2)
      for (let i = 1; i <= 30; i++) {
        await createTestEmployee({ 
          employeeId: `JKT${i.toString().padStart(2, '0')}`, 
          fullName: `Jakarta Employee ${i}`,
          branchId: branch1.id,
          positionId: position.id
        });
      }
      
      for (let i = 1; i <= 20; i++) {
        await createTestEmployee({ 
          employeeId: `BDG${i.toString().padStart(2, '0')}`, 
          fullName: `Bandung Employee ${i}`,
          branchId: branch2.id,
          positionId: position.id
        });
      }
      
      // Measure filtered employees response time
      const filteredEmployeesRequestFn = () => request(app)
        .get(`/api/employees?branchId=${branch1.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      const avgResponseTime = await calculateAverageResponseTime(filteredEmployeesRequestFn);
      
      // Response time should be under 150ms for filtered employees list
      expect(avgResponseTime).toBeLessThan(150);
    });
  });
  
  describe('Search Functionality', () => {
    it('should search employees by name within acceptable time', async () => {
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
      
      // Create multiple test employees with various names
      const names = [
        'John Smith', 'John Doe', 'Jane Smith', 'Jane Doe',
        'Robert Johnson', 'Michael Williams', 'William Brown',
        'James Jones', 'David Miller', 'Richard Davis',
        'Joseph Garcia', 'Thomas Rodriguez', 'Charles Wilson',
        'Christopher Martinez', 'Daniel Anderson', 'Matthew Taylor',
        'Anthony Thomas', 'Donald Harris', 'Mark Jackson',
        'Paul White', 'Steven Harris', 'Andrew Martin',
        'Kenneth Thompson', 'Joshua Garcia', 'Kevin Robinson',
        'Brian Clark', 'George Rodriguez', 'Edward Lewis',
        'Ronald Lee', 'Timothy Walker', 'Jason Allen',
        'Jeffrey Young', 'Ryan Hernandez', 'Jacob King',
        'Gary Wright', 'Nicholas Lopez', 'Eric Hill',
        'Jonathan Scott', 'Stephen Green', 'Larry Adams'
      ];
      
      for (let i = 0; i < names.length; i++) {
        await createTestEmployee({ 
          employeeId: `EMP${i.toString().padStart(3, '0')}`, 
          fullName: names[i],
          branchId: branch.id,
          positionId: position.id
        });
      }
      
      // Measure search response time
      const searchRequestFn = () => request(app)
        .get('/api/employees/search?q=John')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      const avgResponseTime = await calculateAverageResponseTime(searchRequestFn);
      
      // Response time should be under 200ms for search
      expect(avgResponseTime).toBeLessThan(200);
    });
  });
});
