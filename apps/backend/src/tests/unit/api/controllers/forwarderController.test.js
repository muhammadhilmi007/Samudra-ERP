/**
 * Samudra Paket ERP - Forwarder Controller Unit Tests
 */

// eslint-disable-next-line import/no-extraneous-dependencies
const { ObjectId } = require('mongodb');
const forwarderController = require('../../../../api/controllers/forwarderController');
const ForwarderService = require('../../../../app/services/forwarderService');

// Mock the ForwarderService
jest.mock('../../../../app/services/forwarderService');

// Mock repositories
jest.mock('../../../../infrastructure/repositories/mongoForwarderPartnerRepository');
jest.mock('../../../../infrastructure/repositories/mongoForwarderAreaRepository');
jest.mock('../../../../infrastructure/repositories/mongoForwarderRateRepository');

describe('Forwarder Controller', () => {
  let req;
  let res;
  let mockForwarderService;

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
    mockForwarderService = {
      getAllForwarderPartners: jest.fn(),
      getForwarderPartnerById: jest.fn(),
      createForwarderPartner: jest.fn(),
      updateForwarderPartner: jest.fn(),
      deleteForwarderPartner: jest.fn(),
      updateForwarderPartnerStatus: jest.fn(),
      getAllForwarderAreas: jest.fn(),
      getForwarderAreaById: jest.fn(),
      createForwarderArea: jest.fn(),
      updateForwarderArea: jest.fn(),
      deleteForwarderArea: jest.fn(),
      getAllForwarderRates: jest.fn(),
      getForwarderRateById: jest.fn(),
      findForwarderRatesForRoute: jest.fn(),
      createForwarderRate: jest.fn(),
      updateForwarderRate: jest.fn(),
      deleteForwarderRate: jest.fn(),
      testForwarderIntegration: jest.fn(),
    };

    // Mock the ForwarderService implementation
    ForwarderService.mockImplementation(() => mockForwarderService);
  });

  describe('getAllForwarderPartners', () => {
    it('should get all forwarder partners with pagination', async () => {
      // Arrange
      const mockPartners = [
        { _id: new ObjectId(), code: 'JNE', name: 'JNE Express' },
        { _id: new ObjectId(), code: 'TIKI', name: 'TIKI' },
      ];

      const mockPagination = {
        page: 1,
        limit: 10,
        totalItems: 2,
        totalPages: 1,
      };

      req.query = { page: '1', limit: '10' };

      mockForwarderService.getAllForwarderPartners.mockResolvedValue({
        data: mockPartners,
        meta: { pagination: mockPagination },
      });

      // Act
      await forwarderController.getAllForwarderPartners(req, res);

      // Assert
      expect(mockForwarderService.getAllForwarderPartners).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        status: undefined,
        search: undefined,
      });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockPartners,
        meta: { pagination: mockPagination },
      });
    });

    it('should handle errors when getting forwarder partners', async () => {
      // Arrange
      const mockError = new Error('Database error');
      mockForwarderService.getAllForwarderPartners.mockRejectedValue(mockError);

      // Act
      await forwarderController.getAllForwarderPartners(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Terjadi kesalahan saat mengambil data forwarder',
          details: expect.any(String),
        },
      });
    });
  });

  describe('getForwarderPartnerById', () => {
    it('should get a forwarder partner by ID', async () => {
      // Arrange
      const partnerId = new ObjectId();
      const mockPartner = {
        _id: partnerId,
        code: 'JNE',
        name: 'JNE Express',
      };

      req.params = { id: partnerId.toString() };
      mockForwarderService.getForwarderPartnerById.mockResolvedValue(mockPartner);

      // Act
      await forwarderController.getForwarderPartnerById(req, res);

      // Assert
      expect(mockForwarderService.getForwarderPartnerById).toHaveBeenCalledWith(
        partnerId.toString(),
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockPartner,
      });
    });

    it('should return 404 when forwarder partner not found', async () => {
      // Arrange
      const nonExistentId = new ObjectId();
      req.params = { id: nonExistentId.toString() };
      mockForwarderService.getForwarderPartnerById.mockResolvedValue(null);

      // Act
      await forwarderController.getForwarderPartnerById(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Forwarder tidak ditemukan',
        },
      });
    });
  });

  describe('createForwarderPartner', () => {
    it('should create a forwarder partner successfully', async () => {
      // Arrange
      const partnerData = {
        code: 'JNE',
        name: 'JNE Express',
      };

      const createdPartner = {
        _id: new ObjectId(),
        ...partnerData,
      };

      req.body = partnerData;
      mockForwarderService.createForwarderPartner.mockResolvedValue(createdPartner);

      // Act
      await forwarderController.createForwarderPartner(req, res);

      // Assert
      expect(mockForwarderService.createForwarderPartner).toHaveBeenCalledWith(partnerData);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: createdPartner,
      });
    });

    it('should return validation errors when creating invalid forwarder partner', async () => {
      // Arrange
      const partnerData = {
        // Missing required code
        name: 'JNE Express',
      };

      req.body = partnerData;
      mockForwarderService.createForwarderPartner.mockResolvedValue({
        success: false,
        errors: {
          code: 'Kode forwarder wajib diisi',
        },
      });

      // Act
      await forwarderController.createForwarderPartner(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Data forwarder tidak valid',
          details: {
            code: 'Kode forwarder wajib diisi',
          },
        },
      });
    });
  });

  describe('updateForwarderPartner', () => {
    it('should update a forwarder partner successfully', async () => {
      // Arrange
      const partnerId = new ObjectId();
      const partnerData = {
        name: 'JNE Express Updated',
      };

      const updatedPartner = {
        _id: partnerId,
        code: 'JNE',
        name: 'JNE Express Updated',
      };

      req.params = { id: partnerId.toString() };
      req.body = partnerData;
      mockForwarderService.updateForwarderPartner.mockResolvedValue({
        success: true,
        data: updatedPartner,
      });

      // Act
      await forwarderController.updateForwarderPartner(req, res);

      // Assert
      expect(mockForwarderService.updateForwarderPartner).toHaveBeenCalledWith(
        partnerId.toString(),
        partnerData,
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: updatedPartner,
      });
    });

    it('should return 404 when updating non-existent forwarder partner', async () => {
      // Arrange
      const nonExistentId = new ObjectId();
      const partnerData = {
        name: 'JNE Express Updated',
      };

      req.params = { id: nonExistentId.toString() };
      req.body = partnerData;
      mockForwarderService.updateForwarderPartner.mockResolvedValue(null);

      // Act
      await forwarderController.updateForwarderPartner(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Forwarder tidak ditemukan',
        },
      });
    });
  });

  describe('deleteForwarderPartner', () => {
    it('should delete a forwarder partner successfully', async () => {
      // Arrange
      const partnerId = new ObjectId();

      req.params = { id: partnerId.toString() };
      mockForwarderService.deleteForwarderPartner.mockResolvedValue({
        success: true,
        message: 'Forwarder berhasil dihapus',
      });

      // Act
      await forwarderController.deleteForwarderPartner(req, res);

      // Assert
      expect(mockForwarderService.deleteForwarderPartner).toHaveBeenCalledWith(
        partnerId.toString(),
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Forwarder berhasil dihapus',
      });
    });

    it('should return 404 when deleting non-existent forwarder partner', async () => {
      // Arrange
      const nonExistentId = new ObjectId();

      req.params = { id: nonExistentId.toString() };
      mockForwarderService.deleteForwarderPartner.mockResolvedValue(null);

      // Act
      await forwarderController.deleteForwarderPartner(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Forwarder tidak ditemukan',
        },
      });
    });
  });

  describe('updateForwarderPartnerStatus', () => {
    it('should update a forwarder partner status successfully', async () => {
      // Arrange
      const partnerId = new ObjectId();
      const statusData = { status: 'inactive' };

      const updatedPartner = {
        _id: partnerId,
        code: 'JNE',
        name: 'JNE Express',
        status: 'inactive',
      };

      req.params = { id: partnerId.toString() };
      req.body = statusData;
      mockForwarderService.updateForwarderPartnerStatus.mockResolvedValue({
        success: true,
        data: updatedPartner,
      });

      // Act
      await forwarderController.updateForwarderPartnerStatus(req, res);

      // Assert
      expect(mockForwarderService.updateForwarderPartnerStatus).toHaveBeenCalledWith(
        partnerId.toString(),
        'inactive',
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: updatedPartner,
        message: 'Status forwarder berhasil diubah menjadi inactive',
      });
    });

    it('should return 400 for invalid status', async () => {
      // Arrange
      const partnerId = new ObjectId();
      const statusData = { status: 'invalid-status' };

      req.params = { id: partnerId.toString() };
      req.body = statusData;

      // Act
      await forwarderController.updateForwarderPartnerStatus(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Status tidak valid. Status harus berupa active atau inactive',
        },
      });
    });
  });

  // Tests for Forwarder Area endpoints
  describe('getAllForwarderAreas', () => {
    it('should get all forwarder areas with pagination', async () => {
      // Arrange
      const mockAreas = [
        { _id: new ObjectId(), province: 'DKI Jakarta', city: 'Jakarta Barat' },
        { _id: new ObjectId(), province: 'DKI Jakarta', city: 'Jakarta Selatan' },
      ];

      const mockPagination = {
        page: 1,
        limit: 10,
        totalItems: 2,
        totalPages: 1,
      };

      req.query = { page: '1', limit: '10' };

      mockForwarderService.getAllForwarderAreas.mockResolvedValue({
        data: mockAreas,
        meta: { pagination: mockPagination },
      });

      // Act
      await forwarderController.getAllForwarderAreas(req, res);

      // Assert
      expect(mockForwarderService.getAllForwarderAreas).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        forwarderId: undefined,
        status: undefined,
        search: undefined,
      });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockAreas,
        meta: { pagination: mockPagination },
      });
    });
  });

  // Tests for Forwarder Rate endpoints
  describe('findForwarderRatesForRoute', () => {
    it('should find rates for a specific route', async () => {
      // Arrange
      const mockRates = [
        {
          _id: new ObjectId(),
          originArea: { province: 'DKI Jakarta', city: 'Jakarta Barat' },
          destinationArea: { province: 'Jawa Barat', city: 'Bandung' },
          rate: 15000,
        },
      ];

      req.query = {
        originProvinceId: 'DKI Jakarta',
        originCityId: 'Jakarta Barat',
        destinationProvinceId: 'Jawa Barat',
        destinationCityId: 'Bandung',
        weight: '1',
      };

      mockForwarderService.findForwarderRatesForRoute.mockResolvedValue(mockRates);

      // Act
      await forwarderController.findForwarderRatesForRoute(req, res);

      // Assert
      expect(mockForwarderService.findForwarderRatesForRoute).toHaveBeenCalledWith({
        originProvinceId: 'DKI Jakarta',
        originCityId: 'Jakarta Barat',
        originDistrictId: undefined,
        destinationProvinceId: 'Jawa Barat',
        destinationCityId: 'Bandung',
        destinationDistrictId: undefined,
        weight: 1,
        dimension: undefined,
      });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockRates,
      });
    });
  });

  describe('testForwarderIntegration', () => {
    it('should test integration with a forwarder API', async () => {
      // Arrange
      const partnerId = new ObjectId();
      const testData = { test: 'data' };

      req.params = { id: partnerId.toString() };
      req.body = { testData };

      const integrationResult = {
        success: true,
        message: 'Koneksi ke API forwarder berhasil',
        details: {
          baseUrl: 'https://api.jne.co.id/v1',
          authenticated: true,
          services: ['tracking', 'rates', 'shipment'],
        },
      };

      mockForwarderService.testForwarderIntegration.mockResolvedValue(integrationResult);

      // Act
      await forwarderController.testForwarderIntegration(req, res);

      // Assert
      expect(mockForwarderService.testForwarderIntegration).toHaveBeenCalledWith(
        partnerId.toString(),
        testData,
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: integrationResult,
      });
    });
  });
});
