/**
 * Samudra Paket ERP - Service Area Validator
 * Validates service area data before processing
 */

const Joi = require('joi');

/**
 * Validate GeoJSON Point
 * @param {Object} point - GeoJSON Point object
 * @returns {Object} Validation result
 */
const validatePoint = (point) => {
  const schema = Joi.object({
    type: Joi.string().valid('Point').required(),
    coordinates: Joi.array().ordered(
      Joi.number().min(-180).max(180).required(), // longitude
      Joi.number().min(-90).max(90).required(), // latitude
    ).length(2).required(),
  });

  return schema.validate(point);
};

/**
 * Validate GeoJSON Polygon
 * @param {Object} polygon - GeoJSON Polygon object
 * @returns {Object} Validation result
 */
const validatePolygon = (polygon) => {
  const schema = Joi.object({
    type: Joi.string().valid('Polygon').required(),
    coordinates: Joi.array().items(
      Joi.array().items(
        Joi.array().ordered(
          Joi.number().min(-180).max(180).required(), // longitude
          Joi.number().min(-90).max(90).required(), // latitude
        ).length(2).min(3)
          .required(),
      ).min(1).required(),
    ).required(),
  });

  return schema.validate(polygon);
};

/**
 * Validate service area input
 * @param {Object} serviceAreaData - Service area data to validate
 * @param {Boolean} isUpdate - Whether this is an update operation
 * @returns {Object} Validation result
 */
const validateServiceAreaInput = (serviceAreaData, isUpdate = false) => {
  // Define base schema
  const schema = Joi.object({
    code: isUpdate
      ? Joi.string().trim().uppercase().min(2)
        .max(10)
      : Joi.string().trim().uppercase().min(2)
        .max(10)
        .required(),

    name: isUpdate
      ? Joi.string().trim().min(3).max(100)
      : Joi.string().trim().min(3).max(100)
        .required(),

    description: Joi.string().trim().max(500).allow('', null),

    branch: isUpdate
      ? Joi.string().hex().length(24)
      : Joi.string().hex().length(24).required(),

    coverage: isUpdate
      ? Joi.object({
        type: Joi.string().valid('Polygon').required(),
        coordinates: Joi.array().required(),
      })
      : Joi.object({
        type: Joi.string().valid('Polygon').required(),
        coordinates: Joi.array().required(),
      }).required(),

    centerPoint: isUpdate
      ? Joi.object({
        type: Joi.string().valid('Point').required(),
        coordinates: Joi.array().required(),
      })
      : Joi.object({
        type: Joi.string().valid('Point').required(),
        coordinates: Joi.array().required(),
      }).required(),

    level: Joi.string().valid('city', 'district', 'subdistrict', 'custom'),

    administrativeData: isUpdate
      ? Joi.object({
        province: Joi.string().trim().min(3).max(50),
        city: Joi.string().trim().min(3).max(50),
        district: Joi.string().trim().min(3).max(50)
          .allow('', null),
        subdistrict: Joi.string().trim().min(3).max(50)
          .allow('', null),
        postalCodes: Joi.array().items(Joi.string().trim().min(5).max(10)),
      })
      : Joi.object({
        province: Joi.string().trim().min(3).max(50)
          .required(),
        city: Joi.string().trim().min(3).max(50)
          .required(),
        district: Joi.string().trim().min(3).max(50)
          .allow('', null),
        subdistrict: Joi.string().trim().min(3).max(50)
          .allow('', null),
        postalCodes: Joi.array().items(Joi.string().trim().min(5).max(10)),
      }).required(),

    serviceTypes: Joi.array().items(
      Joi.string().valid('pickup', 'delivery', 'both'),
    ),

    status: Joi.string().valid('active', 'inactive'),

    operationalTimes: Joi.object({
      monday: Joi.object({ start: Joi.string(), end: Joi.string() }),
      tuesday: Joi.object({ start: Joi.string(), end: Joi.string() }),
      wednesday: Joi.object({ start: Joi.string(), end: Joi.string() }),
      thursday: Joi.object({ start: Joi.string(), end: Joi.string() }),
      friday: Joi.object({ start: Joi.string(), end: Joi.string() }),
      saturday: Joi.object({ start: Joi.string(), end: Joi.string() }),
      sunday: Joi.object({ start: Joi.string(), end: Joi.string() }),
    }),

    metadata: Joi.object({
      population: Joi.number().integer().min(0),
      areaSize: Joi.number().min(0),
      notes: Joi.string().max(500).allow('', null),
    }),
  });

  // Validate the data
  const result = schema.validate(serviceAreaData, {
    abortEarly: false,
    allowUnknown: false,
  });

  // If validation passes and coverage/centerPoint are provided, validate them separately
  if (!result.error) {
    if (serviceAreaData.coverage) {
      const polygonValidation = validatePolygon(serviceAreaData.coverage);
      if (polygonValidation.error) {
        return {
          error: {
            details: polygonValidation.error.details,
            message: 'Invalid polygon data',
          },
        };
      }
    }

    if (serviceAreaData.centerPoint) {
      const pointValidation = validatePoint(serviceAreaData.centerPoint);
      if (pointValidation.error) {
        return {
          error: {
            details: pointValidation.error.details,
            message: 'Invalid center point data',
          },
        };
      }
    }
  }

  return result;
};

/**
 * Validate coordinates input
 * @param {Object} coordinatesData - Coordinates data to validate
 * @returns {Object} Validation result
 */
const validateCoordinatesInput = (coordinatesData) => {
  const schema = Joi.object({
    longitude: Joi.number().min(-180).max(180).required(),
    latitude: Joi.number().min(-90).max(90).required(),
  });

  return schema.validate(coordinatesData, {
    abortEarly: false,
    allowUnknown: false,
  });
};

module.exports = {
  validateServiceAreaInput,
  validateCoordinatesInput,
  validatePoint,
  validatePolygon,
};
