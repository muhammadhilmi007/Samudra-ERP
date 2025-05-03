/**
 * Samudra Paket ERP - Shipment Repository
 * Handles business logic for inter-branch shipments
 */

const mongoose = require('mongoose');
const Shipment = require('../models/shipment');
const LoadingForm = require('../models/loadingForm');
const Vehicle = require('../models/vehicle');
const Employee = require('../models/employee');
const Branch = require('../models/branch');
const logger = require('../../api/middleware/gateway/logger');

/**
 * Create a new shipment
 * @param {Object} data - Shipment data
 * @returns {Promise<Object>} Created shipment
 */
const createShipment = async (data) => {
  try {
    // Generate a unique shipment number
    const shipmentNo = await Shipment.generateShipmentNo(data.originBranch);
    
    // Create a new shipment
    const shipment = new Shipment({
      ...data,
      shipmentNo,
    });
    
    // Add creation activity
    shipment.addActivity('created', data.createdBy, {
      originBranch: data.originBranch,
      destinationBranch: data.destinationBranch,
      departureDate: data.departureDate,
    });
    
    // Add initial status to history
    shipment.statusHistory.push({
      status: 'preparing',
      timestamp: new Date(),
      notes: 'Shipment created',
      user: data.createdBy,
    });
    
    // Save the shipment
    await shipment.save();
    
    // Update loading form status if provided
    if (data.loadingForm) {
      const loadingForm = await LoadingForm.findById(data.loadingForm);
      if (loadingForm) {
        // Only update if the loading form is in the appropriate status
        if (loadingForm.status === 'loaded') {
          loadingForm.status = 'departed';
          loadingForm.actualDeparture = new Date();
          loadingForm.addActivity('shipment_created', data.createdBy, {
            shipmentNo: shipment.shipmentNo,
          });
          await loadingForm.save();
        }
      }
    }
    
    return shipment;
  } catch (error) {
    logger.error(`Error creating shipment: ${error.message}`, { error });
    throw error;
  }
};

/**
 * Get all shipments with filtering and pagination
 * @param {Object} filter - Filter criteria
 * @param {Object} options - Pagination and sorting options
 * @returns {Promise<Object>} Shipments with pagination metadata
 */
const getAllShipments = async (filter = {}, options = {}) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      sortBy = 'createdAt', 
      sortOrder = 'desc',
      populate = []
    } = options;
    
    // Build query
    const query = {};
    
    // Apply filters
    if (filter.originBranch) {
      query.originBranch = mongoose.Types.ObjectId(filter.originBranch);
    }
    
    if (filter.destinationBranch) {
      query.destinationBranch = mongoose.Types.ObjectId(filter.destinationBranch);
    }
    
    if (filter.vehicle) {
      query.vehicle = mongoose.Types.ObjectId(filter.vehicle);
    }
    
    if (filter.driver) {
      query.driver = mongoose.Types.ObjectId(filter.driver);
    }
    
    if (filter.status) {
      if (Array.isArray(filter.status)) {
        query.status = { $in: filter.status };
      } else {
        query.status = filter.status;
      }
    }
    
    if (filter.shipmentNo) {
      query.shipmentNo = new RegExp(filter.shipmentNo, 'i');
    }
    
    if (filter.departureDateFrom && filter.departureDateTo) {
      query.departureDate = {
        $gte: new Date(filter.departureDateFrom),
        $lte: new Date(filter.departureDateTo),
      };
    } else if (filter.departureDateFrom) {
      query.departureDate = { $gte: new Date(filter.departureDateFrom) };
    } else if (filter.departureDateTo) {
      query.departureDate = { $lte: new Date(filter.departureDateTo) };
    }
    
    // Calculate skip value for pagination
    const skip = (page - 1) * limit;
    
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    // Execute query with pagination
    const shipments = await Shipment.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate(populate);
    
    // Get total count
    const totalCount = await Shipment.countDocuments(query);
    
    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;
    
    return {
      data: shipments,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext,
        hasPrev,
      },
    };
  } catch (error) {
    logger.error(`Error getting shipments: ${error.message}`, { error });
    throw error;
  }
};

