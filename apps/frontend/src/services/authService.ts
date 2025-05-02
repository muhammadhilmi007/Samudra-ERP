import apiService from './api';

// Define types for authentication
interface UserCredentials {
  email: string;
  password: string;
}

interface UserData {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthResponse {
  user: UserData;
  token: string;
}

interface RegistrationData {
  name: string;
  email: string;
  password: string;
  role?: string;
}

/**
 * Authentication service
 * Handles user authentication operations
 */
const authService = {
  /**
   * Login user
   * @param {UserCredentials} credentials - User credentials
   * @returns {Promise<AuthResponse>} - User data and token
   */
  login: async (credentials: UserCredentials): Promise<AuthResponse> => {
    const response = await apiService.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  /**
   * Register new user
   * @param {RegistrationData} userData - User registration data
   * @returns {Promise<UserData>} - User data
   */
  register: async (userData: RegistrationData): Promise<UserData> => {
    const response = await apiService.post<UserData>('/auth/register', userData);
    return response.data;
  },

  /**
   * Logout user
   * @returns {Promise<void>}
   */
  logout: async (): Promise<void> => {
    try {
      await apiService.post<void>('/auth/logout', {});
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always remove token even if API call fails
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
      }
    }
  },

  /**
   * Get current user profile
   * @returns {Promise<UserData>} - User profile data
   */
  getCurrentUser: async (): Promise<UserData> => {
    const response = await apiService.get<UserData>('/auth/me');
    return response.data;
  },

  /**
   * Check if user is authenticated
   * @returns {boolean} - Authentication status
   */
  isAuthenticated: (): boolean => {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('token');
  },
};

export default authService;
