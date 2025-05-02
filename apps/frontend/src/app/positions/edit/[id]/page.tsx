/* eslint-disable no-nested-ternary */
/* eslint-disable no-shadow */
/* eslint-disable react/jsx-filename-extension */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable react/function-component-definition */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import positionService from '../../../../services/positionService';
import PositionForm from '../../../../components/organisms/PositionForm';
import Button from '../../../../components/atoms/Button';
import AuthGuard from '../../../../components/organisms/AuthGuard';

interface EditPositionPageProps {
  params: {
    id: string;
  };
}

/**
 * EditPositionPage - Page for editing an existing position
 */
const EditPositionPage: React.FC<EditPositionPageProps> = ({ params }) => {
  const router = useRouter();
  const positionId = params.id;

  // Fetch position data
  const { data: position, isLoading, error } = useQuery({
    queryKey: ['position', positionId],
    queryFn: () => positionService.getPositionById(positionId),
  });

  if (isLoading) {
    return (
      <AuthGuard>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center mb-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/positions')}
              className="mr-4"
            >
              <ArrowLeft className="h-5 w-5 mr-1" />
              Kembali
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Edit Jabatan</h1>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-6" />
              <div className="h-64 bg-gray-200 rounded mb-4" />
              <div className="h-12 bg-gray-200 rounded w-1/3 ml-auto" />
            </div>
          </div>
        </div>
      </AuthGuard>
    );
  }

  if (error || !position?.data) {
    return (
      <AuthGuard>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Jabatan tidak ditemukan</h2>
            <p className="text-gray-600 mb-6">
              Jabatan yang Anda cari tidak ditemukan atau telah dihapus.
            </p>
            <Button
              type="button"
              variant="primary"
              onClick={() => router.push('/positions')}
              className="flex items-center mx-auto"
            >
              <ArrowLeft className="h-5 w-5 mr-1" />
              Kembali ke Daftar Jabatan
            </Button>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="mr-4"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            Kembali
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">
            Edit Jabatan: {position.data.title}
          </h1>
        </div>

        <PositionForm initialData={position.data} isEdit />
      </div>
    </AuthGuard>
  );
};

export default EditPositionPage;
