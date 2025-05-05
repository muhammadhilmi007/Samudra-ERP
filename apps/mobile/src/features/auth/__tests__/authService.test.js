/**
 * Unit tests for authentication service
 */
import axios from 'axios';
import * as LocalAuthentication from 'expo-local-authentication';
import authService from '../authService';
import { secureStore } from '../../../lib/secureStorage';

// Mock dependencies
jest.mock('axios');
jest.mock('expo-local-authentication');
jest.mock('../../../lib/secureStorage');

describe('Authentication Service', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      // Mock successful API response
      const mockResponse = {
        data: {
          success: true,
          data: {
            token: 'test-token',
            user: {
              id: 'user-id',
              username: 'testuser',
              name: 'Test User',
              email: 'test@example.com',
              role: 'checker',
              branch: 'Jakarta'
            }
          }
        }
      };
      
      axios.post.mockResolvedValueOnce(mockResponse);
      
      // Call login function
      const result = await authService.login({ username: 'testuser', password: 'password' });
      
      // Verify results
      expect(axios.post).toHaveBeenCalledWith(
        '/auth/login',
        { username: 'testuser', password: 'password' }
      );
      expect(secureStore.save).toHaveBeenCalledWith('auth_token', 'test-token');
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle login failure with invalid credentials', async () => {
      // Mock failed API response
      const mockResponse = {
        data: {
          success: false,
          data: null,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid username or password'
          }
        }
      };
      
      axios.post.mockResolvedValueOnce(mockResponse);
      
      // Call login function
      const result = await authService.login({ username: 'testuser', password: 'wrong-password' });
      
      // Verify results
      expect(axios.post).toHaveBeenCalledWith(
        '/auth/login',
        { username: 'testuser', password: 'wrong-password' }
      );
      expect(secureStore.save).not.toHaveBeenCalled();
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle network errors during login', async () => {
      // Mock network error
      axios.post.mockRejectedValueOnce(new Error('Network Error'));
      axios.isAxiosError.mockReturnValueOnce(false);
      
      // Call login function
      const result = await authService.login({ username: 'testuser', password: 'password' });
      
      // Verify results
      expect(result).toEqual({
        success: false,
        data: null,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Network error occurred. Please check your connection.',
        },
      });
    });
  });

  describe('loginWithBiometric', () => {
    it('should login successfully with biometric authentication', async () => {
      // Mock biometric availability
      LocalAuthentication.hasHardwareAsync.mockResolvedValueOnce(true);
      LocalAuthentication.isEnrolledAsync.mockResolvedValueOnce(true);
      
      // Mock biometric enabled
      secureStore.get.mockImplementation(async (key) => {
        if (key === 'biometric_enabled') return 'true';
        if (key === 'biometric_username') return 'testuser';
        if (key === 'biometric_testuser') return 'password';
        return null;
      });
      
      // Mock successful biometric authentication
      LocalAuthentication.authenticateAsync.mockResolvedValueOnce({ success: true });
      
      // Mock successful login
      const mockLoginResponse = {
        success: true,
        data: {
          token: 'test-token',
          user: {
            id: 'user-id',
            username: 'testuser',
            name: 'Test User',
            email: 'test@example.com',
            role: 'checker',
            branch: 'Jakarta'
          }
        }
      };
      
      // Mock login function to return successful response
      jest.spyOn(authService, 'login').mockResolvedValueOnce(mockLoginResponse);
      
      // Call biometric login function
      const result = await authService.loginWithBiometric();
      
      // Verify results
      expect(LocalAuthentication.hasHardwareAsync).toHaveBeenCalled();
      expect(LocalAuthentication.isEnrolledAsync).toHaveBeenCalled();
      expect(LocalAuthentication.authenticateAsync).toHaveBeenCalledWith({
        promptMessage: 'Authenticate to login',
        fallbackLabel: 'Use password',
      });
      expect(authService.login).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'password'
      });
      expect(result).toEqual(mockLoginResponse);
    });

    it('should return null if biometric authentication fails', async () => {
      // Mock biometric availability
      LocalAuthentication.hasHardwareAsync.mockResolvedValueOnce(true);
      LocalAuthentication.isEnrolledAsync.mockResolvedValueOnce(true);
      
      // Mock biometric enabled
      secureStore.get.mockImplementation(async (key) => {
        if (key === 'biometric_enabled') return 'true';
        if (key === 'biometric_username') return 'testuser';
        return null;
      });
      
      // Mock failed biometric authentication
      LocalAuthentication.authenticateAsync.mockResolvedValueOnce({ success: false });
      
      // Call biometric login function
      const result = await authService.loginWithBiometric();
      
      // Verify results
      expect(LocalAuthentication.authenticateAsync).toHaveBeenCalled();
      expect(authService.login).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('logout', () => {
    it('should clear auth token on logout', async () => {
      // Mock token retrieval
      secureStore.get.mockResolvedValueOnce('test-token');
      
      // Mock successful logout API call
      axios.post.mockResolvedValueOnce({});
      
      // Call logout function
      await authService.logout();
      
      // Verify results
      expect(axios.post).toHaveBeenCalledWith(
        '/auth/logout',
        {},
        { headers: { Authorization: 'Bearer test-token' } }
      );
      expect(secureStore.delete).toHaveBeenCalledWith('auth_token');
    });

    it('should handle errors during logout gracefully', async () => {
      // Mock token retrieval
      secureStore.get.mockResolvedValueOnce('test-token');
      
      // Mock failed logout API call
      axios.post.mockRejectedValueOnce(new Error('API Error'));
      
      // Call logout function
      await authService.logout();
      
      // Verify token is still deleted even if API call fails
      expect(secureStore.delete).toHaveBeenCalledWith('auth_token');
    });
  });

  describe('biometric authentication', () => {
    it('should enable biometric authentication successfully', async () => {
      // Mock biometric availability
      LocalAuthentication.hasHardwareAsync.mockResolvedValueOnce(true);
      LocalAuthentication.isEnrolledAsync.mockResolvedValueOnce(true);
      
      // Call enable biometric function
      const result = await authService.enableBiometricAuth('testuser', 'password');
      
      // Verify results
      expect(secureStore.save).toHaveBeenCalledWith('biometric_username', 'testuser');
      expect(secureStore.save).toHaveBeenCalledWith('biometric_testuser', 'password');
      expect(secureStore.save).toHaveBeenCalledWith('biometric_enabled', 'true');
      expect(result).toBe(true);
    });

    it('should disable biometric authentication successfully', async () => {
      // Mock username retrieval
      secureStore.get.mockResolvedValueOnce('testuser');
      
      // Call disable biometric function
      const result = await authService.disableBiometricAuth();
      
      // Verify results
      expect(secureStore.delete).toHaveBeenCalledWith('biometric_testuser');
      expect(secureStore.delete).toHaveBeenCalledWith('biometric_username');
      expect(secureStore.save).toHaveBeenCalledWith('biometric_enabled', 'false');
      expect(result).toBe(true);
    });
  });
});
