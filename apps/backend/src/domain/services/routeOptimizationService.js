/**
 * Samudra Paket ERP - Route Optimization Service
 * Handles route optimization for pickup assignments
 */

const axios = require('axios');
const logger = require('../../api/middleware/gateway/logger');

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {Array} coord1 - First coordinate [longitude, latitude]
 * @param {Array} coord2 - Second coordinate [longitude, latitude]
 * @returns {number} Distance in kilometers
 */
const calculateDistance = (coord1, coord2) => {
  const toRad = (value) => (value * Math.PI) / 180;
  
  const R = 6371; // Earth's radius in km
  const dLat = toRad(coord2[1] - coord1[1]);
  const dLon = toRad(coord2[0] - coord1[0]);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(coord1[1])) * Math.cos(toRad(coord2[1])) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
};

/**
 * Calculate estimated duration between two points
 * @param {number} distance - Distance in kilometers
 * @param {number} averageSpeed - Average speed in km/h
 * @returns {number} Duration in minutes
 */
const calculateDuration = (distance, averageSpeed = 30) => {
  // Convert distance / speed (hours) to minutes
  return (distance / averageSpeed) * 60;
};

/**
 * Optimize route using nearest neighbor algorithm
 * @param {Array} stops - Array of stops with coordinates
 * @param {Array} startCoord - Starting coordinates [longitude, latitude]
 * @param {Array} endCoord - Ending coordinates [longitude, latitude]
 * @returns {Object} Optimized route with sequence, distance, and duration
 */
const optimizeRouteNearestNeighbor = (stops, startCoord, endCoord) => {
  // Clone stops to avoid modifying the original array
  const unvisitedStops = [...stops];
  const route = [];
  let totalDistance = 0;
  let totalDuration = 0;
  
  // Start from the depot
  let currentCoord = startCoord;
  
  // Visit each stop using nearest neighbor algorithm
  while (unvisitedStops.length > 0) {
    // Find the nearest unvisited stop
    let minDistance = Infinity;
    let nearestIndex = -1;
    
    for (let i = 0; i < unvisitedStops.length; i++) {
      const distance = calculateDistance(currentCoord, unvisitedStops[i].coordinates);
      
      if (distance < minDistance) {
        minDistance = distance;
        nearestIndex = i;
      }
    }
    
    // Add the nearest stop to the route
    const nearestStop = unvisitedStops[nearestIndex];
    const duration = calculateDuration(minDistance);
    
    route.push({
      ...nearestStop,
      sequenceNumber: route.length + 1,
      distance: minDistance,
      duration: duration,
    });
    
    // Update total distance and duration
    totalDistance += minDistance;
    totalDuration += duration;
    
    // Update current coordinates
    currentCoord = nearestStop.coordinates;
    
    // Remove the visited stop
    unvisitedStops.splice(nearestIndex, 1);
  }
  
  // Add the distance back to the depot
  const returnDistance = calculateDistance(currentCoord, endCoord);
  const returnDuration = calculateDuration(returnDistance);
  
  totalDistance += returnDistance;
  totalDuration += returnDuration;
  
  return {
    stops: route,
    totalDistance: parseFloat(totalDistance.toFixed(2)),
    totalDuration: parseFloat(totalDuration.toFixed(2)),
  };
};

/**
 * Optimize route using Google Maps Directions API
 * @param {Array} stops - Array of stops with coordinates
 * @param {Array} startCoord - Starting coordinates [longitude, latitude]
 * @param {Array} endCoord - Ending coordinates [longitude, latitude]
 * @returns {Promise<Object>} Optimized route with sequence, distance, and duration
 */
