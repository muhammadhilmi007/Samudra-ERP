'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { Building, Save, Loader2 } from 'lucide-react';
import divisionService, { Division } from '../../services/divisionService';
import branchService from '../../services/branchService';
import FormField from '../atoms/FormField';
import Button from '../atoms/Button';
import Select from '../atoms/Select';

// Define form schema
const divisionSchema = z.object({
  code: z.string()
    .min(2, 'Kode harus memiliki minimal 2 karakter')
    .max(10, 'Kode tidak boleh lebih dari 10 karakter')
    .regex(/^[A-Z0-9-]+$/, 'Kode hanya boleh berisi huruf kapital, angka, dan tanda hubung'),
  name: z.string()
    .min(3, 'Nama divisi harus memiliki minimal 3 karakter')
    .max(100, 'Nama divisi tidak boleh lebih dari 100 karakter'),
  description: z.string().max(500, 'Deskripsi tidak boleh lebih dari 500 karakter').optional(),
  branch: z.string({
    required_error: 'Cabang harus dipilih',
  }),
  parentDivision: z.string().optional(),
  level: z.number({
    required_error: 'Level harus dipilih',
  }),
  head: z.string().optional(),
  status: z.enum(['active', 'inactive'], {
    required_error: 'Status harus dipilih',
  }),
});

type DivisionFormValues = z.infer<typeof divisionSchema>;

interface DivisionFormProps {
  initialData?: Division;
  isEdit?: boolean;
}

/**
 * DivisionForm - Component for creating and editing divisions
 */
