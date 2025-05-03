/**
 * Samudra Paket ERP - Waybill Document Controller
 * Handles API endpoints for waybill document generation and management
 */

const fs = require('fs');
const path = require('path');
const { ValidationError, NotFoundError } = require('../../domain/utils/errors');

/**
 * Waybill Document Controller
 * Handles API endpoints for waybill document generation and management
 */
class WaybillDocumentController {
  /**
   * Create a new WaybillDocumentController
   * @param {Object} documentGenerationService - The document generation service
   * @param {Object} waybillDocumentRepository - The waybill document repository
   * @param {Object} shipmentOrderRepository - The shipment order repository
   */
  constructor(documentGenerationService, waybillDocumentRepository, shipmentOrderRepository) {
    this.documentGenerationService = documentGenerationService;
    this.waybillDocumentRepository = waybillDocumentRepository;
    this.shipmentOrderRepository = shipmentOrderRepository;
  }

  /**
   * Generate a waybill document
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async generateDocument(req, res, next) {
    try {
      const { shipmentOrderId, documentType, options } = req.body;
      
      // Validate required fields
      if (!shipmentOrderId) {
        throw new ValidationError('Shipment order ID is required');
      }
      
      if (!documentType) {
        throw new ValidationError('Document type is required');
      }
      
      // Validate document type
      const validDocumentTypes = ['waybill', 'receipt', 'manifest', 'pod', 'invoice'];
      if (!validDocumentTypes.includes(documentType)) {
        throw new ValidationError(`Invalid document type. Must be one of: ${validDocumentTypes.join(', ')}`);
      }
      
      // Generate document
      const document = await this.documentGenerationService.generateDocument(
        shipmentOrderId,
        documentType,
        options || {},
        req.user
      );
      
      // Return success response
      res.status(201).json({
        success: true,
        data: {
          document: {
            documentId: document.documentId,
            documentType: document.documentType,
            waybillNumber: document.waybillNumber,
            fileUrl: document.fileUrl,
            accessToken: document.accessToken,
            createdAt: document.createdAt,
          },
          viewUrl: `${req.protocol}://${req.get('host')}/api/documents/view/${document.accessToken}`,
          downloadUrl: `${req.protocol}://${req.get('host')}/api/documents/download/${document.accessToken}`,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get document by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getDocumentById(req, res, next) {
    try {
      const { documentId } = req.params;
      
      // Find document
      const document = await this.waybillDocumentRepository.findById(documentId);
      
      // Return success response
      res.status(200).json({
        success: true,
        data: {
          document,
          viewUrl: `${req.protocol}://${req.get('host')}/api/documents/view/${document.accessToken}`,
          downloadUrl: `${req.protocol}://${req.get('host')}/api/documents/download/${document.accessToken}`,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get documents by shipment order ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getDocumentsByShipmentOrderId(req, res, next) {
    try {
      const { shipmentOrderId } = req.params;
      const { documentType } = req.query;
      
      // Find documents
      const documents = await this.waybillDocumentRepository.findByShipmentOrderId(
        shipmentOrderId,
        documentType
      );
      
      // Return success response
      res.status(200).json({
        success: true,
        data: {
          documents: documents.map(doc => ({
            ...doc.toObject(),
            viewUrl: `${req.protocol}://${req.get('host')}/api/documents/view/${doc.accessToken}`,
            downloadUrl: `${req.protocol}://${req.get('host')}/api/documents/download/${doc.accessToken}`,
          })),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get documents by waybill number
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getDocumentsByWaybillNumber(req, res, next) {
    try {
      const { waybillNumber } = req.params;
      const { documentType } = req.query;
      
      // Find documents
      const documents = await this.waybillDocumentRepository.findByWaybillNumber(
        waybillNumber,
        documentType
      );
      
      // Return success response
      res.status(200).json({
        success: true,
        data: {
          documents: documents.map(doc => ({
            ...doc.toObject(),
            viewUrl: `${req.protocol}://${req.get('host')}/api/documents/view/${doc.accessToken}`,
            downloadUrl: `${req.protocol}://${req.get('host')}/api/documents/download/${doc.accessToken}`,
          })),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * View document by access token
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async viewDocumentByAccessToken(req, res, next) {
    try {
      const { accessToken } = req.params;
      
      // Get document
      const document = await this.documentGenerationService.getDocumentByAccessToken(accessToken);
      
      // Check if document is expired
      if (document.isExpired()) {
        throw new ValidationError('Document access has expired');
      }
      
      // Get file path
      const filePath = document.filePath;
      
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        // Try to use the fileUrl instead
        res.redirect(document.fileUrl);
        return;
      }
      
      // Set content type
      let contentType = 'application/pdf';
      if (document.documentFormat === 'image') {
        contentType = 'image/jpeg';
      } else if (document.documentFormat === 'html') {
        contentType = 'text/html';
      }
      
      // Set headers
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `inline; filename="${document.documentType}_${document.waybillNumber}.pdf"`);
      
      // Stream file
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Download document by access token
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async downloadDocumentByAccessToken(req, res, next) {
    try {
      const { accessToken } = req.params;
      
      // Get document
      const document = await this.documentGenerationService.getDocumentByAccessToken(accessToken);
      
      // Check if document is expired
      if (document.isExpired()) {
        throw new ValidationError('Document access has expired');
      }
      
      // Get file path
      const filePath = document.filePath;
      
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        // Try to use the fileUrl instead
        res.redirect(document.fileUrl);
        return;
      }
      
      // Set content type
      let contentType = 'application/pdf';
      if (document.documentFormat === 'image') {
        contentType = 'image/jpeg';
      } else if (document.documentFormat === 'html') {
        contentType = 'text/html';
      }
      
      // Set headers
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${document.documentType}_${document.waybillNumber}.pdf"`);
      
      // Stream file
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Regenerate document
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async regenerateDocument(req, res, next) {
    try {
      const { documentId } = req.params;
      const { options, reason } = req.body;
      
      // Validate required fields
      if (!reason) {
        throw new ValidationError('Reason for regeneration is required');
      }
      
      // Regenerate document
      const document = await this.documentGenerationService.regenerateDocument(
        documentId,
        options || {},
        req.user,
        reason
      );
      
      // Return success response
      res.status(200).json({
        success: true,
        data: {
          document: {
            documentId: document.documentId,
            documentType: document.documentType,
            waybillNumber: document.waybillNumber,
            fileUrl: document.fileUrl,
            accessToken: document.accessToken,
            version: document.version,
            createdAt: document.createdAt,
            updatedAt: document.updatedAt,
          },
          viewUrl: `${req.protocol}://${req.get('host')}/api/documents/view/${document.accessToken}`,
          downloadUrl: `${req.protocol}://${req.get('host')}/api/documents/download/${document.accessToken}`,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Distribute document
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async distributeDocument(req, res, next) {
    try {
      const { documentId } = req.params;
      const { recipients } = req.body;
      
      // Validate required fields
      if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
        throw new ValidationError('At least one recipient is required');
      }
      
      // Validate recipients
      recipients.forEach(recipient => {
        if (!recipient.type || !recipient.value) {
          throw new ValidationError('Each recipient must have a type and value');
        }
        
        if (!['email', 'sms', 'whatsapp'].includes(recipient.type)) {
          throw new ValidationError('Recipient type must be one of: email, sms, whatsapp');
        }
        
        if (recipient.type === 'email' && !recipient.value.includes('@')) {
          throw new ValidationError('Invalid email address');
        }
      });
      
      // Distribute document
      const result = await this.documentGenerationService.distributeDocument(documentId, recipients);
      
      // Return success response
      res.status(200).json({
        success: true,
        data: {
          distribution: result,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete document
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async deleteDocument(req, res, next) {
    try {
      const { documentId } = req.params;
      
      // Delete document
      await this.waybillDocumentRepository.deleteDocument(documentId);
      
      // Return success response
      res.status(200).json({
        success: true,
        data: {
          message: 'Document deleted successfully',
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get documents by branch
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getDocumentsByBranch(req, res, next) {
    try {
      const { branchId } = req.params;
      const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = -1, documentType, startDate, endDate } = req.query;
      
      // Build filters
      const filters = {};
      
      if (documentType) {
        filters.documentType = documentType;
      }
      
      if (startDate && endDate) {
        filters.createdAt = {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        };
      }
      
      // Get documents
      const result = await this.waybillDocumentRepository.findByBranch(
        branchId,
        filters,
        {
          page: parseInt(page),
          limit: parseInt(limit),
          sortBy,
          sortOrder: parseInt(sortOrder),
        }
      );
      
      // Return success response
      res.status(200).json({
        success: true,
        data: {
          documents: result.documents.map(doc => ({
            ...doc.toObject(),
            viewUrl: `${req.protocol}://${req.get('host')}/api/documents/view/${doc.accessToken}`,
            downloadUrl: `${req.protocol}://${req.get('host')}/api/documents/download/${doc.accessToken}`,
          })),
          pagination: result.pagination,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get document statistics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getDocumentStatistics(req, res, next) {
    try {
      const { branchId } = req.query;
      const { startDate, endDate } = req.query;
      
      // Parse dates
      const parsedStartDate = startDate ? new Date(startDate) : null;
      const parsedEndDate = endDate ? new Date(endDate) : null;
      
      // Get statistics
      const [countByType, countByDistributionStatus] = await Promise.all([
        this.waybillDocumentRepository.countByType(branchId, parsedStartDate, parsedEndDate),
        this.waybillDocumentRepository.countByDistributionStatus(branchId, parsedStartDate, parsedEndDate),
      ]);
      
      // Return success response
      res.status(200).json({
        success: true,
        data: {
          countByType,
          countByDistributionStatus,
          dateRange: {
            startDate: parsedStartDate,
            endDate: parsedEndDate,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Generate barcode
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async generateBarcode(req, res, next) {
    try {
      const { data, type = 'qrcode' } = req.body;
      
      // Validate required fields
      if (!data) {
        throw new ValidationError('Barcode data is required');
      }
      
      // Validate barcode type
      const validBarcodeTypes = ['qrcode', 'code128', 'datamatrix', 'pdf417'];
      if (!validBarcodeTypes.includes(type)) {
        throw new ValidationError(`Invalid barcode type. Must be one of: ${validBarcodeTypes.join(', ')}`);
      }
      
      // Generate barcode
      const barcodeImagePath = await this.documentGenerationService._generateBarcodeImage(data, type);
      
      // Set headers
      res.setHeader('Content-Type', 'image/png');
      
      // Stream file
      const fileStream = fs.createReadStream(barcodeImagePath);
      fileStream.pipe(res);
      
      // Clean up temp file when done
      fileStream.on('end', () => {
        fs.unlink(barcodeImagePath, (err) => {
          if (err) {
            console.error(`Error cleaning up temp file ${barcodeImagePath}:`, err);
          }
        });
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = WaybillDocumentController;
