'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import employeeService from '@/services/employeeService';
import Button from '@/components/atoms/Button';
import EmployeeForm from '@/components/organisms/EmployeeForm';

interface EditEmployeePageProps {
  params: {
    id: string;
  };
}

/**
 * EditEmployeePage - Page component for editing an employee
 */
export default function EditEmployeePage({ params }: EditEmployeePageProps) {
  const router = useRouter();
  const { id } = params;

  // Fetch employee data
  const { data: employee, isLoading, isError, error } = useQuery({
    queryKey: ['employee', id],
    queryFn: () => employeeService.getEmployeeById(id),
    staleTime: 1 * 60 * 1000, // 1 minute
  });

  // Update employee mutation
  const updateEmployeeMutation = useMutation({
    mutationFn: (data: any) => employeeService.updateEmployee(id, data),
    onSuccess: () => {
      router.push(`/employees/${id}`);
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-500">Memuat data karyawan...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          <p>Terjadi kesalahan saat memuat data karyawan.</p>
          <p className="text-sm">{(error as Error)?.message || 'Unknown error'}</p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push('/employees')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali ke Daftar Karyawan
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push(`/employees/${id}`)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali ke Detail Karyawan
        </Button>
        <h1 className="text-2xl font-bold">Edit Karyawan</h1>
      </div>

      {employee && (
        <EmployeeForm 
          initialData={employee} 
          isEdit={true} 
        />
      )}
    </div>
  );
}
