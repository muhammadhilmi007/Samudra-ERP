'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import divisionService, { Division, DivisionListParams } from '@/services/divisionService';
import branchService from '@/services/branchService';
import DivisionFilter from '@/components/molecules/DivisionFilter';
import DivisionTable from '@/components/organisms/DivisionTable';
import Button from '@/components/atoms/Button';
import Pagination from '@/components/molecules/Pagination';
import AuthGuard from '@/components/organisms/AuthGuard';
import DeleteConfirmationModal from '@/components/molecules/DeleteConfirmationModal';

/**
 * DivisionListPage - Page for displaying and managing divisions
 */
const DivisionListPage = () => {
  const router = useRouter();
  const [filters, setFilters] = useState<DivisionListParams>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [divisionToDelete, setDivisionToDelete] = useState<string | null>(null);
  const [branchOptions, setBranchOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [parentDivisionOptions, setParentDivisionOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [branchNames, setBranchNames] = useState<Record<string, string>>({});

  // Fetch divisions with pagination and filters
  const {
    data: divisionsData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['divisions', filters, currentPage, itemsPerPage],
    queryFn: () => divisionService.getDivisions({
      ...filters,
      page: currentPage,
      limit: itemsPerPage,
    }),
  });

  // Fetch all branches for branch filter options
  const { data: allBranches } = useQuery({
    queryKey: ['allBranches'],
    queryFn: () => branchService.getBranches({ limit: 100 }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch all divisions for parent division filter options
  const { data: allDivisions } = useQuery({
    queryKey: ['allDivisions'],
    queryFn: () => divisionService.getDivisions({ limit: 100 }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Prepare branch options for filter dropdown
  useEffect(() => {
    if (allBranches?.data) {
      const options = allBranches.data.map((branch) => ({
        value: branch.id as string,
        label: `${branch.code} - ${branch.name}`,
      }));
      setBranchOptions(options);

      // Create a mapping of branch IDs to branch names
      const branchNameMap: Record<string, string> = {};
      allBranches.data.forEach((branch) => {
        if (branch.id) {
          branchNameMap[branch.id] = `${branch.code} - ${branch.name}`;
        }
      });
      setBranchNames(branchNameMap);
    }
  }, [allBranches]);

  // Prepare parent division options for filter dropdown
  useEffect(() => {
    if (allDivisions?.data) {
      const options = allDivisions.data.map((division) => ({
        value: division.id as string,
        label: `${division.code} - ${division.name}`,
      }));
      setParentDivisionOptions(options);
    }
  }, [allDivisions]);

  // Handle filter changes
  const handleFilterChange = useCallback((newFilters: DivisionListParams) => {
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

  // Handle delete division
  const handleDeleteClick = (id: string) => {
    setDivisionToDelete(id);
    setIsDeleteModalOpen(true);
  };

  // Confirm delete division
  const confirmDelete = async () => {
    if (divisionToDelete) {
      try {
        await divisionService.deleteDivision(divisionToDelete);
        refetch(); // Refresh the data after deletion
      } catch (error) {
        console.error('Error deleting division:', error);
      } finally {
        setIsDeleteModalOpen(false);
        setDivisionToDelete(null);
      }
    }
  };

  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Daftar Divisi</h1>
          <Button
            type="button"
            variant="primary"
            onClick={() => router.push('/divisions/create')}
            className="flex items-center"
          >
            <Plus className="h-5 w-5 mr-1" />
            Tambah Divisi
          </Button>
        </div>

        <DivisionFilter
          onFilterChange={handleFilterChange}
          branchOptions={branchOptions}
          parentDivisionOptions={parentDivisionOptions}
        />

        <DivisionTable
          divisions={divisionsData?.data || []}
          isLoading={isLoading}
          onDelete={handleDeleteClick}
          branchNames={branchNames}
        />

        {divisionsData && divisionsData.meta.total > 0 && (
          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalItems={divisionsData.meta.total}
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
          title="Hapus Divisi"
          message="Apakah Anda yakin ingin menghapus divisi ini? Tindakan ini tidak dapat dibatalkan dan akan menghapus semua data terkait divisi ini."
        />
      </div>
    </AuthGuard>
  );
};

export default DivisionListPage;
