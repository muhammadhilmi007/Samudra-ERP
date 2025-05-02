/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable react/button-has-type */
/* eslint-disable no-nested-ternary */
/* eslint-disable no-shadow */
/* eslint-disable react/jsx-filename-extension */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable react/function-component-definition */
/* eslint-disable react/require-default-props */

import React from 'react';
import { Control, FieldErrors, UseFormRegister, Controller } from 'react-hook-form';
import FormField from '../FormField';
import Select from '../../atoms/Select';

interface EmploymentFormValues {
  joinDate: string;
  terminationDate?: string;
  employmentType: string;
  employmentStatus: string;
  notes?: string;
  bankAccount?: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  };
  taxId?: string;
  bpjsKesehatan?: string;
  bpjsKetenagakerjaan?: string;
}

interface EmploymentInfoFormProps {
  register: UseFormRegister<EmploymentFormValues>;
  errors: FieldErrors<EmploymentFormValues>;
  control: Control<EmploymentFormValues>;
}

/**
 * EmploymentInfoForm - Component for employee employment information form fields
 */
const EmploymentInfoForm: React.FC<EmploymentInfoFormProps> = ({
  register,
  errors,
  control,
}) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h2 className="text-lg font-semibold mb-4">Status Kepegawaian</h2>
        
        <FormField
          label="Tanggal Bergabung"
          name="joinDate"
          type="date"
          error={errors.joinDate?.message}
          register={register}
          required
        />
        
        <FormField
          label="Tanggal Berhenti"
          name="terminationDate"
          type="date"
          error={errors.terminationDate?.message}
          register={register}
        />
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipe Kepegawaian <span className="text-red-500">*</span>
          </label>
          <Controller
            name="employmentType"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                options={[
                  { value: 'fullTime', label: 'Full Time' },
                  { value: 'partTime', label: 'Part Time' },
                  { value: 'contract', label: 'Kontrak' },
                  { value: 'probation', label: 'Probation' },
                ]}
              />
            )}
          />
          {errors.employmentType && (
            <p className="mt-1 text-sm text-red-600">{errors.employmentType.message}</p>
          )}
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status Kepegawaian <span className="text-red-500">*</span>
          </label>
          <Controller
            name="employmentStatus"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                options={[
                  { value: 'active', label: 'Aktif' },
                  { value: 'inactive', label: 'Tidak Aktif' },
                  { value: 'terminated', label: 'Diberhentikan' },
                  { value: 'onLeave', label: 'Cuti' },
                ]}
              />
            )}
          />
          {errors.employmentStatus && (
            <p className="mt-1 text-sm text-red-600">{errors.employmentStatus.message}</p>
          )}
        </div>
        
        <FormField
          label="Keterangan"
          name="notes"
          type="textarea"
          placeholder="Masukkan catatan tambahan"
          error={errors.notes?.message}
          register={register}
        />
      </div>
      
      <div>
        <h2 className="text-lg font-semibold mb-4">Informasi Keuangan</h2>
        
        <FormField
          label="Jenis Pegawai"
          name="employmentType"
          type="text"
          error={errors.employmentType?.message}
          register={register}
          required
        />
        
        <FormField
          label="Status Pegawai"
          name="employmentStatus"
          type="text"
          error={errors.employmentStatus?.message}
          register={register}
          required
        />
        
        <FormField
          label="NPWP"
          name="taxId"
          type="text"
          placeholder="Masukkan nomor NPWP"
          error={errors.taxId?.message}
          register={register}
        />
        
        <FormField
          label="BPJS Kesehatan"
          name="bpjsKesehatan"
          type="text"
          placeholder="Masukkan nomor BPJS Kesehatan"
          error={errors.bpjsKesehatan?.message}
          register={register}
        />
        
        <FormField
          label="BPJS Ketenagakerjaan"
          name="bpjsKetenagakerjaan"
          type="text"
          placeholder="Masukkan nomor BPJS Ketenagakerjaan"
          error={errors.bpjsKetenagakerjaan?.message}
          register={register}
        />
      </div>
    </div>
  )

export default EmploymentInfoForm;
