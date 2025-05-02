'use client';

import React from 'react';
import ProfileForm from '@/components/organisms/ProfileForm';
import AuthGuard from '@/components/organisms/AuthGuard';

/**
 * Profile Page
 * Protected page for user profile management
 */
const ProfilePage = () => {
  return (
    <AuthGuard>
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Pengaturan Profil</h1>
          <ProfileForm />
        </div>
      </div>
    </AuthGuard>
  );
};

export default ProfilePage;
