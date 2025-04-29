/**
 * Samudra Paket ERP - Request Validation Middleware
 * Validates incoming requests against predefined schemas
 */

const Joi = require('joi');
const { createApiError } = require('../../../domain/utils/errorUtils');

/**
 * Create a validation middleware with a Joi schema
 * @param {Object} schema - Joi validation schema
 * @param {String} property - Request property to validate (body, params, query)
 * @returns {Function} Express middleware
 */
const validateRequest = (schema, property = 'body') => (
  (req, res, next) => {
    const dataToValidate = req[property];
    
    const { error, value } = schema.validate(dataToValidate, {
      abortEarly: false,
      stripUnknown: true,
      errors: {
        wrap: {
          label: false
        }
      }
    });
    
    if (error) {
      const details = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return res.status(400).json(
        createApiError('VALIDATION_ERROR', 'Invalid request data', details)
      );
    }
    
    // Replace request data with validated data
    req[property] = value;
    return next();
  }
);

/**
 * Common validation schemas
 */
const schemas = {
  // Auth schemas
  login: Joi.object({
    username: Joi.string().required().messages({
      'string.empty': 'Username is required',
      'any.required': 'Username is required'
    }),
    password: Joi.string().required().messages({
      'string.empty': 'Password is required',
      'any.required': 'Password is required'
    })
  }),
  
  // Package schemas
  packageCreate: Joi.object({
    trackingNumber: Joi.string().required(),
    sender: Joi.object({
      name: Joi.string().required(),
      address: Joi.string().required(),
      phone: Joi.string().required(),
      email: Joi.string().email().optional()
    }),
    recipient: Joi.object({
      name: Joi.string().required(),
      address: Joi.string().required(),
      phone: Joi.string().required(),
      email: Joi.string().email().optional()
    }),
    weight: Joi.number().positive().required(),
    dimensions: Joi.object({
      length: Joi.number().positive().required(),
      width: Joi.number().positive().required(),
      height: Joi.number().positive().required()
    }),
    serviceType: Joi.string().valid('regular', 'express', 'same-day').required(),
    status: Joi.string().valid('pending', 'picked-up', 'in-transit', 'delivered', 'returned').default('pending'),
    price: Joi.number().positive().required(),
    notes: Joi.string().optional()
  }),
  
  packageUpdate: Joi.object({
    sender: Joi.object({
      name: Joi.string().optional(),
      address: Joi.string().optional(),
      phone: Joi.string().optional(),
      email: Joi.string().email().optional()
    }).optional(),
    recipient: Joi.object({
      name: Joi.string().optional(),
      address: Joi.string().optional(),
      phone: Joi.string().optional(),
      email: Joi.string().email().optional()
    }).optional(),
    weight: Joi.number().positive().optional(),
    dimensions: Joi.object({
      length: Joi.number().positive().optional(),
      width: Joi.number().positive().optional(),
      height: Joi.number().positive().optional()
    }).optional(),
    serviceType: Joi.string().valid('regular', 'express', 'same-day').optional(),
    price: Joi.number().positive().optional(),
    notes: Joi.string().optional()
  }),
  
  packageStatusUpdate: Joi.object({
    status: Joi.string().valid('pending', 'picked-up', 'in-transit', 'delivered', 'returned').required(),
    notes: Joi.string().optional(),
    location: Joi.string().optional(),
    timestamp: Joi.date().default(Date.now)
  }),
  
  // ID parameter validation
  idParam: Joi.object({
    id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required().messages({
      'string.pattern.base': 'Invalid ID format',
      'string.empty': 'ID is required',
      'any.required': 'ID is required'
    })
  })
};

module.exports = {
  validateRequest,
  schemas
};
