'use client';

import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { loginUser, logoutUser, clearError } from '../store/slices/authSlice';
import { RootState, AppDispatch } from '../store';

/**
 * Custom hook for authentication
 * Provides easy access to auth state and actions
 */
const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { user, token, isAuthenticated, isLoading, error } = useSelector((state: RootState) => state.auth);

  /**
   * Login function
   * @param {Object} credentials - User credentials
   */
  const login = useCallback(
    async (credentials: { email: string; password: string }) => {
      try {
        await dispatch(loginUser(credentials)).unwrap();
        router.push('/dashboard');
      } catch (err) {
        console.error('Login failed:', err);
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
    } catch (err) {
      console.error('Logout failed:', err);
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
