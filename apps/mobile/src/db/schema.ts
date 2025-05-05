/**
 * Database schema for WatermelonDB
 * Defines tables and relationships for offline storage
 */
import { appSchema, tableSchema } from '@watermelondb/schema';

export const schema = appSchema({
  version: 1,
  tables: [
    // User table
    tableSchema({
      name: 'users',
      columns: [
        { name: 'user_id', type: 'string', isIndexed: true },
        { name: 'username', type: 'string', isIndexed: true },
        { name: 'name', type: 'string' },
        { name: 'email', type: 'string', isIndexed: true },
        { name: 'role', type: 'string' },
        { name: 'branch', type: 'string' },
        { name: 'last_sync_at', type: 'number' },
      ]
    }),
    
    // Pickup requests
    tableSchema({
      name: 'pickup_requests',
      columns: [
        { name: 'request_code', type: 'string', isIndexed: true },
        { name: 'customer_id', type: 'string', isIndexed: true },
        { name: 'branch_id', type: 'string', isIndexed: true },
        { name: 'contact_name', type: 'string' },
        { name: 'contact_phone', type: 'string' },
        { name: 'address', type: 'string' },
        { name: 'city', type: 'string' },
        { name: 'district', type: 'string' },
        { name: 'province', type: 'string' },
        { name: 'postal_code', type: 'string' },
        { name: 'latitude', type: 'number' },
        { name: 'longitude', type: 'number' },
        { name: 'request_date', type: 'number' },
        { name: 'scheduled_date', type: 'number' },
        { name: 'scheduled_time_start', type: 'string' },
        { name: 'scheduled_time_end', type: 'string' },
        { name: 'estimated_items', type: 'number' },
        { name: 'estimated_weight', type: 'number' },
        { name: 'notes', type: 'string' },
        { name: 'status', type: 'string', isIndexed: true },
        { name: 'assignment_id', type: 'string', isOptional: true, isIndexed: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
        { name: 'is_synced', type: 'boolean' },
        { name: 'sync_error', type: 'string', isOptional: true },
      ]
    }),
    
    // Pickup assignments
    tableSchema({
      name: 'pickup_assignments',
      columns: [
        { name: 'assignment_code', type: 'string', isIndexed: true },
        { name: 'branch_id', type: 'string', isIndexed: true },
        { name: 'vehicle_id', type: 'string', isIndexed: true },
        { name: 'driver_id', type: 'string', isIndexed: true },
        { name: 'helper_id', type: 'string', isOptional: true },
        { name: 'assignment_date', type: 'number' },
        { name: 'start_time', type: 'number', isOptional: true },
        { name: 'end_time', type: 'number', isOptional: true },
        { name: 'status', type: 'string', isIndexed: true },
        { name: 'notes', type: 'string', isOptional: true },
        { name: 'total_distance', type: 'number', isOptional: true },
        { name: 'estimated_duration', type: 'number', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
        { name: 'is_synced', type: 'boolean' },
        { name: 'sync_error', type: 'string', isOptional: true },
      ]
    }),
    
    // Pickup items
    tableSchema({
      name: 'pickup_items',
      columns: [
        { name: 'pickup_request_id', type: 'string', isIndexed: true },
        { name: 'description', type: 'string' },
        { name: 'quantity', type: 'number' },
        { name: 'weight', type: 'number' },
        { name: 'length', type: 'number' },
        { name: 'width', type: 'number' },
        { name: 'height', type: 'number' },
        { name: 'volumetric_weight', type: 'number' },
        { name: 'status', type: 'string' },
        { name: 'notes', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
        { name: 'is_synced', type: 'boolean' },
        { name: 'sync_error', type: 'string', isOptional: true },
      ]
    }),
    
    // Item photos
    tableSchema({
      name: 'item_photos',
      columns: [
        { name: 'item_id', type: 'string', isIndexed: true },
        { name: 'photo_uri', type: 'string' },
        { name: 'thumbnail_uri', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'is_uploaded', type: 'boolean' },
        { name: 'upload_error', type: 'string', isOptional: true },
      ]
    }),
    
    // Signatures
    tableSchema({
      name: 'signatures',
      columns: [
        { name: 'reference_id', type: 'string', isIndexed: true },
        { name: 'reference_type', type: 'string', isIndexed: true },
        { name: 'signer_name', type: 'string' },
        { name: 'signature_uri', type: 'string' },
        { name: 'created_at', type: 'number' },
        { name: 'is_uploaded', type: 'boolean' },
        { name: 'upload_error', type: 'string', isOptional: true },
      ]
    }),
    
    // GPS tracking
    tableSchema({
      name: 'gps_tracking',
      columns: [
        { name: 'reference_id', type: 'string', isIndexed: true },
        { name: 'reference_type', type: 'string', isIndexed: true },
        { name: 'latitude', type: 'number' },
        { name: 'longitude', type: 'number' },
        { name: 'accuracy', type: 'number', isOptional: true },
        { name: 'speed', type: 'number', isOptional: true },
        { name: 'address', type: 'string', isOptional: true },
        { name: 'timestamp', type: 'number' },
        { name: 'is_synced', type: 'boolean' },
      ]
    }),
    
    // Item conditions
    tableSchema({
      name: 'item_conditions',
      columns: [
        { name: 'item_id', type: 'string', isIndexed: true },
        { name: 'condition_rating', type: 'number' },
        { name: 'has_damage', type: 'boolean' },
        { name: 'damage_description', type: 'string', isOptional: true },
        { name: 'packaging_quality', type: 'string' },
        { name: 'special_handling', type: 'string', isOptional: true },
        { name: 'verification_status', type: 'string', isIndexed: true },
        { name: 'verification_notes', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
        { name: 'is_synced', type: 'boolean' },
        { name: 'sync_error', type: 'string', isOptional: true },
      ]
    }),
    
    // Sync queue
    tableSchema({
      name: 'sync_queue',
      columns: [
        { name: 'entity_id', type: 'string', isIndexed: true },
        { name: 'entity_type', type: 'string', isIndexed: true },
        { name: 'operation', type: 'string' }, // create, update, delete
        { name: 'data', type: 'string' }, // JSON stringified data
        { name: 'priority', type: 'number' },
        { name: 'attempts', type: 'number' },
        { name: 'last_attempt_at', type: 'number', isOptional: true },
        { name: 'error', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
      ]
    }),
  ]
});
