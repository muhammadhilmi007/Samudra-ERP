/**
 * Samudra Paket ERP - MongoDB Waybill Document Repository
 * Implementation of the waybill document repository interface using MongoDB
 */

const WaybillDocumentRepository = require('../../domain/repositories/waybillDocumentRepository');
const { WaybillDocument } = require('../../domain/models/waybillDocument');
const { NotFoundError } = require('../../domain/utils/errors');

/**
 * MongoDB implementation of WaybillDocumentRepository
 * @implements {WaybillDocumentRepository}
 */
class MongoWaybillDocumentRepository extends WaybillDocumentRepository {
  /**
   * Create a new waybill document
   * @param {Object} documentData - The waybill document data
   * @returns {Promise<Object>} The created waybill document
   */
  async createDocument(documentData) {
    // Generate document ID if not provided
    if (!documentData.documentId) {
      documentData.documentId = await this.generateDocumentId();
    }

    // Generate access token if not provided
    if (!documentData.accessToken) {
      documentData.accessToken = await this.generateAccessToken();
    }

    const waybillDocument = new WaybillDocument(documentData);
    return waybillDocument.save();
  }

  /**
   * Find a waybill document by ID
   * @param {string} documentId - The document ID
   * @returns {Promise<Object>} The waybill document
   * @throws {NotFoundError} If the document is not found
   */
  async findById(documentId) {
    const document = await WaybillDocument.findOne({ documentId });
    
    if (!document) {
      throw new NotFoundError(`Waybill document with ID ${documentId} not found`);
    }
    
    return document;
  }

  /**
   * Find a waybill document by shipment order ID
   * @param {string} shipmentOrderId - The shipment order ID
   * @param {string} documentType - Optional document type filter
   * @returns {Promise<Object>} The waybill document
   */
  async findByShipmentOrderId(shipmentOrderId, documentType) {
    const query = { shipmentOrderId };
    
    if (documentType) {
      query.documentType = documentType;
    }
    
    return WaybillDocument.find(query).sort({ createdAt: -1 });
  }

  /**
   * Find a waybill document by waybill number
   * @param {string} waybillNumber - The waybill number
   * @param {string} documentType - Optional document type filter
   * @returns {Promise<Object>} The waybill document
   */
  async findByWaybillNumber(waybillNumber, documentType) {
    const query = { waybillNumber };
    
    if (documentType) {
      query.documentType = documentType;
    }
    
    return WaybillDocument.find(query).sort({ createdAt: -1 });
  }

  /**
   * Find a waybill document by access token
   * @param {string} accessToken - The access token
   * @returns {Promise<Object>} The waybill document
   * @throws {NotFoundError} If the document is not found
   */
  async findByAccessToken(accessToken) {
    const document = await WaybillDocument.findOne({ accessToken });
    
    if (!document) {
      throw new NotFoundError('Invalid or expired access token');
    }
    
    return document;
  }

  /**
   * Update a waybill document
   * @param {string} documentId - The document ID
   * @param {Object} updateData - The data to update
   * @returns {Promise<Object>} The updated waybill document
   * @throws {NotFoundError} If the document is not found
   */
  async updateDocument(documentId, updateData) {
    const document = await WaybillDocument.findOneAndUpdate(
      { documentId },
      { $set: updateData },
      { new: true, runValidators: true }
    );
    
    if (!document) {
      throw new NotFoundError(`Waybill document with ID ${documentId} not found`);
    }
    
    return document;
  }

  /**
   * Delete a waybill document
   * @param {string} documentId - The document ID
   * @returns {Promise<boolean>} True if the document was deleted
   * @throws {NotFoundError} If the document is not found
   */
  async deleteDocument(documentId) {
    const result = await WaybillDocument.deleteOne({ documentId });
    
    if (result.deletedCount === 0) {
      throw new NotFoundError(`Waybill document with ID ${documentId} not found`);
    }
    
    return true;
  }

  /**
   * Generate a unique document ID
   * @returns {Promise<string>} The generated document ID
   */
  async generateDocumentId() {
    return WaybillDocument.generateDocumentId();
  }

  /**
   * Generate a secure access token for document access
   * @returns {Promise<string>} The generated access token
   */
  async generateAccessToken() {
    return WaybillDocument.generateAccessToken();
  }

  /**
   * Record document access
   * @param {string} documentId - The document ID
   * @returns {Promise<Object>} The updated waybill document
   * @throws {NotFoundError} If the document is not found
   */
  async recordAccess(documentId) {
    const document = await this.findById(documentId);
    return document.recordAccess();
  }

