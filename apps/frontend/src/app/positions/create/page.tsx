/* eslint-disable no-nested-ternary */
/* eslint-disable no-shadow */
/* eslint-disable react/jsx-filename-extension */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable react/function-component-definition */

'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import PositionForm from '../../../components/organisms/PositionForm';
import Button from '../../../components/atoms/Button';
import AuthGuard from '../../../components/organisms/AuthGuard';

/**
 * CreatePositionPage - Page for creating a new position
 */
const CreatePositionPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get division ID from query params if provided
  const divisionId = searchParams.get('division');

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
          <h1 className="text-2xl font-bold text-gray-900">Tambah Jabatan Baru</h1>
        </div>

        <PositionForm 
          initialData={divisionId ? { division: divisionId } as never : undefined}
        />
      </div>
    </AuthGuard>
  );
};

export default CreatePositionPage;
