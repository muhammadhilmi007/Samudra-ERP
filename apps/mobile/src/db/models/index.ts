/**
 * Database models index file
 * Exports all models for WatermelonDB
 */
import User from './User';
import PickupRequest from './PickupRequest';
import PickupAssignment from './PickupAssignment';
import PickupItem from './PickupItem';
import ItemPhoto from './ItemPhoto';
import Signature from './Signature';
import GPSTracking from './GPSTracking';
import SyncQueue from './SyncQueue';
import ItemCondition from './ItemCondition';

// Export all model classes for database initialization
export const modelClasses = [
  User,
  PickupRequest,
  PickupAssignment,
  PickupItem,
  ItemPhoto,
  Signature,
  GPSTracking,
  SyncQueue,
  ItemCondition,
];

export {
  User,
  PickupRequest,
  PickupAssignment,
  PickupItem,
  ItemPhoto,
  Signature,
  GPSTracking,
  SyncQueue,
  ItemCondition,
};
