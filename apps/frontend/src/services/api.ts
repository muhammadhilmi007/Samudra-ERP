/**
 * API service for making HTTP requests to the backend
 * Follows the API format standards defined in TDD Section 6.4.2
 */

// Define types for API responses
interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: Record<string, any>;
}

interface ApiErrorDetail {
  code: string;
  message: string;
  details?: Record<string, any>;
}

interface ApiErrorResponse {
  success: false;
  error: ApiErrorDetail;
}

type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// Base API URL - should be configured based on environment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Custom fetch wrapper with error handling and authentication
 */
const fetchWithAuth = async <T>(endpoint: string, options: RequestInit = {}): Promise<ApiSuccessResponse<T>> => {
  // Get token from localStorage
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  // Set default headers
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  // Add auth token if available
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  // Prepare request options
  const requestOptions: RequestInit = {
    ...options,
    headers,
  };
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, requestOptions);
    const data = await response.json() as ApiResponse<T>;
    
    // Check for API-level errors
    if (!data.success) {
      throw new Error(data.error?.message || 'An unknown error occurred');
    }
    
    return data as ApiSuccessResponse<T>;
  } catch (error) {
    // Handle network errors or JSON parsing errors
    if (error instanceof SyntaxError) {
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
   * @returns {Promise<ApiSuccessResponse<T>>} - API response
   */
  get: async <T>(endpoint: string, params: Record<string, any> = {}): Promise<ApiSuccessResponse<T>> => {
    // Convert params object to URL query string
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    return fetchWithAuth<T>(url, { method: 'GET' });
  },
  
  /**
   * POST request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body
   * @returns {Promise<ApiSuccessResponse<T>>} - API response
   */
  post: async <T>(endpoint: string, data: Record<string, any> = {}): Promise<ApiSuccessResponse<T>> => {
    return fetchWithAuth<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  /**
   * PUT request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body
   * @returns {Promise<ApiSuccessResponse<T>>} - API response
   */
  put: async <T>(endpoint: string, data: Record<string, any> = {}): Promise<ApiSuccessResponse<T>> => {
    return fetchWithAuth<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  /**
   * PATCH request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body
   * @returns {Promise<ApiSuccessResponse<T>>} - API response
   */
  patch: async <T>(endpoint: string, data: Record<string, any> = {}): Promise<ApiSuccessResponse<T>> => {
    return fetchWithAuth<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
  
  /**
   * DELETE request
   * @param {string} endpoint - API endpoint
   * @returns {Promise<ApiSuccessResponse<T>>} - API response
   */
  delete: async <T>(endpoint: string): Promise<ApiSuccessResponse<T>> => {
    return fetchWithAuth<T>(endpoint, { method: 'DELETE' });
  },
};

export default apiService;