/**
 * Get shipment by ID
 * @param {string} id - Shipment ID
 * @param {Array} populate - Fields to populate
 * @returns {Promise<Object>} Shipment
 */
const getShipmentById = async (id, populate = []) => {
  try {
    const shipment = await Shipment.findById(id).populate(populate);
    
    if (!shipment) {
      throw new Error('Shipment not found');
    }
    
    return shipment;
  } catch (error) {
    logger.error(`Error getting shipment by ID: ${error.message}`, { error });
    throw error;
  }
};

/**
 * Get shipment by shipment number
 * @param {string} shipmentNo - Shipment number
 * @param {Array} populate - Fields to populate
 * @returns {Promise<Object>} Shipment
 */
const getShipmentByShipmentNo = async (shipmentNo, populate = []) => {
  try {
    const shipment = await Shipment.findOne({ shipmentNo }).populate(populate);
    
    if (!shipment) {
      throw new Error('Shipment not found');
    }
    
    return shipment;
  } catch (error) {
    logger.error(`Error getting shipment by shipment number: ${error.message}`, { error });
    throw error;
  }
};

/**
 * Update shipment
 * @param {string} id - Shipment ID
 * @param {Object} data - Updated data
 * @returns {Promise<Object>} Updated shipment
 */
const updateShipment = async (id, data) => {
  try {
    const shipment = await Shipment.findById(id);
    
    if (!shipment) {
      throw new Error('Shipment not found');
    }
    
    // Update fields
    const updatableFields = [
      'vehicle', 'driver', 'helper', 'departureDate', 'estimatedArrival',
      'distance', 'estimatedDuration', 'route', 'notes'
    ];
    
    updatableFields.forEach(field => {
      if (data[field] !== undefined) {
        shipment[field] = data[field];
      }
    });
    
    // Update updatedBy
    shipment.updatedBy = data.updatedBy;
    
    // Add update activity
    shipment.addActivity('updated', data.updatedBy, {
      updatedFields: Object.keys(data).filter(key => 
        updatableFields.includes(key) && data[key] !== undefined
      ),
    });
    
    // Save the updated shipment
    await shipment.save();
    
    return shipment;
  } catch (error) {
    logger.error(`Error updating shipment: ${error.message}`, { error });
    throw error;
  }
};

/**
 * Update shipment status
 * @param {string} id - Shipment ID
 * @param {string} status - New status
 * @param {string} userId - User ID who updates the status
 * @param {Object} additionalData - Additional data for specific status updates
 * @returns {Promise<Object>} Updated shipment
 */
const updateStatus = async (id, status, userId, additionalData = {}) => {
  try {
    const shipment = await Shipment.findById(id);
    
    if (!shipment) {
      throw new Error('Shipment not found');
    }
    
    // Validate status transition
    const validTransitions = {
      preparing: ['departed', 'cancelled'],
      departed: ['in_transit', 'cancelled', 'delayed'],
      in_transit: ['arrived_at_destination', 'delayed', 'cancelled'],
      arrived_at_destination: ['unloaded', 'cancelled'],
      unloaded: ['completed', 'cancelled'],
      completed: [],
      cancelled: [],
      delayed: ['in_transit', 'cancelled'],
    };
    
    if (!validTransitions[shipment.status].includes(status)) {
      throw new Error(`Invalid status transition from ${shipment.status} to ${status}`);
    }
    
    // Update status
    const previousStatus = shipment.status;
    shipment.status = status;
    
    // Handle specific status updates
    switch (status) {
      case 'departed':
        // Set departure date if not already set
        if (!shipment.departureDate || additionalData.overrideDepartureDate) {
          shipment.departureDate = additionalData.departureDate || new Date();
        }
        break;
      
      case 'arrived_at_destination':
        // Set actual arrival time
        shipment.actualArrival = additionalData.arrivalTime || new Date();
        
        // Calculate actual duration in minutes
        const departureTime = new Date(shipment.departureDate);
        const arrivalTime = new Date(shipment.actualArrival);
        shipment.actualDuration = Math.round((arrivalTime - departureTime) / (1000 * 60));
        break;
      
      case 'completed':
        // Ensure actual arrival is set
        if (!shipment.actualArrival) {
          shipment.actualArrival = additionalData.arrivalTime || new Date();
        }
        break;
      
      case 'delayed':
        // Require delay reason
        if (!additionalData.reason) {
          throw new Error('Delay reason is required');
        }
        
        // Update estimated arrival if provided
        if (additionalData.newEstimatedArrival) {
          shipment.estimatedArrival = new Date(additionalData.newEstimatedArrival);
        }
        break;
      
      case 'cancelled':
        // Require cancellation reason
        if (!additionalData.reason) {
          throw new Error('Cancellation reason is required');
        }
        break;
    }
    
    // Add status update to history
    shipment.statusHistory.push({
      status,
      timestamp: new Date(),
      location: additionalData.location,
      notes: additionalData.notes || additionalData.reason || '',
      user: userId,
    });
    
    // Add status update activity
    shipment.addActivity('status_updated', userId, {
      previousStatus,
      newStatus: status,
      ...additionalData,
    });
    
    // Save the updated shipment
    await shipment.save();
    
    return shipment;
  } catch (error) {
    logger.error(`Error updating shipment status: ${error.message}`, { error });
    throw error;
  }
};

