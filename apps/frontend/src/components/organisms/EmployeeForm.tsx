'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { Employee } from '../../services/employeeService';
import FormField from '../molecules/FormField';
import Button from '../atoms/Button';
import Select from '../atoms/Select';
import PersonalInfoForm from '../molecules/employee/PersonalInfoForm';
import ContactInfoForm from '../molecules/employee/ContactInfoForm';
import EmploymentInfoForm from '../molecules/employee/EmploymentInfoForm';

// Define form schema
const employeeSchema = z.object({
  employeeId: z.string().min(2, 'ID karyawan minimal 2 karakter'),
  firstName: z.string().min(1, 'Nama depan harus diisi'),
  lastName: z.string().min(1, 'Nama belakang harus diisi'),
  gender: z.enum(['male', 'female', 'other']),
  birthDate: z.string().min(1, 'Tanggal lahir harus diisi'),
  birthPlace: z.string().optional(),
  religion: z.string().optional(),
  maritalStatus: z.enum(['single', 'married', 'divorced', 'widowed']).optional(),
  contact: z.object({
    phone: z.string().min(1, 'Nomor telepon harus diisi'),
    email: z.string().email('Format email tidak valid'),
    alternativePhone: z.string().optional(),
    emergencyContact: z.object({
      name: z.string().optional(),
      relationship: z.string().optional(),
      phone: z.string().optional(),
    }).optional(),
  }),
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
  metadata: z.object({
    joinDate: z.string().min(1, 'Tanggal bergabung harus diisi'),
    terminationDate: z.string().optional(),
    employmentType: z.enum(['fullTime', 'partTime', 'contract', 'probation']),
    employmentStatus: z.enum(['active', 'inactive', 'terminated', 'onLeave']),
    bankAccount: z.object({
      bankName: z.string().optional(),
      accountNumber: z.string().optional(),
      accountHolder: z.string().optional(),
    }).optional(),
    taxId: z.string().optional(),
    bpjsKesehatan: z.string().optional(),
    bpjsKetenagakerjaan: z.string().optional(),
    notes: z.string().optional(),
  }),
  currentAssignment: z.object({
    branchId: z.string().optional(),
    divisionId: z.string().optional(),
    positionId: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    status: z.enum(['active', 'completed', 'terminated']).optional(),
    notes: z.string().optional(),
  }).optional(),
});

type EmployeeFormValues = z.infer<typeof employeeSchema>;

interface EmployeeFormProps {
  initialData?: Employee;
  isEdit?: boolean;
}

/**
 * EmployeeForm - Component for creating and editing employees
 */
