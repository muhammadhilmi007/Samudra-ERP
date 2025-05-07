/**
 * Samudra Paket ERP - Forwarder Service Unit Tests
 */

const { ObjectId } = require('mongodb');
const ForwarderService = require('../../../../app/services/forwarderService');
const ForwarderPartner = require('../../../../domain/models/forwarderPartner');
const ForwarderArea = require('../../../../domain/models/forwarderArea');
const ForwarderRate = require('../../../../domain/models/forwarderRate');

// Mock repositories
const mockPartnerRepo = {
  findAll: jest.fn(),
  count: jest.fn(),
  findById: jest.fn(),
  findByCode: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  updateStatus: jest.fn(),
};

const mockAreaRepo = {
  findByForwarder: jest.fn(),
  create: jest.fn(),
  deleteByForwarder: jest.fn(),
  findAll: jest.fn(),
  count: jest.fn(),
  findById: jest.fn(),
  findByLocation: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  updateStatus: jest.fn(),
};

const mockRateRepo = {
  findByForwarder: jest.fn(),
  findRatesForRoute: jest.fn(),
  deleteByForwarder: jest.fn(),
  findAll: jest.fn(),
  count: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  updateStatus: jest.fn(),
};

let forwarderService;

const mockToObject = jest.fn().mockImplementation(function() {
  return { ...this };
});

beforeEach(() => {
  jest.clearAllMocks();
  mockToObject.mockClear();
  forwarderService = new ForwarderService({
    forwarderPartnerRepository: mockPartnerRepo,
    forwarderAreaRepository: mockAreaRepo,
    forwarderRateRepository: mockRateRepo,
  });
});

