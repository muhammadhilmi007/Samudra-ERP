/**
 * Batch Scanning Service
 * Handles business logic for batch scanning operations
 */
import { database } from '../../../db/config';
import { ItemBatch, WarehouseItem } from '../../../db/models';
import { syncQueueService } from '../../../lib/syncQueue';
import { Q } from '@nozbe/watermelondb';

class BatchScanningService {
  /**
   * Create a new batch
   * @param {Object} batchData - Batch data
   * @returns {Promise<Object>} - Created batch
   */
  async createBatch(batchData) {
    try {
      // Generate batch code if not provided
      if (!batchData.batchCode) {
        const tempBatch = new ItemBatch();
        batchData.batchCode = tempBatch.generateBatchCode();
      }

      // Set default status if not provided
      if (!batchData.status) {
        batchData.status = 'pending';
      }

      batchData.createdAt = new Date().getTime();
      batchData.updatedAt = new Date().getTime();
      batchData.syncStatus = 'pending';

      // Create the batch in the database
      let newBatch;
      await database.action(async () => {
        newBatch = await database.collections.get('item_batches').create(batch => {
          Object.keys(batchData).forEach(key => {
            batch[key] = batchData[key];
          });
        });
      });

      // Add to sync queue
      await syncQueueService.addToQueue({
        entityId: newBatch.id,
        entityType: 'item_batches',
        operation: 'create',
        data: JSON.stringify(batchData),
        priority: 1,
      });

      return newBatch;
    } catch (error) {
      console.error('Error creating batch:', error);
      throw error;
    }
  }

  /**
   * Add item to batch
   * @param {string} batchId - Batch ID
   * @param {string} itemId - Item ID
   * @returns {Promise<Object>} - Updated batch
   */
  async addItemToBatch(batchId, itemId) {
    try {
      // Get the batch and item
      const batch = await database.collections.get('item_batches').find(batchId);
      const item = await database.collections.get('warehouse_items').find(itemId);

      // Update the item to associate it with the batch
      let updatedItem;
      await database.action(async () => {
        updatedItem = await item.update(record => {
          record.warehouseItemId = itemId;
          record.updatedAt = new Date().getTime();
          record.syncStatus = 'pending';
        });
      });

      // Add to sync queue
      await syncQueueService.addToQueue({
        entityId: updatedItem.id,
        entityType: 'warehouse_items',
        operation: 'update',
        data: JSON.stringify({ warehouseItemId: itemId }),
        priority: 1,
      });

      return batch;
    } catch (error) {
      console.error('Error adding item to batch:', error);
      throw error;
    }
  }

  /**
   * Process a batch
   * @param {string} batchId - Batch ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Processed batch
   */
  async processBatch(batchId, userId) {
    try {
      // Get the batch
      const batch = await database.collections.get('item_batches').find(batchId);
      
      // Get all items in the batch
      const items = await database.collections
        .get('warehouse_items')
        .query(Q.where('warehouseItemId', batchId))
        .fetch();

      // Update batch status
      let updatedBatch;
      await database.action(async () => {
        updatedBatch = await batch.update(record => {
          record.status = 'processed';
          record.processedBy = userId;
          record.updatedAt = new Date().getTime();
          record.syncStatus = 'pending';
        });
      });

      // Update all items in the batch
      await database.action(async () => {
        await Promise.all(items.map(item => {
          return item.update(record => {
            // Update status based on batch type
            if (batch.batchType === 'incoming') {
              record.status = 'received';
            } else if (batch.batchType === 'outgoing') {
              record.status = 'shipped';
            }
            record.updatedAt = new Date().getTime();
            record.syncStatus = 'pending';
          });
        }));
      });

      // Add batch to sync queue
      await syncQueueService.addToQueue({
        entityId: updatedBatch.id,
        entityType: 'item_batches',
        operation: 'update',
        data: JSON.stringify({ 
          status: 'processed', 
          processedBy: userId 
        }),
        priority: 1,
      });

      return updatedBatch;
    } catch (error) {
      console.error('Error processing batch:', error);
      throw error;
    }
  }

  /**
   * Get batch by ID
   * @param {string} batchId - Batch ID
   * @returns {Promise<Object>} - Batch
   */
  async getBatchById(batchId) {
    try {
      return await database.collections.get('item_batches').find(batchId);
    } catch (error) {
      console.error('Error getting batch:', error);
      throw error;
    }
  }

  /**
   * Get batches by status
   * @param {string} status - Batch status
   * @returns {Promise<Array>} - Batches
   */
  async getBatchesByStatus(status) {
    try {
      return await database.collections
        .get('item_batches')
        .query(Q.where('status', status))
        .fetch();
    } catch (error) {
      console.error('Error getting batches by status:', error);
      throw error;
    }
  }

  /**
   * Get items in a batch
   * @param {string} batchId - Batch ID
   * @returns {Promise<Array>} - Items
   */
  async getItemsInBatch(batchId) {
    try {
      return await database.collections
        .get('warehouse_items')
        .query(Q.where('warehouseItemId', batchId))
        .fetch();
    } catch (error) {
      console.error('Error getting items in batch:', error);
      throw error;
    }
  }

  /**
   * Cancel a batch
   * @param {string} batchId - Batch ID
   * @returns {Promise<Object>} - Cancelled batch
   */
  async cancelBatch(batchId) {
    try {
      // Get the batch
      const batch = await database.collections.get('item_batches').find(batchId);
      
      // Update batch status
      let updatedBatch;
      await database.action(async () => {
        updatedBatch = await batch.update(record => {
          record.status = 'cancelled';
          record.updatedAt = new Date().getTime();
          record.syncStatus = 'pending';
        });
      });

      // Add to sync queue
      await syncQueueService.addToQueue({
        entityId: updatedBatch.id,
        entityType: 'item_batches',
        operation: 'update',
        data: JSON.stringify({ status: 'cancelled' }),
        priority: 1,
      });

      return updatedBatch;
    } catch (error) {
      console.error('Error cancelling batch:', error);
      throw error;
    }
  }
}

export const batchScanningService = new BatchScanningService();
export default batchScanningService;
