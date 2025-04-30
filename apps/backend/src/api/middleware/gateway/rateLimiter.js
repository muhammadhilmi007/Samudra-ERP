/**
 * Samudra Paket ERP - Rate Limiting Middleware
 * Implements rate limiting to protect API from abuse
 */

const rateLimit = require('express-rate-limit');
const { createApiError } = require('../../../domain/utils/errorUtils');

/**
 * Create a rate limiter middleware with customizable options
 * @param {Object} options - Rate limiter options
 * @returns {Function} Express middleware
 */
const createRateLimiter = (options = {}) => {
  const defaultOptions = {
    windowMs: 15 * 60 * 1000, // 15 minutes by default
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: (req, res) => res.status(429).json(
      createApiError('TOO_MANY_REQUESTS', 'Too many requests, please try again later'),
    ),
  };

  return rateLimit({
    ...defaultOptions,
    ...options,
  });
};

/**
 * Default API rate limiter - 100 requests per 15 minutes
 */
const apiLimiter = createRateLimiter();

/**
 * Auth endpoints rate limiter - 10 requests per 15 minutes
 * More restrictive to prevent brute force attacks
 */
const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: (req, res) => res.status(429).json(
    createApiError('TOO_MANY_REQUESTS', 'Too many authentication attempts, please try again later'),
  ),
});

module.exports = {
  createRateLimiter,
  apiLimiter,
  authLimiter,
};
