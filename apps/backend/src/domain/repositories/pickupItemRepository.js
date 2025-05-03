/**
 * Samudra Paket ERP - Pickup Item Repository
 * Handles business logic for pickup items
 */

const mongoose = require('mongoose');
const PickupItem = require('../models/pickupItem');
const PickupRequest = require('../models/pickupRequest');
const PickupAssignment = require('../models/pickupAssignment');
const logger = require('../../utils/logger');

/**
 * Create a new pickup item
 * @param {Object} itemData - Pickup item data
 * @returns {Promise<Object>} Created pickup item
 */
const createPickupItem = async (itemData) => {
  try {
    // Generate a unique code for the pickup item
    const code = await PickupItem.generateCode(itemData.pickupRequest);
    
    // Create the pickup item
    const pickupItem = new PickupItem({
      ...itemData,
      code,
    });
    
    // Save the pickup item
    await pickupItem.save();
    
    // Update the pickup request status if needed
    await updatePickupRequestStatus(itemData.pickupRequest);
    
    return pickupItem;
  } catch (error) {
    logger.error(`Error creating pickup item: ${error.message}`, { stack: error.stack });
    throw error;
  }
};

/**
 * Get all pickup items with filtering and pagination
 * @param {Object} filter - Filter criteria
 * @param {Object} options - Pagination and sorting options
 * @returns {Promise<Object>} Pickup items and metadata
 */
const getAllPickupItems = async (filter = {}, options = {}) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      sortBy = 'createdAt', 
      sortOrder = 'desc',
      status,
      pickupRequest,
      pickupAssignment,
      category,
      createdBy,
      verifiedBy
    } = options;
    
    // Build the query
    const query = {};
    
    if (status) query.status = status;
    if (pickupRequest) query.pickupRequest = pickupRequest;
    if (pickupAssignment) query.pickupAssignment = pickupAssignment;
    if (category) query.category = category;
    if (createdBy) query.createdBy = createdBy;
    if (verifiedBy) query.verifiedBy = verifiedBy;
    
    // Add additional filters
    if (filter.code) query.code = { $regex: filter.code, $options: 'i' };
    if (filter.description) query.description = { $regex: filter.description, $options: 'i' };
    
    // Date range filters
    if (filter.createdAtFrom || filter.createdAtTo) {
      query.createdAt = {};
      if (filter.createdAtFrom) query.createdAt.$gte = new Date(filter.createdAtFrom);
      if (filter.createdAtTo) query.createdAt.$lte = new Date(filter.createdAtTo);
    }
    
    // Weight range filters
    if (filter.weightFrom || filter.weightTo) {
      query['weight.value'] = {};
      if (filter.weightFrom) query['weight.value'].$gte = Number(filter.weightFrom);
      if (filter.weightTo) query['weight.value'].$lte = Number(filter.weightTo);
    }
    
    // Calculate skip value for pagination
    const skip = (page - 1) * limit;
    
    // Define sort order
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
    
    // Execute the query with pagination
    const items = await PickupItem.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('pickupRequest', 'code customer scheduledDate')
      .populate('pickupAssignment', 'code assignmentDate')
      .populate('createdBy', 'username firstName lastName')
      .populate('verifiedBy', 'username firstName lastName');
    
    // Get the total count
    const total = await PickupItem.countDocuments(query);
    
    // Calculate total pages
    const totalPages = Math.ceil(total / limit);
    
    return {
      data: items,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages,
      },
    };
  } catch (error) {
    logger.error(`Error getting pickup items: ${error.message}`, { stack: error.stack });
    throw error;
  }
};

/**
 * Get a pickup item by ID
 * @param {string} id - Pickup item ID
 * @param {Array} populate - Fields to populate
 * @returns {Promise<Object>} Pickup item
 */
const getPickupItemById = async (id, populate = []) => {
  try {
    let query = PickupItem.findById(id);
    
    // Apply population if specified
    if (populate.includes('pickupRequest')) {
      query = query.populate('pickupRequest');
    }
    
    if (populate.includes('pickupAssignment')) {
      query = query.populate('pickupAssignment');
    }
    
    if (populate.includes('createdBy')) {
      query = query.populate('createdBy', 'username firstName lastName');
    }
    
    if (populate.includes('verifiedBy')) {
      query = query.populate('verifiedBy', 'username firstName lastName');
    }
    
    const pickupItem = await query.exec();
    
    if (!pickupItem) {
      return null;
    }
    
    return pickupItem;
  } catch (error) {
    logger.error(`Error getting pickup item by ID: ${error.message}`, { stack: error.stack });
    throw error;
  }
};

/**
 * Get a pickup item by code
 * @param {string} code - Pickup item code
 * @param {Array} populate - Fields to populate
 * @returns {Promise<Object>} Pickup item
 */
