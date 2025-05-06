import { Model } from '@nozbe/watermelondb';
import { field, date, readonly, text, relation } from '@nozbe/watermelondb/decorators';

export default class LoadingItem extends Model {
  static table = 'loading_items';

  static associations = {
    loading_manifests: { type: 'belongs_to', key: 'loading_manifest_id' },
    warehouse_items: { type: 'belongs_to', key: 'warehouse_item_id' },
  };

  @text('loading_manifest_id') loadingManifestId;
  @text('warehouse_item_id') warehouseItemId;
  @text('item_code') itemCode;
  @text('tracking_number') trackingNumber;
  @text('status') status; // pending, loaded, unloaded, cancelled
  @text('loaded_by') loadedBy;
  @text('loading_position') loadingPosition;
  @text('notes') notes;
  @date('loaded_at') loadedAt;
  @readonly @date('created_at') createdAt;
  @readonly @date('updated_at') updatedAt;
  @readonly @text('sync_status') syncStatus; // pending, synced, failed

  @relation('loading_manifests', 'loading_manifest_id') loadingManifest;
  @relation('warehouse_items', 'warehouse_item_id') warehouseItem;
}
