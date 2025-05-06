// domain/models/warehouseItem.js
const mongoose = require('mongoose');

const warehouseItemSchema = new mongoose.Schema({
  itemCode: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  description: String,
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    required: true,
    enum: ['pcs', 'kg', 'm', 'liter', 'box']
  },
  location: {
    rack: String,
    shelf: String,
    bin: String
  },
  status: {
    type: String,
    enum: ['available', 'reserved', 'in_transit', 'damaged'],
    default: 'available'
  },
  barcode: {
    type: String,
    unique: true
  },
  batchNumber: String,
  expirationDate: Date,
  lastStockCheck: Date,
  dimensions: {
    length: Number,
    width: Number,
    height: Number
  },
  weight: Number,
  supplier: {
    name: String,
    code: String
  },
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: Date
}, {
  timestamps: true
});

// Indexes
warehouseItemSchema.index({ itemCode: 1, status: 1 });
warehouseItemSchema.index({ location: '2dsphere' });

// Pre-save hook untuk update timestamp
warehouseItemSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('WarehouseItem', warehouseItemSchema);