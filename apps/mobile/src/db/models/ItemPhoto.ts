/**
 * ItemPhoto model for WatermelonDB
 */
import { Model } from '@watermelondb/core';
import { field, date, readonly, relation } from '@watermelondb/decorators';
import { Associations } from '@watermelondb/model';

export default class ItemPhoto extends Model {
  static table = 'item_photos';
  
  static associations: Associations = {
    pickup_items: { type: 'belongs_to', key: 'item_id' },
  };

  @field('item_id') itemId!: string;
  @field('photo_uri') photoUri!: string;
  @field('thumbnail_uri') thumbnailUri?: string;
  @readonly @date('created_at') createdAt!: Date;
  @field('is_uploaded') isUploaded!: boolean;
  @field('upload_error') uploadError?: string;

  @relation('pickup_items', 'item_id') pickupItem: any;
}
