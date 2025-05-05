/**
 * User model for WatermelonDB
 */
import { Model } from '@watermelondb/core';
import { field, date } from '@watermelondb/decorators';

export default class User extends Model {
  static table = 'users';

  @field('user_id') userId!: string;
  @field('username') username!: string;
  @field('name') name!: string;
  @field('email') email!: string;
  @field('role') role!: string;
  @field('branch') branch!: string;
  @date('last_sync_at') lastSyncAt!: Date;
}
