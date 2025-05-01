/**
 * Samudra Paket ERP - ValidationError
 * Used when input validation fails
 */

/**
 * ValidationError class
 * Used when input validation fails
 */
class ValidationError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = 'ValidationError';
    this.code = 'VALIDATION_ERROR';
    this.statusCode = 400;
    this.details = details;
  }
}

module.exports = ValidationError;
