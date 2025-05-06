import { Model } from '@nozbe/watermelondb';
import { field, date, readonly, text, relation, children } from '@nozbe/watermelondb/decorators';

export default class LoadingManifest extends Model {
  static table = 'loading_manifests';

  static associations = {
    loading_items: { type: 'has_many', foreignKey: 'loading_manifest_id' },
  };

  @text('manifest_code') manifestCode;
  @text('vehicle_id') vehicleId;
  @text('vehicle_number') vehicleNumber;
  @text('driver_id') driverId;
  @text('driver_name') driverName;
  @text('destination_type') destinationType; // branch, delivery_area
  @text('destination_id') destinationId;
  @text('destination_name') destinationName;
  @text('status') status; // pending, in_progress, completed, cancelled
  @text('created_by') createdBy;
  @text('notes') notes;
  @date('scheduled_departure') scheduledDeparture;
  @date('actual_departure') actualDeparture;
  @readonly @date('created_at') createdAt;
  @readonly @date('updated_at') updatedAt;
  @readonly @text('sync_status') syncStatus; // pending, synced, failed

  @children('loading_items') loadingItems;

  // Generate a new unique manifest code
  generateManifestCode() {
    const prefix = 'LM';
    const timestamp = new Date().getTime().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}${timestamp}${random}`;
  }
}
