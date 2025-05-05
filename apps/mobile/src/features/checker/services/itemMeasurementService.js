/**
 * Item Measurement Service
 * Handles business logic for item weighing and measuring in the Checker App
 */
import { database } from '../../../db/config';
import { PickupItem } from '../../../db/models';

/**
 * Item measurement service
 */
export const itemMeasurementService = {
  /**
   * Update item measurements (weight and dimensions)
   * @param {string} itemId - The pickup item ID
   * @param {Object} measurementData - The measurement data
   * @returns {Promise<Object>} - The updated pickup item
   */
  updateItemMeasurements: async (itemId, measurementData) => {
    try {
      const item = await database.get('pickup_items').find(itemId);
      
      return await database.action(async () => {
        await item.update(pickupItem => {
          pickupItem.weight = measurementData.weight;
          pickupItem.length = measurementData.length;
          pickupItem.width = measurementData.width;
          pickupItem.height = measurementData.height;
          pickupItem.volumetricWeight = calculateVolumetricWeight(
            measurementData.length,
            measurementData.width,
            measurementData.height
          );
          pickupItem.isSynced = false;
          pickupItem.syncError = null;
        });
        
        return item;
      });
    } catch (error) {
      console.error('Error updating item measurements:', error);
      throw error;
    }
  },

  /**
   * Get item measurements
   * @param {string} itemId - The pickup item ID
   * @returns {Promise<Object>} - The item measurements
   */
  getItemMeasurements: async (itemId) => {
    try {
      const item = await database.get('pickup_items').find(itemId);
      
      return {
        weight: item.weight,
        length: item.length,
        width: item.width,
        height: item.height,
        volumetricWeight: item.volumetricWeight,
        effectiveWeight: Math.max(item.weight, item.volumetricWeight),
      };
    } catch (error) {
      console.error('Error getting item measurements:', error);
      throw error;
    }
  },

  /**
   * Validate measurement data
   * @param {Object} measurementData - The measurement data to validate
   * @returns {Object} - Validation result with isValid and errors
   */
  validateMeasurementData: (measurementData) => {
    const errors = {};
    
    // Validate weight (must be positive)
    if (!measurementData.weight || measurementData.weight <= 0) {
      errors.weight = 'Weight must be greater than 0';
    }
    
    // Validate length (must be positive)
    if (!measurementData.length || measurementData.length <= 0) {
      errors.length = 'Length must be greater than 0';
    }
    
    // Validate width (must be positive)
    if (!measurementData.width || measurementData.width <= 0) {
      errors.width = 'Width must be greater than 0';
    }
    
    // Validate height (must be positive)
    if (!measurementData.height || measurementData.height <= 0) {
      errors.height = 'Height must be greater than 0';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  },
};

/**
 * Calculate volumetric weight
 * @param {number} length - Length in cm
 * @param {number} width - Width in cm
 * @param {number} height - Height in cm
 * @returns {number} - Volumetric weight in kg
 */
export const calculateVolumetricWeight = (length, width, height) => {
  // Standard volumetric weight formula: (L x W x H) / 6000
  return (length * width * height) / 6000;
};

export default itemMeasurementService;