/**
 * Record GPS location for shipment
 * @param {string} id - Shipment ID
 * @param {Object} locationData - GPS location data
 * @param {string} userId - User ID who records the location
 * @returns {Promise<Object>} Updated shipment
 */
const recordGpsLocation = async (id, locationData, userId) => {
  try {
    const shipment = await Shipment.findById(id);
    
    if (!shipment) {
      throw new Error('Shipment not found');
    }
    
    // Check if shipment status allows tracking
    if (!['departed', 'in_transit', 'delayed'].includes(shipment.status)) {
      throw new Error(`Cannot record GPS location for shipment with status ${shipment.status}`);
    }
    
    // Validate location data
    if (!locationData.coordinates || !Array.isArray(locationData.coordinates) || locationData.coordinates.length !== 2) {
      throw new Error('Invalid coordinates format');
    }
    
    // Add location to tracking
    shipment.addTrackingLocation({
      timestamp: locationData.timestamp || new Date(),
      coordinates: {
        type: 'Point',
        coordinates: locationData.coordinates,
      },
      speed: locationData.speed,
      heading: locationData.heading,
      accuracy: locationData.accuracy,
      address: locationData.address,
      provider: locationData.provider || 'gps',
    });
    
    // Update updatedBy
    shipment.updatedBy = userId;
    
    // Add activity
    shipment.addActivity('location_updated', userId, {
      coordinates: locationData.coordinates,
      address: locationData.address,
    });
    
    // Save the updated shipment
    await shipment.save();
    
    return shipment;
  } catch (error) {
    logger.error(`Error recording GPS location: ${error.message}`, { error });
    throw error;
  }
};

/**
 * Calculate and update ETA
 * @param {string} id - Shipment ID
 * @param {string} userId - User ID who updates the ETA
 * @param {Object} additionalData - Additional data for ETA calculation
 * @returns {Promise<Object>} Updated shipment with new ETA
 */
const updateETA = async (id, userId, additionalData = {}) => {
  try {
    const shipment = await Shipment.findById(id);
    
    if (!shipment) {
      throw new Error('Shipment not found');
    }
    
    // Check if shipment status allows ETA update
    if (!['departed', 'in_transit', 'delayed'].includes(shipment.status)) {
      throw new Error(`Cannot update ETA for shipment with status ${shipment.status}`);
    }
    
    // If manual ETA is provided, use it
    if (additionalData.manualETA) {
      const previousETA = new Date(shipment.estimatedArrival);
      shipment.estimatedArrival = new Date(additionalData.manualETA);
      
      // Add activity
      shipment.addActivity('eta_updated', userId, {
        previousETA,
        newETA: shipment.estimatedArrival,
        method: 'manual',
        reason: additionalData.reason || 'Manual ETA update',
      });
    } else {
      // Calculate ETA based on current position and speed
      const previousETA = new Date(shipment.estimatedArrival);
      const newETA = shipment.calculateETA();
      
      // Only update if the difference is significant (more than 15 minutes)
      const diffMinutes = Math.abs((newETA - previousETA) / (1000 * 60));
      if (diffMinutes > 15) {
        shipment.estimatedArrival = newETA;
        
        // Add activity
        shipment.addActivity('eta_updated', userId, {
          previousETA,
          newETA,
          method: 'automatic',
          reason: 'Automatic recalculation based on current position and speed',
        });
      }
    }
    
    // Update updatedBy
    shipment.updatedBy = userId;
    
    // Save the updated shipment
    await shipment.save();
    
    return shipment;
  } catch (error) {
    logger.error(`Error updating ETA: ${error.message}`, { error });
    throw error;
  }
};

