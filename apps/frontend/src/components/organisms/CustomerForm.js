'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Select } from '@/components/atoms/Select';
import { Textarea } from '@/components/atoms/Textarea';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/atoms/Form';
import { Form } from '@/components/atoms/Form';

// Define the validation schema using zod
const customerSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  customerType: z.enum(['individual', 'corporate', 'reseller']),
  contactPerson: z.string().min(2, { message: 'Contact person must be at least 2 characters' }),
  phoneNumber: z.string().min(10, { message: 'Phone number must be at least 10 characters' }),
  email: z.string().email({ message: 'Invalid email address' }),
  taxId: z.string().optional(),
  creditLimit: z.coerce.number().min(0, { message: 'Credit limit must be a positive number' }).optional(),
  paymentTerms: z.coerce.number().min(0, { message: 'Payment terms must be a positive number' }).optional(),
  address: z.object({
    street: z.string().min(2, { message: 'Street address must be at least 2 characters' }),
    city: z.string().min(2, { message: 'City must be at least 2 characters' }),
    district: z.string().min(2, { message: 'District must be at least 2 characters' }),
    province: z.string().min(2, { message: 'Province must be at least 2 characters' }),
    postalCode: z.string().min(5, { message: 'Postal code must be at least 5 characters' }),
    country: z.string().default('Indonesia'),
  }),
  branch: z.string().optional(),
  status: z.enum(['active', 'inactive']).default('active'),
});

export function CustomerForm({ initialData, onSubmit, isSubmitting }) {
  const [branches, setBranches] = useState([]);
  
  // Initialize the form with default values or initial data
  const form = useForm({
    resolver: zodResolver(customerSchema),
    defaultValues: initialData ? {
      ...initialData,
      branch: initialData.branch?._id || initialData.branch,
      creditLimit: initialData.creditLimit || 0,
      paymentTerms: initialData.paymentTerms || 0,
    } : {
      name: '',
      customerType: 'individual',
      contactPerson: '',
      phoneNumber: '',
      email: '',
      taxId: '',
      creditLimit: 0,
      paymentTerms: 0,
      address: {
        street: '',
        city: '',
        district: '',
        province: '',
        postalCode: '',
        country: 'Indonesia',
      },
      status: 'active',
    },
  });

  // Fetch branches for the branch select field
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        // This would be replaced with an actual API call
        // const response = await branchService.getBranches();
        // setBranches(response.data);
        
        // Mock data for now
        setBranches([
          { _id: '1', name: 'Jakarta Branch' },
          { _id: '2', name: 'Surabaya Branch' },
          { _id: '3', name: 'Bandung Branch' },
          { _id: '4', name: 'Medan Branch' },
        ]);
      } catch (error) {
        console.error('Error fetching branches:', error);
      }
    };

    fetchBranches();
  }, []);

  // Handle form submission
  const handleSubmit = (data) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>
            
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer Name *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter customer name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="customerType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer Type *</FormLabel>
                  <FormControl>
                    <Select {...field}>
                      <option value="individual">Individual</option>
                      <option value="corporate">Corporate</option>
                      <option value="reseller">Reseller</option>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="contactPerson"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Person *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter contact person name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter phone number" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter email address" type="email" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="taxId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tax ID</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter tax ID (NPWP)" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <FormControl>
                    <Select {...field}>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          {/* Address Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Address Information</h3>
            
            <FormField
              control={form.control}
              name="address.street"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Street Address *</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Enter street address" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="address.city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter city" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="address.district"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>District *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter district" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="address.province"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Province *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter province" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="address.postalCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postal Code *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter postal code" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="address.country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter country" defaultValue="Indonesia" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          {/* Financial Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Financial Information</h3>
            
            <FormField
              control={form.control}
              name="creditLimit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Credit Limit (Rp)</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" min="0" placeholder="Enter credit limit" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="paymentTerms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Terms (days)</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" min="0" placeholder="Enter payment terms in days" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          {/* Branch Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Branch Information</h3>
            
            <FormField
              control={form.control}
              name="branch"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Branch</FormLabel>
                  <FormControl>
                    <Select 
                      {...field} 
                      value={field.value || ''}
                      onChange={(e) => field.onChange(e.target.value)}
                    >
                      <option value="">Select Branch</option>
                      {branches.map((branch) => (
                        <option key={branch._id} value={branch._id}>
                          {branch.name}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-4 pt-4">
          <Button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : initialData ? 'Update Customer' : 'Create Customer'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
