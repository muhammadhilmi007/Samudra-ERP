/**
 * PickupItem model for WatermelonDB
 */
import { Model, Q } from '@watermelondb/core';
import { field, date, readonly, relation, lazy } from '@watermelondb/decorators';
import { Associations } from '@watermelondb/model';

export default class PickupItem extends Model {
  static table = 'pickup_items';
  
  static associations: Associations = {
    pickup_requests: { type: 'belongs_to', key: 'pickup_request_id' },
    item_photos: { type: 'has_many', foreignKey: 'item_id' },
  };

  @field('pickup_request_id') pickupRequestId!: string;
  @field('description') description!: string;
  @field('quantity') quantity!: number;
  @field('weight') weight!: number;
  @field('length') length!: number;
  @field('width') width!: number;
  @field('height') height!: number;
  @field('volumetric_weight') volumetricWeight!: number;
  @field('status') status!: string;
  @field('notes') notes?: string;
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;
  @field('is_synced') isSynced!: boolean;
  @field('sync_error') syncError?: string;

  @relation('pickup_requests', 'pickup_request_id') pickupRequest: any;

  @lazy
  photos = this.collections
    .get('item_photos')
    .query(Q.where('item_id', this.id));

  @lazy
  signatures = this.collections
    .get('signatures')
    .query(Q.where('reference_id', this.id), Q.where('reference_type', 'pickup_item'));

  // Helper methods
  calculateVolumetricWeight(): number {
    // Standard volumetric weight formula: (L x W x H) / 6000
    return (this.length * this.width * this.height) / 6000;
  }

  updateVolumetricWeight(): void {
    this.prepareUpdate(item => {
      item.volumetricWeight = this.calculateVolumetricWeight();
    });
  }

  getEffectiveWeight(): number {
    // Return the greater of actual weight or volumetric weight
    return Math.max(this.weight, this.volumetricWeight);
  }

  getDimensions(): string {
    return `${this.length} x ${this.width} x ${this.height} cm`;
  }
}
