/**
 * Samudra Paket ERP - Division Validator
 * Validates division-related requests
 */

const Joi = require('joi');
const mongoose = require('mongoose');

// Helper function to validate MongoDB ObjectId
const validateObjectId = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error('any.invalid');
  }
  return value;
};

// Create division schema
const createDivisionSchema = Joi.object({
  code: Joi.string().required().trim().uppercase()
    .max(10)
    .message({
      'string.base': 'Code must be a string',
      'string.empty': 'Code is required',
      'string.max': 'Code cannot exceed 10 characters',
      'any.required': 'Code is required',
    }),
  name: Joi.string().required().trim().max(100)
    .message({
      'string.base': 'Name must be a string',
      'string.empty': 'Name is required',
      'string.max': 'Name cannot exceed 100 characters',
      'any.required': 'Name is required',
    }),
  description: Joi.string().trim().max(500).allow('', null),
  branch: Joi.string().required().custom(validateObjectId).message({
    'string.base': 'Branch ID must be a string',
    'string.empty': 'Branch ID is required',
    'any.required': 'Branch ID is required',
    'any.invalid': 'Branch ID must be a valid ObjectId',
  }),
  parentDivision: Joi.string().custom(validateObjectId).allow(null).message({
    'string.base': 'Parent division ID must be a string',
    'any.invalid': 'Parent division ID must be a valid ObjectId',
  }),
  head: Joi.string().custom(validateObjectId).allow(null).message({
    'string.base': 'Head ID must be a string',
    'any.invalid': 'Head ID must be a valid ObjectId',
  }),
  status: Joi.string().valid('active', 'inactive').default('active'),
  metadata: Joi.object({
    establishedDate: Joi.date().allow(null),
    notes: Joi.string().trim().max(500).allow('', null),
  }).allow(null),
});

// Update division schema
const updateDivisionSchema = Joi.object({
  code: Joi.string().trim().uppercase().max(10),
  name: Joi.string().trim().max(100),
  description: Joi.string().trim().max(500).allow('', null),
  branch: Joi.string().custom(validateObjectId).message({
    'string.base': 'Branch ID must be a string',
    'any.invalid': 'Branch ID must be a valid ObjectId',
  }),
  parentDivision: Joi.string().custom(validateObjectId).allow(null).message({
    'string.base': 'Parent division ID must be a string',
    'any.invalid': 'Parent division ID must be a valid ObjectId',
  }),
  head: Joi.string().custom(validateObjectId).allow(null).message({
    'string.base': 'Head ID must be a string',
    'any.invalid': 'Head ID must be a valid ObjectId',
  }),
  status: Joi.string().valid('active', 'inactive'),
  metadata: Joi.object({
    establishedDate: Joi.date().allow(null),
    notes: Joi.string().trim().max(500).allow('', null),
  }).allow(null),
});

// Query divisions schema
const queryDivisionsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100)
    .default(10),
  sortBy: Joi.string().valid('code', 'name', 'createdAt', 'updatedAt').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  code: Joi.string().trim(),
  name: Joi.string().trim(),
  branch: Joi.string().custom(validateObjectId),
  parentDivision: Joi.string().custom(validateObjectId).allow(null),
  status: Joi.string().valid('active', 'inactive'),
});

// ID parameter schema
const idParamSchema = Joi.object({
  id: Joi.string().required().custom(validateObjectId).message({
    'string.base': 'ID must be a string',
    'string.empty': 'ID is required',
    'any.required': 'ID is required',
    'any.invalid': 'ID must be a valid ObjectId',
  }),
});

module.exports = {
  createDivisionSchema,
  updateDivisionSchema,
  queryDivisionsSchema,
  idParamSchema,
};
