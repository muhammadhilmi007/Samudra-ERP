/**
 * Samudra Paket ERP - Customer Repository Tests
 * Unit tests for the customer repository
 */

const mongoose = require('mongoose');
const customerRepository = require('../../../src/domain/repositories/customerRepository');
const Customer = require('../../../src/domain/models/customer');

describe('Customer Repository', () => {
  let testCustomerId;
  let branchId;
  let userId;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/samudra_test', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Create test IDs
    branchId = new mongoose.Types.ObjectId();
    userId = new mongoose.Types.ObjectId();
  });

  afterAll(async () => {
    // Disconnect from test database
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Create a test customer before each test
    const customerData = {
      code: 'CUST001',
      name: 'Test Customer',
      type: 'business',
      category: 'regular',
      contactInfo: {
        primaryPhone: '08123456789',
        email: 'test@example.com',
      },
      address: {
        street: 'Jl. Test No. 123',
        city: 'Jakarta',
        province: 'DKI Jakarta',
        postalCode: '12345',
      },
      branch: branchId,
      registeredBy: userId,
    };

    const customer = await customerRepository.createCustomer(customerData);
    testCustomerId = customer._id;
  });

  afterEach(async () => {
    // Clean up the database after each test
    await Customer.deleteMany({});
  });

  describe('createCustomer', () => {
    it('should create a new customer', async () => {
      const newCustomerData = {
        code: 'CUST002',
        name: 'New Test Customer',
        type: 'individual',
        category: 'premium',
        contactInfo: {
          primaryPhone: '08987654321',
          email: 'new@example.com',
        },
        address: {
          street: 'Jl. New No. 456',
          city: 'Bandung',
          province: 'Jawa Barat',
          postalCode: '54321',
        },
        branch: branchId,
      };

      const result = await customerRepository.createCustomer(newCustomerData);

      expect(result).toBeDefined();
      expect(result._id).toBeDefined();
      expect(result.code).toBe(newCustomerData.code);
      expect(result.name).toBe(newCustomerData.name);
      expect(result.type).toBe(newCustomerData.type);
      expect(result.category).toBe(newCustomerData.category);
    });
  });

  describe('getAllCustomers', () => {
    it('should retrieve all customers with pagination', async () => {
      // Create additional test customers
      await customerRepository.createCustomer({
        code: 'CUST003',
        name: 'Another Customer',
        contactInfo: { primaryPhone: '08111222333' },
        address: {
          street: 'Jl. Another',
          city: 'Surabaya',
          province: 'Jawa Timur',
          postalCode: '60000',
        },
        branch: branchId,
      });

      await customerRepository.createCustomer({
        code: 'CUST004',
        name: 'Yet Another Customer',
        contactInfo: { primaryPhone: '08444555666' },
        address: {
          street: 'Jl. Yet Another',
          city: 'Medan',
          province: 'Sumatera Utara',
          postalCode: '20000',
        },
        branch: branchId,
      });

      const result = await customerRepository.getAllCustomers({}, { page: 1, limit: 10 });

      expect(result).toBeDefined();
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data.length).toBe(3); // Our 3 test customers
      expect(result.meta).toBeDefined();
      expect(result.meta.total).toBe(3);
      expect(result.meta.page).toBe(1);
    });

    it('should filter customers by search query', async () => {
      // Create additional test customers with specific names for search
      await customerRepository.createCustomer({
        code: 'CUST003',
        name: 'Unique Name Customer',
        contactInfo: { primaryPhone: '08111222333' },
        address: {
          street: 'Jl. Another',
          city: 'Surabaya',
          province: 'Jawa Timur',
          postalCode: '60000',
        },
        branch: branchId,
      });

      const result = await customerRepository.getAllCustomers({}, { search: 'Unique' });

      expect(result).toBeDefined();
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data.length).toBe(1);
      expect(result.data[0].name).toBe('Unique Name Customer');
    });

    it('should filter customers by category', async () => {
      // Create additional test customers with different categories
      await customerRepository.createCustomer({
        code: 'CUST003',
        name: 'VIP Customer',
        category: 'vip',
        contactInfo: { primaryPhone: '08111222333' },
        address: {
          street: 'Jl. VIP',
          city: 'Jakarta',
          province: 'DKI Jakarta',
          postalCode: '12345',
        },
        branch: branchId,
      });

      const result = await customerRepository.getAllCustomers({}, { category: 'vip' });

      expect(result).toBeDefined();
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data.length).toBe(1);
      expect(result.data[0].name).toBe('VIP Customer');
      expect(result.data[0].category).toBe('vip');
    });
  });

  describe('getCustomerById', () => {
    it('should retrieve a customer by ID', async () => {
      const result = await customerRepository.getCustomerById(testCustomerId);

      expect(result).toBeDefined();
      expect(result._id.toString()).toBe(testCustomerId.toString());
      expect(result.code).toBe('CUST001');
      expect(result.name).toBe('Test Customer');
    });

    it('should return null for non-existent ID', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const result = await customerRepository.getCustomerById(nonExistentId);

      expect(result).toBeNull();
    });
  });

  describe('updateCustomer', () => {
    it('should update a customer', async () => {
      const updateData = {
        name: 'Updated Customer Name',
        category: 'vip',
        contactInfo: {
          primaryPhone: '08999888777',
          email: 'updated@example.com',
        },
      };

      const result = await customerRepository.updateCustomer(testCustomerId, updateData);

      expect(result).toBeDefined();
      expect(result._id.toString()).toBe(testCustomerId.toString());
      expect(result.name).toBe(updateData.name);
      expect(result.category).toBe(updateData.category);
      expect(result.contactInfo.primaryPhone).toBe(updateData.contactInfo.primaryPhone);
      expect(result.contactInfo.email).toBe(updateData.contactInfo.email);
    });
  });

  describe('addCustomerActivity', () => {
    it('should add activity to customer history', async () => {
      const action = 'test-action';
      const details = { note: 'Test activity from repository' };

      await customerRepository.addCustomerActivity(testCustomerId, action, userId, details);

      // Get updated customer to verify
      const customer = await Customer.findById(testCustomerId);

      expect(customer.activityHistory).toHaveLength(1);
      expect(customer.activityHistory[0].action).toBe(action);
      expect(customer.activityHistory[0].performedBy.toString()).toBe(userId.toString());
      expect(customer.activityHistory[0].details).toEqual(details);
    });
  });

  describe('getCustomerActivityHistory', () => {
    it('should retrieve customer activity history with pagination', async () => {
      // Add multiple activities
      await customerRepository.addCustomerActivity(
        testCustomerId, 'action1', userId, { note: 'Activity 1' }
      );
      await customerRepository.addCustomerActivity(
        testCustomerId, 'action2', userId, { note: 'Activity 2' }
      );
      await customerRepository.addCustomerActivity(
        testCustomerId, 'action3', userId, { note: 'Activity 3' }
      );

      const result = await customerRepository.getCustomerActivityHistory(
        testCustomerId, { page: 1, limit: 2 }
      );

      expect(result).toBeDefined();
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data.length).toBe(2); // Limited to 2 by pagination
      expect(result.meta).toBeDefined();
      expect(result.meta.total).toBe(3); // Total 3 activities
      expect(result.meta.page).toBe(1);
    });
  });

  describe('getCustomersByCategory', () => {
    it('should retrieve customers by category', async () => {
      // Create additional test customers with different categories
      await customerRepository.createCustomer({
        code: 'CUST003',
        name: 'VIP Customer 1',
        category: 'vip',
        contactInfo: { primaryPhone: '08111222333' },
        address: {
          street: 'Jl. VIP 1',
          city: 'Jakarta',
          province: 'DKI Jakarta',
          postalCode: '12345',
        },
        branch: branchId,
      });

      await customerRepository.createCustomer({
        code: 'CUST004',
        name: 'VIP Customer 2',
        category: 'vip',
        contactInfo: { primaryPhone: '08444555666' },
        address: {
          street: 'Jl. VIP 2',
          city: 'Jakarta',
          province: 'DKI Jakarta',
          postalCode: '12345',
        },
        branch: branchId,
      });

      const result = await customerRepository.getCustomersByCategory('vip');

      expect(result).toBeDefined();
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data.length).toBe(2);
      expect(result.data[0].category).toBe('vip');
      expect(result.data[1].category).toBe('vip');
    });
  });

  describe('searchCustomers', () => {
    it('should search customers by query', async () => {
      // Create additional test customers with specific names for search
      await customerRepository.createCustomer({
        code: 'CUST003',
        name: 'Searchable Customer One',
        contactInfo: { primaryPhone: '08111222333' },
        address: {
          street: 'Jl. Search',
          city: 'Jakarta',
          province: 'DKI Jakarta',
          postalCode: '12345',
        },
        branch: branchId,
      });

      await customerRepository.createCustomer({
        code: 'CUST004',
        name: 'Another Searchable',
        contactInfo: { primaryPhone: '08444555666' },
        address: {
          street: 'Jl. Search',
          city: 'Jakarta',
          province: 'DKI Jakarta',
          postalCode: '12345',
        },
        branch: branchId,
      });

      const result = await customerRepository.searchCustomers('Searchable');

      expect(result).toBeDefined();
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data.length).toBe(2);
      expect(result.data[0].name).toContain('Searchable');
      expect(result.data[1].name).toContain('Searchable');
    });
  });
});
