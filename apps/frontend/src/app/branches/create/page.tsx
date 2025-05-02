/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable react/jsx-filename-extension */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import BranchForm from '../../../components/organisms/BranchForm';
import Button from '../../../components/atoms/Button';
import AuthGuard from '../../../components/organisms/AuthGuard';

/**
 * CreateBranchPage - Page for creating a new branch
 */
function CreateBranchPage() {
  const router = useRouter();

  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/branches')}
            className="mr-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Kembali
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Tambah Cabang Baru</h1>
        </div>

        <BranchForm />
      </div>
    </AuthGuard>
  );
}

export default CreateBranchPage;
