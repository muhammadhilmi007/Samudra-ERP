/* eslint-disable no-nested-ternary */
/* eslint-disable no-shadow */
/* eslint-disable react/jsx-filename-extension */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable react/function-component-definition */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import employeeService, { EmployeeDocument, EmployeeAssignment, EmployeeAttendance } from '../../../services/employeeService';
import Button from '../../../components/atoms/Button';
import DeleteConfirmationModal from '../../../components/molecules/DeleteConfirmationModal';
import EmployeeDocumentManager from '../../../components/organisms/EmployeeDocumentManager';
import EmployeeAssignmentManager from '../../../components/organisms/EmployeeAssignmentManager';
import EmployeeAttendanceManager from '../../../components/organisms/EmployeeAttendanceManager';

interface EmployeeDetailPageProps {
  params: {
    id: string;
  };
}

/**
 * EmployeeDetailPage - Page component for viewing employee details
 */
export default function EmployeeDetailPage({ params }: EmployeeDetailPageProps) {
  const router = useRouter();
  const { id } = params;
  const [activeTab, setActiveTab] = useState('overview');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Fetch employee data
  const { data: employee, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['employee', id],
    queryFn: () => employeeService.getEmployeeById(id),
    staleTime: 1 * 60 * 1000, // 1 minute
  });

  // Delete employee mutation
  const deleteEmployeeMutation = useMutation({
    mutationFn: employeeService.deleteEmployee,
    onSuccess: () => {
      router.push('/employees');
    },
  });

  // Upload document mutation
  const uploadDocumentMutation = useMutation({
    mutationFn: ({ document, file }: { document: EmployeeDocument; file?: File }) => {
      if (!file) {
        // If no file, just create document metadata
        return employeeService.uploadDocument(id, new FormData());
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('document', JSON.stringify(document));
      return employeeService.uploadDocument(id, formData);
    },
    onSuccess: () => {
      refetch();
    },
  });

  // Delete document mutation
  const deleteDocumentMutation = useMutation({
    mutationFn: (documentId: string) => employeeService.deleteDocument(id, documentId),
    onSuccess: () => {
      refetch();
    },
  });

  // Add assignment mutation
  const addAssignmentMutation = useMutation({
    mutationFn: (assignment: EmployeeAssignment) => employeeService.addAssignment(id, assignment),
    onSuccess: () => {
      refetch();
    },
  });

  // Update assignment mutation
  const updateAssignmentMutation = useMutation({
    mutationFn: ({ assignmentId, assignment }: { assignmentId: string; assignment: Partial<EmployeeAssignment> }) => 
      employeeService.updateAssignment(id, assignmentId, assignment),
    onSuccess: () => {
      refetch();
    },
  });

  // Delete assignment mutation
  const deleteAssignmentMutation = useMutation({
    mutationFn: (assignmentId: string) => employeeService.deleteAssignment(id, assignmentId),
    onSuccess: () => {
      refetch();
    },
  });

  // Record attendance mutation
  const recordAttendanceMutation = useMutation({
    mutationFn: (attendance: EmployeeAttendance) => employeeService.recordAttendance(id, attendance),
    onSuccess: () => {
      refetch();
    },
  });

  // Handle delete employee
  const handleDeleteEmployee = () => {
    deleteEmployeeMutation.mutate(id);
  };

  // Format date to locale string
  const formatDate = (date: Date | string | undefined) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  // Get employment type label
  const getEmploymentTypeLabel = (type: string) => {
    switch (type) {
      case 'fullTime':
        return 'Full Time';
      case 'partTime':
        return 'Part Time';
      case 'contract':
        return 'Kontrak';
      case 'probation':
        return 'Probation';
      default:
        return type;
    }
  };

  // Get employment status label
  const getEmploymentStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Aktif';
      case 'inactive':
        return 'Tidak Aktif';
      case 'terminated':
        return 'Diberhentikan';
      case 'onLeave':
        return 'Cuti';
      default:
        return status;
    }
  };

  // Get status badge class based on employment status
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'terminated':
        return 'bg-red-100 text-red-800';
      case 'onLeave':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
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

  if (!employee) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded mb-6">
          <p>Karyawan tidak ditemukan.</p>
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
          onClick={() => router.push('/employees')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali ke Daftar Karyawan
        </Button>
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-bold mb-2 md:mb-0">
            Detail Karyawan: {employee.fullName || `${employee.firstName} ${employee.lastName}`}
          </h1>
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => router.push(`/employees/edit/${id}`)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button
              variant="danger"
              onClick={() => setIsDeleteModalOpen(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Hapus
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          <button
            type="button"
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('overview')}
          >
            Ringkasan
          </button>
          <button
            type="button"
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'documents'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('documents')}
          >
            Dokumen
          </button>
          <button
            type="button"
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'assignments'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('assignments')}
          >
            Riwayat Penempatan
          </button>
          <button
            type="button"
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'attendance'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('attendance')}
          >
            Absensi
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Personal Information */}
              <div className="md:col-span-1">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold mb-4">Informasi Pribadi</h2>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">ID Karyawan</p>
                      <p className="font-medium">{employee.employeeId}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Nama Lengkap</p>
                      <p className="font-medium">{employee.fullName || `${employee.firstName} ${employee.lastName}`}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Jenis Kelamin</p>
                      <p className="font-medium">
                        {employee.gender === 'male' ? 'Laki-laki' : 
                         employee.gender === 'female' ? 'Perempuan' : 
                         employee.gender === 'other' ? 'Lainnya' : employee.gender}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Tanggal Lahir</p>
                      <p className="font-medium">{formatDate(employee.birthDate)}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Tempat Lahir</p>
                      <p className="font-medium">{employee.birthPlace || '-'}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Agama</p>
                      <p className="font-medium">{employee.religion || '-'}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Status Pernikahan</p>
                      <p className="font-medium">
                        {employee.maritalStatus === 'single' ? 'Belum Menikah' : 
                         employee.maritalStatus === 'married' ? 'Menikah' : 
                         employee.maritalStatus === 'divorced' ? 'Cerai' : 
                         employee.maritalStatus === 'widowed' ? 'Janda/Duda' : 
                         employee.maritalStatus || '-'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h2 className="text-lg font-semibold mb-4">Informasi Kontak</h2>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Nomor Telepon</p>
                      <p className="font-medium">{employee.contact.phone}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{employee.contact.email}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Nomor Telepon Alternatif</p>
                      <p className="font-medium">{employee.contact.alternativePhone || '-'}</p>
                    </div>
                    
                    {employee.contact.emergencyContact && (
                      <div>
                        <p className="text-sm text-gray-500">Kontak Darurat</p>
                        <p className="font-medium">
                          {employee.contact.emergencyContact.name || '-'} 
                          {employee.contact.emergencyContact.relationship ? 
                            ` (${employee.contact.emergencyContact.relationship})` : ''}
                        </p>
                        <p className="text-sm">
                          {employee.contact.emergencyContact.phone || '-'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Employment Information */}
              <div className="md:col-span-1">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold mb-4">Informasi Kepegawaian</h2>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <p>
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(
                            employee.metadata.employmentStatus
                          )}`}
                        >
                          {getEmploymentStatusLabel(employee.metadata.employmentStatus)}
                        </span>
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Tipe Kepegawaian</p>
                      <p className="font-medium">{getEmploymentTypeLabel(employee.metadata.employmentType)}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Tanggal Bergabung</p>
                      <p className="font-medium">{formatDate(employee.metadata.joinDate)}</p>
                    </div>
                    
                    {employee.metadata.terminationDate && (
                      <div>
                        <p className="text-sm text-gray-500">Tanggal Berhenti</p>
                        <p className="font-medium">{formatDate(employee.metadata.terminationDate)}</p>
                      </div>
                    )}
                    
                    {employee.metadata.bankAccount && (
                      <div>
                        <p className="text-sm text-gray-500">Rekening Bank</p>
                        <p className="font-medium">
                          {employee.metadata.bankAccount.bankName || '-'} - {employee.metadata.bankAccount.accountNumber || '-'}
                        </p>
                        <p className="text-sm">
                          {employee.metadata.bankAccount.accountHolder || '-'}
                        </p>
                      </div>
                    )}
                    
                    <div>
                      <p className="text-sm text-gray-500">NPWP</p>
                      <p className="font-medium">{employee.metadata.taxId || '-'}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">BPJS Kesehatan</p>
                      <p className="font-medium">{employee.metadata.bpjsKesehatan || '-'}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">BPJS Ketenagakerjaan</p>
                      <p className="font-medium">{employee.metadata.bpjsKetenagakerjaan || '-'}</p>
                    </div>
                  </div>
                </div>
                
                {employee.currentAssignment && (
                  <div>
                    <h2 className="text-lg font-semibold mb-4">Penempatan Saat Ini</h2>
                    
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500">Cabang</p>
                        <p className="font-medium">{employee.currentAssignment.branchName || '-'}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500">Divisi</p>
                        <p className="font-medium">{employee.currentAssignment.divisionName || '-'}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500">Jabatan</p>
                        <p className="font-medium">{employee.currentAssignment.positionName || '-'}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500">Tanggal Mulai</p>
                        <p className="font-medium">{formatDate(employee.currentAssignment.startDate)}</p>
                      </div>
                      
                      {employee.currentAssignment.endDate && (
                        <div>
                          <p className="text-sm text-gray-500">Tanggal Berakhir</p>
                          <p className="font-medium">{formatDate(employee.currentAssignment.endDate)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Address Information */}
              <div className="md:col-span-1">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold mb-4">Alamat</h2>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Jalan</p>
                      <p className="font-medium">{employee.address.street}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Kota</p>
                      <p className="font-medium">{employee.address.city}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Provinsi</p>
                      <p className="font-medium">{employee.address.province}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Kode Pos</p>
                      <p className="font-medium">{employee.address.postalCode}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Negara</p>
                      <p className="font-medium">{employee.address.country}</p>
                    </div>
                    
                    {employee.address.coordinates && 
                     (employee.address.coordinates.latitude || employee.address.coordinates.longitude) && (
                      <div>
                        <p className="text-sm text-gray-500">Koordinat</p>
                        <p className="font-medium">
                          {employee.address.coordinates.latitude}, {employee.address.coordinates.longitude}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                {employee.metadata.notes && (
                  <div>
                    <h2 className="text-lg font-semibold mb-4">Catatan</h2>
                    <p className="whitespace-pre-line">{employee.metadata.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <EmployeeDocumentManager
            employeeId={id}
            documents={employee.documents || []}
            onAddDocument={async (document, file) => uploadDocumentMutation.mutate({ document, file })
            }
            onDeleteDocument={async (documentId) => deleteDocumentMutation.mutate(documentId)
            }
          />
        )}

        {activeTab === 'assignments' && (
          <EmployeeAssignmentManager
            employeeId={id}
            assignments={employee.assignments || []}
            onAddAssignment={async (assignment) => addAssignmentMutation.mutate(assignment)
            }
            onUpdateAssignment={async (assignmentId, assignment) => updateAssignmentMutation.mutate({ assignmentId, assignment })
            }
            onDeleteAssignment={async (assignmentId) => deleteAssignmentMutation.mutate(assignmentId)
            }
          />
        )}

        {activeTab === 'attendance' && (
          <EmployeeAttendanceManager
            employeeId={id}
            attendanceRecords={employee.attendance || []}
            onRecordAttendance={async (attendance) => recordAttendanceMutation.mutate(attendance)
            }
          />
        )}
      </div>

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
