/**
 * Samudra Paket ERP - API Error
 * Custom error class for API responses
 */

/**
 * API Error class
 * Used for consistent error handling across the API
 */
class ApiError extends Error {
  /**
   * Create a new API error
   * @param {number} statusCode - HTTP status code
   * @param {string} code - Error code
   * @param {string} message - Error message
   * @param {Object} details - Additional error details
   */
  constructor(statusCode, code, message, details = {}) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.success = false;
    this.name = 'ApiError';
  }

  /**
   * Convert to JSON response
   * @returns {Object} Error response object
   */
  toJSON() {
    return {
      success: false,
      error: {
        code: this.code,
        message: this.message,
        details: this.details,
      },
    };
  }

  /**
   * Create a 400 Bad Request error
   * @param {string} message - Error message
   * @param {Object} details - Additional error details
   * @returns {ApiError} API error instance
   */
  static badRequest(message, details = {}) {
    return new ApiError(400, 'BadRequest', message, details);
  }

  /**
   * Create a 401 Unauthorized error
   * @param {string} message - Error message
   * @param {Object} details - Additional error details
   * @returns {ApiError} API error instance
   */
  static unauthorized(message = 'Authentication required', details = {}) {
    return new ApiError(401, 'Unauthorized', message, details);
  }

  /**
   * Create a 403 Forbidden error
   * @param {string} message - Error message
   * @param {Object} details - Additional error details
   * @returns {ApiError} API error instance
   */
  static forbidden(message = 'Access denied', details = {}) {
    return new ApiError(403, 'Forbidden', message, details);
  }

  /**
   * Create a 404 Not Found error
   * @param {string} message - Error message
   * @param {Object} details - Additional error details
   * @returns {ApiError} API error instance
   */
  static notFound(message = 'Resource not found', details = {}) {
    return new ApiError(404, 'NotFound', message, details);
  }

  /**
   * Create a 409 Conflict error
   * @param {string} message - Error message
   * @param {Object} details - Additional error details
   * @returns {ApiError} API error instance
   */
  static conflict(message, details = {}) {
    return new ApiError(409, 'Conflict', message, details);
  }

  /**
   * Create a 422 Unprocessable Entity error
   * @param {string} message - Error message
   * @param {Object} details - Additional error details
   * @returns {ApiError} API error instance
   */
  static validationError(message = 'Validation failed', details = {}) {
    return new ApiError(422, 'ValidationError', message, details);
  }

  /**
   * Create a 500 Internal Server Error
   * @param {string} message - Error message
   * @param {Object} details - Additional error details
   * @returns {ApiError} API error instance
   */
  static internal(message = 'Internal server error', details = {}) {
    return new ApiError(500, 'InternalError', message, details);
  }
}

module.exports = { ApiError };
