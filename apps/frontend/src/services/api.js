/**
 * API service for making HTTP requests to the backend
 * Follows the API format standards defined in TDD Section 6.4.2
 */

// Base API URL - should be configured based on environment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Custom fetch wrapper with error handling and authentication
 */
const fetchWithAuth = async (endpoint, options = {}) => {
  // Get token from localStorage
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  // Set default headers
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  // Add auth token if available
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  // Prepare request options
  const requestOptions = {
    ...options,
    headers,
  };
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, requestOptions);
    const data = await response.json();
    
    // Check for API-level errors
    if (!data.success) {
      throw new Error(data.error?.message || 'An unknown error occurred');
    }
    
    return data;
  } catch (error) {
    // Handle network errors or JSON parsing errors
    if (error.name === 'SyntaxError') {
      throw new Error('Invalid response from server');
    }
    
    // Re-throw the error for handling by the caller
    throw error;
  }
};

/**
 * API service methods for different HTTP verbs
 */
const apiService = {
  /**
   * GET request
   * @param {string} endpoint - API endpoint
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} - API response
   */
  get: async (endpoint, params = {}) => {
    // Convert params object to URL query string
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    return fetchWithAuth(url, { method: 'GET' });
  },
  
  /**
   * POST request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body
   * @returns {Promise<Object>} - API response
   */
  post: async (endpoint, data = {}) => {
    return fetchWithAuth(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  /**
   * PUT request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body
   * @returns {Promise<Object>} - API response
   */
  put: async (endpoint, data = {}) => {
    return fetchWithAuth(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  /**
   * PATCH request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body
   * @returns {Promise<Object>} - API response
   */
  patch: async (endpoint, data = {}) => {
    return fetchWithAuth(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
  
  /**
   * DELETE request
   * @param {string} endpoint - API endpoint
   * @returns {Promise<Object>} - API response
   */
  delete: async (endpoint) => {
    return fetchWithAuth(endpoint, { method: 'DELETE' });
  },
};

export default apiService;
