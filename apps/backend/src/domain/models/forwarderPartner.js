/**
 * Forwarder Partner domain model
 * Represents a partner company that handles forwarding/shipping services
 */
class ForwarderPartner {
  /**
   * Create a new forwarder partner
   * @param {Object} data - The forwarder partner data
   * @param {string} data._id - MongoDB ObjectId (optional)
   * @param {string} data.name - Forwarder partner name
   * @param {string} data.code - Unique forwarder code
   * @param {string} data.contactPerson - Primary contact person name
   * @param {string} data.phone - Contact phone number
   * @param {string} data.email - Contact email
   * @param {Object} data.address - Address details
   * @param {string} data.address.street - Street address
   * @param {string} data.address.city - City
   * @param {string} data.address.district - District
   * @param {string} data.address.province - Province
   * @param {string} data.address.postalCode - Postal code
   * @param {string} data.address.country - Country
   * @param {string} data.status - Status (active, inactive)
   * @param {Object} data.apiConfig - API configuration for integration
   * @param {string} data.apiConfig.baseUrl - Base URL for API
   * @param {string} data.apiConfig.apiKey - API key (encrypted)
   * @param {string} data.apiConfig.username - API username
   * @param {string} data.apiConfig.passwordHash - API password hash (encrypted)
   * @param {number} data.apiConfig.timeout - API timeout in milliseconds
   * @param {Date} data.createdAt - Creation timestamp
   * @param {Date} data.updatedAt - Last update timestamp
   * @param {string} data.createdBy - User ID who created
   * @param {string} data.updatedBy - User ID who last updated
   */
  constructor(data = {}) {
    this._id = data._id || null;
    this.name = data.name || '';
    this.code = data.code || '';
    this.contactPerson = data.contactPerson || '';
    this.phone = data.phone || '';
    this.email = data.email || '';
    this.address = {
      street: data.address?.street || '',
      city: data.address?.city || '',
      district: data.address?.district || '',
      province: data.address?.province || '',
      postalCode: data.address?.postalCode || '',
      country: data.address?.country || 'Indonesia',
    };
    this.status = data.status || 'active';
    this.apiConfig = {
      baseUrl: data.apiConfig?.baseUrl || '',
      apiKey: data.apiConfig?.apiKey || '',
      username: data.apiConfig?.username || '',
      passwordHash: data.apiConfig?.passwordHash || '',
      timeout: data.apiConfig?.timeout || 30000,
    };
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    this.createdBy = data.createdBy || null;
    this.updatedBy = data.updatedBy || null;
  }

  /**
   * Validate forwarder partner data
   * @returns {Object} Validation result with isValid and errors
   */
  validate() {
    const errors = {};

    if (!this.name) errors.name = 'Nama forwarder wajib diisi';
    if (!this.code) errors.code = 'Kode forwarder wajib diisi';
    if (!this.contactPerson) errors.contactPerson = 'Nama kontak wajib diisi';
    if (!this.phone) errors.phone = 'Nomor telepon wajib diisi';
    if (!this.email) errors.email = 'Email wajib diisi';

    // Validate email format if provided
    if (this.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) {
      errors.email = 'Format email tidak valid';
    }
    if (!this.address.street) errors['address.street'] = 'Alamat wajib diisi';
    if (!this.address.city) errors['address.city'] = 'Kota wajib diisi';
    if (!this.address.province) errors['address.province'] = 'Provinsi wajib diisi';

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }
}

module.exports = ForwarderPartner;
