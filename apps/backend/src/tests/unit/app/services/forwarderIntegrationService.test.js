/**
 * Samudra Paket ERP - Forwarder Integration Service Unit Tests
 */

const axios = require('axios');
const ForwarderIntegrationService = require('../../../../app/services/forwarderIntegrationService');

// Mock axios
jest.mock('axios');

describe('Forwarder Integration Service', () => {
  let forwarderIntegrationService;
  let mockForwarderPartnerRepository;
  let mockForwarder;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create mock repository
    mockForwarderPartnerRepository = {
      findById: jest.fn(),
    };

    // Create mock forwarder
    mockForwarder = {
      _id: '60d21b4667d0d8992e610c85',
      name: 'JNE Express',
      code: 'JNE',
      apiConfig: {
        baseUrl: 'https://api.jne.co.id/v1',
        apiKey: 'test-api-key',
        username: 'test-username',
        passwordHash: 'test-password-hash',
        timeout: 30000,
      },
    };

    // Initialize service
    forwarderIntegrationService = new ForwarderIntegrationService({
      forwarderPartnerRepository: mockForwarderPartnerRepository,
    });
  });

  describe('testConnection', () => {
    it('should successfully test connection with forwarder API', async () => {
      // Arrange
      const forwarderId = '60d21b4667d0d8992e610c85';
      mockForwarderPartnerRepository.findById.mockResolvedValue(mockForwarder);

      const mockResponse = {
        data: { status: 'ok' },
        headers: {
          'x-response-time': '120ms',
          server: 'JNE API Server',
        },
      };

      axios.create.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockResponse),
      });

      // Act
      const result = await forwarderIntegrationService.testConnection(forwarderId);

      // Assert
      expect(mockForwarderPartnerRepository.findById).toHaveBeenCalledWith(forwarderId);
      expect(axios.create).toHaveBeenCalledWith({
        baseURL: mockForwarder.apiConfig.baseUrl,
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-API-Key': mockForwarder.apiConfig.apiKey,
        }),
      });
      expect(result).toEqual({
        success: true,
        data: {
          status: 'connected',
          responseTime: '120ms',
          serverInfo: 'JNE API Server',
          message: 'Koneksi ke API forwarder berhasil',
        },
      });
    });

    it('should return error when forwarder not found', async () => {
      // Arrange
      const forwarderId = '60d21b4667d0d8992e610c85';
      mockForwarderPartnerRepository.findById.mockResolvedValue(null);

      // Act
      const result = await forwarderIntegrationService.testConnection(forwarderId);

      // Assert
      expect(mockForwarderPartnerRepository.findById).toHaveBeenCalledWith(forwarderId);
      expect(result).toEqual({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Forwarder tidak ditemukan',
        },
      });
    });

    it('should return error when API config is incomplete', async () => {
      // Arrange
      const forwarderId = '60d21b4667d0d8992e610c85';
      const forwarderWithoutApiConfig = { ...mockForwarder, apiConfig: {} };
      mockForwarderPartnerRepository.findById.mockResolvedValue(forwarderWithoutApiConfig);

      // Act
      const result = await forwarderIntegrationService.testConnection(forwarderId);

      // Assert
      expect(mockForwarderPartnerRepository.findById).toHaveBeenCalledWith(forwarderId);
      expect(result).toEqual({
        success: false,
        error: {
          code: 'INVALID_CONFIG',
          message: 'Konfigurasi API forwarder tidak lengkap',
        },
      });
    });

    it('should return error when connection fails', async () => {
      // Arrange
      const forwarderId = '60d21b4667d0d8992e610c85';
      mockForwarderPartnerRepository.findById.mockResolvedValue(mockForwarder);

      const mockError = new Error('Connection timeout');
      axios.create.mockReturnValue({
        get: jest.fn().mockRejectedValue(mockError),
      });

      // Act
      const result = await forwarderIntegrationService.testConnection(forwarderId);

      // Assert
      expect(mockForwarderPartnerRepository.findById).toHaveBeenCalledWith(forwarderId);
      expect(result).toEqual({
        success: false,
        error: {
          code: 'CONNECTION_ERROR',
          message: 'Gagal terhubung ke API forwarder',
          details: mockError.message,
        },
      });
    });
  });

  describe('getShippingRates', () => {
    it('should successfully get shipping rates from forwarder API', async () => {
      // Arrange
      const forwarderId = '60d21b4667d0d8992e610c85';
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

      mockForwarderPartnerRepository.findById.mockResolvedValue(mockForwarder);

      const mockResponse = {
        data: {
          services: [
            {
              code: 'YES',
              name: 'Yakin Esok Sampai',
              description: 'Pengiriman cepat, estimasi 1 hari',
              price: 50000,
              etd_from: 1,
              etd_to: 1,
            },
            {
              code: 'REG',
              name: 'Reguler',
              description: 'Pengiriman reguler, estimasi 2-3 hari',
              price: 25000,
              etd_from: 2,
              etd_to: 3,
            },
          ],
        },
      };

      axios.create.mockReturnValue({
        post: jest.fn().mockResolvedValue(mockResponse),
      });

      // Act
      const result = await forwarderIntegrationService.getShippingRates(forwarderId, shipmentData);

      // Assert
      expect(mockForwarderPartnerRepository.findById).toHaveBeenCalledWith(forwarderId);
      expect(result).toEqual({
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
      });
    });

    it('should return error when forwarder not found', async () => {
      // Arrange
      const forwarderId = '60d21b4667d0d8992e610c85';
      const shipmentData = {};
      mockForwarderPartnerRepository.findById.mockResolvedValue(null);

      // Act
      const result = await forwarderIntegrationService.getShippingRates(forwarderId, shipmentData);

      // Assert
      expect(mockForwarderPartnerRepository.findById).toHaveBeenCalledWith(forwarderId);
      expect(result).toEqual({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Forwarder tidak ditemukan',
        },
      });
    });

    it('should return error when API call fails', async () => {
      // Arrange
      const forwarderId = '60d21b4667d0d8992e610c85';
      const shipmentData = {};
      mockForwarderPartnerRepository.findById.mockResolvedValue(mockForwarder);

      const mockError = new Error('API Error');
      axios.create.mockReturnValue({
        post: jest.fn().mockRejectedValue(mockError),
      });

      // Act
      const result = await forwarderIntegrationService.getShippingRates(forwarderId, shipmentData);

      // Assert
      expect(mockForwarderPartnerRepository.findById).toHaveBeenCalledWith(forwarderId);
      expect(result).toEqual({
        success: false,
        error: {
          code: 'API_ERROR',
          message: 'Gagal mendapatkan tarif dari API forwarder',
          details: mockError.message,
        },
      });
    });
  });

  describe('createShipment', () => {
    it('should successfully create shipment with forwarder API', async () => {
      // Arrange
      const forwarderId = '60d21b4667d0d8992e610c85';
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

      mockForwarderPartnerRepository.findById.mockResolvedValue(mockForwarder);

      const mockResponse = {
        data: {
          tracking_number: 'JNE123456789',
          reference: 'ORDER-123',
          status: 'created',
          label_url: 'https://api.jne.co.id/labels/JNE123456789.pdf',
          estimated_delivery: '2025-05-07',
          total: 50000,
        },
      };

      axios.create.mockReturnValue({
        post: jest.fn().mockResolvedValue(mockResponse),
      });

      // Act
      const result = await forwarderIntegrationService.createShipment(forwarderId, shipmentData);

      // Assert
      expect(mockForwarderPartnerRepository.findById).toHaveBeenCalledWith(forwarderId);
      expect(result).toEqual({
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
      });
    });
  });

  describe('trackShipment', () => {
    it('should successfully track shipment with forwarder API', async () => {
      // Arrange
      const forwarderId = '60d21b4667d0d8992e610c85';
      const trackingNumber = 'JNE123456789';
      
      mockForwarderPartnerRepository.findById.mockResolvedValue(mockForwarder);

      const mockResponse = {
        data: {
          tracking_number: 'JNE123456789',
          status: 'in_transit',
          estimated_delivery: '2025-05-07',
          history: [
            {
              timestamp: '2025-05-05T10:00:00Z',
              status: 'created',
              description: 'Shipment created',
              location: 'Jakarta',
            },
            {
              timestamp: '2025-05-05T14:30:00Z',
              status: 'in_transit',
              description: 'Shipment in transit',
              location: 'Jakarta Gateway',
            },
          ],
        },
      };

      axios.create.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockResponse),
      });

      // Act
      const result = await forwarderIntegrationService.trackShipment(forwarderId, trackingNumber);

      // Assert
      expect(mockForwarderPartnerRepository.findById).toHaveBeenCalledWith(forwarderId);
      expect(result).toEqual({
        success: true,
        data: {
          trackingNumber: 'JNE123456789',
          status: 'in_transit',
          estimatedDelivery: '2025-05-07',
          history: [
            {
              timestamp: expect.any(Date),
              status: 'created',
              description: 'Shipment created',
              location: 'Jakarta',
            },
            {
              timestamp: expect.any(Date),
              status: 'in_transit',
              description: 'Shipment in transit',
              location: 'Jakarta Gateway',
            },
          ],
        },
      });
    });
  });
});
