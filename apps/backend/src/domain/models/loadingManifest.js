// domain/models/loadingManifest.js
const mongoose = require('mongoose');

const loadingManifestSchema = new mongoose.Schema({
  manifestCode: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  shipment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shipment',
    required: true
  },
  items: [{
    allocation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ItemAllocation',
      required: true
    },
    quantityLoaded: {
      type: Number,
      required: true,
      min: 1
    },
    locationMarking: String
  }],
  loadingDate: {
    type: Date,
    default: Date.now
  },
  scheduledDeparture: Date,
  actualDeparture: Date,
  estimatedArrival: Date,
  actualArrival: Date,
  status: {
    type: String,
    enum: ['preparing', 'loading', 'in_transit', 'delivered', 'canceled'],
    default: 'preparing'
  },
  loadingBay: String,
  vehicle: {
    type: String,
    required: true
  },
  driver: {
    name: String,
    contact: String
  },
  supervisor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  sealNumber: String,
  temperatureControl: {
    required: Boolean,
    minTemp: Number,
    maxTemp: Number
  },
  documents: [String], // Array of document URLs
  notes: String,
  lastModified: Date
}, {
  timestamps: true
});

// Indexes untuk query performa
loadingManifestSchema.index({ manifestCode: 1, status: 1 });
loadingManifestSchema.index({ shipment: 1 });
loadingManifestSchema.index({ 'driver.name': 'text' });

// Pre-save hook untuk update lastModified
loadingManifestSchema.pre('save', function(next) {
  this.lastModified = new Date();
  next();
});

// Validasi kuantitas vs alokasi
loadingManifestSchema.pre('save', async function(next) {
  for (const item of this.items) {
    const allocation = await mongoose.model('ItemAllocation').findById(item.allocation);
    if (item.quantityLoaded > allocation.quantityAllocated) {
      throw new Error(`Quantity loaded exceeds allocated amount for item ${item.allocation}`);
    }
  }
  next();
});

module.exports = mongoose.model('LoadingManifest', loadingManifestSchema);