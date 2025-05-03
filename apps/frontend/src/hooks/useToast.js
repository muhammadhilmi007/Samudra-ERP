'use client';

import { useState, useCallback } from 'react';

/**
 * useToast - Custom hook for displaying toast notifications
 * Provides a simple interface for showing success, error, and info messages
 */
export function useToast() {
  const [toasts, setToasts] = useState([]);

  /**
   * Show a toast notification
   * @param {Object} options - Toast options
   * @param {string} options.title - Toast title
   * @param {string} options.description - Toast description
   * @param {string} options.variant - Toast variant (default, success, destructive)
   * @param {number} options.duration - Duration in ms (default: 5000)
   */
  const toast = useCallback(({ 
    title, 
    description, 
    variant = 'default', 
    duration = 5000 
  }) => {
    const id = Date.now().toString();
    
    // Add new toast to the array
    setToasts((prevToasts) => [
      ...prevToasts,
      { id, title, description, variant, duration },
    ]);
    
    // Remove toast after duration
    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
    }, duration);
    
    return id;
  }, []);
  
  /**
   * Remove a toast by ID
   * @param {string} id - Toast ID
   */
  const removeToast = useCallback((id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);
  
  return {
    toast,
    toasts,
    removeToast,
  };
}
