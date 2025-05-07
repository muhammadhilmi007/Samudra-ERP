/**
 * Samudra Paket ERP - Loading Form Repository
 * Handles business logic for loading forms
 */

const mongoose = require('mongoose');
const LoadingForm = require('../models/loadingForm');
const ShipmentOrder = require('../models/shipmentOrder');
const Vehicle = require('../models/vehicle');
const Employee = require('../models/employee');
const Branch = require('../models/branch');
const logger = require('../../api/middleware/gateway/logger');
const { ValidationError } = require('../utils/errorUtils');

/**
 * Create a new loading form
 * @param {Object} data - Loading form data
 * @returns {Promise<Object>} Created loading form
 */
const createLoadingForm = async (data) => {
  try {
    // Generate a unique loading number
    const loadingNo = await LoadingForm.generateLoadingNo(data.branch);
    
    // Create a new loading form
    const loadingForm = new LoadingForm({
      ...data,
      loadingNo,
    });
    
    // Add creation activity
    loadingForm.addActivity('created', data.createdBy, {
      branch: data.branch,
      loadingDate: data.loadingDate,
    });
    
    // Save the loading form
    await loadingForm.save();
    
    return loadingForm;
  } catch (error) {
    logger.error(`Error creating loading form: ${error.message}`, { error });
    throw error;
  }
};

/**
 * Get all loading forms with filtering and pagination
 * @param {Object} filter - Filter criteria
 * @param {Object} options - Pagination and sorting options
 * @returns {Promise<Object>} Loading forms with pagination metadata
 */
const getAllLoadingForms = async (filter = {}, options = {}) => {
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
    if (filter.branch) {
      query.branch = mongoose.Types.ObjectId(filter.branch);
    }
    
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
    
    if (filter.loadingNo) {
      query.loadingNo = new RegExp(filter.loadingNo, 'i');
    }
    
    if (filter.loadingDateFrom && filter.loadingDateTo) {
      query.loadingDate = {
        $gte: new Date(filter.loadingDateFrom),
        $lte: new Date(filter.loadingDateTo),
      };
    } else if (filter.loadingDateFrom) {
      query.loadingDate = { $gte: new Date(filter.loadingDateFrom) };
    } else if (filter.loadingDateTo) {
      query.loadingDate = { $lte: new Date(filter.loadingDateTo) };
    }
    
    // Calculate skip value for pagination
    const skip = (page - 1) * limit;
    
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    // Execute query with pagination
    const loadingForms = await LoadingForm.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate(populate);
    
    // Get total count
    const totalCount = await LoadingForm.countDocuments(query);
    
    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;
    
    return {
      data: loadingForms,
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
    logger.error(`Error getting loading forms: ${error.message}`, { error });
    throw error;
  }
};

/**
 * Get loading form by ID
 * @param {string} id - Loading form ID
 * @param {Array} populate - Fields to populate
 * @returns {Promise<Object>} Loading form
 */
const getLoadingFormById = async (id, populate = []) => {
  try {
    const loadingForm = await LoadingForm.findById(id).populate(populate);
    
    if (!loadingForm) {
      throw new Error('Loading form not found');
    }
    
    return loadingForm;
  } catch (error) {
    logger.error(`Error getting loading form by ID: ${error.message}`, { error });
    throw error;
  }
};

/**
 * Get loading form by loading number
 * @param {string} loadingNo - Loading form number
 * @param {Array} populate - Fields to populate
 * @returns {Promise<Object>} Loading form
 */
const getLoadingFormByLoadingNo = async (loadingNo, populate = []) => {
  try {
    const loadingForm = await LoadingForm.findOne({ loadingNo }).populate(populate);
    
    if (!loadingForm) {
      throw new Error('Loading form not found');
    }
    
    return loadingForm;
  } catch (error) {
    logger.error(`Error getting loading form by loading number: ${error.message}`, { error });
    throw error;
  }
};

/**
 * Update loading form
 * @param {string} id - Loading form ID
 * @param {Object} data - Updated data
 * @returns {Promise<Object>} Updated loading form
 */
