'use client';

import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import { loginUser, logoutUser, clearError } from '../store/slices/authSlice';
import { useRouter } from 'next/navigation';

/**
 * Custom hook for authentication
 * Provides easy access to auth state and actions
 */
const useAuth = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user, token, isAuthenticated, isLoading, error } = useSelector((state) => state.auth);

  /**
   * Login function
   * @param {Object} credentials - User credentials
   */
  const login = useCallback(
    async (credentials) => {
      try {
        await dispatch(loginUser(credentials)).unwrap();
        router.push('/dashboard');
      } catch (error) {
        console.error('Login failed:', error);
      }
    },
    [dispatch, router]
  );

  /**
   * Logout function
   */
  const logout = useCallback(async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, [dispatch, router]);

  /**
   * Clear authentication errors
   */
  const resetError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    resetError,
  };
};

export default useAuth;
