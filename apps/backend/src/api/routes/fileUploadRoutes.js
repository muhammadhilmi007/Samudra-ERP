/**
 * Samudra Paket ERP - File Upload Routes
 * Defines API routes for file uploads
 */

const express = require('express');
const fileUploadController = require('../controllers/fileUploadController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

/**
 * @route   POST /api/uploads/image
 * @desc    Upload an image
 * @access  Private (Driver, Checker, Operations)
 */
router.post(
  '/image',
  authorize(['admin', 'manager', 'operations', 'warehouse', 'driver', 'checker']),
  fileUploadController.uploadImage,
);

/**
 * @route   POST /api/uploads/signature
 * @desc    Upload a signature
 * @access  Private (Driver, Checker, Operations)
 */
router.post(
  '/signature',
  authorize(['admin', 'manager', 'operations', 'warehouse', 'driver', 'checker']),
  fileUploadController.uploadSignature,
);

/**
 * @route   POST /api/uploads/document
 * @desc    Upload a document
 * @access  Private (Driver, Checker, Operations)
 */
router.post(
  '/document',
  authorize(['admin', 'manager', 'operations', 'warehouse', 'driver', 'checker']),
  fileUploadController.uploadDocument,
);

/**
 * @route   DELETE /api/uploads/file
 * @desc    Delete a file
 * @access  Private (Admin, Manager, Operations)
 */
router.delete(
  '/file',
  authorize(['admin', 'manager', 'operations', 'warehouse']),
  fileUploadController.deleteFile,
);

module.exports = router;