  /**
   * Create a new version of a document
   * @param {string} documentId - The document ID
   * @param {string} fileUrl - The URL of the new file
   * @param {Object} user - The user creating the new version
   * @param {string} reason - The reason for creating a new version
   * @returns {Promise<Object>} The updated waybill document
   * @throws {NotFoundError} If the document is not found
   */
  async createNewVersion(documentId, fileUrl, user, reason) {
    const document = await this.findById(documentId);
    return document.createNewVersion(fileUrl, user, reason);
  }

  /**
   * Update distribution status for a recipient
   * @param {string} documentId - The document ID
   * @param {string} recipientValue - The recipient value (email or phone)
   * @param {string} status - The new status
   * @param {string} errorMessage - Optional error message
   * @returns {Promise<Object>} The updated waybill document
   * @throws {NotFoundError} If the document is not found
   */
  async updateDistributionStatus(documentId, recipientValue, status, errorMessage = null) {
    const document = await this.findById(documentId);
    return document.updateDistributionStatus(recipientValue, status, errorMessage);
  }

  /**
   * Find documents by branch
   * @param {string} branchId - The branch ID
   * @param {Object} filters - Additional filters
   * @param {Object} options - Query options (pagination, sorting)
   * @returns {Promise<Object>} The waybill documents and count
   */
  async findByBranch(branchId, filters = {}, options = {}) {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = -1 } = options;
    const skip = (page - 1) * limit;
    
    const query = { branch: branchId, ...filters };
    
    const [documents, total] = await Promise.all([
      WaybillDocument.find(query)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .populate('shipmentOrderId', 'waybillNumber customerName')
        .populate('generatedBy', 'name username')
        .populate('branch', 'name code'),
      
      WaybillDocument.countDocuments(query),
    ]);
    
    return {
      documents,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Find documents by date range
   * @param {Date} startDate - The start date
   * @param {Date} endDate - The end date
   * @param {Object} filters - Additional filters
   * @param {Object} options - Query options (pagination, sorting)
   * @returns {Promise<Object>} The waybill documents and count
   */
  async findByDateRange(startDate, endDate, filters = {}, options = {}) {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = -1 } = options;
    const skip = (page - 1) * limit;
    
    const query = {
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
      ...filters,
    };
    
    const [documents, total] = await Promise.all([
      WaybillDocument.find(query)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .populate('shipmentOrderId', 'waybillNumber customerName')
        .populate('generatedBy', 'name username')
        .populate('branch', 'name code'),
      
      WaybillDocument.countDocuments(query),
    ]);
    
    return {
      documents,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Count documents by type
   * @param {string} branchId - Optional branch ID filter
   * @param {Date} startDate - Optional start date filter
   * @param {Date} endDate - Optional end date filter
   * @returns {Promise<Object>} The document counts by type
   */
  async countByType(branchId = null, startDate = null, endDate = null) {
    const query = {};
    
    if (branchId) {
      query.branch = branchId;
    }
    
    if (startDate && endDate) {
      query.createdAt = {
        $gte: startDate,
        $lte: endDate,
      };
    }
    
    const result = await WaybillDocument.aggregate([
      { $match: query },
      { $group: {
        _id: '$documentType',
        count: { $sum: 1 },
      }},
      { $project: {
        documentType: '$_id',
        count: 1,
        _id: 0,
      }},
    ]);
    
    // Convert array to object with document type as key
    const countByType = {};
    result.forEach(item => {
      countByType[item.documentType] = item.count;
    });
    
    return countByType;
  }

  /**
   * Count documents by distribution status
   * @param {string} branchId - Optional branch ID filter
   * @param {Date} startDate - Optional start date filter
   * @param {Date} endDate - Optional end date filter
   * @returns {Promise<Object>} The document counts by distribution status
   */
  async countByDistributionStatus(branchId = null, startDate = null, endDate = null) {
    const query = {};
    
    if (branchId) {
      query.branch = branchId;
    }
    
    if (startDate && endDate) {
      query.createdAt = {
        $gte: startDate,
        $lte: endDate,
      };
    }
    
    const result = await WaybillDocument.aggregate([
      { $match: query },
      { $group: {
        _id: '$distributionStatus',
        count: { $sum: 1 },
      }},
      { $project: {
        status: '$_id',
        count: 1,
        _id: 0,
      }},
    ]);
    
    // Convert array to object with status as key
    const countByStatus = {};
    result.forEach(item => {
      countByStatus[item.status] = item.count;
    });
    
    return countByStatus;
  }
}

module.exports = MongoWaybillDocumentRepository;
