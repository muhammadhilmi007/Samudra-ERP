'use client';

import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { checkAuthState } from '../../store/slices/authSlice';
import { AppDispatch } from '../../store';
import apiService from '../../services/api';

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * AuthProvider - Component to manage authentication state and token refresh
 * Handles token refresh and session management
 */
const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [isInitialized, setIsInitialized] = useState(false);

  // Setup token refresh interceptor
  useEffect(() => {
    // Initialize auth state from localStorage
    dispatch(checkAuthState());
    setIsInitialized(true);

    // Setup axios interceptor for token refresh
    const responseInterceptor = async (response: Response) => {
      return response;
    };

    const errorInterceptor = async (error: any) => {
      const originalRequest = error.config;

      // If error is 401 Unauthorized and not a retry
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          // Try to refresh the token
          const refreshToken = localStorage.getItem('refreshToken');
          if (!refreshToken) {
            throw new Error('No refresh token available');
          }

          // Call refresh token API
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh-token`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken }),
          });

          if (!response.ok) {
            throw new Error('Token refresh failed');
          }

          const data = await response.json();
          
          // Update tokens in localStorage
          localStorage.setItem('token', data.token);
          localStorage.setItem('refreshToken', data.refreshToken);

          // Update auth headers for the original request
          originalRequest.headers['Authorization'] = `Bearer ${data.token}`;
          
          // Retry the original request
          return fetch(originalRequest.url, originalRequest);
        } catch (refreshError) {
          // If refresh fails, logout user
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    };

    // Clean up function for interceptors
    return () => {
      // Clean up would be here if using axios interceptors
    };
  }, [dispatch]);

  // Show nothing until auth is initialized
  if (!isInitialized) {
    return null;
  }

  return <>{children}</>;
};

export default AuthProvider;
