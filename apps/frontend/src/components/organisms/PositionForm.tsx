'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { Briefcase, Save, Loader2, Plus, Trash2 } from 'lucide-react';
import positionService, { Position } from '../../services/positionService';
import divisionService from '../../services/divisionService';
import branchService from '../../services/branchService';
import FormField from '../atoms/FormField';
import Button from '../atoms/Button';
import Select from '../atoms/Select';

// Define form schema
const positionSchema = z.object({
  code: z.string()
    .min(2, 'Kode harus memiliki minimal 2 karakter')
    .max(10, 'Kode tidak boleh lebih dari 10 karakter')
    .regex(/^[A-Z0-9-]+$/, 'Kode hanya boleh berisi huruf kapital, angka, dan tanda hubung'),
  title: z.string()
    .min(3, 'Nama jabatan harus memiliki minimal 3 karakter')
    .max(100, 'Nama jabatan tidak boleh lebih dari 100 karakter'),
  description: z.string().max(500, 'Deskripsi tidak boleh lebih dari 500 karakter').optional(),
  division: z.string({
    required_error: 'Divisi harus dipilih',
  }),
  parentPosition: z.string().optional(),
  level: z.number({
    required_error: 'Level harus dipilih',
  }),
  responsibilities: z.array(z.string().min(1, 'Tanggung jawab tidak boleh kosong')).optional(),
  requirements: z.object({
    education: z.string().optional(),
    experience: z.string().optional(),
    skills: z.array(z.string()).optional(),
    certifications: z.array(z.string()).optional(),
  }).optional(),
  status: z.enum(['active', 'inactive'], {
    required_error: 'Status harus dipilih',
  }),
});

type PositionFormValues = z.infer<typeof positionSchema>;

interface PositionFormProps {
  initialData?: Position;
  isEdit?: boolean;
}

/**
 * PositionForm - Component for creating and editing positions
 */
