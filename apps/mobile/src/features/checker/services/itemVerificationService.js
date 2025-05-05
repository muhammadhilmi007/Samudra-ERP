/**
 * Item Verification Service
 * Handles business logic for item verification in the Checker App
 */
import { database } from '../../../db/config';
import { PickupItem, ItemCondition } from '../../../db/models';

/**
 * Item verification statuses
 */
export const VERIFICATION_STATUS = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
};

/**
 * Packaging quality options
 */
export const PACKAGING_QUALITY = {
  GOOD: 'good',
  FAIR: 'fair',
  POOR: 'poor',
};

/**
 * Item verification service
 */
export const itemVerificationService = {
  /**
   * Get a pickup item by ID
   * @param {string} itemId - The pickup item ID
   * @returns {Promise<Object>} - The pickup item
   */
  getItemById: async (itemId) => {
    try {
      const item = await database.get('pickup_items').find(itemId);
      return item;
    } catch (error) {
      console.error('Error getting item by ID:', error);
      throw error;
    }
  },

  /**
   * Get all items for a pickup request
   * @param {string} pickupRequestId - The pickup request ID
   * @returns {Promise<Array>} - Array of pickup items
   */
  getItemsByPickupRequestId: async (pickupRequestId) => {
    try {
      const items = await database
        .get('pickup_items')
        .query(Q => Q.where('pickup_request_id', pickupRequestId))
        .fetch();
      return items;
    } catch (error) {
      console.error('Error getting items by pickup request ID:', error);
      throw error;
    }
  },

  /**
   * Get item condition by item ID
   * @param {string} itemId - The pickup item ID
   * @returns {Promise<Object|null>} - The item condition or null if not found
   */
  getItemCondition: async (itemId) => {
    try {
      const conditions = await database
        .get('item_conditions')
        .query(Q => Q.where('item_id', itemId))
        .fetch();
      
      return conditions.length > 0 ? conditions[0] : null;
    } catch (error) {
      console.error('Error getting item condition:', error);
      throw error;
    }
  },

  /**
   * Create or update item condition
   * @param {string} itemId - The pickup item ID
   * @param {Object} conditionData - The condition data
   * @returns {Promise<Object>} - The created or updated item condition
   */
  saveItemCondition: async (itemId, conditionData) => {
    try {
      // Start a database action
      return await database.action(async () => {
        const existingCondition = await itemVerificationService.getItemCondition(itemId);
        
        if (existingCondition) {
          // Update existing condition
          await existingCondition.update(condition => {
            condition.conditionRating = conditionData.conditionRating;
            condition.hasDamage = conditionData.hasDamage;
            condition.damageDescription = conditionData.damageDescription;
            condition.packagingQuality = conditionData.packagingQuality;
            condition.specialHandling = conditionData.specialHandling;
            condition.verificationStatus = conditionData.verificationStatus;
            condition.verificationNotes = conditionData.verificationNotes;
            condition.isSynced = false;
            condition.syncError = null;
          });
          
          return existingCondition;
        } else {
          // Create new condition
          const newCondition = await database.get('item_conditions').create(condition => {
            condition.itemId = itemId;
            condition.conditionRating = conditionData.conditionRating;
            condition.hasDamage = conditionData.hasDamage;
            condition.damageDescription = conditionData.damageDescription;
            condition.packagingQuality = conditionData.packagingQuality;
            condition.specialHandling = conditionData.specialHandling;
            condition.verificationStatus = conditionData.verificationStatus;
            condition.verificationNotes = conditionData.verificationNotes;
            condition.isSynced = false;
            condition.syncError = null;
          });
          
          return newCondition;
        }
      });
    } catch (error) {
      console.error('Error saving item condition:', error);
      throw error;
    }
  },

  /**
   * Update item verification status
   * @param {string} itemId - The pickup item ID
   * @param {string} status - The verification status
   * @param {string} notes - Optional verification notes
   * @returns {Promise<Object>} - The updated item condition
   */
  updateVerificationStatus: async (itemId, status, notes = '') => {
    try {
      const condition = await itemVerificationService.getItemCondition(itemId);
      
      if (!condition) {
        throw new Error('Item condition not found');
      }
      
      return await database.action(async () => {
        await condition.update(cond => {
          cond.verificationStatus = status;
          cond.verificationNotes = notes;
          cond.isSynced = false;
          cond.syncError = null;
        });
        
        return condition;
      });
    } catch (error) {
      console.error('Error updating verification status:', error);
      throw error;
    }
  },

  /**
   * Validate item condition data
   * @param {Object} conditionData - The condition data to validate
   * @returns {Object} - Validation result with isValid and errors
   */
  validateConditionData: (conditionData) => {
    const errors = {};
    
    // Validate condition rating (1-5)
    if (!conditionData.conditionRating || 
        conditionData.conditionRating < 1 || 
        conditionData.conditionRating > 5) {
      errors.conditionRating = 'Condition rating must be between 1 and 5';
    }
    
    // Validate packaging quality
    if (!conditionData.packagingQuality || 
        !Object.values(PACKAGING_QUALITY).includes(conditionData.packagingQuality)) {
      errors.packagingQuality = 'Invalid packaging quality';
    }
    
    // Validate damage description if has damage is true
    if (conditionData.hasDamage && !conditionData.damageDescription) {
      errors.damageDescription = 'Damage description is required when item has damage';
    }
    
    // Validate verification status
    if (!conditionData.verificationStatus || 
        !Object.values(VERIFICATION_STATUS).includes(conditionData.verificationStatus)) {
      errors.verificationStatus = 'Invalid verification status';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  },
};

export default itemVerificationService;
