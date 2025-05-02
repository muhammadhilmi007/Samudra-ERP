/**
 * Samudra Paket ERP - Customer Controller
 * Handles API requests for customer management
 */

const customerRepository = require('../../domain/repositories/customerRepository');
const { ApiError } = require('../../infrastructure/errors/ApiError');

/**
 * Create a new customer
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
exports.createCustomer = async (req, res, next) => {
  try {
    // Add the current user as the registeredBy
    const customerData = {
      ...req.body,
      registeredBy: req.user.id,
    };

    // Create customer
    const customer = await customerRepository.createCustomer(customerData);

    // Add creation activity to history
    await customerRepository.addCustomerActivity(
      customer._id,
      'created',
      req.user.id,
      { details: 'Customer account created' },
    );

    res.status(201).json({
      success: true,
      data: customer,
      message: 'Customer created successfully',
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return next(ApiError.validationError(error.message));
    }
    if (error.code === 11000) {
      return next(ApiError.conflict('Customer code already exists'));
    }
    next(error);
  }
};

/**
 * Get all customers
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
exports.getAllCustomers = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = 'name',
      sortOrder = 'asc',
      search = '',
      category = '',
      status = '',
      city = '',
      province = '',
      populate = '',
    } = req.query;

    // Convert populate string to array if provided
    const populateArray = populate ? populate.split(',') : [];

    // Get customers with filters and pagination
    const result = await customerRepository.getAllCustomers(
      {},
      {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sortBy,
        sortOrder,
        search,
        category,
        status,
        city,
        province,
        populate: populateArray,
      },
    );

    res.status(200).json({
      success: true,
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get customer by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
exports.getCustomerById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { populate = '' } = req.query;

    // Convert populate string to array if provided
    const populateArray = populate ? populate.split(',') : [];

    const customer = await customerRepository.getCustomerById(id, populateArray);

    if (!customer) {
      return next(ApiError.notFound('Customer not found'));
    }

    res.status(200).json({
      success: true,
      data: customer,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return next(ApiError.badRequest('Invalid customer ID format'));
    }
    next(error);
  }
};

/**
 * Update customer
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
exports.updateCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove fields that shouldn't be updated directly
    delete updateData.registeredBy;
    delete updateData.activityHistory;
    delete updateData.createdAt;

    const customer = await customerRepository.updateCustomer(id, updateData, { new: true });

    if (!customer) {
      return next(ApiError.notFound('Customer not found'));
    }

    // Add update activity to history
    await customerRepository.addCustomerActivity(
      customer._id,
      'updated',
      req.user.id,
      { details: 'Customer information updated', updatedFields: Object.keys(updateData) },
    );

    res.status(200).json({
      success: true,
      data: customer,
      message: 'Customer updated successfully',
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return next(ApiError.validationError(error.message));
    }
    if (error.name === 'CastError') {
      return next(ApiError.badRequest('Invalid customer ID format'));
    }
    next(error);
  }
};

/**
 * Delete customer
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
exports.deleteCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Instead of deleting, we can mark as inactive
    const customer = await customerRepository.updateCustomer(id, { status: 'inactive' });

    if (!customer) {
      return next(ApiError.notFound('Customer not found'));
    }

    // Add deletion activity to history
    await customerRepository.addCustomerActivity(
      customer._id,
      'deactivated',
      req.user.id,
      { details: 'Customer account deactivated' },
    );

    res.status(200).json({
      success: true,
      message: 'Customer deactivated successfully',
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return next(ApiError.badRequest('Invalid customer ID format'));
    }
    next(error);
  }
};

/**
 * Get customer activity history
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
exports.getCustomerActivityHistory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10, sortOrder = 'desc' } = req.query;

    const result = await customerRepository.getCustomerActivityHistory(id, {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sortOrder,
    });

    res.status(200).json({
      success: true,
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    if (error.message === 'Customer not found') {
      return next(ApiError.notFound('Customer not found'));
    }
    if (error.name === 'CastError') {
      return next(ApiError.badRequest('Invalid customer ID format'));
    }
    next(error);
  }
};

/**
 * Add customer activity
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
exports.addCustomerActivity = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action, details } = req.body;

    if (!action) {
      return next(ApiError.badRequest('Action is required'));
    }

    const customer = await customerRepository.addCustomerActivity(
      id,
      action,
      req.user.id,
      details || {},
    );

    if (!customer) {
      return next(ApiError.notFound('Customer not found'));
    }

    res.status(200).json({
      success: true,
      message: 'Activity added successfully',
    });
  } catch (error) {
    if (error.message === 'Customer not found') {
      return next(ApiError.notFound('Customer not found'));
    }
    if (error.name === 'CastError') {
      return next(ApiError.badRequest('Invalid customer ID format'));
    }
    next(error);
  }
};

/**
 * Get customers by category
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
exports.getCustomersByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;
    const {
      page = 1,
      limit = 10,
      sortBy = 'name',
      sortOrder = 'asc',
      populate = '',
    } = req.query;

    // Convert populate string to array if provided
    const populateArray = populate ? populate.split(',') : [];

    const result = await customerRepository.getCustomersByCategory(
      category,
      {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sortBy,
        sortOrder,
        populate: populateArray,
      },
    );

    res.status(200).json({
      success: true,
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Search customers
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
exports.searchCustomers = async (req, res, next) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return next(ApiError.badRequest('Search query is required'));
    }

    const {
      page = 1,
      limit = 10,
      sortBy = 'name',
      sortOrder = 'asc',
      populate = '',
    } = req.query;

    // Convert populate string to array if provided
    const populateArray = populate ? populate.split(',') : [];

    const result = await customerRepository.searchCustomers(
      query,
      {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sortBy,
        sortOrder,
        populate: populateArray,
      },
    );

    res.status(200).json({
      success: true,
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
};
