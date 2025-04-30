/**
 * Samudra Paket ERP - Package Controller
 * Handles package-related API endpoints
 */

const { createApiError } = require('../../domain/utils/errorUtils');
const MongoPackageRepository = require('../../infrastructure/repositories/mongoPackageRepository');

// Initialize repository
const packageRepository = new MongoPackageRepository();

/**
 * Get all packages with optional filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllPackages = async (req, res) => {
  try {
    const { status, service } = req.query;

    // Build filter object for MongoDB query
    const filters = {};
    if (status) filters.status = status;
    if (service) filters.service = service;

    // Get packages from repository
    const packages = await packageRepository.findAll(filters);

    return res.json({
      success: true,
      data: packages,
      meta: {
        total: packages.length,
      },
    });
  } catch (error) {
    console.error('Get all packages error:', error);
    return res.status(500).json(
      createApiError('SERVER_ERROR', 'Internal server error', { details: error.message }),
    );
  }
};

/**
 * Get package by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getPackageById = async (req, res) => {
  try {
    const { id } = req.params;

    // Get package from repository
    const pkg = await packageRepository.findById(id);

    if (!pkg) {
      return res.status(404).json(
        createApiError('NOT_FOUND', 'Package not found'),
      );
    }

    return res.json({
      success: true,
      data: pkg,
    });
  } catch (error) {
    console.error('Get package by ID error:', error);
    return res.status(500).json(
      createApiError('SERVER_ERROR', 'Internal server error', { details: error.message }),
    );
  }
};

/**
 * Create a new package
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createPackage = async (req, res) => {
  try {
    const {
      weight, dimensions, sender, recipient, service, price, notes,
    } = req.body;

    // Basic validation
    if (!weight || !dimensions || !sender || !recipient || !service || !price) {
      return res.status(400).json(
        createApiError('INVALID_INPUT', 'Missing required fields'),
      );
    }

    // Create package using repository
    const newPackage = await packageRepository.create({
      weight,
      dimensions,
      sender,
      recipient,
      service,
      price,
      notes: notes || '',
      status: 'PENDING',
    });

    return res.status(201).json({
      success: true,
      data: newPackage,
    });
  } catch (error) {
    console.error('Create package error:', error);
    return res.status(500).json(
      createApiError('SERVER_ERROR', 'Internal server error', { details: error.message }),
    );
  }
};

/**
 * Update a package
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updatePackage = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Update package using repository
    const updatedPackage = await packageRepository.update(id, updateData);

    if (!updatedPackage) {
      return res.status(404).json(
        createApiError('NOT_FOUND', 'Package not found'),
      );
    }

    return res.json({
      success: true,
      data: updatedPackage,
    });
  } catch (error) {
    console.error('Update package error:', error);
    return res.status(500).json(
      createApiError('SERVER_ERROR', 'Internal server error', { details: error.message }),
    );
  }
};

/**
 * Update package status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updatePackageStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Basic validation
    if (!status) {
      return res.status(400).json(
        createApiError('INVALID_INPUT', 'Status is required'),
      );
    }

    // Validate status value
    const validStatuses = [
      'PENDING', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY',
      'DELIVERED', 'FAILED_DELIVERY', 'RETURNED', 'CANCELLED',
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json(
        createApiError('INVALID_INPUT', 'Invalid status value'),
      );
    }

    // Update package status using repository
    const updatedPackage = await packageRepository.updateStatus(id, status);

    if (!updatedPackage) {
      return res.status(404).json(
        createApiError('NOT_FOUND', 'Package not found'),
      );
    }

    return res.json({
      success: true,
      data: updatedPackage,
    });
  } catch (error) {
    console.error('Update package status error:', error);
    return res.status(500).json(
      createApiError('SERVER_ERROR', 'Internal server error', { details: error.message }),
    );
  }
};

module.exports = {
  getAllPackages,
  getPackageById,
  createPackage,
  updatePackage,
  updatePackageStatus,
};
