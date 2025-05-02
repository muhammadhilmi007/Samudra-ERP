/* eslint-disable react/jsx-filename-extension */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable react/function-component-definition */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import branchService, { BranchListParams } from '../../services/branchService';
import BranchFilter from '../../components/molecules/BranchFilter';
import BranchTable from '../../components/organisms/BranchTable';
import Button from '../../components/atoms/Button';
import Pagination from '../../components/molecules/Pagination';
import AuthGuard from '../../components/organisms/AuthGuard';
import DeleteConfirmationModal from '../../components/molecules/DeleteConfirmationModal';

/**
 * BranchListPage - Page for displaying and managing branches
 */
const BranchListPage = () => {
  const router = useRouter();
  const [filters, setFilters] = useState<BranchListParams>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [branchToDelete, setBranchToDelete] = useState<string | null>(null);
  const [parentBranchOptions, setParentBranchOptions] = useState<Array<{ value: string; label: string }>>([]);

  // Fetch branches with pagination and filters
  const {
    data: branchesData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['branches', filters, currentPage, itemsPerPage],
    queryFn: () => branchService.getBranches({
      ...filters,
      page: currentPage,
      limit: itemsPerPage,
    }),
  });

  // Fetch all branches for parent branch filter options
  const { data: allBranches } = useQuery({
    queryKey: ['allBranches'],
    queryFn: () => branchService.getBranches({ limit: 100 }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Prepare parent branch options for filter dropdown
  useEffect(() => {
    if (allBranches?.data) {
      const options = allBranches.data.map((branch) => ({
        value: branch.id as string,
        label: `${branch.code} - ${branch.name}`,
      }));
      setParentBranchOptions(options);
    }
  }, [allBranches]);

  // Handle filter changes
  const handleFilterChange = useCallback((newFilters: BranchListParams) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  }, []);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle items per page change
  const handleItemsPerPageChange = (limit: number) => {
    setItemsPerPage(limit);
    setCurrentPage(1); // Reset to first page when limit changes
  };

  // Handle delete branch
  const handleDeleteClick = (id: string) => {
    setBranchToDelete(id);
    setIsDeleteModalOpen(true);
  };

  // Confirm delete branch
  const confirmDelete = async () => {
    if (branchToDelete) {
      try {
        await branchService.deleteBranch(branchToDelete);
        refetch(); // Refresh the data after deletion
      } catch (error) {
        console.error('Error deleting branch:', error);
      } finally {
        setIsDeleteModalOpen(false);
        setBranchToDelete(null);
      }
    }
  };

  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Daftar Cabang</h1>
          <Button
            type="button"
            variant="primary"
            onClick={() => router.push('/branches/create')}
            className="flex items-center"
          >
            <Plus className="h-5 w-5 mr-1" />
            Tambah Cabang
          </Button>
        </div>

        <BranchFilter
          onFilterChange={handleFilterChange}
          parentBranchOptions={parentBranchOptions}
        />

        <BranchTable
          branches={branchesData?.data || []}
          isLoading={isLoading}
          onDelete={handleDeleteClick}
        />

        {branchesData && branchesData.meta.total > 0 && (
          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalItems={branchesData.meta.total}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          </div>
        )}

        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={confirmDelete}
          title="Hapus Cabang"
          message="Apakah Anda yakin ingin menghapus cabang ini? Tindakan ini tidak dapat dibatalkan."
        />
      </div>
    </AuthGuard>
  );
};

export default BranchListPage;
