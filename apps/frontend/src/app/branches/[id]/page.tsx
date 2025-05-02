/* eslint-disable react/jsx-filename-extension */
/* eslint-disable react/function-component-definition */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
// eslint-disable-next-line import/no-extraneous-dependencies
import {
  ArrowLeft,
  Edit,
  Trash2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Calendar,
  Users,
  Building,
} from 'lucide-react';
import branchService from '../../../services/branchService';
import Button from '../../../components/atoms/Button';
import AuthGuard from '../../../components/organisms/AuthGuard';
import DeleteConfirmationModal from '../../../components/molecules/DeleteConfirmationModal';

interface BranchDetailPageProps {
  params: {
    id: string;
  };
}

/**
 * BranchDetailPage - Page for displaying detailed information about a branch
 */
const BranchDetailPage: React.FC<BranchDetailPageProps> = ({ params }) => {
  const { id } = params;
  const router = useRouter();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);

  // Fetch branch details
  const {
    data: branch,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['branch', id],
    queryFn: () => branchService.getBranchById(id),
  });

  // Handle delete branch
  const handleDelete = async () => {
    try {
      await branchService.deleteBranch(id);
      router.push('/branches');
    } catch (error) {
      console.error('Error deleting branch:', error);
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

  if (isError || !branch) {
    return (
      <AuthGuard>
        <div className="container mx-auto px-4 py-8">
          <div
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline">
              {' '}
              Tidak dapat memuat data cabang. Silakan coba lagi nanti.
            </span>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/branches')}
            className="mt-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Kembali ke Daftar Cabang
          </Button>
        </div>
      </AuthGuard>
    );
  }

  // Format operational hours
  const formatTime = (time: string | undefined) => {
    if (!time) return '-';
    return time;
  };

  // Get branch level label
  const getBranchLevelLabel = (level: number) => {
    switch (level) {
      case 0:
        return 'Kantor Pusat';
      case 1:
        return 'Regional';
      case 2:
        return 'Cabang';
      case 3:
        return 'Sub-Cabang';
      default:
        return `Level ${level}`;
    }
  };

  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/branches')}
              className="mr-4"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Kembali
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">
              {branch.name} <span className="text-gray-500">({branch.code})</span>
            </h1>
          </div>
          <div className="flex space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/branches/edit/${id}`)}
              className="flex items-center"
            >
              <Edit className="h-5 w-5 mr-2" />
              Edit
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={() => setIsDeleteModalOpen(true)}
              className="flex items-center"
            >
              <Trash2 className="h-5 w-5 mr-2" />
              Hapus
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Branch Information */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Informasi Cabang</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Kode Cabang</p>
                  <p className="font-medium">{branch.code}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Nama Cabang</p>
                  <p className="font-medium">{branch.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Level</p>
                  <p className="font-medium">{getBranchLevelLabel(branch.level || 0)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      branch.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {branch.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                  </span>
                </div>
                {branch.parentBranch && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-500">Cabang Induk</p>
                    <p className="font-medium">{branch.parentBranch}</p>
                  </div>
                )}
                {branch.metadata?.establishedDate && (
                  <div>
                    <p className="text-sm text-gray-500">Tanggal Pendirian</p>
                    <p className="font-medium flex items-center">
                      <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                      {new Date(branch.metadata.establishedDate).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                )}
                {branch.metadata?.capacity && (
                  <div>
                    <p className="text-sm text-gray-500">Kapasitas</p>
                    <p className="font-medium flex items-center">
                      <Users className="h-4 w-4 mr-1 text-gray-400" />
                      {branch.metadata.capacity} orang
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Address Information */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Alamat</h2>
              <div className="mb-4">
                <p className="text-sm text-gray-500">Alamat Lengkap</p>
                <p className="font-medium flex items-start">
                  <MapPin className="h-5 w-5 mr-2 text-gray-400 mt-0.5" />
                  <span>
                    {branch.address.street}, {branch.address.city}, {branch.address.province},{' '}
                    {branch.address.postalCode}, {branch.address.country}
                  </span>
                </p>
              </div>
              {branch.address.coordinates && (
                <div>
                  <p className="text-sm text-gray-500">Koordinat</p>
                  <p className="font-medium">
                    Lat: {branch.address.coordinates.latitude}, Long:{' '}
                    {branch.address.coordinates.longitude}
                  </p>
                </div>
              )}
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Kontak</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Telepon</p>
                  <p className="font-medium flex items-center">
                    <Phone className="h-4 w-4 mr-1 text-gray-400" />
                    {branch.contactInfo.phone}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium flex items-center">
                    <Mail className="h-4 w-4 mr-1 text-gray-400" />
                    {branch.contactInfo.email}
                  </p>
                </div>
                {branch.contactInfo.fax && (
                  <div>
                    <p className="text-sm text-gray-500">Fax</p>
                    <p className="font-medium">{branch.contactInfo.fax}</p>
                  </div>
                )}
                {branch.contactInfo.website && (
                  <div>
                    <p className="text-sm text-gray-500">Website</p>
                    <p className="font-medium flex items-center">
                      <Globe className="h-4 w-4 mr-1 text-gray-400" />
                      <a
                        href={branch.contactInfo.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {branch.contactInfo.website}
                      </a>
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Service Areas */}
            {branch.metadata?.serviceArea && branch.metadata.serviceArea.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Area Layanan</h2>
                <div className="flex flex-wrap gap-2">
                  {branch.metadata.serviceArea.map((area, index) => (
                    <span
                      // eslint-disable-next-line react/no-array-index-key
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {branch.metadata?.notes && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Catatan</h2>
                <p className="text-gray-700">{branch.metadata.notes}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="md:col-span-1">
            {/* Operational Hours */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Jam Operasional</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Senin</span>
                  <span>
                    {branch.operationalHours?.monday
                      ? `${formatTime(branch.operationalHours.monday.open)} - ${formatTime(branch.operationalHours.monday.close)}`
                      : 'Tutup'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Selasa</span>
                  <span>
                    {branch.operationalHours?.tuesday
                      ? `${formatTime(branch.operationalHours.tuesday.open)} - ${formatTime(branch.operationalHours.tuesday.close)}`
                      : 'Tutup'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Rabu</span>
                  <span>
                    {branch.operationalHours?.wednesday
                      ? `${formatTime(branch.operationalHours.wednesday.open)} - ${formatTime(branch.operationalHours.wednesday.close)}`
                      : 'Tutup'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Kamis</span>
                  <span>
                    {branch.operationalHours?.thursday
                      ? `${formatTime(branch.operationalHours.thursday.open)} - ${formatTime(branch.operationalHours.thursday.close)}`
                      : 'Tutup'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Jumat</span>
                  <span>
                    {branch.operationalHours?.friday
                      ? `${formatTime(branch.operationalHours.friday.open)} - ${formatTime(branch.operationalHours.friday.close)}`
                      : 'Tutup'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Sabtu</span>
                  <span>
                    {branch.operationalHours?.saturday
                      ? `${formatTime(branch.operationalHours.saturday.open)} - ${formatTime(branch.operationalHours.saturday.close)}`
                      : 'Tutup'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Minggu</span>
                  <span>
                    {branch.operationalHours?.sunday
                      ? `${formatTime(branch.operationalHours.sunday.open)} - ${formatTime(branch.operationalHours.sunday.close)}`
                      : 'Tutup'}
                  </span>
                </div>
              </div>
            </div>

            {/* Divisions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Divisi</h2>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/divisions/create?branchId=${id}`)}
                  className="text-sm"
                >
                  Tambah Divisi
                </Button>
              </div>

              {branch.divisions && branch.divisions.length > 0 ? (
                <div className="space-y-3">
                  {branch.divisions.map(division => (
                    <div
                      key={division.id}
                      className="p-3 border border-gray-200 rounded-md hover:bg-gray-50"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{division.name}</h3>
                          <p className="text-sm text-gray-500">{division.code}</p>
                        </div>
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            division.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {division.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                        </span>
                      </div>
                      {division.description && (
                        <p className="text-sm text-gray-600 mt-1">{division.description}</p>
                      )}
                      <div className="mt-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => router.push(`/divisions/${division.id}`)}
                          className="text-sm text-primary"
                        >
                          Lihat Detail
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Building className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">Belum ada divisi di cabang ini</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDelete}
          title="Hapus Cabang"
          message={`Apakah Anda yakin ingin menghapus cabang "${branch.name}"? Tindakan ini tidak dapat dibatalkan dan akan menghapus semua data terkait cabang ini.`}
        />
      </div>
    </AuthGuard>
  );
};

export default BranchDetailPage;
