/**
 * Samudra Paket ERP - Integration Tests
 * Mobile App Synchronization Tests
 */

import { syncQueueService } from '../../src/lib/syncQueue';
import { database } from '../../src/db/config';
import { authService } from '../../src/services/authService';
import { networkService } from '../../src/services/networkService';
import { warehouseItemService } from '../../src/features/checker/services/warehouseItemService';
import { itemAllocationService } from '../../src/features/checker/services/itemAllocationService';
import { loadingManagementService } from '../../src/features/checker/services/loadingManagementService';

// Mock fetch for API calls
global.fetch = jest.fn();

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

// Mock database
jest.mock('../../src/db/config', () => ({
  database: {
    action: jest.fn(callback => callback()),
    collections: {
      get: jest.fn(() => ({
        query: jest.fn(() => ({
          fetch: jest.fn(),
        })),
        create: jest.fn(),
        find: jest.fn(),
      })),
    },
    write: jest.fn(async callback => await callback()),
    read: jest.fn(async callback => await callback()),
  },
}));

// Mock network service
jest.mock('../../src/services/networkService', () => ({
  networkService: {
    isConnected: jest.fn(),
    addConnectionChangeListener: jest.fn(),
    removeConnectionChangeListener: jest.fn(),
  },
}));

// Mock auth service
jest.mock('../../src/services/authService', () => ({
  authService: {
    getToken: jest.fn(),
    refreshToken: jest.fn(),
    isAuthenticated: jest.fn(),
  },
}));

