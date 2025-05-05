/**
 * Unit tests for itemMeasurementService
 */
import { itemMeasurementService, calculateVolumetricWeight } from '../services/itemMeasurementService';
import { database } from '../../../db/config';

// Mock the database
jest.mock('../../../db/config', () => ({
  database: {
    get: jest.fn(),
    action: jest.fn(callback => callback()),
  },
}));

describe('itemMeasurementService', () => {
  let mockPickupItem;
  let mockCollection;
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock pickup item
    mockPickupItem = {
      id: 'item-123',
      description: 'Test Item',
      weight: 5,
      length: 20,
      width: 15,
      height: 10,
      volumetricWeight: 0.5,
      isSynced: true,
      syncError: null,
      update: jest.fn(updater => {
        updater(mockPickupItem);
        return Promise.resolve(mockPickupItem);
      }),
    };
    
    // Mock collection
    mockCollection = {
      find: jest.fn().mockResolvedValue(mockPickupItem),
    };
    
    // Setup database mock
    database.get.mockReturnValue(mockCollection);
  });
  
  describe('updateItemMeasurements', () => {
    const measurementData = {
      weight: 10,
      length: 30,
      width: 20,
      height: 15,
    };
    
    it('should update item measurements correctly', async () => {
      const result = await itemMeasurementService.updateItemMeasurements('item-123', measurementData);
      
      expect(database.get).toHaveBeenCalledWith('pickup_items');
      expect(mockCollection.find).toHaveBeenCalledWith('item-123');
      expect(database.action).toHaveBeenCalled();
      expect(mockPickupItem.update).toHaveBeenCalled();
      
      // Check that the item was updated with the new measurements
      expect(result.weight).toBe(measurementData.weight);
      expect(result.length).toBe(measurementData.length);
      expect(result.width).toBe(measurementData.width);
      expect(result.height).toBe(measurementData.height);
      
      // Check that volumetric weight was calculated correctly
      const expectedVolumetricWeight = calculateVolumetricWeight(
        measurementData.length,
        measurementData.width,
        measurementData.height
      );
      expect(result.volumetricWeight).toBe(expectedVolumetricWeight);
      
      // Check that sync flags were updated
      expect(result.isSynced).toBe(false);
      expect(result.syncError).toBeNull();
    });
    
    it('should throw an error if the database operation fails', async () => {
      mockCollection.find.mockRejectedValue(new Error('Database error'));
      
      await expect(itemMeasurementService.updateItemMeasurements('item-123', measurementData))
        .rejects.toThrow('Database error');
    });
  });
  
  describe('getItemMeasurements', () => {
    it('should return item measurements correctly', async () => {
      const result = await itemMeasurementService.getItemMeasurements('item-123');
      
      expect(database.get).toHaveBeenCalledWith('pickup_items');
      expect(mockCollection.find).toHaveBeenCalledWith('item-123');
      
      // Check that the measurements were returned correctly
      expect(result.weight).toBe(mockPickupItem.weight);
      expect(result.length).toBe(mockPickupItem.length);
      expect(result.width).toBe(mockPickupItem.width);
      expect(result.height).toBe(mockPickupItem.height);
      expect(result.volumetricWeight).toBe(mockPickupItem.volumetricWeight);
      
      // Check that effective weight is calculated correctly
      const expectedEffectiveWeight = Math.max(
        mockPickupItem.weight,
        mockPickupItem.volumetricWeight
      );
      expect(result.effectiveWeight).toBe(expectedEffectiveWeight);
    });
    
    it('should throw an error if the database operation fails', async () => {
      mockCollection.find.mockRejectedValue(new Error('Database error'));
      
      await expect(itemMeasurementService.getItemMeasurements('item-123'))
        .rejects.toThrow('Database error');
    });
  });
  
  describe('validateMeasurementData', () => {
    it('should validate valid measurement data', () => {
      const validData = {
        weight: 10,
        length: 30,
        width: 20,
        height: 15,
      };
      
      const result = itemMeasurementService.validateMeasurementData(validData);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });
    
    it('should validate weight is positive', () => {
      const invalidData = {
        weight: 0,
        length: 30,
        width: 20,
        height: 15,
      };
      
      const result = itemMeasurementService.validateMeasurementData(invalidData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.weight).toBeTruthy();
    });
    
    it('should validate length is positive', () => {
      const invalidData = {
        weight: 10,
        length: 0,
        width: 20,
        height: 15,
      };
      
      const result = itemMeasurementService.validateMeasurementData(invalidData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeTruthy();
    });
    
    it('should validate width is positive', () => {
      const invalidData = {
        weight: 10,
        length: 30,
        width: 0,
        height: 15,
      };
      
      const result = itemMeasurementService.validateMeasurementData(invalidData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.width).toBeTruthy();
    });
    
    it('should validate height is positive', () => {
      const invalidData = {
        weight: 10,
        length: 30,
        width: 20,
        height: 0,
      };
      
      const result = itemMeasurementService.validateMeasurementData(invalidData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.height).toBeTruthy();
    });
    
    it('should validate all measurements are positive', () => {
      const invalidData = {
        weight: -1,
        length: -1,
        width: -1,
        height: -1,
      };
      
      const result = itemMeasurementService.validateMeasurementData(invalidData);
      
      expect(result.isValid).toBe(false);
      expect(Object.keys(result.errors).length).toBe(4);
    });
  });
  
  describe('calculateVolumetricWeight', () => {
    it('should calculate volumetric weight correctly', () => {
      const length = 30;
      const width = 20;
      const height = 15;
      
      // Standard formula: (L x W x H) / 6000
      const expectedVolumetricWeight = (length * width * height) / 6000;
      
      const result = calculateVolumetricWeight(length, width, height);
      
      expect(result).toBe(expectedVolumetricWeight);
    });
    
    it('should handle zero dimensions', () => {
      expect(calculateVolumetricWeight(0, 20, 15)).toBe(0);
      expect(calculateVolumetricWeight(30, 0, 15)).toBe(0);
      expect(calculateVolumetricWeight(30, 20, 0)).toBe(0);
    });
  });
});
