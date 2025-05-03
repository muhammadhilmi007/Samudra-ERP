'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';
import { PageHeader } from '@/components/molecules/PageHeader';
import { CustomerForm } from '@/components/organisms/CustomerForm';
import { useToast } from '@/hooks/useToast';
import { customerService } from '@/services/customerService';

export default function EditCustomerPage({ params }) {
  const { id } = params;
  const router = useRouter();
  const { toast } = useToast();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const isNewCustomer = id === 'create';

  useEffect(() => {
    if (!isNewCustomer) {
      fetchCustomer();
    } else {
      setLoading(false);
    }
  }, [id, isNewCustomer]);

  const fetchCustomer = async () => {
    try {
      setLoading(true);
      const response = await customerService.getCustomerById(id);
      setCustomer(response.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch customer details. Please try again.',
        variant: 'destructive',
      });
      console.error('Error fetching customer:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      setSubmitting(true);
      
      if (isNewCustomer) {
        await customerService.createCustomer(formData);
        toast({
          title: 'Success',
          description: 'Customer created successfully.',
        });
      } else {
        await customerService.updateCustomer(id, formData);
        toast({
          title: 'Success',
          description: 'Customer updated successfully.',
        });
      }
      
      router.push(isNewCustomer ? '/customers' : `/customers/${id}`);
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${isNewCustomer ? 'create' : 'update'} customer. Please try again.`,
        variant: 'destructive',
      });
      console.error(`Error ${isNewCustomer ? 'creating' : 'updating'} customer:`, error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Loading customer details...</p>
        </div>
      </div>
    );
  }

  if (!isNewCustomer && !customer) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-gray-500 mb-4">Customer not found</p>
          <Button onClick={() => router.push('/customers')}>
            Back to Customers
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader
        title={isNewCustomer ? 'Create New Customer' : 'Edit Customer'}
        description={isNewCustomer ? 'Add a new customer to the system' : `Editing ${customer.name}`}
        actions={
          <Button 
            variant="outline"
            onClick={() => router.push(isNewCustomer ? '/customers' : `/customers/${id}`)}
          >
            Cancel
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>{isNewCustomer ? 'Customer Information' : 'Edit Customer Information'}</CardTitle>
        </CardHeader>
        <CardContent>
          <CustomerForm 
            initialData={isNewCustomer ? null : customer}
            onSubmit={handleSubmit}
            isSubmitting={submitting}
          />
        </CardContent>
      </Card>
    </div>
  );
}
