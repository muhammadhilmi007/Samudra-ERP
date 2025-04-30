/**
 * Samudra Paket ERP - Position Routes
 * Defines API routes for position management
 */

const express = require('express');
const { validateRequest } = require('../middleware/validationMiddleware');
const { authenticate } = require('../middleware/authMiddleware');
const { checkPermission } = require('../middleware/permissionMiddleware');
const positionController = require('../controllers/positionController');
const {
  createPositionSchema,
  updatePositionSchema,
  queryPositionsSchema,
  idParamSchema,
} = require('../validators/positionValidator');

const router = express.Router();

/**
 * @route   POST /api/positions
 * @desc    Create a new position
 * @access  Private (Admin, HR Manager)
 */
router.post(
  '/',
  authenticate,
  checkPermission('positions:create'),
  validateRequest(createPositionSchema),
  positionController.createPosition,
);

/**
 * @route   GET /api/positions
 * @desc    Get all positions with optional filtering
 * @access  Private
 */
router.get(
  '/',
  authenticate,
  checkPermission('positions:read'),
  validateRequest(queryPositionsSchema, 'query'),
  positionController.getAllPositions,
);

/**
 * @route   GET /api/positions/:id
 * @desc    Get a position by ID
 * @access  Private
 */
router.get(
  '/:id',
  authenticate,
  checkPermission('positions:read'),
  validateRequest(idParamSchema, 'params'),
  positionController.getPositionById,
);

/**
 * @route   PUT /api/positions/:id
 * @desc    Update a position
 * @access  Private (Admin, HR Manager)
 */
router.put(
  '/:id',
  authenticate,
  checkPermission('positions:update'),
  validateRequest(idParamSchema, 'params'),
  validateRequest(updatePositionSchema),
  positionController.updatePosition,
);

/**
 * @route   DELETE /api/positions/:id
 * @desc    Delete a position
 * @access  Private (Admin)
 */
router.delete(
  '/:id',
  authenticate,
  checkPermission('positions:delete'),
  validateRequest(idParamSchema, 'params'),
  positionController.deletePosition,
);

/**
 * @route   GET /api/positions/hierarchy
 * @desc    Get position hierarchy
 * @access  Private
 */
router.get(
  '/hierarchy',
  authenticate,
  checkPermission('positions:read'),
  positionController.getPositionHierarchy,
);

/**
 * @route   GET /api/positions/division/:divisionId
 * @desc    Get positions by division
 * @access  Private
 */
router.get(
  '/division/:divisionId',
  authenticate,
  checkPermission('positions:read'),
  positionController.getPositionsByDivision,
);

/**
 * @route   GET /api/positions/subordinates/:parentId
 * @desc    Get subordinate positions
 * @access  Private
 */
router.get(
  '/subordinates/:parentId',
  authenticate,
  checkPermission('positions:read'),
  positionController.getSubordinatePositions,
);

module.exports = router;