const updateLoadingForm = async (id, data) => {
  try {
    const loadingForm = await LoadingForm.findById(id);
    
    if (!loadingForm) {
      throw new Error('Loading form not found');
    }
    
    // Update fields
    const updatableFields = [
      'vehicle', 'driver', 'helper', 'loadingDate', 'scheduledDeparture',
      'notes'
    ];
    
    updatableFields.forEach(field => {
      if (data[field] !== undefined) {
        loadingForm[field] = data[field];
      }
    });
    
    // Update updatedBy
    loadingForm.updatedBy = data.updatedBy;
    
    // Add update activity
    loadingForm.addActivity('updated', data.updatedBy, {
      updatedFields: Object.keys(data).filter(key => 
        updatableFields.includes(key) && data[key] !== undefined
      ),
    });
    
    // Save the updated loading form
    await loadingForm.save();
    
    return loadingForm;
  } catch (error) {
    logger.error(`Error updating loading form: ${error.message}`, { error });
    throw error;
  }
};

/**
 * Update loading form status
 * @param {string} id - Loading form ID
 * @param {string} status - New status
 * @param {string} userId - User ID who updates the status
 * @param {Object} additionalData - Additional data for specific status updates
 * @returns {Promise<Object>} Updated loading form
 */
const updateStatus = async (id, status, userId, additionalData = {}) => {
  try {
    const loadingForm = await LoadingForm.findById(id);
    
    if (!loadingForm) {
      throw new Error('Loading form not found');
    }
    
    // Validate status transition
    const validTransitions = {
      draft: ['planned', 'cancelled'],
      planned: ['in_progress', 'cancelled'],
      in_progress: ['loaded', 'cancelled'],
      loaded: ['departed', 'cancelled'],
      departed: [],
      cancelled: [],
    };
    
    if (!validTransitions[loadingForm.status].includes(status)) {
      throw new Error(`Invalid status transition from ${loadingForm.status} to ${status}`);
    }
    
    // Update status
    loadingForm.status = status;
    
    // Handle specific status updates
    switch (status) {
      case 'in_progress':
        // No additional data needed
        break;
      
      case 'loaded':
        // Require at least one confirmation
        if (!loadingForm.loadingConfirmations || loadingForm.loadingConfirmations.length === 0) {
          throw new Error('At least one loading confirmation is required before marking as loaded');
        }
        break;
      
      case 'departed':
        // Set actual departure time
        loadingForm.actualDeparture = additionalData.departureTime || new Date();
        break;
      
      case 'cancelled':
        // Require cancellation reason
        if (!additionalData.reason) {
          throw new Error('Cancellation reason is required');
        }
        break;
    }
    
    // Add status update activity
    loadingForm.addActivity('status_updated', userId, {
      previousStatus: loadingForm.status,
      newStatus: status,
      ...additionalData,
    });
    
    // Save the updated loading form
    await loadingForm.save();
    
    return loadingForm;
  } catch (error) {
    logger.error(`Error updating loading form status: ${error.message}`, { error });
    throw error;
  }
};

/**
 * Add shipment to loading form
 * @param {string} id - Loading form ID
 * @param {string} shipmentId - Shipment order ID
 * @param {string} userId - User ID who adds the shipment
 * @returns {Promise<Object>} Updated loading form
 */