const getPickupItemByCode = async (code, populate = []) => {
  try {
    let query = PickupItem.findOne({ code });
    
    // Apply population if specified
    if (populate.includes('pickupRequest')) {
      query = query.populate('pickupRequest');
    }
    
    if (populate.includes('pickupAssignment')) {
      query = query.populate('pickupAssignment');
    }
    
    if (populate.includes('createdBy')) {
      query = query.populate('createdBy', 'username firstName lastName');
    }
    
    if (populate.includes('verifiedBy')) {
      query = query.populate('verifiedBy', 'username firstName lastName');
    }
    
    const pickupItem = await query.exec();
    
    if (!pickupItem) {
      return null;
    }
    
    return pickupItem;
  } catch (error) {
    logger.error(`Error getting pickup item by code: ${error.message}`, { stack: error.stack });
    throw error;
  }
};

/**
 * Update a pickup item
 * @param {string} id - Pickup item ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated pickup item
 */
const updatePickupItem = async (id, updateData) => {
  try {
    // Find the pickup item
    const pickupItem = await PickupItem.findById(id);
    
    if (!pickupItem) {
      throw new Error('Pickup item not found');
    }
    
    // Prevent updating certain fields
    const protectedFields = ['code', 'pickupRequest', 'pickupAssignment', 'createdBy', 'createdAt'];
    protectedFields.forEach(field => {
      if (updateData[field]) {
        delete updateData[field];
      }
    });
    
    // Update the pickup item
    Object.keys(updateData).forEach(key => {
      pickupItem[key] = updateData[key];
    });
    
    // Save the updated pickup item
    await pickupItem.save();
    
    return pickupItem;
  } catch (error) {
    logger.error(`Error updating pickup item: ${error.message}`, { stack: error.stack });
    throw error;
  }
};

/**
 * Update pickup item status
 * @param {string} id - Pickup item ID
 * @param {string} status - New status
 * @param {string} userId - User ID making the update
 * @param {Object} additionalData - Additional data for the update
 * @returns {Promise<Object>} Updated pickup item
 */
const updateStatus = async (id, status, userId, additionalData = {}) => {
  try {
    // Find the pickup item
    const pickupItem = await PickupItem.findById(id);
    
    if (!pickupItem) {
      throw new Error('Pickup item not found');
    }
    
    // Validate status transition
    const validTransitions = {
      pending: ['verified', 'rejected'],
      verified: ['processed', 'rejected'],
      rejected: ['pending'],
      processed: ['shipped'],
      shipped: []
    };
    
    if (!validTransitions[pickupItem.status].includes(status)) {
      throw new Error(`Invalid status transition from ${pickupItem.status} to ${status}`);
    }
    
    // Update the status
    pickupItem.status = status;
    pickupItem.updatedBy = userId;
    
    // Handle status-specific updates
    if (status === 'verified') {
      pickupItem.verifiedBy = userId;
      pickupItem.verifiedAt = new Date();
    }
    
    // Add any additional data
    if (additionalData.notes) {
      pickupItem.notes = additionalData.notes;
    }
    
    // Save the updated pickup item
    await pickupItem.save();
    
    // Update the pickup request status if needed
    await updatePickupRequestStatus(pickupItem.pickupRequest);
    
    return pickupItem;
  } catch (error) {
    logger.error(`Error updating pickup item status: ${error.message}`, { stack: error.stack });
    throw error;
  }
};

/**
 * Add an image to a pickup item
 * @param {string} id - Pickup item ID
 * @param {Object} imageData - Image data
 * @param {string} userId - User ID adding the image
 * @returns {Promise<Object>} Updated pickup item
 */
const addImage = async (id, imageData, userId) => {
  try {
    // Find the pickup item
    const pickupItem = await PickupItem.findById(id);
    
    if (!pickupItem) {
      throw new Error('Pickup item not found');
    }
    
    // Create the image object
    const image = {
      url: imageData.url,
      type: imageData.type || 'item',
      caption: imageData.caption,
      timestamp: new Date(),
      takenBy: userId
    };
    
    // Add the image to the pickup item
    pickupItem.images.push(image);
    pickupItem.updatedBy = userId;
    
    // Save the updated pickup item
    await pickupItem.save();
    
    return pickupItem;
  } catch (error) {
    logger.error(`Error adding image to pickup item: ${error.message}`, { stack: error.stack });
    throw error;
  }
};

/**
 * Remove an image from a pickup item
 * @param {string} id - Pickup item ID
 * @param {string} imageId - Image ID
 * @param {string} userId - User ID removing the image
 * @returns {Promise<Object>} Updated pickup item
 */
const removeImage = async (id, imageId, userId) => {
  try {
    // Find the pickup item
    const pickupItem = await PickupItem.findById(id);
    
    if (!pickupItem) {
      throw new Error('Pickup item not found');
    }
    
    // Find the image
    const imageIndex = pickupItem.images.findIndex(img => img._id.toString() === imageId);
    
    if (imageIndex === -1) {
      throw new Error('Image not found');
    }
    
    // Remove the image
    pickupItem.images.splice(imageIndex, 1);
    pickupItem.updatedBy = userId;
    
    // Save the updated pickup item
    await pickupItem.save();
    
    return pickupItem;
  } catch (error) {
    logger.error(`Error removing image from pickup item: ${error.message}`, { stack: error.stack });
    throw error;
  }
};

