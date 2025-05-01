/**
 * Samudra Paket ERP - NotFoundError
 * Used when a requested resource is not found
 */

/**
 * NotFoundError class
 * Used when a requested resource is not found
 */
class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
    this.code = 'NOT_FOUND';
    this.statusCode = 404;
  }
}

module.exports = NotFoundError;
