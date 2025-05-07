/**
 * Samudra Paket ERP - Forwarder Management Service Unit Tests
 */

const ForwarderPartner = require('../../../../domain/models/forwarderPartner');
const ForwarderArea = require('../../../../domain/models/forwarderArea');
const ForwarderRate = require('../../../../domain/models/forwarderRate');
const ForwarderService = require('../../../../app/services/forwarderService');

describe('Forwarder Management Service', () => {
  let forwarderService;
  let mockForwarderPartnerRepository;
  let mockForwarderAreaRepository;
  let mockForwarderRateRepository;

  beforeEach(() => {
    // Create mock repositories
    mockForwarderPartnerRepository = {
      findAll: jest.fn(),
      count: jest.fn(),
      findById: jest.fn(),
      findByCode: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      updateStatus: jest.fn(),
    };

    mockForwarderAreaRepository = {
      findAll: jest.fn(),
      count: jest.fn(),
      findById: jest.fn(),
      findByForwarder: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteByForwarder: jest.fn(),
    };

    mockForwarderRateRepository = {
      findAll: jest.fn(),
      count: jest.fn(),
      findById: jest.fn(),
      findByForwarder: jest.fn(),
      findRatesForRoute: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteByForwarder: jest.fn(),
    };

    // Initialize service with mock repositories
    forwarderService = new ForwarderService({
      forwarderPartnerRepository: mockForwarderPartnerRepository,
      forwarderAreaRepository: mockForwarderAreaRepository,
      forwarderRateRepository: mockForwarderRateRepository,
    });
  });

  describe('Forwarder Partner Management', () => {
    it('should get all forwarder partners with pagination', async () => {
      // Arrange
      const mockPartners = [
        new ForwarderPartner({
          _id: '60d21b4667d0d8992e610c85',
          name: 'JNE Express',
          code: 'JNE',
        }),
        new ForwarderPartner({
          _id: '60d21b4667d0d8992e610c86',
          name: 'TIKI',
          code: 'TIKI',
        }),
      ];

      const filter = {};
      const options = { skip: 0, limit: 10, sort: { name: 1 } };
      const total = 2;

      mockForwarderPartnerRepository.findAll.mockResolvedValue(mockPartners);
      mockForwarderPartnerRepository.count.mockResolvedValue(total);

      // Act
      const result = await forwarderService.getAllForwarderPartners({
        page: 1,
        limit: 10,
      });

      // Assert
      expect(mockForwarderPartnerRepository.findAll).toHaveBeenCalledWith(filter, options);
      expect(mockForwarderPartnerRepository.count).toHaveBeenCalledWith(filter);
      expect(result).toEqual({
        items: mockPartners,
        pagination: {
          page: 1,
          limit: 10,
          totalItems: total,
          totalPages: 1,
        },
      });
    });

    it('should create a new forwarder partner', async () => {
      // Arrange
      const forwarderData = {
        name: 'JNE Express',
        code: 'JNE',
        contactPerson: 'John Doe',
        phone: '08123456789',
        email: 'contact@jne.co.id',
        address: {
          street: 'Jl. Tomang Raya No. 11',
          city: 'Jakarta Barat',
          district: 'Grogol Petamburan',
          province: 'DKI Jakarta',
          postalCode: '11440',
          country: 'Indonesia',
        },
        status: 'active',
        apiConfig: {
          baseUrl: 'https://api.jne.co.id/v1',
          apiKey: 'test-api-key',
          username: 'test-username',
          passwordHash: 'test-password-hash',
          timeout: 30000,
        },
      };

      const userId = '60d21b4667d0d8992e610c87';

      mockForwarderPartnerRepository.findByCode.mockResolvedValue(null);
      mockForwarderPartnerRepository.create.mockImplementation((partner) => Promise.resolve({
        ...partner,
        _id: '60d21b4667d0d8992e610c85',
      }));

      // Act
      const result = await forwarderService.createForwarderPartner(forwarderData, userId);

      // Assert
      expect(mockForwarderPartnerRepository.findByCode).toHaveBeenCalledWith(forwarderData.code);
      expect(mockForwarderPartnerRepository.create).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.data._id).toBe('60d21b4667d0d8992e610c85');
      expect(result.data.name).toBe(forwarderData.name);
      expect(result.data.code).toBe(forwarderData.code);
    });

    it('should not create a forwarder partner with duplicate code', async () => {
      // Arrange
      const forwarderData = {
        name: 'JNE Express',
        code: 'JNE',
        contactPerson: 'John Doe',
        phone: '08123456789',
        email: 'contact@jne.co.id',
      };

      const userId = '60d21b4667d0d8992e610c87';
      const existingPartner = new ForwarderPartner({
        _id: '60d21b4667d0d8992e610c85',
        name: 'JNE Express',
        code: 'JNE',
      });

      mockForwarderPartnerRepository.findByCode.mockResolvedValue(existingPartner);

      // Act
      const result = await forwarderService.createForwarderPartner(forwarderData, userId);

      // Assert
      expect(mockForwarderPartnerRepository.findByCode).toHaveBeenCalledWith(forwarderData.code);
      expect(mockForwarderPartnerRepository.create).not.toHaveBeenCalled();
      expect(result.success).toBe(false);
      expect(result.errors).toHaveProperty('code', 'Kode forwarder sudah digunakan');
    });
  });

  describe('Forwarder Area Management', () => {
    it('should get all areas for a forwarder partner', async () => {
      // Arrange
      const forwarderId = '60d21b4667d0d8992e610c85';
      const mockAreas = [
        new ForwarderArea({
          _id: '60d21b4667d0d8992e610c88',
          forwarder: forwarderId,
          province: 'DKI Jakarta',
          city: 'Jakarta Barat',
          district: 'Grogol Petamburan',
          postalCode: '11440',
          status: 'active',
        }),
        new ForwarderArea({
          _id: '60d21b4667d0d8992e610c89',
          forwarder: forwarderId,
          province: 'DKI Jakarta',
          city: 'Jakarta Timur',
          district: 'Jatinegara',
          postalCode: '13310',
          status: 'active',
        }),
      ];

      const filter = { forwarder: forwarderId };
      const options = { skip: 0, limit: 10, sort: { city: 1, province: 1 } };
      const total = 2;

      mockForwarderAreaRepository.findAll.mockResolvedValue(mockAreas);
      mockForwarderAreaRepository.count.mockResolvedValue(total);

      // Act
      const result = await forwarderService.getForwarderAreas(forwarderId, {
        page: 1,
        limit: 10,
      });

      // Assert
      expect(mockForwarderAreaRepository.findAll).toHaveBeenCalledWith(filter, options);
      expect(mockForwarderAreaRepository.count).toHaveBeenCalledWith(filter);
      expect(result).toEqual({
        items: mockAreas,
        pagination: {
          page: 1,
          limit: 10,
          totalItems: total,
          totalPages: 1,
        },
      });
    });
  });

  describe('Forwarder Rate Management', () => {
    it('should find rates for a specific route', async () => {
      // Arrange
      const forwarderId = '60d21b4667d0d8992e610c85';
      const originProvince = 'DKI Jakarta';
      const originCity = 'Jakarta Barat';
      const destinationProvince = 'Jawa Barat';
      const destinationCity = 'Bandung';

      const mockRates = [
        new ForwarderRate({
          _id: '60d21b4667d0d8992e610c90',
          forwarder: forwarderId,
          originArea: {
            province: originProvince,
            city: originCity,
          },
          destinationArea: {
            province: destinationProvince,
            city: destinationCity,
          },
          rate: 25000,
          minWeight: 1,
          status: 'active',
        }),
      ];

      mockForwarderRateRepository.findRatesForRoute.mockResolvedValue(mockRates);

      // Act
      const result = await forwarderService.findRatesForRoute(
        forwarderId,
        originProvince,
        originCity,
        destinationProvince,
        destinationCity
      );

      // Assert
      expect(mockForwarderRateRepository.findRatesForRoute).toHaveBeenCalledWith(
        forwarderId,
        originProvince,
        originCity,
        destinationProvince,
        destinationCity
      );
      expect(result).toEqual(mockRates);
    });
  });
});
