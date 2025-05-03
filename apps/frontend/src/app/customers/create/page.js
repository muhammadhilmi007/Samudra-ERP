'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';
import { PageHeader } from '@/components/molecules/PageHeader';
import { CustomerForm } from '@/components/organisms/CustomerForm';
import { useToast } from '@/hooks/useToast';
import { customerService } from '@/services/customerService';

export default function CreateCustomerPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (formData) => {
    try {
      setSubmitting(true);
      await customerService.createCustomer(formData);
      toast({
        title: 'Success',
        description: 'Customer created successfully.',
      });
      router.push('/customers');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create customer. Please try again.',
        variant: 'destructive',
      });
      console.error('Error creating customer:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader
        title="Create New Customer"
        description="Add a new customer to the system"
        actions={
          <Button 
            variant="outline"
            onClick={() => router.push('/customers')}
          >
            Cancel
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Customer Information</CardTitle>
        </CardHeader>
        <CardContent>
          <CustomerForm 
            initialData={null}
            onSubmit={handleSubmit}
            isSubmitting={submitting}
          />
        </CardContent>
      </Card>
    </div>
  );
}
