/* eslint-disable no-shadow */
/* eslint-disable react/jsx-filename-extension */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable react/function-component-definition */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Edit, ArrowLeft, Trash2, Building, Users, Clock, MapPin, User } from 'lucide-react';
import divisionService from '../../../services/divisionService';
import branchService from '../../../services/branchService';
import positionService from '../../../services/positionService';
import Button from '../../../components/atoms/Button';
import AuthGuard from '../../../components/organisms/AuthGuard';
import DeleteConfirmationModal from '../../../components/molecules/DeleteConfirmationModal';

interface DivisionDetailPageProps {
  params: {
    id: string;
  };
}

/**
 * DivisionDetailPage - Page for displaying detailed information about a division
 */
const DivisionDetailPage: React.FC<DivisionDetailPageProps> = ({ params }) => {
  const router = useRouter();
  const divisionId = params.id;
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Fetch division details
  const { data: division, isLoading, error } = useQuery({
    queryKey: ['division', divisionId],
    queryFn: () => divisionService.getDivisionById(divisionId),
  });

  // Fetch branch details if division has a branch
  const { data: branch } = useQuery({
    queryKey: ['branch', division?.data?.branch],
    queryFn: () => branchService.getBranchById(division?.data?.branch as string),
    enabled: !!division?.data?.branch,
  });

  // Fetch parent division details if division has a parent
  const { data: parentDivision } = useQuery({
    queryKey: ['parentDivision', division?.data?.parentDivision],
    queryFn: () => divisionService.getDivisionById(division?.data?.parentDivision as string),
    enabled: !!division?.data?.parentDivision,
  });

  // Fetch positions in this division
  const { data: positions } = useQuery({
    queryKey: ['divisionPositions', divisionId],
    queryFn: () => positionService.getPositions({ division: divisionId }),
    enabled: !!divisionId,
  });

  // Fetch head details if division has a head
  const { data: headUser } = useQuery({
    queryKey: ['headUser', division?.data?.head],
    queryFn: () => ({ data: { name: 'John Doe' } }), // TODO: Replace with actual user service call
    enabled: !!division?.data?.head,
  });

  // Handle delete division
  const handleDelete = async () => {
    try {
      await divisionService.deleteDivision(divisionId);
      router.push('/divisions');
    } catch (error) {
      console.error('Error deleting division:', error);
    } finally {
      setIsDeleteModalOpen(false);
    }
  };

  if (isLoading) {
    return (
      <AuthGuard>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-64 bg-gray-200 rounded" />
              <div className="h-64 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </AuthGuard>
    );
  }

  if (error || !division?.data) {
    return (
      <AuthGuard>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Divisi tidak ditemukan</h2>
            <p className="text-gray-600 mb-6">
              Divisi yang Anda cari tidak ditemukan atau telah dihapus.
            </p>
            <Button
              type="button"
              variant="primary"
              onClick={() => router.push('/divisions')}
              className="flex items-center mx-auto"
            >
              <ArrowLeft className="h-5 w-5 mr-1" />
              Kembali ke Daftar Divisi
            </Button>
          </div>
        </div>
      </AuthGuard>
    );
  }

  const divisionData = division.data;

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
          <h1 className="text-2xl font-bold text-gray-900 flex-grow">
            Detail Divisi: {divisionData.name}
          </h1>
          <div className="flex space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/divisions/edit/${divisionId}`)}
              className="flex items-center"
            >
              <Edit className="h-5 w-5 mr-1" />
              Edit
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={() => setIsDeleteModalOpen(true)}
              className="flex items-center"
            >
              <Trash2 className="h-5 w-5 mr-1" />
              Hapus
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Division Information */}
          <div className="bg-white rounded-lg shadow-sm p-6 md:col-span-2">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Building className="h-5 w-5 mr-2 text-primary" />
              Informasi Divisi
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Kode Divisi</p>
                <p className="font-medium">{divisionData.code}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Nama Divisi</p>
                <p className="font-medium">{divisionData.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Status</p>
                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  divisionData.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {divisionData.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Level</p>
                <p className="font-medium">
                  {divisionData.level === 0 && 'Divisi Utama'}
                  {divisionData.level === 1 && 'Sub Divisi'}
                  {divisionData.level === 2 && 'Departemen'}
                  {divisionData.level === 3 && 'Unit'}
                  {(divisionData.level === undefined || divisionData.level > 3) && `Level ${divisionData.level}`}
                </p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-gray-500 mb-1">Deskripsi</p>
                <p className="font-medium">
                  {divisionData.description || '-'}
                </p>
              </div>
            </div>

            <hr className="my-6" />

            <h3 className="text-lg font-semibold mb-4">Relasi</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Cabang</p>
                <p className="font-medium">
                  {branch?.data ? (
                    <span className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                      {branch.data.code} - {branch.data.name}
                    </span>
                  ) : (
                    '-'
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Divisi Induk</p>
                <p className="font-medium">
                  {parentDivision?.data ? (
                    <span className="flex items-center">
                      <Building className="h-4 w-4 mr-1 text-gray-400" />
                      {parentDivision.data.code} - {parentDivision.data.name}
                    </span>
                  ) : (
                    '-'
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Kepala Divisi</p>
                <p className="font-medium">
                  {headUser?.data ? (
                    <span className="flex items-center">
                      <User className="h-4 w-4 mr-1 text-gray-400" />
                      {headUser.data.name}
                    </span>
                  ) : (
                    '-'
                  )}
                </p>
              </div>
            </div>

            <hr className="my-6" />

            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Metadata</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Dibuat Pada</p>
                <p className="font-medium flex items-center">
                  <Clock className="h-4 w-4 mr-1 text-gray-400" />
                  {divisionData.createdAt ? new Date(divisionData.createdAt).toLocaleString('id-ID') : '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Terakhir Diperbarui</p>
                <p className="font-medium flex items-center">
                  <Clock className="h-4 w-4 mr-1 text-gray-400" />
                  {divisionData.updatedAt ? new Date(divisionData.updatedAt).toLocaleString('id-ID') : '-'}
                </p>
              </div>
            </div>
          </div>

          {/* Positions in Division */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold flex items-center">
                <Users className="h-5 w-5 mr-2 text-primary" />
                Jabatan dalam Divisi
              </h2>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/positions/create?division=${  divisionId}`)}
                className="text-sm"
              >
                Tambah Jabatan
              </Button>
            </div>
            
            {positions?.data && positions.data.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {positions.data.map((position) => (
                  <li key={position.id} className="py-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{position.title}</p>
                        <p className="text-sm text-gray-500">{position.code}</p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push(`/positions/${position.id}`)}
                        className="text-sm"
                      >
                        Detail
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">Belum ada jabatan dalam divisi ini</p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/positions/create?division=${  divisionId}`)}
                  className="text-sm"
                >
                  Tambah Jabatan Baru
                </Button>
              </div>
            )}
          </div>
        </div>

        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDelete}
          title="Hapus Divisi"
          message="Apakah Anda yakin ingin menghapus divisi ini? Tindakan ini tidak dapat dibatalkan dan akan menghapus semua data terkait divisi ini."
        />
      </div>
    </AuthGuard>
  );
};

export default DivisionDetailPage;
