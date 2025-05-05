/**
 * Application constants for Samudra Paket ERP Mobile
 */

// API Configuration
export const API_BASE_URL = 'https://api.samudrapaket.com/v1';

// App Theme Colors (from TDD Section 3.5.1)
export const COLORS = {
  PRIMARY: '#2563EB',    // Blue
  SECONDARY: '#10B981',  // Green
  ACCENT: '#F59E0B',     // Amber
  NEUTRAL: '#64748B',    // Slate
  
  // Additional colors
  SUCCESS: '#10B981',
  WARNING: '#F59E0B',
  ERROR: '#EF4444',
  INFO: '#3B82F6',
  
  // Background colors
  BACKGROUND: {
    PRIMARY: '#FFFFFF',
    SECONDARY: '#F9FAFB',
    TERTIARY: '#F3F4F6',
  },
  
  // Text colors
  TEXT: {
    PRIMARY: '#1F2937',
    SECONDARY: '#4B5563',
    TERTIARY: '#9CA3AF',
    INVERSE: '#FFFFFF',
  },
  
  // Border colors
  BORDER: {
    LIGHT: '#E5E7EB',
    DEFAULT: '#D1D5DB',
    DARK: '#9CA3AF',
  },
};

// Screen Dimensions
export const SCREEN = {
  SPACING: {
    XS: 4,
    SM: 8,
    MD: 16,
    LG: 24,
    XL: 32,
    XXL: 48,
  },
  RADIUS: {
    SM: 4,
    MD: 8,
    LG: 12,
    XL: 16,
    ROUND: 9999,
  },
};

// App Status Codes
export const STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  FAILED: 'failed',
  DELAYED: 'delayed',
};

// Sync Configuration
export const SYNC = {
  INTERVAL: 60000, // 1 minute
  RETRY_DELAY: 5000, // 5 seconds
  MAX_RETRIES: 3,
};

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  APP_SETTINGS: 'app_settings',
};

// Default Settings
export const DEFAULT_SETTINGS = {
  language: 'id',
  theme: 'light',
  notifications: true,
  locationTracking: true,
  dataUsage: {
    saveData: false,
    autoSync: true,
    syncOnWifiOnly: false,
  },
};

// Notification Channels
export const NOTIFICATION_CHANNELS = {
  ASSIGNMENTS: 'assignments',
  PICKUPS: 'pickups',
  DELIVERIES: 'deliveries',
  SYSTEM: 'system',
};

// App Version
export const APP_VERSION = '1.0.0';
