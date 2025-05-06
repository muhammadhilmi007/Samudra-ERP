import { Model } from '@nozbe/watermelondb';
import { field, date, readonly, text, relation } from '@nozbe/watermelondb/decorators';

export default class ItemAllocation extends Model {
  static table = 'item_allocations';

  static associations = {
    warehouse_items: { type: 'belongs_to', key: 'warehouse_item_id' },
  };

  @text('warehouse_item_id') warehouseItemId;
  @text('allocation_type') allocationType; // shipment, delivery_route
  @text('allocation_id') allocationId;
  @text('allocation_name') allocationName;
  @text('status') status; // pending, confirmed, cancelled
  @text('allocated_by') allocatedBy;
  @text('notes') notes;
  @readonly @date('created_at') createdAt;
  @readonly @date('updated_at') updatedAt;
  @readonly @text('sync_status') syncStatus; // pending, synced, failed

  @relation('warehouse_items', 'warehouse_item_id') warehouseItem;
}
