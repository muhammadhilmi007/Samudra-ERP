/**
 * Shipment Service
 * Handles API calls related to shipments, resi/STT, and waybill tracking
 */

import apiService from './api';

const ENDPOINT = '/shipments';

const shipmentService = {
  /**
   * Create a new shipment/resi
   * @param {Object} shipmentData - Shipment data
   * @returns {Promise<Object>} - API response
   */
  createShipment: (shipmentData) => {
    return apiService.post(ENDPOINT, shipmentData);
  },

  /**
   * Get all shipments with optional filters
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} - API response
   */
  getShipments: (filters = {}) => {
    return apiService.get(ENDPOINT, filters);
  },

  /**
   * Get a specific shipment by ID
   * @param {string} id - Shipment ID
   * @returns {Promise<Object>} - API response
   */
  getShipmentById: (id) => {
    return apiService.get(`${ENDPOINT}/${id}`);
  },

  /**
   * Update a shipment
   * @param {string} id - Shipment ID
   * @param {Object} shipmentData - Updated shipment data
   * @returns {Promise<Object>} - API response
   */
  updateShipment: (id, shipmentData) => {
    return apiService.put(`${ENDPOINT}/${id}`, shipmentData);
  },

  /**
   * Delete a shipment
   * @param {string} id - Shipment ID
   * @returns {Promise<Object>} - API response
   */
  deleteShipment: (id) => {
    return apiService.delete(`${ENDPOINT}/${id}`);
  },

  /**
   * Calculate shipping price
   * @param {Object} pricingData - Data for pricing calculation
   * @returns {Promise<Object>} - API response with calculated price
   */
  calculatePrice: (pricingData) => {
    return apiService.post(`${ENDPOINT}/calculate-price`, pricingData);
  },

  /**
   * Track a shipment by waybill number
   * @param {string} waybillNumber - Waybill/STT number
   * @returns {Promise<Object>} - API response with tracking information
   */
  trackShipment: (waybillNumber) => {
    return apiService.get(`${ENDPOINT}/track/${waybillNumber}`);
  },

  /**
   * Generate shipment document (PDF)
   * @param {string} id - Shipment ID
   * @returns {Promise<Object>} - API response with document URL
   */
  generateDocument: (id) => {
    return apiService.get(`${ENDPOINT}/${id}/document`);
  }
};

export default shipmentService;
