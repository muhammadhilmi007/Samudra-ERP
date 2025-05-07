/**
 * Forwarder Integration Service
 * Handles integration with external forwarder APIs
 */
const axios = require('axios');
const crypto = require('crypto');

class ForwarderIntegrationService {
  /**
   * Create a new Forwarder Integration Service
   * @param {Object} repositories - Repository dependencies
   * @param {Object} repositories.forwarderPartnerRepository - Forwarder partner repository
   */
  constructor({ forwarderPartnerRepository }) {
    this.forwarderPartnerRepository = forwarderPartnerRepository;
  }

  /**
   * Test connection with a forwarder's API
   * @param {string} forwarderId - Forwarder partner ID
   * @returns {Promise<Object>} Test result
   */
  async testConnection(forwarderId) {
    try {
      const forwarder = await this.forwarderPartnerRepository.findById(forwarderId);
      if (!forwarder) {
        return {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Forwarder tidak ditemukan',
          },
        };
      }

      if (!forwarder.apiConfig || !forwarder.apiConfig.baseUrl) {
        return {
          success: false,
          error: {
            code: 'INVALID_CONFIG',
            message: 'Konfigurasi API forwarder tidak lengkap',
          },
        };
      }

      // Create API client based on forwarder configuration
      const apiClient = this._createApiClient(forwarder);

      // Try to connect to the forwarder's ping/health endpoint
      const response = await apiClient.get('/ping', {
        timeout: forwarder.apiConfig.timeout || 30000,
      });

      return {
        success: true,
        data: {
          status: 'connected',
          responseTime: response.headers['x-response-time'] || 'unknown',
          serverInfo: response.headers['server'] || 'unknown',
          message: 'Koneksi ke API forwarder berhasil',
        },
      };
    } catch (error) {
      if (error.response && error.response.data) {
        return {
          success: true,
          data: error.response.data,
        };
      }
      return {
        success: false,
        error: {
          code: 'CONNECTION_ERROR',
          message: 'Gagal terhubung ke API forwarder',
          details: error.message,
        },
      };
    }
  }

  /**
   * Get shipping rates from forwarder API
   * @param {string} forwarderId - Forwarder partner ID
   * @param {Object} shipmentData - Shipment data for rate calculation
   * @returns {Promise<Object>} Shipping rates from forwarder
   */
  async getShippingRates(forwarderId, shipmentData) {
    try {
      const forwarder = await this.forwarderPartnerRepository.findById(forwarderId);
      if (!forwarder) {
        return {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Forwarder tidak ditemukan',
          },
        };
      }

      // Create API client based on forwarder configuration
      const apiClient = this._createApiClient(forwarder);

      // Call forwarder's rate API
      const response = await apiClient.post('/rates', this._formatShipmentData(forwarder, shipmentData), {
        timeout: forwarder.apiConfig.timeout || 30000,
      });

      return {
        success: true,
        data: this._parseRateResponse(response.data),
      };
    } catch (error) {
      if (error.response && error.response.data) {
        return {
          success: true,
          data: this._parseRateResponse(error.response.data),
        };
      }
      return {
        success: false,
        error: {
          code: 'API_ERROR',
          message: 'Gagal mendapatkan tarif dari API forwarder',
          details: error.message,
        },
      };
    }
  }

  /**
   * Create shipment with forwarder API
   * @param {string} forwarderId - Forwarder partner ID
   * @param {Object} shipmentData - Shipment data
   * @returns {Promise<Object>} Created shipment from forwarder
   */
  async createShipment(forwarderId, shipmentData) {
    try {
      const forwarder = await this.forwarderPartnerRepository.findById(forwarderId);
      if (!forwarder) {
        return {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Forwarder tidak ditemukan',
          },
        };
      }

      // Create API client based on forwarder configuration
      const apiClient = this._createApiClient(forwarder);

      // Call forwarder's shipment creation API
      const response = await apiClient.post('/shipments', this._formatShipmentData(forwarder, shipmentData), {
        timeout: forwarder.apiConfig.timeout || 30000,
      });

      return {
        success: true,
        data: this._parseShipmentResponse(response.data),
      };
    } catch (error) {
      if (error.response && error.response.data) {
        return {
          success: true,
          data: this._parseShipmentResponse(error.response.data),
        };
      }
      return {
        success: false,
        error: {
          code: 'API_ERROR',
          message: 'Gagal membuat pengiriman di API forwarder',
          details: error.message,
        },
      };
    }
  }

  /**
   * Track shipment with forwarder API
   * @param {string} forwarderId - Forwarder partner ID
   * @param {string} trackingNumber - Tracking number
   * @returns {Promise<Object>} Tracking information from forwarder
   */
  async trackShipment(forwarderId, trackingNumber) {
    try {
      const forwarder = await this.forwarderPartnerRepository.findById(forwarderId);
      if (!forwarder) {
        return {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Forwarder tidak ditemukan',
          },
        };
      }

      // Create API client based on forwarder configuration
      const apiClient = this._createApiClient(forwarder);

      // Call forwarder's tracking API
      const response = await apiClient.get(`/tracking/${trackingNumber}`, {
        timeout: forwarder.apiConfig.timeout || 30000,
      });

      return {
        success: true,
        data: this._parseTrackingResponse(response.data),
      };
    } catch (error) {
      if (error.response && error.response.data) {
        return {
          success: true,
          data: this._parseTrackingResponse(error.response.data),
        };
      }
      return {
        success: false,
        error: {
          code: 'API_ERROR',
          message: 'Gagal melacak pengiriman di API forwarder',
          details: error.message,
        },
      };
    }
  }

  /**
   * Create API client for a forwarder
   * @param {ForwarderPartner} forwarder - Forwarder partner
   * @returns {Object} Axios instance configured for the forwarder
   * @private
   */
  _createApiClient(forwarder) {
    const client = axios.create({
      baseURL: forwarder.apiConfig.baseUrl,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-API-Key': forwarder.apiConfig.apiKey,
      },
    });

    // Add request interceptor for authentication if needed
    client.interceptors.request.use((config) => {
      // If the forwarder uses username/password authentication
      if (forwarder.apiConfig.username && forwarder.apiConfig.passwordHash) {
        // Generate timestamp for request
        const timestamp = Math.floor(Date.now() / 1000).toString();
        
        // Create signature based on timestamp and secret
        const signature = crypto
          .createHmac('sha256', forwarder.apiConfig.passwordHash)
          .update(`${forwarder.apiConfig.username}:${timestamp}`)
          .digest('hex');

        // Add authentication headers
        config.headers['X-Username'] = forwarder.apiConfig.username;
        config.headers['X-Timestamp'] = timestamp;
        config.headers['X-Signature'] = signature;
      }

      return config;
    });

    return client;
  }

  /**
   * Format shipment data for forwarder API
   * @param {ForwarderPartner} forwarder - Forwarder partner
   * @param {Object} shipmentData - Shipment data
   * @returns {Object} Formatted shipment data for forwarder API
   * @private
   */
  _formatShipmentData(forwarder, shipmentData) {
    // Base format that works with most forwarders
    const formattedData = {
      shipper: {
        name: shipmentData.sender.name,
        phone: shipmentData.sender.phone,
        address: {
          street: shipmentData.sender.address.street,
          city: shipmentData.sender.address.city,
          province: shipmentData.sender.address.province,
          postal_code: shipmentData.sender.address.postalCode,
          country: shipmentData.sender.address.country || 'Indonesia',
        },
      },
      recipient: {
        name: shipmentData.recipient.name,
        phone: shipmentData.recipient.phone,
        address: {
          street: shipmentData.recipient.address.street,
          city: shipmentData.recipient.address.city,
          province: shipmentData.recipient.address.province,
          postal_code: shipmentData.recipient.address.postalCode,
          country: shipmentData.recipient.address.country || 'Indonesia',
        },
      },
      packages: shipmentData.packages.map(pkg => ({
        weight: pkg.weight,
        length: pkg.dimensions?.length || 0,
        width: pkg.dimensions?.width || 0,
        height: pkg.dimensions?.height || 0,
        description: pkg.description || '',
        value: pkg.value || 0,
      })),
      service_type: shipmentData.serviceType || 'regular',
      reference: shipmentData.reference || '',
      notes: shipmentData.notes || '',
    };

    // Customize format based on forwarder code if needed
    switch (forwarder.code) {
      case 'JNE':
        // JNE specific formatting
        formattedData.service_code = shipmentData.serviceType === 'express' ? 'YES' : 'REG';
        break;
      case 'TIKI':
        // TIKI specific formatting
        formattedData.service_code = shipmentData.serviceType === 'express' ? 'ONS' : 'REG';
        break;
      case 'POS':
        // POS specific formatting
        formattedData.service_code = shipmentData.serviceType === 'express' ? 'EXPRESS' : 'STANDARD';
        break;
      default:
        // Default formatting
        formattedData.service_code = shipmentData.serviceType;
    }

    return formattedData;
  }

  /**
   * Parse rate response from forwarder API
   * @param {Object} responseData - Response data from forwarder API
   * @returns {Object} Parsed rate data
   * @private
   */
  _parseRateResponse(responseData) {
    // Generic parser that works with most forwarders
    // This would need to be customized based on each forwarder's response format
    return {
      services: Array.isArray(responseData.services) 
        ? responseData.services.map(service => ({
            code: service.code || service.service_code,
            name: service.name || service.service_name,
            description: service.description || '',
            rate: service.rate || service.price || 0,
            currency: service.currency || 'IDR',
            estimatedDelivery: {
              min: service.estimated_delivery?.min || service.etd_from || 1,
              max: service.estimated_delivery?.max || service.etd_to || 3,
              unit: 'days',
            },
          }))
        : [],
    };
  }

  /**
   * Parse shipment response from forwarder API
   * @param {Object} responseData - Response data from forwarder API
   * @returns {Object} Parsed shipment data
   * @private
   */
  _parseShipmentResponse(responseData) {
    // Generic parser that works with most forwarders
    return {
      trackingNumber: responseData.tracking_number || responseData.awb || responseData.id,
      referenceNumber: responseData.reference_number || responseData.reference || '',
      status: responseData.status || 'created',
      label: responseData.label_url || null,
      estimatedDelivery: responseData.estimated_delivery || null,
      price: {
        amount: responseData.price?.amount || responseData.total || 0,
        currency: responseData.price?.currency || 'IDR',
      },
    };
  }

  /**
   * Parse tracking response from forwarder API
   * @param {Object} responseData - Response data from forwarder API
   * @returns {Object} Parsed tracking data
   * @private
   */
  _parseTrackingResponse(responseData) {
    // Generic parser that works with most forwarders
    return {
      trackingNumber: responseData.tracking_number || responseData.awb || responseData.id,
      status: responseData.status || 'unknown',
      estimatedDelivery: responseData.estimated_delivery || null,
      history: Array.isArray(responseData.history) 
        ? responseData.history.map(event => ({
            timestamp: new Date(event.timestamp || event.date || event.datetime),
            status: event.status || '',
            description: event.description || event.message || '',
            location: event.location || '',
          }))
        : [],
    };
  }
}

module.exports = ForwarderIntegrationService;
