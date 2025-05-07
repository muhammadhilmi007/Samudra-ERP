'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import branchService, { Branch } from '../../services/branchService';
import FormField from '../molecules/FormField';
import Button from '../atoms/Button';
import {Select} from '../atoms/Select';

// Define form schema
const branchSchema = z.object({
  code: z.string().min(2, 'Kode cabang minimal 2 karakter').max(10, 'Kode cabang maksimal 10 karakter'),
  name: z.string().min(3, 'Nama cabang minimal 3 karakter'),
  address: z.object({
    street: z.string().min(1, 'Alamat harus diisi'),
    city: z.string().min(1, 'Kota harus diisi'),
    province: z.string().min(1, 'Provinsi harus diisi'),
    postalCode: z.string().min(1, 'Kode pos harus diisi'),
    country: z.string().default('Indonesia'),
    coordinates: z.object({
      latitude: z.number().optional().nullable(),
      longitude: z.number().optional().nullable(),
    }).optional(),
  }),
  contactInfo: z.object({
    phone: z.string().min(1, 'Nomor telepon harus diisi'),
    email: z.string().email('Format email tidak valid'),
    fax: z.string().optional(),
    website: z.string().optional(),
  }),
  parentBranch: z.string().optional().nullable(),
  status: z.enum(['active', 'inactive']),
  operationalHours: z.object({
    monday: z.object({ open: z.string().optional(), close: z.string().optional() }).optional(),
    tuesday: z.object({ open: z.string().optional(), close: z.string().optional() }).optional(),
    wednesday: z.object({ open: z.string().optional(), close: z.string().optional() }).optional(),
    thursday: z.object({ open: z.string().optional(), close: z.string().optional() }).optional(),
    friday: z.object({ open: z.string().optional(), close: z.string().optional() }).optional(),
    saturday: z.object({ open: z.string().optional(), close: z.string().optional() }).optional(),
    sunday: z.object({ open: z.string().optional(), close: z.string().optional() }).optional(),
  }).optional(),
  metadata: z.object({
    establishedDate: z.string().optional(),
    capacity: z.number().int().positive().optional().nullable(),
    serviceArea: z.array(z.string()).optional(),
    notes: z.string().optional(),
  }).optional(),
});

type BranchFormValues = z.infer<typeof branchSchema>;

interface BranchFormProps {
  initialData?: Branch;
  isEdit?: boolean;
}

/**
 * BranchForm - Component for creating and editing branches
 */
