/**
 * Samudra Paket ERP - Branch Validator
 * Validates branch and division input data
 */

const Joi = require('joi');

/**
 * Validate branch input
 * @param {Object} data - Branch data to validate
 * @param {boolean} isUpdate - Whether this is an update operation
 * @returns {Object} Validation result
 */
const validateBranchInput = (data, isUpdate = false) => {
  const addressSchema = Joi.object({
    street: Joi.string().required().messages({
      'string.empty': 'Alamat jalan tidak boleh kosong',
      'any.required': 'Alamat jalan harus diisi',
    }),
    city: Joi.string().required().messages({
      'string.empty': 'Kota tidak boleh kosong',
      'any.required': 'Kota harus diisi',
    }),
    province: Joi.string().required().messages({
      'string.empty': 'Provinsi tidak boleh kosong',
      'any.required': 'Provinsi harus diisi',
    }),
    postalCode: Joi.string().required().messages({
      'string.empty': 'Kode pos tidak boleh kosong',
      'any.required': 'Kode pos harus diisi',
    }),
    country: Joi.string().default('Indonesia'),
    coordinates: Joi.object({
      latitude: Joi.number(),
      longitude: Joi.number(),
    }),
  });

  const contactInfoSchema = Joi.object({
    phone: Joi.string().required().messages({
      'string.empty': 'Nomor telepon tidak boleh kosong',
      'any.required': 'Nomor telepon harus diisi',
    }),
    email: Joi.string().email().required().messages({
      'string.empty': 'Email tidak boleh kosong',
      'string.email': 'Format email tidak valid',
      'any.required': 'Email harus diisi',
    }),
    fax: Joi.string().allow(''),
    website: Joi.string().allow(''),
  });

  const operationalHoursSchema = Joi.object({
    monday: Joi.object({
      open: Joi.string().allow(''),
      close: Joi.string().allow(''),
    }),
    tuesday: Joi.object({
      open: Joi.string().allow(''),
      close: Joi.string().allow(''),
    }),
    wednesday: Joi.object({
      open: Joi.string().allow(''),
      close: Joi.string().allow(''),
    }),
    thursday: Joi.object({
      open: Joi.string().allow(''),
      close: Joi.string().allow(''),
    }),
    friday: Joi.object({
      open: Joi.string().allow(''),
      close: Joi.string().allow(''),
    }),
    saturday: Joi.object({
      open: Joi.string().allow(''),
      close: Joi.string().allow(''),
    }),
    sunday: Joi.object({
      open: Joi.string().allow(''),
      close: Joi.string().allow(''),
    }),
  });

  const metadataSchema = Joi.object({
    establishedDate: Joi.date(),
    capacity: Joi.number(),
    serviceArea: Joi.array().items(Joi.string()),
    notes: Joi.string().allow(''),
  });

  // Base schema
  let schema = Joi.object({
    code: Joi.string().required().uppercase().messages({
      'string.empty': 'Kode cabang tidak boleh kosong',
      'any.required': 'Kode cabang harus diisi',
    }),
    name: Joi.string().required().messages({
      'string.empty': 'Nama cabang tidak boleh kosong',
      'any.required': 'Nama cabang harus diisi',
    }),
    address: addressSchema.required(),
    contactInfo: contactInfoSchema.required(),
    parentBranch: Joi.string().allow(null),
    level: Joi.number().default(0),
    status: Joi.string().valid('active', 'inactive').default('active'),
    operationalHours: operationalHoursSchema,
    manager: Joi.string().allow(null),
    divisions: Joi.array().items(
      Joi.object({
        name: Joi.string().required(),
        code: Joi.string().required(),
        description: Joi.string().allow(''),
        head: Joi.string().allow(null),
        status: Joi.string().valid('active', 'inactive').default('active'),
      }),
    ),
    metadata: metadataSchema,
  });

  // For updates, make all fields optional
  if (isUpdate) {
    schema = Joi.object({
      code: Joi.string().uppercase(),
      name: Joi.string(),
      address: addressSchema,
      contactInfo: contactInfoSchema,
      parentBranch: Joi.string().allow(null),
      level: Joi.number(),
      status: Joi.string().valid('active', 'inactive'),
      operationalHours: operationalHoursSchema,
      manager: Joi.string().allow(null),
      divisions: Joi.array().items(
        Joi.object({
          name: Joi.string().required(),
          code: Joi.string().required(),
          description: Joi.string().allow(''),
          head: Joi.string().allow(null),
          status: Joi.string().valid('active', 'inactive').default('active'),
        }),
      ),
      metadata: metadataSchema,
    });
  }

  return schema.validate(data, { abortEarly: false });
};

/**
 * Validate division input
 * @param {Object} data - Division data to validate
 * @param {boolean} isUpdate - Whether this is an update operation
 * @returns {Object} Validation result
 */
const validateDivisionInput = (data, isUpdate = false) => {
  // Base schema
  let schema = Joi.object({
    name: Joi.string().required().messages({
      'string.empty': 'Nama divisi tidak boleh kosong',
      'any.required': 'Nama divisi harus diisi',
    }),
    code: Joi.string().required().uppercase().messages({
      'string.empty': 'Kode divisi tidak boleh kosong',
      'any.required': 'Kode divisi harus diisi',
    }),
    description: Joi.string().allow(''),
    head: Joi.string().allow(null),
    status: Joi.string().valid('active', 'inactive').default('active'),
  });

  // For updates, make all fields optional
  if (isUpdate) {
    schema = Joi.object({
      name: Joi.string(),
      code: Joi.string().uppercase(),
      description: Joi.string().allow(''),
      head: Joi.string().allow(null),
      status: Joi.string().valid('active', 'inactive'),
    });
  }

  return schema.validate(data, { abortEarly: false });
};

module.exports = {
  validateBranchInput,
  validateDivisionInput,
};
