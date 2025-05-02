'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import employeeService from '@/services/employeeService';
import Button from '@/components/atoms/Button';
import EmployeeForm from '@/components/organisms/EmployeeForm';

/**
 * CreateEmployeePage - Page component for creating a new employee
 */
export default function CreateEmployeePage() {
  const router = useRouter();

  // Create employee mutation
  const createEmployeeMutation = useMutation({
    mutationFn: employeeService.createEmployee,
    onSuccess: () => {
      router.push('/employees');
    },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push('/employees')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali ke Daftar Karyawan
        </Button>
        <h1 className="text-2xl font-bold">Tambah Karyawan Baru</h1>
      </div>

      <EmployeeForm />
    </div>
  );
}
