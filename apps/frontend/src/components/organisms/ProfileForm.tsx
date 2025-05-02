'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import FormField from '../molecules/FormField';
import Button from '../atoms/Button';
import useAuth from '../../hooks/useAuth';
import authService from '../../services/authService';

/**
 * ProfileForm - Form component for user profile management
 * Handles validation and submission of profile updates
 */
const profileSchema = z.object({
  name: z.string().min(3, 'Nama minimal 3 karakter'),
  email: z.string().email('Email tidak valid'),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6, 'Password minimal 6 karakter').optional(),
  confirmPassword: z.string().optional(),
}).refine((data) => {
  // If new password is provided, current password is required
  if (data.newPassword && !data.currentPassword) {
    return false;
  }
  return true;
}, {
  message: 'Password saat ini diperlukan untuk mengubah password',
  path: ['currentPassword'],
}).refine((data) => {
  // If new password is provided, confirm password must match
  if (data.newPassword && data.newPassword !== data.confirmPassword) {
    return false;
  }
  return true;
}, {
  message: 'Password baru tidak cocok dengan konfirmasi password',
  path: ['confirmPassword'],
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const ProfileForm: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      email: '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });
  
  // Update form with user data when available
  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        email: user.email,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    }
  }, [user, reset]);
  
  const onSubmit = async (data: ProfileFormValues) => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);
      
      // Prepare update data
      const updateData: Record<string, any> = {
        name: data.name,
      };
      
      // Only include password fields if new password is provided
      if (data.newPassword) {
        updateData.currentPassword = data.currentPassword;
        updateData.newPassword = data.newPassword;
      }
      
      // Call update profile API
      await authService.updateProfile(updateData);
      
      setSuccess('Profil berhasil diperbarui');
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (authLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Profil Pengguna</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormField
          label="Nama"
          name="name"
          type="text"
          placeholder="Masukkan nama Anda"
          error={errors.name?.message}
          register={register}
          required
        />
        
        <FormField
          label="Email"
          name="email"
          type="email"
          placeholder="Masukkan email Anda"
          error={errors.email?.message}
          register={register}
          required
          disabled
        />
        
        <div className="mt-8 mb-4">
          <h3 className="text-lg font-medium text-gray-700 mb-2">Ubah Password</h3>
          <p className="text-sm text-gray-500 mb-4">Biarkan kosong jika tidak ingin mengubah password</p>
        </div>
        
        <FormField
          label="Password Saat Ini"
          name="currentPassword"
          type="password"
          placeholder="Masukkan password saat ini"
          error={errors.currentPassword?.message}
          register={register}
        />
        
        <FormField
          label="Password Baru"
          name="newPassword"
          type="password"
          placeholder="Masukkan password baru"
          error={errors.newPassword?.message}
          register={register}
        />
        
        <FormField
          label="Konfirmasi Password Baru"
          name="confirmPassword"
          type="password"
          placeholder="Konfirmasi password baru"
          error={errors.confirmPassword?.message}
          register={register}
        />
        
        <div className="mt-6">
          <Button
            type="submit"
            variant="primary"
            fullWidth
            disabled={isLoading}
          >
            {isLoading ? 'Memproses...' : 'Simpan Perubahan'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProfileForm;
