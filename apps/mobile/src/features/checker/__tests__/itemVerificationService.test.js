/**
 * Unit tests for itemVerificationService
 */
import { itemVerificationService, VERIFICATION_STATUS, PACKAGING_QUALITY } from '../services/itemVerificationService';
import { database } from '../../../db/config';

// Mock the database
jest.mock('../../../db/config', () => ({
  database: {
    get: jest.fn(),
    action: jest.fn(callback => callback()),
  },
}));

describe('itemVerificationService', () => {
  let mockItemCondition;
  let mockPickupItem;
  let mockCollection;
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock item condition
    mockItemCondition = {
      id: 'condition-123',
      itemId: 'item-123',
      conditionRating: 4,
      hasDamage: false,
      damageDescription: '',
      packagingQuality: PACKAGING_QUALITY.GOOD,
      specialHandling: '',
      verificationStatus: VERIFICATION_STATUS.PENDING,
      verificationNotes: '',
      update: jest.fn(updater => {
        updater(mockItemCondition);
        return Promise.resolve(mockItemCondition);
      }),
    };
    
    // Mock pickup item
    mockPickupItem = {
      id: 'item-123',
      description: 'Test Item',
      weight: 5,
      length: 20,
      width: 15,
      height: 10,
      volumetricWeight: 0.5,
    };
    
    // Mock collection
    mockCollection = {
      find: jest.fn().mockResolvedValue(mockPickupItem),
      query: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      fetch: jest.fn().mockResolvedValue([mockItemCondition]),
      create: jest.fn(creator => {
        creator(mockItemCondition);
        return Promise.resolve(mockItemCondition);
      }),
    };
    
    // Setup database mock
    database.get.mockReturnValue(mockCollection);
  });
  
  describe('getItemById', () => {
    it('should return the item with the given ID', async () => {
      const result = await itemVerificationService.getItemById('item-123');
      
      expect(database.get).toHaveBeenCalledWith('pickup_items');
      expect(mockCollection.find).toHaveBeenCalledWith('item-123');
      expect(result).toEqual(mockPickupItem);
    });
    
    it('should throw an error if the database operation fails', async () => {
      mockCollection.find.mockRejectedValue(new Error('Database error'));
      
      await expect(itemVerificationService.getItemById('item-123')).rejects.toThrow('Database error');
    });
  });
  
  describe('getItemsByPickupRequestId', () => {
    it('should return items for the given pickup request ID', async () => {
      const result = await itemVerificationService.getItemsByPickupRequestId('pickup-123');
      
      expect(database.get).toHaveBeenCalledWith('pickup_items');
      expect(mockCollection.query).toHaveBeenCalled();
      expect(result).toEqual([mockItemCondition]);
    });
    
    it('should throw an error if the database operation fails', async () => {
      mockCollection.fetch.mockRejectedValue(new Error('Database error'));
      
      await expect(itemVerificationService.getItemsByPickupRequestId('pickup-123')).rejects.toThrow('Database error');
    });
  });
  
  describe('getItemCondition', () => {
    it('should return the condition for the given item ID', async () => {
      const result = await itemVerificationService.getItemCondition('item-123');
      
      expect(database.get).toHaveBeenCalledWith('item_conditions');
      expect(mockCollection.query).toHaveBeenCalled();
      expect(result).toEqual(mockItemCondition);
    });
    
    it('should return null if no condition is found', async () => {
      mockCollection.fetch.mockResolvedValue([]);
      
      const result = await itemVerificationService.getItemCondition('item-123');
      
      expect(result).toBeNull();
    });
    
    it('should throw an error if the database operation fails', async () => {
      mockCollection.fetch.mockRejectedValue(new Error('Database error'));
      
      await expect(itemVerificationService.getItemCondition('item-123')).rejects.toThrow('Database error');
    });
  });
  
  describe('saveItemCondition', () => {
    const conditionData = {
      conditionRating: 4,
      hasDamage: true,
      damageDescription: 'Dented corner',
      packagingQuality: PACKAGING_QUALITY.FAIR,
      specialHandling: 'Handle with care',
      verificationStatus: VERIFICATION_STATUS.VERIFIED,
      verificationNotes: 'Verified with customer',
    };
    
    it('should update an existing condition', async () => {
      // Mock getItemCondition to return an existing condition
      jest.spyOn(itemVerificationService, 'getItemCondition').mockResolvedValue(mockItemCondition);
      
      const result = await itemVerificationService.saveItemCondition('item-123', conditionData);
      
      expect(database.action).toHaveBeenCalled();
      expect(mockItemCondition.update).toHaveBeenCalled();
      expect(result).toEqual(mockItemCondition);
      expect(result.conditionRating).toBe(conditionData.conditionRating);
      expect(result.hasDamage).toBe(conditionData.hasDamage);
      expect(result.damageDescription).toBe(conditionData.damageDescription);
      expect(result.isSynced).toBe(false);
    });
    
    it('should create a new condition if none exists', async () => {
      // Mock getItemCondition to return null (no existing condition)
      jest.spyOn(itemVerificationService, 'getItemCondition').mockResolvedValue(null);
      
      const result = await itemVerificationService.saveItemCondition('item-123', conditionData);
      
      expect(database.action).toHaveBeenCalled();
      expect(mockCollection.create).toHaveBeenCalled();
      expect(result).toEqual(mockItemCondition);
      expect(result.itemId).toBe('item-123');
    });
    
    it('should throw an error if the database operation fails', async () => {
      jest.spyOn(itemVerificationService, 'getItemCondition').mockRejectedValue(new Error('Database error'));
      
      await expect(itemVerificationService.saveItemCondition('item-123', conditionData)).rejects.toThrow('Database error');
    });
  });
  
  describe('updateVerificationStatus', () => {
    it('should update the verification status of an item condition', async () => {
      // Mock getItemCondition to return an existing condition
      jest.spyOn(itemVerificationService, 'getItemCondition').mockResolvedValue(mockItemCondition);
      
      const result = await itemVerificationService.updateVerificationStatus(
        'item-123',
        VERIFICATION_STATUS.VERIFIED,
        'Verified by checker'
      );
      
      expect(database.action).toHaveBeenCalled();
      expect(mockItemCondition.update).toHaveBeenCalled();
      expect(result.verificationStatus).toBe(VERIFICATION_STATUS.VERIFIED);
      expect(result.verificationNotes).toBe('Verified by checker');
      expect(result.isSynced).toBe(false);
    });
    
    it('should throw an error if no condition is found', async () => {
      // Mock getItemCondition to return null (no existing condition)
      jest.spyOn(itemVerificationService, 'getItemCondition').mockResolvedValue(null);
      
      await expect(itemVerificationService.updateVerificationStatus(
        'item-123',
        VERIFICATION_STATUS.VERIFIED
      )).rejects.toThrow('Item condition not found');
    });
    
    it('should throw an error if the database operation fails', async () => {
      jest.spyOn(itemVerificationService, 'getItemCondition').mockRejectedValue(new Error('Database error'));
      
      await expect(itemVerificationService.updateVerificationStatus(
        'item-123',
        VERIFICATION_STATUS.VERIFIED
      )).rejects.toThrow('Database error');
    });
  });
  
  describe('validateConditionData', () => {
    it('should validate valid condition data', () => {
      const validData = {
        conditionRating: 4,
        hasDamage: false,
        packagingQuality: PACKAGING_QUALITY.GOOD,
        verificationStatus: VERIFICATION_STATUS.VERIFIED,
      };
      
      const result = itemVerificationService.validateConditionData(validData);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });
    
    it('should validate condition rating is between 1 and 5', () => {
      const invalidData = {
        conditionRating: 6,
        hasDamage: false,
        packagingQuality: PACKAGING_QUALITY.GOOD,
        verificationStatus: VERIFICATION_STATUS.VERIFIED,
      };
      
      const result = itemVerificationService.validateConditionData(invalidData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.conditionRating).toBeTruthy();
    });
    
    it('should validate packaging quality is valid', () => {
      const invalidData = {
        conditionRating: 4,
        hasDamage: false,
        packagingQuality: 'invalid',
        verificationStatus: VERIFICATION_STATUS.VERIFIED,
      };
      
      const result = itemVerificationService.validateConditionData(invalidData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.packagingQuality).toBeTruthy();
    });
    
    it('should validate damage description is provided when has damage is true', () => {
      const invalidData = {
        conditionRating: 4,
        hasDamage: true,
        damageDescription: '',
        packagingQuality: PACKAGING_QUALITY.GOOD,
        verificationStatus: VERIFICATION_STATUS.VERIFIED,
      };
      
      const result = itemVerificationService.validateConditionData(invalidData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.damageDescription).toBeTruthy();
    });
    
    it('should validate verification status is valid', () => {
      const invalidData = {
        conditionRating: 4,
        hasDamage: false,
        packagingQuality: PACKAGING_QUALITY.GOOD,
        verificationStatus: 'invalid',
      };
      
      const result = itemVerificationService.validateConditionData(invalidData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.verificationStatus).toBeTruthy();
    });
  });
});
