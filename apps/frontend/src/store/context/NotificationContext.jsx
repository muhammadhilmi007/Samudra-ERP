/**
 * Samudra Paket ERP - Notification Context
 * Provides a consistent way to show toast notifications throughout the application
 */

'use client';

import React, { createContext, useContext, useCallback } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Create notification context
const NotificationContext = createContext(undefined);

// Custom hook to use the notification context
export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}

// Notification provider component
export function NotificationProvider({ children }) {
  // Success notification
  const success = useCallback((message, options = {}) => {
    return toast.success(message, {
      position: 'top-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...options,
    });
  }, []);

  // Error notification
  const error = useCallback((message, options = {}) => {
    return toast.error(message, {
      position: 'top-right',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...options,
    });
  }, []);

  // Info notification
  const info = useCallback((message, options = {}) => {
    return toast.info(message, {
      position: 'top-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...options,
    });
  }, []);

  // Warning notification
  const warning = useCallback((message, options = {}) => {
    return toast.warning(message, {
      position: 'top-right',
      autoClose: 4000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...options,
    });
  }, []);

  // Custom notification
  const custom = useCallback((message, options = {}) => {
    return toast(message, {
      position: 'top-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...options,
    });
  }, []);

  // Dismiss notification
  const dismiss = useCallback(id => {
    if (id) {
      toast.dismiss(id);
    } else {
      toast.dismiss();
    }
  }, []);

  // Value object to be provided by the context
  const value = {
    success,
    error,
    info,
    warning,
    custom,
    dismiss,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </NotificationContext.Provider>
  );
}
