/**
 * Samudra Paket ERP - Waybill Document Model
 * Defines the schema for waybill documents
 */

const mongoose = require('mongoose');
const crypto = require('crypto');

/**
 * Waybill Document Schema
 * Stores information about generated waybill documents
 */
const WaybillDocumentSchema = new mongoose.Schema(
  {
    // Document identification
    documentId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    shipmentOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ShipmentOrder',
      required: true,
      index: true,
    },
    waybillNumber: {
      type: String,
      required: true,
      index: true,
    },
    
    // Document metadata
    documentType: {
      type: String,
      enum: ['waybill', 'receipt', 'manifest', 'pod', 'invoice'],
      required: true,
    },
    documentFormat: {
      type: String,
      enum: ['pdf', 'image', 'html'],
      default: 'pdf',
    },
    
    // Document content and storage
    fileUrl: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number, // Size in bytes
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    
    // Barcode/QR code
    barcodeType: {
      type: String,
      enum: ['qrcode', 'code128', 'datamatrix', 'pdf417'],
      default: 'qrcode',
    },
    barcodeData: {
      type: String,
      required: true,
    },
    barcodeImageUrl: {
      type: String,
    },
    
    // Distribution information
    distributionStatus: {
      type: String,
      enum: ['pending', 'sent', 'failed', 'delivered'],
      default: 'pending',
    },
    distributionMethod: {
      type: String,
      enum: ['email', 'sms', 'whatsapp', 'print', 'download'],
      default: 'print',
    },
    distributionRecipients: [{
      type: {
        type: String,
        enum: ['email', 'phone', 'user'],
        required: true,
      },
      value: {
        type: String,
        required: true,
      },
      sentAt: Date,
      deliveredAt: Date,
      status: {
        type: String,
        enum: ['pending', 'sent', 'failed', 'delivered'],
        default: 'pending',
      },
      errorMessage: String,
    }],
    
    // Document access and security
    accessToken: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
    },
    accessCount: {
      type: Number,
      default: 0,
    },
    lastAccessedAt: {
      type: Date,
    },
    
    // Document generation information
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
    },
    
    // Document version and history
    version: {
      type: Number,
      default: 1,
    },
    previousVersions: [{
      version: Number,
      fileUrl: String,
      generatedAt: Date,
      generatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      reason: String,
    }],
  },
  {
    timestamps: true,
  }
);

/**
 * Generate a unique document ID
 * @returns {Promise<string>} The generated document ID
 */
WaybillDocumentSchema.statics.generateDocumentId = async function() {
  const prefix = 'DOC';
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}${timestamp}${random}`;
};

/**
 * Generate a secure access token for document access
 * @returns {string} The generated access token
 */
WaybillDocumentSchema.statics.generateAccessToken = function() {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Generate barcode data based on document type and shipment information
 * @param {Object} shipment - The shipment order object
 * @param {string} documentType - The type of document
 * @returns {string} The generated barcode data
 */
WaybillDocumentSchema.statics.generateBarcodeData = function(shipment, documentType) {
  let barcodeData = '';
  
  switch (documentType) {
    case 'waybill':
      // Format: WB|waybillNumber|origin|destination|timestamp
      barcodeData = `WB|${shipment.waybillNumber}|${shipment.origin.city}|${shipment.destination.city}|${Date.now()}`;
      break;
    case 'receipt':
      // Format: RC|waybillNumber|timestamp
      barcodeData = `RC|${shipment.waybillNumber}|${Date.now()}`;
      break;
    case 'manifest':
      // Format: MF|manifestId|branchId|timestamp
      barcodeData = `MF|${shipment.manifestId || 'N/A'}|${shipment.originBranch}|${Date.now()}`;
      break;
    case 'pod':
      // Format: POD|waybillNumber|timestamp
      barcodeData = `POD|${shipment.waybillNumber}|${Date.now()}`;
      break;
    case 'invoice':
      // Format: INV|invoiceNumber|waybillNumber|timestamp
      barcodeData = `INV|${shipment.invoiceNumber || 'N/A'}|${shipment.waybillNumber}|${Date.now()}`;
      break;
    default:
      // Default format: DOC|waybillNumber|timestamp
      barcodeData = `DOC|${shipment.waybillNumber}|${Date.now()}`;
  }
  
  return barcodeData;
};

/**
 * Increment the access count and update last accessed time
 */
WaybillDocumentSchema.methods.recordAccess = async function() {
  this.accessCount += 1;
  this.lastAccessedAt = new Date();
  return this.save();
};

/**
 * Check if the document has expired
 * @returns {boolean} True if the document has expired
 */
WaybillDocumentSchema.methods.isExpired = function() {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
};

/**
 * Create a new version of the document
 * @param {string} fileUrl - The URL of the new file
 * @param {Object} user - The user creating the new version
 * @param {string} reason - The reason for creating a new version
 */
WaybillDocumentSchema.methods.createNewVersion = async function(fileUrl, user, reason) {
  // Add current version to previous versions
  this.previousVersions.push({
    version: this.version,
    fileUrl: this.fileUrl,
    generatedAt: this.updatedAt,
    generatedBy: this.generatedBy,
    reason: reason,
  });
  
  // Update to new version
  this.version += 1;
  this.fileUrl = fileUrl;
  this.generatedBy = user._id;
  
  return this.save();
};

/**
 * Update distribution status for a recipient
 * @param {string} recipientValue - The recipient value (email or phone)
 * @param {string} status - The new status
 * @param {string} errorMessage - Optional error message
 */
WaybillDocumentSchema.methods.updateDistributionStatus = async function(recipientValue, status, errorMessage = null) {
  const recipient = this.distributionRecipients.find(r => r.value === recipientValue);
  
  if (recipient) {
    recipient.status = status;
    
    if (status === 'sent') {
      recipient.sentAt = new Date();
    } else if (status === 'delivered') {
      recipient.deliveredAt = new Date();
    } else if (status === 'failed' && errorMessage) {
      recipient.errorMessage = errorMessage;
    }
    
    return this.save();
  }
  
  return null;
};

// Create the model
const WaybillDocument = mongoose.model('WaybillDocument', WaybillDocumentSchema);

module.exports = {
  WaybillDocument,
  WaybillDocumentSchema,
};
