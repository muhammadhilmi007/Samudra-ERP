/**
 * Samudra Paket ERP - Shipment Order Validator
 * Validation middleware for shipment order endpoints
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
 * Validation rules for creating a shipment order
 */
const validateCreateShipmentOrder = [
  // Branch validation
  body('branch')
    .notEmpty()
    .withMessage('Branch is required')
    .isMongoId()
    .withMessage('Invalid branch ID'),

  // Sender validation
  body('sender.name')
    .notEmpty()
    .withMessage('Sender name is required')
    .isString()
    .withMessage('Sender name must be a string')
    .isLength({ min: 2, max: 100 })
    .withMessage('Sender name must be between 2 and 100 characters'),

  body('sender.address.street')
    .notEmpty()
    .withMessage('Sender street address is required')
    .isString()
    .withMessage('Sender street address must be a string'),

  body('sender.address.city')
    .notEmpty()
    .withMessage('Sender city is required')
    .isString()
    .withMessage('Sender city must be a string'),

  body('sender.address.district')
    .notEmpty()
    .withMessage('Sender district is required')
    .isString()
    .withMessage('Sender district must be a string'),

  body('sender.address.province')
    .notEmpty()
    .withMessage('Sender province is required')
    .isString()
    .withMessage('Sender province must be a string'),

  body('sender.address.postalCode')
    .notEmpty()
    .withMessage('Sender postal code is required')
    .isString()
    .withMessage('Sender postal code must be a string'),

  body('sender.phone')
    .notEmpty()
    .withMessage('Sender phone is required')
    .isString()
    .withMessage('Sender phone must be a string'),

  body('sender.email')
    .optional()
    .isEmail()
    .withMessage('Invalid sender email format'),

  // Receiver validation
  body('receiver.name')
    .notEmpty()
    .withMessage('Receiver name is required')
    .isString()
    .withMessage('Receiver name must be a string')
    .isLength({ min: 2, max: 100 })
    .withMessage('Receiver name must be between 2 and 100 characters'),

  body('receiver.address.street')
    .notEmpty()
    .withMessage('Receiver street address is required')
    .isString()
    .withMessage('Receiver street address must be a string'),

  body('receiver.address.city')
    .notEmpty()
    .withMessage('Receiver city is required')
    .isString()
    .withMessage('Receiver city must be a string'),

  body('receiver.address.district')
    .notEmpty()
    .withMessage('Receiver district is required')
    .isString()
    .withMessage('Receiver district must be a string'),

  body('receiver.address.province')
    .notEmpty()
    .withMessage('Receiver province is required')
    .isString()
    .withMessage('Receiver province must be a string'),

  body('receiver.address.postalCode')
    .notEmpty()
    .withMessage('Receiver postal code is required')
    .isString()
    .withMessage('Receiver postal code must be a string'),

  body('receiver.phone')
    .notEmpty()
    .withMessage('Receiver phone is required')
    .isString()
    .withMessage('Receiver phone must be a string'),

  body('receiver.email')
    .optional()
    .isEmail()
    .withMessage('Invalid receiver email format'),

  // Origin and destination branch validation
  body('originBranch')
    .notEmpty()
    .withMessage('Origin branch is required')
    .isMongoId()
    .withMessage('Invalid origin branch ID'),

  body('destinationBranch')
    .notEmpty()
    .withMessage('Destination branch is required')
    .isMongoId()
    .withMessage('Invalid destination branch ID'),

  // Service type validation
  body('serviceType')
    .notEmpty()
    .withMessage('Service type is required')
    .isIn(['regular', 'express', 'same_day', 'next_day', 'economy'])
    .withMessage('Invalid service type'),

  // Payment type validation
  body('paymentType')
    .notEmpty()
    .withMessage('Payment type is required')
    .isIn(['CASH', 'COD', 'CAD', 'credit', 'prepaid'])
    .withMessage('Invalid payment type'),

  // Items validation
  body('items')
    .isArray({ min: 1 })
    .withMessage('At least one item is required'),

  body('items.*.description')
    .notEmpty()
    .withMessage('Item description is required')
    .isString()
    .withMessage('Item description must be a string'),

  body('items.*.quantity')
    .notEmpty()
    .withMessage('Item quantity is required')
    .isInt({ min: 1 })
    .withMessage('Item quantity must be a positive integer'),

  body('items.*.weight')
    .notEmpty()
    .withMessage('Item weight is required')
    .isFloat({ min: 0.01 })
    .withMessage('Item weight must be a positive number'),

  body('items.*.dimensions.length')
    .optional()
    .isFloat({ min: 0.1 })
    .withMessage('Item length must be a positive number'),

  body('items.*.dimensions.width')
    .optional()
    .isFloat({ min: 0.1 })
    .withMessage('Item width must be a positive number'),

  body('items.*.dimensions.height')
    .optional()
    .isFloat({ min: 0.1 })
    .withMessage('Item height must be a positive number'),

  // Optional fields
  body('pickupRequest')
    .optional()
    .isMongoId()
    .withMessage('Invalid pickup request ID'),

  body('forwarderCode')
    .optional()
    .isString()
    .withMessage('Forwarder code must be a string'),

  body('notes')
    .optional()
    .isString()
    .withMessage('Notes must be a string'),

  validateRequest,
];

