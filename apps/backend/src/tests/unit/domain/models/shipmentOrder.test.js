/**
 * Samudra Paket ERP - Shipment Order Model Unit Tests
 */

const mongoose = require('mongoose');
const ShipmentOrder = require('../../../../domain/models/shipmentOrder');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

// Setup before tests
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

// Cleanup after tests
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// Clear data between tests
afterEach(async () => {
  await ShipmentOrder.deleteMany({});
});

describe('ShipmentOrder Model', () => {
  // Mock data for testing
  const mockBranchId = new mongoose.Types.ObjectId();
  const mockUserId = new mongoose.Types.ObjectId();
  const mockCustomerId = new mongoose.Types.ObjectId();
  
  const mockShipmentOrderData = {
    branch: mockBranchId,
    sender: {
      customer: mockCustomerId,
      name: 'John Doe',
      address: {
        street: 'Jl. Test No. 123',
        city: 'Jakarta',
        district: 'Menteng',
        province: 'DKI Jakarta',
        postalCode: '10310',
        country: 'Indonesia',
      },
      phone: '081234567890',
      email: 'john.doe@example.com',
    },
    receiver: {
      name: 'Jane Smith',
      address: {
        street: 'Jl. Sample No. 456',
        city: 'Bandung',
        district: 'Cicendo',
        province: 'Jawa Barat',
        postalCode: '40171',
        country: 'Indonesia',
      },
      phone: '089876543210',
      email: 'jane.smith@example.com',
    },
    originBranch: mockBranchId,
    destinationBranch: new mongoose.Types.ObjectId(),
    serviceType: 'regular',
    paymentType: 'CASH',
    items: [
      {
        description: 'Test Item 1',
        quantity: 2,
        weight: 1.5,
        dimensions: {
          length: 20,
          width: 15,
          height: 10,
          unit: 'cm',
        },
        value: 150000,
        category: 'electronics',
      },
    ],
    totalItems: 2,
    totalWeight: 3,
    amount: {
      baseRate: 45000,
      additionalServices: 0,
      insurance: 0,
      tax: 4950,
      total: 49950,
    },
    status: 'created',
    createdBy: mockUserId,
  };

  // Test case for creating a shipment order
  test('should create a shipment order successfully', async () => {
    // Mock the generateWaybillNo static method
    ShipmentOrder.generateWaybillNo = jest.fn().mockResolvedValue('SM230501JK0001');
    
    // Create a new shipment order with waybill number
    const shipmentOrderWithWaybill = {
      ...mockShipmentOrderData,
      waybillNo: 'SM230501JK0001',
    };
    
    const shipmentOrder = new ShipmentOrder(shipmentOrderWithWaybill);
    const savedShipmentOrder = await shipmentOrder.save();
    
    // Check if the shipment order was created correctly
    expect(savedShipmentOrder._id).toBeDefined();
    expect(savedShipmentOrder.waybillNo).toBe('SM230501JK0001');
    expect(savedShipmentOrder.sender.name).toBe('John Doe');
    expect(savedShipmentOrder.receiver.name).toBe('Jane Smith');
    expect(savedShipmentOrder.status).toBe('created');
    expect(savedShipmentOrder.items.length).toBe(1);
    expect(savedShipmentOrder.totalItems).toBe(2);
    expect(savedShipmentOrder.totalWeight).toBe(3);
    expect(savedShipmentOrder.amount.total).toBe(49950);
  });

  // Test case for adding status history
  test('should add status history correctly', async () => {
    // Create a shipment order
    const shipmentOrder = new ShipmentOrder({
      ...mockShipmentOrderData,
      waybillNo: 'SM230501JK0002',
    });
    await shipmentOrder.save();
    
    // Add status history
    const newStatus = 'processed';
    const details = {
      location: 'Jakarta Branch',
      notes: 'Processed for shipping',
    };
    
    shipmentOrder.addStatusHistory(newStatus, mockUserId, details);
    await shipmentOrder.save();
    
    // Check if status history was added correctly
    expect(shipmentOrder.status).toBe(newStatus);
    expect(shipmentOrder.statusHistory.length).toBe(1);
    expect(shipmentOrder.statusHistory[0].status).toBe(newStatus);
    expect(shipmentOrder.statusHistory[0].location).toBe(details.location);
    expect(shipmentOrder.statusHistory[0].notes).toBe(details.notes);
    expect(shipmentOrder.statusHistory[0].user.toString()).toBe(mockUserId.toString());
  });

  // Test case for calculating volumetric weight
  test('should calculate volumetric weight correctly', async () => {
    // Create a shipment order with dimensions
    const shipmentOrder = new ShipmentOrder({
      ...mockShipmentOrderData,
      waybillNo: 'SM230501JK0003',
    });
    
    // Calculate volumetric weight
    const volumetricWeight = shipmentOrder.calculateVolumetricWeight();
    
    // Check if volumetric weight was calculated correctly
    // For 20cm x 15cm x 10cm with quantity 2, the calculation should be:
    // (20 * 15 * 10) / 5000 * 2 = 1.2 kg
    expect(volumetricWeight).toBeCloseTo(1.2, 2);
  });

  // Test case for calculating chargeable weight
  test('should calculate chargeable weight correctly', async () => {
    // Create a shipment order with dimensions
    const shipmentOrder = new ShipmentOrder({
      ...mockShipmentOrderData,
      waybillNo: 'SM230501JK0004',
    });
    
    // Calculate chargeable weight
    const chargeableWeight = shipmentOrder.calculateChargeableWeight();
    
    // Check if chargeable weight was calculated correctly
    // Since actual weight (3kg) > volumetric weight (1.2kg), chargeable weight should be 3kg
    expect(chargeableWeight).toBe(3);
  });

  // Test case for chargeable weight when volumetric weight is greater
  test('should use volumetric weight when it is greater than actual weight', async () => {
    // Create a shipment order with large dimensions but small weight
    const shipmentOrder = new ShipmentOrder({
      ...mockShipmentOrderData,
      waybillNo: 'SM230501JK0005',
      totalWeight: 1,
      items: [
        {
          description: 'Large Light Item',
          quantity: 1,
          weight: 1,
          dimensions: {
            length: 100,
            width: 50,
            height: 30,
            unit: 'cm',
          },
        },
      ],
    });
    
    // Calculate chargeable weight
    const chargeableWeight = shipmentOrder.calculateChargeableWeight();
    
    // Check if chargeable weight was calculated correctly
    // Volumetric weight: (100 * 50 * 30) / 5000 = 30kg
    // Since volumetric weight (30kg) > actual weight (1kg), chargeable weight should be 30kg
    expect(chargeableWeight).toBeCloseTo(30, 2);
  });
});
