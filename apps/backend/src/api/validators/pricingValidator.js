/**
 * Samudra Paket ERP - Pricing Validator
 * Validation middleware for pricing endpoints
 */

const { body, param, query, validationResult } = require('express-validator');
const { ValidationError } = require('../../domain/utils/errorUtils');

/**
 * Validate request data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError('Validation failed', errors.array());
  }
  next();
};

/**
 * Validation rules for creating a pricing rule
 */
const validateCreatePricingRule = [
  // Basic pricing rule information
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .isString()
    .withMessage('Name must be a string')
    .isLength({ min: 3, max: 100 })
    .withMessage('Name must be between 3 and 100 characters'),

  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string'),

  body('serviceType')
    .notEmpty()
    .withMessage('Service type is required')
    .isIn(['regular', 'express', 'same_day', 'next_day', 'economy'])
    .withMessage('Invalid service type'),

  // Origin area validation
  body('originArea.province')
    .notEmpty()
    .withMessage('Origin province is required')
    .isString()
    .withMessage('Origin province must be a string'),

  body('originArea.city')
    .notEmpty()
    .withMessage('Origin city is required')
    .isString()
    .withMessage('Origin city must be a string'),

  body('originArea.district')
    .optional()
    .isString()
    .withMessage('Origin district must be a string'),

  // Destination area validation
  body('destinationArea.province')
    .notEmpty()
    .withMessage('Destination province is required')
    .isString()
    .withMessage('Destination province must be a string'),

  body('destinationArea.city')
    .notEmpty()
    .withMessage('Destination city is required')
    .isString()
    .withMessage('Destination city must be a string'),

  body('destinationArea.district')
    .optional()
    .isString()
    .withMessage('Destination district must be a string'),

  // Pricing type and values
  body('pricingType')
    .notEmpty()
    .withMessage('Pricing type is required')
    .isIn(['weight', 'distance', 'flat', 'combined'])
    .withMessage('Invalid pricing type'),

  body('basePrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Base price must be a non-negative number'),

  body('minimumPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum price must be a non-negative number'),

  // Weight tiers validation
  body('weightTiers')
    .optional()
    .isArray()
    .withMessage('Weight tiers must be an array'),

  body('weightTiers.*.minWeight')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum weight must be a non-negative number'),

  body('weightTiers.*.maxWeight')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum weight must be a non-negative number'),

  body('weightTiers.*.pricePerKg')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price per kg must be a non-negative number'),

  body('weightTiers.*.flatPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Flat price must be a non-negative number'),

  // Distance tiers validation
  body('distanceTiers')
    .optional()
    .isArray()
    .withMessage('Distance tiers must be an array'),

  body('distanceTiers.*.minDistance')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum distance must be a non-negative number'),

  body('distanceTiers.*.maxDistance')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum distance must be a non-negative number'),

  body('distanceTiers.*.pricePerKm')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price per km must be a non-negative number'),

  body('distanceTiers.*.flatPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Flat price must be a non-negative number'),

  // Special services validation
  body('specialServices')
    .optional()
    .isArray()
    .withMessage('Special services must be an array'),

  body('specialServices.*.serviceCode')
    .optional()
    .isString()
    .withMessage('Service code must be a string'),

  body('specialServices.*.serviceName')
    .optional()
    .isString()
    .withMessage('Service name must be a string'),

  body('specialServices.*.price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Service price must be a non-negative number'),

  body('specialServices.*.isPercentage')
    .optional()
    .isBoolean()
    .withMessage('isPercentage must be a boolean'),

  // Discounts validation
  body('discounts')
    .optional()
    .isArray()
    .withMessage('Discounts must be an array'),

  body('discounts.*.name')
    .optional()
    .isString()
    .withMessage('Discount name must be a string'),

  body('discounts.*.discountType')
    .optional()
    .isIn(['percentage', 'fixed', 'free_service'])
    .withMessage('Invalid discount type'),

  body('discounts.*.value')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Discount value must be a non-negative number'),

  body('discounts.*.startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),

  // Other fields
  body('taxPercentage')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Tax percentage must be a non-negative number'),

  body('insurancePercentage')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Insurance percentage must be a non-negative number'),

  body('volumetricDivisor')
    .optional()
    .isFloat({ min: 1 })
    .withMessage('Volumetric divisor must be at least 1'),

  body('effectiveDate')
    .optional()
    .isISO8601()
    .withMessage('Effective date must be a valid ISO 8601 date'),

  body('expiryDate')
    .optional()
    .isISO8601()
    .withMessage('Expiry date must be a valid ISO 8601 date'),

  body('priority')
    .optional()
    .isInt()
    .withMessage('Priority must be an integer'),

  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),

  body('branch')
    .optional()
    .isMongoId()
    .withMessage('Branch ID must be a valid MongoDB ID'),

  body('applicableCustomerTypes')
    .optional()
    .isArray()
    .withMessage('Applicable customer types must be an array'),

  body('applicableCustomerTypes.*')
    .optional()
    .isString()
    .withMessage('Customer type must be a string'),

  validateRequest,
];

