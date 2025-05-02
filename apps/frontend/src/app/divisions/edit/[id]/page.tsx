/* eslint-disable no-shadow */
/* eslint-disable react/jsx-filename-extension */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable react/function-component-definition */


'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import divisionService from '../../../../services/divisionService';
import DivisionForm from '../../../../components/organisms/DivisionForm';
import Button from '../../../../components/atoms/Button';
import AuthGuard from '../../../../components/organisms/AuthGuard';

interface EditDivisionPageProps {
  params: {
    id: string;
  };
}

/**
 * EditDivisionPage - Page for editing an existing division
 */
const EditDivisionPage: React.FC<EditDivisionPageProps> = ({ params }) => {
  const router = useRouter();
  const divisionId = params.id;

  // Fetch division data
  const { data: division, isLoading, error } = useQuery({
    queryKey: ['division', divisionId],
    queryFn: () => divisionService.getDivisionById(divisionId),
  });

  if (isLoading) {
    return (
      <AuthGuard>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center mb-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/divisions')}
              className="mr-4"
            >
              <ArrowLeft className="h-5 w-5 mr-1" />
              Kembali
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Edit Divisi</h1>
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

  if (error || !division?.data) {
    return (
      <AuthGuard>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Divisi tidak ditemukan</h2>
            <p className="text-gray-600 mb-6">
              Divisi yang Anda cari tidak ditemukan atau telah dihapus.
            </p>
            <Button
              type="button"
              variant="primary"
              onClick={() => router.push('/divisions')}
              className="flex items-center mx-auto"
            >
              <ArrowLeft className="h-5 w-5 mr-1" />
              Kembali ke Daftar Divisi
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
            Edit Divisi: {division.data.name}
          </h1>
        </div>

        <DivisionForm initialData={division.data} isEdit />
      </div>
    </AuthGuard>
  );
};

export default EditDivisionPage;