const optimizeRouteWithGoogleMaps = async (stops, startCoord, endCoord) => {
  try {
    // Check if API key is configured
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      logger.warn('Google Maps API key not configured, falling back to nearest neighbor algorithm');
      return optimizeRouteNearestNeighbor(stops, startCoord, endCoord);
    }
    
    // Prepare waypoints for Google Maps API
    // Note: Google Maps uses lat,lng format while our coordinates are [lng,lat]
    const origin = `${startCoord[1]},${startCoord[0]}`;
    const destination = `${endCoord[1]},${endCoord[0]}`;
    
    // Format waypoints (maximum 25 waypoints for standard API)
    const waypoints = stops.map(stop => `${stop.coordinates[1]},${stop.coordinates[0]}`).join('|');
    
    // Make API request
    const response = await axios.get('https://maps.googleapis.com/maps/api/directions/json', {
      params: {
        origin,
        destination,
        waypoints: `optimize:true|${waypoints}`,
        key: apiKey,
      },
    });
    
    // Check if the request was successful
    if (response.data.status !== 'OK') {
      logger.error(`Google Maps API error: ${response.data.status}`, { error: response.data });
      return optimizeRouteNearestNeighbor(stops, startCoord, endCoord);
    }
    
    // Extract the optimized waypoint order
    const optimizedOrder = response.data.routes[0].waypoint_order;
    const legs = response.data.routes[0].legs;
    
    // Create optimized route
    const route = [];
    let totalDistance = 0;
    let totalDuration = 0;
    
    // Process each leg of the journey
    for (let i = 0; i < legs.length - 1; i++) {
      const leg = legs[i];
      const stopIndex = optimizedOrder[i];
      
      // Convert distance from meters to kilometers
      const distance = leg.distance.value / 1000;
      
      // Convert duration from seconds to minutes
      const duration = leg.duration.value / 60;
      
      route.push({
        ...stops[stopIndex],
        sequenceNumber: i + 1,
        distance: parseFloat(distance.toFixed(2)),
        duration: parseFloat(duration.toFixed(2)),
        estimatedArrival: null, // Will be calculated later
      });
      
      totalDistance += distance;
      totalDuration += duration;
    }
    
    // Add the final leg (last waypoint to destination)
    const finalLeg = legs[legs.length - 1];
    totalDistance += finalLeg.distance.value / 1000;
    totalDuration += finalLeg.duration.value / 60;
    
    return {
      stops: route,
      totalDistance: parseFloat(totalDistance.toFixed(2)),
      totalDuration: parseFloat(totalDuration.toFixed(2)),
    };
  } catch (error) {
    logger.error(`Error optimizing route with Google Maps: ${error.message}`, { error });
    
    // Fall back to nearest neighbor algorithm
    logger.info('Falling back to nearest neighbor algorithm');
    return optimizeRouteNearestNeighbor(stops, startCoord, endCoord);
  }
};

/**
 * Calculate estimated arrival times for each stop
 * @param {Array} stops - Array of stops with sequence, distance, and duration
 * @param {Date} startTime - Starting time
 * @param {number} serviceTime - Average service time at each stop in minutes
 * @returns {Array} Stops with estimated arrival times
 */
const calculateEstimatedArrivals = (stops, startTime, serviceTime = 15) => {
  let currentTime = new Date(startTime);
  
  return stops.map(stop => {
    // Add travel time to current time
    currentTime = new Date(currentTime.getTime() + stop.duration * 60 * 1000);
    
    // Set estimated arrival time
    const estimatedArrival = new Date(currentTime);
    
    // Add service time for the next stop
    currentTime = new Date(currentTime.getTime() + serviceTime * 60 * 1000);
    
    return {
      ...stop,
      estimatedArrival,
    };
  });
};

/**
 * Optimize route for pickup assignment
 * @param {Array} pickupRequests - Array of pickup requests
 * @param {Object} branch - Branch object with location
 * @param {Date} startTime - Starting time for the route
 * @param {boolean} useGoogleMaps - Whether to use Google Maps API
 * @returns {Promise<Object>} Optimized route
 */
const optimizeRoute = async (pickupRequests, branch, startTime, useGoogleMaps = true) => {
  try {
    // Prepare stops from pickup requests
    const stops = pickupRequests.map(request => ({
      pickupRequest: request._id,
      coordinates: request.pickupAddress.location?.coordinates || [0, 0],
      address: `${request.pickupAddress.street}, ${request.pickupAddress.city}, ${request.pickupAddress.province}`,
    }));
    
    // Get branch coordinates
    const branchCoordinates = branch.location?.coordinates || [0, 0];
    
    // Optimize route
    let optimizedRoute;
    
    if (useGoogleMaps) {
      optimizedRoute = await optimizeRouteWithGoogleMaps(stops, branchCoordinates, branchCoordinates);
    } else {
      optimizedRoute = optimizeRouteNearestNeighbor(stops, branchCoordinates, branchCoordinates);
    }
    
    // Calculate estimated arrival times
    optimizedRoute.stops = calculateEstimatedArrivals(optimizedRoute.stops, startTime);
    
    // Set start and end locations
    optimizedRoute.startLocation = {
      type: 'Point',
      coordinates: branchCoordinates,
      address: `${branch.address.street}, ${branch.address.city}, ${branch.address.province}`,
    };
    
    optimizedRoute.endLocation = {
      type: 'Point',
      coordinates: branchCoordinates,
      address: `${branch.address.street}, ${branch.address.city}, ${branch.address.province}`,
    };
    
    return optimizedRoute;
  } catch (error) {
    logger.error(`Error optimizing route: ${error.message}`, { error });
    throw error;
  }
};

module.exports = {
  optimizeRoute,
  calculateDistance,
  calculateDuration,
  calculateEstimatedArrivals,
};
