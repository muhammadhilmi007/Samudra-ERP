// domain/models/vehicle.js

const mongoose = require('mongoose');
const { ActivitySchema } = require('./schemas/activitySchema');

const VehicleSchema = new mongoose.Schema({
  licensePlate: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['pickup', 'truck', 'van', 'motorcycle']
  },
  capacity: {
    weight: Number, // dalam kilogram
    volume: Number, // dalam meter kubik
    unitCount: Number // jumlah unit/kemasan
  },
  branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'in_use', 'maintenance'],
    default: 'available'
  },
  maintenanceRecords: [{
    date: Date,
    description: String,
    cost: Number
  }],
  activities: [ActivitySchema]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
VehicleSchema.index({ licensePlate: 1 });
VehicleSchema.index({ branch: 1, status: 1 });

// Pre-save hook untuk validasi
VehicleSchema.pre('save', function(next) {
  if (this.capacity && this.capacity.weight < 0) {
    throw new ValidationError('Berat kapasitas tidak boleh negatif');
  }
  next();
});

// Method untuk menambahkan aktivitas
VehicleSchema.methods.addActivity = function(type, user, metadata = {}) {
  this.activities.push({
    type,
    user,
    metadata: {
      ...metadata,
      vehicleId: this._id,
      licensePlate: this.licensePlate
    },
    timestamp: new Date()
  });
};

const Vehicle = mongoose.model('Vehicle', VehicleSchema);

module.exports = Vehicle;