/* eslint-disable react/button-has-type */
/* eslint-disable no-nested-ternary */
/* eslint-disable no-shadow */
/* eslint-disable react/jsx-filename-extension */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable react/function-component-definition */
/* eslint-disable react/require-default-props */

import React from 'react';
import { Control, FieldErrors, UseFormRegister } from 'react-hook-form';
import FormField from '../FormField';

interface ContactFormValues {
  contact: {
    phone: string;
    email: string;
    alternativePhone?: string;
    emergencyContact?: {
      name: string;
      relationship: string;
      phone: string;
    };
  };
  address: {
    street: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
}

interface ContactInfoFormProps {
  register: UseFormRegister<ContactFormValues>;
  errors: FieldErrors<ContactFormValues>;
  control: Control<ContactFormValues>;
}

/**
 * ContactInfoForm - Component for employee contact and address information form fields
 */
const ContactInfoForm: React.FC<ContactInfoFormProps> = ({
  register,
  errors,
  control,
}) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h2 className="text-lg font-semibold mb-4">Informasi Kontak</h2>
        
        <FormField
          label="Nomor Telepon"
          name="contact.phone"
          type="tel"
          placeholder="Masukkan nomor telepon"
          error={errors.contact?.phone?.message}
          register={register}
          required
        />
        
        <FormField
          label="Email"
          name="contact.email"
          type="email"
          placeholder="Masukkan alamat email"
          error={errors.contact?.email?.message}
          register={register}
          required
        />
        
        <FormField
          label="Nomor Telepon Alternatif"
          name="contact.alternativePhone"
          type="tel"
          placeholder="Masukkan nomor telepon alternatif"
          error={errors.contact?.alternativePhone?.message}
          register={register}
        />
        
        <div className="mt-6">
          <h3 className="text-md font-medium mb-3">Kontak Darurat</h3>
          
          <FormField
            label="Nama Kontak Darurat"
            name="contact.emergencyContact.name"
            type="text"
            placeholder="Masukkan nama kontak darurat"
            error={errors.contact?.emergencyContact?.name?.message}
            register={register}
          />
          
          <FormField
            label="Hubungan"
            name="contact.emergencyContact.relationship"
            type="text"
            placeholder="Masukkan hubungan"
            error={errors.contact?.emergencyContact?.relationship?.message}
            register={register}
          />
          
          <FormField
            label="Nomor Telepon Darurat"
            name="contact.emergencyContact.phone"
            type="tel"
            placeholder="Masukkan nomor telepon darurat"
            error={errors.contact?.emergencyContact?.phone?.message}
            register={register}
          />
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
            required
          />
        </div>
        
        <div className="mt-4">
          <h3 className="text-md font-medium mb-3">Koordinat (Opsional)</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Latitude"
              name="address.coordinates.latitude"
              type="number"
              step="0.000001"
              placeholder="Masukkan latitude"
              error={errors.address?.coordinates?.latitude?.message}
              register={register}
            />
            
            <FormField
              label="Longitude"
              name="address.coordinates.longitude"
              type="number"
              step="0.000001"
              placeholder="Masukkan longitude"
              error={errors.address?.coordinates?.longitude?.message}
              register={register}
            />
          </div>
        </div>
      </div>
    </div>
  );

export default ContactInfoForm;