/**
 * Validation rules for updating a pricing rule
 */
const validateUpdatePricingRule = [
  param('id')
    .notEmpty()
    .withMessage('Pricing rule ID is required')
    .isMongoId()
    .withMessage('Invalid pricing rule ID'),

  // Allow partial updates for all fields
  body('name')
    .optional()
    .isString()
    .withMessage('Name must be a string')
    .isLength({ min: 3, max: 100 })
    .withMessage('Name must be between 3 and 100 characters'),

  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string'),

  body('serviceType')
    .optional()
    .isIn(['regular', 'express', 'same_day', 'next_day', 'economy'])
    .withMessage('Invalid service type'),

  body('originArea.province')
    .optional()
    .isString()
    .withMessage('Origin province must be a string'),

  body('originArea.city')
    .optional()
    .isString()
    .withMessage('Origin city must be a string'),

  body('originArea.district')
    .optional()
    .isString()
    .withMessage('Origin district must be a string'),

  body('destinationArea.province')
    .optional()
    .isString()
    .withMessage('Destination province must be a string'),

  body('destinationArea.city')
    .optional()
    .isString()
    .withMessage('Destination city must be a string'),

  body('destinationArea.district')
    .optional()
    .isString()
    .withMessage('Destination district must be a string'),

  body('pricingType')
    .optional()
    .isIn(['weight', 'distance', 'flat', 'combined'])
    .withMessage('Invalid pricing type'),

  body('basePrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Base price must be a non-negative number'),

  body('minimumPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum price must be a non-negative number'),

  body('taxPercentage')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Tax percentage must be a non-negative number'),

  body('insurancePercentage')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Insurance percentage must be a non-negative number'),

  body('volumetricDivisor')
    .optional()
    .isFloat({ min: 1 })
    .withMessage('Volumetric divisor must be at least 1'),

  body('effectiveDate')
    .optional()
    .isISO8601()
    .withMessage('Effective date must be a valid ISO 8601 date'),

  body('expiryDate')
    .optional()
    .isISO8601()
    .withMessage('Expiry date must be a valid ISO 8601 date'),

  body('priority')
    .optional()
    .isInt()
    .withMessage('Priority must be an integer'),

  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),

  body('branch')
    .optional()
    .isMongoId()
    .withMessage('Branch ID must be a valid MongoDB ID'),

  body('applicableCustomerTypes')
    .optional()
    .isArray()
    .withMessage('Applicable customer types must be an array'),

  body('applicableCustomerTypes.*')
    .optional()
    .isString()
    .withMessage('Customer type must be a string'),

  validateRequest,
];

/**
 * Validation rules for adding a special service
 */
