import React from 'react';
import { Control, FieldErrors, UseFormRegister, Controller } from 'react-hook-form';
import FormField from '../FormField';
import Select from '../../atoms/Select';

interface PersonalInfoFormProps {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  control: Control<any>;
}

/**
 * PersonalInfoForm - Component for employee personal information form fields
 */
const PersonalInfoForm: React.FC<PersonalInfoFormProps> = ({
  register,
  errors,
  control,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h2 className="text-lg font-semibold mb-4">Informasi Dasar</h2>
        
        <FormField
          label="ID Karyawan"
          name="employeeId"
          type="text"
          placeholder="Masukkan ID karyawan"
          error={errors.employeeId?.message}
          register={register}
          required
        />
        
        <FormField
          label="Nama Depan"
          name="firstName"
          type="text"
          placeholder="Masukkan nama depan"
          error={errors.firstName?.message}
          register={register}
          required
        />
        
        <FormField
          label="Nama Belakang"
          name="lastName"
          type="text"
          placeholder="Masukkan nama belakang"
          error={errors.lastName?.message}
          register={register}
          required
        />
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Jenis Kelamin <span className="text-red-500">*</span>
          </label>
          <Controller
            name="gender"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                options={[
                  { value: 'male', label: 'Laki-laki' },
                  { value: 'female', label: 'Perempuan' },
                  { value: 'other', label: 'Lainnya' },
                ]}
              />
            )}
          />
          {errors.gender && (
            <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>
          )}
        </div>
      </div>
      
      <div>
        <h2 className="text-lg font-semibold mb-4">Informasi Tambahan</h2>
        
        <FormField
          label="Tanggal Lahir"
          name="birthDate"
          type="date"
          error={errors.birthDate?.message}
          register={register}
          required
        />
        
        <FormField
          label="Tempat Lahir"
          name="birthPlace"
          type="text"
          placeholder="Masukkan tempat lahir"
          error={errors.birthPlace?.message}
          register={register}
        />
        
        <FormField
          label="Agama"
          name="religion"
          type="text"
          placeholder="Masukkan agama"
          error={errors.religion?.message}
          register={register}
        />
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status Pernikahan
          </label>
          <Controller
            name="maritalStatus"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                options={[
                  { value: 'single', label: 'Belum Menikah' },
                  { value: 'married', label: 'Menikah' },
                  { value: 'divorced', label: 'Cerai' },
                  { value: 'widowed', label: 'Janda/Duda' },
                ]}
              />
            )}
          />
          {errors.maritalStatus && (
            <p className="mt-1 text-sm text-red-600">{errors.maritalStatus.message}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoForm;
