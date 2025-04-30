/**
 * Samudra Paket ERP - Position Controller
 * Handles position-related HTTP requests
 */
// eslint-disable-next-line max-len
const MongoPositionRepository = require('../../infrastructure/repositories/mongoPositionRepository');
const { NotFoundError } = require('../../domain/utils/errorUtils');

// Repository class - will be instantiated in each method
// This allows for better testability

/**
 * Create a new position
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const createPosition = async (req, res, next) => {
  try {
    const repository = new MongoPositionRepository();
    const position = await repository.create(req.body);

    res.status(201).json({
      success: true,
      data: position,
      message: 'Position created successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all positions with optional filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getAllPositions = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = 'title',
      sortOrder = 'asc',
      code,
      title,
      division,
      parentPosition,
      status,
      level,
    } = req.query;

    // Build query object
    const query = {};
    if (code) query.code = new RegExp(code, 'i');
    if (title) query.title = new RegExp(title, 'i');
    if (division) query.division = division;
    if (parentPosition) {
      query.parentPosition = parentPosition === 'null' ? null : parentPosition;
    }
    if (status) query.status = status;
    if (level !== undefined) query.level = parseInt(level, 10);

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sortBy,
      sortOrder,
    };

    const repository = new MongoPositionRepository();
    const positions = await repository.findByQuery(query, options);

    res.status(200).json({
      success: true,
      data: positions.results,
      meta: positions.pagination,
      message: 'Positions retrieved successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a position by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getPositionById = async (req, res, next) => {
  try {
    const repository = new MongoPositionRepository();
    const position = await repository.findById(req.params.id);

    if (!position) {
      return next(new NotFoundError(`Position with ID ${req.params.id} not found`));
    }

    return res.status(200).json({
      success: true,
      data: position,
      message: 'Position retrieved successfully',
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Update a position
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const updatePosition = async (req, res, next) => {
  try {
    const repository = new MongoPositionRepository();
    const position = await repository.update(req.params.id, req.body);

    res.status(200).json({
      success: true,
      data: position,
      message: 'Position updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a position
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const deletePosition = async (req, res, next) => {
  try {
    const repository = new MongoPositionRepository();
    await repository.delete(req.params.id);

    res.status(200).json({
      success: true,
      data: null,
      message: 'Position deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get position hierarchy
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getPositionHierarchy = async (req, res, next) => {
  try {
    const repository = new MongoPositionRepository();
    const hierarchy = await repository.getHierarchy(req.query.rootId || null);

    res.status(200).json({
      success: true,
      data: hierarchy,
      message: 'Position hierarchy retrieved successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get positions by division
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getPositionsByDivision = async (req, res, next) => {
  try {
    const repository = new MongoPositionRepository();
    const positions = await repository.findByDivision(req.params.divisionId);

    res.status(200).json({
      success: true,
      data: positions,
      message: 'Positions retrieved successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get subordinate positions
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getSubordinatePositions = async (req, res, next) => {
  try {
    const repository = new MongoPositionRepository();
    const positions = await repository.findSubordinates(req.params.parentId);

    res.status(200).json({
      success: true,
      data: positions,
      message: 'Subordinate positions retrieved successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPosition,
  getAllPositions,
  getPositionById,
  updatePosition,
  deletePosition,
  getPositionHierarchy,
  getPositionsByDivision,
  getSubordinatePositions,
};
