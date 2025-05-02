'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import FormField from '../molecules/FormField';
import Button from '../atoms/Button';
import authService from '@/services/authService';

/**
 * ResetPasswordForm - Form component for resetting password
 * Handles validation and submission of new password
 */
const resetPasswordSchema = z.object({
  password: z.string().min(6, 'Password minimal 6 karakter'),
  confirmPassword: z.string().min(6, 'Konfirmasi password minimal 6 karakter'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Password tidak cocok',
  path: ['confirmPassword'],
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

interface ResetPasswordFormProps {
  token: string;
}

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ token }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });
  
  const onSubmit = async (data: ResetPasswordFormValues) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Call the reset password API
      await authService.resetPassword(token, data.password);
      
      // Show success message
      setIsSuccess(true);
      
      // Redirect to login page after 3 seconds
      setTimeout(() => {
        router.push('/login');
      }, 3000);
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
          <h3 className="mt-2 text-lg font-medium text-gray-900">Password berhasil diubah!</h3>
          <p className="mt-1 text-sm text-gray-600">
            Password Anda telah berhasil diubah. Anda akan diarahkan ke halaman login dalam beberapa detik.
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
          label="Password Baru"
          name="password"
          type="password"
          placeholder="Masukkan password baru"
          error={errors.password?.message}
          register={register}
          required
        />
        
        <FormField
          label="Konfirmasi Password"
          name="confirmPassword"
          type="password"
          placeholder="Konfirmasi password baru"
          error={errors.confirmPassword?.message}
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
            {isLoading ? 'Memproses...' : 'Reset Password'}
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

export default ResetPasswordForm;
