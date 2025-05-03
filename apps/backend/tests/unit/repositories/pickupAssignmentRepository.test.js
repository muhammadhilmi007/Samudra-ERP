/**
 * Samudra Paket ERP - Pickup Assignment Repository Tests
 * Unit tests for the pickup assignment repository
 */

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const pickupAssignmentRepository = require('../../../src/domain/repositories/pickupAssignmentRepository');
const PickupAssignment = require('../../../src/domain/models/pickupAssignment');
const PickupRequest = require('../../../src/domain/models/pickupRequest');
const Branch = require('../../../src/domain/models/branch');
const User = require('../../../src/domain/models/user');
const Employee = require('../../../src/domain/models/employee');
const Vehicle = require('../../../src/domain/models/vehicle');
const routeOptimizationService = require('../../../src/domain/services/routeOptimizationService');

// Mock the route optimization service
jest.mock('../../../src/domain/services/routeOptimizationService');

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
  await PickupAssignment.deleteMany({});
  await PickupRequest.deleteMany({});
  await Branch.deleteMany({});
  await User.deleteMany({});
  await Employee.deleteMany({});
  await Vehicle.deleteMany({});

  // Reset mocks
  jest.clearAllMocks();
});

describe('Pickup Assignment Repository', () => {
  let testBranch, testUser, testDriver, testHelper, testVehicle, testPickupRequest;

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
      location: {
        type: 'Point',
        coordinates: [106.8456, -6.2088], // Jakarta coordinates
      },
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

    // Create test employees
    testDriver = new Employee({
      employeeId: 'EMP001',
      firstName: 'John',
      lastName: 'Driver',
      position: new mongoose.Types.ObjectId(),
      branch: testBranch._id,
      status: 'active',
    });
    await testDriver.save();

    testHelper = new Employee({
      employeeId: 'EMP002',
      firstName: 'Jane',
      lastName: 'Helper',
      position: new mongoose.Types.ObjectId(),
      branch: testBranch._id,
      status: 'active',
    });
    await testHelper.save();

    // Create a test vehicle
    testVehicle = new Vehicle({
      vehicleNo: 'VEH001',
      plateNumber: 'B 1234 XYZ',
      type: 'pickup',
      capacity: {
        weight: 1000,
        volume: 5,
      },
      branch: testBranch._id,
      status: 'active',
    });
    await testVehicle.save();

    // Create a test pickup request
    testPickupRequest = new PickupRequest({
      code: 'PU230501JK0001',
      customer: new mongoose.Types.ObjectId(),
      branch: testBranch._id,
      pickupAddress: {
        street: 'Jl. Pickup No. 789',
        city: 'Jakarta',
        province: 'DKI Jakarta',
        postalCode: '12345',
        location: {
          type: 'Point',
          coordinates: [106.8500, -6.2100], // Near Jakarta
        },
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
      status: 'pending',
      createdBy: testUser._id,
    });
    await testPickupRequest.save();
  });

  describe('createPickupAssignment', () => {
    test('should create a pickup assignment with valid data', async () => {
      const pickupAssignmentData = {
        branch: testBranch._id,
        assignmentDate: new Date(),
        team: {
          driver: testDriver._id,
          helpers: [testHelper._id],
        },
        vehicle: testVehicle._id,
        pickupRequests: [testPickupRequest._id],
        createdBy: testUser._id,
      };

      const pickupAssignment = await pickupAssignmentRepository.createPickupAssignment(pickupAssignmentData);

      expect(pickupAssignment._id).toBeDefined();
      expect(pickupAssignment.code).toBeDefined();
      expect(pickupAssignment.code).toMatch(/^PA\d{6}JK\d{4}$/);
      expect(pickupAssignment.status).toBe('planned');
      expect(pickupAssignment.branch.toString()).toBe(testBranch._id.toString());
      expect(pickupAssignment.team.driver.toString()).toBe(testDriver._id.toString());
      expect(pickupAssignment.team.helpers.length).toBe(1);
      expect(pickupAssignment.vehicle.toString()).toBe(testVehicle._id.toString());
      expect(pickupAssignment.pickupRequests.length).toBe(1);
      expect(pickupAssignment.activityHistory.length).toBe(1);
      expect(pickupAssignment.activityHistory[0].action).toBe('created');

      // Check if pickup request status is updated
      const updatedPickupRequest = await PickupRequest.findById(testPickupRequest._id);
      expect(updatedPickupRequest.status).toBe('scheduled');
      expect(updatedPickupRequest.assignment).toBeDefined();
      expect(updatedPickupRequest.assignment.team.toString()).toBe(testDriver._id.toString());
      expect(updatedPickupRequest.assignment.vehicle.toString()).toBe(testVehicle._id.toString());
    });

    test('should throw error when required fields are missing', async () => {
      const pickupAssignmentData = {
        // Missing required fields
        createdBy: testUser._id,
      };

      await expect(pickupAssignmentRepository.createPickupAssignment(pickupAssignmentData))
        .rejects.toThrow();
    });
  });

  describe('getAllPickupAssignments', () => {
    beforeEach(async () => {
      // Create multiple pickup assignments for testing
      const baseData = {
        branch: testBranch._id,
        team: {
          driver: testDriver._id,
          helpers: [testHelper._id],
        },
        vehicle: testVehicle._id,
        createdBy: testUser._id,
      };

      // Create 5 pickup assignments with different statuses and dates
      await pickupAssignmentRepository.createPickupAssignment({
        ...baseData,
        assignmentDate: new Date('2023-05-01'),
        status: 'planned',
      });

      await pickupAssignmentRepository.createPickupAssignment({
        ...baseData,
        assignmentDate: new Date('2023-05-02'),
        status: 'assigned',
      });

      await pickupAssignmentRepository.createPickupAssignment({
        ...baseData,
        assignmentDate: new Date('2023-05-03'),
        status: 'in_progress',
      });

      await pickupAssignmentRepository.createPickupAssignment({
        ...baseData,
        assignmentDate: new Date('2023-05-04'),
        status: 'completed',
      });

      await pickupAssignmentRepository.createPickupAssignment({
        ...baseData,
        assignmentDate: new Date('2023-05-05'),
        status: 'cancelled',
      });
    });

    test('should get all pickup assignments with pagination', async () => {
      const result = await pickupAssignmentRepository.getAllPickupAssignments({}, {
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

    test('should filter pickup assignments by status', async () => {
      const result = await pickupAssignmentRepository.getAllPickupAssignments({}, {
        status: 'planned',
      });

      expect(result.data.length).toBe(1);
      expect(result.data[0].status).toBe('planned');
    });

    test('should filter pickup assignments by date range', async () => {
      const result = await pickupAssignmentRepository.getAllPickupAssignments({}, {
        assignmentDateFrom: '2023-05-02',
        assignmentDateTo: '2023-05-04',
      });

      expect(result.data.length).toBe(3);
    });

    test('should sort pickup assignments', async () => {
      const result = await pickupAssignmentRepository.getAllPickupAssignments({}, {
        sortBy: 'assignmentDate',
        sortOrder: 'asc',
      });

      expect(result.data.length).toBe(5);
      expect(new Date(result.data[0].assignmentDate).getDate()).toBe(1);
      expect(new Date(result.data[4].assignmentDate).getDate()).toBe(5);
    });
  });

  describe('getPickupAssignmentById', () => {
    let testPickupAssignment;

    beforeEach(async () => {
      // Create a test pickup assignment
      const pickupAssignmentData = {
        branch: testBranch._id,
        assignmentDate: new Date(),
        team: {
          driver: testDriver._id,
          helpers: [testHelper._id],
        },
        vehicle: testVehicle._id,
        pickupRequests: [testPickupRequest._id],
        createdBy: testUser._id,
      };

      testPickupAssignment = await pickupAssignmentRepository.createPickupAssignment(pickupAssignmentData);
    });

    test('should get pickup assignment by ID', async () => {
      const pickupAssignment = await pickupAssignmentRepository.getPickupAssignmentById(testPickupAssignment._id);

      expect(pickupAssignment).toBeDefined();
      expect(pickupAssignment._id.toString()).toBe(testPickupAssignment._id.toString());
      expect(pickupAssignment.code).toBe(testPickupAssignment.code);
    });

    test('should return null for non-existent ID', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const pickupAssignment = await pickupAssignmentRepository.getPickupAssignmentById(nonExistentId);

      expect(pickupAssignment).toBeNull();
    });

    test('should populate related fields', async () => {
      const pickupAssignment = await pickupAssignmentRepository.getPickupAssignmentById(
        testPickupAssignment._id,
        ['branch', 'team.driver', 'vehicle', 'pickupRequests']
      );

      expect(pickupAssignment).toBeDefined();
      expect(pickupAssignment.branch).toBeDefined();
      expect(pickupAssignment.branch._id.toString()).toBe(testBranch._id.toString());
      expect(pickupAssignment.team.driver).toBeDefined();
      expect(pickupAssignment.team.driver._id.toString()).toBe(testDriver._id.toString());
      expect(pickupAssignment.vehicle).toBeDefined();
      expect(pickupAssignment.vehicle._id.toString()).toBe(testVehicle._id.toString());
      expect(pickupAssignment.pickupRequests).toBeDefined();
      expect(pickupAssignment.pickupRequests[0]._id.toString()).toBe(testPickupRequest._id.toString());
    });
  });

  describe('updatePickupAssignment', () => {
    let testPickupAssignment;

    beforeEach(async () => {
      // Create a test pickup assignment
      const pickupAssignmentData = {
        branch: testBranch._id,
        assignmentDate: new Date(),
        team: {
          driver: testDriver._id,
          helpers: [testHelper._id],
        },
        vehicle: testVehicle._id,
        createdBy: testUser._id,
      };

      testPickupAssignment = await pickupAssignmentRepository.createPickupAssignment(pickupAssignmentData);
    });

    test('should update pickup assignment', async () => {
      const updateData = {
        assignmentDate: new Date('2023-06-01'),
        team: {
          driver: testDriver._id,
          helpers: [],
        },
        updatedBy: testUser._id,
      };

      const updatedPickupAssignment = await pickupAssignmentRepository.updatePickupAssignment(
        testPickupAssignment._id,
        updateData
      );

      expect(updatedPickupAssignment).toBeDefined();
      expect(new Date(updatedPickupAssignment.assignmentDate).toISOString().split('T')[0]).toBe('2023-06-01');
      expect(updatedPickupAssignment.team.helpers.length).toBe(0);
      expect(updatedPickupAssignment.activityHistory.length).toBe(2); // Created + updated
      expect(updatedPickupAssignment.activityHistory[1].action).toBe('updated');
    });

    test('should not update protected fields', async () => {
      const updateData = {
        code: 'NEWCODE',
        createdBy: new mongoose.Types.ObjectId(),
        createdAt: new Date('2020-01-01'),
        updatedBy: testUser._id,
      };

      const updatedPickupAssignment = await pickupAssignmentRepository.updatePickupAssignment(
        testPickupAssignment._id,
        updateData
      );

      expect(updatedPickupAssignment).toBeDefined();
      expect(updatedPickupAssignment.code).toBe(testPickupAssignment.code); // Should not change
      expect(updatedPickupAssignment.createdBy.toString()).toBe(testUser._id.toString()); // Should not change
      expect(updatedPickupAssignment.createdAt.getTime()).toBe(testPickupAssignment.createdAt.getTime()); // Should not change
    });
  });

  describe('updateStatus', () => {
    let testPickupAssignment;

    beforeEach(async () => {
      // Create a test pickup assignment
      const pickupAssignmentData = {
        branch: testBranch._id,
        assignmentDate: new Date(),
        team: {
          driver: testDriver._id,
          helpers: [testHelper._id],
        },
        vehicle: testVehicle._id,
        pickupRequests: [testPickupRequest._id],
        createdBy: testUser._id,
      };

      testPickupAssignment = await pickupAssignmentRepository.createPickupAssignment(pickupAssignmentData);
    });

    test('should update status to assigned', async () => {
      const updatedPickupAssignment = await pickupAssignmentRepository.updateStatus(
        testPickupAssignment._id,
        'assigned',
        testUser._id
      );

      expect(updatedPickupAssignment).toBeDefined();
      expect(updatedPickupAssignment.status).toBe('assigned');
      expect(updatedPickupAssignment.activityHistory.length).toBe(2); // Created + status update
      expect(updatedPickupAssignment.activityHistory[1].action).toBe('status_updated');
    });

    test('should update status to in_progress and record start time', async () => {
      // First update to assigned
      await pickupAssignmentRepository.updateStatus(
        testPickupAssignment._id,
        'assigned',
        testUser._id
      );

      // Then update to in_progress
      const updatedPickupAssignment = await pickupAssignmentRepository.updateStatus(
        testPickupAssignment._id,
        'in_progress',
        testUser._id
      );

      expect(updatedPickupAssignment).toBeDefined();
      expect(updatedPickupAssignment.status).toBe('in_progress');
      expect(updatedPickupAssignment.execution).toBeDefined();
      expect(updatedPickupAssignment.execution.startTime).toBeDefined();
      expect(updatedPickupAssignment.activityHistory.length).toBe(3);
    });

    test('should update status to completed and record end time', async () => {
      // Update to assigned
      await pickupAssignmentRepository.updateStatus(
        testPickupAssignment._id,
        'assigned',
        testUser._id
      );

      // Update to in_progress
      await pickupAssignmentRepository.updateStatus(
        testPickupAssignment._id,
        'in_progress',
        testUser._id
      );

      // Update to completed
      const updatedPickupAssignment = await pickupAssignmentRepository.updateStatus(
        testPickupAssignment._id,
        'completed',
        testUser._id
      );

      expect(updatedPickupAssignment).toBeDefined();
      expect(updatedPickupAssignment.status).toBe('completed');
      expect(updatedPickupAssignment.execution).toBeDefined();
      expect(updatedPickupAssignment.execution.endTime).toBeDefined();
      expect(updatedPickupAssignment.activityHistory.length).toBe(4);
    });

    test('should update status to cancelled with reason', async () => {
      const updatedPickupAssignment = await pickupAssignmentRepository.updateStatus(
        testPickupAssignment._id,
        'cancelled',
        testUser._id,
        {
          reason: 'Customer requested cancellation',
        }
      );

      expect(updatedPickupAssignment).toBeDefined();
      expect(updatedPickupAssignment.status).toBe('cancelled');
      expect(updatedPickupAssignment.execution).toBeDefined();
      expect(updatedPickupAssignment.execution.notes).toBe('Customer requested cancellation');
      expect(updatedPickupAssignment.activityHistory.length).toBe(2);

      // Check if pickup request status is updated
      const updatedPickupRequest = await PickupRequest.findById(testPickupRequest._id);
      expect(updatedPickupRequest.status).toBe('pending');
      expect(updatedPickupRequest.assignment).toBeNull();
    });

    test('should throw error for invalid status transition', async () => {
      // Update to completed
      await pickupAssignmentRepository.updateStatus(
        testPickupAssignment._id,
        'assigned',
        testUser._id
      );

      await pickupAssignmentRepository.updateStatus(
        testPickupAssignment._id,
        'in_progress',
        testUser._id
      );

      await pickupAssignmentRepository.updateStatus(
        testPickupAssignment._id,
        'completed',
        testUser._id
      );

      // Try to update completed to in_progress
      await expect(pickupAssignmentRepository.updateStatus(
        testPickupAssignment._id,
        'in_progress',
        testUser._id
      )).rejects.toThrow('Invalid status transition');
    });
  });

  describe('optimizeAssignmentRoute', () => {
    let testPickupAssignment;

    beforeEach(async () => {
      // Create a test pickup assignment
      const pickupAssignmentData = {
        branch: testBranch._id,
        assignmentDate: new Date(),
        team: {
          driver: testDriver._id,
          helpers: [testHelper._id],
        },
        vehicle: testVehicle._id,
        pickupRequests: [testPickupRequest._id],
        createdBy: testUser._id,
      };

      testPickupAssignment = await pickupAssignmentRepository.createPickupAssignment(pickupAssignmentData);

      // Mock the optimizeRoute function
      routeOptimizationService.optimizeRoute.mockResolvedValue({
        stops: [
          {
            pickupRequest: testPickupRequest._id,
            sequenceNumber: 1,
            estimatedArrival: new Date(),
            distance: 5.2,
            duration: 15,
          },
        ],
        totalDistance: 10.4,
        totalDuration: 30,
        startLocation: {
          type: 'Point',
          coordinates: [106.8456, -6.2088],
          address: 'Jakarta Branch',
        },
        endLocation: {
          type: 'Point',
          coordinates: [106.8456, -6.2088],
          address: 'Jakarta Branch',
        },
      });
    });

    test('should optimize route for pickup assignment', async () => {
      const updatedPickupAssignment = await pickupAssignmentRepository.optimizeAssignmentRoute(
        testPickupAssignment._id,
        testUser._id,
        true
      );

      expect(updatedPickupAssignment).toBeDefined();
      expect(updatedPickupAssignment.route).toBeDefined();
      expect(updatedPickupAssignment.route.optimized).toBe(true);
      expect(updatedPickupAssignment.route.stops).toBeDefined();
      expect(updatedPickupAssignment.route.stops.length).toBe(1);
      expect(updatedPickupAssignment.route.totalDistance).toBe(10.4);
      expect(updatedPickupAssignment.route.totalDuration).toBe(30);
      expect(updatedPickupAssignment.activityHistory.length).toBe(2);
      expect(updatedPickupAssignment.activityHistory[1].action).toBe('route_optimized');

      // Verify that the optimizeRoute function was called with the correct parameters
      expect(routeOptimizationService.optimizeRoute).toHaveBeenCalledWith(
        expect.arrayContaining([expect.objectContaining({ _id: testPickupRequest._id })]),
        expect.objectContaining({ _id: testBranch._id }),
        expect.any(Date),
        true
      );
    });

    test('should throw error if no pickup requests to optimize', async () => {
      // Create a pickup assignment without pickup requests
      const pickupAssignmentData = {
        branch: testBranch._id,
        assignmentDate: new Date(),
        team: {
          driver: testDriver._id,
        },
        vehicle: testVehicle._id,
        pickupRequests: [],
        createdBy: testUser._id,
      };

      const emptyPickupAssignment = await pickupAssignmentRepository.createPickupAssignment(pickupAssignmentData);

      await expect(pickupAssignmentRepository.optimizeAssignmentRoute(
        emptyPickupAssignment._id,
        testUser._id,
        true
      )).rejects.toThrow('No pickup requests to optimize');
    });
  });

  describe('addPickupRequest and removePickupRequest', () => {
    let testPickupAssignment, testPickupRequest2;

    beforeEach(async () => {
      // Create a test pickup assignment without pickup requests
      const pickupAssignmentData = {
        branch: testBranch._id,
        assignmentDate: new Date(),
        team: {
          driver: testDriver._id,
          helpers: [testHelper._id],
        },
        vehicle: testVehicle._id,
        pickupRequests: [],
        createdBy: testUser._id,
      };

      testPickupAssignment = await pickupAssignmentRepository.createPickupAssignment(pickupAssignmentData);

      // Create a second test pickup request
      testPickupRequest2 = new PickupRequest({
        code: 'PU230501JK0002',
        customer: new mongoose.Types.ObjectId(),
        branch: testBranch._id,
        pickupAddress: {
          street: 'Jl. Pickup No. 456',
          city: 'Jakarta',
          province: 'DKI Jakarta',
          postalCode: '12345',
        },
        contactPerson: {
          name: 'Jane Doe',
          phone: '08987654321',
          email: 'jane@example.com',
        },
        scheduledDate: new Date(),
        scheduledTimeWindow: {
          start: '13:00',
          end: '16:00',
        },
        status: 'pending',
        createdBy: testUser._id,
      });
      await testPickupRequest2.save();
    });

    test('should add pickup request to assignment', async () => {
      const updatedPickupAssignment = await pickupAssignmentRepository.addPickupRequest(
        testPickupAssignment._id,
        testPickupRequest._id,
        testUser._id
      );

      expect(updatedPickupAssignment).toBeDefined();
      expect(updatedPickupAssignment.pickupRequests).toBeDefined();
      expect(updatedPickupAssignment.pickupRequests.length).toBe(1);
      expect(updatedPickupAssignment.pickupRequests[0].toString()).toBe(testPickupRequest._id.toString());
      expect(updatedPickupAssignment.activityHistory.length).toBe(2);
      expect(updatedPickupAssignment.activityHistory[1].action).toBe('pickup_request_added');

      // Check if pickup request status is updated
      const updatedPickupRequest = await PickupRequest.findById(testPickupRequest._id);
      expect(updatedPickupRequest.status).toBe('scheduled');
      expect(updatedPickupRequest.assignment).toBeDefined();
      expect(updatedPickupRequest.assignment.team.toString()).toBe(testDriver._id.toString());
      expect(updatedPickupRequest.assignment.vehicle.toString()).toBe(testVehicle._id.toString());
    });

    test('should remove pickup request from assignment', async () => {
      // First add the pickup request
      await pickupAssignmentRepository.addPickupRequest(
        testPickupAssignment._id,
        testPickupRequest._id,
        testUser._id
      );

      // Then remove it
      const updatedPickupAssignment = await pickupAssignmentRepository.removePickupRequest(
        testPickupAssignment._id,
        testPickupRequest._id,
        testUser._id
      );

      expect(updatedPickupAssignment).toBeDefined();
      expect(updatedPickupAssignment.pickupRequests).toBeDefined();
      expect(updatedPickupAssignment.pickupRequests.length).toBe(0);
      expect(updatedPickupAssignment.activityHistory.length).toBe(3);
      expect(updatedPickupAssignment.activityHistory[2].action).toBe('pickup_request_removed');

      // Check if pickup request status is updated
      const updatedPickupRequest = await PickupRequest.findById(testPickupRequest._id);
      expect(updatedPickupRequest.status).toBe('pending');
      expect(updatedPickupRequest.assignment).toBeNull();
    });

    test('should throw error when adding already assigned pickup request', async () => {
      // First add the pickup request to the assignment
      await pickupAssignmentRepository.addPickupRequest(
        testPickupAssignment._id,
        testPickupRequest._id,
        testUser._id
      );

      // Create another pickup assignment
      const anotherPickupAssignmentData = {
        branch: testBranch._id,
        assignmentDate: new Date(),
        team: {
          driver: testDriver._id,
        },
        vehicle: testVehicle._id,
        pickupRequests: [],
        createdBy: testUser._id,
      };

      const anotherPickupAssignment = await pickupAssignmentRepository.createPickupAssignment(anotherPickupAssignmentData);

      // Try to add the same pickup request to another assignment
      await expect(pickupAssignmentRepository.addPickupRequest(
        anotherPickupAssignment._id,
        testPickupRequest._id,
        testUser._id
      )).rejects.toThrow('Pickup request is already assigned');
    });

    test('should throw error when removing pickup request not in assignment', async () => {
      await expect(pickupAssignmentRepository.removePickupRequest(
        testPickupAssignment._id,
        testPickupRequest._id,
        testUser._id
      )).rejects.toThrow('Pickup request is not in this assignment');
    });
  });
});