const validateAddSpecialService = [
  param('id')
    .notEmpty()
    .withMessage('Pricing rule ID is required')
    .isMongoId()
    .withMessage('Invalid pricing rule ID'),

  body('serviceCode')
    .notEmpty()
    .withMessage('Service code is required')
    .isString()
    .withMessage('Service code must be a string'),

  body('serviceName')
    .notEmpty()
    .withMessage('Service name is required')
    .isString()
    .withMessage('Service name must be a string'),

  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string'),

  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isFloat({ min: 0 })
    .withMessage('Price must be a non-negative number'),

  body('isPercentage')
    .optional()
    .isBoolean()
    .withMessage('isPercentage must be a boolean'),

  body('applicableServiceTypes')
    .optional()
    .isArray()
    .withMessage('Applicable service types must be an array'),

  body('applicableServiceTypes.*')
    .optional()
    .isString()
    .withMessage('Service type must be a string')
    .isIn(['regular', 'express', 'same_day', 'next_day', 'economy'])
    .withMessage('Invalid service type'),

  validateRequest,
];

/**
 * Validation rules for adding a discount
 */
const validateAddDiscount = [
  param('id')
    .notEmpty()
    .withMessage('Pricing rule ID is required')
    .isMongoId()
    .withMessage('Invalid pricing rule ID'),

  body('code')
    .optional()
    .isString()
    .withMessage('Code must be a string'),

  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .isString()
    .withMessage('Name must be a string'),

  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string'),

  body('discountType')
    .notEmpty()
    .withMessage('Discount type is required')
    .isIn(['percentage', 'fixed', 'free_service'])
    .withMessage('Invalid discount type'),

  body('value')
    .notEmpty()
    .withMessage('Value is required')
    .isFloat({ min: 0 })
    .withMessage('Value must be a non-negative number'),

  body('maxDiscountAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum discount amount must be a non-negative number'),

  body('minOrderValue')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum order value must be a non-negative number'),

  body('applicableServiceTypes')
    .optional()
    .isArray()
    .withMessage('Applicable service types must be an array'),

  body('applicableServiceTypes.*')
    .optional()
    .isString()
    .withMessage('Service type must be a string')
    .isIn(['regular', 'express', 'same_day', 'next_day', 'economy'])
    .withMessage('Invalid service type'),

  body('applicableCustomerTypes')
    .optional()
    .isArray()
    .withMessage('Applicable customer types must be an array'),

  body('applicableCustomerTypes.*')
    .optional()
    .isString()
    .withMessage('Customer type must be a string'),

  body('startDate')
    .notEmpty()
    .withMessage('Start date is required')
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),

  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date'),

  body('usageLimit')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Usage limit must be a non-negative integer'),

  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),

  validateRequest,
];

/**
 * Validation rules for adding a weight tier
 */
const validateAddWeightTier = [
  param('id')
    .notEmpty()
    .withMessage('Pricing rule ID is required')
    .isMongoId()
    .withMessage('Invalid pricing rule ID'),

  body('minWeight')
    .notEmpty()
    .withMessage('Minimum weight is required')
    .isFloat({ min: 0 })
    .withMessage('Minimum weight must be a non-negative number'),

  body('maxWeight')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum weight must be a non-negative number'),

  body('pricePerKg')
    .notEmpty()
    .withMessage('Price per kg is required')
    .isFloat({ min: 0 })
    .withMessage('Price per kg must be a non-negative number'),

  body('flatPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Flat price must be a non-negative number'),

  validateRequest,
];

/**
 * Validation rules for adding a distance tier
 */
const validateAddDistanceTier = [
  param('id')
    .notEmpty()
    .withMessage('Pricing rule ID is required')
    .isMongoId()
    .withMessage('Invalid pricing rule ID'),

  body('minDistance')
    .notEmpty()
    .withMessage('Minimum distance is required')
    .isFloat({ min: 0 })
    .withMessage('Minimum distance must be a non-negative number'),

  body('maxDistance')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum distance must be a non-negative number'),

  body('pricePerKm')
    .notEmpty()
    .withMessage('Price per km is required')
    .isFloat({ min: 0 })
    .withMessage('Price per km must be a non-negative number'),

  body('flatPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Flat price must be a non-negative number'),

  validateRequest,
];

