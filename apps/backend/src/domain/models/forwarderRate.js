/* eslint-disable max-len */
/**
 * Forwarder Rate domain model
 * Represents shipping rates for a forwarder partner between specific areas
 */
class ForwarderRate {
  /**
   * Create a new forwarder rate
   * @param {Object} data - The forwarder rate data
   * @param {string} data._id - MongoDB ObjectId (optional)
   * @param {string} data.forwarder - Forwarder partner ID
   * @param {Object} data.originArea - Origin area details
   * @param {string} data.originArea.province - Origin province
   * @param {string} data.originArea.city - Origin city
   * @param {Object} data.destinationArea - Destination area details
   * @param {string} data.destinationArea.province - Destination province
   * @param {string} data.destinationArea.city - Destination city
   * @param {number} data.rate - Shipping rate per kg or unit
   * @param {number} data.minWeight - Minimum weight for this rate
   * @param {Date} data.effectiveDate - Date when rate becomes effective
   * @param {Date} data.expiryDate - Date when rate expires (optional)
   * @param {string} data.status - Status (active, inactive)
   * @param {Date} data.createdAt - Creation timestamp
   * @param {Date} data.updatedAt - Last update timestamp
   * @param {string} data.createdBy - User ID who created
   * @param {string} data.updatedBy - User ID who last updated
   */
  constructor(data = {}) {
    this._id = data._id || null;
    this.forwarder = data.forwarder || null;
    this.originArea = {
      province: data.originArea?.province || '',
      city: data.originArea?.city || '',
    };
    this.destinationArea = {
      province: data.destinationArea?.province || '',
      city: data.destinationArea?.city || '',
    };
    this.rate = data.rate || 0;
    this.minWeight = data.minWeight || 1;
    this.maxWeight = data.maxWeight || null;
    this.dimensionFactor = data.dimensionFactor || 6000;
    this.effectiveDate = data.effectiveDate || new Date();
    this.expiryDate = data.expiryDate || null;
    this.status = data.status || 'active';
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    this.createdBy = data.createdBy || null;
    this.updatedBy = data.updatedBy || null;
  }

  /**
   * Validate forwarder rate data
   * @returns {Object} Validation result with isValid and errors
   */
  validate() {
    const errors = {};

    if (!this.forwarder) errors.forwarder = 'ID forwarder wajib diisi';

    if (!this.originArea.province) errors.originArea = { province: 'Provinsi asal wajib diisi' };
    if (!this.originArea.city) errors.originArea = { ...errors.originArea, city: 'Kota asal wajib diisi' };

    if (!this.destinationArea.province) errors.destinationArea = { province: 'Provinsi tujuan wajib diisi' };
    if (!this.destinationArea.city) errors.destinationArea = { ...errors.destinationArea, city: 'Kota tujuan wajib diisi' };

    if (this.rate <= 0) errors.rate = 'Tarif harus lebih dari 0';
    if (this.minWeight <= 0) errors.minWeight = 'Berat minimum harus lebih dari 0';

    if (!this.effectiveDate) errors.effectiveDate = 'Tanggal berlaku wajib diisi';

    // If expiry date is provided, it must be after effective date
    if (this.expiryDate && new Date(this.expiryDate) <= new Date(this.effectiveDate)) {
      errors.expiryDate = 'Tanggal kadaluarsa harus setelah tanggal berlaku';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  /**
   * Check if the rate is currently active based on effective and expiry dates
   * @returns {boolean} True if rate is currently active
   */
  isActive() {
    const now = new Date();
    const isAfterEffective = now >= new Date(this.effectiveDate);
    const isBeforeExpiry = !this.expiryDate || now <= new Date(this.expiryDate);

    return this.status === 'active' && isAfterEffective && isBeforeExpiry;
  }
}

module.exports = ForwarderRate;
