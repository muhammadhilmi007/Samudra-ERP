'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Edit, ArrowLeft, Trash2, Briefcase, Building, Clock, User, Book, Award, CheckCircle } from 'lucide-react';
import positionService from '@/services/positionService';
import divisionService from '@/services/divisionService';
import Button from '@/components/atoms/Button';
import AuthGuard from '@/components/organisms/AuthGuard';
import DeleteConfirmationModal from '@/components/molecules/DeleteConfirmationModal';

interface PositionDetailPageProps {
  params: {
    id: string;
  };
}

/**
 * PositionDetailPage - Page for displaying detailed information about a position
 */
const PositionDetailPage: React.FC<PositionDetailPageProps> = ({ params }) => {
  const router = useRouter();
  const positionId = params.id;
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Fetch position details
  const { data: position, isLoading, error } = useQuery({
    queryKey: ['position', positionId],
    queryFn: () => positionService.getPositionById(positionId),
  });

  // Fetch division details if position has a division
  const { data: division } = useQuery({
    queryKey: ['division', position?.data?.division],
    queryFn: () => divisionService.getDivisionById(position?.data?.division as string),
    enabled: !!position?.data?.division,
  });

  // Fetch parent position details if position has a parent
  const { data: parentPosition } = useQuery({
    queryKey: ['parentPosition', position?.data?.parentPosition],
    queryFn: () => positionService.getPositionById(position?.data?.parentPosition as string),
    enabled: !!position?.data?.parentPosition,
  });

  // Handle delete position
  const handleDelete = async () => {
    try {
      await positionService.deletePosition(positionId);
      router.push('/positions');
    } catch (error) {
      console.error('Error deleting position:', error);
    } finally {
      setIsDeleteModalOpen(false);
    }
  };

  const getPositionLevelLabel = (level: number) => {
    switch (level) {
      case 0:
        return 'Direktur';
      case 1:
        return 'Manajer';
      case 2:
        return 'Supervisor';
      case 3:
        return 'Staff Senior';
      case 4:
        return 'Staff';
      case 5:
        return 'Staff Junior';
      default:
        return `Level ${level}`;
    }
  };

  if (isLoading) {
    return (
      <AuthGuard>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </AuthGuard>
    );
  }

  if (error || !position?.data) {
    return (
      <AuthGuard>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Jabatan tidak ditemukan</h2>
            <p className="text-gray-600 mb-6">
              Jabatan yang Anda cari tidak ditemukan atau telah dihapus.
            </p>
            <Button
              type="button"
              variant="primary"
              onClick={() => router.push('/positions')}
              className="flex items-center mx-auto"
            >
              <ArrowLeft className="h-5 w-5 mr-1" />
              Kembali ke Daftar Jabatan
            </Button>
          </div>
        </div>
      </AuthGuard>
    );
  }

  const positionData = position.data;

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
          <h1 className="text-2xl font-bold text-gray-900 flex-grow">
            Detail Jabatan: {positionData.title}
          </h1>
          <div className="flex space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/positions/edit/${positionId}`)}
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
          {/* Position Information */}
          <div className="bg-white rounded-lg shadow-sm p-6 md:col-span-2">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Briefcase className="h-5 w-5 mr-2 text-primary" />
              Informasi Jabatan
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Kode Jabatan</p>
                <p className="font-medium">{positionData.code}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Nama Jabatan</p>
                <p className="font-medium">{positionData.title}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Status</p>
                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  positionData.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {positionData.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Level</p>
                <p className="font-medium">
                  {getPositionLevelLabel(positionData.level || 0)}
                </p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-gray-500 mb-1">Deskripsi</p>
                <p className="font-medium">
                  {positionData.description || '-'}
                </p>
              </div>
            </div>

            <hr className="my-6" />

            <h3 className="text-lg font-semibold mb-4">Relasi</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Divisi</p>
                <p className="font-medium">
                  {division?.data ? (
                    <span className="flex items-center">
                      <Building className="h-4 w-4 mr-1 text-gray-400" />
                      {division.data.code} - {division.data.name}
                    </span>
                  ) : (
                    '-'
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Jabatan Atasan</p>
                <p className="font-medium">
                  {parentPosition?.data ? (
                    <span className="flex items-center">
                      <Briefcase className="h-4 w-4 mr-1 text-gray-400" />
                      {parentPosition.data.code} - {parentPosition.data.title}
                    </span>
                  ) : (
                    '-'
                  )}
                </p>
              </div>
            </div>

            {positionData.responsibilities && positionData.responsibilities.length > 0 && (
              <>
                <hr className="my-6" />
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Book className="h-5 w-5 mr-2 text-primary" />
                  Tanggung Jawab
                </h3>
                <ul className="list-disc pl-5 space-y-2">
                  {positionData.responsibilities.map((responsibility, index) => (
                    <li key={index} className="text-gray-700">{responsibility}</li>
                  ))}
                </ul>
              </>
            )}

            {positionData.requirements && (
              <>
                <hr className="my-6" />
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-primary" />
                  Persyaratan
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {positionData.requirements.education && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Pendidikan</p>
                      <p className="font-medium">{positionData.requirements.education}</p>
                    </div>
                  )}
                  {positionData.requirements.experience && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Pengalaman</p>
                      <p className="font-medium">{positionData.requirements.experience}</p>
                    </div>
                  )}
                </div>

                {positionData.requirements.skills && positionData.requirements.skills.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-500 mb-2">Keahlian</p>
                    <div className="flex flex-wrap gap-2">
                      {positionData.requirements.skills.map((skill, index) => (
                        <span 
                          key={index} 
                          className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {positionData.requirements.certifications && positionData.requirements.certifications.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-500 mb-2">Sertifikasi</p>
                    <div className="flex flex-wrap gap-2">
                      {positionData.requirements.certifications.map((certification, index) => (
                        <span 
                          key={index} 
                          className="bg-amber-50 text-amber-700 px-2 py-1 rounded-full text-xs flex items-center"
                        >
                          <Award className="h-3 w-3 mr-1" />
                          {certification}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            <hr className="my-6" />

            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Metadata</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Dibuat Pada</p>
                <p className="font-medium flex items-center">
                  <Clock className="h-4 w-4 mr-1 text-gray-400" />
                  {positionData.createdAt ? new Date(positionData.createdAt).toLocaleString('id-ID') : '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Terakhir Diperbarui</p>
                <p className="font-medium flex items-center">
                  <Clock className="h-4 w-4 mr-1 text-gray-400" />
                  {positionData.updatedAt ? new Date(positionData.updatedAt).toLocaleString('id-ID') : '-'}
                </p>
              </div>
            </div>
          </div>

          {/* Position Staff */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold flex items-center">
                <Users className="h-5 w-5 mr-2 text-primary" />
                Staff dengan Jabatan Ini
              </h2>
            </div>
            
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">Data staff belum tersedia</p>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/users')}
                className="text-sm"
              >
                Lihat Daftar Pengguna
              </Button>
            </div>
          </div>
        </div>

        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDelete}
          title="Hapus Jabatan"
          message="Apakah Anda yakin ingin menghapus jabatan ini? Tindakan ini tidak dapat dibatalkan dan akan menghapus semua data terkait jabatan ini."
        />
      </div>
    </AuthGuard>
  );
};

export default PositionDetailPage;
