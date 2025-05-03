/**
 * Samudra Paket ERP - Document Generation Service
 * Service for generating waybill documents, barcodes, and handling document distribution
 */

const path = require('path');
const fs = require('fs').promises;
const QRCode = require('qrcode');
const bwipjs = require('bwip-js');
const PDFDocument = require('pdfkit');
const nodemailer = require('nodemailer');
const { createCanvas } = require('canvas');
const { ValidationError } = require('../utils/errors');

/**
 * Document Generation Service
 * Handles the generation of waybill documents, barcodes, and document distribution
 */
class DocumentGenerationService {
  /**
   * Create a new DocumentGenerationService
   * @param {Object} waybillDocumentRepository - The waybill document repository
   * @param {Object} shipmentOrderRepository - The shipment order repository
   * @param {Object} fileUploadService - The file upload service
   * @param {Object} config - Configuration options
   */
  constructor(waybillDocumentRepository, shipmentOrderRepository, fileUploadService, config = {}) {
    this.waybillDocumentRepository = waybillDocumentRepository;
    this.shipmentOrderRepository = shipmentOrderRepository;
    this.fileUploadService = fileUploadService;
    this.config = {
      tempDir: config.tempDir || path.join(process.cwd(), 'temp'),
      uploadDir: config.uploadDir || path.join(process.cwd(), 'uploads'),
      baseUrl: config.baseUrl || 'http://localhost:3000',
      email: config.email || {},
      ...config,
    };
    
    // Ensure temp directory exists
    this._ensureDirectoryExists(this.config.tempDir);
    this._ensureDirectoryExists(this.config.uploadDir);
  }

  /**
   * Generate a waybill document
   * @param {string} shipmentOrderId - The shipment order ID
   * @param {string} documentType - The document type
   * @param {Object} options - Generation options
   * @param {Object} user - The user generating the document
   * @returns {Promise<Object>} The generated document
   */
  async generateDocument(shipmentOrderId, documentType, options = {}, user) {
    // Get shipment order
    const shipment = await this.shipmentOrderRepository.findById(shipmentOrderId);
    
    // Generate barcode/QR code
    const barcodeData = await this._generateBarcodeData(shipment, documentType);
    const barcodeImagePath = await this._generateBarcodeImage(barcodeData, options.barcodeType || 'qrcode');
    
    // Generate PDF document
    const pdfPath = await this._generatePdf(shipment, documentType, {
      ...options,
      barcodeImagePath,
      barcodeData,
    });
    
    // Upload files to storage
    const barcodeImageUrl = await this.fileUploadService.uploadFile(
      barcodeImagePath,
      `barcodes/${shipment.waybillNumber}/${documentType}`,
      'image'
    );
    
    const fileUrl = await this.fileUploadService.uploadFile(
      pdfPath,
      `documents/${shipment.waybillNumber}/${documentType}`,
      'application/pdf'
    );
    
    // Get file size
    const fileStats = await fs.stat(pdfPath);
    
    // Create document record
    const documentData = {
      shipmentOrderId: shipment._id,
      waybillNumber: shipment.waybillNumber,
      documentType,
      documentFormat: 'pdf',
      fileUrl,
      fileSize: fileStats.size,
      filePath: pdfPath,
      barcodeType: options.barcodeType || 'qrcode',
      barcodeData,
      barcodeImageUrl,
      distributionStatus: 'pending',
      distributionMethod: options.distributionMethod || 'print',
      distributionRecipients: options.recipients || [],
      expiresAt: options.expiresAt || null,
      generatedBy: user._id,
      branch: shipment.originBranch,
    };
    
    const document = await this.waybillDocumentRepository.createDocument(documentData);
    
    // Clean up temp files
    await this._cleanupTempFiles([barcodeImagePath, pdfPath]);
    
    // If distribution is requested, distribute the document
    if (options.distribute && options.recipients && options.recipients.length > 0) {
      await this.distributeDocument(document.documentId, options.recipients);
    }
    
    return document;
  }

  /**
   * Generate barcode data
   * @param {Object} shipment - The shipment order
   * @param {string} documentType - The document type
   * @returns {Promise<string>} The generated barcode data
   * @private
   */
  async _generateBarcodeData(shipment, documentType) {
    return this.waybillDocumentRepository.constructor.schema.statics.generateBarcodeData(shipment, documentType);
  }

