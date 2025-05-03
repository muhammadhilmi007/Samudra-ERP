/**
 * Samudra Paket ERP - Geographic Utilities
 * Utility functions for geographic calculations
 */

/**
 * Calculate distance between two coordinates using the Haversine formula
 * @param {Object} origin - Origin coordinates {latitude, longitude}
 * @param {Object} destination - Destination coordinates {latitude, longitude}
 * @returns {number} Distance in kilometers
 */
const calculateDistance = (origin, destination) => {
  // Earth's radius in kilometers
  const earthRadius = 6371;

  // Convert latitude and longitude from degrees to radians
  const latOrigin = toRadians(origin.latitude);
  const latDestination = toRadians(destination.latitude);
  const latDelta = toRadians(destination.latitude - origin.latitude);
  const lngDelta = toRadians(destination.longitude - origin.longitude);

  // Haversine formula
  const a = Math.sin(latDelta / 2) * Math.sin(latDelta / 2) +
            Math.cos(latOrigin) * Math.cos(latDestination) *
            Math.sin(lngDelta / 2) * Math.sin(lngDelta / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = earthRadius * c;

  // Round to 2 decimal places
  return Math.round(distance * 100) / 100;
};

/**
 * Convert degrees to radians
 * @param {number} degrees - Angle in degrees
 * @returns {number} Angle in radians
 */
const toRadians = (degrees) => {
  return degrees * (Math.PI / 180);
};

/**
 * Calculate the center point of multiple coordinates
 * @param {Array} coordinates - Array of coordinates [{latitude, longitude}, ...]
 * @returns {Object} Center coordinates {latitude, longitude}
 */
const calculateCenter = (coordinates) => {
  if (!coordinates || coordinates.length === 0) {
    return null;
  }

  // If only one coordinate, return it
  if (coordinates.length === 1) {
    return { ...coordinates[0] };
  }

  let x = 0;
  let y = 0;
  let z = 0;

  // Convert each coordinate to Cartesian coordinates
  coordinates.forEach((coord) => {
    const lat = toRadians(coord.latitude);
    const lng = toRadians(coord.longitude);

    x += Math.cos(lat) * Math.cos(lng);
    y += Math.cos(lat) * Math.sin(lng);
    z += Math.sin(lat);
  });

  // Calculate average
  x /= coordinates.length;
  y /= coordinates.length;
  z /= coordinates.length;

  // Convert back to latitude and longitude
  const lng = Math.atan2(y, x);
  const hyp = Math.sqrt(x * x + y * y);
  const lat = Math.atan2(z, hyp);

  // Convert to degrees
  const latitude = lat * (180 / Math.PI);
  const longitude = lng * (180 / Math.PI);

  return { latitude, longitude };
};

/**
 * Check if a coordinate is within a radius of another coordinate
 * @param {Object} center - Center coordinates {latitude, longitude}
 * @param {Object} point - Point coordinates {latitude, longitude}
 * @param {number} radius - Radius in kilometers
 * @returns {boolean} True if the point is within the radius
 */
const isWithinRadius = (center, point, radius) => {
  const distance = calculateDistance(center, point);
  return distance <= radius;
};

/**
 * Convert coordinates from [longitude, latitude] format to {latitude, longitude} format
 * @param {Array} coordinates - Coordinates in [longitude, latitude] format
 * @returns {Object} Coordinates in {latitude, longitude} format
 */
const formatCoordinates = (coordinates) => {
  if (!coordinates || coordinates.length !== 2) {
    return null;
  }

  return {
    latitude: coordinates[1],
    longitude: coordinates[0],
  };
};

/**
 * Calculate the bounding box for a coordinate and radius
 * @param {Object} center - Center coordinates {latitude, longitude}
 * @param {number} radius - Radius in kilometers
 * @returns {Object} Bounding box {minLat, maxLat, minLng, maxLng}
 */
const calculateBoundingBox = (center, radius) => {
  // Earth's radius in kilometers
  const earthRadius = 6371;

  // Convert latitude and longitude from degrees to radians
  const lat = toRadians(center.latitude);
  const lng = toRadians(center.longitude);

  // Angular distance in radians
  const angularDistance = radius / earthRadius;

  // Calculate min and max latitudes
  let minLat = lat - angularDistance;
  let maxLat = lat + angularDistance;

  // Calculate min and max longitudes
  let minLng, maxLng;
  if (minLat > -Math.PI / 2 && maxLat < Math.PI / 2) {
    const deltaLng = Math.asin(Math.sin(angularDistance) / Math.cos(lat));
    minLng = lng - deltaLng;
    maxLng = lng + deltaLng;

    if (minLng < -Math.PI) minLng += 2 * Math.PI;
    if (maxLng > Math.PI) maxLng -= 2 * Math.PI;
  } else {
    // Near the poles
    minLat = Math.max(minLat, -Math.PI / 2);
    maxLat = Math.min(maxLat, Math.PI / 2);
    minLng = -Math.PI;
    maxLng = Math.PI;
  }

  // Convert back to degrees
  return {
    minLat: minLat * (180 / Math.PI),
    maxLat: maxLat * (180 / Math.PI),
    minLng: minLng * (180 / Math.PI),
    maxLng: maxLng * (180 / Math.PI),
  };
};

module.exports = {
  calculateDistance,
  toRadians,
  calculateCenter,
  isWithinRadius,
  formatCoordinates,
  calculateBoundingBox,
};