const EmployeeForm: React.FC<EmployeeFormProps> = ({ initialData, isEdit = false }) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('personal');

  // Convert initial data to form values
  const getInitialFormValues = (): EmployeeFormValues => {
    if (!initialData) {
      return {
        employeeId: '',
        firstName: '',
        lastName: '',
        gender: 'male',
        birthDate: '',
        birthPlace: '',
        religion: '',
        maritalStatus: 'single',
        contact: {
          phone: '',
          email: '',
          alternativePhone: '',
          emergencyContact: {
            name: '',
            relationship: '',
            phone: '',
          },
        },
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
        metadata: {
          joinDate: '',
          terminationDate: '',
          employmentType: 'fullTime',
          employmentStatus: 'active',
          bankAccount: {
            bankName: '',
            accountNumber: '',
            accountHolder: '',
          },
          taxId: '',
          bpjsKesehatan: '',
          bpjsKetenagakerjaan: '',
          notes: '',
        },
        currentAssignment: {
          branchId: '',
          divisionId: '',
          positionId: '',
          startDate: '',
          endDate: '',
          status: 'active',
          notes: '',
        },
      };
    }

    return {
      employeeId: initialData.employeeId,
      firstName: initialData.firstName,
      lastName: initialData.lastName,
      gender: initialData.gender,
      birthDate: initialData.birthDate ? new Date(initialData.birthDate).toISOString().split('T')[0] : '',
      birthPlace: initialData.birthPlace || '',
      religion: initialData.religion || '',
      maritalStatus: initialData.maritalStatus || 'single',
      contact: {
        phone: initialData.contact.phone,
        email: initialData.contact.email,
        alternativePhone: initialData.contact.alternativePhone || '',
        emergencyContact: initialData.contact.emergencyContact || {
          name: '',
          relationship: '',
          phone: '',
        },
      },
      address: {
        street: initialData.address.street,
        city: initialData.address.city,
        province: initialData.address.province,
        postalCode: initialData.address.postalCode,
        country: initialData.address.country || 'Indonesia',
        coordinates: initialData.address.coordinates || {
          latitude: null,
          longitude: null,
        },
      },
      metadata: {
        joinDate: initialData.metadata.joinDate ? new Date(initialData.metadata.joinDate).toISOString().split('T')[0] : '',
        terminationDate: initialData.metadata.terminationDate ? new Date(initialData.metadata.terminationDate).toISOString().split('T')[0] : '',
        employmentType: initialData.metadata.employmentType,
        employmentStatus: initialData.metadata.employmentStatus,
        bankAccount: initialData.metadata.bankAccount || {
          bankName: '',
          accountNumber: '',
          accountHolder: '',
        },
        taxId: initialData.metadata.taxId || '',
        bpjsKesehatan: initialData.metadata.bpjsKesehatan || '',
        bpjsKetenagakerjaan: initialData.metadata.bpjsKetenagakerjaan || '',
        notes: initialData.metadata.notes || '',
      },
      currentAssignment: initialData.currentAssignment || {
        branchId: '',
        divisionId: '',
        positionId: '',
        startDate: '',
        endDate: '',
        status: 'active',
        notes: '',
      },
    };
  };

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: getInitialFormValues(),
  });

  // Handle form submission
  const onSubmit = async (data: EmployeeFormValues) => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Format data for API
      const employeeData: Employee = {
        ...data,
        birthDate: new Date(data.birthDate),
        metadata: {
          ...data.metadata,
          joinDate: new Date(data.metadata.joinDate),
          terminationDate: data.metadata.terminationDate ? new Date(data.metadata.terminationDate) : undefined,
        },
        currentAssignment: data.currentAssignment ? {
          ...data.currentAssignment,
          startDate: data.currentAssignment.startDate ? new Date(data.currentAssignment.startDate) : new Date(),
          endDate: data.currentAssignment.endDate ? new Date(data.currentAssignment.endDate) : undefined,
        } : undefined,
      };

      // TODO: Implement API call to create/update employee
      console.log('Employee data to submit:', employeeData);

      // Redirect to employees list
      router.push('/employees');
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
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              type="button"
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'personal'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('personal')}
            >
              Informasi Pribadi
            </button>
            <button
              type="button"
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'contact'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('contact')}
            >
              Kontak & Alamat
            </button>
            <button
              type="button"
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'employment'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('employment')}
            >
              Informasi Kepegawaian
            </button>
            <button
              type="button"
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'assignment'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('assignment')}
            >
              Penempatan
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mb-6">
          {activeTab === 'personal' && (
            <PersonalInfoForm 
              register={register} 
              errors={errors} 
              control={control} 
            />
          )}

          {activeTab === 'contact' && (
            <ContactInfoForm 
              register={register} 
              errors={errors} 
              control={control} 
            />
          )}

          {activeTab === 'employment' && (
            <EmploymentInfoForm 
              register={register} 
              errors={errors} 
              control={control} 
            />
          )}

          {activeTab === 'assignment' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-lg font-semibold mb-4">Penempatan Saat Ini</h2>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cabang
                  </label>
                  <select
                    {...register('currentAssignment.branchId')}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="">Pilih Cabang</option>
                    {/* TODO: Add branch options */}
                  </select>
                  {errors.currentAssignment?.branchId && (
                    <p className="mt-1 text-sm text-red-600">{errors.currentAssignment.branchId.message}</p>
                  )}
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Divisi
                  </label>
                  <select
                    {...register('currentAssignment.divisionId')}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="">Pilih Divisi</option>
                    {/* TODO: Add division options */}
                  </select>
                  {errors.currentAssignment?.divisionId && (
                    <p className="mt-1 text-sm text-red-600">{errors.currentAssignment.divisionId.message}</p>
                  )}
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Jabatan
                  </label>
                  <select
                    {...register('currentAssignment.positionId')}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="">Pilih Jabatan</option>
                    {/* TODO: Add position options */}
                  </select>
                  {errors.currentAssignment?.positionId && (
                    <p className="mt-1 text-sm text-red-600">{errors.currentAssignment.positionId.message}</p>
                  )}
                </div>
              </div>
              
              <div>
                <h2 className="text-lg font-semibold mb-4">Periode Penempatan</h2>
                
                <FormField
                  label="Tanggal Mulai"
                  name="currentAssignment.startDate"
                  type="date"
                  error={errors.currentAssignment?.startDate?.message}
                  register={register}
                />
                
                <FormField
                  label="Tanggal Berakhir"
                  name="currentAssignment.endDate"
                  type="date"
                  error={errors.currentAssignment?.endDate?.message}
                  register={register}
                />
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    {...register('currentAssignment.status')}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="active">Aktif</option>
                    <option value="completed">Selesai</option>
                    <option value="terminated">Diberhentikan</option>
                  </select>
                  {errors.currentAssignment?.status && (
                    <p className="mt-1 text-sm text-red-600">{errors.currentAssignment.status.message}</p>
                  )}
                </div>
                
                <FormField
                  label="Catatan"
                  name="currentAssignment.notes"
                  type="textarea"
                  error={errors.currentAssignment?.notes?.message}
                  register={register}
                />
              </div>
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 border-t border-gray-200 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/employees')}
            disabled={isSubmitting}
          >
            Batal
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Menyimpan...' : isEdit ? 'Perbarui' : 'Simpan'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EmployeeForm;
