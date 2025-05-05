/**
 * Sync Service for Samudra Paket ERP Mobile
 * Handles data synchronization between mobile device and server
 */
import { database } from '../../db/config';
import NetInfo from '@react-native-community/netinfo';
import { Q } from '@watermelondb/core';
import { API_BASE_URL } from '../../config/constants';
import axios from 'axios';
import authService from '../../features/auth/authService';

// Entity types for sync
export enum EntityType {
  PICKUP_REQUEST = 'pickup_request',
  PICKUP_ASSIGNMENT = 'pickup_assignment',
  PICKUP_ITEM = 'pickup_item',
  ITEM_PHOTO = 'item_photo',
  SIGNATURE = 'signature',
  GPS_TRACKING = 'gps_tracking',
}

// Operation types
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
}

// Priority levels
export enum SyncPriority {
  HIGH = 1,
  MEDIUM = 5,
  LOW = 10,
}

class SyncService {
  private isSyncing: boolean = false;
  private syncQueue = database.collections.get('sync_queue');
  private maxRetries: number = 3;
  private syncInterval: NodeJS.Timeout | null = null;
  private syncIntervalTime: number = 60000; // 1 minute

  /**
   * Initialize sync service
   */
  initialize(): void {
    // Start listening for network changes
    NetInfo.addEventListener(state => {
      if (state.isConnected && state.isInternetReachable) {
        this.sync();
      }
    });

    // Start sync interval
    this.startSyncInterval();
  }

  /**
   * Start the sync interval
   */
  startSyncInterval(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(() => {
      this.checkAndSync();
    }, this.syncIntervalTime);
  }

