/* eslint-disable no-nested-ternary */
/* eslint-disable no-shadow */
/* eslint-disable react/jsx-filename-extension */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable react/function-component-definition */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { UserPlus } from 'lucide-react';
import employeeService, { EmployeeListParams } from '../../services/employeeService';
import Button from '../../components/atoms/Button';
import EmployeeFilter from '../../components/molecules/EmployeeFilter';
import EmployeeTable from '../../components/organisms/EmployeeTable';
import DeleteConfirmationModal from '../../components/molecules/DeleteConfirmationModal';

/**
 * EmployeesPage - Page component for listing employees
 */
export default function EmployeesPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<EmployeeListParams>({});
  const [deleteEmployeeId, setDeleteEmployeeId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Fetch employees with pagination and filtering
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['employees', page, filters],
    queryFn: () => employeeService.getEmployees({ page, limit: 10, ...filters }),
    staleTime: 1 * 60 * 1000, // 1 minute
  });

  // Handle filter change
  const handleFilterChange = (newFilters: EmployeeListParams) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page when filters change
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // Handle employee deletion
  const handleDeleteEmployee = async () => {
    if (!deleteEmployeeId) return;

    try {
      await employeeService.deleteEmployee(deleteEmployeeId);
      refetch();
      setIsDeleteModalOpen(false);
      setDeleteEmployeeId(null);
    } catch (err) {
      console.error('Error deleting employee:', err);
      // TODO: Show error message
    }
  };

  // Open delete confirmation modal
  const openDeleteModal = (id: string) => {
    setDeleteEmployeeId(id);
    setIsDeleteModalOpen(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manajemen Karyawan</h1>
        <Button
          variant="primary"
          onClick={() => router.push('/employees/create')}
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Tambah Karyawan
        </Button>
      </div>

      <EmployeeFilter onFilter={handleFilterChange} />

      {isLoading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          <p className="mt-2 text-gray-500">Memuat data karyawan...</p>
        </div>
      ) : isError ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          <p>Terjadi kesalahan saat memuat data karyawan.</p>
          <p className="text-sm">{(error as Error)?.message || 'Unknown error'}</p>
        </div>
      ) : (
        <EmployeeTable
          employees={data?.data || []}
          meta={data?.meta || { total: 0, page: 1, limit: 10, totalPages: 1 }}
          onPageChange={handlePageChange}
          onDelete={openDeleteModal}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteEmployee}
        title="Hapus Karyawan"
        message="Apakah Anda yakin ingin menghapus karyawan ini? Tindakan ini tidak dapat dibatalkan."
      />
    </div>
  );
}
