import { apiClient } from './apiClient';

export const customerService = {
  /**
   * Get all customers
   * @returns {Promise} Promise object with customers data
   */
  getCustomers: async () => {
    return apiClient.get('/api/customers');
  },

  /**
   * Get customer by ID
   * @param {string} id - Customer ID
   * @returns {Promise} Promise object with customer data
   */
  getCustomerById: async (id) => {
    return apiClient.get(`/api/customers/${id}`);
  },

  /**
   * Create new customer
   * @param {Object} customerData - Customer data
   * @returns {Promise} Promise object with created customer
   */
  createCustomer: async (customerData) => {
    return apiClient.post('/api/customers', customerData);
  },

  /**
   * Update customer
   * @param {string} id - Customer ID
   * @param {Object} customerData - Updated customer data
   * @returns {Promise} Promise object with updated customer
   */
  updateCustomer: async (id, customerData) => {
    return apiClient.put(`/api/customers/${id}`, customerData);
  },

  /**
   * Delete customer
   * @param {string} id - Customer ID
   * @returns {Promise} Promise object
   */
  deleteCustomer: async (id) => {
    return apiClient.delete(`/api/customers/${id}`);
  },

  /**
   * Get customer activity history
   * @param {string} id - Customer ID
   * @returns {Promise} Promise object with customer activity history
   */
  getCustomerActivityHistory: async (id) => {
    return apiClient.get(`/api/customers/${id}/activity-history`);
  },

  /**
   * Activate customer
   * @param {string} id - Customer ID
   * @returns {Promise} Promise object
   */
  activateCustomer: async (id) => {
    return apiClient.post(`/api/customers/${id}/activate`);
  },

  /**
   * Deactivate customer
   * @param {string} id - Customer ID
   * @returns {Promise} Promise object
   */
  deactivateCustomer: async (id) => {
    return apiClient.post(`/api/customers/${id}/deactivate`);
  }
};
