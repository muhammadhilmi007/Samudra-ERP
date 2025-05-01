/**
 * Forwarder Area domain model
 * Represents a geographical area covered by a forwarder partner
 */
class ForwarderArea {
  /**
   * Create a new forwarder area
   * @param {Object} data - The forwarder area data
   * @param {string} data._id - MongoDB ObjectId (optional)
   * @param {string} data.forwarder - Forwarder partner ID
   * @param {string} data.province - Province name
   * @param {string} data.city - City name
   * @param {string} data.district - District name
   * @param {string} data.subDistrict - Sub-district name
   * @param {string} data.postalCode - Postal code
   * @param {string} data.status - Status (active, inactive)
   * @param {Date} data.createdAt - Creation timestamp
   * @param {Date} data.updatedAt - Last update timestamp
   * @param {string} data.createdBy - User ID who created
   * @param {string} data.updatedBy - User ID who last updated
   */
  constructor(data = {}) {
    this._id = data._id || null;
    this.forwarder = data.forwarder || null;
    this.province = data.province || '';
    this.city = data.city || '';
    this.district = data.district || '';
    this.subDistrict = data.subDistrict || '';
    this.postalCode = data.postalCode || '';
    this.status = data.status || 'active';
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    this.createdBy = data.createdBy || null;
    this.updatedBy = data.updatedBy || null;
  }

  /**
   * Validate forwarder area data
   * @returns {Object} Validation result with isValid and errors
   */
  validate() {
    const errors = {};

    if (!this.forwarder) errors.forwarder = 'ID forwarder wajib diisi';
    if (!this.province) errors.province = 'Provinsi wajib diisi';
    if (!this.city) errors.city = 'Kota wajib diisi';

    // Either district or postal code must be provided for more specific area definition
    if (!this.district && !this.postalCode) {
      errors.district = 'Kecamatan atau kode pos wajib diisi';
      errors.postalCode = 'Kecamatan atau kode pos wajib diisi';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }
}

module.exports = ForwarderArea;