const PositionForm: React.FC<PositionFormProps> = ({ initialData, isEdit = false }) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [selectedDivision, setSelectedDivision] = useState<string>('');
  const [skillInput, setSkillInput] = useState<string>('');
  const [certificationInput, setCertificationInput] = useState<string>('');

  // Fetch branches for dropdown
  const { data: branchesData } = useQuery({
    queryKey: ['branches'],
    queryFn: () => branchService.getBranches({ limit: 100 }),
  });

  // Fetch divisions for dropdown
  const { data: divisionsData } = useQuery({
    queryKey: ['divisions'],
    queryFn: () => divisionService.getDivisions({ limit: 100 }),
  });

  // Fetch positions for parent position dropdown
  const { data: positionsData } = useQuery({
    queryKey: ['positions'],
    queryFn: () => positionService.getPositions({ limit: 100 }),
  });

  // Form setup
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    setValue,
    watch,
    getValues,
  } = useForm<PositionFormValues>({
    resolver: zodResolver(positionSchema),
    defaultValues: {
      code: '',
      title: '',
      description: '',
      division: '',
      parentPosition: '',
      level: 0,
      responsibilities: [''],
      requirements: {
        education: '',
        experience: '',
        skills: [],
        certifications: [],
      },
      status: 'active',
    },
  });

  // Use field array for responsibilities
  const { 
    fields: responsibilityFields, 
    append: appendResponsibility, 
    remove: removeResponsibility 
  } = useFieldArray({
    control,
    name: 'responsibilities',
  });

  // Set initial form values when editing
  useEffect(() => {
    if (initialData && isEdit) {
      reset({
        code: initialData.code || '',
        title: initialData.title || '',
        description: initialData.description || '',
        division: initialData.division || '',
        parentPosition: initialData.parentPosition || '',
        level: initialData.level || 0,
        responsibilities: initialData.responsibilities?.length 
          ? initialData.responsibilities 
          : [''],
        requirements: {
          education: initialData.requirements?.education || '',
          experience: initialData.requirements?.experience || '',
          skills: initialData.requirements?.skills || [],
          certifications: initialData.requirements?.certifications || [],
        },
        status: initialData.status as 'active' | 'inactive' || 'active',
      });

      if (initialData.division) {
        setSelectedDivision(initialData.division);
      }
    }
  }, [initialData, isEdit, reset]);

  // Watch division value to filter parent positions
  const divisionValue = watch('division');
  
  useEffect(() => {
    if (divisionValue) {
      setSelectedDivision(divisionValue);
    }
  }, [divisionValue]);

  // Prepare division options for dropdown
  const divisionOptions = divisionsData?.data
    ? [
        { value: '', label: 'Pilih Divisi' },
        ...divisionsData.data.map((division) => ({
          value: division.id as string,
          label: `${division.code} - ${division.name}`,
        })),
      ]
    : [{ value: '', label: 'Memuat...' }];

  // Prepare parent position options for dropdown
  const parentPositionOptions = positionsData?.data
    ? [
        { value: '', label: 'Tidak Ada Jabatan Atasan' },
        ...positionsData.data
          .filter((position) => 
            // Only show positions from the same division
            position.division === selectedDivision && 
            // Don't show current position as parent option when editing
            (!isEdit || position.id !== initialData?.id)
          )
          .map((position) => ({
            value: position.id as string,
            label: `${position.code} - ${position.title}`,
          })),
      ]
    : [{ value: '', label: 'Memuat...' }];

  // Handle adding a skill
  const handleAddSkill = () => {
    if (skillInput.trim()) {
      const currentSkills = getValues('requirements.skills') || [];
      setValue('requirements.skills', [...currentSkills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  // Handle removing a skill
  const handleRemoveSkill = (index: number) => {
    const currentSkills = getValues('requirements.skills') || [];
    setValue(
      'requirements.skills',
      currentSkills.filter((_, i) => i !== index)
    );
  };

  // Handle adding a certification
  const handleAddCertification = () => {
    if (certificationInput.trim()) {
      const currentCertifications = getValues('requirements.certifications') || [];
      setValue('requirements.certifications', [...currentCertifications, certificationInput.trim()]);
      setCertificationInput('');
    }
  };

  // Handle removing a certification
  const handleRemoveCertification = (index: number) => {
    const currentCertifications = getValues('requirements.certifications') || [];
    setValue(
      'requirements.certifications',
      currentCertifications.filter((_, i) => i !== index)
    );
  };

  // Handle form submission
  const onSubmit = async (data: PositionFormValues) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      if (isEdit && initialData?.id) {
        // Update existing position
        await positionService.updatePosition(initialData.id, data);
        router.push(`/positions/${initialData.id}`);
      } else {
        // Create new position
        const response = await positionService.createPosition(data);
        router.push(`/positions/${response.data.id}`);
      }
    } catch (error) {
      console.error('Error saving position:', error);
      setServerError('Terjadi kesalahan saat menyimpan data jabatan. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-6 flex items-center">
        <Briefcase className="h-5 w-5 mr-2 text-primary" />
        {isEdit ? 'Edit Jabatan' : 'Tambah Jabatan Baru'}
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
                label="Kode Jabatan"
                name="code"
                register={register}
                error={errors.code?.message}
                placeholder="Contoh: MGR-IT"
                required
                disabled={isEdit} // Code cannot be changed when editing
                hint="Kode unik untuk jabatan (huruf kapital, angka, dan tanda hubung)"
              />
              
              <FormField
                label="Nama Jabatan"
                name="title"
                register={register}
                error={errors.title?.message}
                placeholder="Contoh: Manajer IT"
                required
                hint="Nama lengkap jabatan"
              />
            </div>
            
            <FormField
              label="Deskripsi"
              name="description"
              register={register}
              error={errors.description?.message}
              placeholder="Deskripsi singkat tentang jabatan ini"
              multiline
              rows={3}
              hint="Deskripsi singkat tentang peran dan tanggung jawab jabatan (opsional)"
            />
          </div>

          {/* Relationships */}
          <div className="space-y-4 md:col-span-2">
            <h3 className="text-lg font-medium border-b pb-2">Relasi</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Divisi <span className="text-red-500">*</span>
                </label>
                <Select
                  {...register('division')}
                  options={divisionOptions}
                  error={errors.division?.message}
                  required
                />
                {errors.division?.message && (
                  <p className="mt-1 text-sm text-red-600">{errors.division.message}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">Divisi tempat jabatan ini berada</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jabatan Atasan
                </label>
                <Select
                  {...register('parentPosition')}
                  options={parentPositionOptions}
                  error={errors.parentPosition?.message}
                  disabled={!selectedDivision}
                />
                {errors.parentPosition?.message && (
                  <p className="mt-1 text-sm text-red-600">{errors.parentPosition.message}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">Jabatan atasan dari jabatan ini (opsional)</p>
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
                    { value: '0', label: 'Direktur (Level 0)' },
                    { value: '1', label: 'Manajer (Level 1)' },
                    { value: '2', label: 'Supervisor (Level 2)' },
                    { value: '3', label: 'Staff Senior (Level 3)' },
                    { value: '4', label: 'Staff (Level 4)' },
                    { value: '5', label: 'Staff Junior (Level 5)' },
                  ]}
                  error={errors.level?.message}
                  required
                />
                {errors.level?.message && (
                  <p className="mt-1 text-sm text-red-600">{errors.level.message}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">Level hierarki jabatan dalam organisasi</p>
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
                <p className="mt-1 text-xs text-gray-500">Status operasional jabatan</p>
              </div>
            </div>
          </div>

          {/* Responsibilities */}
          <div className="space-y-4 md:col-span-2">
            <h3 className="text-lg font-medium border-b pb-2">Tanggung Jawab</h3>
            
            {responsibilityFields.map((field, index) => (
              <div key={field.id} className="flex items-start gap-2">
                <div className="flex-grow">
                  <FormField
                    label={index === 0 ? 'Tanggung Jawab' : ''}
                    name={`responsibilities.${index}`}
                    register={register}
                    error={errors.responsibilities?.[index]?.message}
                    placeholder="Contoh: Mengelola tim pengembangan aplikasi"
                  />
                </div>
                <div className="pt-7">
                  {index > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => removeResponsibility(index)}
                      className="p-2"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
            
            <Button
              type="button"
              variant="outline"
              onClick={() => appendResponsibility('')}
              className="flex items-center"
            >
              <Plus className="h-4 w-4 mr-1" />
              Tambah Tanggung Jawab
            </Button>
          </div>

          {/* Requirements */}
          <div className="space-y-4 md:col-span-2">
            <h3 className="text-lg font-medium border-b pb-2">Persyaratan</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Pendidikan"
                name="requirements.education"
                register={register}
                error={errors.requirements?.education?.message}
                placeholder="Contoh: S1 Teknik Informatika"
                hint="Persyaratan pendidikan untuk jabatan ini"
              />
              
              <FormField
                label="Pengalaman"
                name="requirements.experience"
                register={register}
                error={errors.requirements?.experience?.message}
                placeholder="Contoh: Minimal 3 tahun di bidang IT"
                hint="Persyaratan pengalaman untuk jabatan ini"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Keahlian
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  placeholder="Contoh: JavaScript"
                  className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddSkill}
                  className="flex items-center"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Tambah
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-2">
                {watch('requirements.skills')?.map((skill, index) => (
                  <div 
                    key={index} 
                    className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs flex items-center"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(index)}
                      className="ml-1 text-blue-500 hover:text-blue-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
              <p className="mt-1 text-xs text-gray-500">Keahlian yang dibutuhkan untuk jabatan ini</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sertifikasi
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={certificationInput}
                  onChange={(e) => setCertificationInput(e.target.value)}
                  placeholder="Contoh: AWS Certified Developer"
                  className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddCertification}
                  className="flex items-center"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Tambah
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-2">
                {watch('requirements.certifications')?.map((certification, index) => (
                  <div 
                    key={index} 
                    className="bg-amber-50 text-amber-700 px-2 py-1 rounded-full text-xs flex items-center"
                  >
                    {certification}
                    <button
                      type="button"
                      onClick={() => handleRemoveCertification(index)}
                      className="ml-1 text-amber-500 hover:text-amber-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
              <p className="mt-1 text-xs text-gray-500">Sertifikasi yang dibutuhkan untuk jabatan ini</p>
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

export default PositionForm;
