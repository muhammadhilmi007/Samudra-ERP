/**
 * Samudra Paket ERP - Error Classes
 * Centralized error definitions for consistent error handling across the application
 */

/**
 * BadRequestError
 * Thrown when a request is malformed or contains invalid data
 */
class BadRequestError extends Error {
  constructor(message = 'Bad Request') {
    super(message);
    this.name = 'BadRequestError';
    this.statusCode = 400;
  }
}

/**
 * NotFoundError
 * Thrown when a requested resource is not found
 */
class NotFoundError extends Error {
  constructor(message = 'Resource not found') {
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = 404;
  }
}

/**
 * ConflictError
 * Thrown when a request conflicts with the current state of the server
 */
class ConflictError extends Error {
  constructor(message = 'Conflict with current state') {
    super(message);
    this.name = 'ConflictError';
    this.statusCode = 409;
  }
}

/**
 * UnauthorizedError
 * Thrown when authentication is required but not provided or invalid
 */
class UnauthorizedError extends Error {
  constructor(message = 'Authentication required') {
    super(message);
    this.name = 'UnauthorizedError';
    this.statusCode = 401;
  }
}

/**
 * ForbiddenError
 * Thrown when the user doesn't have permission to access a resource
 */
class ForbiddenError extends Error {
  constructor(message = 'Access forbidden') {
    super(message);
    this.name = 'ForbiddenError';
    this.statusCode = 403;
  }
}

/**
 * ValidationError
 * Thrown when validation fails on user input
 */
class ValidationError extends Error {
  constructor(message = 'Validation failed', errors = []) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 422;
    this.errors = errors;
  }
}

/**
 * InternalServerError
 * Thrown when an unexpected error occurs on the server
 */
class InternalServerError extends Error {
  constructor(message = 'Internal server error') {
    super(message);
    this.name = 'InternalServerError';
    this.statusCode = 500;
  }
}

module.exports = {
  BadRequestError,
  NotFoundError,
  ConflictError,
  UnauthorizedError,
  ForbiddenError,
  ValidationError,
  InternalServerError,
};
