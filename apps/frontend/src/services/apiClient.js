'use client';

import axios from 'axios';

/**
 * API Client for making HTTP requests
 * Handles authentication, error handling, and request/response interceptors
 */
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage if in browser environment
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
apiClient.interceptors.response.use(
  (response) => {
    // Return only the data part of the response
    return response.data;
  },
  (error) => {
    // Handle different error scenarios
    const { response } = error;
    
    if (response && response.status === 401) {
      // Handle unauthorized access
      if (typeof window !== 'undefined') {
        // Clear token and redirect to login
        localStorage.removeItem('token');
        window.location.href = '/auth/login';
      }
    }
    
    // Return standardized error format
    return Promise.reject({
      status: response?.status,
      message: response?.data?.error?.message || 'An unexpected error occurred',
      details: response?.data?.error?.details || {},
      originalError: error,
    });
  }
);

export { apiClient };
