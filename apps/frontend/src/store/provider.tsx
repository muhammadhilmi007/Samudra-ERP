'use client';

import React, { useEffect, ReactNode } from 'react';
import { Provider } from 'react-redux';
import { store, dispatch } from './index';
import { checkAuthState } from './slices/authSlice';

interface ReduxProviderProps {
  children: ReactNode;
}

/**
 * Redux Provider component for Next.js
 * Wraps the application with Redux store and checks auth state on mount
 */
export function ReduxProvider({ children }: ReduxProviderProps) {
  useEffect(() => {
    // Check if user is already authenticated on app load
    dispatch(checkAuthState());
  }, []);

  return <Provider store={store}>{children}</Provider>;
}

export default ReduxProvider;
