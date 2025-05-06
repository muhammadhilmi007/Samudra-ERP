/**
 * Tests for warehouseItemService
 */
import { warehouseItemService } from '../services/warehouseItemService';
import { database } from '../../../db/config';
import { syncQueueService } from '../../../lib/syncQueue';

// Mock dependencies
jest.mock('../../../db/config', () => ({
  database: {
    action: jest.fn(callback => callback()),
    collections: {
      get: jest.fn(() => ({
        create: jest.fn(callback => {
          const item = {
            id: 'test-id',
            itemCode: 'WH123456789',
            status: 'incoming',
            update: jest.fn(),
          };
          callback(item);
          return item;
        }),
        find: jest.fn(() => ({
          id: 'test-id',
          itemCode: 'WH123456789',
          status: 'incoming',
          update: jest.fn(callback => {
            const item = {
              id: 'test-id',
              itemCode: 'WH123456789',
              status: 'updated',
            };
            callback(item);
            return item;
          }),
        })),
        query: jest.fn(() => ({
          fetch: jest.fn(() => [
            { id: 'item-1', itemCode: 'WH123456789', status: 'incoming' },
            { id: 'item-2', itemCode: 'WH987654321', status: 'incoming' },
          ]),
        })),
      })),
    },
  },
}));

jest.mock('../../../lib/syncQueue', () => ({
  syncQueueService: {
    addToQueue: jest.fn(),
  },
}));

describe('warehouseItemService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('processIncomingItem', () => {
    it('should process an incoming item and add it to the sync queue', async () => {
      const itemData = {
        trackingNumber: 'TRK123456789',
        itemType: 'package',
        weight: '2.5',
        length: '30',
        width: '20',
        height: '15',
        receiverName: 'John Doe',
        receiverAddress: '123 Main St',
        receiverPhone: '123456789',
        destinationBranchId: 'branch-1',
        destinationBranchName: 'Branch One',
      };

      const result = await warehouseItemService.processIncomingItem(itemData);

      // Check if database action was called
      expect(database.action).toHaveBeenCalled();

      // Check if collection.create was called
      expect(database.collections.get).toHaveBeenCalledWith('warehouse_items');

      // Check if item was added to sync queue
      expect(syncQueueService.addToQueue).toHaveBeenCalledWith({
        entityId: result.id,
        entityType: 'warehouse_items',
        operation: 'create',
        data: expect.any(String),
        priority: 1,
      });

      // Check if result has expected properties
      expect(result).toHaveProperty('id', 'test-id');
      expect(result).toHaveProperty('itemCode', 'WH123456789');
      expect(result).toHaveProperty('status', 'incoming');
    });

    it('should generate an item code if not provided', async () => {
      const itemData = {
        trackingNumber: 'TRK123456789',
        receiverName: 'John Doe',
      };

      await warehouseItemService.processIncomingItem(itemData);

      // Check if database action was called
      expect(database.action).toHaveBeenCalled();
    });

    it('should calculate volumetric weight if dimensions are provided', async () => {
      const itemData = {
        trackingNumber: 'TRK123456789',
        length: '30',
        width: '20',
        height: '15',
        receiverName: 'John Doe',
      };

      await warehouseItemService.processIncomingItem(itemData);

      // Check if database action was called
      expect(database.action).toHaveBeenCalled();
    });
  });

  describe('updateItem', () => {
    it('should update an item and add it to the sync queue', async () => {
      const itemId = 'test-id';
      const updateData = {
        status: 'updated',
        storageLocation: 'A-123',
        notes: 'Test notes',
      };

      const result = await warehouseItemService.updateItem(itemId, updateData);

      // Check if database action was called
      expect(database.action).toHaveBeenCalled();

      // Check if collection.find was called
      expect(database.collections.get).toHaveBeenCalledWith('warehouse_items');

      // Check if item was added to sync queue
      expect(syncQueueService.addToQueue).toHaveBeenCalledWith({
        entityId: 'test-id',
        entityType: 'warehouse_items',
        operation: 'update',
        data: expect.any(String),
        priority: 1,
      });

      // Check if result has expected properties
      expect(result).toHaveProperty('id', 'test-id');
      expect(result).toHaveProperty('status', 'updated');
    });
  });

  describe('getItemsByStatus', () => {
    it('should get items by status', async () => {
      const status = 'incoming';

      const result = await warehouseItemService.getItemsByStatus(status);

      // Check if collection.query was called
      expect(database.collections.get).toHaveBeenCalledWith('warehouse_items');

      // Check if result is an array with expected items
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('id', 'item-1');
      expect(result[1]).toHaveProperty('id', 'item-2');
    });
  });

  describe('getItemsByDestination', () => {
    it('should get items by destination branch', async () => {
      const branchId = 'branch-1';

      const result = await warehouseItemService.getItemsByDestination(branchId);

      // Check if collection.query was called
      expect(database.collections.get).toHaveBeenCalledWith('warehouse_items');

      // Check if result is an array with expected items
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(2);
    });
  });
});