/**
 * Validation rules for calculating price
 */
const validateCalculatePrice = [
  body('serviceType')
    .notEmpty()
    .withMessage('Service type is required')
    .isIn(['regular', 'express', 'same_day', 'next_day', 'economy'])
    .withMessage('Invalid service type'),

  body('originArea')
    .notEmpty()
    .withMessage('Origin area is required')
    .isObject()
    .withMessage('Origin area must be an object'),

  body('originArea.province')
    .notEmpty()
    .withMessage('Origin province is required')
    .isString()
    .withMessage('Origin province must be a string'),

  body('originArea.city')
    .notEmpty()
    .withMessage('Origin city is required')
    .isString()
    .withMessage('Origin city must be a string'),

  body('destinationArea')
    .notEmpty()
    .withMessage('Destination area is required')
    .isObject()
    .withMessage('Destination area must be an object'),

  body('destinationArea.province')
    .notEmpty()
    .withMessage('Destination province is required')
    .isString()
    .withMessage('Destination province must be a string'),

  body('destinationArea.city')
    .notEmpty()
    .withMessage('Destination city is required')
    .isString()
    .withMessage('Destination city must be a string'),

  body('weight')
    .notEmpty()
    .withMessage('Weight is required')
    .isFloat({ min: 0 })
    .withMessage('Weight must be a non-negative number'),

  body('volumetricWeight')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Volumetric weight must be a non-negative number'),

  body('specialServices')
    .optional()
    .isArray()
    .withMessage('Special services must be an array'),

  body('specialServices.*')
    .optional()
    .isString()
    .withMessage('Special service code must be a string'),

  body('discountCode')
    .optional()
    .isString()
    .withMessage('Discount code must be a string'),

  body('customerType')
    .optional()
    .isString()
    .withMessage('Customer type must be a string'),

  body('declaredValue')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Declared value must be a non-negative number'),

  body('originCoordinates')
    .optional()
    .isObject()
    .withMessage('Origin coordinates must be an object'),

  body('originCoordinates.latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),

  body('originCoordinates.longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),

  body('destinationCoordinates')
    .optional()
    .isObject()
    .withMessage('Destination coordinates must be an object'),

  body('destinationCoordinates.latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),

  body('destinationCoordinates.longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),

  validateRequest,
];

/**
 * Validation rules for getting pricing rules with pagination and filtering
 */
const validateGetPricingRules = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  query('sortBy')
    .optional()
    .isString()
    .withMessage('Sort by must be a string'),

  query('sortOrder')
    .optional()
    .isIn(['1', '-1'])
    .withMessage('Sort order must be 1 (ascending) or -1 (descending)'),

  query('serviceType')
    .optional()
    .isString()
    .withMessage('Service type must be a string'),

  query('originProvince')
    .optional()
    .isString()
    .withMessage('Origin province must be a string'),

  query('originCity')
    .optional()
    .isString()
    .withMessage('Origin city must be a string'),

  query('destinationProvince')
    .optional()
    .isString()
    .withMessage('Destination province must be a string'),

  query('destinationCity')
    .optional()
    .isString()
    .withMessage('Destination city must be a string'),

  query('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),

  query('branch')
    .optional()
    .isMongoId()
    .withMessage('Branch ID must be a valid MongoDB ID'),

  query('code')
    .optional()
    .isString()
    .withMessage('Code must be a string'),

  query('name')
    .optional()
    .isString()
    .withMessage('Name must be a string'),

  validateRequest,
];

module.exports = {
  validateCreatePricingRule,
  validateUpdatePricingRule,
  validateAddSpecialService,
  validateAddDiscount,
  validateAddWeightTier,
  validateAddDistanceTier,
  validateCalculatePrice,
  validateGetPricingRules,
};
