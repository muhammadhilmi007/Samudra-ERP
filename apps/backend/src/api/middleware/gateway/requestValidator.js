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
          label: false,
        },
      },
    });

    if (error) {
      const details = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      return res.status(400).json(
        createApiError('VALIDATION_ERROR', 'Invalid request data', details),
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
  register: Joi.object({
    username: Joi.string().min(3).max(30).required()
      .messages({
        'string.empty': 'Username is required',
        'string.min': 'Username must be at least {#limit} characters',
        'string.max': 'Username cannot exceed {#limit} characters',
        'any.required': 'Username is required',
      }),
    email: Joi.string().email().required().messages({
      'string.empty': 'Email is required',
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
    password: Joi.string().min(8).required().messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least {#limit} characters',
      'any.required': 'Password is required',
    }),
    fullName: Joi.string().required().messages({
      'string.empty': 'Full name is required',
      'any.required': 'Full name is required',
    }),
    phoneNumber: Joi.string().pattern(/^[0-9+\-\s]+$/).messages({
      'string.pattern.base': 'Phone number must contain only digits, +, - or spaces',
    }),
    // eslint-disable-next-line max-len
    role: Joi.string().valid('ADMIN', 'MANAGER', 'OPERATOR', 'DRIVER', 'CHECKER', 'DEBT_COLLECTOR', 'CUSTOMER').default('CUSTOMER'),
  }),

  login: Joi.object({
    username: Joi.string().required().messages({
      'string.empty': 'Username is required',
      'any.required': 'Username is required',
    }),
    password: Joi.string().required().messages({
      'string.empty': 'Password is required',
      'any.required': 'Password is required',
    }),
  }),

  requestPasswordReset: Joi.object({
    email: Joi.string().email().required().messages({
      'string.empty': 'Email is required',
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
  }),

  resetPassword: Joi.object({
    token: Joi.string().required().messages({
      'string.empty': 'Reset token is required',
      'any.required': 'Reset token is required',
    }),
    newPassword: Joi.string().min(8).required().messages({
      'string.empty': 'New password is required',
      'string.min': 'New password must be at least {#limit} characters',
      'any.required': 'New password is required',
    }),
  }),

  changePassword: Joi.object({
    currentPassword: Joi.string().required().messages({
      'string.empty': 'Current password is required',
      'any.required': 'Current password is required',
    }),
    newPassword: Joi.string().min(8).required().messages({
      'string.empty': 'New password is required',
      'string.min': 'New password must be at least {#limit} characters',
      'any.required': 'New password is required',
    }),
  }),

  // Package schemas
  packageCreate: Joi.object({
    trackingNumber: Joi.string().required(),
    sender: Joi.object({
      name: Joi.string().required(),
      address: Joi.string().required(),
      phone: Joi.string().required(),
      email: Joi.string().email().optional(),
    }),
    recipient: Joi.object({
      name: Joi.string().required(),
      address: Joi.string().required(),
      phone: Joi.string().required(),
      email: Joi.string().email().optional(),
    }),
    weight: Joi.number().positive().required(),
    dimensions: Joi.object({
      length: Joi.number().positive().required(),
      width: Joi.number().positive().required(),
      height: Joi.number().positive().required(),
    }),
    serviceType: Joi.string().valid('regular', 'express', 'same-day').required(),
    // eslint-disable-next-line max-len
    status: Joi.string().valid('pending', 'picked-up', 'in-transit', 'delivered', 'returned').default('pending'),
    price: Joi.number().positive().required(),
    notes: Joi.string().optional(),
  }),

  packageUpdate: Joi.object({
    sender: Joi.object({
      name: Joi.string().optional(),
      address: Joi.string().optional(),
      phone: Joi.string().optional(),
      email: Joi.string().email().optional(),
    }).optional(),
    recipient: Joi.object({
      name: Joi.string().optional(),
      address: Joi.string().optional(),
      phone: Joi.string().optional(),
      email: Joi.string().email().optional(),
    }).optional(),
    weight: Joi.number().positive().optional(),
    dimensions: Joi.object({
      length: Joi.number().positive().optional(),
      width: Joi.number().positive().optional(),
      height: Joi.number().positive().optional(),
    }).optional(),
    serviceType: Joi.string().valid('regular', 'express', 'same-day').optional(),
    price: Joi.number().positive().optional(),
    notes: Joi.string().optional(),
  }),

  packageStatusUpdate: Joi.object({
    // eslint-disable-next-line max-len
    status: Joi.string().valid('pending', 'picked-up', 'in-transit', 'delivered', 'returned').required(),
    notes: Joi.string().optional(),
    location: Joi.string().optional(),
    timestamp: Joi.date().default(Date.now),
  }),

  // ID parameter validation
  idParam: Joi.object({
    id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required().messages({
      'string.pattern.base': 'Invalid ID format',
      'string.empty': 'ID is required',
      'any.required': 'ID is required',
    }),
  }),
};

module.exports = {
  validateRequest,
  schemas,
};