const addShipment = async (id, shipmentId, userId) => {
  try {
    const loadingForm = await LoadingForm.findById(id);
    
    if (!loadingForm) {
      throw new Error('Loading form not found');
    }
    
    // Check if loading form status allows adding shipments
    if (!['draft', 'planned'].includes(loadingForm.status)) {
      throw new Error(`Cannot add shipments to loading form with status ${loadingForm.status}`);
    }
    
    // Check if shipment already exists in the loading form
    const existingShipment = loadingForm.shipments.find(
      shipment => shipment.shipment.toString() === shipmentId
    );
    
    if (existingShipment) {
      throw new Error('Shipment already added to this loading form');
    }
    
    // Get shipment details
    const shipmentOrder = await ShipmentOrder.findById(shipmentId);
    
    if (!shipmentOrder) {
      throw new Error('Shipment order not found');
    }
    
    // Validate shipment eligibility
    if (shipmentOrder.status !== 'ready_for_loading') {
      throw new Error(`Shipment status ${shipmentOrder.status} is not eligible for loading`);
    }
    
    // Check origin and destination branches
    if (shipmentOrder.originBranch.toString() !== loadingForm.originBranch.toString()) {
      throw new Error('Shipment origin branch does not match loading form origin branch');
    }
    
    if (shipmentOrder.destinationBranch.toString() !== loadingForm.destinationBranch.toString()) {
      throw new Error('Shipment destination branch does not match loading form destination branch');
    }
    
    // Add shipment to loading form
    loadingForm.shipments.push({
      shipment: shipmentId,
      waybillNo: shipmentOrder.waybillNo,
      status: 'pending',
    });
    
    // Update shipment order status
    shipmentOrder.status = 'assigned_to_loading';
    shipmentOrder.statusHistory.push({
      status: 'assigned_to_loading',
      timestamp: new Date(),
      notes: `Assigned to loading form ${loadingForm.loadingNo}`,
      user: userId,
    });
    
    // Add activity
    loadingForm.addActivity('shipment_added', userId, {
      shipmentId,
      waybillNo: shipmentOrder.waybillNo,
    });
    
    // Save both documents
    await Promise.all([
      loadingForm.save(),
      shipmentOrder.save(),
    ]);
    
    return loadingForm;
  } catch (error) {
    logger.error(`Error adding shipment to loading form: ${error.message}`, { error });
    throw error;
  }
};

/**
 * Remove shipment from loading form
 * @param {string} id - Loading form ID
 * @param {string} shipmentId - Shipment order ID
 * @param {string} userId - User ID who removes the shipment
 * @returns {Promise<Object>} Updated loading form
 */
const removeShipment = async (id, shipmentId, userId) => {
  try {
    const loadingForm = await LoadingForm.findById(id);
    
    if (!loadingForm) {
      throw new Error('Loading form not found');
    }
    
    // Check if loading form status allows removing shipments
    if (!['draft', 'planned'].includes(loadingForm.status)) {
      throw new Error(`Cannot remove shipments from loading form with status ${loadingForm.status}`);
    }
    
    // Find shipment in the loading form
    const shipmentIndex = loadingForm.shipments.findIndex(
      shipment => shipment.shipment.toString() === shipmentId
    );
    
    if (shipmentIndex === -1) {
      throw new Error('Shipment not found in this loading form');
    }
    
    // Get shipment details before removing
    const shipmentDetails = loadingForm.shipments[shipmentIndex];
    
    // Remove shipment from loading form
    loadingForm.shipments.splice(shipmentIndex, 1);
    
    // Update shipment order status
    const shipmentOrder = await ShipmentOrder.findById(shipmentId);
    
    if (shipmentOrder) {
      shipmentOrder.status = 'ready_for_loading';
      shipmentOrder.statusHistory.push({
        status: 'ready_for_loading',
        timestamp: new Date(),
        notes: `Removed from loading form ${loadingForm.loadingNo}`,
        user: userId,
      });
      
      await shipmentOrder.save();
    }
    
    // Add activity
    loadingForm.addActivity('shipment_removed', userId, {
      shipmentId,
      waybillNo: shipmentDetails.waybillNo,
    });
    
    // Save the loading form
    await loadingForm.save();
    
    return loadingForm;
  } catch (error) {
    logger.error(`Error removing shipment from loading form: ${error.message}`, { error });
    throw error;
  }
};

/**
 * Update shipment status in loading form
 * @param {string} id - Loading form ID
 * @param {string} shipmentId - Shipment order ID
 * @param {string} status - New status
 * @param {string} userId - User ID who updates the status
 * @param {Object} additionalData - Additional data for the status update
 * @returns {Promise<Object>} Updated loading form
 */
