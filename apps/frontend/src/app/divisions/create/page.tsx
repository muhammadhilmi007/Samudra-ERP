/* eslint-disable no-shadow */
/* eslint-disable react/jsx-filename-extension */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable react/function-component-definition */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import DivisionForm from '../../../components/organisms/DivisionForm';
import Button from '../../../components/atoms/Button';
import AuthGuard from '../../../components/organisms/AuthGuard';

/**
 * CreateDivisionPage - Page for creating a new division
 */
const CreateDivisionPage = () => {
  const router = useRouter();

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
          <h1 className="text-2xl font-bold text-gray-900">Tambah Divisi Baru</h1>
        </div>

        <DivisionForm />
      </div>
    </AuthGuard>
  );
};

export default CreateDivisionPage;