const BranchForm: React.FC<BranchFormProps> = ({ initialData, isEdit = false }) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serviceAreaInput, setServiceAreaInput] = useState('');

  // Fetch parent branch options
  const { data: branchesData } = useQuery({
    queryKey: ['branches'],
    queryFn: () => branchService.getBranches({ limit: 100 }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Prepare parent branch options for dropdown
  const parentBranchOptions = React.useMemo(() => {
    if (!branchesData?.data) return [];

    // Filter out the current branch if in edit mode
    const filteredBranches = isEdit
      ? branchesData.data.filter((branch) => branch.id !== initialData?.id)
      : branchesData.data;

    return [
      { value: '', label: 'Tidak Ada' },
      ...filteredBranches.map((branch) => ({
        value: branch.id as string,
        label: `${branch.code} - ${branch.name}`,
      })),
    ];
  }, [branchesData, initialData, isEdit]);

  // Convert initial data to form values
  const getInitialFormValues = (): BranchFormValues => {
    if (!initialData) {
      return {
        code: '',
        name: '',
        address: {
          street: '',
          city: '',
          province: '',
          postalCode: '',
          country: 'Indonesia',
          coordinates: {
            latitude: null,
            longitude: null,
          },
        },
        contactInfo: {
          phone: '',
          email: '',
          fax: '',
          website: '',
        },
        parentBranch: null,
        status: 'active',
        operationalHours: {
          monday: { open: '', close: '' },
          tuesday: { open: '', close: '' },
          wednesday: { open: '', close: '' },
          thursday: { open: '', close: '' },
          friday: { open: '', close: '' },
          saturday: { open: '', close: '' },
          sunday: { open: '', close: '' },
        },
        metadata: {
          establishedDate: '',
          capacity: null,
          serviceArea: [],
          notes: '',
        },
      };
    }

    return {
      code: initialData.code,
      name: initialData.name,
      address: {
        street: initialData.address.street,
        city: initialData.address.city,
        province: initialData.address.province,
        postalCode: initialData.address.postalCode,
        country: initialData.address.country || 'Indonesia',
        coordinates: {
          latitude: initialData.address.coordinates?.latitude || null,
          longitude: initialData.address.coordinates?.longitude || null,
        },
      },
      contactInfo: {
        phone: initialData.contactInfo.phone,
        email: initialData.contactInfo.email,
        fax: initialData.contactInfo.fax || '',
        website: initialData.contactInfo.website || '',
      },
      parentBranch: initialData.parentBranch || null,
      status: initialData.status,
      operationalHours: initialData.operationalHours || {
        monday: { open: '', close: '' },
        tuesday: { open: '', close: '' },
        wednesday: { open: '', close: '' },
        thursday: { open: '', close: '' },
        friday: { open: '', close: '' },
        saturday: { open: '', close: '' },
        sunday: { open: '', close: '' },
      },
      metadata: {
        establishedDate: initialData.metadata?.establishedDate 
          ? new Date(initialData.metadata.establishedDate).toISOString().split('T')[0]
          : '',
        capacity: initialData.metadata?.capacity || null,
        serviceArea: initialData.metadata?.serviceArea || [],
        notes: initialData.metadata?.notes || '',
      },
    };
  };

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BranchFormValues>({
    resolver: zodResolver(branchSchema),
    defaultValues: getInitialFormValues(),
  });

  // Watch service area array to update UI
  const serviceAreas = watch('metadata.serviceArea') || [];

  // Add service area
  const handleAddServiceArea = () => {
    if (serviceAreaInput.trim() === '') return;

    // Check if service area already exists
    if (serviceAreas.includes(serviceAreaInput.trim())) {
      return;
    }

    setValue('metadata.serviceArea', [...serviceAreas, serviceAreaInput.trim()]);
    setServiceAreaInput('');
  };

  // Remove service area
  const handleRemoveServiceArea = (index: number) => {
    const newServiceAreas = [...serviceAreas];
    newServiceAreas.splice(index, 1);
    setValue('metadata.serviceArea', newServiceAreas);
  };

  // Handle form submission
  const onSubmit = async (data: BranchFormValues) => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Format data for API
      const branchData: Branch = {
        ...data,
        metadata: {
          ...data.metadata,
          establishedDate: data.metadata?.establishedDate ? new Date(data.metadata.establishedDate) : undefined,
        },
      };

      if (isEdit && initialData?.id) {
        // Update existing branch
        await branchService.updateBranch(initialData.id, branchData);
      } else {
        // Create new branch
        await branchService.createBranch(branchData);
      }

      // Redirect to branches list
      router.push('/branches');
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <h2 className="text-lg font-semibold mb-4">Informasi Cabang</h2>
            
            <FormField
              label="Kode Cabang"
              name="code"
              type="text"
              placeholder="Masukkan kode cabang"
              error={errors.code?.message}
              register={register}
              required
            />
            
            <FormField
              label="Nama Cabang"
              name="name"
              type="text"
              placeholder="Masukkan nama cabang"
              error={errors.name?.message}
              register={register}
              required
            />
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    options={[
                      { value: 'active', label: 'Aktif' },
                      { value: 'inactive', label: 'Tidak Aktif' },
                    ]}
                  />
                )}
              />
              {errors.status && (
                <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
              )}
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cabang Induk
              </label>
              <Controller
                name="parentBranch"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    options={parentBranchOptions}
                    value={field.value || ''}
                    onChange={(e) => field.onChange(e.target.value || null)}
                  />
                )}
              />
              {errors.parentBranch && (
                <p className="mt-1 text-sm text-red-600">{errors.parentBranch.message}</p>
              )}
            </div>
          </div>
          
          <div>
            <h2 className="text-lg font-semibold mb-4">Alamat</h2>
            
            <FormField
              label="Jalan"
              name="address.street"
              type="text"
              placeholder="Masukkan alamat jalan"
              error={errors.address?.street?.message}
              register={register}
              required
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Kota"
                name="address.city"
                type="text"
                placeholder="Masukkan kota"
                error={errors.address?.city?.message}
                register={register}
                required
              />
              
              <FormField
                label="Provinsi"
                name="address.province"
                type="text"
                placeholder="Masukkan provinsi"
                error={errors.address?.province?.message}
                register={register}
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Kode Pos"
                name="address.postalCode"
                type="text"
                placeholder="Masukkan kode pos"
                error={errors.address?.postalCode?.message}
                register={register}
                required
              />
              
              <FormField
                label="Negara"
                name="address.country"
                type="text"
                placeholder="Masukkan negara"
                error={errors.address?.country?.message}
                register={register}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Latitude"
                name="address.coordinates.latitude"
                type="number"
                step="any"
                placeholder="Masukkan latitude"
                error={errors.address?.coordinates?.latitude?.message}
                register={register}
              />
              
              <FormField
                label="Longitude"
                name="address.coordinates.longitude"
                type="number"
                step="any"
                placeholder="Masukkan longitude"
                error={errors.address?.coordinates?.longitude?.message}
                register={register}
              />
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <h2 className="text-lg font-semibold mb-4">Informasi Kontak</h2>
            
            <FormField
              label="Telepon"
              name="contactInfo.phone"
              type="text"
              placeholder="Masukkan nomor telepon"
              error={errors.contactInfo?.phone?.message}
              register={register}
              required
            />
            
            <FormField
              label="Email"
              name="contactInfo.email"
              type="email"
              placeholder="Masukkan alamat email"
              error={errors.contactInfo?.email?.message}
              register={register}
              required
            />
            
            <FormField
              label="Fax"
              name="contactInfo.fax"
              type="text"
              placeholder="Masukkan nomor fax (opsional)"
              error={errors.contactInfo?.fax?.message}
              register={register}
            />
            
            <FormField
              label="Website"
              name="contactInfo.website"
              type="text"
              placeholder="Masukkan alamat website (opsional)"
              error={errors.contactInfo?.website?.message}
              register={register}
            />
          </div>
          
          <div>
            <h2 className="text-lg font-semibold mb-4">Informasi Tambahan</h2>
            
            <FormField
              label="Tanggal Pendirian"
              name="metadata.establishedDate"
              type="date"
              error={errors.metadata?.establishedDate?.message}
              register={register}
            />
            
            <FormField
              label="Kapasitas"
              name="metadata.capacity"
              type="number"
              placeholder="Masukkan kapasitas cabang"
              error={errors.metadata?.capacity?.message}
              register={register}
            />
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Area Layanan
              </label>
              <div className="flex">
                <input
                  type="text"
                  value={serviceAreaInput}
                  onChange={(e) => setServiceAreaInput(e.target.value)}
                  placeholder="Tambahkan area layanan"
                  className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-primary focus:border-primary"
                />
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleAddServiceArea}
                  className="rounded-l-none"
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {serviceAreas.map((area, index) => (
                  <div key={index} className="flex items-center bg-gray-100 rounded-full px-3 py-1">
                    <span className="text-sm">{area}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveServiceArea(index)}
                      className="ml-2 text-gray-500 hover:text-red-500"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Catatan
              </label>
              <textarea
                {...register('metadata.notes')}
                rows={3}
                placeholder="Masukkan catatan tambahan (opsional)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
              />
              {errors.metadata?.notes && (
                <p className="mt-1 text-sm text-red-600">{errors.metadata.notes.message}</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Jam Operasional</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-md p-4">
              <div className="flex items-center mb-2">
                <Clock className="h-5 w-5 text-gray-400 mr-2" />
                <h3 className="font-medium">Senin</h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Buka</label>
                  <input
                    type="time"
                    {...register('operationalHours.monday.open')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Tutup</label>
                  <input
                    type="time"
                    {...register('operationalHours.monday.close')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>
            </div>
            
            <div className="border border-gray-200 rounded-md p-4">
              <div className="flex items-center mb-2">
                <Clock className="h-5 w-5 text-gray-400 mr-2" />
                <h3 className="font-medium">Selasa</h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Buka</label>
                  <input
                    type="time"
                    {...register('operationalHours.tuesday.open')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Tutup</label>
                  <input
                    type="time"
                    {...register('operationalHours.tuesday.close')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>
            </div>
            
            <div className="border border-gray-200 rounded-md p-4">
              <div className="flex items-center mb-2">
                <Clock className="h-5 w-5 text-gray-400 mr-2" />
                <h3 className="font-medium">Rabu</h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Buka</label>
                  <input
                    type="time"
                    {...register('operationalHours.wednesday.open')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Tutup</label>
                  <input
                    type="time"
                    {...register('operationalHours.wednesday.close')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>
            </div>
            
            <div className="border border-gray-200 rounded-md p-4">
              <div className="flex items-center mb-2">
                <Clock className="h-5 w-5 text-gray-400 mr-2" />
                <h3 className="font-medium">Kamis</h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Buka</label>
                  <input
                    type="time"
                    {...register('operationalHours.thursday.open')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Tutup</label>
                  <input
                    type="time"
                    {...register('operationalHours.thursday.close')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>
            </div>
            
            <div className="border border-gray-200 rounded-md p-4">
              <div className="flex items-center mb-2">
                <Clock className="h-5 w-5 text-gray-400 mr-2" />
                <h3 className="font-medium">Jumat</h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Buka</label>
                  <input
                    type="time"
                    {...register('operationalHours.friday.open')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Tutup</label>
                  <input
                    type="time"
                    {...register('operationalHours.friday.close')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>
            </div>
            
            <div className="border border-gray-200 rounded-md p-4">
              <div className="flex items-center mb-2">
                <Clock className="h-5 w-5 text-gray-400 mr-2" />
                <h3 className="font-medium">Sabtu</h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Buka</label>
                  <input
                    type="time"
                    {...register('operationalHours.saturday.open')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Tutup</label>
                  <input
                    type="time"
                    {...register('operationalHours.saturday.close')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>
            </div>
            
            <div className="border border-gray-200 rounded-md p-4">
              <div className="flex items-center mb-2">
                <Clock className="h-5 w-5 text-gray-400 mr-2" />
                <h3 className="font-medium">Minggu</h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Buka</label>
                  <input
                    type="time"
                    {...register('operationalHours.sunday.open')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Tutup</label>
                  <input
                    type="time"
                    {...register('operationalHours.sunday.close')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/branches')}
            disabled={isSubmitting}
          >
            Batal
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Menyimpan...' : isEdit ? 'Perbarui Cabang' : 'Tambah Cabang'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default BranchForm;
