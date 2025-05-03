/**
 * Samudra Paket ERP - Shipment Controller Tests
 * Unit tests for the shipment controller
 */

const shipmentController = require('../../../../api/controllers/shipmentController');
const shipmentRepository = require('../../../../domain/repositories/shipmentRepository');
const { createApiError } = require('../../../../api/utils/apiError');

// Mock dependencies
jest.mock('../../../../domain/repositories/shipmentRepository', () => ({
  createShipment: jest.fn(),
  getAllShipments: jest.fn(),
  getShipmentById: jest.fn(),
  getShipmentByShipmentNo: jest.fn(),
  updateShipment: jest.fn(),
  updateStatus: jest.fn(),
  recordGpsLocation: jest.fn(),
  updateETA: jest.fn(),
  addCheckpoint: jest.fn(),
  updateCheckpointStatus: jest.fn(),
  reportIssue: jest.fn(),
  resolveIssue: jest.fn(),
  getActiveBranchShipments: jest.fn(),
  getShipmentsBetweenBranches: jest.fn(),
  getTodayShipments: jest.fn(),
  getShipmentsForDelivery: jest.fn(),
}));

jest.mock('../../../../api/utils/apiError', () => ({
  createApiError: jest.fn(),
}));

jest.mock('../../../../api/middleware/gateway/logger', () => ({
  error: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
}));

