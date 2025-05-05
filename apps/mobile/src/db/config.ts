/**
 * WatermelonDB configuration for offline storage
 */
import { Database } from '@watermelondb/core';
import SQLiteAdapter from '@watermelondb/adapter/sqlite';
import { schema } from './schema';
import { modelClasses } from './models';

// Create the SQLite adapter
const adapter = new SQLiteAdapter({
  schema,
  // Optional database name
  dbName: 'samudrapaket',
  // Optional migrations
  migrations: [],
  // Optional synchronization settings
  jsi: true, // enable JSI for better performance
  onSetUpError: error => {
    console.error('WatermelonDB setup error:', error);
  }
});

// Create the database
export const database = new Database({
  adapter,
  modelClasses,
  actionsEnabled: true,
});

export default database;