/**
 * Validation rules for updating a shipment order
 */
const validateUpdateShipmentOrder = [
  param('id')
    .notEmpty()
    .withMessage('Shipment order ID is required')
    .isMongoId()
    .withMessage('Invalid shipment order ID'),

  // Allow partial updates for all fields
  body('sender.name')
    .optional()
    .isString()
    .withMessage('Sender name must be a string')
    .isLength({ min: 2, max: 100 })
    .withMessage('Sender name must be between 2 and 100 characters'),

  body('sender.address.street')
    .optional()
    .isString()
    .withMessage('Sender street address must be a string'),

  body('sender.address.city')
    .optional()
    .isString()
    .withMessage('Sender city must be a string'),

  body('sender.address.district')
    .optional()
    .isString()
    .withMessage('Sender district must be a string'),

  body('sender.address.province')
    .optional()
    .isString()
    .withMessage('Sender province must be a string'),

  body('sender.address.postalCode')
    .optional()
    .isString()
    .withMessage('Sender postal code must be a string'),

  body('sender.phone')
    .optional()
    .isString()
    .withMessage('Sender phone must be a string'),

  body('sender.email')
    .optional()
    .isEmail()
    .withMessage('Invalid sender email format'),

  body('receiver.name')
    .optional()
    .isString()
    .withMessage('Receiver name must be a string')
    .isLength({ min: 2, max: 100 })
    .withMessage('Receiver name must be between 2 and 100 characters'),

  body('receiver.address.street')
    .optional()
    .isString()
    .withMessage('Receiver street address must be a string'),

  body('receiver.address.city')
    .optional()
    .isString()
    .withMessage('Receiver city must be a string'),

  body('receiver.address.district')
    .optional()
    .isString()
    .withMessage('Receiver district must be a string'),

  body('receiver.address.province')
    .optional()
    .isString()
    .withMessage('Receiver province must be a string'),

  body('receiver.address.postalCode')
    .optional()
    .isString()
    .withMessage('Receiver postal code must be a string'),

  body('receiver.phone')
    .optional()
    .isString()
    .withMessage('Receiver phone must be a string'),

  body('receiver.email')
    .optional()
    .isEmail()
    .withMessage('Invalid receiver email format'),

  body('serviceType')
    .optional()
    .isIn(['regular', 'express', 'same_day', 'next_day', 'economy'])
    .withMessage('Invalid service type'),

  body('paymentType')
    .optional()
    .isIn(['CASH', 'COD', 'CAD', 'credit', 'prepaid'])
    .withMessage('Invalid payment type'),

  body('items')
    .optional()
    .isArray()
    .withMessage('Items must be an array'),

  body('items.*.description')
    .optional()
    .isString()
    .withMessage('Item description must be a string'),

  body('items.*.quantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Item quantity must be a positive integer'),

  body('items.*.weight')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Item weight must be a positive number'),

  body('notes')
    .optional()
    .isString()
    .withMessage('Notes must be a string'),

  validateRequest,
];

