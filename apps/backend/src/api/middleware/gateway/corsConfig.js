/**
 * Samudra Paket ERP - CORS Configuration Middleware
 * Configures Cross-Origin Resource Sharing with proper settings
 */

const cors = require('cors');

/**
 * Configure CORS with proper settings
 * @param {Object} options - CORS options
 * @returns {Function} Express middleware
 */
const corsConfig = (options = {}) => {
  const defaultOptions = {
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      
      // Check against whitelist
      const whitelist = [
        process.env.FRONTEND_URL || 'http://localhost:3000',
        process.env.MOBILE_APP_URL,
        process.env.ADMIN_DASHBOARD_URL,
        // Add other allowed origins here
      ].filter(Boolean); // Remove undefined/null values
      
      if (whitelist.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
        return callback(null, true);
      } 
      return callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
      'X-API-Key',
    ],
    exposedHeaders: ['Content-Range', 'X-Total-Count'],
    credentials: true,
    maxAge: 86400, // 24 hours
    preflightContinue: false,
    optionsSuccessStatus: 204,
  };

  return cors({
    ...defaultOptions,
    ...options
  });
};

module.exports = corsConfig;
