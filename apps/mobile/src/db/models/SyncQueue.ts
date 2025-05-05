/**
 * SyncQueue model for WatermelonDB
 * Used for tracking changes that need to be synchronized with the server
 */
import { Model } from '@watermelondb/core';
import { field, date, readonly } from '@watermelondb/decorators';

export default class SyncQueue extends Model {
  static table = 'sync_queue';

  @field('entity_id') entityId!: string;
  @field('entity_type') entityType!: string;
  @field('operation') operation!: string; // create, update, delete
  @field('data') data!: string; // JSON stringified data
  @field('priority') priority!: number;
  @field('attempts') attempts!: number;
  @date('last_attempt_at') lastAttemptAt?: Date;
  @field('error') error?: string;
  @readonly @date('created_at') createdAt!: Date;

  // Helper methods
  getData(): any {
    try {
      return JSON.parse(this.data);
    } catch (error) {
      console.error('Error parsing sync queue data:', error);
      return {};
    }
  }

  incrementAttempts(): void {
    this.prepareUpdate(item => {
      item.attempts += 1;
      item.lastAttemptAt = new Date();
    });
  }

  setError(errorMessage: string): void {
    this.prepareUpdate(item => {
      item.error = errorMessage;
    });
  }

  clearError(): void {
    this.prepareUpdate(item => {
      item.error = undefined;
    });
  }
}