/**
 * Add checkpoint to shipment
 * @param {string} id - Shipment ID
 * @param {Object} checkpointData - Checkpoint data
 * @param {string} userId - User ID who adds the checkpoint
 * @returns {Promise<Object>} Updated shipment
 */
const addCheckpoint = async (id, checkpointData, userId) => {
  try {
    const shipment = await Shipment.findById(id);
    
    if (!shipment) {
      throw new Error('Shipment not found');
    }
    
    // Validate required fields
    if (!checkpointData.name || !checkpointData.type || !checkpointData.location) {
      throw new Error('Checkpoint name, type, and location are required');
    }
    
    // Add checkpoint
    shipment.checkpoints.push({
      name: checkpointData.name,
      type: checkpointData.type,
      location: checkpointData.location,
      coordinates: checkpointData.coordinates,
      estimatedArrival: checkpointData.estimatedArrival,
      estimatedDeparture: checkpointData.estimatedDeparture,
      status: 'planned',
      notes: checkpointData.notes,
    });
    
    // Update updatedBy
    shipment.updatedBy = userId;
    
    // Add activity
    shipment.addActivity('checkpoint_added', userId, {
      checkpointName: checkpointData.name,
      checkpointType: checkpointData.type,
      checkpointLocation: checkpointData.location,
    });
    
    // Save the updated shipment
    await shipment.save();
    
    return shipment;
  } catch (error) {
    logger.error(`Error adding checkpoint: ${error.message}`, { error });
    throw error;
  }
};

/**
 * Update checkpoint status
 * @param {string} id - Shipment ID
 * @param {number} checkpointIndex - Checkpoint index
 * @param {string} status - New status
 * @param {string} userId - User ID who updates the status
 * @param {Object} additionalData - Additional data for the status update
 * @returns {Promise<Object>} Updated shipment
 */
const updateCheckpointStatus = async (id, checkpointIndex, status, userId, additionalData = {}) => {
  try {
    const shipment = await Shipment.findById(id);
    
    if (!shipment) {
      throw new Error('Shipment not found');
    }
    
    // Check if checkpoint exists
    if (!shipment.checkpoints[checkpointIndex]) {
      throw new Error('Checkpoint not found');
    }
    
    // Validate status
    if (!['planned', 'arrived', 'departed', 'skipped'].includes(status)) {
      throw new Error(`Invalid checkpoint status: ${status}`);
    }
    
    // Update checkpoint status
    const checkpoint = shipment.checkpoints[checkpointIndex];
    const previousStatus = checkpoint.status;
    checkpoint.status = status;
    
    // Handle specific status updates
    switch (status) {
      case 'arrived':
        checkpoint.actualArrival = additionalData.arrivalTime || new Date();
        break;
      
      case 'departed':
        checkpoint.actualDeparture = additionalData.departureTime || new Date();
        break;
    }
    
    // Update notes if provided
    if (additionalData.notes) {
      checkpoint.notes = additionalData.notes;
    }
    
    // Update updatedBy
    shipment.updatedBy = userId;
    
    // Add activity
    shipment.addActivity('checkpoint_status_updated', userId, {
      checkpointName: checkpoint.name,
      checkpointIndex,
      previousStatus,
      newStatus: status,
      ...additionalData,
    });
    
    // Save the updated shipment
    await shipment.save();
    
    return shipment;
  } catch (error) {
    logger.error(`Error updating checkpoint status: ${error.message}`, { error });
    throw error;
  }
};