  /**
   * Generate barcode image
   * @param {string} data - The data to encode
   * @param {string} type - The barcode type
   * @returns {Promise<string>} The path to the generated image
   * @private
   */
  async _generateBarcodeImage(data, type) {
    const filename = `barcode_${Date.now()}.png`;
    const outputPath = path.join(this.config.tempDir, filename);
    
    switch (type) {
      case 'qrcode':
        await QRCode.toFile(outputPath, data, {
          errorCorrectionLevel: 'H',
          margin: 1,
          width: 300,
        });
        break;
        
      case 'code128':
      case 'datamatrix':
      case 'pdf417':
        const canvas = createCanvas(300, 150);
        await bwipjs.toCanvas(canvas, {
          bcid: type === 'code128' ? 'code128' : (type === 'datamatrix' ? 'datamatrix' : 'pdf417'),
          text: data,
          scale: 3,
          includetext: true,
          textxalign: 'center',
        });
        
        const buffer = canvas.toBuffer('image/png');
        await fs.writeFile(outputPath, buffer);
        break;
        
      default:
        throw new ValidationError(`Unsupported barcode type: ${type}`);
    }
    
    return outputPath;
  }

  /**
   * Ensure directory exists
   * @param {string} directory - The directory path
   * @private
   */
  async _ensureDirectoryExists(directory) {
    try {
      await fs.mkdir(directory, { recursive: true });
    } catch (error) {
      if (error.code !== 'EEXIST') {
        throw error;
      }
    }
  }

  /**
   * Clean up temporary files
   * @param {Array<string>} filePaths - The file paths to clean up
   * @private
   */
  async _cleanupTempFiles(filePaths) {
    for (const filePath of filePaths) {
      try {
        await fs.unlink(filePath);
      } catch (error) {
        console.error(`Error cleaning up temp file ${filePath}:`, error);
      }
    }
  }

