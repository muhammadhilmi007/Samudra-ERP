/**
 * Samudra Paket ERP - Error Utilities
 * Utility functions for handling API errors
 */

class ApplicationError extends Error {
  constructor(message, code, status, details = {}) {
    super(message);
    this.name = this.constructor.name;
    this.code = code || 'APPLICATION_ERROR';
    this.status = status || 500;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

class NotFoundError extends ApplicationError {
  constructor(resource, id) {
    super(`${resource} dengan ID ${id} tidak ditemukan`, 'RESOURCE_NOT_FOUND', 404);
    this.details = { resource, id };
  }
}

class UnauthorizedError extends ApplicationError {
  constructor(action) {
    super(`Tidak diizinkan mengakses ${action}`, 'UNAUTHORIZED_ACCESS', 403);
    this.details = { action };
  }
}

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
  ApplicationError,
  NotFoundError,
  UnauthorizedError,
  createApiError,
};
