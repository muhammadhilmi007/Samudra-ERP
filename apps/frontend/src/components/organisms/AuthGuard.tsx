'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import useAuth from '../../hooks/useAuth';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

/**
 * AuthGuard - Component to protect routes from unauthorized access
 * Redirects to login page if user is not authenticated
 * Can also check for specific roles if provided
 */
const AuthGuard: React.FC<AuthGuardProps> = ({ children, requiredRoles = [] }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Skip if still loading authentication state
    if (isLoading) return;

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      // Store the current path to redirect back after login
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('redirectAfterLogin', pathname);
      }
      router.push('/login');
      return;
    }

    // If roles are required, check if user has the required role
    if (requiredRoles.length > 0 && user) {
      const hasRequiredRole = requiredRoles.includes(user.role);
      if (!hasRequiredRole) {
        // Redirect to dashboard or unauthorized page
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, isLoading, user, router, pathname, requiredRoles]);

  // Show loading state or nothing while checking authentication
  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If role check is required but user doesn't have the required role
  if (requiredRoles.length > 0 && user && !requiredRoles.includes(user.role)) {
    return null; // Will be redirected by the useEffect
  }

  // Render children if authenticated and has required role
  return <>{children}</>;
};

export default AuthGuard;
