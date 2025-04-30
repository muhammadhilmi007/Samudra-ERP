/**
 * Samudra Paket ERP - Division Controller
 * Handles division-related HTTP requests
 */

// eslint-disable-next-line max-len
const MongoDivisionRepository = require('../../infrastructure/repositories/mongoDivisionRepository');
const { NotFoundError } = require('../../domain/utils/errorUtils');

// Repository class - will be instantiated in each method
// This allows for better testability

/**
 * Create a new division
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const createDivision = async (req, res, next) => {
  try {
    const repository = new MongoDivisionRepository();
    const division = await repository.create(req.body);

    return res.status(201).json({
      success: true,
      data: division,
      message: 'Division created successfully',
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Get all divisions with optional filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getAllDivisions = async (req, res, next) => {
  try {
    const {
      page,
      limit,
      sortBy,
      sortOrder,
      branch,
      parentDivision,
      status,
    } = req.query;

    // Build query object
    const query = {};
    if (branch) query.branch = branch;
    if (parentDivision) {
      query.parentDivision = parentDivision === 'null' ? null : parentDivision;
    }
    if (status) query.status = status;

    // Build options object
    const options = {
      page: parseInt(page, 10) || 1,
      limit: parseInt(limit, 10) || 10,
      sortBy: sortBy || 'name',
      sortOrder: sortOrder || 'asc',
      populate: ['branch', 'parentDivision'],
    };

    const repository = new MongoDivisionRepository();
    const result = await repository.findByQuery(query, options);

    return res.status(200).json({
      success: true,
      data: result.results,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.totalResults,
        totalPages: result.totalPages,
      },
      message: 'Divisions retrieved successfully',
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Get a division by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getDivisionById = async (req, res, next) => {
  try {
    const repository = new MongoDivisionRepository();
    const division = await repository.findById(req.params.id);

    if (!division) {
      return next(new NotFoundError(`Division with ID ${req.params.id} not found`));
    }

    return res.status(200).json({
      success: true,
      data: division,
      message: 'Division retrieved successfully',
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Update a division
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const updateDivision = async (req, res, next) => {
  try {
    const repository = new MongoDivisionRepository();
    const division = await repository.update(req.params.id, req.body);

    return res.status(200).json({
      success: true,
      data: division,
      message: 'Division updated successfully',
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Delete a division
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const deleteDivision = async (req, res, next) => {
  try {
    const repository = new MongoDivisionRepository();
    await repository.delete(req.params.id);

    return res.status(200).json({
      success: true,
      data: null,
      message: 'Division deleted successfully',
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Get division hierarchy
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getDivisionHierarchy = async (req, res, next) => {
  try {
    const repository = new MongoDivisionRepository();
    const hierarchy = await repository.getHierarchy(req.params.id);

    return res.status(200).json({
      success: true,
      data: hierarchy,
      message: 'Division hierarchy retrieved successfully',
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Get divisions by branch
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getDivisionsByBranch = async (req, res, next) => {
  try {
    const repository = new MongoDivisionRepository();
    const divisions = await repository.findByBranch(req.params.branchId);

    return res.status(200).json({
      success: true,
      data: divisions,
      message: 'Divisions retrieved successfully',
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Get child divisions
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getChildDivisions = async (req, res, next) => {
  try {
    const repository = new MongoDivisionRepository();
    const divisions = await repository.findChildren(req.params.parentId);

    return res.status(200).json({
      success: true,
      data: divisions,
      message: 'Child divisions retrieved successfully',
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createDivision,
  getAllDivisions,
  getDivisionById,
  updateDivision,
  deleteDivision,
  getDivisionHierarchy,
  getDivisionsByBranch,
  getChildDivisions,
};
