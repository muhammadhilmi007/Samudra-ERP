/**
 * Samudra Paket ERP - Service Area Model
 * Defines the schema for service areas in the system
 */

const mongoose = require('mongoose');

const { Schema } = mongoose;

/**
 * GeoJSON Point Schema
 * Represents a geographic point using GeoJSON format
 */
const pointSchema = new Schema({
  type: {
    type: String,
    enum: ['Point'],
    default: 'Point',
    required: true,
  },
  coordinates: {
    type: [Number], // [longitude, latitude]
    required: true,
  },
});

/**
 * GeoJSON Polygon Schema
 * Represents a geographic polygon using GeoJSON format
 */
const polygonSchema = new Schema({
  type: {
    type: String,
    enum: ['Polygon'],
    default: 'Polygon',
    required: true,
  },
  coordinates: {
    type: [[[Number]]], // Array of linear rings (first is outer, rest are holes)
    required: true,
  },
});

/**
 * Service Area Schema
 * Represents a service coverage area for a branch
 */
const serviceAreaSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    branch: {
      type: Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
    },
    coverage: {
      type: polygonSchema,
      required: true,
      index: '2dsphere', // Spatial index for geographic queries
    },
    centerPoint: {
      type: pointSchema,
      required: true,
    },
    level: {
      type: String,
      enum: ['city', 'district', 'subdistrict', 'custom'],
      default: 'custom',
    },
    administrativeData: {
      province: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      district: String,
      subdistrict: String,
      postalCodes: [String],
    },
    serviceTypes: [{
      type: String,
      enum: ['pickup', 'delivery', 'both'],
      default: 'both',
    }],
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    operationalHours: {
      type: String,
      trim: true,
    },
    operationalTimes: {
      monday: { start: String, end: String },
      tuesday: { start: String, end: String },
      wednesday: { start: String, end: String },
      thursday: { start: String, end: String },
      friday: { start: String, end: String },
      saturday: { start: String, end: String },
      sunday: { start: String, end: String },
    },
    metadata: {
      population: Number,
      areaSize: Number, // in square kilometers
      notes: String,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v; // eslint-disable-line no-underscore-dangle
        return ret;
      },
    },
  },
);

// Add virtual property for isActive
serviceAreaSchema.virtual('isActive').get(function isActiveGetter() {
  return this.status === 'active';
});

// Set isActive as a setter for status
serviceAreaSchema.virtual('isActive').set(function isActiveSetter(value) {
  this.status = value ? 'active' : 'inactive';
});

// Pre-save middleware to handle isActive property
serviceAreaSchema.pre('save', function preSave(next) {
  if (this.isNew && this.isActive !== undefined && this.status === undefined) {
    this.status = this.isActive ? 'active' : 'inactive';
  }
  next();
});

// Create indexes for efficient querying
serviceAreaSchema.index({ branch: 1 });
// Code already has a unique index from the schema definition
serviceAreaSchema.index({ 'administrativeData.province': 1, 'administrativeData.city': 1 });
serviceAreaSchema.index({ status: 1 });

/**
 * Check if a point is within this service area
 * @param {Array} coordinates - [longitude, latitude] of the point to check
 * @returns {Boolean} - Whether the point is within this service area
 */
serviceAreaSchema.methods.containsPoint = function containsPoint(coordinates) {
  const point = {
    type: 'Point',
    coordinates,
  };

  return this.constructor.findOne({
    _id: this._id,
    coverage: {
      $geoIntersects: {
        $geometry: point,
      },
    },
  }).then((result) => !!result);
};

/**
 * Find service areas that contain a specific point
 * @param {Array} coordinates - [longitude, latitude] of the point to check
 * @param {Object} filter - Additional filter criteria
 * @returns {Promise<Array>} - Service areas containing the point
 */
serviceAreaSchema.statics.findByPoint = function findByPoint(coordinates, filter = {}) {
  const point = {
    type: 'Point',
    coordinates,
  };

  return this.find({
    ...filter,
    coverage: {
      $geoIntersects: {
        $geometry: point,
      },
    },
  });
};

/**
 * Find service areas that intersect with a polygon
 * @param {Object} polygon - GeoJSON polygon
 * @param {Object} filter - Additional filter criteria
 * @returns {Promise<Array>} - Service areas intersecting with the polygon
 */
serviceAreaSchema.statics.findByPolygon = function findByPolygon(polygon, filter = {}) {
  return this.find({
    ...filter,
    coverage: {
      $geoIntersects: {
        $geometry: polygon,
      },
    },
  });
};

// Create and export the model
const ServiceArea = mongoose.model('ServiceArea', serviceAreaSchema);

module.exports = ServiceArea;