  /**
   * Stop the sync interval
   */
  stopSyncInterval(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  /**
   * Check network connection and sync if online
   */
  async checkAndSync(): Promise<void> {
    const netInfo = await NetInfo.fetch();
    if (netInfo.isConnected && netInfo.isInternetReachable) {
      this.sync();
    }
  }

  /**
   * Add an item to the sync queue
   */
  async addToSyncQueue(
    entityId: string,
    entityType: EntityType,
    operation: OperationType,
    data: any,
    priority: SyncPriority = SyncPriority.MEDIUM
  ): Promise<void> {
    await database.write(async () => {
      await this.syncQueue.create(item => {
        item.entityId = entityId;
        item.entityType = entityType;
        item.operation = operation;
        item.data = JSON.stringify(data);
        item.priority = priority;
        item.attempts = 0;
        item.createdAt = new Date();
      });
    });

    // Try to sync immediately if online
    this.checkAndSync();
  }

  /**
   * Sync data with the server
   */
  async sync(): Promise<void> {
    if (this.isSyncing) {
      return;
    }

    try {
      this.isSyncing = true;

      // Get items from sync queue ordered by priority
      const queueItems = await this.syncQueue.query(
        Q.sortBy('priority', Q.asc),
        Q.where('attempts', Q.lt(this.maxRetries))
      ).fetch();

      if (queueItems.length === 0) {
        return;
      }

      // Get auth token
      const token = await authService.getToken();
      if (!token) {
        console.log('No auth token available for sync');
        return;
      }

      // Process each item in the queue
      for (const item of queueItems) {
        try {
          const { entityId, entityType, operation, data } = item;
          const parsedData = JSON.parse(data);

          // Create appropriate endpoint based on entity type and operation
          let endpoint = `${API_BASE_URL}/${this.getEndpoint(entityType, operation)}`;
          
          // Make API request based on operation type
          let response;
          switch (operation) {
            case OperationType.CREATE:
              response = await axios.post(endpoint, parsedData, {
                headers: { Authorization: `Bearer ${token}` }
              });
              break;
            case OperationType.UPDATE:
              response = await axios.put(`${endpoint}/${entityId}`, parsedData, {
                headers: { Authorization: `Bearer ${token}` }
              });
              break;
            case OperationType.DELETE:
              response = await axios.delete(`${endpoint}/${entityId}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              break;
          }

          if (response && response.data.success) {
            // If successful, remove item from queue
            await database.write(async () => {
              await item.destroyPermanently();
            });

            // Update the synced status of the entity if needed
            await this.updateSyncedStatus(entityId, entityType, true);
          } else {
            // If failed, increment attempts and set error
            await database.write(async () => {
              await item.update(queueItem => {
                queueItem.attempts += 1;
                queueItem.lastAttemptAt = new Date();
                queueItem.error = response ? JSON.stringify(response.data.error) : 'Unknown error';
              });
            });
          }
        } catch (error) {
          // Handle error for this specific item
          await database.write(async () => {
            await item.update(queueItem => {
              queueItem.attempts += 1;
              queueItem.lastAttemptAt = new Date();
              queueItem.error = error.message || 'Unknown error';
            });
          });
        }
      }
    } catch (error) {
      console.error('Sync error:', error);
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Get API endpoint based on entity type and operation
   */
  private getEndpoint(entityType: EntityType, operation: OperationType): string {
    switch (entityType) {
      case EntityType.PICKUP_REQUEST:
        return 'pickups';
      case EntityType.PICKUP_ASSIGNMENT:
        return 'pickups/assignments';
      case EntityType.PICKUP_ITEM:
        return 'pickups/items';
      case EntityType.ITEM_PHOTO:
        return 'uploads/photos';
      case EntityType.SIGNATURE:
        return 'uploads/signatures';
      case EntityType.GPS_TRACKING:
        return 'tracking/gps';
      default:
        throw new Error(`Unknown entity type: ${entityType}`);
    }
  }

  /**
   * Update the synced status of an entity
   */
  private async updateSyncedStatus(entityId: string, entityType: EntityType, isSynced: boolean): Promise<void> {
    try {
      await database.write(async () => {
        let collection;
        switch (entityType) {
          case EntityType.PICKUP_REQUEST:
            collection = database.collections.get('pickup_requests');
            break;
          case EntityType.PICKUP_ASSIGNMENT:
            collection = database.collections.get('pickup_assignments');
            break;
          case EntityType.PICKUP_ITEM:
            collection = database.collections.get('pickup_items');
            break;
          case EntityType.ITEM_PHOTO:
            collection = database.collections.get('item_photos');
            break;
          case EntityType.SIGNATURE:
            collection = database.collections.get('signatures');
            break;
          case EntityType.GPS_TRACKING:
            collection = database.collections.get('gps_tracking');
            break;
          default:
            return;
        }

        const entity = await collection.find(entityId);
        await entity.update(item => {
          item.isSynced = isSynced;
          if (isSynced) {
            item.syncError = null;
          }
        });
      });
    } catch (error) {
      console.error(`Error updating sync status for ${entityType} ${entityId}:`, error);
    }
  }

  /**
   * Pull data from server to update local database
   */
  async pullData(): Promise<void> {
    try {
      const token = await authService.getToken();
      if (!token) {
        console.log('No auth token available for pull data');
        return;
      }

      // Get last sync timestamp
      const user = await database.collections.get('users').query().fetch();
      const lastSyncAt = user.length > 0 ? user[0].lastSyncAt.getTime() : 0;

      // Pull data from server
      const response = await axios.get(`${API_BASE_URL}/sync/pull?lastSyncAt=${lastSyncAt}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        const { data } = response.data;
        
        // Process received data and update local database
        await database.write(async () => {
          // Process pickup requests
          if (data.pickupRequests) {
            await this.processPickupRequests(data.pickupRequests);
          }
          
          // Process pickup assignments
          if (data.pickupAssignments) {
            await this.processPickupAssignments(data.pickupAssignments);
          }
          
          // Process pickup items
          if (data.pickupItems) {
            await this.processPickupItems(data.pickupItems);
          }
          
          // Update last sync timestamp
          if (user.length > 0) {
            await user[0].update(u => {
              u.lastSyncAt = new Date();
            });
          }
        });
      }
    } catch (error) {
      console.error('Pull data error:', error);
    }
  }

  /**
   * Process pickup requests from server
   */
  private async processPickupRequests(pickupRequests: any[]): Promise<void> {
    const collection = database.collections.get('pickup_requests');
    
    for (const request of pickupRequests) {
      try {
        const existingRequest = await collection.find(request.id).catch(() => null);
        
        if (existingRequest) {
          // Update existing request
          await existingRequest.update(item => {
            Object.assign(item, this.mapPickupRequestFromServer(request));
          });
        } else {
          // Create new request
          await collection.create(item => {
            item._raw.id = request.id;
            Object.assign(item, this.mapPickupRequestFromServer(request));
          });
        }
      } catch (error) {
        console.error(`Error processing pickup request ${request.id}:`, error);
      }
    }
  }

  /**
   * Process pickup assignments from server
   */
  private async processPickupAssignments(pickupAssignments: any[]): Promise<void> {
    const collection = database.collections.get('pickup_assignments');
    
    for (const assignment of pickupAssignments) {
      try {
        const existingAssignment = await collection.find(assignment.id).catch(() => null);
        
        if (existingAssignment) {
          // Update existing assignment
          await existingAssignment.update(item => {
            Object.assign(item, this.mapPickupAssignmentFromServer(assignment));
          });
        } else {
          // Create new assignment
          await collection.create(item => {
            item._raw.id = assignment.id;
            Object.assign(item, this.mapPickupAssignmentFromServer(assignment));
          });
        }
      } catch (error) {
        console.error(`Error processing pickup assignment ${assignment.id}:`, error);
      }
    }
  }

  /**
   * Process pickup items from server
   */
  private async processPickupItems(pickupItems: any[]): Promise<void> {
    const collection = database.collections.get('pickup_items');
    
    for (const item of pickupItems) {
      try {
        const existingItem = await collection.find(item.id).catch(() => null);
        
        if (existingItem) {
          // Update existing item
          await existingItem.update(dbItem => {
            Object.assign(dbItem, this.mapPickupItemFromServer(item));
          });
        } else {
          // Create new item
          await collection.create(dbItem => {
            dbItem._raw.id = item.id;
            Object.assign(dbItem, this.mapPickupItemFromServer(item));
          });
        }
      } catch (error) {
        console.error(`Error processing pickup item ${item.id}:`, error);
      }
    }
  }

  /**
   * Map pickup request from server format to database format
   */
  private mapPickupRequestFromServer(request: any): any {
    return {
      requestCode: request.requestCode,
      customerId: request.customer.id,
      branchId: request.branch.id,
      contactName: request.contactName,
      contactPhone: request.contactPhone,
      address: request.pickupAddress.street,
      city: request.pickupAddress.city,
      district: request.pickupAddress.district,
      province: request.pickupAddress.province,
      postalCode: request.pickupAddress.postalCode,
      latitude: request.pickupAddress.location?.coordinates[1] || 0,
      longitude: request.pickupAddress.location?.coordinates[0] || 0,
      requestDate: new Date(request.requestDate),
      scheduledDate: new Date(request.scheduledDate),
      scheduledTimeStart: request.scheduledTimeWindow?.start || '08:00',
      scheduledTimeEnd: request.scheduledTimeWindow?.end || '17:00',
      estimatedItems: request.estimatedItems || 0,
      estimatedWeight: request.estimatedWeight || 0,
      notes: request.notes || '',
      status: request.status,
      assignmentId: request.assignment || null,
      createdAt: new Date(request.createdAt),
      updatedAt: new Date(request.updatedAt),
      isSynced: true,
      syncError: null,
    };
  }

  /**
   * Map pickup assignment from server format to database format
   */
  private mapPickupAssignmentFromServer(assignment: any): any {
    return {
      assignmentCode: assignment.assignmentCode,
      branchId: assignment.branch.id,
      vehicleId: assignment.vehicle.id,
      driverId: assignment.driver.id,
      helperId: assignment.helper?.id || null,
      assignmentDate: new Date(assignment.assignmentDate),
      startTime: assignment.startTime ? new Date(assignment.startTime) : null,
      endTime: assignment.endTime ? new Date(assignment.endTime) : null,
      status: assignment.status,
      notes: assignment.notes || '',
      totalDistance: assignment.route?.totalDistance || 0,
      estimatedDuration: assignment.route?.estimatedDuration || 0,
      createdAt: new Date(assignment.createdAt),
      updatedAt: new Date(assignment.updatedAt),
      isSynced: true,
      syncError: null,
    };
  }

  /**
   * Map pickup item from server format to database format
   */
  private mapPickupItemFromServer(item: any): any {
    return {
      pickupRequestId: item.pickupRequest,
      description: item.description,
      quantity: item.quantity,
      weight: item.weight,
      length: item.dimensions?.length || 0,
      width: item.dimensions?.width || 0,
      height: item.dimensions?.height || 0,
      volumetricWeight: (item.dimensions?.length * item.dimensions?.width * item.dimensions?.height) / 6000 || 0,
      status: item.status,
      notes: item.notes || '',
      createdAt: new Date(item.createdAt),
      updatedAt: new Date(item.updatedAt),
      isSynced: true,
      syncError: null,
    };
  }
}

export default new SyncService();
