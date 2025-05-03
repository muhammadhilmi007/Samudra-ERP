'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/atoms/Card';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import { Select } from '../../components/atoms/Select';
import { DataTable } from '../../components/organisms/DataTable';
import { PageHeader } from '../../components/molecules/PageHeader';
import { useToast } from '../../hooks/useToast';
import { customerService } from '../../services/customerService';

export default function CustomerListPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await customerService.getCustomers();
      setCustomers(response.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch customers. Please try again.',
        variant: 'destructive',
      });
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const handleTypeFilterChange = (e) => {
    setTypeFilter(e.target.value);
  };

  const filteredCustomers = customers.filter((customer) => {
    // Filter by search term
    const matchesSearch = 
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.customerCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phoneNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by status
    const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;
    
    // Filter by type
    const matchesType = typeFilter === 'all' || customer.customerType === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const columns = [
    {
      header: 'Customer Code',
      accessorKey: 'customerCode',
    },
    {
      header: 'Name',
      accessorKey: 'name',
    },
    {
      header: 'Type',
      accessorKey: 'customerType',
    },
    {
      header: 'Contact Person',
      accessorKey: 'contactPerson',
    },
    {
      header: 'Phone',
      accessorKey: 'phoneNumber',
    },
    {
      header: 'Email',
      accessorKey: 'email',
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: ({ row }) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          row.original.status === 'active' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {row.original.status === 'active' ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => router.push(`/customers/${row.original._id}`)}
          >
            View
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => router.push(`/customers/${row.original._id}/edit`)}
          >
            Edit
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader
        title="Customer Management"
        description="Manage your customers and their information"
        actions={
          <Button onClick={() => router.push('/customers/create')}>
            Add New Customer
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Customers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search by name, code, email, or phone..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full"
              />
            </div>
            <div className="w-full md:w-48">
              <Select
                value={statusFilter}
                onChange={handleStatusFilterChange}
                className="w-full"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Select>
            </div>
            <div className="w-full md:w-48">
              <Select
                value={typeFilter}
                onChange={handleTypeFilterChange}
                className="w-full"
              >
                <option value="all">All Types</option>
                <option value="individual">Individual</option>
                <option value="corporate">Corporate</option>
                <option value="reseller">Reseller</option>
              </Select>
            </div>
          </div>

          <DataTable
            columns={columns}
            data={filteredCustomers}
            loading={loading}
            pagination
          />
        </CardContent>
      </Card>
    </div>
  );
}
