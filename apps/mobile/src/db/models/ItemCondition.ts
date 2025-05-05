/**
 * ItemCondition model for WatermelonDB
 * Stores condition assessment data for pickup items
 */
import { Model } from '@watermelondb/core';
import { field, date, readonly, relation } from '@watermelondb/decorators';
import { Associations } from '@watermelondb/model';

export default class ItemCondition extends Model {
  static table = 'item_conditions';
  
  static associations: Associations = {
    pickup_items: { type: 'belongs_to', key: 'item_id' },
  };

  @field('item_id') itemId!: string;
  @field('condition_rating') conditionRating!: number; // 1-5 scale
  @field('has_damage') hasDamage!: boolean;
  @field('damage_description') damageDescription?: string;
  @field('packaging_quality') packagingQuality!: string; // good, fair, poor
  @field('special_handling') specialHandling?: string;
  @field('verification_status') verificationStatus!: string; // pending, verified, rejected
  @field('verification_notes') verificationNotes?: string;
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;
  @field('is_synced') isSynced!: boolean;
  @field('sync_error') syncError?: string;

  @relation('pickup_items', 'item_id') pickupItem: any;
}