/**
 * Report issue during shipment
 * @param {string} id - Shipment ID
 * @param {Object} issueData - Issue data
 * @param {string} userId - User ID who reports the issue
 * @returns {Promise<Object>} Updated shipment
 */
const reportIssue = async (id, issueData, userId) => {
  try {
    const shipment = await Shipment.findById(id);
    
    if (!shipment) {
      throw new Error('Shipment not found');
    }
    
    // Check if shipment status allows reporting issues
    if (!['departed', 'in_transit', 'delayed'].includes(shipment.status)) {
      throw new Error(`Cannot report issues for shipment with status ${shipment.status}`);
    }
    
    // Validate required fields
    if (!issueData.type || !issueData.description || !issueData.severity) {
      throw new Error('Issue type, description, and severity are required');
    }
    
    // Add issue
    shipment.issues.push({
      type: issueData.type,
      description: issueData.description,
      reportedAt: new Date(),
      reportedBy: userId,
      location: issueData.location,
      coordinates: issueData.coordinates,
      severity: issueData.severity,
      status: 'reported',
    });
    
    // If issue is critical, update shipment status to delayed
    if (issueData.severity === 'critical' && shipment.status !== 'delayed') {
      shipment.status = 'delayed';
      shipment.statusHistory.push({
        status: 'delayed',
        timestamp: new Date(),
        location: issueData.location,
        notes: `Delayed due to critical issue: ${issueData.description}`,
        user: userId,
      });
    }
    
    // Update updatedBy
    shipment.updatedBy = userId;
    
    // Add activity
    shipment.addActivity('issue_reported', userId, {
      issueType: issueData.type,
      issueSeverity: issueData.severity,
      issueDescription: issueData.description,
    });
    
    // Save the updated shipment
    await shipment.save();
    
    return shipment;
  } catch (error) {
    logger.error(`Error reporting issue: ${error.message}`, { error });
    throw error;
  }
};

/**
 * Resolve issue during shipment
 * @param {string} id - Shipment ID
 * @param {number} issueIndex - Issue index
 * @param {Object} resolutionData - Resolution data
 * @param {string} userId - User ID who resolves the issue
 * @returns {Promise<Object>} Updated shipment
 */
const resolveIssue = async (id, issueIndex, resolutionData, userId) => {
  try {
    const shipment = await Shipment.findById(id);
    
    if (!shipment) {
      throw new Error('Shipment not found');
    }
    
    // Check if issue exists
    if (!shipment.issues[issueIndex]) {
      throw new Error('Issue not found');
    }
    
    // Validate required fields
    if (!resolutionData.description) {
      throw new Error('Resolution description is required');
    }
    
    // Update issue status and resolution
    const issue = shipment.issues[issueIndex];
    
    // Check if issue is already resolved
    if (issue.status === 'resolved') {
      throw new Error('Issue is already resolved');
    }
    
    issue.status = 'resolved';
    issue.resolution = {
      description: resolutionData.description,
      resolvedAt: new Date(),
      resolvedBy: userId,
    };
    
    // If all critical issues are resolved, update shipment status back to in_transit if currently delayed
    if (shipment.status === 'delayed') {
      const hasCriticalIssues = shipment.issues.some(i => 
        i.severity === 'critical' && i.status !== 'resolved'
      );
      
      if (!hasCriticalIssues) {
        shipment.status = 'in_transit';
        shipment.statusHistory.push({
          status: 'in_transit',
          timestamp: new Date(),
          notes: 'Resumed transit after resolving all critical issues',
          user: userId,
        });
      }
    }
    
    // Update updatedBy
    shipment.updatedBy = userId;
    
    // Add activity
    shipment.addActivity('issue_resolved', userId, {
      issueType: issue.type,
      issueSeverity: issue.severity,
      issueIndex,
      resolutionDescription: resolutionData.description,
    });
    
    // Save the updated shipment
    await shipment.save();
    
    return shipment;
  } catch (error) {
    logger.error(`Error resolving issue: ${error.message}`, { error });
    throw error;
  }
};

/**
 * Get active shipments for branch
 * @param {string} branchId - Branch ID
 * @param {string} role - Role ('origin' or 'destination')
 * @returns {Promise<Array>} Active shipments for branch
 */
