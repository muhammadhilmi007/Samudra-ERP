/**
 * Samudra Paket ERP - Pickup Request Repository Tests
 * Unit tests for the pickup request repository
 */

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const pickupRequestRepository = require('../../../src/domain/repositories/pickupRequestRepository');
const PickupRequest = require('../../../src/domain/models/pickupRequest');
const Branch = require('../../../src/domain/models/branch');
const User = require('../../../src/domain/models/user');
const Customer = require('../../../src/domain/models/customer');
const NotificationService = require('../../../src/domain/services/notificationService');

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

describe('Pickup Request Repository', () => {
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

  describe('createPickupRequest', () => {
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
          },
        ],
        estimatedTotalWeight: {
          value: 10,
          unit: 'kg',
        },
        priority: 'normal',
        createdBy: testUser._id,
      };

      const pickupRequest = await pickupRequestRepository.createPickupRequest(pickupRequestData);

      expect(pickupRequest._id).toBeDefined();
      expect(pickupRequest.code).toBeDefined();
      expect(pickupRequest.code).toMatch(/^PU\d{6}JK\d{4}$/);
      expect(pickupRequest.status).toBe('pending');
      expect(pickupRequest.customer.toString()).toBe(testCustomer._id.toString());
      expect(pickupRequest.branch.toString()).toBe(testBranch._id.toString());
      expect(pickupRequest.items.length).toBe(1);
      expect(pickupRequest.activityHistory.length).toBe(1);
      expect(pickupRequest.activityHistory[0].action).toBe('created');

      // Kirim notifikasi ke customer
      const notificationService = new NotificationService();
      await notificationService.sendNotification({
        recipient: pickupRequest.customer,
        type: 'pickup_request_created',
        entityType: 'PickupRequest',
        entityId: pickupRequest._id,
        title: 'Pickup Request Berhasil Dibuat',
        message: `Pickup request dengan kode ${pickupRequest.code} telah berhasil dibuat dan akan segera diproses.`,
        channels: ['inApp', 'email'],
        data: {
          pickupRequestId: pickupRequest._id,
          scheduledDate: pickupRequest.scheduledDate,
          branch: pickupRequest.branch,
        },
      });
    });

    test('should throw error when required fields are missing', async () => {
      const pickupRequestData = {
        // Missing required fields
        createdBy: testUser._id,
      };

      await expect(pickupRequestRepository.createPickupRequest(pickupRequestData))
        .rejects.toThrow();
    });
  });

  describe('getAllPickupRequests', () => {
    beforeEach(async () => {
      // Create multiple pickup requests for testing
      const baseData = {
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

      // Create 5 pickup requests with different statuses and dates
      await pickupRequestRepository.createPickupRequest({
        ...baseData,
        code: 'PU230501JK0001',
        scheduledDate: new Date('2023-05-01'),
        status: 'pending',
      });

      await pickupRequestRepository.createPickupRequest({
        ...baseData,
        code: 'PU230502JK0002',
        scheduledDate: new Date('2023-05-02'),
        status: 'scheduled',
      });

      await pickupRequestRepository.createPickupRequest({
        ...baseData,
        code: 'PU230503JK0003',
        scheduledDate: new Date('2023-05-03'),
        status: 'in_progress',
      });

      await pickupRequestRepository.createPickupRequest({
        ...baseData,
        code: 'PU230504JK0004',
        scheduledDate: new Date('2023-05-04'),
        status: 'completed',
      });

      await pickupRequestRepository.createPickupRequest({
        ...baseData,
        code: 'PU230505JK0005',
        scheduledDate: new Date('2023-05-05'),
        status: 'cancelled',
      });
    });

    test('should get all pickup requests with pagination', async () => {
      const result = await pickupRequestRepository.getAllPickupRequests({}, {
        page: 1,
        limit: 10,
      });

      expect(result.data).toBeDefined();
      expect(result.meta).toBeDefined();
      expect(result.data.length).toBe(5);
      expect(result.meta.total).toBe(5);
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(10);
      expect(result.meta.totalPages).toBe(1);
    });

    test('should filter pickup requests by status', async () => {
      const result = await pickupRequestRepository.getAllPickupRequests({}, {
        status: 'pending',
      });

      expect(result.data.length).toBe(1);
      expect(result.data[0].status).toBe('pending');
    });

    test('should filter pickup requests by date range', async () => {
      const result = await pickupRequestRepository.getAllPickupRequests({}, {
        scheduledDateFrom: '2023-05-02',
        scheduledDateTo: '2023-05-04',
      });

      expect(result.data.length).toBe(3);
    });

    test('should sort pickup requests', async () => {
      const result = await pickupRequestRepository.getAllPickupRequests({}, {
        sortBy: 'scheduledDate',
        sortOrder: 'asc',
      });

      expect(result.data.length).toBe(5);
      expect(new Date(result.data[0].scheduledDate).getDate()).toBe(1);
      expect(new Date(result.data[4].scheduledDate).getDate()).toBe(5);
    });

    test('should search pickup requests', async () => {
      const result = await pickupRequestRepository.searchPickupRequests('JK0001', {});

      expect(result.data.length).toBe(1);
      expect(result.data[0].code).toBe('PU230501JK0001');
    });
  });

  describe('getPickupRequestById', () => {
    let testPickupRequest;

    beforeEach(async () => {
      // Create a test pickup request
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
          },
        ],
        createdBy: testUser._id,
      };

      testPickupRequest = await pickupRequestRepository.createPickupRequest(pickupRequestData);
    });

    test('should get pickup request by ID', async () => {
      const pickupRequest = await pickupRequestRepository.getPickupRequestById(testPickupRequest._id);

      expect(pickupRequest).toBeDefined();
      expect(pickupRequest._id.toString()).toBe(testPickupRequest._id.toString());
      expect(pickupRequest.code).toBe(testPickupRequest.code);
    });

    test('should return null for non-existent ID', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const pickupRequest = await pickupRequestRepository.getPickupRequestById(nonExistentId);

      expect(pickupRequest).toBeNull();
    });

    test('should populate related fields', async () => {
      const pickupRequest = await pickupRequestRepository.getPickupRequestById(
        testPickupRequest._id,
        ['customer', 'branch', 'createdBy']
      );

      expect(pickupRequest).toBeDefined();
      expect(pickupRequest.customer).toBeDefined();
      expect(pickupRequest.customer._id.toString()).toBe(testCustomer._id.toString());
      expect(pickupRequest.branch).toBeDefined();
      expect(pickupRequest.branch._id.toString()).toBe(testBranch._id.toString());
      expect(pickupRequest.createdBy).toBeDefined();
      expect(pickupRequest.createdBy._id.toString()).toBe(testUser._id.toString());
    });
  });

  describe('updatePickupRequest', () => {
    let testPickupRequest;

    beforeEach(async () => {
      // Create a test pickup request
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
          },
        ],
        createdBy: testUser._id,
      };

      testPickupRequest = await pickupRequestRepository.createPickupRequest(pickupRequestData);
    });

    test('should update pickup request', async () => {
      const updateData = {
        contactPerson: {
          name: 'Jane Doe',
          phone: '08987654321',
          email: 'jane@example.com',
        },
        scheduledTimeWindow: {
          start: '10:00',
          end: '13:00',
        },
        updatedBy: testUser._id,
      };

      const updatedPickupRequest = await pickupRequestRepository.updatePickupRequest(
        testPickupRequest._id,
        updateData
      );

      expect(updatedPickupRequest).toBeDefined();
      expect(updatedPickupRequest.contactPerson.name).toBe('Jane Doe');
      expect(updatedPickupRequest.contactPerson.phone).toBe('08987654321');
      expect(updatedPickupRequest.scheduledTimeWindow.start).toBe('10:00');
      expect(updatedPickupRequest.scheduledTimeWindow.end).toBe('13:00');
      expect(updatedPickupRequest.activityHistory.length).toBe(2); // Created + updated
      expect(updatedPickupRequest.activityHistory[1].action).toBe('updated');
    });

    test('should not update protected fields', async () => {
      const updateData = {
        code: 'NEWCODE',
        createdBy: new mongoose.Types.ObjectId(),
        createdAt: new Date('2020-01-01'),
        updatedBy: testUser._id,
      };

      const updatedPickupRequest = await pickupRequestRepository.updatePickupRequest(
        testPickupRequest._id,
        updateData
      );

      expect(updatedPickupRequest).toBeDefined();
      expect(updatedPickupRequest.code).toBe(testPickupRequest.code); // Should not change
      expect(updatedPickupRequest.createdBy.toString()).toBe(testUser._id.toString()); // Should not change
      expect(updatedPickupRequest.createdAt.getTime()).toBe(testPickupRequest.createdAt.getTime()); // Should not change
    });
  });

  describe('updateStatus', () => {
    let testPickupRequest;

    beforeEach(async () => {
      // Create a test pickup request
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
          },
        ],
        createdBy: testUser._id,
      };

      testPickupRequest = await pickupRequestRepository.createPickupRequest(pickupRequestData);
    });

    test('should update status to scheduled', async () => {
      const teamId = new mongoose.Types.ObjectId();
      const vehicleId = new mongoose.Types.ObjectId();

      const updatedPickupRequest = await pickupRequestRepository.updateStatus(
        testPickupRequest._id,
        'scheduled',
        testUser._id,
        {
          team: teamId,
          vehicle: vehicleId,
        }
      );

      expect(updatedPickupRequest).toBeDefined();
      expect(updatedPickupRequest.status).toBe('scheduled');
      expect(updatedPickupRequest.assignment).toBeDefined();
      expect(updatedPickupRequest.assignment.team.toString()).toBe(teamId.toString());
      expect(updatedPickupRequest.assignment.vehicle.toString()).toBe(vehicleId.toString());
      expect(updatedPickupRequest.activityHistory.length).toBe(2); // Created + status update
      expect(updatedPickupRequest.activityHistory[1].action).toBe('status_updated');
    });

    test('should update status to in_progress and record start time', async () => {
      const updatedPickupRequest = await pickupRequestRepository.updateStatus(
        testPickupRequest._id,
        'in_progress',
        testUser._id
      );

      expect(updatedPickupRequest).toBeDefined();
      expect(updatedPickupRequest.status).toBe('in_progress');
      expect(updatedPickupRequest.execution).toBeDefined();
      expect(updatedPickupRequest.execution.startTime).toBeDefined();
      expect(updatedPickupRequest.activityHistory.length).toBe(2);
    });

    test('should update status to cancelled with reason', async () => {
      const updatedPickupRequest = await pickupRequestRepository.updateStatus(
        testPickupRequest._id,
        'cancelled',
        testUser._id,
        {
          reason: 'Customer requested cancellation',
        }
      );

      expect(updatedPickupRequest).toBeDefined();
      expect(updatedPickupRequest.status).toBe('cancelled');
      expect(updatedPickupRequest.cancellation).toBeDefined();
      expect(updatedPickupRequest.cancellation.reason).toBe('Customer requested cancellation');
      expect(updatedPickupRequest.cancellation.cancelledBy.toString()).toBe(testUser._id.toString());
      expect(updatedPickupRequest.cancellation.cancelledAt).toBeDefined();
      expect(updatedPickupRequest.activityHistory.length).toBe(2);
    });
  });

  describe('validateServiceAreaCoverage', () => {
    test('should validate address within service area', async () => {
      const address = {
        street: 'Jl. Test No. 123',
        city: 'Jakarta',
        province: 'DKI Jakarta',
        postalCode: '12345',
      };

      const result = await pickupRequestRepository.validateServiceAreaCoverage(
        address,
        testBranch._id
      );

      expect(result).toBeDefined();
      expect(result.valid).toBe(true);
      expect(result.message).toBe('Address is within service area');
      expect(result.serviceArea).toBeDefined();
    });

    test('should invalidate address outside service area', async () => {
      const address = {
        street: 'Jl. Test No. 123',
        city: 'Bandung',
        province: 'Jawa Barat',
        postalCode: '40111',
      };

      const result = await pickupRequestRepository.validateServiceAreaCoverage(
        address,
        testBranch._id
      );

      expect(result).toBeDefined();
      expect(result.valid).toBe(false);
      expect(result.message).toBe('Address is outside service area');
    });
  });
});
