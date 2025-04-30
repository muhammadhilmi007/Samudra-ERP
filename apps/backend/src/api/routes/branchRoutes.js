/**
 * Samudra Paket ERP - Branch Routes
 * Defines API routes for branch management
 */

const express = require('express');

const router = express.Router();
const branchController = require('../controllers/branchController');
const { authenticate } = require('../middleware/authMiddleware');
const { checkPermission } = require('../middleware/permissionMiddleware');

// Branch routes
router.post(
  '/',
  authenticate,
  checkPermission('BRANCH_CREATE'),
  branchController.createBranch,
);

router.get(
  '/',
  authenticate,
  checkPermission('BRANCH_READ'),
  branchController.getAllBranches,
);

router.get(
  '/hierarchy',
  authenticate,
  checkPermission('BRANCH_READ'),
  branchController.getBranchHierarchy,
);

router.get(
  '/:id',
  authenticate,
  checkPermission('BRANCH_READ'),
  branchController.getBranchById,
);

router.put(
  '/:id',
  authenticate,
  checkPermission('BRANCH_UPDATE'),
  branchController.updateBranch,
);

router.patch(
  '/:id/status',
  authenticate,
  checkPermission('BRANCH_UPDATE'),
  branchController.updateBranchStatus,
);

router.delete(
  '/:id',
  authenticate,
  checkPermission('BRANCH_DELETE'),
  branchController.deleteBranch,
);

// Division routes (nested under branches)
router.post(
  '/:branchId/divisions',
  authenticate,
  checkPermission('BRANCH_UPDATE'),
  branchController.addDivision,
);

router.put(
  '/:branchId/divisions/:divisionId',
  authenticate,
  checkPermission('BRANCH_UPDATE'),
  branchController.updateDivision,
);

router.delete(
  '/:branchId/divisions/:divisionId',
  authenticate,
  checkPermission('BRANCH_UPDATE'),
  branchController.deleteDivision,
);

module.exports = router;
