/**
 * Samudra Paket ERP - Position Validator
 * Validates position-related requests
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

// Create position schema
const createPositionSchema = Joi.object({
  code: Joi.string().required().trim().uppercase()
    .max(10)
    .message({
      'string.base': 'Code must be a string',
      'string.empty': 'Code is required',
      'string.max': 'Code cannot exceed 10 characters',
      'any.required': 'Code is required',
    }),
  title: Joi.string().required().trim().max(100)
    .message({
      'string.base': 'Title must be a string',
      'string.empty': 'Title is required',
      'string.max': 'Title cannot exceed 100 characters',
      'any.required': 'Title is required',
    }),
  description: Joi.string().trim().max(500).allow('', null),
  division: Joi.string().required().custom(validateObjectId).message({
    'string.base': 'Division ID must be a string',
    'string.empty': 'Division ID is required',
    'any.required': 'Division ID is required',
    'any.invalid': 'Division ID must be a valid ObjectId',
  }),
  parentPosition: Joi.string().custom(validateObjectId).allow(null).message({
    'string.base': 'Parent position ID must be a string',
    'any.invalid': 'Parent position ID must be a valid ObjectId',
  }),
  level: Joi.number().integer().min(0).default(0),
  responsibilities: Joi.array().items(Joi.string().trim().max(200)),
  requirements: Joi.object({
    education: Joi.string().trim().max(200).allow('', null),
    experience: Joi.string().trim().max(200).allow('', null),
    skills: Joi.array().items(Joi.string().trim().max(100)),
    certifications: Joi.array().items(Joi.string().trim().max(100)),
  }).allow(null),
  status: Joi.string().valid('active', 'inactive').default('active'),
  metadata: Joi.object({
    createdDate: Joi.date().allow(null),
    salaryGrade: Joi.string().trim().max(50).allow('', null),
    notes: Joi.string().trim().max(500).allow('', null),
  }).allow(null),
});

// Update position schema
const updatePositionSchema = Joi.object({
  code: Joi.string().trim().uppercase().max(10),
  title: Joi.string().trim().max(100),
  description: Joi.string().trim().max(500).allow('', null),
  division: Joi.string().custom(validateObjectId).message({
    'string.base': 'Division ID must be a string',
    'any.invalid': 'Division ID must be a valid ObjectId',
  }),
  parentPosition: Joi.string().custom(validateObjectId).allow(null).message({
    'string.base': 'Parent position ID must be a string',
    'any.invalid': 'Parent position ID must be a valid ObjectId',
  }),
  level: Joi.number().integer().min(0),
  responsibilities: Joi.array().items(Joi.string().trim().max(200)),
  requirements: Joi.object({
    education: Joi.string().trim().max(200).allow('', null),
    experience: Joi.string().trim().max(200).allow('', null),
    skills: Joi.array().items(Joi.string().trim().max(100)),
    certifications: Joi.array().items(Joi.string().trim().max(100)),
  }).allow(null),
  status: Joi.string().valid('active', 'inactive'),
  metadata: Joi.object({
    createdDate: Joi.date().allow(null),
    salaryGrade: Joi.string().trim().max(50).allow('', null),
    notes: Joi.string().trim().max(500).allow('', null),
  }).allow(null),
});

// Query positions schema
const queryPositionsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100)
    .default(10),
  sortBy: Joi.string().valid('code', 'title', 'createdAt', 'updatedAt').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  code: Joi.string().trim(),
  title: Joi.string().trim(),
  division: Joi.string().custom(validateObjectId),
  parentPosition: Joi.string().custom(validateObjectId).allow(null),
  status: Joi.string().valid('active', 'inactive'),
  level: Joi.number().integer().min(0),
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
  createPositionSchema,
  updatePositionSchema,
  queryPositionsSchema,
  idParamSchema,
};
