/**
 * Samudra Paket ERP - File Upload Service
 * Handles file uploads for images and signatures
 */

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const logger = require('../../utils/logger');

// Base upload directory
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, '../../../uploads');

// Ensure upload directories exist
const ensureDirectoryExists = (directory) => {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
};

// Initialize upload directories
const initializeDirectories = () => {
  ensureDirectoryExists(UPLOAD_DIR);
  ensureDirectoryExists(path.join(UPLOAD_DIR, 'images'));
  ensureDirectoryExists(path.join(UPLOAD_DIR, 'signatures'));
  ensureDirectoryExists(path.join(UPLOAD_DIR, 'documents'));
  ensureDirectoryExists(path.join(UPLOAD_DIR, 'temp'));
};

// Initialize directories on service load
initializeDirectories();

/**
 * Save a base64 image to the file system
 * @param {string} base64Data - Base64 encoded image data
 * @param {string} fileType - Type of file (image, signature, document)
 * @returns {Promise<string>} URL of the saved file
 */
const saveBase64File = async (base64Data, fileType = 'image') => {
  try {
    // Validate file type
    const validTypes = ['image', 'signature', 'document'];
    if (!validTypes.includes(fileType)) {
      throw new Error(`Invalid file type: ${fileType}`);
    }
    
    // Extract MIME type and actual base64 data
    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    
    if (!matches || matches.length !== 3) {
      throw new Error('Invalid base64 data');
    }
    
    const mimeType = matches[1];
    const actualData = matches[2];
    
    // Validate MIME type
    const validMimeTypes = {
      image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      signature: ['image/jpeg', 'image/png', 'image/svg+xml'],
      document: ['application/pdf', 'image/jpeg', 'image/png']
    };
    
    if (!validMimeTypes[fileType].includes(mimeType)) {
      throw new Error(`Invalid MIME type for ${fileType}: ${mimeType}`);
    }
    
    // Get file extension from MIME type
    const extensionMap = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/webp': 'webp',
      'image/svg+xml': 'svg',
      'application/pdf': 'pdf'
    };
    
    const extension = extensionMap[mimeType];
    
    // Generate a unique filename
    const filename = `${uuidv4()}.${extension}`;
    
    // Determine upload directory based on file type
    const uploadDir = path.join(UPLOAD_DIR, `${fileType}s`);
    ensureDirectoryExists(uploadDir);
    
    // Full path to save the file
    const filePath = path.join(uploadDir, filename);
    
    // Convert base64 to buffer and save to file
    const buffer = Buffer.from(actualData, 'base64');
    await fs.promises.writeFile(filePath, buffer);
    
    // Generate URL for the file
    // In production, this would be a CDN or public URL
    // For development, we'll use a relative path
    const fileUrl = `/uploads/${fileType}s/${filename}`;
    
    return fileUrl;
  } catch (error) {
    logger.error(`Error saving ${fileType} file: ${error.message}`, { stack: error.stack });
    throw error;
  }
};

/**
 * Delete a file from the file system
 * @param {string} fileUrl - URL of the file to delete
 * @returns {Promise<boolean>} True if deletion was successful
 */
const deleteFile = async (fileUrl) => {
  try {
    // Extract filename from URL
    const urlParts = fileUrl.split('/');
    const filename = urlParts[urlParts.length - 1];
    const fileType = urlParts[urlParts.length - 2];
    
    // Validate file type
    const validTypes = ['images', 'signatures', 'documents', 'temp'];
    if (!validTypes.includes(fileType)) {
      throw new Error(`Invalid file type in URL: ${fileType}`);
    }
    
    // Full path to the file
    const filePath = path.join(UPLOAD_DIR, fileType, filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      logger.warn(`File not found for deletion: ${filePath}`);
      return false;
    }
    
    // Delete the file
    await fs.promises.unlink(filePath);
    
    return true;
  } catch (error) {
    logger.error(`Error deleting file: ${error.message}`, { stack: error.stack });
    throw error;
  }
};

/**
 * Save an image file
 * @param {string} base64Data - Base64 encoded image data
 * @returns {Promise<string>} URL of the saved image
 */
const saveImage = async (base64Data) => {
  return saveBase64File(base64Data, 'image');
};

/**
 * Save a signature file
 * @param {string} base64Data - Base64 encoded signature data
 * @returns {Promise<string>} URL of the saved signature
 */
const saveSignature = async (base64Data) => {
  return saveBase64File(base64Data, 'signature');
};

/**
 * Save a document file
 * @param {string} base64Data - Base64 encoded document data
 * @returns {Promise<string>} URL of the saved document
 */
const saveDocument = async (base64Data) => {
  return saveBase64File(base64Data, 'document');
};

module.exports = {
  saveImage,
  saveSignature,
  saveDocument,
  deleteFile
};
