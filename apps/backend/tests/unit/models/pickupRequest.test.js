/**
 * Samudra Paket ERP - Pickup Request Model Tests
 * Unit tests for the pickup request model
 */

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const PickupRequest = require('../../../src/domain/models/pickupRequest');
const Branch = require('../../../src/domain/models/branch');
const User = require('../../../src/domain/models/user');
const Customer = require('../../../src/domain/models/customer');

let mongoServer;

// Setup before tests
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

// Clean up after tests
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// Clear database between tests
beforeEach(async () => {
  await PickupRequest.deleteMany({});
  await Branch.deleteMany({});
  await User.deleteMany({});
  await Customer.deleteMany({});
});

describe('PickupRequest Model', () => {
  let testBranch, testUser, testCustomer;

  // Setup test data
  beforeEach(async () => {
    // Create a test branch
    testBranch = new Branch({
      code: 'JKT',
      name: 'Jakarta',
      address: {
        street: 'Jl. Test No. 123',
        city: 'Jakarta',
        province: 'DKI Jakarta',
        postalCode: '12345',
      },
      phoneNumber: '021-1234567',
      email: 'jakarta@samudrapaket.com',
      serviceAreas: [
        {
          city: 'Jakarta',
          province: 'DKI Jakarta',
        },
      ],
    });
    await testBranch.save();

    // Create a test user
    testUser = new User({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      role: 'admin',
    });
    await testUser.save();

    // Create a test customer
    testCustomer = new Customer({
      code: 'CUST001',
      name: 'Test Customer',
      contactInfo: {
        email: 'customer@example.com',
        phone: '08123456789',
      },
      address: {
        street: 'Jl. Customer No. 456',
        city: 'Jakarta',
        province: 'DKI Jakarta',
        postalCode: '12345',
      },
      category: 'regular',
      status: 'active',
      registeredBy: testUser._id,
    });
    await testCustomer.save();
  });

  test('should create a pickup request with valid data', async () => {
    const pickupRequestData = {
      customer: testCustomer._id,
      branch: testBranch._id,
      pickupAddress: {
        street: 'Jl. Pickup No. 789',
        city: 'Jakarta',
        province: 'DKI Jakarta',
        postalCode: '12345',
      },
      contactPerson: {
        name: 'John Doe',
        phone: '08123456789',
        email: 'john@example.com',
      },
      scheduledDate: new Date(),
      scheduledTimeWindow: {
        start: '09:00',
        end: '12:00',
      },
      items: [
        {
          description: 'Test Item',
          quantity: 2,
          weight: {
            value: 5,
            unit: 'kg',
          },
          dimensions: {
            length: 30,
            width: 20,
            height: 10,
            unit: 'cm',
          },
          packageType: 'box',
        },
      ],
      estimatedTotalWeight: {
        value: 10,
        unit: 'kg',
      },
      priority: 'normal',
      createdBy: testUser._id,
    };

    // Generate a code for the pickup request
    const code = await PickupRequest.generateCode(testBranch._id);
    const pickupRequest = new PickupRequest({
      ...pickupRequestData,
      code,
    });

    const savedPickupRequest = await pickupRequest.save();
    
    // Check if saved successfully
    expect(savedPickupRequest._id).toBeDefined();
    expect(savedPickupRequest.code).toBeDefined();
    expect(savedPickupRequest.code).toMatch(/^PU\d{6}JK\d{4}$/); // Format: PU + date + branch code + sequence
    expect(savedPickupRequest.status).toBe('pending'); // Default status
    expect(savedPickupRequest.customer.toString()).toBe(testCustomer._id.toString());
    expect(savedPickupRequest.branch.toString()).toBe(testBranch._id.toString());
    expect(savedPickupRequest.items.length).toBe(1);
    expect(savedPickupRequest.createdAt).toBeDefined();
    expect(savedPickupRequest.updatedAt).toBeDefined();
  });

  test('should not create a pickup request without required fields', async () => {
    const pickupRequest = new PickupRequest({
      // Missing required fields
    });

    let error;
    try {
      await pickupRequest.save();
    } catch (e) {
      error = e;
    }

    expect(error).toBeDefined();
    expect(error.name).toBe('ValidationError');
    expect(error.errors.code).toBeDefined();
    expect(error.errors.customer).toBeDefined();
    expect(error.errors.branch).toBeDefined();
    expect(error.errors['pickupAddress.street']).toBeDefined();
    expect(error.errors['pickupAddress.city']).toBeDefined();
    expect(error.errors['pickupAddress.province']).toBeDefined();
    expect(error.errors['contactPerson.name']).toBeDefined();
    expect(error.errors['contactPerson.phone']).toBeDefined();
    expect(error.errors.scheduledDate).toBeDefined();
    expect(error.errors['scheduledTimeWindow.start']).toBeDefined();
    expect(error.errors['scheduledTimeWindow.end']).toBeDefined();
    expect(error.errors.createdBy).toBeDefined();
  });

  test('should generate a unique code', async () => {
    // Generate multiple codes to ensure uniqueness
    const code1 = await PickupRequest.generateCode(testBranch._id);
    const code2 = await PickupRequest.generateCode(testBranch._id);
    
    expect(code1).toBeDefined();
    expect(code2).toBeDefined();
    expect(code1).not.toBe(code2);
    
    // Check format: PU + date + branch code + sequence
    const today = new Date();
    const year = today.getFullYear().toString().substr(-2);
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    const datePrefix = `PU${year}${month}${day}`;
    
    expect(code1.startsWith(datePrefix)).toBe(true);
    expect(code1.substring(8, 10)).toBe('JK'); // Branch code
    expect(code1.length).toBe(14); // PU + 6 digits for date + 2 for branch + 4 for sequence
  });

  test('should add activity to history', async () => {
    // Create a pickup request
    const pickupRequestData = {
      code: 'PU230501JK0001',
      customer: testCustomer._id,
      branch: testBranch._id,
      pickupAddress: {
        street: 'Jl. Pickup No. 789',
        city: 'Jakarta',
        province: 'DKI Jakarta',
        postalCode: '12345',
      },
      contactPerson: {
        name: 'John Doe',
        phone: '08123456789',
        email: 'john@example.com',
      },
      scheduledDate: new Date(),
      scheduledTimeWindow: {
        start: '09:00',
        end: '12:00',
      },
      items: [
        {
          description: 'Test Item',
          quantity: 2,
          weight: {
            value: 5,
            unit: 'kg',
          },
        },
      ],
      createdBy: testUser._id,
    };

    const pickupRequest = new PickupRequest(pickupRequestData);
    await pickupRequest.save();

    // Add an activity
    pickupRequest.addActivity('test_action', testUser._id, { details: 'Test activity' });
    await pickupRequest.save();

    // Retrieve the updated pickup request
    const updatedPickupRequest = await PickupRequest.findById(pickupRequest._id);

    expect(updatedPickupRequest.activityHistory).toBeDefined();
    expect(updatedPickupRequest.activityHistory.length).toBe(1);
    expect(updatedPickupRequest.activityHistory[0].action).toBe('test_action');
    expect(updatedPickupRequest.activityHistory[0].performedBy.toString()).toBe(testUser._id.toString());
    expect(updatedPickupRequest.activityHistory[0].details).toEqual({ details: 'Test activity' });
    expect(updatedPickupRequest.activityHistory[0].timestamp).toBeDefined();
  });

  test('should update status correctly', async () => {
    // Create a pickup request
    const pickupRequestData = {
      code: 'PU230501JK0002',
      customer: testCustomer._id,
      branch: testBranch._id,
      pickupAddress: {
        street: 'Jl. Pickup No. 789',
        city: 'Jakarta',
        province: 'DKI Jakarta',
        postalCode: '12345',
      },
      contactPerson: {
        name: 'John Doe',
        phone: '08123456789',
        email: 'john@example.com',
      },
      scheduledDate: new Date(),
      scheduledTimeWindow: {
        start: '09:00',
        end: '12:00',
      },
      items: [
        {
          description: 'Test Item',
          quantity: 2,
        },
      ],
      createdBy: testUser._id,
    };

    const pickupRequest = new PickupRequest(pickupRequestData);
    await pickupRequest.save();

    // Update status
    pickupRequest.status = 'scheduled';
    await pickupRequest.save();

    // Retrieve the updated pickup request
    const updatedPickupRequest = await PickupRequest.findById(pickupRequest._id);

    expect(updatedPickupRequest.status).toBe('scheduled');
  });

  test('should handle assignment correctly', async () => {
    // Create a pickup request
    const pickupRequestData = {
      code: 'PU230501JK0003',
      customer: testCustomer._id,
      branch: testBranch._id,
      pickupAddress: {
        street: 'Jl. Pickup No. 789',
        city: 'Jakarta',
        province: 'DKI Jakarta',
        postalCode: '12345',
      },
      contactPerson: {
        name: 'John Doe',
        phone: '08123456789',
        email: 'john@example.com',
      },
      scheduledDate: new Date(),
      scheduledTimeWindow: {
        start: '09:00',
        end: '12:00',
      },
      items: [
        {
          description: 'Test Item',
          quantity: 2,
        },
      ],
      createdBy: testUser._id,
    };

    const pickupRequest = new PickupRequest(pickupRequestData);
    await pickupRequest.save();

    // Assign to a team and vehicle
    const driverId = new mongoose.Types.ObjectId();
    const vehicleId = new mongoose.Types.ObjectId();
    
    pickupRequest.assignment = {
      team: driverId,
      vehicle: vehicleId,
      assignedAt: new Date(),
      assignedBy: testUser._id,
    };
    
    pickupRequest.status = 'scheduled';
    await pickupRequest.save();

    // Retrieve the updated pickup request
    const updatedPickupRequest = await PickupRequest.findById(pickupRequest._id);

    expect(updatedPickupRequest.status).toBe('scheduled');
    expect(updatedPickupRequest.assignment).toBeDefined();
    expect(updatedPickupRequest.assignment.team.toString()).toBe(driverId.toString());
    expect(updatedPickupRequest.assignment.vehicle.toString()).toBe(vehicleId.toString());
    expect(updatedPickupRequest.assignment.assignedAt).toBeDefined();
    expect(updatedPickupRequest.assignment.assignedBy.toString()).toBe(testUser._id.toString());
  });

  test('should handle execution correctly', async () => {
    // Create a pickup request
    const pickupRequestData = {
      code: 'PU230501JK0004',
      customer: testCustomer._id,
      branch: testBranch._id,
      pickupAddress: {
        street: 'Jl. Pickup No. 789',
        city: 'Jakarta',
        province: 'DKI Jakarta',
        postalCode: '12345',
      },
      contactPerson: {
        name: 'John Doe',
        phone: '08123456789',
        email: 'john@example.com',
      },
      scheduledDate: new Date(),
      scheduledTimeWindow: {
        start: '09:00',
        end: '12:00',
      },
      items: [
        {
          description: 'Test Item',
          quantity: 2,
        },
      ],
      createdBy: testUser._id,
    };

    const pickupRequest = new PickupRequest(pickupRequestData);
    await pickupRequest.save();

    // Record execution details
    const startTime = new Date();
    const arrivalTime = new Date(startTime.getTime() + 30 * 60000); // 30 minutes later
    const completionTime = new Date(arrivalTime.getTime() + 45 * 60000); // 45 minutes after arrival
    
    pickupRequest.execution = {
      startTime,
      arrivalTime,
      completionTime,
      actualItems: [
        {
          description: 'Test Item',
          quantity: 2,
          weight: {
            value: 5,
            unit: 'kg',
          },
        },
      ],
      notes: 'Pickup completed successfully',
    };
    
    pickupRequest.status = 'completed';
    await pickupRequest.save();

    // Retrieve the updated pickup request
    const updatedPickupRequest = await PickupRequest.findById(pickupRequest._id);

    expect(updatedPickupRequest.status).toBe('completed');
    expect(updatedPickupRequest.execution).toBeDefined();
    expect(updatedPickupRequest.execution.startTime).toBeDefined();
    expect(updatedPickupRequest.execution.arrivalTime).toBeDefined();
    expect(updatedPickupRequest.execution.completionTime).toBeDefined();
    expect(updatedPickupRequest.execution.actualItems.length).toBe(1);
    expect(updatedPickupRequest.execution.notes).toBe('Pickup completed successfully');
  });

  test('should handle cancellation correctly', async () => {
    // Create a pickup request
    const pickupRequestData = {
      code: 'PU230501JK0005',
      customer: testCustomer._id,
      branch: testBranch._id,
      pickupAddress: {
        street: 'Jl. Pickup No. 789',
        city: 'Jakarta',
        province: 'DKI Jakarta',
        postalCode: '12345',
      },
      contactPerson: {
        name: 'John Doe',
        phone: '08123456789',
        email: 'john@example.com',
      },
      scheduledDate: new Date(),
      scheduledTimeWindow: {
        start: '09:00',
        end: '12:00',
      },
      items: [
        {
          description: 'Test Item',
          quantity: 2,
        },
      ],
      createdBy: testUser._id,
    };

    const pickupRequest = new PickupRequest(pickupRequestData);
    await pickupRequest.save();

    // Cancel the pickup request
    pickupRequest.status = 'cancelled';
    pickupRequest.cancellation = {
      reason: 'Customer requested cancellation',
      cancelledBy: testUser._id,
      cancelledAt: new Date(),
    };
    await pickupRequest.save();

    // Retrieve the updated pickup request
    const updatedPickupRequest = await PickupRequest.findById(pickupRequest._id);

    expect(updatedPickupRequest.status).toBe('cancelled');
    expect(updatedPickupRequest.cancellation).toBeDefined();
    expect(updatedPickupRequest.cancellation.reason).toBe('Customer requested cancellation');
    expect(updatedPickupRequest.cancellation.cancelledBy.toString()).toBe(testUser._id.toString());
    expect(updatedPickupRequest.cancellation.cancelledAt).toBeDefined();
  });

  test('should handle rescheduling correctly', async () => {
    // Create a pickup request
    const originalDate = new Date();
    const pickupRequestData = {
      code: 'PU230501JK0006',
      customer: testCustomer._id,
      branch: testBranch._id,
      pickupAddress: {
        street: 'Jl. Pickup No. 789',
        city: 'Jakarta',
        province: 'DKI Jakarta',
        postalCode: '12345',
      },
      contactPerson: {
        name: 'John Doe',
        phone: '08123456789',
        email: 'john@example.com',
      },
      scheduledDate: originalDate,
      scheduledTimeWindow: {
        start: '09:00',
        end: '12:00',
      },
      items: [
        {
          description: 'Test Item',
          quantity: 2,
        },
      ],
      createdBy: testUser._id,
    };

    const pickupRequest = new PickupRequest(pickupRequestData);
    await pickupRequest.save();

    // Reschedule the pickup request
    const newDate = new Date(originalDate.getTime() + 24 * 60 * 60 * 1000); // Next day
    const newTimeWindow = {
      start: '13:00',
      end: '16:00',
    };
    
    pickupRequest.status = 'rescheduled';
    pickupRequest.scheduledDate = newDate;
    pickupRequest.scheduledTimeWindow = newTimeWindow;
    pickupRequest.rescheduling.push({
      previousDate: originalDate,
      previousTimeWindow: {
        start: '09:00',
        end: '12:00',
      },
      newDate,
      newTimeWindow,
      reason: 'Customer requested rescheduling',
      rescheduledBy: testUser._id,
      rescheduledAt: new Date(),
    });
    await pickupRequest.save();

    // Retrieve the updated pickup request
    const updatedPickupRequest = await PickupRequest.findById(pickupRequest._id);

    expect(updatedPickupRequest.status).toBe('rescheduled');
    expect(updatedPickupRequest.scheduledDate.getDate()).toBe(newDate.getDate());
    expect(updatedPickupRequest.scheduledTimeWindow.start).toBe('13:00');
    expect(updatedPickupRequest.scheduledTimeWindow.end).toBe('16:00');
    expect(updatedPickupRequest.rescheduling.length).toBe(1);
    expect(updatedPickupRequest.rescheduling[0].reason).toBe('Customer requested rescheduling');
    expect(updatedPickupRequest.rescheduling[0].rescheduledBy.toString()).toBe(testUser._id.toString());
  });

  test('should handle issues correctly', async () => {
    // Create a pickup request
    const pickupRequestData = {
      code: 'PU230501JK0007',
      customer: testCustomer._id,
      branch: testBranch._id,
      pickupAddress: {
        street: 'Jl. Pickup No. 789',
        city: 'Jakarta',
        province: 'DKI Jakarta',
        postalCode: '12345',
      },
      contactPerson: {
        name: 'John Doe',
        phone: '08123456789',
        email: 'john@example.com',
      },
      scheduledDate: new Date(),
      scheduledTimeWindow: {
        start: '09:00',
        end: '12:00',
      },
      items: [
        {
          description: 'Test Item',
          quantity: 2,
        },
      ],
      createdBy: testUser._id,
    };

    const pickupRequest = new PickupRequest(pickupRequestData);
    await pickupRequest.save();

    // Add an issue
    if (!pickupRequest.execution) {
      pickupRequest.execution = {};
    }
    if (!pickupRequest.execution.issues) {
      pickupRequest.execution.issues = [];
    }
    
    pickupRequest.execution.issues.push({
      type: 'address_issue',
      description: 'Address was difficult to find',
      reportedBy: testUser._id,
      reportedAt: new Date(),
      resolved: false,
    });
    await pickupRequest.save();

    // Retrieve the updated pickup request
    const updatedPickupRequest = await PickupRequest.findById(pickupRequest._id);

    expect(updatedPickupRequest.execution).toBeDefined();
    expect(updatedPickupRequest.execution.issues).toBeDefined();
    expect(updatedPickupRequest.execution.issues.length).toBe(1);
    expect(updatedPickupRequest.execution.issues[0].type).toBe('address_issue');
    expect(updatedPickupRequest.execution.issues[0].description).toBe('Address was difficult to find');
    expect(updatedPickupRequest.execution.issues[0].reportedBy.toString()).toBe(testUser._id.toString());
    expect(updatedPickupRequest.execution.issues[0].resolved).toBe(false);

    // Resolve the issue
    updatedPickupRequest.execution.issues[0].resolved = true;
    updatedPickupRequest.execution.issues[0].resolvedAt = new Date();
    updatedPickupRequest.execution.issues[0].resolution = 'Updated address in the system';
    await updatedPickupRequest.save();

    // Retrieve the updated pickup request again
    const finalPickupRequest = await PickupRequest.findById(pickupRequest._id);

    expect(finalPickupRequest.execution.issues[0].resolved).toBe(true);
    expect(finalPickupRequest.execution.issues[0].resolvedAt).toBeDefined();
    expect(finalPickupRequest.execution.issues[0].resolution).toBe('Updated address in the system');
  });
});
