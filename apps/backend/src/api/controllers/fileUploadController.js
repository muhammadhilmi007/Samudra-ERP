/**
 * Samudra Paket ERP - File Upload Controller
 * Handles API endpoints for file uploads
 */

const fileUploadService = require('../../domain/services/fileUploadService');
const { createApiError } = require('../../utils/apiError');
const logger = require('../../utils/logger');

/**
 * Upload an image
 * @route POST /api/uploads/image
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} Response with image URL
 */
const uploadImage = async (req, res, next) => {
  try {
    const { base64Data } = req.body;
    
    if (!base64Data) {
      return next(createApiError(400, 'Base64 image data is required'));
    }
    
    const imageUrl = await fileUploadService.saveImage(base64Data);
    
    res.status(200).json({
      success: true,
      data: {
        url: imageUrl
      }
    });
  } catch (error) {
    logger.error(`Error uploading image: ${error.message}`, { stack: error.stack });
    next(error);
  }
};

/**
 * Upload a signature
 * @route POST /api/uploads/signature
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} Response with signature URL
 */
const uploadSignature = async (req, res, next) => {
  try {
    const { base64Data } = req.body;
    
    if (!base64Data) {
      return next(createApiError(400, 'Base64 signature data is required'));
    }
    
    const signatureUrl = await fileUploadService.saveSignature(base64Data);
    
    res.status(200).json({
      success: true,
      data: {
        url: signatureUrl
      }
    });
  } catch (error) {
    logger.error(`Error uploading signature: ${error.message}`, { stack: error.stack });
    next(error);
  }
};

/**
 * Upload a document
 * @route POST /api/uploads/document
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} Response with document URL
 */
const uploadDocument = async (req, res, next) => {
  try {
    const { base64Data } = req.body;
    
    if (!base64Data) {
      return next(createApiError(400, 'Base64 document data is required'));
    }
    
    const documentUrl = await fileUploadService.saveDocument(base64Data);
    
    res.status(200).json({
      success: true,
      data: {
        url: documentUrl
      }
    });
  } catch (error) {
    logger.error(`Error uploading document: ${error.message}`, { stack: error.stack });
    next(error);
  }
};

/**
 * Delete a file
 * @route DELETE /api/uploads/file
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} Response with success status
 */
const deleteFile = async (req, res, next) => {
  try {
    const { fileUrl } = req.body;
    
    if (!fileUrl) {
      return next(createApiError(400, 'File URL is required'));
    }
    
    const result = await fileUploadService.deleteFile(fileUrl);
    
    res.status(200).json({
      success: true,
      data: {
        deleted: result
      }
    });
  } catch (error) {
    logger.error(`Error deleting file: ${error.message}`, { stack: error.stack });
    next(error);
  }
};

module.exports = {
  uploadImage,
  uploadSignature,
  uploadDocument,
  deleteFile
};
