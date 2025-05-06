/**
 * Warehouse Item Service
 * Handles business logic for warehouse item operations
 */
import { database } from '../../../db/config';
import { WarehouseItem, ItemPhoto } from '../../../db/models';
import { syncQueueService } from '../../../lib/syncQueue';

class WarehouseItemService {
  /**
   * Process an incoming item
   * @param {Object} itemData - Item data
   * @returns {Promise<Object>} - Processed item
   */
  async processIncomingItem(itemData) {
    try {
      // Generate item code if not provided
      if (!itemData.itemCode) {
        const tempItem = new WarehouseItem();
        itemData.itemCode = tempItem.generateItemCode();
      }

      // Calculate volumetric weight if dimensions are provided
      if (itemData.length && itemData.width && itemData.height) {
        const volumetricWeight = (
          parseFloat(itemData.length) * 
          parseFloat(itemData.width) * 
          parseFloat(itemData.height)
        ) / 5000;
        itemData.volumetricWeight = volumetricWeight.toFixed(2);
      }

      // Set status to incoming if not provided
      if (!itemData.status) {
        itemData.status = 'incoming';
      }

      // Set processed timestamp
      itemData.processedAt = new Date().getTime();
      itemData.syncStatus = 'pending';

      // Create the item in the database
      let newItem;
      await database.action(async () => {
        newItem = await database.collections.get('warehouse_items').create(item => {
          Object.keys(itemData).forEach(key => {
            item[key] = itemData[key];
          });
        });
      });

      // Add to sync queue
      await syncQueueService.addToQueue({
        entityId: newItem.id,
        entityType: 'warehouse_items',
        operation: 'create',
        data: JSON.stringify(itemData),
        priority: 1,
      });

      return newItem;
    } catch (error) {
      console.error('Error processing incoming item:', error);
      throw error;
    }
  }

  /**
   * Update a warehouse item
   * @param {string} itemId - Item ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} - Updated item
   */
  async updateItem(itemId, updateData) {
    try {
      let updatedItem;
      await database.action(async () => {
        const item = await database.collections.get('warehouse_items').find(itemId);
        updatedItem = await item.update(record => {
          Object.keys(updateData).forEach(key => {
            record[key] = updateData[key];
          });
          record.updatedAt = new Date().getTime();
          record.syncStatus = 'pending';
        });
      });

      // Add to sync queue
      await syncQueueService.addToQueue({
        entityId: updatedItem.id,
        entityType: 'warehouse_items',
        operation: 'update',
        data: JSON.stringify(updateData),
        priority: 1,
      });

      return updatedItem;
    } catch (error) {
      console.error('Error updating warehouse item:', error);
      throw error;
    }
  }

  /**
   * Get a warehouse item by ID
   * @param {string} itemId - Item ID
   * @returns {Promise<Object>} - Item
   */
  async getItemById(itemId) {
    try {
      return await database.collections.get('warehouse_items').find(itemId);
    } catch (error) {
      console.error('Error getting warehouse item:', error);
      throw error;
    }
  }

  /**
   * Get warehouse items by status
   * @param {string} status - Item status
   * @returns {Promise<Array>} - Items
   */
  async getItemsByStatus(status) {
    try {
      return await database.collections
        .get('warehouse_items')
        .query(Q.where('status', status))
        .fetch();
    } catch (error) {
      console.error('Error getting warehouse items by status:', error);
      throw error;
    }
  }

  /**
   * Get warehouse items by destination branch
   * @param {string} branchId - Branch ID
   * @returns {Promise<Array>} - Items
   */
  async getItemsByDestination(branchId) {
    try {
      return await database.collections
        .get('warehouse_items')
        .query(Q.where('destinationBranchId', branchId))
        .fetch();
    } catch (error) {
      console.error('Error getting warehouse items by destination:', error);
      throw error;
    }
  }

  /**
   * Get item photos
   * @param {string} itemId - Item ID
   * @returns {Promise<Array>} - Photos
   */
  async getItemPhotos(itemId) {
    try {
      return await database.collections
        .get('item_photos')
        .query(Q.where('itemId', itemId))
        .fetch();
    } catch (error) {
      console.error('Error getting item photos:', error);
      throw error;
    }
  }

  /**
   * Add a photo to an item
   * @param {string} itemId - Item ID
   * @param {string} photoUri - Photo URI
   * @returns {Promise<Object>} - Photo
   */
  async addItemPhoto(itemId, photoUri) {
    try {
      let newPhoto;
      await database.action(async () => {
        newPhoto = await database.collections.get('item_photos').create(photo => {
          photo.itemId = itemId;
          photo.photoUri = photoUri;
          photo.createdAt = new Date().getTime();
          photo.isUploaded = false;
        });
      });

      return newPhoto;
    } catch (error) {
      console.error('Error adding item photo:', error);
      throw error;
    }
  }
}

export const warehouseItemService = new WarehouseItemService();
export default warehouseItemService;
