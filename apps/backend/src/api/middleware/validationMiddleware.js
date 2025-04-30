/**
 * Samudra Paket ERP - Validation Middleware
 * Middleware for validating request data using Joi schemas
 */

/**
 * Validates request data against a Joi schema
 * @param {Object} schema - Joi schema to validate against
 * @param {string} property - Request property to validate (body, params, query)
 * @returns {Function} Express middleware function
 */
const validateRequest = (schema, property = 'body') => (req, res, next) => {
  const { error, value } = schema.validate(req[property], {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const errorDetails = error.details.map((detail) => ({
      message: detail.message,
      path: detail.path,
    }));

    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: errorDetails,
      },
    });
  }

  // Replace request data with validated data
  req[property] = value;
  return next();
};

module.exports = {
  validateRequest,
};
