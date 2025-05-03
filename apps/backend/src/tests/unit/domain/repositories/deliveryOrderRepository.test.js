/**
 * Samudra Paket ERP - Delivery Order Repository Unit Tests
 * Tests for delivery order repository business logic
 */

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const DeliveryOrderRepository = require('../../../../domain/repositories/deliveryOrderRepository');
const DeliveryOrder = require('../../../../domain/models/deliveryOrder');
const { ValidationError, NotFoundError } = require('../../../../domain/utils/errors');

// Mock data
const mockUserId = new mongoose.Types.ObjectId();
const mockBranchId = new mongoose.Types.ObjectId();
const mockVehicleId = new mongoose.Types.ObjectId();
const mockDriverId = new mongoose.Types.ObjectId();
const mockShipmentOrderId = new mongoose.Types.ObjectId();

// Sample delivery order data
const sampleDeliveryOrderData = {
  branch: mockBranchId,
  scheduledDate: new Date(),
  scheduledTime: '09:00',
  vehicle: mockVehicleId,
  driver: mockDriverId,
  notes: 'Test delivery order',
  priority: 'normal',
  createdBy: mockUserId,
  deliveryItems: [
    {
      shipmentOrder: mockShipmentOrderId,
      waybillNumber: 'WB12345678',
      receiverName: 'John Doe',
      receiverAddress: 'Jl. Test No. 123, Jakarta',
      receiverPhone: '081234567890',
      itemDescription: 'Package',
      weight: 5,
      dimensions: {
        length: 30,
        width: 20,
        height: 10
      },
      paymentType: 'CASH'
    }
  ],
  route: {
    startLocation: {
      type: 'Point',
      coordinates: [106.8456, -6.2088],
      address: 'Jakarta Branch'
    }
  }
};

