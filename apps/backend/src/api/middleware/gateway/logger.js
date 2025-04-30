/**
 * Samudra Paket ERP - Logging Middleware
 * Implements request logging for API monitoring and debugging
 */

const morgan = require('morgan');

const winston = require('winston');

const { format, transports } = winston;

// Configure Winston logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.splat(),
    format.json(),
  ),
  defaultMeta: { service: 'samudra-api' },
  transports: [
    // Write all logs to console
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.printf(
          (info) => `${info.timestamp} ${info.level}: ${info.message} ${info.stack || ''}`,
        ),
      ),
    }),
    // Write all logs with level 'error' and below to error.log
    new transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Write all logs with level 'info' and below to combined.log
    new transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
  exceptionHandlers: [
    new transports.File({ filename: 'logs/exceptions.log' }),
  ],
  rejectionHandlers: [
    new transports.File({ filename: 'logs/rejections.log' }),
  ],
});

// If we're not in production, also log to the console with simpler formatting
if (process.env.NODE_ENV !== 'production') {
  logger.add(new transports.Console({
    format: format.combine(
      format.colorize(),
      format.simple(),
    ),
  }));
}

// Create a stream object for Morgan
const stream = {
  write: (message) => logger.info(message.trim()),
};

// Create Morgan middleware with custom format
const httpLogger = morgan(
  // Define format
  ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" - :response-time ms',
  // Options
  { stream },
);

// Create request logger middleware
const requestLogger = (req, res, next) => {
  // Log request body for non-GET requests if not a file upload
  if (req.method !== 'GET' && !req.is('multipart/form-data')) {
    const sanitizedBody = { ...req.body };

    // Sanitize sensitive fields
    if (sanitizedBody.password) sanitizedBody.password = '[REDACTED]';
    if (sanitizedBody.token) sanitizedBody.token = '[REDACTED]';
    if (sanitizedBody.refreshToken) sanitizedBody.refreshToken = '[REDACTED]';

    logger.debug(`Request Body: ${JSON.stringify(sanitizedBody)}`);
  }

  next();
};

// Export logger and middleware
module.exports = {
  logger,
  httpLogger,
  requestLogger,
};