  /**
   * Generate PDF document
   * @param {Object} shipment - The shipment order
   * @param {string} documentType - The document type
   * @param {Object} options - Generation options
   * @returns {Promise<string>} The path to the generated PDF
   * @private
   */
  async _generatePdf(shipment, documentType, options) {
    const filename = `${documentType}_${shipment.waybillNumber}_${Date.now()}.pdf`;
    const outputPath = path.join(this.config.tempDir, filename);
    
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margin: 50,
          info: {
            Title: `${documentType.toUpperCase()} - ${shipment.waybillNumber}`,
            Author: 'Samudra Paket ERP',
            Subject: `${documentType.toUpperCase()} for Shipment ${shipment.waybillNumber}`,
          },
        });
        
        const stream = fs.createWriteStream(outputPath);
        doc.pipe(stream);
        
        // Generate PDF content based on document type
        switch (documentType) {
          case 'waybill':
            this._generateWaybillPdf(doc, shipment, options);
            break;
          case 'receipt':
            this._generateReceiptPdf(doc, shipment, options);
            break;
          case 'manifest':
            this._generateManifestPdf(doc, shipment, options);
            break;
          case 'pod':
            this._generatePodPdf(doc, shipment, options);
            break;
          case 'invoice':
            this._generateInvoicePdf(doc, shipment, options);
            break;
          default:
            throw new ValidationError(`Unsupported document type: ${documentType}`);
        }
        
        doc.end();
        
        stream.on('finish', () => {
          resolve(outputPath);
        });
        
        stream.on('error', (error) => {
          reject(error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Generate waybill PDF
   * @param {Object} doc - The PDF document
   * @param {Object} shipment - The shipment order
   * @param {Object} options - Generation options
   * @private
   */
  _generateWaybillPdf(doc, shipment, options) {
    // Implementation will be in waybillPdfGenerator.js
    throw new Error('Method not implemented');
  }

  /**
   * Generate receipt PDF
   * @param {Object} doc - The PDF document
   * @param {Object} shipment - The shipment order
   * @param {Object} options - Generation options
   * @private
   */
  _generateReceiptPdf(doc, shipment, options) {
    // Implementation will be in receiptPdfGenerator.js
    throw new Error('Method not implemented');
  }

  /**
   * Generate manifest PDF
   * @param {Object} doc - The PDF document
   * @param {Object} shipment - The shipment order
   * @param {Object} options - Generation options
   * @private
   */
  _generateManifestPdf(doc, shipment, options) {
    // Implementation will be in manifestPdfGenerator.js
    throw new Error('Method not implemented');
  }

  /**
   * Generate POD PDF
   * @param {Object} doc - The PDF document
   * @param {Object} shipment - The shipment order
   * @param {Object} options - Generation options
   * @private
   */
  _generatePodPdf(doc, shipment, options) {
    // Implementation will be in podPdfGenerator.js
    throw new Error('Method not implemented');
  }

  /**
   * Generate invoice PDF
   * @param {Object} doc - The PDF document
   * @param {Object} shipment - The shipment order
   * @param {Object} options - Generation options
   * @private
   */
  _generateInvoicePdf(doc, shipment, options) {
    // Implementation will be in invoicePdfGenerator.js
    throw new Error('Method not implemented');
  }

  /**
   * Distribute document to recipients
   * @param {string} documentId - The document ID
   * @param {Array<Object>} recipients - The recipients
   * @returns {Promise<Object>} The distribution results
   */
  async distributeDocument(documentId, recipients) {
    const document = await this.waybillDocumentRepository.findById(documentId);
    const results = {
      success: [],
      failed: [],
    };
    
    // Update document status
    await this.waybillDocumentRepository.updateDocument(documentId, {
      distributionStatus: 'pending',
      distributionRecipients: recipients.map(recipient => ({
        type: recipient.type,
        value: recipient.value,
        status: 'pending',
      })),
    });
    
    // Distribute to each recipient
    for (const recipient of recipients) {
      try {
        switch (recipient.type) {
          case 'email':
            await this._sendDocumentByEmail(document, recipient.value);
            break;
          case 'sms':
            await this._sendDocumentBySms(document, recipient.value);
            break;
          case 'whatsapp':
            await this._sendDocumentByWhatsapp(document, recipient.value);
            break;
          default:
            throw new ValidationError(`Unsupported distribution type: ${recipient.type}`);
        }
        
        // Update recipient status
        await this.waybillDocumentRepository.updateDistributionStatus(
          documentId,
          recipient.value,
          'sent'
        );
        
        results.success.push(recipient);
      } catch (error) {
        console.error(`Error distributing document to ${recipient.type} ${recipient.value}:`, error);
        
        // Update recipient status
        await this.waybillDocumentRepository.updateDistributionStatus(
          documentId,
          recipient.value,
          'failed',
          error.message
        );
        
        results.failed.push({
          recipient,
          error: error.message,
        });
      }
    }
    
    // Update overall distribution status
    const allFailed = recipients.length > 0 && results.failed.length === recipients.length;
    const allSucceeded = recipients.length > 0 && results.failed.length === 0;
    
    const distributionStatus = allFailed ? 'failed' : (allSucceeded ? 'sent' : 'partial');
    
    await this.waybillDocumentRepository.updateDocument(documentId, {
      distributionStatus,
    });
    
    return results;
  }

  /**
   * Send document by email
   * @param {Object} document - The waybill document
   * @param {string} email - The recipient email
   * @returns {Promise<Object>} The email send result
   * @private
   */
  async _sendDocumentByEmail(document, email) {
    // Create transporter
    const transporter = nodemailer.createTransport(this.config.email.transport);
    
    // Get shipment details
    const shipment = await this.shipmentOrderRepository.findById(document.shipmentOrderId);
    
    // Create email content
    const mailOptions = {
      from: this.config.email.from || 'noreply@samudrapaket.com',
      to: email,
      subject: `${document.documentType.toUpperCase()} - ${shipment.waybillNumber}`,
      html: `
        <h1>Samudra Paket - ${document.documentType.toUpperCase()}</h1>
        <p>Dear Customer,</p>
        <p>Please find attached your ${document.documentType} for shipment ${shipment.waybillNumber}.</p>
        <p>You can also view the document online by clicking the link below:</p>
        <p><a href="${this.config.baseUrl}/documents/view/${document.accessToken}">View Document</a></p>
        <p>Thank you for choosing Samudra Paket.</p>
        <p>Best regards,<br>Samudra Paket Team</p>
      `,
      attachments: [
        {
          filename: `${document.documentType}_${shipment.waybillNumber}.pdf`,
          path: document.fileUrl,
        },
      ],
    };
    
    // Send email
    return transporter.sendMail(mailOptions);
  }

  /**
   * Send document by SMS
   * @param {Object} document - The waybill document
   * @param {string} phoneNumber - The recipient phone number
   * @returns {Promise<Object>} The SMS send result
   * @private
   */
  async _sendDocumentBySms(document, phoneNumber) {
    // This is a placeholder for SMS integration
    // In a real implementation, this would use an SMS gateway service
    
    // Get shipment details
    const shipment = await this.shipmentOrderRepository.findById(document.shipmentOrderId);
    
    const message = `Samudra Paket - ${document.documentType.toUpperCase()} for shipment ${shipment.waybillNumber} is ready. View it at: ${this.config.baseUrl}/documents/view/${document.accessToken}`;
    
    console.log(`[SMS Placeholder] Sending to ${phoneNumber}: ${message}`);
    
    // Simulate successful sending
    return {
      success: true,
      to: phoneNumber,
      message,
    };
  }

  /**
   * Send document by WhatsApp
   * @param {Object} document - The waybill document
   * @param {string} phoneNumber - The recipient phone number
   * @returns {Promise<Object>} The WhatsApp send result
   * @private
   */
  async _sendDocumentByWhatsapp(document, phoneNumber) {
    // This is a placeholder for WhatsApp integration
    // In a real implementation, this would use the WhatsApp Business API
    
    // Get shipment details
    const shipment = await this.shipmentOrderRepository.findById(document.shipmentOrderId);
    
    const message = `Samudra Paket - ${document.documentType.toUpperCase()} for shipment ${shipment.waybillNumber} is ready. View it at: ${this.config.baseUrl}/documents/view/${document.accessToken}`;
    
    console.log(`[WhatsApp Placeholder] Sending to ${phoneNumber}: ${message}`);
    
    // Simulate successful sending
    return {
      success: true,
      to: phoneNumber,
      message,
    };
  }

  /**
   * Get document by access token
   * @param {string} accessToken - The access token
   * @returns {Promise<Object>} The waybill document
   */
  async getDocumentByAccessToken(accessToken) {
    const document = await this.waybillDocumentRepository.findByAccessToken(accessToken);
    
    // Record access
    await this.waybillDocumentRepository.recordAccess(document.documentId);
    
    return document;
  }

  /**
   * Regenerate document
   * @param {string} documentId - The document ID
   * @param {Object} options - Generation options
   * @param {Object} user - The user regenerating the document
   * @param {string} reason - The reason for regeneration
   * @returns {Promise<Object>} The regenerated document
   */
  async regenerateDocument(documentId, options = {}, user, reason) {
    const document = await this.waybillDocumentRepository.findById(documentId);
    
    // Generate new document
    const shipment = await this.shipmentOrderRepository.findById(document.shipmentOrderId);
    
    // Generate barcode/QR code
    const barcodeData = await this._generateBarcodeData(shipment, document.documentType);
    const barcodeImagePath = await this._generateBarcodeImage(barcodeData, document.barcodeType);
    
    // Generate PDF document
    const pdfPath = await this._generatePdf(shipment, document.documentType, {
      ...options,
      barcodeImagePath,
      barcodeData,
    });
    
    // Upload files to storage
    const barcodeImageUrl = await this.fileUploadService.uploadFile(
      barcodeImagePath,
      `barcodes/${shipment.waybillNumber}/${document.documentType}`,
      'image'
    );
    
    const fileUrl = await this.fileUploadService.uploadFile(
      pdfPath,
      `documents/${shipment.waybillNumber}/${document.documentType}`,
      'application/pdf'
    );
    
    // Get file size
    const fileStats = await fs.stat(pdfPath);
    
    // Create new version
    await this.waybillDocumentRepository.createNewVersion(
      documentId,
      fileUrl,
      user,
      reason
    );
    
    // Update document
    const updatedDocument = await this.waybillDocumentRepository.updateDocument(documentId, {
      fileUrl,
      fileSize: fileStats.size,
      filePath: pdfPath,
      barcodeImageUrl,
      distributionStatus: 'pending',
    });
    
    // Clean up temp files
    await this._cleanupTempFiles([barcodeImagePath, pdfPath]);
    
    return updatedDocument;
  }
}

module.exports = DocumentGenerationService;
