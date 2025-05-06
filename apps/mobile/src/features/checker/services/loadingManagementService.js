/**
 * Loading Management Service
 * Handles business logic for loading operations
 */
import { database } from '../../../db/config';
import { LoadingManifest, LoadingItem, WarehouseItem } from '../../../db/models';
import { syncQueueService } from '../../../lib/syncQueue';
import { Q } from '@nozbe/watermelondb';

class LoadingManagementService {
  /**
   * Create a new loading manifest
   * @param {Object} manifestData - Manifest data
   * @returns {Promise<Object>} - Created manifest
   */
  async createManifest(manifestData) {
    try {
      // Generate manifest code if not provided
      if (!manifestData.manifestCode) {
        const tempManifest = new LoadingManifest();
        manifestData.manifestCode = tempManifest.generateManifestCode();
      }

      // Set default status if not provided
      if (!manifestData.status) {
        manifestData.status = 'pending';
      }

      manifestData.createdAt = new Date().getTime();
      manifestData.updatedAt = new Date().getTime();
      manifestData.syncStatus = 'pending';

      // Create the manifest in the database
      let newManifest;
      await database.action(async () => {
        newManifest = await database.collections.get('loading_manifests').create(manifest => {
          Object.keys(manifestData).forEach(key => {
            manifest[key] = manifestData[key];
          });
        });
      });

      // Add to sync queue
      await syncQueueService.addToQueue({
        entityId: newManifest.id,
        entityType: 'loading_manifests',
        operation: 'create',
        data: JSON.stringify(manifestData),
        priority: 1,
      });

      return newManifest;
    } catch (error) {
      console.error('Error creating loading manifest:', error);
      throw error;
    }
  }

  /**
   * Add item to loading manifest
   * @param {string} manifestId - Manifest ID
   * @param {string} itemId - Item ID
   * @param {Object} loadingData - Additional loading data
   * @returns {Promise<Object>} - Created loading item
   */
  async addItemToManifest(manifestId, itemId, loadingData = {}) {
    try {
      // Get the manifest and item
      const manifest = await database.collections.get('loading_manifests').find(manifestId);
      const item = await database.collections.get('warehouse_items').find(itemId);

      // Prepare loading item data
      const loadingItemData = {
        loadingManifestId: manifestId,
        warehouseItemId: itemId,
        itemCode: item.itemCode,
        trackingNumber: item.trackingNumber,
        status: 'pending',
        loadedBy: loadingData.loadedBy || '',
        loadingPosition: loadingData.loadingPosition || '',
        notes: loadingData.notes || '',
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime(),
        syncStatus: 'pending',
      };

      // Create the loading item in the database
      let newLoadingItem;
      await database.action(async () => {
        newLoadingItem = await database.collections.get('loading_items').create(loadingItem => {
          Object.keys(loadingItemData).forEach(key => {
            loadingItem[key] = loadingItemData[key];
          });
        });
      });

      // Add to sync queue
      await syncQueueService.addToQueue({
        entityId: newLoadingItem.id,
        entityType: 'loading_items',
        operation: 'create',
        data: JSON.stringify(loadingItemData),
        priority: 1,
      });

      return newLoadingItem;
    } catch (error) {
      console.error('Error adding item to manifest:', error);
      throw error;
    }
  }

  /**
   * Mark item as loaded
   * @param {string} loadingItemId - Loading item ID
   * @param {string} userId - User ID
   * @param {Object} loadingData - Additional loading data
   * @returns {Promise<Object>} - Updated loading item
   */
  async markItemAsLoaded(loadingItemId, userId, loadingData = {}) {
    try {
      // Get the loading item
      const loadingItem = await database.collections.get('loading_items').find(loadingItemId);
      
      // Update loading item status
      let updatedLoadingItem;
      await database.action(async () => {
        updatedLoadingItem = await loadingItem.update(record => {
          record.status = 'loaded';
          record.loadedBy = userId;
          record.loadedAt = new Date().getTime();
          if (loadingData.loadingPosition) {
            record.loadingPosition = loadingData.loadingPosition;
          }
          if (loadingData.notes) {
            record.notes = loadingData.notes;
          }
          record.updatedAt = new Date().getTime();
          record.syncStatus = 'pending';
        });
      });

      // Update warehouse item status
      await database.action(async () => {
        const warehouseItem = await database.collections.get('warehouse_items').find(loadingItem.warehouseItemId);
        await warehouseItem.update(record => {
          record.status = 'loaded';
          record.loadedAt = new Date().getTime();
          record.updatedAt = new Date().getTime();
          record.syncStatus = 'pending';
        });
      });

      // Add to sync queue
      await syncQueueService.addToQueue({
        entityId: updatedLoadingItem.id,
        entityType: 'loading_items',
        operation: 'update',
        data: JSON.stringify({ 
          status: 'loaded', 
          loadedBy: userId,
          loadedAt: new Date().getTime(),
          ...loadingData
        }),
        priority: 1,
      });

      return updatedLoadingItem;
    } catch (error) {
      console.error('Error marking item as loaded:', error);
      throw error;
    }
  }

