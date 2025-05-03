import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { Search, Filter, ChevronDown, ChevronUp, Calendar, User, MapPin, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import Link from 'next/link';

import pickupService from '@/services/pickupService';

import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/atoms/Select';
import { Pagination } from '@/components/molecules/Pagination';
import { Card, CardContent } from '@/components/atoms/Card';
import { Badge } from '@/components/atoms/Badge';
import { Skeleton } from '@/components/atoms/Skeleton';
import { DateRangePicker } from '@/components/molecules/DateRangePicker';

/**
 * Status badge component
 * Displays a badge with color based on pickup request status
 */
const StatusBadge = ({ status }) => {
  const statusConfig = {
    pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
    assigned: { color: 'bg-blue-100 text-blue-800', label: 'Assigned' },
    in_progress: { color: 'bg-purple-100 text-purple-800', label: 'In Progress' },
    completed: { color: 'bg-green-100 text-green-800', label: 'Completed' },
    cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled' },
    failed: { color: 'bg-gray-100 text-gray-800', label: 'Failed' },
    rescheduled: { color: 'bg-orange-100 text-orange-800', label: 'Rescheduled' },
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <Badge variant="outline" className={`${config.color} border-none`}>
      {config.label}
    </Badge>
  );
};

/**
 * PickupRequestList Component
 * Displays a list of pickup requests with filtering and pagination
 */
const PickupRequestList = () => {
  // State for filters and pagination
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    branch: '',
    customer: '',
    dateRange: {
      from: undefined,
      to: undefined,
    },
    priority: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState('scheduledDate');
  const [sortOrder, setSortOrder] = useState('desc');

  // Fetch pickup requests with filters
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['pickupRequests', filters, page],
    queryFn: async () => {
      try {
        // Convert filters to API query parameters
        const queryParams = {
          page: page,
          limit: 10,
          status: filters.status || undefined,
          branch: filters.branch || undefined,
          customer: filters.customer || undefined,
          search: filters.search || undefined,
          fromDate: filters.dateRange.from ? format(filters.dateRange.from, 'yyyy-MM-dd') : undefined,
          toDate: filters.dateRange.to ? format(filters.dateRange.to, 'yyyy-MM-dd') : undefined,
        };
        
        // Call the API service
        const response = await pickupService.getPickupRequests(queryParams);
        return response;
      } catch (error) {
        console.error('Error fetching pickup requests:', error);
        throw error;
      }
    },
  });
  
  // Fetch customers for filter dropdown
  const { data: customers, isLoading: isLoadingCustomers } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const response = await pickupService.getCustomers();
      return response.data;
    },
  });
  
  // Fetch branches for filter dropdown
  const { data: branches, isLoading: isLoadingBranches } = useQuery({
    queryKey: ['branches'],
    queryFn: async () => {
      const response = await pickupService.getBranches();
      return response.data;
    },
  });
  
  // Cancel pickup request mutation
  const queryClient = useQueryClient();
  const cancelPickupMutation = useMutation({
    mutationFn: ({ id, reason }) => pickupService.cancelPickupRequest(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pickupRequests'] });
    },
  });

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
    setPage(1); // Reset to first page when filters change
  };

  // Handle sort changes
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Render sort indicator
  const renderSortIndicator = (field) => {
    if (sortBy !== field) return null;
    return sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      search: '',
      status: '',
      branch: '',
      customer: '',
      dateRange: {
        from: undefined,
        to: undefined,
      },
      priority: '',
    });
    setPage(1);
  };

  return (
    <div className="space-y-4">
      {/* Search and Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by code, customer, or contact person"
            className="pl-10"
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
          <Button 
            variant="outline"
            onClick={resetFilters}
          >
            Reset
          </Button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <Select 
                  value={filters.status} 
                  onValueChange={(value) => handleFilterChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="assigned">Assigned</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="rescheduled">Rescheduled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
                <Select 
                  value={filters.branch} 
                  onValueChange={(value) => handleFilterChange('branch', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Branches" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Branches</SelectItem>
                    {branches?.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
                <Select 
                  value={filters.customer} 
                  onValueChange={(value) => handleFilterChange('customer', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Customers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Customers</SelectItem>
                    {customers?.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <Select 
                  value={filters.priority} 
                  onValueChange={(value) => handleFilterChange('priority', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Priorities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Priorities</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Date Range</label>
                <DateRangePicker
                  value={filters.dateRange}
                  onChange={(range) => handleFilterChange('dateRange', range)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pickup Requests Table */}
      <div className="bg-white rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('code')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Code</span>
                    {renderSortIndicator('code')}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('customer.name')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Customer</span>
                    {renderSortIndicator('customer.name')}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('scheduledDate')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Scheduled Date</span>
                    {renderSortIndicator('scheduledDate')}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Status</span>
                    {renderSortIndicator('status')}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('priority')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Priority</span>
                    {renderSortIndicator('priority')}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('branch.name')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Branch</span>
                    {renderSortIndicator('branch.name')}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                // Loading skeleton
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Skeleton className="h-4 w-32" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Skeleton className="h-4 w-40" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Skeleton className="h-4 w-20" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Skeleton className="h-4 w-16" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Skeleton className="h-4 w-28" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <Skeleton className="h-4 w-20 ml-auto" />
                    </td>
                  </tr>
                ))
              ) : error ? (
                // Error state
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-red-500">
                    Error loading pickup requests: {error?.message || 'Unknown error'}
                  </td>
                </tr>
              ) : data?.data.length === 0 ? (
                // Empty state
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    No pickup requests found. Try adjusting your filters or create a new request.
                  </td>
                </tr>
              ) : (
                // Data rows
                data?.data.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{request.code}</div>
                      <div className="text-xs text-gray-500">
                        {format(new Date(request.createdAt), 'MMM d, yyyy')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{request.customer.name}</div>
                      <div className="text-xs text-gray-500 flex items-center">
                        <User className="h-3 w-3 mr-1" />
                        {request.contactPerson.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {format(new Date(request.scheduledDate), 'MMM d, yyyy')}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {request.scheduledTimeWindow.start} - {request.scheduledTimeWindow.end}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={request.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="outline" className={
                        request.priority === 'high' 
                          ? 'bg-red-50 text-red-700 border-red-200' 
                          : request.priority === 'medium'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-green-50 text-green-700 border-green-200'
                      }>
                        {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{request.branch.name}</div>
                      <div className="text-xs text-gray-500 flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {request.pickupAddress.city}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Link 
                          href={`/pickup/${request.id}`}
                          className="text-primary hover:text-primary-dark"
                        >
                          View
                        </Link>
                        {request.status === 'pending' && (
                          <Link 
                            href={`/pickup/assignments/create?requestId=${request.id}`}
                            className="text-primary hover:text-primary-dark"
                          >
                            Assign
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-sm text-gray-700 mr-2">
                Show
              </span>
              <Select 
                value={pageSize.toString()} 
                onValueChange={(value) => {
                  setPageSize(Number(value));
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-16">
                  <SelectValue placeholder={pageSize} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-gray-700 ml-2">
                entries
              </span>
            </div>
            
            {data?.meta && (
              <Pagination
                currentPage={page}
                totalPages={data.meta.totalPages}
                onPageChange={setPage}
              />
            )}
            
            <div className="text-sm text-gray-700">
              {data?.meta && (
                <>
                  Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, data.meta.totalItems)} of {data.meta.totalItems} entries
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PickupRequestList;
