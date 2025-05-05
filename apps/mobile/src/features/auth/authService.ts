/**
 * Authentication service for API requests
 */
import axios from 'axios';
import * as LocalAuthentication from 'expo-local-authentication';
import { API_BASE_URL } from '../../config/constants';
import { secureStore } from '../../lib/secureStorage';

interface LoginCredentials {
  username: string;
  password: string;
}

interface AuthResponse {
  success: boolean;
  data: {
    token: string;
    user: {
      id: string;
      username: string;
      name: string;
      email: string;
      role: string;
      branch: string;
    };
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

// Keys for storing authentication data
const AUTH_TOKEN_KEY = 'auth_token';
const BIOMETRIC_USERNAME_KEY = 'biometric_username';
const BIOMETRIC_ENABLED_KEY = 'biometric_enabled';
const BIOMETRIC_CREDENTIAL_PREFIX = 'biometric_';

// Create axios instance with interceptors
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  async (config) => {
    const token = await secureStore.get(AUTH_TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authService = {
  /**
   * Login with username and password
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>(
        '/auth/login',
        credentials
      );
      
      if (response.data.success && response.data.data.token) {
        await secureStore.save(AUTH_TOKEN_KEY, response.data.data.token);
      }
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as AuthResponse;
      }
      
      return {
        success: false,
        data: null,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Network error occurred. Please check your connection.',
        },
      } as any;
    }
  },

  /**
   * Login with biometric authentication
   */
  loginWithBiometric: async (): Promise<AuthResponse | null> => {
    try {
      // Check if biometric is available and enabled
      const isBiometricAvailable = await LocalAuthentication.hasHardwareAsync() && 
                                  await LocalAuthentication.isEnrolledAsync();
      const isBiometricEnabled = await secureStore.get(BIOMETRIC_ENABLED_KEY) === 'true';
      
      if (!isBiometricAvailable || !isBiometricEnabled) {
        return null;
      }
      
      // Get stored username for biometric login
      const username = await secureStore.get(BIOMETRIC_USERNAME_KEY);
      if (!username) {
        return null;
      }
      
      // Authenticate with biometric
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to login',
        fallbackLabel: 'Use password',
      });
      
      if (result.success) {
        // Get stored credential for this user
        const credential = await secureStore.get(`${BIOMETRIC_CREDENTIAL_PREFIX}${username}`);
        
        if (credential) {
          // Use the stored credential to login
          return await authService.login({
            username,
            password: credential
          });
        }
      }
      
      return null;
    } catch (error) {
      console.error('Biometric login error:', error);
      return null;
    }
  },

  /**
   * Enable biometric authentication for a user
   */
  enableBiometricAuth: async (username: string, password: string): Promise<boolean> => {
    try {
      // Check if biometric is available
      const isBiometricAvailable = await LocalAuthentication.hasHardwareAsync() && 
                                  await LocalAuthentication.isEnrolledAsync();
      
      if (!isBiometricAvailable) {
        return false;
      }
      
      // Store credentials for biometric login
      await secureStore.save(BIOMETRIC_USERNAME_KEY, username);
      await secureStore.save(`${BIOMETRIC_CREDENTIAL_PREFIX}${username}`, password);
      await secureStore.save(BIOMETRIC_ENABLED_KEY, 'true');
      
      return true;
    } catch (error) {
      console.error('Enable biometric error:', error);
      return false;
    }
  },

  /**
   * Disable biometric authentication
   */
  disableBiometricAuth: async (): Promise<boolean> => {
    try {
      const username = await secureStore.get(BIOMETRIC_USERNAME_KEY);
      
      if (username) {
        await secureStore.delete(`${BIOMETRIC_CREDENTIAL_PREFIX}${username}`);
      }
      
      await secureStore.delete(BIOMETRIC_USERNAME_KEY);
      await secureStore.save(BIOMETRIC_ENABLED_KEY, 'false');
      
      return true;
    } catch (error) {
      console.error('Disable biometric error:', error);
      return false;
    }
  },

  /**
   * Check if biometric authentication is enabled
   */
  isBiometricEnabled: async (): Promise<boolean> => {
    try {
      const isBiometricAvailable = await LocalAuthentication.hasHardwareAsync() && 
                                  await LocalAuthentication.isEnrolledAsync();
      const isBiometricEnabled = await secureStore.get(BIOMETRIC_ENABLED_KEY) === 'true';
      
      return isBiometricAvailable && isBiometricEnabled;
    } catch (error) {
      console.error('Check biometric error:', error);
      return false;
    }
  },

  /**
   * Logout user
   */
  logout: async (): Promise<void> => {
    try {
      // Attempt to call logout endpoint to invalidate token on server
      const token = await secureStore.get(AUTH_TOKEN_KEY);
      
      if (token) {
        try {
          await api.post('/auth/logout', {}, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
        } catch (error) {
          // Ignore errors from logout endpoint
          console.log('Logout endpoint error (ignoring):', error);
        }
      }
      
      // Clear token from secure storage
      await secureStore.delete(AUTH_TOKEN_KEY);
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  /**
   * Get stored authentication token
   */
  getToken: async (): Promise<string | null> => {
    try {
      return await secureStore.get(AUTH_TOKEN_KEY);
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  },

  /**
   * Set authentication token (used by session service)
   */
  setAuthToken: (token: string): void => {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  },

  /**
   * Clear authentication token (used by session service)
   */
  clearAuthToken: (): void => {
    delete api.defaults.headers.common.Authorization;
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: async (): Promise<boolean> => {
    const token = await authService.getToken();
    return !!token; // Convert to boolean
  },

  /**
   * Request password reset
   */
  requestPasswordReset: async (email: string): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>(
        '/auth/forgot-password',
        { email }
      );
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as AuthResponse;
      }
      
      return {
        success: false,
        data: null,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Network error occurred. Please check your connection.',
        },
      } as any;
    }
  },

  /**
   * Reset password with token
   */
  resetPassword: async (token: string, newPassword: string): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>(
        '/auth/reset-password',
        { token, newPassword }
      );
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as AuthResponse;
      }
      
      return {
        success: false,
        data: null,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Network error occurred. Please check your connection.',
        },
      } as any;
    }
  },

  /**
   * Change password
   */
  changePassword: async (currentPassword: string, newPassword: string): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>(
        '/auth/change-password',
        { currentPassword, newPassword }
      );
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as AuthResponse;
      }
      
      return {
        success: false,
        data: null,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Network error occurred. Please check your connection.',
        },
      } as any;
    }
  },
};

export default authService;
