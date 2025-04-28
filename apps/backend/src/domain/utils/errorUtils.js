/**
 * Samudra Paket ERP - Error Utilities
 * Utility functions for handling API errors
 */

/**
 * Create a standardized API error response
 * @param {string} code - Error code
 * @param {string} message - Error message
 * @param {Object} details - Additional error details
 * @returns {Object} Standardized error response object
 */
const createApiError = (code, message, details = {}) => ({
  success: false,
  error: {
    code,
    message,
    details,
  },
});

module.exports = {
  createApiError,
};
