/**
 * Samudra Paket ERP - Forwarder Integration Controller Unit Tests
 */

const { ObjectId } = require('mongodb');

// Mock the dependencies before requiring the controller
jest.mock('../../../../app/services/forwarderService');
jest.mock('../../../../app/services/forwarderIntegrationService');
jest.mock('../../../../infrastructure/repositories/mongoForwarderPartnerRepository');
jest.mock('../../../../infrastructure/repositories/mongoForwarderAreaRepository');
jest.mock('../../../../infrastructure/repositories/mongoForwarderRateRepository');

// Now require the controller after mocking its dependencies
const forwarderController = require('../../../../api/controllers/forwarderController');
const ForwarderIntegrationService = require('../../../../app/services/forwarderIntegrationService');

describe('Forwarder Integration Controller', () => {
  let req;
  let res;
  let mockForwarderIntegrationService;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock request and response
    req = {
      body: {},
      params: {},
      query: {},
      user: {
        id: new ObjectId().toString(),
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Create mock service methods
    mockForwarderIntegrationService = {
      testConnection: jest.fn(),
      getShippingRates: jest.fn(),
      createShipment: jest.fn(),
      trackShipment: jest.fn(),
    };

    // Mock the ForwarderIntegrationService implementation
    ForwarderIntegrationService.mockImplementation(() => mockForwarderIntegrationService);
  });

  describe('testForwarderIntegration', () => {
    it('should test integration with forwarder API successfully', async () => {
      // Arrange
      const forwarderId = new ObjectId().toString();
      req.params = { forwarderId };

      const mockResult = {
        success: true,
        message: 'Koneksi ke API forwarder berhasil',
        details: {
          status: 'connected',
          responseTime: '120ms',
          serverInfo: 'JNE API Server'
        },
      };

      mockForwarderIntegrationService.testConnection.mockResolvedValue(mockResult);

      // Act
      await forwarderController.testForwarderIntegration(req, res);

      // Assert
      expect(mockForwarderIntegrationService.testConnection).toHaveBeenCalledWith(forwarderId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: mockResult.success,
        message: mockResult.message,
        data: mockResult.details,
      });
    });

    it('should handle error when testing integration fails', async () => {
      // Arrange
      const forwarderId = new ObjectId().toString();
      req.params = { forwarderId };

      const mockError = {
        success: false,
        error: {
          code: 'CONNECTION_ERROR',
          message: 'Gagal terhubung ke API forwarder',
          details: 'Connection timeout',
        },
      };

      mockForwarderIntegrationService.testConnection.mockResolvedValue(mockError);

      // Act
      await forwarderController.testForwarderIntegration(req, res);

      // Assert
      expect(mockForwarderIntegrationService.testConnection).toHaveBeenCalledWith(forwarderId);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: mockError.error,
      });
    });
  });

  describe('getForwarderShippingRates', () => {
    it('should get shipping rates from forwarder API successfully', async () => {
      // Arrange
      const forwarderId = new ObjectId().toString();
      const shipmentData = {
        sender: {
          name: 'PT Samudra Paket',
          phone: '08123456789',
          address: {
            street: 'Jl. Raya Bogor KM 30',
            city: 'Jakarta Timur',
            province: 'DKI Jakarta',
            postalCode: '13710',
          },
        },
        recipient: {
          name: 'John Doe',
          phone: '08987654321',
          address: {
            street: 'Jl. Sudirman No. 123',
            city: 'Bandung',
            province: 'Jawa Barat',
            postalCode: '40111',
          },
        },
        packages: [
          {
            weight: 2.5,
            dimensions: {
              length: 30,
              width: 20,
              height: 10,
            },
            description: 'Pakaian',
            value: 500000,
          },
        ],
        serviceType: 'express',
      };

      req.params = { id: forwarderId };
      req.body = shipmentData;

      const mockResult = {
        success: true,
        data: {
          services: [
            {
              code: 'YES',
              name: 'Yakin Esok Sampai',
              description: 'Pengiriman cepat, estimasi 1 hari',
              rate: 50000,
              currency: 'IDR',
              estimatedDelivery: {
                min: 1,
                max: 1,
                unit: 'days',
              },
            },
            {
              code: 'REG',
              name: 'Reguler',
              description: 'Pengiriman reguler, estimasi 2-3 hari',
              rate: 25000,
              currency: 'IDR',
              estimatedDelivery: {
                min: 2,
                max: 3,
                unit: 'days',
              },
            },
          ],
        },
      };

      mockForwarderIntegrationService.getShippingRates.mockResolvedValue(mockResult);

      // Act
      await forwarderController.getForwarderShippingRates(req, res);

      // Assert
      expect(mockForwarderIntegrationService.getShippingRates).toHaveBeenCalledWith(forwarderId, shipmentData);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockResult.data,
      });
    });

    it('should handle error when getting shipping rates fails', async () => {
      // Arrange
      const forwarderId = new ObjectId().toString();
      const shipmentData = {};
      req.params = { id: forwarderId };
      req.body = shipmentData;

      const mockError = {
        success: false,
        error: {
          code: 'API_ERROR',
          message: 'Gagal mendapatkan tarif dari API forwarder',
          details: 'API Error',
        },
      };

      mockForwarderIntegrationService.getShippingRates.mockResolvedValue(mockError);

      // Act
      await forwarderController.getForwarderShippingRates(req, res);

      // Assert
      expect(mockForwarderIntegrationService.getShippingRates).toHaveBeenCalledWith(forwarderId, shipmentData);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: mockError.error,
      });
    });
  });

  describe('createForwarderShipment', () => {
    it('should create shipment with forwarder API successfully', async () => {
      // Arrange
      const forwarderId = new ObjectId().toString();
      const shipmentData = {
        sender: {
          name: 'PT Samudra Paket',
          phone: '08123456789',
          address: {
            street: 'Jl. Raya Bogor KM 30',
            city: 'Jakarta Timur',
            province: 'DKI Jakarta',
            postalCode: '13710',
          },
        },
        recipient: {
          name: 'John Doe',
          phone: '08987654321',
          address: {
            street: 'Jl. Sudirman No. 123',
            city: 'Bandung',
            province: 'Jawa Barat',
            postalCode: '40111',
          },
        },
        packages: [
          {
            weight: 2.5,
            dimensions: {
              length: 30,
              width: 20,
              height: 10,
            },
            description: 'Pakaian',
            value: 500000,
          },
        ],
        serviceType: 'express',
        reference: 'ORDER-123',
      };

      req.params = { id: forwarderId };
      req.body = shipmentData;

      const mockResult = {
        success: true,
        data: {
          trackingNumber: 'JNE123456789',
          referenceNumber: 'ORDER-123',
          status: 'created',
          label: 'https://api.jne.co.id/labels/JNE123456789.pdf',
          estimatedDelivery: '2025-05-07',
          price: {
            amount: 50000,
            currency: 'IDR',
          },
        },
      };

      mockForwarderIntegrationService.createShipment.mockResolvedValue(mockResult);

      // Act
      await forwarderController.createForwarderShipment(req, res);

      // Assert
      expect(mockForwarderIntegrationService.createShipment).toHaveBeenCalledWith(forwarderId, shipmentData);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockResult.data,
      });
    });
  });

  describe('trackForwarderShipment', () => {
    it('should track shipment with forwarder API successfully', async () => {
      // Arrange
      const forwarderId = new ObjectId().toString();
      const trackingNumber = 'JNE123456789';
      req.params = { id: forwarderId, trackingNumber };

      const mockResult = {
        success: true,
        data: {
          trackingNumber: 'JNE123456789',
          status: 'in_transit',
          estimatedDelivery: '2025-05-07',
          history: [
            {
              timestamp: new Date('2025-05-05T10:00:00Z'),
              status: 'created',
              description: 'Shipment created',
              location: 'Jakarta',
            },
            {
              timestamp: new Date('2025-05-05T14:30:00Z'),
              status: 'in_transit',
              description: 'Shipment in transit',
              location: 'Jakarta Gateway',
            },
          ],
        },
      };

      mockForwarderIntegrationService.trackShipment.mockResolvedValue(mockResult);

      // Act
      await forwarderController.trackForwarderShipment(req, res);

      // Assert
      expect(mockForwarderIntegrationService.trackShipment).toHaveBeenCalledWith(forwarderId, trackingNumber);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockResult.data,
      });
    });
  });
});