  /**
   * Complete loading manifest
   * @param {string} manifestId - Manifest ID
   * @returns {Promise<Object>} - Updated manifest
   */
  async completeManifest(manifestId) {
    try {
      // Get the manifest
      const manifest = await database.collections.get('loading_manifests').find(manifestId);
      
      // Get all loading items in the manifest
      const loadingItems = await database.collections
        .get('loading_items')
        .query(Q.where('loadingManifestId', manifestId))
        .fetch();

      // Check if all items are loaded
      const allItemsLoaded = loadingItems.every(item => item.status === 'loaded');
      
      if (!allItemsLoaded) {
        throw new Error('Cannot complete manifest: not all items are loaded');
      }

      // Update manifest status
      let updatedManifest;
      await database.action(async () => {
        updatedManifest = await manifest.update(record => {
          record.status = 'completed';
          record.actualDeparture = new Date().getTime();
          record.updatedAt = new Date().getTime();
          record.syncStatus = 'pending';
        });
      });

      // Add to sync queue
      await syncQueueService.addToQueue({
        entityId: updatedManifest.id,
        entityType: 'loading_manifests',
        operation: 'update',
        data: JSON.stringify({ 
          status: 'completed',
          actualDeparture: new Date().getTime()
        }),
        priority: 1,
      });

      return updatedManifest;
    } catch (error) {
      console.error('Error completing manifest:', error);
      throw error;
    }
  }

  /**
   * Get manifest by ID
   * @param {string} manifestId - Manifest ID
   * @returns {Promise<Object>} - Manifest
   */
  async getManifestById(manifestId) {
    try {
      return await database.collections.get('loading_manifests').find(manifestId);
    } catch (error) {
      console.error('Error getting manifest:', error);
      throw error;
    }
  }

  /**
   * Get manifests by status
   * @param {string} status - Manifest status
   * @returns {Promise<Array>} - Manifests
   */
  async getManifestsByStatus(status) {
    try {
      return await database.collections
        .get('loading_manifests')
        .query(Q.where('status', status))
        .fetch();
    } catch (error) {
      console.error('Error getting manifests by status:', error);
      throw error;
    }
  }

  /**
   * Get loading items in a manifest
   * @param {string} manifestId - Manifest ID
   * @returns {Promise<Array>} - Loading items
   */
  async getLoadingItemsInManifest(manifestId) {
    try {
      return await database.collections
        .get('loading_items')
        .query(Q.where('loadingManifestId', manifestId))
        .fetch();
    } catch (error) {
      console.error('Error getting loading items in manifest:', error);
      throw error;
    }
  }

  /**
   * Cancel a manifest
   * @param {string} manifestId - Manifest ID
   * @returns {Promise<Object>} - Cancelled manifest
   */
  async cancelManifest(manifestId) {
    try {
      // Get the manifest
      const manifest = await database.collections.get('loading_manifests').find(manifestId);
      
      // Get all loading items in the manifest
      const loadingItems = await database.collections
        .get('loading_items')
        .query(Q.where('loadingManifestId', manifestId))
        .fetch();

      // Update manifest status
      let updatedManifest;
      await database.action(async () => {
        updatedManifest = await manifest.update(record => {
          record.status = 'cancelled';
          record.updatedAt = new Date().getTime();
          record.syncStatus = 'pending';
        });
      });

      // Update all loading items status
      await database.action(async () => {
        await Promise.all(loadingItems.map(item => {
          return item.update(record => {
            record.status = 'cancelled';
            record.updatedAt = new Date().getTime();
            record.syncStatus = 'pending';
          });
        }));
      });

      // Update all warehouse items status
      await database.action(async () => {
        await Promise.all(loadingItems.map(async loadingItem => {
          const warehouseItem = await database.collections.get('warehouse_items').find(loadingItem.warehouseItemId);
          return warehouseItem.update(record => {
            record.status = 'allocated'; // Revert back to allocated status
            record.loadedAt = null;
            record.updatedAt = new Date().getTime();
            record.syncStatus = 'pending';
          });
        }));
      });

      // Add to sync queue
      await syncQueueService.addToQueue({
        entityId: updatedManifest.id,
        entityType: 'loading_manifests',
        operation: 'update',
        data: JSON.stringify({ status: 'cancelled' }),
        priority: 1,
      });

      return updatedManifest;
    } catch (error) {
      console.error('Error cancelling manifest:', error);
      throw error;
    }
  }
}

export const loadingManagementService = new LoadingManagementService();
export default loadingManagementService;
