/**
 * Samudra Paket ERP - Customer Model Tests
 * Unit tests for the customer model
 */

const mongoose = require('mongoose');
const Customer = require('../../../src/domain/models/customer');

describe('Customer Model', () => {
  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/samudra_test', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(async () => {
    // Disconnect from test database
    await mongoose.connection.close();
  });

  afterEach(async () => {
    // Clean up the database after each test
    await Customer.deleteMany({});
  });

  it('should create a new customer successfully', async () => {
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
      branch: new mongoose.Types.ObjectId(),
    };

    const customer = new Customer(customerData);
    const savedCustomer = await customer.save();

    // Check if customer was saved correctly
    expect(savedCustomer._id).toBeDefined();
    expect(savedCustomer.code).toBe(customerData.code);
    expect(savedCustomer.name).toBe(customerData.name);
    expect(savedCustomer.type).toBe(customerData.type);
    expect(savedCustomer.category).toBe(customerData.category);
    expect(savedCustomer.contactInfo.primaryPhone).toBe(customerData.contactInfo.primaryPhone);
    expect(savedCustomer.address.city).toBe(customerData.address.city);
    expect(savedCustomer.status).toBe('active'); // Default value
  });

  it('should fail to create a customer without required fields', async () => {
    const customerWithoutRequiredField = new Customer({
      code: 'CUST002',
      name: 'Incomplete Customer',
      // Missing contactInfo.primaryPhone and address fields
      branch: new mongoose.Types.ObjectId(),
    });

    let error;
    try {
      await customerWithoutRequiredField.save();
    } catch (e) {
      error = e;
    }

    expect(error).toBeDefined();
    expect(error.name).toBe('ValidationError');
  });

  it('should enforce unique customer code', async () => {
    // Create first customer
    const customer1 = new Customer({
      code: 'CUST003',
      name: 'First Customer',
      contactInfo: {
        primaryPhone: '08123456789',
      },
      address: {
        street: 'Jl. Test No. 123',
        city: 'Jakarta',
        province: 'DKI Jakarta',
        postalCode: '12345',
      },
      branch: new mongoose.Types.ObjectId(),
    });
    await customer1.save();

    // Try to create second customer with same code
    const customer2 = new Customer({
      code: 'CUST003', // Same code as customer1
      name: 'Second Customer',
      contactInfo: {
        primaryPhone: '08987654321',
      },
      address: {
        street: 'Jl. Other No. 456',
        city: 'Bandung',
        province: 'Jawa Barat',
        postalCode: '54321',
      },
      branch: new mongoose.Types.ObjectId(),
    });

    let error;
    try {
      await customer2.save();
    } catch (e) {
      error = e;
    }

    expect(error).toBeDefined();
    expect(error.code).toBe(11000); // Duplicate key error
  });

  it('should add activity to customer history', async () => {
    // Create a customer
    const customer = new Customer({
      code: 'CUST004',
      name: 'Activity Test Customer',
      contactInfo: {
        primaryPhone: '08123456789',
      },
      address: {
        street: 'Jl. Test No. 123',
        city: 'Jakarta',
        province: 'DKI Jakarta',
        postalCode: '12345',
      },
      branch: new mongoose.Types.ObjectId(),
    });
    await customer.save();

    // Add activity
    const userId = new mongoose.Types.ObjectId();
    const action = 'test-action';
    const details = { note: 'Test activity' };

    await customer.addActivity(action, userId, details);

    // Fetch updated customer
    const updatedCustomer = await Customer.findById(customer._id);

    expect(updatedCustomer.activityHistory).toHaveLength(1);
    expect(updatedCustomer.activityHistory[0].action).toBe(action);
    expect(updatedCustomer.activityHistory[0].performedBy.toString()).toBe(userId.toString());
    expect(updatedCustomer.activityHistory[0].details).toEqual(details);
  });
});
