/**
 * Samudra Paket ERP - Error Handling Middleware
 * Centralized error handling for API requests
 */

const { logger } = require('./logger');
const { createApiError } = require('../../../domain/utils/errorUtils');

/**
 * Custom error class for API errors
 */
class ApiError extends Error {
  constructor(code, message, details = {}, statusCode = 400) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.details = details;
    this.statusCode = statusCode;
  }
}

/**
 * Not found error handler - for routes that don't exist
 */
const notFoundHandler = (req, res, next) => {
  const error = new ApiError(
    'NOT_FOUND',
    `Route not found: ${req.method} ${req.originalUrl}`,
    {},
    404,
  );
  next(error);
};

/**
 * Global error handler - handles all errors in the application
 */
const errorHandler = (err, req, res) => {
  // Default error values
  let statusCode = err.statusCode || 500;
  let errorCode = err.code || 'SERVER_ERROR';
  let message = err.message || 'Internal Server Error';
  let details = err.details || {};

  // Handle specific error types
  if (err.name === 'ValidationError') {
    // Mongoose validation error
    statusCode = 400;
    errorCode = 'VALIDATION_ERROR';
    details = Object.values(err.errors).map((error) => ({
      field: error.path,
      message: error.message,
    }));
  } else if (err.name === 'CastError' && err.kind === 'ObjectId') {
    // MongoDB invalid ID error
    statusCode = 400;
    errorCode = 'INVALID_ID';
    message = 'Invalid ID format';
  } else if (err.code === 11000) {
    // MongoDB duplicate key error
    statusCode = 409;
    errorCode = 'DUPLICATE_ERROR';
    message = 'Duplicate entry';
    const field = Object.keys(err.keyValue)[0];
    details = {
      field,
      value: err.keyValue[field],
      message: `${field} already exists`,
    };
  }

  // Log error (don't log 404 errors as they're common and noisy)
  if (statusCode !== 404) {
    logger.error(`${errorCode}: ${message}`, {
      error: err.stack,
      requestId: req.id,
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      user: req.user ? req.user.id : 'anonymous',
    });
  }

  // Send error response
  res.status(statusCode).json(
    createApiError(errorCode, message, details),
  );
};

module.exports = {
  ApiError,
  notFoundHandler,
  errorHandler,
};