const updateShipmentStatus = async (id, shipmentId, status, userId, additionalData = {}) => {
  try {
    const loadingForm = await LoadingForm.findById(id);
    
    if (!loadingForm) {
      throw new Error('Loading form not found');
    }
    
    // Check if loading form status allows updating shipment status
    if (!['planned', 'in_progress'].includes(loadingForm.status)) {
      throw new Error(`Cannot update shipment status in loading form with status ${loadingForm.status}`);
    }
    
    // Find shipment in the loading form
    const shipmentIndex = loadingForm.shipments.findIndex(
      shipment => shipment.shipment.toString() === shipmentId
    );
    
    if (shipmentIndex === -1) {
      throw new Error('Shipment not found in this loading form');
    }
    
    // Validate status transition
    const validStatuses = ['pending', 'loaded', 'rejected', 'damaged'];
    
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid shipment status: ${status}`);
    }
    
    // Update shipment status
    const previousStatus = loadingForm.shipments[shipmentIndex].status;
    loadingForm.shipments[shipmentIndex].status = status;
    
    // Add additional data based on status
    if (status === 'loaded') {
      loadingForm.shipments[shipmentIndex].loadedAt = new Date();
      loadingForm.shipments[shipmentIndex].handledBy = userId;
    }
    
    if (additionalData.notes) {
      loadingForm.shipments[shipmentIndex].notes = additionalData.notes;
    }
    
    if (additionalData.position) {
      loadingForm.shipments[shipmentIndex].position = additionalData.position;
    }
    
    // Add activity
    loadingForm.addActivity('shipment_status_updated', userId, {
      shipmentId,
      waybillNo: loadingForm.shipments[shipmentIndex].waybillNo,
      previousStatus,
      newStatus: status,
      ...additionalData,
    });
    
    // Save the loading form
    await loadingForm.save();
    
    return loadingForm;
  } catch (error) {
    logger.error(`Error updating shipment status in loading form: ${error.message}`, { error });
    throw error;
  }
};

/**
 * Add loading confirmation
 * @param {string} id - Loading form ID
 * @param {Object} confirmationData - Confirmation data
 * @param {string} userId - User ID who adds the confirmation
 * @returns {Promise<Object>} Updated loading form
 */
const addLoadingConfirmation = async (id, confirmationData, userId) => {
  try {
    const loadingForm = await LoadingForm.findById(id);
    
    if (!loadingForm) {
      throw new Error('Loading form not found');
    }
    
    // Check if loading form status allows adding confirmations
    if (!['in_progress'].includes(loadingForm.status)) {
      throw new Error(`Cannot add confirmation to loading form with status ${loadingForm.status}`);
    }
    
    // Validate required fields
    if (!confirmationData.confirmedBy || !confirmationData.role) {
      throw new Error('Confirmation requires confirmedBy and role fields');
    }
    
    // Add confirmation
    loadingForm.loadingConfirmations.push({
      confirmedBy: confirmationData.confirmedBy,
      role: confirmationData.role,
      timestamp: new Date(),
      notes: confirmationData.notes || '',
      signature: confirmationData.signature || '',
    });
    
    // Add activity
    loadingForm.addActivity('confirmation_added', userId, {
      confirmedBy: confirmationData.confirmedBy,
      role: confirmationData.role,
    });
    
    // Save the loading form
    await loadingForm.save();
    
    return loadingForm;
  } catch (error) {
    logger.error(`Error adding loading confirmation: ${error.message}`, { error });
    throw error;
  }
};

/**
 * Generate loading document
 * @param {string} id - Loading form ID
 * @param {string} documentType - Document type
 * @param {string} userId - User ID who generates the document
 * @returns {Promise<Object>} Document data
 */
const generateDocument = async (id, documentType, userId) => {
  try {
    const loadingForm = await LoadingForm.findById(id).populate([
      { path: 'branch' },
      { path: 'originBranch' },
      { path: 'destinationBranch' },
      { path: 'vehicle' },
      { path: 'driver' },
      { path: 'helper' },
      { path: 'shipments.shipment' },
    ]);
    
    if (!loadingForm) {
      throw new Error('Loading form not found');
    }
    
    // Validate document type
    const validDocumentTypes = ['manifest', 'checklist', 'receipt'];
    
    if (!validDocumentTypes.includes(documentType)) {
      throw new Error(`Invalid document type: ${documentType}`);
    }
    
    // Check if loading form status allows document generation
    if (documentType === 'manifest' && !['planned', 'in_progress', 'loaded', 'departed'].includes(loadingForm.status)) {
      throw new Error(`Cannot generate manifest for loading form with status ${loadingForm.status}`);
    }
    
    if (documentType === 'checklist' && !['planned', 'in_progress'].includes(loadingForm.status)) {
      throw new Error(`Cannot generate checklist for loading form with status ${loadingForm.status}`);
    }
    
    if (documentType === 'receipt' && !['loaded', 'departed'].includes(loadingForm.status)) {
      throw new Error(`Cannot generate receipt for loading form with status ${loadingForm.status}`);
    }
    
    // Generate document data based on type
    let documentData = {
      loadingForm: loadingForm.toObject(),
      generatedAt: new Date(),
      generatedBy: userId,
    };
    
    // Document generation logic would typically call a PDF generation service
    // For now, we'll just return the data that would be used to generate the document
    
    // Add activity
    loadingForm.addActivity('document_generated', userId, {
      documentType,
    });
    
    // Save the loading form
    await loadingForm.save();
    
    return documentData;
  } catch (error) {
    logger.error(`Error generating loading document: ${error.message}`, { error });
    throw error;
  }
};

/**
 * Optimize loading allocation
 * @param {string} id - Loading form ID
 * @param {string} userId - User ID who requests optimization
 * @returns {Promise<Object>} Optimized loading form
 */
const optimizeLoading = async (id, userId) => {
  try {
    const loadingForm = await LoadingForm.findById(id).populate([
      { path: 'vehicle' },
      { path: 'shipments.shipment' },
    ]);
    
    if (!loadingForm) {
      throw new Error('Loading form not found');
    }
    
    // Check if loading form status allows optimization
    if (!['planned', 'in_progress'].includes(loadingForm.status)) {
      throw new Error(`Cannot optimize loading form with status ${loadingForm.status}`);
    }
    
    // Check if vehicle information is available
    if (!loadingForm.vehicle || !loadingForm.vehicle.capacity) {
      throw new Error('Vehicle capacity information is required for optimization');
    }
    
    // Check if there are shipments to optimize
    if (!loadingForm.shipments || loadingForm.shipments.length === 0) {
      throw new Error('No shipments available for optimization');
    }
    
    // Get vehicle dimensions and capacity
    const vehicleCapacity = loadingForm.vehicle.capacity;
    
    // Get shipment dimensions and weights
    const shipments = await Promise.all(
      loadingForm.shipments.map(async (shipmentItem) => {
        const shipment = await ShipmentOrder.findById(shipmentItem.shipment);
        return {
          id: shipment._id,
          waybillNo: shipment.waybillNo,
          weight: shipment.totalWeight,
          volume: shipment.totalVolume,
          items: shipment.items,
        };
      })
    );
    
    // Simple optimization algorithm (first-fit decreasing)
    // In a real implementation, this would be a more sophisticated 3D bin packing algorithm
    
    // Sort shipments by volume (descending)
    shipments.sort((a, b) => b.volume - a.volume);
    
    // Assign positions based on simple sections
    const sections = ['front', 'middle', 'back'];
    const positions = [];
    
    let totalVolume = 0;
    let totalWeight = 0;
    
    shipments.forEach((shipment, index) => {
      const section = sections[index % sections.length];
      
      // Simple position assignment (would be more complex in real implementation)
      const position = {
        section,
        coordinates: {
          x: (index % 3) * 33, // Simple distribution across width
          y: Math.floor(index / 9) * 33, // Simple distribution across height
          z: Math.floor((index % 9) / 3) * 33, // Simple distribution across depth
        },
      };
      
      positions.push({
        shipmentId: shipment.id,
        position,
      });
      
      totalVolume += shipment.volume || 0;
      totalWeight += shipment.weight || 0;
    });
    
    // Update shipment positions in loading form
    positions.forEach(({ shipmentId, position }) => {
      const shipmentIndex = loadingForm.shipments.findIndex(
        shipment => shipment.shipment.toString() === shipmentId.toString()
      );
      
      if (shipmentIndex !== -1) {
        loadingForm.shipments[shipmentIndex].position = position;
      }
    });
    
    // Update total weight and volume
    loadingForm.totalWeight = totalWeight;
    loadingForm.totalVolume = totalVolume;
    
    // Add activity
    loadingForm.addActivity('loading_optimized', userId, {
      totalItems: loadingForm.shipments.length,
      totalWeight,
      totalVolume,
    });
    
    // Save the loading form
    await loadingForm.save();
    
    return loadingForm;
  } catch (error) {
    logger.error(`Error optimizing loading: ${error.message}`, { error });
    throw error;
  }
};

/**
 * Get loading forms for vehicle
 * @param {string} vehicleId - Vehicle ID
 * @param {Object} options - Filter options
 * @returns {Promise<Object>} Loading forms for vehicle
 */
const getVehicleLoadingForms = async (vehicleId, options = {}) => {
  try {
    const { status, startDate, endDate } = options;
    
    // Build query
    const query = { vehicle: mongoose.Types.ObjectId(vehicleId) };
    
    // Apply status filter
    if (status) {
      if (Array.isArray(status)) {
        query.status = { $in: status };
      } else {
        query.status = status;
      }
    }
    
    // Apply date filter
    if (startDate || endDate) {
      query.loadingDate = {};
      
      if (startDate) {
        query.loadingDate.$gte = new Date(startDate);
      }
      
      if (endDate) {
        query.loadingDate.$lte = new Date(endDate);
      }
    }
    
    // Get loading forms
    const loadingForms = await LoadingForm.find(query)
      .sort({ loadingDate: -1 })
      .populate(['branch', 'originBranch', 'destinationBranch']);
    
    return loadingForms;
  } catch (error) {
    logger.error(`Error getting vehicle loading forms: ${error.message}`, { error });
    throw error;
  }
};

/**
 * Get today's loading forms for branch
 * @param {string} branchId - Branch ID
 * @param {Object} options - Filter options
 * @returns {Promise<Object>} Today's loading forms for branch
 */
const getTodayLoadingForms = async (branchId, options = {}) => {
  try {
    // Get today's date range
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));
    
    // Build query
    const query = {
      $or: [
        { branch: mongoose.Types.ObjectId(branchId) },
        { originBranch: mongoose.Types.ObjectId(branchId) },
        { destinationBranch: mongoose.Types.ObjectId(branchId) },
      ],
      loadingDate: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    };
    
    // Apply status filter
    if (options.status) {
      if (Array.isArray(options.status)) {
        query.status = { $in: options.status };
      } else {
        query.status = options.status;
      }
    }
    
    // Get loading forms
    const loadingForms = await LoadingForm.find(query)
      .sort({ loadingDate: 1 })
      .populate(['vehicle', 'driver', 'helper', 'originBranch', 'destinationBranch']);
    
    return loadingForms;
  } catch (error) {
    logger.error(`Error getting today's loading forms: ${error.message}`, { error });
    throw error;
  }
};

module.exports = {
  createLoadingForm,
  getAllLoadingForms,
  getLoadingFormById,
  getLoadingFormByLoadingNo,
  updateLoadingForm,
  updateStatus,
  addShipment,
  removeShipment,
  updateShipmentStatus,
  addLoadingConfirmation,
  generateDocument,
  optimizeLoading,
  getVehicleLoadingForms,
  getTodayLoadingForms,
};