/**
 * Validation rules for updating shipment order status
 */
const validateUpdateStatus = [
  param('id')
    .notEmpty()
    .withMessage('Shipment order ID is required')
    .isMongoId()
    .withMessage('Invalid shipment order ID'),

  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn([
      'created',
      'processed',
      'in_transit',
      'arrived_at_destination',
      'out_for_delivery',
      'delivered',
      'failed_delivery',
      'returned',
      'cancelled',
    ])
    .withMessage('Invalid status'),

  body('location')
    .optional()
    .isString()
    .withMessage('Location must be a string'),

  body('notes')
    .optional()
    .isString()
    .withMessage('Notes must be a string'),

  validateRequest,
];

/**
 * Validation rules for adding a document
 */
const validateAddDocument = [
  param('id')
    .notEmpty()
    .withMessage('Shipment order ID is required')
    .isMongoId()
    .withMessage('Invalid shipment order ID'),

  body('type')
    .notEmpty()
    .withMessage('Document type is required')
    .isIn(['waybill', 'invoice', 'receipt', 'proof_of_delivery', 'customs', 'insurance', 'other'])
    .withMessage('Invalid document type'),

  body('fileUrl')
    .notEmpty()
    .withMessage('File URL is required')
    .isURL()
    .withMessage('Invalid file URL'),

  body('fileName')
    .notEmpty()
    .withMessage('File name is required')
    .isString()
    .withMessage('File name must be a string'),

  body('mimeType')
    .optional()
    .isString()
    .withMessage('MIME type must be a string'),

  validateRequest,
];

/**
 * Validation rules for calculating price
 */
const validateCalculatePrice = [
  body('originBranch')
    .notEmpty()
    .withMessage('Origin branch is required')
    .isMongoId()
    .withMessage('Invalid origin branch ID'),

  body('destinationBranch')
    .notEmpty()
    .withMessage('Destination branch is required')
    .isMongoId()
    .withMessage('Invalid destination branch ID'),

  body('serviceType')
    .notEmpty()
    .withMessage('Service type is required')
    .isIn(['regular', 'express', 'same_day', 'next_day', 'economy'])
    .withMessage('Invalid service type'),

  body('items')
    .isArray({ min: 1 })
    .withMessage('At least one item is required'),

  body('items.*.weight')
    .notEmpty()
    .withMessage('Item weight is required')
    .isFloat({ min: 0.01 })
    .withMessage('Item weight must be a positive number'),

  body('items.*.quantity')
    .notEmpty()
    .withMessage('Item quantity is required')
    .isInt({ min: 1 })
    .withMessage('Item quantity must be a positive integer'),

  validateRequest,
];

/**
 * Validation rules for validating destination
 */
const validateDestinationCheck = [
  body('province')
    .notEmpty()
    .withMessage('Province is required')
    .isString()
    .withMessage('Province must be a string'),

  body('city')
    .notEmpty()
    .withMessage('City is required')
    .isString()
    .withMessage('City must be a string'),

  body('district')
    .notEmpty()
    .withMessage('District is required')
    .isString()
    .withMessage('District must be a string'),

  validateRequest,
];

/**
 * Validation rules for getting shipment orders with pagination and filtering
 */
const validateGetShipmentOrders = [
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

  query('status')
    .optional()
    .isString()
    .withMessage('Status must be a string'),

  query('branch')
    .optional()
    .isMongoId()
    .withMessage('Invalid branch ID'),

  query('originBranch')
    .optional()
    .isMongoId()
    .withMessage('Invalid origin branch ID'),

  query('destinationBranch')
    .optional()
    .isMongoId()
    .withMessage('Invalid destination branch ID'),

  query('customer')
    .optional()
    .isMongoId()
    .withMessage('Invalid customer ID'),

  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),

  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date'),

  validateRequest,
];

module.exports = {
  validateCreateShipmentOrder,
  validateUpdateShipmentOrder,
  validateUpdateStatus,
  validateAddDocument,
  validateCalculatePrice,
  validateDestinationCheck,
  validateGetShipmentOrders,
};