const DivisionForm: React.FC<DivisionFormProps> = ({ initialData, isEdit = false }) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Fetch branches for dropdown
  const { data: branchesData } = useQuery({
    queryKey: ['branches'],
    queryFn: () => branchService.getBranches({ limit: 100 }),
  });

  // Fetch divisions for parent division dropdown
  const { data: divisionsData } = useQuery({
    queryKey: ['divisions'],
    queryFn: () => divisionService.getDivisions({ limit: 100 }),
  });

  // Form setup
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<DivisionFormValues>({
    resolver: zodResolver(divisionSchema),
    defaultValues: initialData || {
      code: '',
      name: '',
      description: '',
      branch: '',
      parentDivision: '',
      level: 0,
      head: '',
      status: 'active',
    },
  });

  // Set initial form values when editing
  useEffect(() => {
    if (initialData && isEdit) {
      reset({
        code: initialData.code || '',
        name: initialData.name || '',
        description: initialData.description || '',
        branch: initialData.branch || '',
        parentDivision: initialData.parentDivision || '',
        level: initialData.level || 0,
        head: initialData.head || '',
        status: initialData.status as 'active' | 'inactive' || 'active',
      });
    }
  }, [initialData, isEdit, reset]);

  // Watch branch value to filter parent divisions
  const selectedBranch = watch('branch');

  // Prepare branch options for dropdown
  const branchOptions = branchesData?.data
    ? [
        { value: '', label: 'Pilih Cabang' },
        ...branchesData.data.map((branch) => ({
          value: branch.id as string,
          label: `${branch.code} - ${branch.name}`,
        })),
      ]
    : [{ value: '', label: 'Memuat...' }];

  // Prepare parent division options for dropdown
  const parentDivisionOptions = divisionsData?.data
    ? [
        { value: '', label: 'Tidak Ada Divisi Induk' },
        ...divisionsData.data
          .filter((division) => 
            // Only show divisions from the same branch
            division.branch === selectedBranch && 
            // Don't show current division as parent option when editing
            (!isEdit || division.id !== initialData?.id)
          )
          .map((division) => ({
            value: division.id as string,
            label: `${division.code} - ${division.name}`,
          })),
      ]
    : [{ value: '', label: 'Memuat...' }];

  // Handle form submission
  const onSubmit = async (data: DivisionFormValues) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      if (isEdit && initialData?.id) {
        // Update existing division
        await divisionService.updateDivision(initialData.id, data);
        router.push(`/divisions/${initialData.id}`);
      } else {
        // Create new division
        const response = await divisionService.createDivision(data);
        router.push(`/divisions/${response.data.id}`);
      }
    } catch (error) {
      console.error('Error saving division:', error);
      setServerError('Terjadi kesalahan saat menyimpan data divisi. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-6 flex items-center">
        <Building className="h-5 w-5 mr-2 text-primary" />
        {isEdit ? 'Edit Divisi' : 'Tambah Divisi Baru'}
      </h2>

      {serverError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-600">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="space-y-4 md:col-span-2">
            <h3 className="text-lg font-medium border-b pb-2">Informasi Dasar</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Kode Divisi"
                name="code"
                register={register}
                error={errors.code?.message}
                placeholder="Contoh: DIV-IT"
                required
                disabled={isEdit} // Code cannot be changed when editing
                hint="Kode unik untuk divisi (huruf kapital, angka, dan tanda hubung)"
              />
              
              <FormField
                label="Nama Divisi"
                name="name"
                register={register}
                error={errors.name?.message}
                placeholder="Contoh: Divisi Teknologi Informasi"
                required
                hint="Nama lengkap divisi"
              />
            </div>
            
            <FormField
              label="Deskripsi"
              name="description"
              register={register}
              error={errors.description?.message}
              placeholder="Deskripsi singkat tentang divisi ini"
              multiline
              rows={3}
              hint="Deskripsi singkat tentang peran dan tanggung jawab divisi (opsional)"
            />
          </div>

          {/* Relationships */}
          <div className="space-y-4 md:col-span-2">
            <h3 className="text-lg font-medium border-b pb-2">Relasi</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cabang <span className="text-red-500">*</span>
                </label>
                <Select
                  {...register('branch')}
                  options={branchOptions}
                  error={errors.branch?.message}
                  required
                />
                {errors.branch?.message && (
                  <p className="mt-1 text-sm text-red-600">{errors.branch.message}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">Cabang tempat divisi ini berada</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Divisi Induk
                </label>
                <Select
                  {...register('parentDivision')}
                  options={parentDivisionOptions}
                  error={errors.parentDivision?.message}
                  disabled={!selectedBranch}
                />
                {errors.parentDivision?.message && (
                  <p className="mt-1 text-sm text-red-600">{errors.parentDivision.message}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">Divisi induk dari divisi ini (opsional)</p>
              </div>
            </div>
          </div>

          {/* Classification */}
          <div className="space-y-4 md:col-span-2">
            <h3 className="text-lg font-medium border-b pb-2">Klasifikasi</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Level <span className="text-red-500">*</span>
                </label>
                <Select
                  {...register('level', { valueAsNumber: true })}
                  options={[
                    { value: '0', label: 'Divisi Utama (Level 0)' },
                    { value: '1', label: 'Sub Divisi (Level 1)' },
                    { value: '2', label: 'Departemen (Level 2)' },
                    { value: '3', label: 'Unit (Level 3)' },
                  ]}
                  error={errors.level?.message}
                  required
                />
                {errors.level?.message && (
                  <p className="mt-1 text-sm text-red-600">{errors.level.message}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">Level hierarki divisi dalam organisasi</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status <span className="text-red-500">*</span>
                </label>
                <Select
                  {...register('status')}
                  options={[
                    { value: 'active', label: 'Aktif' },
                    { value: 'inactive', label: 'Tidak Aktif' },
                  ]}
                  error={errors.status?.message}
                  required
                />
                {errors.status?.message && (
                  <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">Status operasional divisi</p>
              </div>
            </div>
          </div>

          {/* Head of Division - This would typically be connected to a user selection */}
          <div className="space-y-4 md:col-span-2">
            <h3 className="text-lg font-medium border-b pb-2">Kepemimpinan</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kepala Divisi
              </label>
              <Select
                {...register('head')}
                options={[
                  { value: '', label: 'Belum Ditentukan' },
                  // This would typically be populated with users from the system
                  { value: 'user1', label: 'John Doe' },
                  { value: 'user2', label: 'Jane Smith' },
                ]}
                error={errors.head?.message}
              />
              {errors.head?.message && (
                <p className="mt-1 text-sm text-red-600">{errors.head.message}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">Pengguna yang bertanggung jawab sebagai kepala divisi (opsional)</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Batal
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
            className="flex items-center"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Simpan
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default DivisionForm;
