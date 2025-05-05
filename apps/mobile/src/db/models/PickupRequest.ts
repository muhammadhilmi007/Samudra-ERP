/**
 * PickupRequest model for WatermelonDB
 */
import { Model, Q } from '@watermelondb/core';
import { field, date, readonly, relation, children, lazy } from '@watermelondb/decorators';
import { Associations } from '@watermelondb/model';

export default class PickupRequest extends Model {
  static table = 'pickup_requests';
  
  static associations: Associations = {
    pickup_items: { type: 'has_many', foreignKey: 'pickup_request_id' },
  };

  @field('request_code') requestCode!: string;
  @field('customer_id') customerId!: string;
  @field('branch_id') branchId!: string;
  @field('contact_name') contactName!: string;
  @field('contact_phone') contactPhone!: string;
  @field('address') address!: string;
  @field('city') city!: string;
  @field('district') district!: string;
  @field('province') province!: string;
  @field('postal_code') postalCode!: string;
  @field('latitude') latitude!: number;
  @field('longitude') longitude!: number;
  @date('request_date') requestDate!: Date;
  @date('scheduled_date') scheduledDate!: Date;
  @field('scheduled_time_start') scheduledTimeStart!: string;
  @field('scheduled_time_end') scheduledTimeEnd!: string;
  @field('estimated_items') estimatedItems!: number;
  @field('estimated_weight') estimatedWeight!: number;
  @field('notes') notes!: string;
  @field('status') status!: string;
  @field('assignment_id') assignmentId?: string;
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;
  @field('is_synced') isSynced!: boolean;
  @field('sync_error') syncError?: string;

  @children('pickup_items') pickupItems: any;

  @lazy
  gpsTrackings = this.collections
    .get('gps_tracking')
    .query(Q.where('reference_id', this.id), Q.where('reference_type', 'pickup_request'));

  // Helper methods
  getFullAddress(): string {
    return `${this.address}, ${this.district}, ${this.city}, ${this.province} ${this.postalCode}`;
  }

  getScheduledTimeWindow(): string {
    return `${this.scheduledTimeStart} - ${this.scheduledTimeEnd}`;
  }

  isCompleted(): boolean {
    return this.status === 'completed';
  }

  isPending(): boolean {
    return this.status === 'pending';
  }

  isAssigned(): boolean {
    return !!this.assignmentId;
  }
}
