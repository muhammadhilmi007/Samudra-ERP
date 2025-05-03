'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/atoms/Tabs';
import { PageHeader } from '@/components/molecules/PageHeader';
import { Timeline } from '@/components/molecules/Timeline';
import { useToast } from '@/hooks/useToast';
import { customerService } from '@/services/customerService';

export default function CustomerDetailPage({ params }) {
  const { id } = params;
  const router = useRouter();
  const { toast } = useToast();
  const [customer, setCustomer] = useState(null);
  const [activityHistory, setActivityHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(true);

  useEffect(() => {
    fetchCustomer();
    fetchActivityHistory();
  }, [id]);

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

  const fetchActivityHistory = async () => {
    try {
      setActivityLoading(true);
      const response = await customerService.getCustomerActivityHistory(id);
      setActivityHistory(response.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch activity history. Please try again.',
        variant: 'destructive',
      });
      console.error('Error fetching activity history:', error);
    } finally {
      setActivityLoading(false);
    }
  };

  const handleStatusChange = async () => {
    try {
      if (customer.status === 'active') {
        await customerService.deactivateCustomer(id);
        toast({
          title: 'Success',
          description: 'Customer deactivated successfully.',
        });
      } else {
        await customerService.activateCustomer(id);
        toast({
          title: 'Success',
          description: 'Customer activated successfully.',
        });
      }
      fetchCustomer();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update customer status. Please try again.',
        variant: 'destructive',
      });
      console.error('Error updating customer status:', error);
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

  if (!customer) {
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
        title={customer.name}
        description={`Customer Code: ${customer.customerCode}`}
        actions={
          <div className="flex space-x-2">
            <Button 
              variant={customer.status === 'active' ? 'destructive' : 'default'}
              onClick={handleStatusChange}
            >
              {customer.status === 'active' ? 'Deactivate' : 'Activate'}
            </Button>
            <Button 
              variant="outline"
              onClick={() => router.push(`/customers/${id}/edit`)}
            >
              Edit Customer
            </Button>
            <Button 
              variant="outline"
              onClick={() => router.push('/customers')}
            >
              Back to List
            </Button>
          </div>
        }
      />

      <Tabs defaultValue="details">
        <TabsList className="mb-4">
          <TabsTrigger value="details">Customer Details</TabsTrigger>
          <TabsTrigger value="activity">Activity History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="divide-y divide-gray-100">
                  <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm font-medium leading-6 text-gray-900">Customer Type</dt>
                    <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                      {customer.customerType === 'individual' ? 'Individual' : 
                       customer.customerType === 'corporate' ? 'Corporate' : 
                       customer.customerType === 'reseller' ? 'Reseller' : customer.customerType}
                    </dd>
                  </div>
                  <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm font-medium leading-6 text-gray-900">Status</dt>
                    <dd className="mt-1 text-sm leading-6 sm:col-span-2 sm:mt-0">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        customer.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {customer.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </dd>
                  </div>
                  <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm font-medium leading-6 text-gray-900">Contact Person</dt>
                    <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                      {customer.contactPerson}
                    </dd>
                  </div>
                  <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm font-medium leading-6 text-gray-900">Phone Number</dt>
                    <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                      {customer.phoneNumber}
                    </dd>
                  </div>
                  <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm font-medium leading-6 text-gray-900">Email</dt>
                    <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                      {customer.email}
                    </dd>
                  </div>
                  <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm font-medium leading-6 text-gray-900">Tax ID</dt>
                    <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                      {customer.taxId || '-'}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Address Information</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="divide-y divide-gray-100">
                  <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm font-medium leading-6 text-gray-900">Street</dt>
                    <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                      {customer.address?.street || '-'}
                    </dd>
                  </div>
                  <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm font-medium leading-6 text-gray-900">City</dt>
                    <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                      {customer.address?.city || '-'}
                    </dd>
                  </div>
                  <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm font-medium leading-6 text-gray-900">District</dt>
                    <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                      {customer.address?.district || '-'}
                    </dd>
                  </div>
                  <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm font-medium leading-6 text-gray-900">Province</dt>
                    <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                      {customer.address?.province || '-'}
                    </dd>
                  </div>
                  <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm font-medium leading-6 text-gray-900">Postal Code</dt>
                    <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                      {customer.address?.postalCode || '-'}
                    </dd>
                  </div>
                  <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm font-medium leading-6 text-gray-900">Country</dt>
                    <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                      {customer.address?.country || 'Indonesia'}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Financial Information</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="divide-y divide-gray-100">
                  <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm font-medium leading-6 text-gray-900">Credit Limit</dt>
                    <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                      {customer.creditLimit ? `Rp ${customer.creditLimit.toLocaleString('id-ID')}` : 'Rp 0'}
                    </dd>
                  </div>
                  <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm font-medium leading-6 text-gray-900">Payment Terms</dt>
                    <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                      {customer.paymentTerms ? `${customer.paymentTerms} days` : 'Cash on Delivery'}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Branch Information</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="divide-y divide-gray-100">
                  <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm font-medium leading-6 text-gray-900">Branch</dt>
                    <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                      {customer.branch?.name || '-'}
                    </dd>
                  </div>
                  <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm font-medium leading-6 text-gray-900">Created At</dt>
                    <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                      {customer.createdAt ? new Date(customer.createdAt).toLocaleString('id-ID') : '-'}
                    </dd>
                  </div>
                  <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm font-medium leading-6 text-gray-900">Updated At</dt>
                    <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                      {customer.updatedAt ? new Date(customer.updatedAt).toLocaleString('id-ID') : '-'}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Activity History</CardTitle>
              <CardDescription>Recent activities related to this customer</CardDescription>
            </CardHeader>
            <CardContent>
              {activityLoading ? (
                <div className="flex items-center justify-center h-64">
                  <p className="text-gray-500">Loading activity history...</p>
                </div>
              ) : activityHistory.length === 0 ? (
                <div className="flex items-center justify-center h-64">
                  <p className="text-gray-500">No activity history found</p>
                </div>
              ) : (
                <Timeline items={activityHistory.map(activity => ({
                  title: activity.action,
                  description: activity.description,
                  timestamp: new Date(activity.timestamp).toLocaleString('id-ID'),
                  icon: activity.action.includes('created') ? 'plus' :
                         activity.action.includes('updated') ? 'edit' :
                         activity.action.includes('deleted') ? 'trash' :
                         activity.action.includes('activated') ? 'check' :
                         activity.action.includes('deactivated') ? 'x' : 'info'
                }))} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
