'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Button from '../atoms/Button';
import useAuth from '@/hooks/useAuth';

interface LogoutButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  className?: string;
}

/**
 * LogoutButton - Component for handling user logout
 * Provides a button that triggers the logout process
 */
const LogoutButton: React.FC<LogoutButtonProps> = ({ 
  variant = 'text',
  className = ''
}) => {
  const { logout, isLoading } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <Button
      type="button"
      variant={variant}
      onClick={handleLogout}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? 'Memproses...' : 'Logout'}
    </Button>
  );
};

export default LogoutButton;
