/**
 * Session Management Service for Checker App
 * Handles authentication state persistence and session management
 */
import { secureStore } from '../../lib/secureStorage';
import authService from './authService';

// Keys for storing session data
const SESSION_TOKEN_KEY = 'auth_token';
const SESSION_USER_KEY = 'auth_user';
const SESSION_EXPIRY_KEY = 'auth_expiry';
const BIOMETRIC_ENABLED_KEY = 'biometric_enabled';
const REMEMBER_ME_KEY = 'remember_me';

// Default session timeout in milliseconds (8 hours)
const DEFAULT_SESSION_TIMEOUT = 8 * 60 * 60 * 1000;

interface SessionUser {
  id: string;
  username: string;
  name: string;
  email: string;
  role: string;
  branch: string;
}

interface SessionData {
  token: string | null;
  user: SessionUser | null;
  expiresAt: number | null;
}

/**
 * Session management service for handling user authentication state
 */
const sessionService = {
  /**
   * Initialize session from stored data
   */
  initializeSession: async (): Promise<SessionData> => {
    try {
      const token = await secureStore.get(SESSION_TOKEN_KEY);
      const userJson = await secureStore.get(SESSION_USER_KEY);
      const expiryStr = await secureStore.get(SESSION_EXPIRY_KEY);
      
      const user = userJson ? JSON.parse(userJson) as SessionUser : null;
      const expiresAt = expiryStr ? parseInt(expiryStr, 10) : null;
      
      // Check if session is expired
      if (expiresAt && Date.now() > expiresAt) {
        await sessionService.clearSession();
        return { token: null, user: null, expiresAt: null };
      }
      
      return { token, user, expiresAt };
    } catch (error) {
      console.error('Error initializing session:', error);
      return { token: null, user: null, expiresAt: null };
    }
  },
  
  /**
   * Create a new session
   */
  createSession: async (
    token: string, 
    user: SessionUser, 
    rememberMe: boolean = false
  ): Promise<void> => {
    try {
      // Calculate session expiry time
      const expiresAt = rememberMe 
        ? Date.now() + (30 * 24 * 60 * 60 * 1000) // 30 days if remember me is enabled
        : Date.now() + DEFAULT_SESSION_TIMEOUT;
      
      // Store session data
      await secureStore.save(SESSION_TOKEN_KEY, token);
      await secureStore.save(SESSION_USER_KEY, JSON.stringify(user));
      await secureStore.save(SESSION_EXPIRY_KEY, expiresAt.toString());
      await secureStore.save(REMEMBER_ME_KEY, rememberMe ? 'true' : 'false');
      
      // Set token in auth service for API requests
      authService.setAuthToken(token);
    } catch (error) {
      console.error('Error creating session:', error);
      throw new Error('Failed to create session');
    }
  },
  
  /**
   * Update session expiry
   */
  refreshSession: async (): Promise<void> => {
    try {
      const rememberMeStr = await secureStore.get(REMEMBER_ME_KEY);
      const rememberMe = rememberMeStr === 'true';
      
      const expiresAt = rememberMe 
        ? Date.now() + (30 * 24 * 60 * 60 * 1000) // 30 days if remember me is enabled
        : Date.now() + DEFAULT_SESSION_TIMEOUT;
      
      await secureStore.save(SESSION_EXPIRY_KEY, expiresAt.toString());
    } catch (error) {
      console.error('Error refreshing session:', error);
    }
  },
  
  /**
   * Clear session data
   */
  clearSession: async (): Promise<void> => {
    try {
      await secureStore.delete(SESSION_TOKEN_KEY);
      await secureStore.delete(SESSION_USER_KEY);
      await secureStore.delete(SESSION_EXPIRY_KEY);
      
      // Don't clear remember me or biometric settings
      
      // Clear token from auth service
      authService.clearAuthToken();
    } catch (error) {
      console.error('Error clearing session:', error);
    }
  },
  
  /**
   * Check if session is valid
   */
  isSessionValid: async (): Promise<boolean> => {
    try {
      const expiryStr = await secureStore.get(SESSION_EXPIRY_KEY);
      const token = await secureStore.get(SESSION_TOKEN_KEY);
      
      if (!expiryStr || !token) {
        return false;
      }
      
      const expiresAt = parseInt(expiryStr, 10);
      return Date.now() < expiresAt;
    } catch (error) {
      console.error('Error checking session validity:', error);
      return false;
    }
  },
  
  /**
   * Get current session data
   */
  getSessionData: async (): Promise<SessionData> => {
    return sessionService.initializeSession();
  },
  
  /**
   * Set biometric authentication enabled/disabled
   */
  setBiometricEnabled: async (enabled: boolean): Promise<void> => {
    try {
      await secureStore.save(BIOMETRIC_ENABLED_KEY, enabled ? 'true' : 'false');
    } catch (error) {
      console.error('Error setting biometric enabled:', error);
    }
  },
  
  /**
   * Check if biometric authentication is enabled
   */
  isBiometricEnabled: async (): Promise<boolean> => {
    try {
      const enabled = await secureStore.get(BIOMETRIC_ENABLED_KEY);
      return enabled === 'true';
    } catch (error) {
      console.error('Error checking if biometric is enabled:', error);
      return false;
    }
  },
  
  /**
   * Set remember me enabled/disabled
   */
  setRememberMe: async (enabled: boolean): Promise<void> => {
    try {
      await secureStore.save(REMEMBER_ME_KEY, enabled ? 'true' : 'false');
      
      // Update session expiry if session exists
      const isValid = await sessionService.isSessionValid();
      if (isValid) {
        await sessionService.refreshSession();
      }
    } catch (error) {
      console.error('Error setting remember me:', error);
    }
  },
  
  /**
   * Check if remember me is enabled
   */
  isRememberMeEnabled: async (): Promise<boolean> => {
    try {
      const enabled = await secureStore.get(REMEMBER_ME_KEY);
      return enabled === 'true';
    } catch (error) {
      console.error('Error checking if remember me is enabled:', error);
      return false;
    }
  }
};

export default sessionService;
