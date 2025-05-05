/**
 * PickupAssignment model for WatermelonDB
 */
import { Model, Q } from '@watermelondb/core';
import { field, date, readonly, lazy } from '@watermelondb/decorators';

export default class PickupAssignment extends Model {
  static table = 'pickup_assignments';

  @field('assignment_code') assignmentCode!: string;
  @field('branch_id') branchId!: string;
  @field('vehicle_id') vehicleId!: string;
  @field('driver_id') driverId!: string;
  @field('helper_id') helperId?: string;
  @date('assignment_date') assignmentDate!: Date;
  @date('start_time') startTime?: Date;
  @date('end_time') endTime?: Date;
  @field('status') status!: string;
  @field('notes') notes?: string;
  @field('total_distance') totalDistance?: number;
  @field('estimated_duration') estimatedDuration?: number;
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;
  @field('is_synced') isSynced!: boolean;
  @field('sync_error') syncError?: string;

  @lazy
  pickupRequests = this.collections
    .get('pickup_requests')
    .query(Q.where('assignment_id', this.id));

  @lazy
  gpsTrackings = this.collections
    .get('gps_tracking')
    .query(Q.where('reference_id', this.id), Q.where('reference_type', 'pickup_assignment'));

  // Helper methods
  isActive(): boolean {
    return this.status === 'in_progress';
  }

  isCompleted(): boolean {
    return this.status === 'completed';
  }

  isPending(): boolean {
    return this.status === 'pending';
  }

  getDuration(): number {
    if (this.startTime && this.endTime) {
      return this.endTime.getTime() - this.startTime.getTime();
    }
    return 0;
  }

  getFormattedDuration(): string {
    const durationMs = this.getDuration();
    if (durationMs <= 0) return '0 min';
    
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours} h ${minutes} min`;
    }
    return `${minutes} min`;
  }
}