describe('Shipment Controller', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      query: {},
      user: { id: 'userId', role: 'admin' },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('createShipment', () => {
    it('should create a shipment and return success response', async () => {
      // Mock data
      const mockShipmentData = {
        loadingForm: 'loadingFormId',
        vehicle: 'vehicleId',
        driver: 'driverId',
        originBranch: 'originBranchId',
        destinationBranch: 'destinationBranchId',
        departureDate: '2023-05-01T08:00:00.000Z',
        estimatedArrival: '2023-05-01T14:00:00.000Z',
        distance: 100,
        estimatedDuration: 120,
        route: 'Route description',
        notes: 'Test notes',
      };
      req.body = mockShipmentData;

      const mockCreatedShipment = {
        _id: 'shipmentId',
        shipmentNo: 'SP2505BR0001',
        ...mockShipmentData,
      };

      // Setup mocks
      shipmentRepository.createShipment.mockResolvedValue(mockCreatedShipment);

      // Call the controller
      await shipmentController.createShipment(req, res, next);

      // Assertions
      expect(shipmentRepository.createShipment).toHaveBeenCalledWith({
        ...mockShipmentData,
        createdBy: req.user.id,
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockCreatedShipment,
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle errors and call next with the error', async () => {
      // Mock data
      req.body = {
        loadingForm: 'loadingFormId',
        // Missing required fields
      };

      // Setup mocks
      const error = new Error('Validation error');
      shipmentRepository.createShipment.mockRejectedValue(error);
      createApiError.mockReturnValue(error);

      // Call the controller
      await shipmentController.createShipment(req, res, next);

      // Assertions
      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('getAllShipments', () => {
    it('should get all shipments with filtering and pagination', async () => {
      // Mock data
      req.query = {
        page: '1',
        limit: '10',
        originBranch: 'originBranchId',
        status: 'in_transit',
        sortBy: 'departureDate',
        sortOrder: 'desc',
      };

      const mockShipments = {
        data: [
          { _id: 'shipment1', status: 'in_transit' },
          { _id: 'shipment2', status: 'in_transit' },
        ],
        pagination: {
          page: 1,
          limit: 10,
          totalCount: 2,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      // Setup mocks
      shipmentRepository.getAllShipments.mockResolvedValue(mockShipments);

      // Call the controller
      await shipmentController.getAllShipments(req, res, next);

      // Assertions
      expect(shipmentRepository.getAllShipments).toHaveBeenCalledWith(
        {
          originBranch: 'originBranchId',
          status: 'in_transit',
        },
        {
          page: 1,
          limit: 10,
          sortBy: 'departureDate',
          sortOrder: 'desc',
          populate: expect.any(Array),
        }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockShipments.data,
        pagination: mockShipments.pagination,
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle errors and call next with the error', async () => {
      // Setup mocks
      const error = new Error('Database error');
      shipmentRepository.getAllShipments.mockRejectedValue(error);
      createApiError.mockReturnValue(error);

      // Call the controller
      await shipmentController.getAllShipments(req, res, next);

      // Assertions
      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('getShipmentById', () => {
    it('should get a shipment by ID', async () => {
      // Mock data
      req.params = { id: 'shipmentId' };

      const mockShipment = {
        _id: 'shipmentId',
        shipmentNo: 'SP2505BR0001',
        status: 'in_transit',
      };

      // Setup mocks
      shipmentRepository.getShipmentById.mockResolvedValue(mockShipment);

      // Call the controller
      await shipmentController.getShipmentById(req, res, next);

      // Assertions
      expect(shipmentRepository.getShipmentById).toHaveBeenCalledWith('shipmentId', expect.any(Array));
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockShipment,
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle errors and call next with the error', async () => {
      // Mock data
      req.params = { id: 'nonExistentId' };

      // Setup mocks
      const error = new Error('Shipment not found');
      shipmentRepository.getShipmentById.mockRejectedValue(error);
      createApiError.mockReturnValue(error);

      // Call the controller
      await shipmentController.getShipmentById(req, res, next);

      // Assertions
      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('updateStatus', () => {
    it('should update shipment status', async () => {
      // Mock data
      req.params = { id: 'shipmentId' };
      req.body = {
        status: 'departed',
        notes: 'Departed from origin branch',
        location: {
          coordinates: [106.8456, -6.2088],
          address: 'Jakarta, Indonesia',
        },
      };

      const mockUpdatedShipment = {
        _id: 'shipmentId',
        shipmentNo: 'SP2505BR0001',
        status: 'departed',
        statusHistory: [
          {
            status: 'departed',
            timestamp: new Date(),
            notes: 'Departed from origin branch',
            location: {
              coordinates: [106.8456, -6.2088],
              address: 'Jakarta, Indonesia',
            },
            user: 'userId',
          },
        ],
      };

      // Setup mocks
      shipmentRepository.updateStatus.mockResolvedValue(mockUpdatedShipment);

      // Call the controller
      await shipmentController.updateStatus(req, res, next);

      // Assertions
      expect(shipmentRepository.updateStatus).toHaveBeenCalledWith(
        'shipmentId',
        'departed',
        'userId',
        {
          notes: 'Departed from origin branch',
          location: {
            coordinates: [106.8456, -6.2088],
            address: 'Jakarta, Indonesia',
          },
        }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockUpdatedShipment,
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle errors and call next with the error', async () => {
      // Mock data
      req.params = { id: 'shipmentId' };
      req.body = {
        status: 'invalid_status',
      };

      // Setup mocks
      const error = new Error('Invalid status');
      shipmentRepository.updateStatus.mockRejectedValue(error);
      createApiError.mockReturnValue(error);

      // Call the controller
      await shipmentController.updateStatus(req, res, next);

      // Assertions
      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('recordGpsLocation', () => {
    it('should record GPS location for a shipment', async () => {
      // Mock data
      req.params = { id: 'shipmentId' };
      req.body = {
        coordinates: [106.8456, -6.2088],
        speed: 60,
        heading: 90,
        accuracy: 10,
        address: 'Jakarta, Indonesia',
        provider: 'gps',
      };

      const mockUpdatedShipment = {
        _id: 'shipmentId',
        shipmentNo: 'SP2505BR0001',
        status: 'in_transit',
        tracking: [
          {
            timestamp: new Date(),
            coordinates: {
              type: 'Point',
              coordinates: [106.8456, -6.2088],
            },
            speed: 60,
            heading: 90,
            accuracy: 10,
            address: 'Jakarta, Indonesia',
            provider: 'gps',
          },
        ],
      };

      // Setup mocks
      shipmentRepository.recordGpsLocation.mockResolvedValue(mockUpdatedShipment);

      // Call the controller
      await shipmentController.recordGpsLocation(req, res, next);

      // Assertions
      expect(shipmentRepository.recordGpsLocation).toHaveBeenCalledWith(
        'shipmentId',
        {
          coordinates: [106.8456, -6.2088],
          speed: 60,
          heading: 90,
          accuracy: 10,
          address: 'Jakarta, Indonesia',
          provider: 'gps',
        },
        'userId'
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockUpdatedShipment,
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle errors and call next with the error', async () => {
      // Mock data
      req.params = { id: 'shipmentId' };
      req.body = {
        // Missing coordinates
      };

      // Setup mocks
      const error = new Error('Missing coordinates');
      shipmentRepository.recordGpsLocation.mockRejectedValue(error);
      createApiError.mockReturnValue(error);

      // Call the controller
      await shipmentController.recordGpsLocation(req, res, next);

      // Assertions
      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  // Additional tests for other controller functions would follow the same pattern
});
