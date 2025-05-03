'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Select } from '@/components/atoms/Select';
import { Textarea } from '@/components/atoms/Textarea';

const customerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  customerType: z.enum(['individual', 'corporate', 'reseller']),
  contactPerson: z.string().min(1, 'Contact person is required'),
  phoneNumber: z.string().min(1, 'Phone number is required'),
  email: z.string().email('Invalid email address'),
  taxId: z.string().optional(),
  address: z.object({
    street: z.string().min(1, 'Street address is required'),
    city: z.string().min(1, 'City is required'),
    district: z.string().min(1, 'District is required'),
    province: z.string().min(1, 'Province is required'),
    postalCode: z.string().min(1, 'Postal code is required'),
    country: z.string().default('Indonesia'),
  }),
  creditLimit: z.number().nonnegative().optional(),
  paymentTerms: z.number().nonnegative().optional(),
});

/**
 * CustomerForm - Form component for creating and editing customers
 */
export function CustomerForm({ initialData, onSubmit, isSubmitting }) {
  const [customerType, setCustomerType] = useState(initialData?.customerType || 'individual');
  
  const defaultValues = {
    name: '',
    customerType: 'individual',
    contactPerson: '',
    phoneNumber: '',
    email: '',
    taxId: '',
    address: {
      street: '',
      city: '',
      district: '',
      province: '',
      postalCode: '',
      country: 'Indonesia',
    },
    creditLimit: 0,
    paymentTerms: 0,
    ...initialData,
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(customerSchema),
    defaultValues,
  });

  const submitHandler = (data) => {
    // Convert creditLimit and paymentTerms to numbers
    const formattedData = {
      ...data,
      creditLimit: data.creditLimit ? Number(data.creditLimit) : 0,
      paymentTerms: data.paymentTerms ? Number(data.paymentTerms) : 0,
    };
    
    onSubmit(formattedData);
  };

  const handleCustomerTypeChange = (e) => {
    setCustomerType(e.target.value);
    setValue('customerType', e.target.value);
  };

  return (
    <form onSubmit={handleSubmit(submitHandler)} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
          
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Customer Name <span className="text-red-500">*</span>
            </label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Enter customer name"
              error={errors.name?.message}
            />
          </div>
          
          <div>
            <label htmlFor="customerType" className="block text-sm font-medium text-gray-700 mb-1">
              Customer Type <span className="text-red-500">*</span>
            </label>
            <Select
              id="customerType"
              {...register('customerType')}
              value={customerType}
              onChange={handleCustomerTypeChange}
              error={errors.customerType?.message}
            >
              <option value="individual">Individual</option>
              <option value="corporate">Corporate</option>
              <option value="reseller">Reseller</option>
            </Select>
          </div>
          
          <div>
            <label htmlFor="contactPerson" className="block text-sm font-medium text-gray-700 mb-1">
              Contact Person <span className="text-red-500">*</span>
            </label>
            <Input
              id="contactPerson"
              {...register('contactPerson')}
              placeholder="Enter contact person name"
              error={errors.contactPerson?.message}
            />
          </div>
          
          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <Input
              id="phoneNumber"
              {...register('phoneNumber')}
              placeholder="Enter phone number"
              error={errors.phoneNumber?.message}
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="Enter email address"
              error={errors.email?.message}
            />
          </div>
          
          {(customerType === 'corporate' || customerType === 'reseller') && (
            <div>
              <label htmlFor="taxId" className="block text-sm font-medium text-gray-700 mb-1">
                Tax ID / NPWP
              </label>
              <Input
                id="taxId"
                {...register('taxId')}
                placeholder="Enter tax ID / NPWP"
                error={errors.taxId?.message}
              />
            </div>
          )}
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Address Information</h3>
          
          <div>
            <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-1">
              Street Address <span className="text-red-500">*</span>
            </label>
            <Textarea
              id="street"
              {...register('address.street')}
              placeholder="Enter street address"
              error={errors.address?.street?.message}
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                City <span className="text-red-500">*</span>
              </label>
              <Input
                id="city"
                {...register('address.city')}
                placeholder="Enter city"
                error={errors.address?.city?.message}
              />
            </div>
            
            <div>
              <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-1">
                District <span className="text-red-500">*</span>
              </label>
              <Input
                id="district"
                {...register('address.district')}
                placeholder="Enter district"
                error={errors.address?.district?.message}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="province" className="block text-sm font-medium text-gray-700 mb-1">
                Province <span className="text-red-500">*</span>
              </label>
              <Input
                id="province"
                {...register('address.province')}
                placeholder="Enter province"
                error={errors.address?.province?.message}
              />
            </div>
            
            <div>
              <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                Postal Code <span className="text-red-500">*</span>
              </label>
              <Input
                id="postalCode"
                {...register('address.postalCode')}
                placeholder="Enter postal code"
                error={errors.address?.postalCode?.message}
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
              Country
            </label>
            <Input
              id="country"
              {...register('address.country')}
              defaultValue="Indonesia"
              error={errors.address?.country?.message}
            />
          </div>
        </div>
      </div>
      
      {(customerType === 'corporate' || customerType === 'reseller') && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Financial Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="creditLimit" className="block text-sm font-medium text-gray-700 mb-1">
                Credit Limit (Rp)
              </label>
              <Input
                id="creditLimit"
                type="number"
                {...register('creditLimit')}
                placeholder="Enter credit limit"
                error={errors.creditLimit?.message}
              />
            </div>
            
            <div>
              <label htmlFor="paymentTerms" className="block text-sm font-medium text-gray-700 mb-1">
                Payment Terms (days)
              </label>
              <Input
                id="paymentTerms"
                type="number"
                {...register('paymentTerms')}
                placeholder="Enter payment terms in days"
                error={errors.paymentTerms?.message}
              />
            </div>
          </div>
        </div>
      )}
      
      <div className="flex justify-end space-x-4">
        <Button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : initialData ? 'Update Customer' : 'Create Customer'}
        </Button>
      </div>
    </form>
  );
}
