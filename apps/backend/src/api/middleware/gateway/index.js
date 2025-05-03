/**
 * Samudra Paket ERP - API Gateway
 * Main entry point for the API Gateway middleware
 */

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const securityHeaders = require('./securityHeaders');
const corsConfig = require('./corsConfig');
const { apiLimiter, authLimiter } = require('./rateLimiter');
const { httpLogger, requestLogger } = require('./logger');
const { notFoundHandler, errorHandler } = require('./errorHandler');
const performanceMonitoringMiddleware = require('../performanceMonitoringMiddleware');

/**
 * Configure API Gateway middleware
 * @param {Object} app - Express application
 */
const configureApiGateway = (app) => {
  // Add request ID to each request
  app.use((req, res, next) => {
    req.id = uuidv4();
    res.setHeader('X-Request-ID', req.id);
    next();
  });

  // Apply security headers
  app.use(securityHeaders());

  // Configure CORS
  app.use(corsConfig());

  // Parse JSON request body
  app.use(express.json({ limit: '1mb' }));

  // Parse URL-encoded request body
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // HTTP request logging
  app.use(httpLogger);

  // Request body logging
  app.use(requestLogger);

  // Apply rate limiting to auth routes
  app.use('/api/auth', authLimiter);

  // Apply general rate limiting to all other routes
  app.use('/api', apiLimiter);

  // Apply performance monitoring middleware
  app.use('/api', performanceMonitoringMiddleware);

  return app;
};

/**
 * Configure API Gateway error handling
 * @param {Object} app - Express application
 */
const configureErrorHandling = (app) => {
  // 404 handler for undefined routes
  app.use(notFoundHandler);

  // Global error handler
  app.use(errorHandler);

  return app;
};

module.exports = {
  configureApiGateway,
  configureErrorHandling,
};
