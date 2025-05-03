/**
 * Samudra Paket ERP - Waybill Document Routes
 * Defines API routes for waybill document operations
 */

const express = require('express');
const WaybillDocumentController = require('../controllers/waybillDocumentController');
const DocumentGenerationService = require('../../domain/services/documentGenerationService');
const MongoWaybillDocumentRepository = require('../../infrastructure/repositories/mongoWaybillDocumentRepository');
const MongoShipmentOrderRepository = require('../../infrastructure/repositories/mongoShipmentOrderRepository');
const FileUploadService = require('../../domain/services/fileUploadService');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/permissionMiddleware');
const {
  validateGenerateDocument,
  validateRegenerateDocument,
  validateDistributeDocument,
  validateGenerateBarcode,
} = require('../validators/waybillDocumentValidator');

// Initialize repositories and services
const waybillDocumentRepository = new MongoWaybillDocumentRepository();
const shipmentOrderRepository = new MongoShipmentOrderRepository();
const fileUploadService = new FileUploadService();

// Initialize document generation service
const documentGenerationService = new DocumentGenerationService(
  waybillDocumentRepository,
  shipmentOrderRepository,
  fileUploadService,
  {
    tempDir: process.env.TEMP_DIR || './temp',
    uploadDir: process.env.UPLOAD_DIR || './uploads',
    baseUrl: process.env.BASE_URL || 'http://localhost:3000',
    email: {
      transport: {
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      },
      from: process.env.EMAIL_FROM || 'noreply@samudrapaket.com',
    },
  }
);

// Initialize controller
const waybillDocumentController = new WaybillDocumentController(
  documentGenerationService,
  waybillDocumentRepository,
  shipmentOrderRepository
);

// Create router
const router = express.Router();

/**
 * @route POST /api/documents/generate
 * @desc Generate a waybill document
 * @access Private
 */
router.post(
  '/generate',
  authenticate,
  authorize('documents.create'),
  validateGenerateDocument,
  waybillDocumentController.generateDocument.bind(waybillDocumentController)
);

/**
 * @route GET /api/documents/:documentId
 * @desc Get document by ID
 * @access Private
 */
router.get(
  '/:documentId',
  authenticate,
  authorize('documents.read'),
  waybillDocumentController.getDocumentById.bind(waybillDocumentController)
);

/**
 * @route GET /api/documents/shipment/:shipmentOrderId
 * @desc Get documents by shipment order ID
 * @access Private
 */
router.get(
  '/shipment/:shipmentOrderId',
  authenticate,
  authorize('documents.read'),
  waybillDocumentController.getDocumentsByShipmentOrderId.bind(waybillDocumentController)
);

/**
 * @route GET /api/documents/waybill/:waybillNumber
 * @desc Get documents by waybill number
 * @access Private
 */
router.get(
  '/waybill/:waybillNumber',
  authenticate,
  authorize('documents.read'),
  waybillDocumentController.getDocumentsByWaybillNumber.bind(waybillDocumentController)
);

/**
 * @route GET /api/documents/view/:accessToken
 * @desc View document by access token
 * @access Public
 */
router.get(
  '/view/:accessToken',
  waybillDocumentController.viewDocumentByAccessToken.bind(waybillDocumentController)
);

/**
 * @route GET /api/documents/download/:accessToken
 * @desc Download document by access token
 * @access Public
 */
router.get(
  '/download/:accessToken',
  waybillDocumentController.downloadDocumentByAccessToken.bind(waybillDocumentController)
);

/**
 * @route POST /api/documents/:documentId/regenerate
 * @desc Regenerate document
 * @access Private
 */
router.post(
  '/:documentId/regenerate',
  authenticate,
  authorize('documents.update'),
  validateRegenerateDocument,
  waybillDocumentController.regenerateDocument.bind(waybillDocumentController)
);

/**
 * @route POST /api/documents/:documentId/distribute
 * @desc Distribute document
 * @access Private
 */
router.post(
  '/:documentId/distribute',
  authenticate,
  authorize('documents.update'),
  validateDistributeDocument,
  waybillDocumentController.distributeDocument.bind(waybillDocumentController)
);

/**
 * @route DELETE /api/documents/:documentId
 * @desc Delete document
 * @access Private
 */
router.delete(
  '/:documentId',
  authenticate,
  authorize('documents.delete'),
  waybillDocumentController.deleteDocument.bind(waybillDocumentController)
);

/**
 * @route GET /api/documents/branch/:branchId
 * @desc Get documents by branch
 * @access Private
 */
router.get(
  '/branch/:branchId',
  authenticate,
  authorize('documents.read'),
  waybillDocumentController.getDocumentsByBranch.bind(waybillDocumentController)
);

/**
 * @route GET /api/documents/statistics
 * @desc Get document statistics
 * @access Private
 */
router.get(
  '/statistics',
  authenticate,
  authorize('documents.read'),
  waybillDocumentController.getDocumentStatistics.bind(waybillDocumentController)
);

/**
 * @route POST /api/documents/barcode
 * @desc Generate barcode
 * @access Private
 */
router.post(
  '/barcode',
  authenticate,
  authorize('documents.create'),
  validateGenerateBarcode,
  waybillDocumentController.generateBarcode.bind(waybillDocumentController)
);

module.exports = router;
