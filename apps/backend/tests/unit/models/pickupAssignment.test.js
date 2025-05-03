/**
 * Samudra Paket ERP - Pickup Assignment Model Tests
 * Unit tests for the pickup assignment model
 */

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const PickupAssignment = require('../../../src/domain/models/pickupAssignment');
const Branch = require('../../../src/domain/models/branch');
const User = require('../../../src/domain/models/user');
const Employee = require('../../../src/domain/models/employee');
const Vehicle = require('../../../src/domain/models/vehicle');
const PickupRequest = require('../../../src/domain/models/pickupRequest');

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
  await Branch.deleteMany({});
  await User.deleteMany({});
  await Employee.deleteMany({});
  await Vehicle.deleteMany({});
  await PickupRequest.deleteMany({});
});

describe('PickupAssignment Model', () => {
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

  test('should create a pickup assignment with valid data', async () => {
    const code = await PickupAssignment.generateCode(testBranch._id);
    
    const pickupAssignmentData = {
      code,
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

    const pickupAssignment = new PickupAssignment(pickupAssignmentData);
    const savedPickupAssignment = await pickupAssignment.save();
    
    // Check if saved successfully
    expect(savedPickupAssignment._id).toBeDefined();
    expect(savedPickupAssignment.code).toBe(code);
    expect(savedPickupAssignment.status).toBe('planned'); // Default status
    expect(savedPickupAssignment.branch.toString()).toBe(testBranch._id.toString());
    expect(savedPickupAssignment.team.driver.toString()).toBe(testDriver._id.toString());
    expect(savedPickupAssignment.team.helpers.length).toBe(1);
    expect(savedPickupAssignment.vehicle.toString()).toBe(testVehicle._id.toString());
    expect(savedPickupAssignment.pickupRequests.length).toBe(1);
    expect(savedPickupAssignment.pickupRequests[0].toString()).toBe(testPickupRequest._id.toString());
    expect(savedPickupAssignment.createdAt).toBeDefined();
    expect(savedPickupAssignment.updatedAt).toBeDefined();
  });

  test('should not create a pickup assignment without required fields', async () => {
    const pickupAssignment = new PickupAssignment({
      // Missing required fields
    });

    let error;
    try {
      await pickupAssignment.save();
    } catch (e) {
      error = e;
    }

    expect(error).toBeDefined();
    expect(error.name).toBe('ValidationError');
    expect(error.errors.code).toBeDefined();
    expect(error.errors.branch).toBeDefined();
    expect(error.errors.assignmentDate).toBeDefined();
    expect(error.errors['team.driver']).toBeDefined();
    expect(error.errors.vehicle).toBeDefined();
    expect(error.errors.createdBy).toBeDefined();
  });

  test('should generate a unique code', async () => {
    // Generate multiple codes to ensure uniqueness
    const code1 = await PickupAssignment.generateCode(testBranch._id);
    const code2 = await PickupAssignment.generateCode(testBranch._id);
    
    expect(code1).toBeDefined();
    expect(code2).toBeDefined();
    expect(code1).not.toBe(code2);
    
    // Check format: PA + YYMMDD + BR + XXXX
    const today = new Date();
    const year = today.getFullYear().toString().substr(-2);
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    const datePrefix = `PA${year}${month}${day}`;
    
    expect(code1.startsWith(datePrefix)).toBe(true);
    expect(code1.substring(8, 10)).toBe('JK'); // Branch code
    expect(code1.length).toBe(14); // PA + 6 digits for date + 2 for branch + 4 for sequence
  });

  test('should add activity to history', async () => {
    // Create a pickup assignment
    const code = await PickupAssignment.generateCode(testBranch._id);
    
    const pickupAssignmentData = {
      code,
      branch: testBranch._id,
      assignmentDate: new Date(),
      team: {
        driver: testDriver._id,
        helpers: [testHelper._id],
      },
      vehicle: testVehicle._id,
      createdBy: testUser._id,
    };

    const pickupAssignment = new PickupAssignment(pickupAssignmentData);
    await pickupAssignment.save();

    // Add an activity
    pickupAssignment.addActivity('created', testUser._id, { details: 'Test activity' });
    await pickupAssignment.save();

    // Retrieve the updated pickup assignment
    const updatedPickupAssignment = await PickupAssignment.findById(pickupAssignment._id);

    expect(updatedPickupAssignment.activityHistory).toBeDefined();
    expect(updatedPickupAssignment.activityHistory.length).toBe(1);
    expect(updatedPickupAssignment.activityHistory[0].action).toBe('created');
    expect(updatedPickupAssignment.activityHistory[0].performedBy.toString()).toBe(testUser._id.toString());
    expect(updatedPickupAssignment.activityHistory[0].details).toEqual({ details: 'Test activity' });
    expect(updatedPickupAssignment.activityHistory[0].timestamp).toBeDefined();
  });

  test('should validate GPS coordinates', async () => {
    const code = await PickupAssignment.generateCode(testBranch._id);
    
    const pickupAssignment = new PickupAssignment({
      code,
      branch: testBranch._id,
      assignmentDate: new Date(),
      team: {
        driver: testDriver._id,
      },
      vehicle: testVehicle._id,
      execution: {
        tracking: [
          {
            timestamp: new Date(),
            coordinates: {
              type: 'Point',
              coordinates: [200, 100], // Invalid coordinates (longitude > 180)
            },
          },
        ],
      },
      createdBy: testUser._id,
    });

    let error;
    try {
      await pickupAssignment.save();
    } catch (e) {
      error = e;
    }

    expect(error).toBeDefined();
    expect(error.name).toBe('ValidationError');
    expect(error.errors['execution.tracking.0.coordinates.coordinates']).toBeDefined();
  });

  test('should update status correctly', async () => {
    // Create a pickup assignment
    const code = await PickupAssignment.generateCode(testBranch._id);
    
    const pickupAssignmentData = {
      code,
      branch: testBranch._id,
      assignmentDate: new Date(),
      team: {
        driver: testDriver._id,
        helpers: [testHelper._id],
      },
      vehicle: testVehicle._id,
      status: 'planned',
      createdBy: testUser._id,
    };

    const pickupAssignment = new PickupAssignment(pickupAssignmentData);
    await pickupAssignment.save();

    // Update status
    pickupAssignment.status = 'assigned';
    await pickupAssignment.save();

    // Retrieve the updated pickup assignment
    const updatedPickupAssignment = await PickupAssignment.findById(pickupAssignment._id);

    expect(updatedPickupAssignment.status).toBe('assigned');
  });

  test('should handle route optimization data', async () => {
    // Create a pickup assignment
    const code = await PickupAssignment.generateCode(testBranch._id);
    
    const pickupAssignmentData = {
      code,
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

    const pickupAssignment = new PickupAssignment(pickupAssignmentData);
    await pickupAssignment.save();

    // Add route optimization data
    pickupAssignment.route = {
      optimized: true,
      stops: [
        {
          pickupRequest: testPickupRequest._id,
          sequenceNumber: 1,
          estimatedArrival: new Date(),
          status: 'pending',
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
    };
    
    await pickupAssignment.save();

    // Retrieve the updated pickup assignment
    const updatedPickupAssignment = await PickupAssignment.findById(pickupAssignment._id);

    expect(updatedPickupAssignment.route).toBeDefined();
    expect(updatedPickupAssignment.route.optimized).toBe(true);
    expect(updatedPickupAssignment.route.stops.length).toBe(1);
    expect(updatedPickupAssignment.route.stops[0].pickupRequest.toString()).toBe(testPickupRequest._id.toString());
    expect(updatedPickupAssignment.route.stops[0].sequenceNumber).toBe(1);
    expect(updatedPickupAssignment.route.stops[0].status).toBe('pending');
    expect(updatedPickupAssignment.route.totalDistance).toBe(10.4);
    expect(updatedPickupAssignment.route.totalDuration).toBe(30);
  });

  test('should handle GPS tracking data', async () => {
    // Create a pickup assignment
    const code = await PickupAssignment.generateCode(testBranch._id);
    
    const pickupAssignmentData = {
      code,
      branch: testBranch._id,
      assignmentDate: new Date(),
      team: {
        driver: testDriver._id,
      },
      vehicle: testVehicle._id,
      status: 'in_progress',
      createdBy: testUser._id,
    };

    const pickupAssignment = new PickupAssignment(pickupAssignmentData);
    await pickupAssignment.save();

    // Add GPS tracking data
    if (!pickupAssignment.execution) {
      pickupAssignment.execution = {};
    }
    
    if (!pickupAssignment.execution.tracking) {
      pickupAssignment.execution.tracking = [];
    }
    
    pickupAssignment.execution.tracking.push({
      timestamp: new Date(),
      coordinates: {
        type: 'Point',
        coordinates: [106.8500, -6.2100],
      },
      speed: 30,
      heading: 90,
      accuracy: 10,
      address: 'Jl. Test',
      provider: 'gps',
    });
    
    await pickupAssignment.save();

    // Retrieve the updated pickup assignment
    const updatedPickupAssignment = await PickupAssignment.findById(pickupAssignment._id);

    expect(updatedPickupAssignment.execution).toBeDefined();
    expect(updatedPickupAssignment.execution.tracking).toBeDefined();
    expect(updatedPickupAssignment.execution.tracking.length).toBe(1);
    expect(updatedPickupAssignment.execution.tracking[0].coordinates.type).toBe('Point');
    expect(updatedPickupAssignment.execution.tracking[0].coordinates.coordinates).toEqual([106.8500, -6.2100]);
    expect(updatedPickupAssignment.execution.tracking[0].speed).toBe(30);
    expect(updatedPickupAssignment.execution.tracking[0].heading).toBe(90);
    expect(updatedPickupAssignment.execution.tracking[0].provider).toBe('gps');
  });

  test('should handle issue reporting and resolution', async () => {
    // Create a pickup assignment
    const code = await PickupAssignment.generateCode(testBranch._id);
    
    const pickupAssignmentData = {
      code,
      branch: testBranch._id,
      assignmentDate: new Date(),
      team: {
        driver: testDriver._id,
      },
      vehicle: testVehicle._id,
      status: 'in_progress',
      createdBy: testUser._id,
    };

    const pickupAssignment = new PickupAssignment(pickupAssignmentData);
    await pickupAssignment.save();

    // Report an issue
    if (!pickupAssignment.execution) {
      pickupAssignment.execution = {};
    }
    
    if (!pickupAssignment.execution.issues) {
      pickupAssignment.execution.issues = [];
    }
    
    pickupAssignment.execution.issues.push({
      type: 'vehicle_breakdown',
      description: 'Flat tire',
      reportedAt: new Date(),
      reportedBy: testUser._id,
      resolved: false,
    });
    
    await pickupAssignment.save();

    // Retrieve the updated pickup assignment
    let updatedPickupAssignment = await PickupAssignment.findById(pickupAssignment._id);

    expect(updatedPickupAssignment.execution).toBeDefined();
    expect(updatedPickupAssignment.execution.issues).toBeDefined();
    expect(updatedPickupAssignment.execution.issues.length).toBe(1);
    expect(updatedPickupAssignment.execution.issues[0].type).toBe('vehicle_breakdown');
    expect(updatedPickupAssignment.execution.issues[0].description).toBe('Flat tire');
    expect(updatedPickupAssignment.execution.issues[0].resolved).toBe(false);

    // Resolve the issue
    updatedPickupAssignment.execution.issues[0].resolved = true;
    updatedPickupAssignment.execution.issues[0].resolvedAt = new Date();
    updatedPickupAssignment.execution.issues[0].resolution = 'Changed the tire';
    await updatedPickupAssignment.save();

    // Retrieve the updated pickup assignment again
    const finalPickupAssignment = await PickupAssignment.findById(pickupAssignment._id);

    expect(finalPickupAssignment.execution.issues[0].resolved).toBe(true);
    expect(finalPickupAssignment.execution.issues[0].resolvedAt).toBeDefined();
    expect(finalPickupAssignment.execution.issues[0].resolution).toBe('Changed the tire');
  });
});
