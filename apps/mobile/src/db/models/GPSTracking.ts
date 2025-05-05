/**
 * GPSTracking model for WatermelonDB
 */
import { Model } from '@watermelondb/core';
import { field, date, readonly } from '@watermelondb/decorators';

export default class GPSTracking extends Model {
  static table = 'gps_tracking';

  @field('reference_id') referenceId!: string;
  @field('reference_type') referenceType!: string;
  @field('latitude') latitude!: number;
  @field('longitude') longitude!: number;
  @field('accuracy') accuracy?: number;
  @field('speed') speed?: number;
  @field('address') address?: string;
  @readonly @date('timestamp') timestamp!: Date;
  @field('is_synced') isSynced!: boolean;

  // Helper methods
  getCoordinates(): [number, number] {
    return [this.latitude, this.longitude];
  }

  getFormattedSpeed(): string {
    if (!this.speed) return 'N/A';
    return `${Math.round(this.speed)} km/h`;
  }
}
