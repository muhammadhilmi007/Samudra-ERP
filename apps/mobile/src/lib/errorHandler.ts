/**
 * Error handling utility for Samudra Paket ERP Mobile
 * Provides standardized error handling across the application
 */
import axios, { AxiosError } from 'axios';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

// Error types
export enum ErrorType {
  NETWORK = 'NETWORK_ERROR',
  API = 'API_ERROR',
  VALIDATION = 'VALIDATION_ERROR',
  AUTH = 'AUTHENTICATION_ERROR',
  PERMISSION = 'PERMISSION_ERROR',
  STORAGE = 'STORAGE_ERROR',
  SYNC = 'SYNC_ERROR',
  UNKNOWN = 'UNKNOWN_ERROR',
}

// Error interface
export interface AppError {
  type: ErrorType;
  message: string;
  code?: string;
  details?: any;
  originalError?: any;
}

// Error handler class
class ErrorHandler {
  private logDir: string;
  
  constructor() {
    // Set up log directory
    this.logDir = `${FileSystem.documentDirectory}logs/`;
    this.initializeLogDirectory();
  }
  
  /**
   * Initialize log directory
   */
  private async initializeLogDirectory(): Promise<void> {
    try {
      const dirInfo = await FileSystem.getInfoAsync(this.logDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(this.logDir, { intermediates: true });
      }
    } catch (error) {
      console.error('Failed to initialize log directory:', error);
    }
  }
  
  /**
   * Handle API errors
   */
  handleApiError(error: AxiosError): AppError {
    if (axios.isAxiosError(error)) {
      // Network error
      if (!error.response) {
        return {
          type: ErrorType.NETWORK,
          message: 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.',
          originalError: error,
        };
      }
      
      // Server error responses
      const status = error.response.status;
      const data = error.response.data as any;
      
      // Authentication errors
      if (status === 401) {
        return {
          type: ErrorType.AUTH,
          message: 'Sesi Anda telah berakhir. Silakan login kembali.',
          code: 'SESSION_EXPIRED',
          originalError: error,
        };
      }
      
      // Permission errors
      if (status === 403) {
        return {
          type: ErrorType.PERMISSION,
          message: 'Anda tidak memiliki izin untuk melakukan tindakan ini.',
          code: 'FORBIDDEN',
          originalError: error,
        };
      }
      
      // Validation errors
      if (status === 422 || status === 400) {
        return {
          type: ErrorType.VALIDATION,
          message: data.error?.message || 'Data yang dikirim tidak valid.',
          code: data.error?.code || 'VALIDATION_FAILED',
          details: data.error?.details || {},
          originalError: error,
        };
      }
      
      // Server errors
      if (status >= 500) {
        return {
          type: ErrorType.API,
          message: 'Terjadi kesalahan pada server. Silakan coba lagi nanti.',
          code: `SERVER_${status}`,
          originalError: error,
        };
      }
      
      // Other API errors
      return {
        type: ErrorType.API,
        message: data.error?.message || 'Terjadi kesalahan saat menghubungi server.',
        code: data.error?.code || `API_${status}`,
        details: data.error?.details,
        originalError: error,
      };
    }
    
    // Generic error
    return {
      type: ErrorType.UNKNOWN,
      message: error.message || 'Terjadi kesalahan yang tidak diketahui.',
      originalError: error,
    };
  }
  
  /**
   * Handle storage errors
   */
  handleStorageError(error: any, operation: string): AppError {
    return {
      type: ErrorType.STORAGE,
      message: `Terjadi kesalahan saat ${operation} data.`,
      details: { operation },
      originalError: error,
    };
  }
  
  /**
   * Handle sync errors
   */
  handleSyncError(error: any, entityType?: string): AppError {
    return {
      type: ErrorType.SYNC,
      message: 'Terjadi kesalahan saat sinkronisasi data.',
      details: { entityType },
      originalError: error,
    };
  }
  
  /**
   * Log error to file
   */
  async logError(error: AppError): Promise<void> {
    try {
      const timestamp = new Date().toISOString();
      const logEntry = {
        timestamp,
        type: error.type,
        message: error.message,
        code: error.code,
        details: error.details,
        device: Platform.OS,
        version: Platform.Version,
        originalError: error.originalError ? 
          (error.originalError.toString ? error.originalError.toString() : JSON.stringify(error.originalError)) 
          : null,
      };
      
      const logFile = `${this.logDir}error_log_${new Date().toISOString().split('T')[0]}.json`;
      
      // Check if file exists
      const fileInfo = await FileSystem.getInfoAsync(logFile);
      
      let logs = [];
      if (fileInfo.exists) {
        // Read existing logs
        const content = await FileSystem.readAsStringAsync(logFile);
        logs = JSON.parse(content);
      }
      
      // Add new log entry
      logs.push(logEntry);
      
      // Write logs back to file
      await FileSystem.writeAsStringAsync(logFile, JSON.stringify(logs, null, 2));
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
  }
  
  /**
   * Get error logs for the current day
   */
  async getErrorLogs(): Promise<any[]> {
    try {
      const logFile = `${this.logDir}error_log_${new Date().toISOString().split('T')[0]}.json`;
      const fileInfo = await FileSystem.getInfoAsync(logFile);
      
      if (fileInfo.exists) {
        const content = await FileSystem.readAsStringAsync(logFile);
        return JSON.parse(content);
      }
      
      return [];
    } catch (error) {
      console.error('Failed to get error logs:', error);
      return [];
    }
  }
}

export default new ErrorHandler();
