import { Model } from '@nozbe/watermelondb';
import { field, date, readonly, text, relation } from '@nozbe/watermelondb/decorators';

export default class ItemBatch extends Model {
  static table = 'item_batches';

  static associations = {
    warehouse_items: { type: 'belongs_to', key: 'warehouse_item_id' },
  };

  @text('batch_code') batchCode;
  @text('warehouse_item_id') warehouseItemId;
  @text('batch_type') batchType; // incoming, outgoing
  @text('status') status; // pending, processed, cancelled
  @text('processed_by') processedBy;
  @text('location') location;
  @text('notes') notes;
  @readonly @date('created_at') createdAt;
  @readonly @date('updated_at') updatedAt;
  @readonly @text('sync_status') syncStatus; // pending, synced, failed

  @relation('warehouse_items', 'warehouse_item_id') warehouseItem;

  // Generate a new unique batch code
  generateBatchCode() {
    const prefix = 'BATCH';
    const timestamp = new Date().getTime().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}${timestamp}${random}`;
  }
}
