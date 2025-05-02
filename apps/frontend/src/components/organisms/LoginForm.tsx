'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import FormField from '../molecules/FormField';
import Button from '../atoms/Button';
import useAuth from '@/hooks/useAuth';

/**
 * LoginForm - Form component for user authentication
 * Handles validation and submission of login credentials
 */
const loginSchema = z.object({
  email: z.string().email('Email tidak valid').min(1, 'Email harus diisi'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginForm: React.FC = () => {
  const { login, isLoading, error } = useAuth();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  
  const onSubmit = async (data: LoginFormValues) => {
    await login(data);
  };
  
  return (
    <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Login Samudra Paket</h2>
      
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
        
        <FormField
          label="Password"
          name="password"
          type="password"
          placeholder="Masukkan password Anda"
          error={errors.password?.message}
          register={register}
          required
        />
        
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <input
              id="remember"
              name="remember"
              type="checkbox"
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
              Ingat saya
            </label>
          </div>
          
          <a href="#" className="text-sm text-primary hover:text-primary/80">
            Lupa password?
          </a>
        </div>
        
        <Button
          type="submit"
          variant="primary"
          fullWidth
          disabled={isLoading}
        >
          {isLoading ? 'Memproses...' : 'Login'}
        </Button>
      </form>
    </div>
  );
};

export default LoginForm;