const getActiveBranchShipments = async (branchId, role = 'both') => {
  try {
    // Build query
    const query = {};
    
    if (role === 'origin') {
      query.originBranch = mongoose.Types.ObjectId(branchId);
    } else if (role === 'destination') {
      query.destinationBranch = mongoose.Types.ObjectId(branchId);
    } else {
      // Both roles
      query.$or = [
        { originBranch: mongoose.Types.ObjectId(branchId) },
        { destinationBranch: mongoose.Types.ObjectId(branchId) },
      ];
    }
    
    // Only get active shipments
    query.status = { $in: ['preparing', 'departed', 'in_transit', 'delayed', 'arrived_at_destination'] };
    
    // Get shipments
    const shipments = await Shipment.find(query)
      .sort({ departureDate: -1 })
      .populate(['vehicle', 'driver', 'helper', 'originBranch', 'destinationBranch']);
    
    return shipments;
  } catch (error) {
    logger.error(`Error getting active branch shipments: ${error.message}`, { error });
    throw error;
  }
};

/**
 * Get shipments for coordination between branches
 * @param {string} originBranchId - Origin branch ID
 * @param {string} destinationBranchId - Destination branch ID
 * @param {Object} options - Filter options
 * @returns {Promise<Array>} Shipments between branches
 */
const getShipmentsBetweenBranches = async (originBranchId, destinationBranchId, options = {}) => {
  try {
    // Build query
    const query = {
      originBranch: mongoose.Types.ObjectId(originBranchId),
      destinationBranch: mongoose.Types.ObjectId(destinationBranchId),
    };
    
    // Apply status filter
    if (options.status) {
      if (Array.isArray(options.status)) {
        query.status = { $in: options.status };
      } else {
        query.status = options.status;
      }
    }
    
    // Apply date filter
    if (options.startDate || options.endDate) {
      query.departureDate = {};
      
      if (options.startDate) {
        query.departureDate.$gte = new Date(options.startDate);
      }
      
      if (options.endDate) {
        query.departureDate.$lte = new Date(options.endDate);
      }
    }
    
    // Get shipments
    const shipments = await Shipment.find(query)
      .sort({ departureDate: -1 })
      .populate(['vehicle', 'driver', 'helper', 'loadingForm']);
    
    return shipments;
  } catch (error) {
    logger.error(`Error getting shipments between branches: ${error.message}`, { error });
    throw error;
  }
};

/**
 * Get today's shipments
 * @param {Object} options - Filter options
 * @returns {Promise<Array>} Today's shipments
 */
const getTodayShipments = async (options = {}) => {
  try {
    // Get today's date range
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));
    
    // Build query
    const query = {
      departureDate: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    };
    
    // Apply branch filter
    if (options.branchId) {
      if (options.role === 'origin') {
        query.originBranch = mongoose.Types.ObjectId(options.branchId);
      } else if (options.role === 'destination') {
        query.destinationBranch = mongoose.Types.ObjectId(options.branchId);
      } else {
        // Both roles
        query.$or = [
          { originBranch: mongoose.Types.ObjectId(options.branchId) },
          { destinationBranch: mongoose.Types.ObjectId(options.branchId) },
        ];
      }
    }
    
    // Apply status filter
    if (options.status) {
      if (Array.isArray(options.status)) {
        query.status = { $in: options.status };
      } else {
        query.status = options.status;
      }
    }
    
    // Get shipments
    const shipments = await Shipment.find(query)
      .sort({ departureDate: 1 })
      .populate(['vehicle', 'driver', 'helper', 'originBranch', 'destinationBranch']);
    
    return shipments;
  } catch (error) {
    logger.error(`Error getting today's shipments: ${error.message}`, { error });
    throw error;
  }
};

module.exports = {
  createShipment,
  getAllShipments,
  getShipmentById,
  getShipmentByShipmentNo,
  updateShipment,
  updateStatus,
  recordGpsLocation,
  updateETA,
  addCheckpoint,
  updateCheckpointStatus,
  reportIssue,
  resolveIssue,
  getActiveBranchShipments,
  getShipmentsBetweenBranches,
  getTodayShipments,
};
