'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2, Edit } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { EmployeeAssignment } from '@/services/employeeService';
import branchService from '@/services/branchService';
import divisionService from '@/services/divisionService';
import positionService from '@/services/positionService';
import FormField from '../molecules/FormField';
import Button from '../atoms/Button';
import Select from '../atoms/Select';

// Define form schema
const assignmentSchema = z.object({
  branchId: z.string().min(1, 'Cabang harus dipilih'),
  divisionId: z.string().min(1, 'Divisi harus dipilih'),
  positionId: z.string().min(1, 'Jabatan harus dipilih'),
  startDate: z.string().min(1, 'Tanggal mulai harus diisi'),
  endDate: z.string().optional(),
  status: z.enum(['active', 'completed', 'terminated']),
  notes: z.string().optional(),
});

type AssignmentFormValues = z.infer<typeof assignmentSchema>;

interface EmployeeAssignmentManagerProps {
  employeeId: string;
  assignments: EmployeeAssignment[];
  onAddAssignment: (assignment: EmployeeAssignment) => Promise<void>;
  onUpdateAssignment: (assignmentId: string, assignment: Partial<EmployeeAssignment>) => Promise<void>;
  onDeleteAssignment: (assignmentId: string) => Promise<void>;
}

/**
 * EmployeeAssignmentManager - Component for managing employee assignments
 */
