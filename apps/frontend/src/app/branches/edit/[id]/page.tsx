/* eslint-disable react/jsx-filename-extension */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable react/function-component-definition */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import branchService from '../../../../services/branchService';
import BranchForm from '../../../../components/organisms/BranchForm';
import Button from '../../../../components/atoms/Button';
import AuthGuard from '../../../../components/organisms/AuthGuard';

interface EditBranchPageProps {
  params: {
    id: string;
  };
}

/**
 * EditBranchPage - Page for editing an existing branch
 */
const EditBranchPage: React.FC<EditBranchPageProps> = ({ params }) => {
  const { id } = params;
  const router = useRouter();

  // Fetch branch details
  const { data: branch, isLoading, isError } = useQuery({
    queryKey: ['branch', id],
    queryFn: () => branchService.getBranchById(id),
  });

  if (isLoading) {
    return (
      <AuthGuard>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6" />
            <div className="h-64 bg-gray-200 rounded" />
          </div>
        </div>
      </AuthGuard>
    );
  }

  if (isError || !branch) {
    return (
      <AuthGuard>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> Tidak dapat memuat data cabang. Silakan coba lagi nanti.</span>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/branches')}
            className="mt-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Kembali ke Daftar Cabang
          </Button>
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
            onClick={() => router.push(`/branches/${id}`)}
            className="mr-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Kembali
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">
            Edit Cabang: {branch.name} <span className="text-gray-500">({branch.code})</span>
          </h1>
        </div>

        <BranchForm initialData={branch} isEdit />
      </div>
    </AuthGuard>
  );
};

export default EditBranchPage;
