'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2, Download, Eye } from 'lucide-react';
import { EmployeeDocument } from '@/services/employeeService';
import FormField from '../molecules/FormField';
import Button from '../atoms/Button';
import Select from '../atoms/Select';

// Define form schema
const documentSchema = z.object({
  type: z.enum(['ktp', 'npwp', 'sim', 'ijazah', 'sertifikat', 'kontrak', 'other']),
  number: z.string().min(1, 'Nomor dokumen harus diisi'),
  issuedDate: z.string().min(1, 'Tanggal penerbitan harus diisi'),
  expiryDate: z.string().optional(),
  issuedBy: z.string().min(1, 'Penerbit dokumen harus diisi'),
  notes: z.string().optional(),
  file: z.instanceof(FileList).optional(),
});

type DocumentFormValues = z.infer<typeof documentSchema>;

interface EmployeeDocumentManagerProps {
  employeeId: string;
  documents: EmployeeDocument[];
  onAddDocument: (document: EmployeeDocument, file?: File) => Promise<void>;
  onDeleteDocument: (documentId: string) => Promise<void>;
}

/**
 * EmployeeDocumentManager - Component for managing employee documents
 */
const EmployeeDocumentManager: React.FC<EmployeeDocumentManagerProps> = ({
  employeeId,
  documents,
  onAddDocument,
  onDeleteDocument,
}) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Format date to locale string
  const formatDate = (date: Date | string | undefined) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  // Get document type label
  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case 'ktp':
        return 'KTP';
      case 'npwp':
        return 'NPWP';
      case 'sim':
        return 'SIM';
      case 'ijazah':
        return 'Ijazah';
      case 'sertifikat':
        return 'Sertifikat';
      case 'kontrak':
        return 'Kontrak Kerja';
      case 'other':
        return 'Lainnya';
      default:
        return type;
    }
  };

  // Get status badge class based on document status
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'revoked':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DocumentFormValues>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      type: 'ktp',
      number: '',
      issuedDate: '',
      expiryDate: '',
      issuedBy: '',
      notes: '',
    },
  });

  // Handle form submission
  const onSubmit = async (data: DocumentFormValues) => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Get file if provided
      const file = data.file && data.file.length > 0 ? data.file[0] : undefined;

      // Format data for API
      const documentData: EmployeeDocument = {
        type: data.type,
        number: data.number,
        issuedDate: new Date(data.issuedDate),
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
        issuedBy: data.issuedBy,
        status: 'active', // Default status for new documents
        notes: data.notes,
      };

      // Call parent handler to add document
      await onAddDocument(documentData, file);

      // Reset form and hide it
      reset();
      setShowForm(false);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle document deletion
  const handleDeleteDocument = async (documentId: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus dokumen ini?')) {
      try {
        await onDeleteDocument(documentId);
      } catch (err: any) {
        setError(err.message || 'Terjadi kesalahan saat menghapus dokumen.');
      }
    }
  };

  // Handle document preview
  const handlePreviewDocument = (documentUrl: string) => {
    window.open(documentUrl, '_blank');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Dokumen Karyawan</h2>
        <Button
          variant="primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Batal' : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Dokumen
            </>
          )}
        </Button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {showForm && (
        <div className="mb-8 p-4 border border-gray-200 rounded-lg">
          <h3 className="text-lg font-medium mb-4">Tambah Dokumen Baru</h3>
          
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Jenis Dokumen <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register('type')}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="ktp">KTP</option>
                    <option value="npwp">NPWP</option>
                    <option value="sim">SIM</option>
                    <option value="ijazah">Ijazah</option>
                    <option value="sertifikat">Sertifikat</option>
                    <option value="kontrak">Kontrak Kerja</option>
                    <option value="other">Lainnya</option>
                  </select>
                  {errors.type && (
                    <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
                  )}
                </div>
                
                <FormField
                  label="Nomor Dokumen"
                  name="number"
                  type="text"
                  placeholder="Masukkan nomor dokumen"
                  error={errors.number?.message}
                  register={register}
                  required
                />
                
                <FormField
                  label="Penerbit"
                  name="issuedBy"
                  type="text"
                  placeholder="Masukkan penerbit dokumen"
                  error={errors.issuedBy?.message}
                  register={register}
                  required
                />
              </div>
              
              <div>
                <FormField
                  label="Tanggal Penerbitan"
                  name="issuedDate"
                  type="date"
                  error={errors.issuedDate?.message}
                  register={register}
                  required
                />
                
                <FormField
                  label="Tanggal Kadaluarsa"
                  name="expiryDate"
                  type="date"
                  error={errors.expiryDate?.message}
                  register={register}
                />
                
                <FormField
                  label="Catatan"
                  name="notes"
                  type="textarea"
                  placeholder="Masukkan catatan tambahan"
                  error={errors.notes?.message}
                  register={register}
                />
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unggah File
              </label>
              <input
                type="file"
                {...register('file')}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
              {errors.file && (
                <p className="mt-1 text-sm text-red-600">{errors.file.message}</p>
              )}
            </div>
            
            <div className="mt-6 flex justify-end">
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Menyimpan...' : 'Simpan Dokumen'}
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Jenis Dokumen
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Nomor
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Penerbit
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Tanggal Penerbitan
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Tanggal Kadaluarsa
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {documents.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                  Tidak ada dokumen
                </td>
              </tr>
            ) : (
              documents.map((document) => (
                <tr key={document.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {getDocumentTypeLabel(document.type)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {document.number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {document.issuedBy}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(document.issuedDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(document.expiryDate) || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(
                        document.status
                      )}`}
                    >
                      {document.status === 'active'
                        ? 'Aktif'
                        : document.status === 'expired'
                        ? 'Kadaluarsa'
                        : document.status === 'revoked'
                        ? 'Dicabut'
                        : document.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {document.documentUrl && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handlePreviewDocument(document.documentUrl as string)}
                            title="Lihat Dokumen"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => window.open(document.documentUrl, '_blank')}
                            title="Unduh Dokumen"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteDocument(document.id as string)}
                        title="Hapus"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeeDocumentManager;
