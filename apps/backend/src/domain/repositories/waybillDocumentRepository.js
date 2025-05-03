/**
 * Samudra Paket ERP - Waybill Document Repository Interface
 * Defines the contract for waybill document data access
 */

/**
 * WaybillDocumentRepository Interface
 * @interface
 */
class WaybillDocumentRepository {
  /**
   * Create a new waybill document
   * @param {Object} documentData - The waybill document data
   * @returns {Promise<Object>} The created waybill document
   */
  async createDocument(documentData) {
    throw new Error('Method not implemented');
  }

  /**
   * Find a waybill document by ID
   * @param {string} documentId - The document ID
   * @returns {Promise<Object>} The waybill document
   */
  async findById(documentId) {
    throw new Error('Method not implemented');
  }

  /**
   * Find a waybill document by shipment order ID
   * @param {string} shipmentOrderId - The shipment order ID
   * @param {string} documentType - Optional document type filter
   * @returns {Promise<Object>} The waybill document
   */
  async findByShipmentOrderId(shipmentOrderId, documentType) {
    throw new Error('Method not implemented');
  }

  /**
   * Find a waybill document by waybill number
   * @param {string} waybillNumber - The waybill number
   * @param {string} documentType - Optional document type filter
   * @returns {Promise<Object>} The waybill document
   */
  async findByWaybillNumber(waybillNumber, documentType) {
    throw new Error('Method not implemented');
  }

  /**
   * Find a waybill document by access token
   * @param {string} accessToken - The access token
   * @returns {Promise<Object>} The waybill document
   */
  async findByAccessToken(accessToken) {
    throw new Error('Method not implemented');
  }

  /**
   * Update a waybill document
   * @param {string} documentId - The document ID
   * @param {Object} updateData - The data to update
   * @returns {Promise<Object>} The updated waybill document
   */
  async updateDocument(documentId, updateData) {
    throw new Error('Method not implemented');
  }

  /**
   * Delete a waybill document
   * @param {string} documentId - The document ID
   * @returns {Promise<boolean>} True if the document was deleted
   */
  async deleteDocument(documentId) {
    throw new Error('Method not implemented');
  }

  /**
   * Generate a unique document ID
   * @returns {Promise<string>} The generated document ID
   */
  async generateDocumentId() {
    throw new Error('Method not implemented');
  }

  /**
   * Generate a secure access token for document access
   * @returns {Promise<string>} The generated access token
   */
  async generateAccessToken() {
    throw new Error('Method not implemented');
  }

  /**
   * Record document access
   * @param {string} documentId - The document ID
   * @returns {Promise<Object>} The updated waybill document
   */
  async recordAccess(documentId) {
    throw new Error('Method not implemented');
  }

  /**
   * Create a new version of a document
   * @param {string} documentId - The document ID
   * @param {string} fileUrl - The URL of the new file
   * @param {Object} user - The user creating the new version
   * @param {string} reason - The reason for creating a new version
   * @returns {Promise<Object>} The updated waybill document
   */
  async createNewVersion(documentId, fileUrl, user, reason) {
    throw new Error('Method not implemented');
  }

  /**
   * Update distribution status for a recipient
   * @param {string} documentId - The document ID
   * @param {string} recipientValue - The recipient value (email or phone)
   * @param {string} status - The new status
   * @param {string} errorMessage - Optional error message
   * @returns {Promise<Object>} The updated waybill document
   */
  async updateDistributionStatus(documentId, recipientValue, status, errorMessage) {
    throw new Error('Method not implemented');
  }

  /**
   * Find documents by branch
   * @param {string} branchId - The branch ID
   * @param {Object} filters - Additional filters
   * @param {Object} options - Query options (pagination, sorting)
   * @returns {Promise<Object>} The waybill documents and count
   */
  async findByBranch(branchId, filters, options) {
    throw new Error('Method not implemented');
  }

  /**
   * Find documents by date range
   * @param {Date} startDate - The start date
   * @param {Date} endDate - The end date
   * @param {Object} filters - Additional filters
   * @param {Object} options - Query options (pagination, sorting)
   * @returns {Promise<Object>} The waybill documents and count
   */
  async findByDateRange(startDate, endDate, filters, options) {
    throw new Error('Method not implemented');
  }

  /**
   * Count documents by type
   * @param {string} branchId - Optional branch ID filter
   * @param {Date} startDate - Optional start date filter
   * @param {Date} endDate - Optional end date filter
   * @returns {Promise<Object>} The document counts by type
   */
  async countByType(branchId, startDate, endDate) {
    throw new Error('Method not implemented');
  }

  /**
   * Count documents by distribution status
   * @param {string} branchId - Optional branch ID filter
   * @param {Date} startDate - Optional start date filter
   * @param {Date} endDate - Optional end date filter
   * @returns {Promise<Object>} The document counts by distribution status
   */
  async countByDistributionStatus(branchId, startDate, endDate) {
    throw new Error('Method not implemented');
  }
}

module.exports = WaybillDocumentRepository;
