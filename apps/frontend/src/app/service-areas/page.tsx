/* eslint-disable react/no-array-index-key */
/* eslint-disable no-nested-ternary */
/* eslint-disable no-shadow */
/* eslint-disable react/jsx-filename-extension */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable react/function-component-definition */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Search } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import branchService from '../../services/branchService';
import Button from '../../components/atoms/Button';
import AuthGuard from '../../components/organisms/AuthGuard';
import DeleteConfirmationModal from '../../components/molecules/DeleteConfirmationModal';

/**
 * ServiceAreasPage - Page for managing service areas
 */
const ServiceAreasPage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [newArea, setNewArea] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [areaToDelete, setAreaToDelete] = useState<string | null>(null);

  // Fetch service areas
  const { data: serviceAreas, isLoading } = useQuery({
    queryKey: ['serviceAreas'],
    queryFn: () => branchService.getServiceAreas(),
  });

  // Add service area mutation
  const addAreaMutation = useMutation({
    mutationFn: (area: string) => branchService.addServiceArea(area),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serviceAreas'] });
      setNewArea('');
    },
  });

  // Remove service area mutation
  const removeAreaMutation = useMutation({
    mutationFn: (area: string) => branchService.removeServiceArea(area),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serviceAreas'] });
      setIsDeleteModalOpen(false);
      setAreaToDelete(null);
    },
  });

  // Handle add service area
  const handleAddArea = () => {
    if (newArea.trim() === '') return;
    addAreaMutation.mutate(newArea.trim());
  };

  // Handle delete click
  const handleDeleteClick = (area: string) => {
    setAreaToDelete(area);
    setIsDeleteModalOpen(true);
  };

  // Confirm delete
  const confirmDelete = () => {
    if (areaToDelete) {
      removeAreaMutation.mutate(areaToDelete);
    }
  };

  // Filter service areas based on search term
  const filteredAreas = serviceAreas
    ? serviceAreas.filter((area) => 
        area.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Area Layanan</h1>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/branches')}
          >
            Kembali ke Cabang
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Tambah Area Layanan Baru</h2>
          <div className="flex">
            <input
              type="text"
              value={newArea}
              onChange={(e) => setNewArea(e.target.value)}
              placeholder="Masukkan nama area layanan"
              className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-primary focus:border-primary"
            />
            <Button
              type="button"
              variant="primary"
              onClick={handleAddArea}
              disabled={addAreaMutation.isPending || newArea.trim() === ''}
              className="rounded-l-none"
            >
              {addAreaMutation.isPending ? 'Menambahkan...' : (
                <>
                  <Plus className="h-5 w-5 mr-1" />
                  Tambah Area
                </>
              )}
            </Button>
          </div>
          {addAreaMutation.isError && (
            <p className="mt-2 text-sm text-red-600">
              Gagal menambahkan area. Silakan coba lagi.
            </p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Daftar Area Layanan</h2>
            <div className="relative w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Cari area..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="animate-pulse">
              {[...Array(5)].map((_, index) => (
                // eslint-disable-next-line react/no-array-index-key
                <div key={index} className="h-12 bg-gray-200 rounded-md mb-2" />
              ))}
            </div>
          ) : filteredAreas.length > 0 ? (
            <div className="border border-gray-200 rounded-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nama Area
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAreas.map((area, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {area}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          type="button"
                          onClick={() => handleDeleteClick(area)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {searchTerm ? 'Tidak ada area layanan yang sesuai dengan pencarian.' : 'Belum ada area layanan yang ditambahkan.'}
              </p>
            </div>
          )}
        </div>

        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={confirmDelete}
          title="Hapus Area Layanan"
          message={`Apakah Anda yakin ingin menghapus area layanan "${areaToDelete}"? Tindakan ini tidak dapat dibatalkan.`}
        />
      </div>
    </AuthGuard>
  );
};

export default ServiceAreasPage;