describe('Mobile App Synchronization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mocks
    fetch.mockClear();
    networkService.isConnected.mockReturnValue(true);
    authService.getToken.mockResolvedValue('valid-token');
    authService.isAuthenticated.mockResolvedValue(true);
  });
  
  describe('Sync Queue Service', () => {
    it('should add items to the queue when offline', async () => {
      // Mock offline state
      networkService.isConnected.mockReturnValue(false);
      
      // Mock database operations
      const mockCreate = jest.fn();
      database.collections.get.mockReturnValue({
        create: mockCreate,
      });
      
      // Create a sync operation
      const syncOperation = {
        endpoint: '/api/warehouse-items',
        method: 'POST',
        data: { itemCode: 'WH123456789', status: 'incoming' },
        entityType: 'warehouseItem',
        entityId: 'local-id-123',
        timestamp: Date.now(),
      };
      
      // Add to queue
      await syncQueueService.addToQueue(syncOperation);
      
      // Verify it was added to the database
      expect(mockCreate).toHaveBeenCalledWith(expect.any(Function));
      expect(database.action).toHaveBeenCalled();
    });
    
    it('should process queue items when coming online', async () => {
      // Mock successful API response
      fetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({ success: true, data: { id: 'server-id-123' } }),
      });
      
      // Mock queue items in database
      const mockQueueItems = [
        {
          id: 'queue-1',
          endpoint: '/api/warehouse-items',
          method: 'POST',
          data: { itemCode: 'WH123456789', status: 'incoming' },
          entityType: 'warehouseItem',
          entityId: 'local-id-123',
          timestamp: Date.now() - 1000,
          markAsProcessed: jest.fn(),
        },
      ];
      
      // Mock database query to return queue items
      database.collections.get.mockReturnValue({
        query: jest.fn(() => ({
          fetch: jest.fn(() => mockQueueItems),
        })),
      });
      
      // Mock entity update
      const mockFind = jest.fn(() => ({
        update: jest.fn(),
      }));
      database.collections.get.mockReturnValueOnce({
        query: jest.fn(() => ({
          fetch: jest.fn(() => mockQueueItems),
        })),
      }).mockReturnValueOnce({
        find: mockFind,
      });
      
      // Process the queue
      await syncQueueService.processQueue();
      
      // Verify API call was made
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/warehouse-items'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer valid-token',
          }),
          body: expect.any(String),
        })
      );
      
      // Verify queue item was marked as processed
      expect(mockQueueItems[0].markAsProcessed).toHaveBeenCalled();
      
      // Verify entity was updated with server ID
      expect(mockFind).toHaveBeenCalledWith('local-id-123');
    });
    
    it('should handle API errors during synchronization', async () => {
      // Mock failed API response
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ success: false, error: { message: 'Validation error' } }),
      });
      
      // Mock queue items in database
      const mockQueueItems = [
        {
          id: 'queue-1',
          endpoint: '/api/warehouse-items',
          method: 'POST',
          data: { itemCode: 'WH123456789', status: 'incoming' },
          entityType: 'warehouseItem',
          entityId: 'local-id-123',
          timestamp: Date.now() - 1000,
          markAsError: jest.fn(),
          update: jest.fn(),
        },
      ];
      
      // Mock database query to return queue items
      database.collections.get.mockReturnValue({
        query: jest.fn(() => ({
          fetch: jest.fn(() => mockQueueItems),
        })),
      });
      
      // Process the queue
      await syncQueueService.processQueue();
      
      // Verify API call was made
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/warehouse-items'),
        expect.any(Object)
      );
      
      // Verify queue item was marked with error
      expect(mockQueueItems[0].markAsError).toHaveBeenCalled();
      expect(mockQueueItems[0].update).toHaveBeenCalledWith(expect.objectContaining({
        errorMessage: 'Validation error',
        retryCount: 1,
      }));
    });
  });
  
  describe('Warehouse Operations Synchronization', () => {
    it('should synchronize warehouse items between mobile and server', async () => {
      // Mock successful API responses
      fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ 
          success: true, 
          data: [
            { id: 'server-id-1', itemCode: 'WH123456789', status: 'incoming', updatedAt: '2025-05-01T10:00:00Z' },
            { id: 'server-id-2', itemCode: 'WH987654321', status: 'allocated', updatedAt: '2025-05-02T10:00:00Z' },
          ] 
        }),
      });
      
      // Mock local database items
      const mockLocalItems = [
        { id: 'local-id-1', itemCode: 'WH123456789', status: 'incoming', updatedAt: '2025-04-30T10:00:00Z', update: jest.fn() },
        { id: 'local-id-3', itemCode: 'WH555555555', status: 'incoming', updatedAt: '2025-05-03T10:00:00Z', update: jest.fn() },
      ];
      
      // Mock database operations
      const mockCreate = jest.fn();
      database.collections.get.mockReturnValue({
        query: jest.fn(() => ({
          fetch: jest.fn(() => mockLocalItems),
        })),
        create: mockCreate,
      });
      
      // Perform full sync
      await warehouseItemService.synchronize();
      
      // Verify API call was made
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/warehouse-items'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': 'Bearer valid-token',
          }),
        })
      );
      
      // Verify local items were updated with server data
      expect(mockLocalItems[0].update).toHaveBeenCalledWith(expect.objectContaining({
        status: 'incoming',
        serverId: 'server-id-1',
        updatedAt: '2025-05-01T10:00:00Z',
      }));
      
      // Verify new server items were created locally
      expect(mockCreate).toHaveBeenCalledWith(expect.any(Function));
      
      // Verify local-only items were queued for sync to server
      expect(syncQueueService.addToQueue).toHaveBeenCalledWith(expect.objectContaining({
        endpoint: '/api/warehouse-items',
        method: 'POST',
        entityType: 'warehouseItem',
        entityId: 'local-id-3',
      }));
    });
    
    it('should synchronize item allocations between mobile and server', async () => {
      // Mock successful API responses
      fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ 
          success: true, 
          data: [
            { id: 'server-id-1', itemId: 'item-1', shipmentId: 'shipment-1', status: 'allocated', updatedAt: '2025-05-01T10:00:00Z' },
            { id: 'server-id-2', itemId: 'item-2', shipmentId: 'shipment-1', status: 'allocated', updatedAt: '2025-05-02T10:00:00Z' },
          ] 
        }),
      });
      
      // Mock local database items
      const mockLocalAllocations = [
        { id: 'local-id-1', itemId: 'item-1', shipmentId: 'shipment-1', status: 'allocated', updatedAt: '2025-04-30T10:00:00Z', update: jest.fn() },
        { id: 'local-id-3', itemId: 'item-3', shipmentId: 'shipment-2', status: 'allocated', updatedAt: '2025-05-03T10:00:00Z', update: jest.fn() },
      ];
      
      // Mock database operations
      const mockCreate = jest.fn();
      database.collections.get.mockReturnValue({
        query: jest.fn(() => ({
          fetch: jest.fn(() => mockLocalAllocations),
        })),
        create: mockCreate,
      });
      
      // Perform full sync
      await itemAllocationService.synchronize();
      
      // Verify API call was made
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/item-allocations'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': 'Bearer valid-token',
          }),
        })
      );
      
      // Verify local items were updated with server data
      expect(mockLocalAllocations[0].update).toHaveBeenCalledWith(expect.objectContaining({
        status: 'allocated',
        serverId: 'server-id-1',
        updatedAt: '2025-05-01T10:00:00Z',
      }));
      
      // Verify new server items were created locally
      expect(mockCreate).toHaveBeenCalledWith(expect.any(Function));
      
      // Verify local-only items were queued for sync to server
      expect(syncQueueService.addToQueue).toHaveBeenCalledWith(expect.objectContaining({
        endpoint: '/api/item-allocations',
        method: 'POST',
        entityType: 'itemAllocation',
        entityId: 'local-id-3',
      }));
    });
    
    it('should synchronize loading manifests between mobile and server', async () => {
      // Mock successful API responses
      fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ 
          success: true, 
          data: [
            { 
              id: 'server-id-1', 
              shipmentId: 'shipment-1', 
              status: 'completed', 
              updatedAt: '2025-05-01T10:00:00Z',
              items: [
                { id: 'item-1', status: 'loaded' },
                { id: 'item-2', status: 'loaded' }
              ]
            },
          ] 
        }),
      });
      
      // Mock local database items
      const mockLocalManifests = [
        { 
          id: 'local-id-1', 
          shipmentId: 'shipment-1', 
          status: 'in_progress', 
          updatedAt: '2025-04-30T10:00:00Z', 
          update: jest.fn() 
        },
        { 
          id: 'local-id-2', 
          shipmentId: 'shipment-2', 
          status: 'completed', 
          updatedAt: '2025-05-03T10:00:00Z', 
          update: jest.fn() 
        },
      ];
      
      // Mock loading items
      const mockLoadingItems = [
        { id: 'loading-item-1', manifestId: 'local-id-1', itemId: 'item-1', status: 'pending', update: jest.fn() },
        { id: 'loading-item-2', manifestId: 'local-id-1', itemId: 'item-2', status: 'loaded', update: jest.fn() },
        { id: 'loading-item-3', manifestId: 'local-id-2', itemId: 'item-3', status: 'loaded', update: jest.fn() },
      ];
      
      // Mock database operations
      const mockCreate = jest.fn();
      database.collections.get.mockReturnValueOnce({
        query: jest.fn(() => ({
          fetch: jest.fn(() => mockLocalManifests),
        })),
        create: mockCreate,
      }).mockReturnValueOnce({
        query: jest.fn(() => ({
          fetch: jest.fn(() => mockLoadingItems),
        })),
      });
      
      // Perform full sync
      await loadingManagementService.synchronize();
      
      // Verify API call was made
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/loading-manifests'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': 'Bearer valid-token',
          }),
        })
      );
      
      // Verify local manifests were updated with server data
      expect(mockLocalManifests[0].update).toHaveBeenCalledWith(expect.objectContaining({
        status: 'completed',
        serverId: 'server-id-1',
        updatedAt: '2025-05-01T10:00:00Z',
      }));
      
      // Verify loading items were updated
      expect(mockLoadingItems[0].update).toHaveBeenCalledWith(expect.objectContaining({
        status: 'loaded',
      }));
      
      // Verify local-only manifests were queued for sync to server
      expect(syncQueueService.addToQueue).toHaveBeenCalledWith(expect.objectContaining({
        endpoint: '/api/loading-manifests',
        method: 'POST',
        entityType: 'loadingManifest',
        entityId: 'local-id-2',
      }));
    });
  });
  
  describe('Conflict Resolution', () => {
    it('should resolve conflicts using server-wins strategy', async () => {
      // Mock successful API responses
      fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ 
          success: true, 
          data: [
            { id: 'server-id-1', itemCode: 'WH123456789', status: 'allocated', updatedAt: '2025-05-01T10:00:00Z' },
          ] 
        }),
      });
      
      // Mock local database items with conflict (same item, different status)
      const mockLocalItems = [
        { 
          id: 'local-id-1', 
          serverId: 'server-id-1',
          itemCode: 'WH123456789', 
          status: 'incoming', 
          updatedAt: '2025-04-30T10:00:00Z', 
          update: jest.fn() 
        },
      ];
      
      // Mock database operations
      database.collections.get.mockReturnValue({
        query: jest.fn(() => ({
          fetch: jest.fn(() => mockLocalItems),
        })),
      });
      
      // Perform full sync
      await warehouseItemService.synchronize();
      
      // Verify local item was updated with server data (server wins)
      expect(mockLocalItems[0].update).toHaveBeenCalledWith(expect.objectContaining({
        status: 'allocated',
        updatedAt: '2025-05-01T10:00:00Z',
      }));
    });
    
    it('should handle sync retries for failed operations', async () => {
      // Mock queue items with retry counts
      const mockQueueItems = [
        {
          id: 'queue-1',
          endpoint: '/api/warehouse-items',
          method: 'POST',
          data: { itemCode: 'WH123456789', status: 'incoming' },
          entityType: 'warehouseItem',
          entityId: 'local-id-123',
          timestamp: Date.now() - 1000,
          retryCount: 2,
          markAsError: jest.fn(),
          update: jest.fn(),
        },
      ];
      
      // Mock database query to return queue items
      database.collections.get.mockReturnValue({
        query: jest.fn(() => ({
          fetch: jest.fn(() => mockQueueItems),
        })),
      });
      
      // Mock failed API response
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ success: false, error: { message: 'Server error' } }),
      });
      
      // Process the queue
      await syncQueueService.processQueue();
      
      // Verify retry count was incremented
      expect(mockQueueItems[0].update).toHaveBeenCalledWith(expect.objectContaining({
        retryCount: 3,
        errorMessage: 'Server error',
      }));
      
      // Verify item was not removed from queue (will be retried later)
      expect(mockQueueItems[0].markAsProcessed).not.toHaveBeenCalled();
    });
  });
});