const EmployeeAssignmentManager: React.FC<EmployeeAssignmentManagerProps> = ({
  employeeId,
  assignments,
  onAddAssignment,
  onUpdateAssignment,
  onDeleteAssignment,
}) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<EmployeeAssignment | null>(null);

  // Fetch branches for dropdown options
  const { data: branchesData } = useQuery({
    queryKey: ['branches'],
    queryFn: () => branchService.getBranches({ limit: 100 }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch divisions for dropdown options
  const { data: divisionsData } = useQuery({
    queryKey: ['divisions'],
    queryFn: () => divisionService.getDivisions({ limit: 100 }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch positions for dropdown options
  const { data: positionsData } = useQuery({
    queryKey: ['positions'],
    queryFn: () => positionService.getPositions({ limit: 100 }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Format date to locale string
  const formatDate = (date: Date | string | undefined) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  // Get status badge class based on assignment status
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'terminated':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Prepare branch options for dropdown
  const branchOptions = React.useMemo(() => {
    if (!branchesData?.data) return [];

    return branchesData.data.map((branch) => ({
      value: branch.id as string,
      label: `${branch.code} - ${branch.name}`,
    }));
  }, [branchesData]);

  // Prepare division options for dropdown
  const divisionOptions = React.useMemo(() => {
    if (!divisionsData?.data) return [];

    return divisionsData.data.map((division) => ({
      value: division.id as string,
      label: `${division.code} - ${division.name}`,
    }));
  }, [divisionsData]);

  // Prepare position options for dropdown
  const positionOptions = React.useMemo(() => {
    if (!positionsData?.data) return [];

    return positionsData.data.map((position) => ({
      value: position.id as string,
      label: position.name,
    }));
  }, [positionsData]);

  // Get initial form values
  const getInitialFormValues = (): AssignmentFormValues => {
    if (!editingAssignment) {
      return {
        branchId: '',
        divisionId: '',
        positionId: '',
        startDate: '',
        endDate: '',
        status: 'active',
        notes: '',
      };
    }

    return {
      branchId: editingAssignment.branchId,
      divisionId: editingAssignment.divisionId,
      positionId: editingAssignment.positionId,
      startDate: editingAssignment.startDate 
        ? new Date(editingAssignment.startDate).toISOString().split('T')[0] 
        : '',
      endDate: editingAssignment.endDate 
        ? new Date(editingAssignment.endDate).toISOString().split('T')[0] 
        : '',
      status: editingAssignment.status,
      notes: editingAssignment.notes || '',
    };
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AssignmentFormValues>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: getInitialFormValues(),
  });

  // Reset form when editing assignment changes
  React.useEffect(() => {
    reset(getInitialFormValues());
  }, [editingAssignment, reset]);

  // Handle form submission
  const onSubmit = async (data: AssignmentFormValues) => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Get branch, division, and position names for display
      const branch = branchesData?.data.find(b => b.id === data.branchId);
      const division = divisionsData?.data.find(d => d.id === data.divisionId);
      const position = positionsData?.data.find(p => p.id === data.positionId);

      // Format data for API
      const assignmentData: EmployeeAssignment = {
        ...data,
        branchName: branch?.name,
        divisionName: division?.name,
        positionName: position?.name,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : undefined,
      };

      if (editingAssignment?.id) {
        // Update existing assignment
        await onUpdateAssignment(editingAssignment.id, assignmentData);
      } else {
        // Add new assignment
        await onAddAssignment(assignmentData);
      }

      // Reset form and hide it
      reset();
      setShowForm(false);
      setEditingAssignment(null);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle edit assignment
  const handleEditAssignment = (assignment: EmployeeAssignment) => {
    setEditingAssignment(assignment);
    setShowForm(true);
  };

  // Handle delete assignment
  const handleDeleteAssignment = async (assignmentId: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus penempatan ini?')) {
      try {
        await onDeleteAssignment(assignmentId);
      } catch (err: any) {
        setError(err.message || 'Terjadi kesalahan saat menghapus penempatan.');
      }
    }
  };

  // Handle cancel form
  const handleCancelForm = () => {
    setShowForm(false);
    setEditingAssignment(null);
    reset();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Riwayat Penempatan</h2>
        <Button
          variant="primary"
          onClick={() => {
            if (showForm && !editingAssignment) {
              handleCancelForm();
            } else {
              setEditingAssignment(null);
              setShowForm(true);
            }
          }}
        >
          {showForm && !editingAssignment ? 'Batal' : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Penempatan
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
          <h3 className="text-lg font-medium mb-4">
            {editingAssignment ? 'Edit Penempatan' : 'Tambah Penempatan Baru'}
          </h3>
          
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cabang <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register('branchId')}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="">Pilih Cabang</option>
                    {branchOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.branchId && (
                    <p className="mt-1 text-sm text-red-600">{errors.branchId.message}</p>
                  )}
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Divisi <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register('divisionId')}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="">Pilih Divisi</option>
                    {divisionOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.divisionId && (
                    <p className="mt-1 text-sm text-red-600">{errors.divisionId.message}</p>
                  )}
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Jabatan <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register('positionId')}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="">Pilih Jabatan</option>
                    {positionOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.positionId && (
                    <p className="mt-1 text-sm text-red-600">{errors.positionId.message}</p>
                  )}
                </div>
              </div>
              
              <div>
                <FormField
                  label="Tanggal Mulai"
                  name="startDate"
                  type="date"
                  error={errors.startDate?.message}
                  register={register}
                  required
                />
                
                <FormField
                  label="Tanggal Berakhir"
                  name="endDate"
                  type="date"
                  error={errors.endDate?.message}
                  register={register}
                />
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register('status')}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="active">Aktif</option>
                    <option value="completed">Selesai</option>
                    <option value="terminated">Diberhentikan</option>
                  </select>
                  {errors.status && (
                    <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
                  )}
                </div>
                
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
            
            <div className="mt-6 flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancelForm}
              >
                Batal
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Menyimpan...' : editingAssignment ? 'Perbarui' : 'Simpan'}
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
                Cabang
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Divisi
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Jabatan
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Tanggal Mulai
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Tanggal Berakhir
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
            {assignments.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                  Tidak ada data penempatan
                </td>
              </tr>
            ) : (
              assignments.map((assignment) => (
                <tr key={assignment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {assignment.branchName || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {assignment.divisionName || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {assignment.positionName || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(assignment.startDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(assignment.endDate) || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(
                        assignment.status
                      )}`}
                    >
                      {assignment.status === 'active'
                        ? 'Aktif'
                        : assignment.status === 'completed'
                        ? 'Selesai'
                        : assignment.status === 'terminated'
                        ? 'Diberhentikan'
                        : assignment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditAssignment(assignment)}
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteAssignment(assignment.id as string)}
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

export default EmployeeAssignmentManager;
