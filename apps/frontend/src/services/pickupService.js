import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Service for handling pickup-related API calls
 */
const pickupService = {
  /**
   * Create a new pickup request
   * @param {Object} data - Pickup request data
   * @returns {Promise} - Promise with the created pickup request
   */
  createPickupRequest: async (data) => {
    try {
      const response = await axios.post(`${API_URL}/pickup-requests`, data, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create pickup request' };
    }
  },

  /**
   * Get all pickup requests with optional filters
   * @param {Object} filters - Filter parameters
   * @returns {Promise} - Promise with the pickup requests
   */
  getPickupRequests: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      // Add filters to query params
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value);
        }
      });
      
      const response = await axios.get(`${API_URL}/pickup-requests?${queryParams.toString()}`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch pickup requests' };
    }
  },

  /**
   * Get a pickup request by ID
   * @param {string} id - Pickup request ID
   * @returns {Promise} - Promise with the pickup request
   */
  getPickupRequestById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/pickup-requests/${id}`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch pickup request' };
    }
  },

  /**
   * Update a pickup request
   * @param {string} id - Pickup request ID
   * @param {Object} data - Updated pickup request data
   * @returns {Promise} - Promise with the updated pickup request
   */
  updatePickupRequest: async (id, data) => {
    try {
      const response = await axios.put(`${API_URL}/pickup-requests/${id}`, data, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update pickup request' };
    }
  },

  /**
   * Update pickup request status
   * @param {string} id - Pickup request ID
   * @param {string} status - New status
   * @returns {Promise} - Promise with the updated pickup request
   */
  updatePickupRequestStatus: async (id, status) => {
    try {
      const response = await axios.patch(`${API_URL}/pickup-requests/${id}/status`, { status }, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update pickup request status' };
    }
  },

  /**
   * Cancel a pickup request
   * @param {string} id - Pickup request ID
   * @param {string} reason - Cancellation reason
   * @returns {Promise} - Promise with the cancelled pickup request
   */
  cancelPickupRequest: async (id, reason) => {
    try {
      const response = await axios.post(`${API_URL}/pickup-requests/${id}/cancel`, { reason }, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to cancel pickup request' };
    }
  },

  /**
   * Reschedule a pickup request
   * @param {string} id - Pickup request ID
   * @param {Object} data - Rescheduling data
   * @returns {Promise} - Promise with the rescheduled pickup request
   */
  reschedulePickupRequest: async (id, data) => {
    try {
      const response = await axios.post(`${API_URL}/pickup-requests/${id}/reschedule`, data, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to reschedule pickup request' };
    }
  },

  /**
   * Get all pickup assignments with optional filters
   * @param {Object} filters - Filter parameters
   * @returns {Promise} - Promise with the pickup assignments
   */
  getPickupAssignments: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      // Add filters to query params
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value);
        }
      });
      
      const response = await axios.get(`${API_URL}/pickup-assignments?${queryParams.toString()}`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch pickup assignments' };
    }
  },

  /**
   * Create a new pickup assignment
   * @param {Object} data - Pickup assignment data
   * @returns {Promise} - Promise with the created pickup assignment
   */
  createPickupAssignment: async (data) => {
    try {
      const response = await axios.post(`${API_URL}/pickup-assignments`, data, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create pickup assignment' };
    }
  },

  /**
   * Get a pickup assignment by ID
   * @param {string} id - Pickup assignment ID
   * @returns {Promise} - Promise with the pickup assignment
   */
  getPickupAssignmentById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/pickup-assignments/${id}`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch pickup assignment' };
    }
  },

  /**
   * Update a pickup assignment
   * @param {string} id - Pickup assignment ID
   * @param {Object} data - Updated pickup assignment data
   * @returns {Promise} - Promise with the updated pickup assignment
   */
  updatePickupAssignment: async (id, data) => {
    try {
      const response = await axios.put(`${API_URL}/pickup-assignments/${id}`, data, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update pickup assignment' };
    }
  },

  /**
   * Update pickup assignment status
   * @param {string} id - Pickup assignment ID
   * @param {string} status - New status
   * @returns {Promise} - Promise with the updated pickup assignment
   */
  updatePickupAssignmentStatus: async (id, status) => {
    try {
      const response = await axios.patch(`${API_URL}/pickup-assignments/${id}/status`, { status }, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update pickup assignment status' };
    }
  },

  /**
   * Get teams for pickup assignments
   * @returns {Promise} - Promise with the teams
   */
  getTeams: async () => {
    try {
      const response = await axios.get(`${API_URL}/teams`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch teams' };
    }
  },

  /**
   * Get vehicles for pickup assignments
   * @returns {Promise} - Promise with the vehicles
   */
  getVehicles: async () => {
    try {
      const response = await axios.get(`${API_URL}/vehicles`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch vehicles' };
    }
  },

  /**
   * Get customers for pickup requests
   * @returns {Promise} - Promise with the customers
   */
  getCustomers: async () => {
    try {
      const response = await axios.get(`${API_URL}/customers`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch customers' };
    }
  },

  /**
   * Get branches for pickup requests
   * @returns {Promise} - Promise with the branches
   */
  getBranches: async () => {
    try {
      const response = await axios.get(`${API_URL}/branches`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch branches' };
    }
  },

  /**
   * Update GPS location for a pickup assignment
   * @param {string} id - Pickup assignment ID
   * @param {Object} location - GPS location data
   * @returns {Promise} - Promise with the updated pickup assignment
   */
  updateGpsLocation: async (id, location) => {
    try {
      const response = await axios.post(`${API_URL}/pickup-assignments/${id}/gps`, location, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update GPS location' };
    }
  },

  /**
   * Get GPS tracking data for a pickup assignment
   * @param {string} id - Pickup assignment ID
   * @returns {Promise} - Promise with the GPS tracking data
   */
  getGpsTracking: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/pickup-assignments/${id}/gps`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch GPS tracking data' };
    }
  },

  /**
   * Optimize route for a pickup assignment
   * @param {string} id - Pickup assignment ID
   * @returns {Promise} - Promise with the optimized route
   */
  optimizeRoute: async (id) => {
    try {
      const response = await axios.post(`${API_URL}/pickup-assignments/${id}/optimize-route`, {}, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to optimize route' };
    }
  },
};

export default pickupService;
