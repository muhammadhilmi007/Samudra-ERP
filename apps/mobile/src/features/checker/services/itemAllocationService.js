/**
 * Item Allocation Service
 * Handles business logic for item allocation operations
 */
import { database } from '../../../db/config';
import { ItemAllocation, WarehouseItem } from '../../../db/models';
import { syncQueueService } from '../../../lib/syncQueue';
import { Q } from '@nozbe/watermelondb';

class ItemAllocationService {
  /**
   * Allocate an item
   * @param {string} itemId - Item ID
   * @param {Object} allocationData - Allocation data
   * @returns {Promise<Object>} - Created allocation
   */
  async allocateItem(itemId, allocationData) {
    try {
      // Get the item
      const item = await database.collections.get('warehouse_items').find(itemId);
      
      // Check if item is in a state that can be allocated
      if (item.status !== 'received' && item.status !== 'incoming') {
        throw new Error(`Item cannot be allocated: current status is ${item.status}`);
      }

      // Prepare allocation data
      const itemAllocationData = {
        warehouseItemId: itemId,
        allocationType: allocationData.allocationType,
        allocationId: allocationData.allocationId,
        allocationName: allocationData.allocationName,
        status: 'pending',
        allocatedBy: allocationData.allocatedBy,
        notes: allocationData.notes || '',
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime(),
        syncStatus: 'pending',
      };

      // Create the allocation in the database
      let newAllocation;
      await database.action(async () => {
        newAllocation = await database.collections.get('item_allocations').create(allocation => {
          Object.keys(itemAllocationData).forEach(key => {
            allocation[key] = itemAllocationData[key];
          });
        });
      });

      // Update the item status
      await database.action(async () => {
        await item.update(record => {
          record.status = 'allocated';
          record.allocatedAt = new Date().getTime();
          record.updatedAt = new Date().getTime();
          record.syncStatus = 'pending';
        });
      });

      // Add allocation to sync queue
      await syncQueueService.addToQueue({
        entityId: newAllocation.id,
        entityType: 'item_allocations',
        operation: 'create',
        data: JSON.stringify(itemAllocationData),
        priority: 1,
      });

      // Add item update to sync queue
      await syncQueueService.addToQueue({
        entityId: item.id,
        entityType: 'warehouse_items',
        operation: 'update',
        data: JSON.stringify({
          status: 'allocated',
          allocatedAt: new Date().getTime()
        }),
        priority: 1,
      });

      return newAllocation;
    } catch (error) {
      console.error('Error allocating item:', error);
      throw error;
    }
  }

  /**
   * Confirm allocation
   * @param {string} allocationId - Allocation ID
   * @returns {Promise<Object>} - Updated allocation
   */
  async confirmAllocation(allocationId) {
    try {
      // Get the allocation
      const allocation = await database.collections.get('item_allocations').find(allocationId);
      
      // Update allocation status
      let updatedAllocation;
      await database.action(async () => {
        updatedAllocation = await allocation.update(record => {
          record.status = 'confirmed';
          record.updatedAt = new Date().getTime();
          record.syncStatus = 'pending';
        });
      });

      // Add to sync queue
      await syncQueueService.addToQueue({
        entityId: updatedAllocation.id,
        entityType: 'item_allocations',
        operation: 'update',
        data: JSON.stringify({ status: 'confirmed' }),
        priority: 1,
      });

      return updatedAllocation;
    } catch (error) {
      console.error('Error confirming allocation:', error);
      throw error;
    }
  }

  /**
   * Cancel allocation
   * @param {string} allocationId - Allocation ID
   * @returns {Promise<Object>} - Updated allocation
   */
  async cancelAllocation(allocationId) {
    try {
      // Get the allocation
      const allocation = await database.collections.get('item_allocations').find(allocationId);
      
      // Get the item
      const item = await database.collections.get('warehouse_items').find(allocation.warehouseItemId);
      
      // Update allocation status
      let updatedAllocation;
      await database.action(async () => {
        updatedAllocation = await allocation.update(record => {
          record.status = 'cancelled';
          record.updatedAt = new Date().getTime();
          record.syncStatus = 'pending';
        });
      });

      // Update the item status back to received
      await database.action(async () => {
        await item.update(record => {
          record.status = 'received';
          record.allocatedAt = null;
          record.updatedAt = new Date().getTime();
          record.syncStatus = 'pending';
        });
      });

      // Add allocation update to sync queue
      await syncQueueService.addToQueue({
        entityId: updatedAllocation.id,
        entityType: 'item_allocations',
        operation: 'update',
        data: JSON.stringify({ status: 'cancelled' }),
        priority: 1,
      });

      // Add item update to sync queue
      await syncQueueService.addToQueue({
        entityId: item.id,
        entityType: 'warehouse_items',
        operation: 'update',
        data: JSON.stringify({
          status: 'received',
          allocatedAt: null
        }),
        priority: 1,
      });

      return updatedAllocation;
    } catch (error) {
      console.error('Error cancelling allocation:', error);
      throw error;
    }
  }

  /**
   * Get allocation by ID
   * @param {string} allocationId - Allocation ID
   * @returns {Promise<Object>} - Allocation
   */
  async getAllocationById(allocationId) {
    try {
      return await database.collections.get('item_allocations').find(allocationId);
    } catch (error) {
      console.error('Error getting allocation:', error);
      throw error;
    }
  }

  /**
   * Get allocations by item ID
   * @param {string} itemId - Item ID
   * @returns {Promise<Array>} - Allocations
   */
  async getAllocationsByItem(itemId) {
    try {
      return await database.collections
        .get('item_allocations')
        .query(Q.where('warehouseItemId', itemId))
        .fetch();
    } catch (error) {
      console.error('Error getting allocations by item:', error);
      throw error;
    }
  }

  /**
   * Get allocations by allocation type and ID
   * @param {string} allocationType - Allocation type
   * @param {string} allocationId - Allocation ID
   * @returns {Promise<Array>} - Allocations
   */
  async getAllocationsByTypeAndId(allocationType, allocationId) {
    try {
      return await database.collections
        .get('item_allocations')
        .query(
          Q.where('allocationType', allocationType),
          Q.where('allocationId', allocationId)
        )
        .fetch();
    } catch (error) {
      console.error('Error getting allocations by type and ID:', error);
      throw error;
    }
  }

  /**
   * Get allocations by status
   * @param {string} status - Allocation status
   * @returns {Promise<Array>} - Allocations
   */
  async getAllocationsByStatus(status) {
    try {
      return await database.collections
        .get('item_allocations')
        .query(Q.where('status', status))
        .fetch();
    } catch (error) {
      console.error('Error getting allocations by status:', error);
      throw error;
    }
  }
}

export const itemAllocationService = new ItemAllocationService();
export default itemAllocationService;
