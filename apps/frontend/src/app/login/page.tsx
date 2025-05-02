'use client';

import React from 'react';
import LoginForm from '@/components/organisms/LoginForm';

/**
 * Login Page
 * Provides user authentication functionality
 */
const LoginPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">Samudra Paket ERP</h1>
          <p className="mt-2 text-sm text-gray-600">
            Sistem Enterprise Resource Planning PT. Sarana Mudah Raya
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;
