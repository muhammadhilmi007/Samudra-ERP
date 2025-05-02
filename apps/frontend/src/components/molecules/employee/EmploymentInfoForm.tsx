import React from 'react';
import { Control, FieldErrors, UseFormRegister, Controller } from 'react-hook-form';
import FormField from '../FormField';
import Select from '../../atoms/Select';

interface EmploymentInfoFormProps {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  control: Control<any>;
}

/**
 * EmploymentInfoForm - Component for employee employment information form fields
 */
const EmploymentInfoForm: React.FC<EmploymentInfoFormProps> = ({
  register,
  errors,
  control,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h2 className="text-lg font-semibold mb-4">Status Kepegawaian</h2>
        
        <FormField
          label="Tanggal Bergabung"
          name="metadata.joinDate"
          type="date"
          error={errors.metadata?.joinDate?.message}
          register={register}
          required
        />
        
        <FormField
          label="Tanggal Berhenti"
          name="metadata.terminationDate"
          type="date"
          error={errors.metadata?.terminationDate?.message}
          register={register}
        />
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipe Kepegawaian <span className="text-red-500">*</span>
          </label>
          <Controller
            name="metadata.employmentType"
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
          {errors.metadata?.employmentType && (
            <p className="mt-1 text-sm text-red-600">{errors.metadata.employmentType.message}</p>
          )}
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status Kepegawaian <span className="text-red-500">*</span>
          </label>
          <Controller
            name="metadata.employmentStatus"
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
          {errors.metadata?.employmentStatus && (
            <p className="mt-1 text-sm text-red-600">{errors.metadata.employmentStatus.message}</p>
          )}
        </div>
        
        <FormField
          label="Catatan"
          name="metadata.notes"
          type="textarea"
          placeholder="Masukkan catatan tambahan"
          error={errors.metadata?.notes?.message}
          register={register}
        />
      </div>
      
      <div>
        <h2 className="text-lg font-semibold mb-4">Informasi Tambahan</h2>
        
        <div className="mb-4">
          <h3 className="text-md font-medium mb-3">Rekening Bank</h3>
          
          <FormField
            label="Nama Bank"
            name="metadata.bankAccount.bankName"
            type="text"
            placeholder="Masukkan nama bank"
            error={errors.metadata?.bankAccount?.bankName?.message}
            register={register}
          />
          
          <FormField
            label="Nomor Rekening"
            name="metadata.bankAccount.accountNumber"
            type="text"
            placeholder="Masukkan nomor rekening"
            error={errors.metadata?.bankAccount?.accountNumber?.message}
            register={register}
          />
          
          <FormField
            label="Nama Pemilik Rekening"
            name="metadata.bankAccount.accountHolder"
            type="text"
            placeholder="Masukkan nama pemilik rekening"
            error={errors.metadata?.bankAccount?.accountHolder?.message}
            register={register}
          />
        </div>
        
        <div className="mt-6">
          <h3 className="text-md font-medium mb-3">Informasi Pajak & BPJS</h3>
          
          <FormField
            label="NPWP"
            name="metadata.taxId"
            type="text"
            placeholder="Masukkan NPWP"
            error={errors.metadata?.taxId?.message}
            register={register}
          />
          
          <FormField
            label="BPJS Kesehatan"
            name="metadata.bpjsKesehatan"
            type="text"
            placeholder="Masukkan nomor BPJS Kesehatan"
            error={errors.metadata?.bpjsKesehatan?.message}
            register={register}
          />
          
          <FormField
            label="BPJS Ketenagakerjaan"
            name="metadata.bpjsKetenagakerjaan"
            type="text"
            placeholder="Masukkan nomor BPJS Ketenagakerjaan"
            error={errors.metadata?.bpjsKetenagakerjaan?.message}
            register={register}
          />
        </div>
      </div>
    </div>
  );
};

export default EmploymentInfoForm;
