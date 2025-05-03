/**
 * Samudra Paket ERP - Waybill Document Validator
 * Validation middleware for waybill document endpoints
 */

const { body, param, query, validationResult } = require('express-validator');
const { ValidationError } = require('../../domain/utils/errors');

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
 * Validation rules for generating a document
 */
const validateGenerateDocument = [
  body('shipmentOrderId')
    .notEmpty()
    .withMessage('Shipment order ID is required')
    .isMongoId()
    .withMessage('Invalid shipment order ID'),

  body('documentType')
    .notEmpty()
    .withMessage('Document type is required')
    .isIn(['waybill', 'receipt', 'manifest', 'pod', 'invoice'])
    .withMessage('Invalid document type. Must be one of: waybill, receipt, manifest, pod, invoice'),

  body('options')
    .optional()
    .isObject()
    .withMessage('Options must be an object'),

  body('options.barcodeType')
    .optional()
    .isIn(['qrcode', 'code128', 'datamatrix', 'pdf417'])
    .withMessage('Invalid barcode type. Must be one of: qrcode, code128, datamatrix, pdf417'),

  body('options.distributionMethod')
    .optional()
    .isIn(['print', 'email', 'sms', 'whatsapp'])
    .withMessage('Invalid distribution method. Must be one of: print, email, sms, whatsapp'),

  body('options.recipients')
    .optional()
    .isArray()
    .withMessage('Recipients must be an array'),

  body('options.recipients.*.type')
    .optional()
    .isIn(['email', 'sms', 'whatsapp'])
    .withMessage('Invalid recipient type. Must be one of: email, sms, whatsapp'),

  body('options.recipients.*.value')
    .optional()
    .notEmpty()
    .withMessage('Recipient value is required'),

  body('options.distribute')
    .optional()
    .isBoolean()
    .withMessage('Distribute must be a boolean'),

  body('options.expiresAt')
    .optional()
    .isISO8601()
    .withMessage('Expires at must be a valid ISO 8601 date'),

  validateRequest,
];

/**
 * Validation rules for regenerating a document
 */
const validateRegenerateDocument = [
  param('documentId')
    .notEmpty()
    .withMessage('Document ID is required')
    .isString()
    .withMessage('Document ID must be a string'),

  body('options')
    .optional()
    .isObject()
    .withMessage('Options must be an object'),

  body('options.barcodeType')
    .optional()
    .isIn(['qrcode', 'code128', 'datamatrix', 'pdf417'])
    .withMessage('Invalid barcode type. Must be one of: qrcode, code128, datamatrix, pdf417'),

  body('reason')
    .notEmpty()
    .withMessage('Reason for regeneration is required')
    .isString()
    .withMessage('Reason must be a string')
    .isLength({ min: 3, max: 200 })
    .withMessage('Reason must be between 3 and 200 characters'),

  validateRequest,
];

/**
 * Validation rules for distributing a document
 */
const validateDistributeDocument = [
  param('documentId')
    .notEmpty()
    .withMessage('Document ID is required')
    .isString()
    .withMessage('Document ID must be a string'),

  body('recipients')
    .notEmpty()
    .withMessage('Recipients are required')
    .isArray()
    .withMessage('Recipients must be an array')
    .custom(recipients => recipients.length > 0)
    .withMessage('At least one recipient is required'),

  body('recipients.*.type')
    .notEmpty()
    .withMessage('Recipient type is required')
    .isIn(['email', 'sms', 'whatsapp'])
    .withMessage('Invalid recipient type. Must be one of: email, sms, whatsapp'),

  body('recipients.*.value')
    .notEmpty()
    .withMessage('Recipient value is required')
    .custom((value, { req }) => {
      const recipientType = req.body.recipients.find(r => r.value === value)?.type;
      
      if (recipientType === 'email' && !value.includes('@')) {
        throw new Error('Invalid email address');
      }
      
      return true;
    }),

  validateRequest,
];

/**
 * Validation rules for generating a barcode
 */
const validateGenerateBarcode = [
  body('data')
    .notEmpty()
    .withMessage('Barcode data is required')
    .isString()
    .withMessage('Barcode data must be a string'),

  body('type')
    .optional()
    .isIn(['qrcode', 'code128', 'datamatrix', 'pdf417'])
    .withMessage('Invalid barcode type. Must be one of: qrcode, code128, datamatrix, pdf417'),

  validateRequest,
];

module.exports = {
  validateGenerateDocument,
  validateRegenerateDocument,
  validateDistributeDocument,
  validateGenerateBarcode,
};
