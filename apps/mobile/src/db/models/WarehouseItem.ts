import { Model } from '@nozbe/watermelondb';
import { field, date, readonly, text, relation, children } from '@nozbe/watermelondb/decorators';
import { v4 as uuidv4 } from 'uuid';

export default class WarehouseItem extends Model {
  static table = 'warehouse_items';

  static associations = {
    item_allocations: { type: 'has_many', foreignKey: 'warehouse_item_id' },
    item_batches: { type: 'has_many', foreignKey: 'warehouse_item_id' },
  };

  @text('item_code') itemCode;
  @text('tracking_number') trackingNumber;
  @text('status') status; // incoming, allocated, loaded, in_transit, delivered
  @text('source_type') sourceType; // pickup, incoming_shipment
  @text('source_id') sourceId;
  @text('item_type') itemType;
  @text('weight') weight;
  @text('length') length;
  @text('width') width;
  @text('height') height;
  @text('volumetric_weight') volumetricWeight;
  @text('storage_location') storageLocation;
  @text('notes') notes;
  @text('condition') condition; // good, damaged
  @text('damage_description') damageDescription;
  @text('receiver_name') receiverName;
  @text('receiver_address') receiverAddress;
  @text('receiver_phone') receiverPhone;
  @text('destination_branch_id') destinationBranchId;
  @text('destination_branch_name') destinationBranchName;
  @date('processed_at') processedAt;
  @date('allocated_at') allocatedAt;
  @date('loaded_at') loadedAt;
  @readonly @date('created_at') createdAt;
  @readonly @date('updated_at') updatedAt;
  @readonly @text('sync_status') syncStatus; // pending, synced, failed

  @children('item_allocations') allocations;
  @children('item_batches') batches;

  // Generate a new unique item code
  generateItemCode() {
    const prefix = 'WH';
    const timestamp = new Date().getTime().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}${timestamp}${random}`;
  }

  // Calculate volumetric weight
  calculateVolumetricWeight() {
    if (this.length && this.width && this.height) {
      // Volumetric weight formula: (L x W x H) / 5000
      return (parseFloat(this.length) * parseFloat(this.width) * parseFloat(this.height)) / 5000;
    }
    return 0;
  }
}
