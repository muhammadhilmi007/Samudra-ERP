/* eslint-disable no-nested-ternary */
/* eslint-disable no-shadow */
/* eslint-disable react/jsx-filename-extension */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable react/function-component-definition */

'use client';

import React from 'react';
import { useSearchParams, redirect } from 'next/navigation';
import ResetPasswordForm from '../../components/organisms/ResetPasswordForm';

/**
 * Reset Password Page
 * Allows users to set a new password using a reset token
 */
const ResetPasswordPage = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  // If no token is provided, redirect to forgot password page
  if (!token) {
    redirect('/forgot-password');
    return null;
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">Reset Password</h1>
          <p className="mt-2 text-sm text-gray-600">
            Silakan masukkan password baru Anda
          </p>
        </div>
        <ResetPasswordForm token={token} />
      </div>
    </div>
  );
};

export default ResetPasswordPage;
