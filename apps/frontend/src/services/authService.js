import apiService from './api';

/**
 * Authentication service
 * Handles user authentication operations
 */
const authService = {
  /**
   * Login user
   * @param {Object} credentials - User credentials
   * @param {string} credentials.email - User email
   * @param {string} credentials.password - User password
   * @returns {Promise<Object>} - User data and token
   */
  login: async (credentials) => {
    try {
      const response = await apiService.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Register new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} - User data
   */
  register: async (userData) => {
    try {
      const response = await apiService.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Logout user
   * @returns {Promise<void>}
   */
  logout: async () => {
    try {
      await apiService.post('/auth/logout');
      localStorage.removeItem('token');
    } catch (error) {
      console.error('Logout error:', error);
      // Still remove token even if API call fails
      localStorage.removeItem('token');
      throw error;
    }
  },

  /**
   * Get current user profile
   * @returns {Promise<Object>} - User profile data
   */
  getCurrentUser: async () => {
    try {
      const response = await apiService.get('/auth/me');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Check if user is authenticated
   * @returns {boolean} - Authentication status
   */
  isAuthenticated: () => {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('token');
  },
};

export default authService;
