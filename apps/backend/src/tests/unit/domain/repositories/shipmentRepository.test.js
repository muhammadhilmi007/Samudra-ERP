/**
 * Samudra Paket ERP - Shipment Repository Tests
 * Unit tests for the shipment repository
 */

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const shipmentRepository = require('../../../../domain/repositories/shipmentRepository');
const Shipment = require('../../../../domain/models/shipment');
const LoadingForm = require('../../../../domain/models/loadingForm');
const Branch = require('../../../../domain/models/branch');

// Mock dependencies
jest.mock('../../../../api/middleware/gateway/logger', () => ({
  error: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
}));

// Mock Branch model
jest.mock('../../../../domain/models/branch', () => ({
  findById: jest.fn(),
}));

// Mock LoadingForm model
jest.mock('../../../../domain/models/loadingForm', () => ({
  findById: jest.fn(),
}));

// Mock Shipment model
jest.mock('../../../../domain/models/shipment', () => ({
  findById: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
  countDocuments: jest.fn(),
  generateShipmentNo: jest.fn(),
}));

describe('Shipment Repository', () => {
  let mongoServer;
  
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  });
  
  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('createShipment', () => {
    it('should create a new shipment successfully', async () => {
      // Mock data
      const mockShipmentNo = 'SP2505BR0001';
      const mockShipmentData = {
        loadingForm: 'loadingFormId',
        vehicle: 'vehicleId',
        driver: 'driverId',
        helper: 'helperId',
        originBranch: 'originBranchId',
        destinationBranch: 'destinationBranchId',
        departureDate: new Date(),
        estimatedArrival: new Date(),
        distance: 100,
        estimatedDuration: 120,
        route: 'Route description',
        notes: 'Test notes',
        createdBy: 'userId',
      };
      
      // Mock shipment instance
      const mockShipment = {
        ...mockShipmentData,
        shipmentNo: mockShipmentNo,
        addActivity: jest.fn(),
        statusHistory: [],
        save: jest.fn().mockResolvedValue(true),
      };
      
      // Mock LoadingForm instance
      const mockLoadingForm = {
        status: 'loaded',
        addActivity: jest.fn(),
        save: jest.fn().mockResolvedValue(true),
      };
      
      // Setup mocks
      Shipment.generateShipmentNo.mockResolvedValue(mockShipmentNo);
      LoadingForm.findById.mockResolvedValue(mockLoadingForm);
      
      // Mock Shipment constructor
      const originalShipment = jest.requireActual('../../../../domain/models/shipment');
      Shipment.mockImplementation(() => mockShipment);
      
      // Call the function
      const result = await shipmentRepository.createShipment(mockShipmentData);
      
      // Assertions
      expect(Shipment.generateShipmentNo).toHaveBeenCalledWith(mockShipmentData.originBranch);
      expect(mockShipment.addActivity).toHaveBeenCalledWith('created', mockShipmentData.createdBy, expect.any(Object));
      expect(mockShipment.statusHistory).toEqual([{
        status: 'preparing',
        timestamp: expect.any(Date),
        notes: 'Shipment created',
        user: mockShipmentData.createdBy,
      }]);
      expect(mockShipment.save).toHaveBeenCalled();
      expect(LoadingForm.findById).toHaveBeenCalledWith(mockShipmentData.loadingForm);
      expect(mockLoadingForm.addActivity).toHaveBeenCalledWith('shipment_created', mockShipmentData.createdBy, expect.any(Object));
      expect(mockLoadingForm.save).toHaveBeenCalled();
      expect(result).toEqual(mockShipment);
    });
    
    it('should handle errors when creating a shipment', async () => {
      // Mock data
      const mockShipmentData = {
        loadingForm: 'loadingFormId',
        vehicle: 'vehicleId',
        driver: 'driverId',
        originBranch: 'originBranchId',
        destinationBranch: 'destinationBranchId',
        departureDate: new Date(),
        estimatedArrival: new Date(),
        distance: 100,
        estimatedDuration: 120,
        createdBy: 'userId',
      };
      
      // Setup mocks
      const error = new Error('Test error');
      Shipment.generateShipmentNo.mockRejectedValue(error);
      
      // Call the function and expect it to throw
      await expect(shipmentRepository.createShipment(mockShipmentData)).rejects.toThrow(error);
    });
  });
  
  describe('getAllShipments', () => {
    it('should get all shipments with filtering and pagination', async () => {
      // Mock data
      const mockFilter = {
        originBranch: 'originBranchId',
        status: 'in_transit',
      };
      const mockOptions = {
        page: 1,
        limit: 10,
        sortBy: 'departureDate',
        sortOrder: 'desc',
        populate: ['vehicle', 'driver'],
      };
      const mockShipments = [
        { id: 'shipment1', status: 'in_transit' },
        { id: 'shipment2', status: 'in_transit' },
      ];
      const mockTotalCount = 2;
      
      // Setup mocks
      Shipment.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              populate: jest.fn().mockResolvedValue(mockShipments),
            }),
          }),
        }),
      });
      Shipment.countDocuments.mockResolvedValue(mockTotalCount);
      
      // Call the function
      const result = await shipmentRepository.getAllShipments(mockFilter, mockOptions);
      
      // Assertions
      expect(Shipment.find).toHaveBeenCalledWith({
        originBranch: mongoose.Types.ObjectId(mockFilter.originBranch),
        status: mockFilter.status,
      });
      expect(Shipment.countDocuments).toHaveBeenCalled();
      expect(result).toEqual({
        data: mockShipments,
        pagination: {
          page: 1,
          limit: 10,
          totalCount: mockTotalCount,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      });
    });
    
    it('should handle errors when getting shipments', async () => {
      // Setup mocks
      const error = new Error('Test error');
      Shipment.find.mockImplementation(() => {
        throw error;
      });
      
      // Call the function and expect it to throw
      await expect(shipmentRepository.getAllShipments()).rejects.toThrow(error);
    });
  });
  
  describe('getShipmentById', () => {
    it('should get a shipment by ID', async () => {
      // Mock data
      const mockId = 'shipmentId';
      const mockPopulate = ['vehicle', 'driver'];
      const mockShipment = {
        id: mockId,
        status: 'in_transit',
      };
      
      // Setup mocks
      Shipment.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockShipment),
      });
      
      // Call the function
      const result = await shipmentRepository.getShipmentById(mockId, mockPopulate);
      
      // Assertions
      expect(Shipment.findById).toHaveBeenCalledWith(mockId);
      expect(result).toEqual(mockShipment);
    });
    
    it('should throw an error if shipment is not found', async () => {
      // Mock data
      const mockId = 'nonExistentId';
      
      // Setup mocks
      Shipment.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null),
      });
      
      // Call the function and expect it to throw
      await expect(shipmentRepository.getShipmentById(mockId)).rejects.toThrow('Shipment not found');
    });
  });
  
  describe('updateStatus', () => {
    it('should update shipment status successfully', async () => {
      // Mock data
      const mockId = 'shipmentId';
      const mockStatus = 'departed';
      const mockUserId = 'userId';
      const mockAdditionalData = {
        departureDate: new Date(),
      };
      
      // Mock shipment instance
      const mockShipment = {
        id: mockId,
        status: 'preparing',
        statusHistory: [],
        addActivity: jest.fn(),
        save: jest.fn().mockResolvedValue(true),
      };
      
      // Setup mocks
      Shipment.findById.mockResolvedValue(mockShipment);
      
      // Call the function
      const result = await shipmentRepository.updateStatus(mockId, mockStatus, mockUserId, mockAdditionalData);
      
      // Assertions
      expect(Shipment.findById).toHaveBeenCalledWith(mockId);
      expect(mockShipment.status).toBe(mockStatus);
      expect(mockShipment.statusHistory).toContainEqual({
        status: mockStatus,
        timestamp: expect.any(Date),
        location: undefined,
        notes: '',
        user: mockUserId,
      });
      expect(mockShipment.addActivity).toHaveBeenCalledWith('status_updated', mockUserId, expect.any(Object));
      expect(mockShipment.save).toHaveBeenCalled();
      expect(result).toEqual(mockShipment);
    });
    
    it('should throw an error for invalid status transition', async () => {
      // Mock data
      const mockId = 'shipmentId';
      const mockStatus = 'completed'; // Invalid transition from preparing
      const mockUserId = 'userId';
      
      // Mock shipment instance
      const mockShipment = {
        id: mockId,
        status: 'preparing',
      };
      
      // Setup mocks
      Shipment.findById.mockResolvedValue(mockShipment);
      
      // Call the function and expect it to throw
      await expect(shipmentRepository.updateStatus(mockId, mockStatus, mockUserId)).rejects.toThrow('Invalid status transition');
    });
  });
  
  describe('recordGpsLocation', () => {
    it('should record GPS location successfully', async () => {
      // Mock data
      const mockId = 'shipmentId';
      const mockLocationData = {
        coordinates: [106.8456, -6.2088],
        speed: 60,
        heading: 90,
        accuracy: 10,
        address: 'Jakarta, Indonesia',
        provider: 'gps',
      };
      const mockUserId = 'userId';
      
      // Mock shipment instance
      const mockShipment = {
        id: mockId,
        status: 'in_transit',
        addTrackingLocation: jest.fn(),
        updatedBy: null,
        addActivity: jest.fn(),
        save: jest.fn().mockResolvedValue(true),
      };
      
      // Setup mocks
      Shipment.findById.mockResolvedValue(mockShipment);
      
      // Call the function
      const result = await shipmentRepository.recordGpsLocation(mockId, mockLocationData, mockUserId);
      
      // Assertions
      expect(Shipment.findById).toHaveBeenCalledWith(mockId);
      expect(mockShipment.addTrackingLocation).toHaveBeenCalledWith(expect.objectContaining({
        coordinates: {
          type: 'Point',
          coordinates: mockLocationData.coordinates,
        },
        speed: mockLocationData.speed,
      }));
      expect(mockShipment.updatedBy).toBe(mockUserId);
      expect(mockShipment.addActivity).toHaveBeenCalledWith('location_updated', mockUserId, expect.any(Object));
      expect(mockShipment.save).toHaveBeenCalled();
      expect(result).toEqual(mockShipment);
    });
    
    it('should throw an error if shipment status does not allow tracking', async () => {
      // Mock data
      const mockId = 'shipmentId';
      const mockLocationData = {
        coordinates: [106.8456, -6.2088],
      };
      const mockUserId = 'userId';
      
      // Mock shipment instance
      const mockShipment = {
        id: mockId,
        status: 'completed', // Completed status does not allow tracking
      };
      
      // Setup mocks
      Shipment.findById.mockResolvedValue(mockShipment);
      
      // Call the function and expect it to throw
      await expect(shipmentRepository.recordGpsLocation(mockId, mockLocationData, mockUserId)).rejects.toThrow('Cannot record GPS location for shipment with status completed');
    });
  });
  
  // Additional tests for other repository functions would follow the same pattern
});
