// domain/models/itemAllocation.js
const mongoose = require('mongoose');

const itemAllocationSchema = new mongoose.Schema({
  allocationCode: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  warehouseItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WarehouseItem',
    required: true
  },
  shipment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shipment',
    required: true
  },
  quantityAllocated: {
    type: Number,
    required: true,
    min: 1
  },
  allocationDate: {
    type: Date,
    default: Date.now
  },
  expectedLoadingDate: Date,
  status: {
    type: String,
    enum: ['reserved', 'loaded', 'canceled'],
    default: 'reserved'
  },
  location: {
    type: String,
    required: true
  },
  notes: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastModifiedAt: Date
}, {
  timestamps: true
});

// Indexes untuk query performa
itemAllocationSchema.index({ warehouseItem: 1, status: 1 });
itemAllocationSchema.index({ shipment: 1 });
itemAllocationSchema.index({ allocationDate: -1 });

// Pre-save hook untuk update lastModifiedAt
itemAllocationSchema.pre('save', function(next) {
  this.lastModifiedAt = new Date();
  next();
});

// Validasi ketersediaan stok
itemAllocationSchema.pre('save', async function(next) {
  const item = await mongoose.model('WarehouseItem').findById(this.warehouseItem);
  if (item.quantity < this.quantityAllocated) {
    throw new Error('Insufficient stock for allocation');
  }
  next();
});

module.exports = mongoose.model('ItemAllocation', itemAllocationSchema);