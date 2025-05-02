'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import FormField from '../molecules/FormField';
import Button from '../atoms/Button';
import authService from '../../services/authService';

/**
 * ForgotPasswordForm - Form component for requesting password reset
 * Handles validation and submission of email for password reset
 */
const forgotPasswordSchema = z.object({
  email: z.string().email('Email tidak valid').min(1, 'Email harus diisi'),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

const ForgotPasswordForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });
  
  const onSubmit = async (data: ForgotPasswordFormValues) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Call the forgot password API
      await authService.forgotPassword(data.email);
      
      // Show success message
      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isSuccess) {
    return (
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
        <div className="text-center">
          <svg 
            className="mx-auto h-12 w-12 text-green-500" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">Email terkirim!</h3>
          <p className="mt-1 text-sm text-gray-600">
            Kami telah mengirimkan instruksi reset password ke email Anda. 
            Silakan periksa kotak masuk Anda.
          </p>
          <div className="mt-6">
            <Link 
              href="/login"
              className="text-sm font-medium text-primary hover:text-primary/80"
            >
              Kembali ke halaman login
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Reset Password</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormField
          label="Email"
          name="email"
          type="email"
          placeholder="Masukkan email Anda"
          error={errors.email?.message}
          register={register}
          required
        />
        
        <div className="mt-6">
          <Button
            type="submit"
            variant="primary"
            fullWidth
            disabled={isLoading}
          >
            {isLoading ? 'Memproses...' : 'Kirim Link Reset'}
          </Button>
        </div>
        
        <div className="mt-4 text-center">
          <Link 
            href="/login"
            className="text-sm font-medium text-primary hover:text-primary/80"
          >
            Kembali ke halaman login
          </Link>
        </div>
      </form>
    </div>
  );
};

export default ForgotPasswordForm;
