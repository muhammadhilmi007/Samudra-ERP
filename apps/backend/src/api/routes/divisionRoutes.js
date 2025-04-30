/**
 * Samudra Paket ERP - Division Routes
 * Defines API routes for division management
 */

const express = require('express');
const { validateRequest } = require('../middleware/validationMiddleware');
const { authenticate } = require('../middleware/authMiddleware');
const { checkPermission } = require('../middleware/permissionMiddleware');
const divisionController = require('../controllers/divisionController');
const {
  createDivisionSchema,
  updateDivisionSchema,
  queryDivisionsSchema,
  idParamSchema,
} = require('../validators/divisionValidator');

const router = express.Router();

/**
 * @route   POST /api/divisions
 * @desc    Create a new division
 * @access  Private (Admin, HR Manager)
 */
router.post(
  '/',
  authenticate,
  checkPermission('divisions:create'),
  validateRequest(createDivisionSchema),
  divisionController.createDivision,
);

/**
 * @route   GET /api/divisions
 * @desc    Get all divisions with optional filtering
 * @access  Private
 */
router.get(
  '/',
  authenticate,
  checkPermission('divisions:read'),
  validateRequest(queryDivisionsSchema, 'query'),
  divisionController.getAllDivisions,
);

/**
 * @route   GET /api/divisions/:id
 * @desc    Get a division by ID
 * @access  Private
 */
router.get(
  '/:id',
  authenticate,
  checkPermission('divisions:read'),
  validateRequest(idParamSchema, 'params'),
  divisionController.getDivisionById,
);

/**
 * @route   PUT /api/divisions/:id
 * @desc    Update a division
 * @access  Private (Admin, HR Manager)
 */
router.put(
  '/:id',
  authenticate,
  checkPermission('divisions:update'),
  validateRequest(idParamSchema, 'params'),
  validateRequest(updateDivisionSchema),
  divisionController.updateDivision,
);

/**
 * @route   DELETE /api/divisions/:id
 * @desc    Delete a division
 * @access  Private (Admin)
 */
router.delete(
  '/:id',
  authenticate,
  checkPermission('divisions:delete'),
  validateRequest(idParamSchema, 'params'),
  divisionController.deleteDivision,
);

/**
 * @route   GET /api/divisions/hierarchy
 * @desc    Get division hierarchy
 * @access  Private
 */
router.get(
  '/hierarchy',
  authenticate,
  checkPermission('divisions:read'),
  divisionController.getDivisionHierarchy,
);

/**
 * @route   GET /api/divisions/branch/:branchId
 * @desc    Get divisions by branch
 * @access  Private
 */
router.get(
  '/branch/:branchId',
  authenticate,
  checkPermission('divisions:read'),
  divisionController.getDivisionsByBranch,
);

/**
 * @route   GET /api/divisions/children/:parentId
 * @desc    Get child divisions
 * @access  Private
 */
router.get(
  '/children/:parentId',
  authenticate,
  checkPermission('divisions:read'),
  divisionController.getChildDivisions,
);

module.exports = router;
