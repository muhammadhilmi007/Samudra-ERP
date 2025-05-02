/* eslint-disable no-nested-ternary */
/* eslint-disable no-shadow */
/* eslint-disable react/jsx-filename-extension */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable react/function-component-definition */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import positionService, { PositionListParams } from '../../services/positionService';
import branchService from '../../services/branchService';
import divisionService from '../../services/divisionService';
import PositionFilter from '../../components/molecules/PositionFilter';
import PositionTable from '../../components/organisms/PositionTable';
import Button from '../../components/atoms/Button';
import Pagination from '../../components/molecules/Pagination';
import AuthGuard from '../../components/organisms/AuthGuard';
import DeleteConfirmationModal from '../../components/molecules/DeleteConfirmationModal';

/**
 * PositionListPage - Page for displaying and managing positions
 */
const PositionListPage = () => {
  const router = useRouter();
  const [filters, setFilters] = useState<PositionListParams>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [positionToDelete, setPositionToDelete] = useState<string | null>(null);
  const [branchOptions, setBranchOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [divisionOptions, setDivisionOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [parentPositionOptions, setParentPositionOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [divisionNames, setDivisionNames] = useState<Record<string, string>>({});

  // Fetch positions with pagination and filters
  const {
    data: positionsData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['positions', filters, currentPage, itemsPerPage],
    queryFn: () => positionService.getPositions({
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

  // Fetch all divisions for division filter options
  const { data: allDivisions } = useQuery({
    queryKey: ['allDivisions'],
    queryFn: () => divisionService.getDivisions({ limit: 100 }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch all positions for parent position filter options
  const { data: allPositions } = useQuery({
    queryKey: ['allPositions'],
    queryFn: () => positionService.getPositions({ limit: 100 }),
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
    }
  }, [allBranches]);

  // Prepare division options for filter dropdown and create division name mapping
  useEffect(() => {
    if (allDivisions?.data) {
      const options = allDivisions.data.map((division) => ({
        value: division.id as string,
        label: `${division.code} - ${division.name}`,
      }));
      setDivisionOptions(options);

      // Create a mapping of division IDs to division names
      const divisionNameMap: Record<string, string> = {};
      allDivisions.data.forEach((division) => {
        if (division.id) {
          divisionNameMap[division.id] = `${division.code} - ${division.name}`;
        }
      });
      setDivisionNames(divisionNameMap);
    }
  }, [allDivisions]);

  // Prepare parent position options for filter dropdown
  useEffect(() => {
    if (allPositions?.data) {
      const options = allPositions.data.map((position) => ({
        value: position.id as string,
        label: `${position.code} - ${position.title}`,
      }));
      setParentPositionOptions(options);
    }
  }, [allPositions]);

  // Handle filter changes
  const handleFilterChange = useCallback((newFilters: PositionListParams) => {
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

  // Handle delete position
  const handleDeleteClick = (id: string) => {
    setPositionToDelete(id);
    setIsDeleteModalOpen(true);
  };

  // Confirm delete position
  const confirmDelete = async () => {
    if (positionToDelete) {
      try {
        await positionService.deletePosition(positionToDelete);
        refetch(); // Refresh the data after deletion
      } catch (error) {
        console.error('Error deleting position:', error);
      } finally {
        setIsDeleteModalOpen(false);
        setPositionToDelete(null);
      }
    }
  };

  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Daftar Jabatan</h1>
          <Button
            type="button"
            variant="primary"
            onClick={() => router.push('/positions/create')}
            className="flex items-center"
          >
            <Plus className="h-5 w-5 mr-1" />
            Tambah Jabatan
          </Button>
        </div>

        <PositionFilter
          onFilterChange={handleFilterChange}
          branchOptions={branchOptions}
          divisionOptions={divisionOptions}
          parentPositionOptions={parentPositionOptions}
        />

        <PositionTable
          positions={positionsData?.data || []}
          isLoading={isLoading}
          onDelete={handleDeleteClick}
          divisionNames={divisionNames}
        />

        {positionsData && positionsData.meta.total > 0 && (
          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalItems={positionsData.meta.total}
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
          title="Hapus Jabatan"
          message="Apakah Anda yakin ingin menghapus jabatan ini? Tindakan ini tidak dapat dibatalkan dan akan menghapus semua data terkait jabatan ini."
        />
      </div>
    </AuthGuard>
  );
};

export default PositionListPage;