/**
 * Add a digital signature to a pickup item
 * @param {string} id - Pickup item ID
 * @param {Object} signatureData - Signature data
 * @param {string} userId - User ID adding the signature
 * @returns {Promise<Object>} Updated pickup item
 */
const addSignature = async (id, signatureData, userId) => {
  try {
    // Find the pickup item
    const pickupItem = await PickupItem.findById(id);
    
    if (!pickupItem) {
      throw new Error('Pickup item not found');
    }
    
    // Update the signature
    pickupItem.signature = {
      image: signatureData.image,
      name: signatureData.name,
      timestamp: new Date()
    };
    
    pickupItem.updatedBy = userId;
    
    // Save the updated pickup item
    await pickupItem.save();
    
    return pickupItem;
  } catch (error) {
    logger.error(`Error adding signature to pickup item: ${error.message}`, { stack: error.stack });
    throw error;
  }
};

/**
 * Update weight and dimensions of a pickup item
 * @param {string} id - Pickup item ID
 * @param {Object} measurementData - Weight and dimension data
 * @param {string} userId - User ID updating the measurements
 * @returns {Promise<Object>} Updated pickup item
 */
const updateMeasurements = async (id, measurementData, userId) => {
  try {
    // Find the pickup item
    const pickupItem = await PickupItem.findById(id);
    
    if (!pickupItem) {
      throw new Error('Pickup item not found');
    }
    
    // Update weight if provided
    if (measurementData.weight) {
      pickupItem.weight = measurementData.weight;
    }
    
    // Update dimensions if provided
    if (measurementData.dimensions) {
      pickupItem.dimensions = measurementData.dimensions;
    }
    
    pickupItem.updatedBy = userId;
    
    // Save the updated pickup item
    await pickupItem.save();
    
    return pickupItem;
  } catch (error) {
    logger.error(`Error updating measurements for pickup item: ${error.message}`, { stack: error.stack });
    throw error;
  }
};

/**
 * Get pickup items by pickup request ID
 * @param {string} pickupRequestId - Pickup request ID
 * @returns {Promise<Array>} Pickup items
 */
const getItemsByPickupRequest = async (pickupRequestId) => {
  try {
    const items = await PickupItem.find({ pickupRequest: pickupRequestId })
      .populate('createdBy', 'username firstName lastName')
      .populate('verifiedBy', 'username firstName lastName');
    
    return items;
  } catch (error) {
    logger.error(`Error getting items by pickup request: ${error.message}`, { stack: error.stack });
    throw error;
  }
};

/**
 * Get pickup items by pickup assignment ID
 * @param {string} pickupAssignmentId - Pickup assignment ID
 * @returns {Promise<Array>} Pickup items
 */
const getItemsByPickupAssignment = async (pickupAssignmentId) => {
  try {
    const items = await PickupItem.find({ pickupAssignment: pickupAssignmentId })
      .populate('pickupRequest', 'code customer scheduledDate')
      .populate('createdBy', 'username firstName lastName')
      .populate('verifiedBy', 'username firstName lastName');
    
    return items;
  } catch (error) {
    logger.error(`Error getting items by pickup assignment: ${error.message}`, { stack: error.stack });
    throw error;
  }
};

/**
 * Update pickup request status based on its items
 * @param {string} pickupRequestId - Pickup request ID
 * @returns {Promise<void>}
 */
const updatePickupRequestStatus = async (pickupRequestId) => {
  try {
    // Get all items for this pickup request
    const items = await PickupItem.find({ pickupRequest: pickupRequestId });
    
    if (items.length === 0) {
      return; // No items, no status update needed
    }
    
    // Get the pickup request
    const pickupRequest = await PickupRequest.findById(pickupRequestId);
    
    if (!pickupRequest) {
      throw new Error('Pickup request not found');
    }
    
    // If all items are verified, update the pickup request status
    const allVerified = items.every(item => item.status === 'verified' || item.status === 'processed' || item.status === 'shipped');
    const anyRejected = items.some(item => item.status === 'rejected');
    
    if (allVerified && pickupRequest.status === 'in_progress') {
      pickupRequest.status = 'completed';
      await pickupRequest.save();
    } else if (anyRejected && pickupRequest.status === 'in_progress') {
      // If any items are rejected, but not all, keep the status as in_progress
      // This allows for partial completion of pickup requests
    }
  } catch (error) {
    logger.error(`Error updating pickup request status: ${error.message}`, { stack: error.stack });
    throw error;
  }
};

module.exports = {
  createPickupItem,
  getAllPickupItems,
  getPickupItemById,
  getPickupItemByCode,
  updatePickupItem,
  updateStatus,
  addImage,
  removeImage,
  addSignature,
  updateMeasurements,
  getItemsByPickupRequest,
  getItemsByPickupAssignment
};