describe('ForwarderService', () => {
  describe('getAllForwarderPartners', () => {
    it('should return paginated forwarder partners', async () => {
      // Arrange
      const partners = [
        new ForwarderPartner({ code: 'JNE', name: 'JNE Express' }),
        new ForwarderPartner({ code: 'TIKI', name: 'TIKI' }),
      ];

      mockPartnerRepo.findAll.mockResolvedValue(partners);
      mockPartnerRepo.count.mockResolvedValue(2);

      // Act
      const result = await forwarderService.getAllForwarderPartners({
        page: 1,
        limit: 10,
      });

      // Assert
      expect(result.items).toEqual(partners);
      expect(result.pagination.totalItems).toBe(2);
      expect(mockPartnerRepo.findAll).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({ skip: 0, limit: 10 })
      );
    });

    it('should apply filters correctly', async () => {
      // Arrange
      const partners = [
        new ForwarderPartner({ code: 'JNE', name: 'JNE Express', status: 'active' }),
      ];

      mockPartnerRepo.findAll.mockResolvedValue(partners);
      mockPartnerRepo.count.mockResolvedValue(1);

      // Act
      const result = await forwarderService.getAllForwarderPartners({
        page: 1,
        limit: 10,
        status: 'active',
        search: 'JNE',
      });

      // Assert
      expect(result.items).toEqual(partners);
      expect(result.pagination.totalItems).toBe(1);
      expect(mockPartnerRepo.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'active',
          $or: expect.any(Array),
        }),
        expect.any(Object)
      );
    });
  });

  describe('getForwarderPartnerById', () => {
    it('should return a forwarder partner by ID', async () => {
      // Arrange
      const partnerId = new ObjectId();
      const partner = new ForwarderPartner({
        _id: partnerId,
        code: 'JNE',
        name: 'JNE Express',
      });

      mockPartnerRepo.findById.mockResolvedValue(partner);

      // Act
      const result = await forwarderService.getForwarderPartnerById(partnerId);

      // Assert
      expect(result).toEqual(partner);
      expect(mockPartnerRepo.findById).toHaveBeenCalledWith(partnerId);
    });

    it('should return null for non-existent ID', async () => {
      // Arrange
      const nonExistentId = new ObjectId();
      mockPartnerRepo.findById.mockResolvedValue(null);

      // Act
      const result = await forwarderService.getForwarderPartnerById(nonExistentId);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('createForwarderPartner', () => {
    it('should create a forwarder partner successfully', async () => {
      // Arrange
      const userId = new ObjectId();
      const partnerData = {
        code: 'JNE',
        name: 'JNE Express',
      };
    
      // Create a mock instance with toObject method
      const createdPartner = new ForwarderPartner({
        ...partnerData,
        _id: new ObjectId(),
        createdBy: userId
      });
      
      // Add toObject method to the instance
      createdPartner.toObject = function() {
        return { ...this };
      };
    
      // Mock the required functions
      mockPartnerRepo.findByCode.mockResolvedValue(null);
      mockPartnerRepo.create.mockResolvedValue(createdPartner);
      
      // Mock validate method to return success
      jest.spyOn(ForwarderPartner.prototype, 'validate').mockReturnValue({ isValid: true });
    
      // Act
      const result = await forwarderService.createForwarderPartner(partnerData, userId);
    
      // Assert
      expect(result.success).toBe(true);
      expect(result.data.toObject()).toMatchObject(partnerData);
      expect(mockPartnerRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          ...partnerData,
          createdBy: userId
        })
      );
    });

    it('should return error if code already exists', async () => {
      // Arrange
      const userId = new ObjectId();
      const partnerData = {
        code: 'JNE',
        name: 'JNE Express',
      };

      const existingPartner = new ForwarderPartner({
        code: 'JNE',
        name: 'Existing JNE',
        _id: new ObjectId(),
      });

      mockPartnerRepo.findByCode.mockResolvedValue(existingPartner);

      // Act
      const result = await forwarderService.createForwarderPartner(partnerData, userId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.errors).toHaveProperty('code');
      expect(mockPartnerRepo.create).not.toHaveBeenCalled();
    });

    it('should return validation errors for invalid data', async () => {
      // Arrange
      const userId = new ObjectId();
      const partnerData = {
        // Missing required code
        name: 'JNE Express',
      };

      mockPartnerRepo.findByCode.mockResolvedValue(null);
      
      // Mock validate to return validation errors
      jest.spyOn(ForwarderPartner.prototype, 'validate').mockReturnValue({ 
        isValid: false, 
        errors: { code: 'Kode forwarder wajib diisi' } 
      });

      // Act
      const result = await forwarderService.createForwarderPartner(partnerData, userId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.errors).toHaveProperty('code');
      expect(mockPartnerRepo.create).not.toHaveBeenCalled();
    });
  });

  describe('updateForwarderPartner', () => {
    it('should update a forwarder partner successfully', async () => {
      // Arrange
      const userId = new ObjectId();
      const partnerId = new ObjectId();
      const partnerData = {
        name: 'JNE Express Updated',
        contact: '021-87654321',
      };

      const existingPartner = new ForwarderPartner({
        _id: partnerId,
        code: 'JNE',
        name: 'JNE Express',
        contact: '021-12345678',
        status: 'active', // Add required fields
      });

      const updatedPartner = new ForwarderPartner({
        ...existingPartner,
        ...partnerData,
      });
      
      // Add toObject method to updated partner
      updatedPartner.toObject = function() {
        return { ...this };
      };

      mockPartnerRepo.findById.mockResolvedValue(existingPartner);
      mockPartnerRepo.update.mockResolvedValue(updatedPartner);
      
      // Mock validate to return success
      jest.spyOn(ForwarderPartner.prototype, 'validate').mockReturnValue({ isValid: true });

      // Act
      const result = await forwarderService.updateForwarderPartner(partnerId, partnerData, userId);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data.toObject().name).toBe('JNE Express Updated');
      expect(mockPartnerRepo.update).toHaveBeenCalledWith(
        partnerId,
        expect.objectContaining({
          ...partnerData,
          updatedBy: userId,
        })
      );
    });

    it('should return error if partner not found', async () => {
      // Arrange
      const nonExistentId = new ObjectId();
      const userId = new ObjectId();
      const partnerData = {
        name: 'JNE Express Updated',
      };

      mockPartnerRepo.findById.mockResolvedValue(null);

      // Act
      const result = await forwarderService.updateForwarderPartner(
        nonExistentId,
        partnerData,
        userId
      );

      // Assert
      expect(result.success).toBe(false);
      expect(result.errors).toHaveProperty('_id');
      expect(mockPartnerRepo.update).not.toHaveBeenCalled();
    });

    it('should return error if trying to use existing code', async () => {
      // Arrange
      const partnerId = new ObjectId();
      const userId = new ObjectId();
      const partnerData = {
        code: 'TIKI', // Trying to change code to an existing one
      };

      const existingPartner = new ForwarderPartner({
        _id: partnerId,
        code: 'JNE',
        name: 'JNE Express',
      });

      const conflictingPartner = new ForwarderPartner({
        _id: new ObjectId(),
        code: 'TIKI',
        name: 'TIKI',
      });

      mockPartnerRepo.findById.mockResolvedValue(existingPartner);
      mockPartnerRepo.findByCode.mockResolvedValue(conflictingPartner);

      // Act
      const result = await forwarderService.updateForwarderPartner(partnerId, partnerData, userId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.errors).toHaveProperty('code');
      expect(mockPartnerRepo.update).not.toHaveBeenCalled();
    });
  });

  describe('deleteForwarderPartner', () => {
    it('should delete a forwarder partner and its related data', async () => {
      // Arrange
      const partnerId = new ObjectId();

      mockPartnerRepo.findById.mockResolvedValue(new ForwarderPartner({ _id: partnerId }));
      mockAreaRepo.deleteByForwarder.mockResolvedValue(2);
      mockRateRepo.deleteByForwarder.mockResolvedValue(3);
      mockPartnerRepo.delete.mockResolvedValue(true);

      // Act
      const result = await forwarderService.deleteForwarderPartner(partnerId);

      // Assert
      expect(result.success).toBe(true);
      expect(mockAreaRepo.deleteByForwarder).toHaveBeenCalledWith(partnerId);
      expect(mockRateRepo.deleteByForwarder).toHaveBeenCalledWith(partnerId);
      expect(mockPartnerRepo.delete).toHaveBeenCalledWith(partnerId);
    });

    it('should return error if partner not found', async () => {
      // Arrange
      const nonExistentId = new ObjectId();

      mockPartnerRepo.findById.mockResolvedValue(null);

      // Act
      const result = await forwarderService.deleteForwarderPartner(nonExistentId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.errors).toHaveProperty('_id');
      expect(mockAreaRepo.deleteByForwarder).not.toHaveBeenCalled();
      expect(mockRateRepo.deleteByForwarder).not.toHaveBeenCalled();
      expect(mockPartnerRepo.delete).not.toHaveBeenCalled();
    });
  });

  describe('updateForwarderPartnerStatus', () => {
    it('should update a forwarder partner status', async () => {
      // Arrange
      const partnerId = new ObjectId();
      const userId = new ObjectId();
      const status = 'inactive';

      const existingPartner = new ForwarderPartner({
        _id: partnerId,
        code: 'JNE',
        name: 'JNE Express',
        status: 'active',
      });

      const updatedPartner = new ForwarderPartner({
        ...existingPartner,
        status: 'inactive',
      });

      mockPartnerRepo.findById.mockResolvedValue(existingPartner);
      mockPartnerRepo.updateStatus.mockResolvedValue(updatedPartner);

      // Act
      const result = await forwarderService.updateForwarderPartnerStatus(partnerId, status, userId);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual(updatedPartner);
      expect(mockPartnerRepo.updateStatus).toHaveBeenCalledWith(partnerId, status, userId);
    });

    it('should return error for invalid status', async () => {
      // Arrange
      const partnerId = new ObjectId();
      const userId = new ObjectId();
      const status = 'invalid-status';

      // Act
      const result = await forwarderService.updateForwarderPartnerStatus(partnerId, status, userId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.errors).toHaveProperty('status');
      expect(mockPartnerRepo.updateStatus).not.toHaveBeenCalled();
    });

    it('should return error if partner not found', async () => {
      // Arrange
      const nonExistentId = new ObjectId();
      const userId = new ObjectId();
      const status = 'inactive';

      mockPartnerRepo.findById.mockResolvedValue(null);

      // Act
      const result = await forwarderService.updateForwarderPartnerStatus(
        nonExistentId,
        status,
        userId
      );

      // Assert
      expect(result.success).toBe(false);
      expect(result.errors).toHaveProperty('_id');
      expect(mockPartnerRepo.updateStatus).not.toHaveBeenCalled();
    });
  });

  // Tests for Forwarder Area methods
  describe('getForwarderAreas', () => {
    it('should return paginated forwarder areas for a forwarder', async () => {
      // Arrange
      const forwarderId = new ObjectId();
      const areas = [
        new ForwarderArea({ province: 'DKI Jakarta', city: 'Jakarta Barat' }),
        new ForwarderArea({ province: 'DKI Jakarta', city: 'Jakarta Selatan' }),
      ];

      mockAreaRepo.findByForwarder.mockResolvedValue(areas);
      mockAreaRepo.count.mockResolvedValue(2);

      // Act
      const result = await forwarderService.getForwarderAreas(forwarderId, {
        page: 1,
        limit: 10,
      });

      // Assert
      expect(result.items).toEqual(areas);
      expect(result.pagination.totalItems).toBe(2);
      expect(mockAreaRepo.findByForwarder).toHaveBeenCalledWith(
        forwarderId,
        expect.objectContaining({ skip: 0, limit: 10 })
      );
    });
  });

  describe('createForwarderArea', () => {
    it('should create a forwarder area successfully', async () => {
      // Arrange
      const forwarderId = new ObjectId();
      const userId = new ObjectId();
      const areaData = {
        forwarder: forwarderId.toString(),
        province: 'DKI Jakarta',
        city: 'Jakarta Barat',
        district: 'Grogol',
      };

      const createdArea = new ForwarderArea({
        ...areaData,
        _id: new ObjectId(),
      });

      mockPartnerRepo.findById.mockResolvedValue(new ForwarderPartner({ _id: forwarderId }));
      mockAreaRepo.create.mockResolvedValue(createdArea);

      // Act
      const result = await forwarderService.createForwarderArea(areaData, userId);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual(createdArea);
      expect(mockAreaRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          forwarder: forwarderId.toString(),
          province: 'DKI Jakarta',
          city: 'Jakarta Barat',
          district: 'Grogol',
          createdBy: userId,
          updatedBy: userId,
        })
      );
    });

    it('should return error if forwarder not found', async () => {
      // Arrange
      const nonExistentId = new ObjectId();
      const userId = new ObjectId();
      const areaData = {
        forwarder: nonExistentId.toString(),
        province: 'DKI Jakarta',
        city: 'Jakarta Barat',
        district: 'Grogol',
      };

      mockPartnerRepo.findById.mockResolvedValue(null);

      // Act
      const result = await forwarderService.createForwarderArea(areaData, userId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.errors).toHaveProperty('forwarder');
      expect(mockAreaRepo.create).not.toHaveBeenCalled();
    });
  });

  // Tests for Forwarder Rate methods
  describe('getForwarderRates', () => {
    it('should return paginated forwarder rates for a forwarder', async () => {
      // Arrange
      const forwarderId = new ObjectId();
      const rates = [
        new ForwarderRate({
          originArea: { province: 'DKI Jakarta', city: 'Jakarta Barat' },
          destinationArea: { province: 'Jawa Barat', city: 'Bandung' },
          rate: 15000,
        }),
        new ForwarderRate({
          originArea: { province: 'DKI Jakarta', city: 'Jakarta Selatan' },
          destinationArea: { province: 'Jawa Barat', city: 'Bandung' },
          rate: 16000,
        }),
      ];

      mockRateRepo.findByForwarder.mockResolvedValue(rates);
      mockRateRepo.count.mockResolvedValue(2);

      // Act
      const result = await forwarderService.getForwarderRates(forwarderId, {
        page: 1,
        limit: 10,
      });

      // Assert
      expect(result.items).toEqual(rates);
      expect(result.pagination.totalItems).toBe(2);
      expect(mockRateRepo.findByForwarder).toHaveBeenCalledWith(
        forwarderId,
        expect.objectContaining({ skip: 0, limit: 10 })
      );
    });
  });

  describe('findRatesForRoute', () => {
    it('should find rates for a specific route', async () => {
      // Arrange
      const forwarderId = new ObjectId();
      const originArea = { province: 'DKI Jakarta', city: 'Jakarta Barat' };
      const destinationArea = { province: 'Jawa Barat', city: 'Bandung' };

      const rates = [
        new ForwarderRate({
          originArea,
          destinationArea,
          rate: 15000,
        }),
      ];

      mockRateRepo.findRatesForRoute.mockResolvedValue(rates);

      // Act
      const result = await forwarderService.findRatesForRoute(
        forwarderId,
        originArea,
        destinationArea
      );

      // Assert
      expect(result).toEqual(rates);
      expect(mockRateRepo.findRatesForRoute).toHaveBeenCalledWith(
        forwarderId,
        originArea,
        destinationArea
      );
    });
  });

  describe('testForwarderIntegration', () => {
    it('should test integration with a forwarder API', async () => {
      // Arrange
      const forwarderId = new ObjectId();
      const forwarderPartner = new ForwarderPartner({
        _id: forwarderId,
        code: 'JNE',
        name: 'JNE Express',
        apiConfig: {
          baseUrl: 'https://api.jne.co.id/v1',
          apiKey: 'test-api-key',
        },
      });

      const testData = {
        shipmentType: 'regular',
        weight: 1.5,
        destination: 'Jakarta',
      };

      mockPartnerRepo.findById.mockResolvedValue(forwarderPartner);

      // Act
      const result = await forwarderService.testForwarderIntegration(forwarderId, testData);

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toContain('Koneksi ke API forwarder berhasil');
      expect(result.details).toBeDefined();
      expect(result.details.testData).toEqual(testData);
    });

    it('should return error if forwarder not found', async () => {
      // Arrange
      const nonExistentId = new ObjectId();

      mockPartnerRepo.findById.mockResolvedValue(null);

      // Act
      const result = await forwarderService.testForwarderIntegration(nonExistentId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toContain('Forwarder tidak ditemukan');
    });

    it('should return error if API config is incomplete', async () => {
      // Arrange
      const forwarderId = new ObjectId();
      const forwarderPartner = new ForwarderPartner({
        _id: forwarderId,
        code: 'JNE',
        name: 'JNE Express',
        apiConfig: {
          // Missing required fields
          baseUrl: '',
          apiKey: '',
        },
      });

      mockPartnerRepo.findById.mockResolvedValue(forwarderPartner);

      // Act
      const result = await forwarderService.testForwarderIntegration(forwarderId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toContain('Konfigurasi API tidak lengkap');
    });
  });
});