describe('DeliveryOrderRepository', () => {
  let mongoServer;
  let repository;
  let createdDeliveryOrder;

  // Setup MongoDB Memory Server before tests
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    repository = new DeliveryOrderRepository();
  });

  // Clean up after tests
  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  // Clean up database between tests
  afterEach(async () => {
    await DeliveryOrder.deleteMany({});
  });

  describe('create', () => {
    it('should create a new delivery order', async () => {
      const result = await repository.create(sampleDeliveryOrderData);
      
      expect(result).toBeDefined();
      expect(result.deliveryOrderNo).toBeDefined();
      expect(result.branch.toString()).toBe(mockBranchId.toString());
      expect(result.status).toBe('pending');
      expect(result.deliveryItems).toHaveLength(1);
      expect(result.activityHistory).toHaveLength(1);
      
      // Save for later tests
      createdDeliveryOrder = result;
    });

    it('should throw validation error for invalid data', async () => {
      const invalidData = {
        ...sampleDeliveryOrderData,
        branch: 'invalid-id' // Invalid ObjectId
      };
      
      await expect(repository.create(invalidData)).rejects.toThrow();
    });
  });

  describe('findById', () => {
    beforeEach(async () => {
      createdDeliveryOrder = await repository.create(sampleDeliveryOrderData);
    });

    it('should find delivery order by ID', async () => {
      const result = await repository.findById(createdDeliveryOrder._id);
      
      expect(result).toBeDefined();
      expect(result._id.toString()).toBe(createdDeliveryOrder._id.toString());
      expect(result.deliveryOrderNo).toBe(createdDeliveryOrder.deliveryOrderNo);
    });

    it('should throw not found error for non-existent ID', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      await expect(repository.findById(nonExistentId)).rejects.toThrow(NotFoundError);
    });
  });

  describe('update', () => {
    beforeEach(async () => {
      createdDeliveryOrder = await repository.create(sampleDeliveryOrderData);
    });

    it('should update delivery order', async () => {
      const updateData = {
        notes: 'Updated notes',
        priority: 'high'
      };
      
      const result = await repository.update(createdDeliveryOrder._id, updateData, mockUserId);
      
      expect(result).toBeDefined();
      expect(result.notes).toBe(updateData.notes);
      expect(result.priority).toBe(updateData.priority);
      expect(result.updatedBy.toString()).toBe(mockUserId.toString());
      expect(result.activityHistory).toHaveLength(2); // Initial + update activity
    });
  });

  describe('updateStatus', () => {
    beforeEach(async () => {
      createdDeliveryOrder = await repository.create(sampleDeliveryOrderData);
    });

    it('should update delivery order status', async () => {
      const statusData = {
        notes: 'Order assigned',
        location: {
          type: 'Point',
          coordinates: [106.8456, -6.2088]
        }
      };
      
      const result = await repository.updateStatus(
        createdDeliveryOrder._id, 
        'assigned', 
        mockUserId, 
        statusData
      );
      
      expect(result).toBeDefined();
      expect(result.status).toBe('assigned');
      expect(result.statusHistory).toHaveLength(1);
      expect(result.statusHistory[0].status).toBe('assigned');
      expect(result.statusHistory[0].notes).toBe(statusData.notes);
      expect(result.activityHistory).toHaveLength(2); // Initial + status update activity
    });

    it('should throw validation error for invalid status transition', async () => {
      // First update to 'assigned'
      await repository.updateStatus(
        createdDeliveryOrder._id, 
        'assigned', 
        mockUserId
      );
      
      // Try to update to 'completed' (invalid transition from 'assigned')
      await expect(
        repository.updateStatus(createdDeliveryOrder._id, 'completed', mockUserId)
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('addDeliveryItem', () => {
    beforeEach(async () => {
      createdDeliveryOrder = await repository.create(sampleDeliveryOrderData);
    });

    it('should add delivery item to delivery order', async () => {
      const newItem = {
        shipmentOrder: new mongoose.Types.ObjectId(),
        waybillNumber: 'WB87654321',
        receiverName: 'Jane Doe',
        receiverAddress: 'Jl. Test No. 456, Jakarta',
        receiverPhone: '089876543210',
        itemDescription: 'Another Package',
        weight: 3,
        paymentType: 'COD',
        codAmount: 150000
      };
      
      const result = await repository.addDeliveryItem(
        createdDeliveryOrder._id, 
        newItem, 
        mockUserId
      );
      
      expect(result).toBeDefined();
      expect(result.deliveryItems).toHaveLength(2);
      expect(result.deliveryItems[1].waybillNumber).toBe(newItem.waybillNumber);
      expect(result.activityHistory).toHaveLength(2); // Initial + add item activity
    });
  });

  describe('optimizeRoute', () => {
    beforeEach(async () => {
      // Create delivery order with multiple items for route optimization
      const dataWithMultipleItems = {
        ...sampleDeliveryOrderData,
        deliveryItems: [
          {
            shipmentOrder: new mongoose.Types.ObjectId(),
            waybillNumber: 'WB12345678',
            receiverName: 'John Doe',
            receiverAddress: 'Jl. Test No. 123, Jakarta',
            receiverPhone: '081234567890',
            itemDescription: 'Package 1',
            weight: 5,
            paymentType: 'CASH',
            receiverLocation: {
              type: 'Point',
              coordinates: [106.8256, -6.1988],
              address: 'Location 1'
            }
          },
          {
            shipmentOrder: new mongoose.Types.ObjectId(),
            waybillNumber: 'WB87654321',
            receiverName: 'Jane Doe',
            receiverAddress: 'Jl. Test No. 456, Jakarta',
            receiverPhone: '089876543210',
            itemDescription: 'Package 2',
            weight: 3,
            paymentType: 'COD',
            codAmount: 150000,
            receiverLocation: {
              type: 'Point',
              coordinates: [106.8356, -6.2188],
              address: 'Location 2'
            }
          }
        ]
      };
      
      createdDeliveryOrder = await repository.create(dataWithMultipleItems);
    });

    it('should optimize delivery route', async () => {
      const result = await repository.optimizeRoute(
        createdDeliveryOrder._id, 
        mockUserId
      );
      
      expect(result).toBeDefined();
      expect(result.route.optimized).toBe(true);
      expect(result.route.stops).toHaveLength(2);
      expect(result.route.totalDistance).toBeGreaterThan(0);
      expect(result.route.estimatedDuration).toBeGreaterThan(0);
      expect(result.activityHistory).toHaveLength(2); // Initial + optimize route activity
    });
  });

  describe('assignDelivery', () => {
    beforeEach(async () => {
      createdDeliveryOrder = await repository.create(sampleDeliveryOrderData);
    });

    it('should assign delivery order to vehicle and driver', async () => {
      const assignmentData = {
        vehicle: new mongoose.Types.ObjectId(),
        driver: new mongoose.Types.ObjectId(),
        helper: new mongoose.Types.ObjectId(),
        scheduledDate: new Date(),
        scheduledTime: '10:00',
        notes: 'Assignment notes'
      };
      
      const result = await repository.assignDelivery(
        createdDeliveryOrder._id, 
        assignmentData, 
        mockUserId
      );
      
      expect(result).toBeDefined();
      expect(result.status).toBe('assigned');
      expect(result.vehicle.toString()).toBe(assignmentData.vehicle.toString());
      expect(result.driver.toString()).toBe(assignmentData.driver.toString());
      expect(result.helper.toString()).toBe(assignmentData.helper.toString());
      expect(result.scheduledTime).toBe(assignmentData.scheduledTime);
      expect(result.statusHistory).toHaveLength(1);
      expect(result.statusHistory[0].status).toBe('assigned');
      expect(result.deliveryItems[0].status).toBe('assigned');
      expect(result.activityHistory).toHaveLength(2); // Initial + assign activity
    });
  });

  // Additional tests would be implemented for other repository methods
  // such as recordProofOfDelivery, recordCODPayment, startDelivery, etc.
});
