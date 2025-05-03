import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { MapPin, Calendar, User, Truck, Clock, MoreHorizontal, Search, Filter, RefreshCw, AlertCircle, Route, CheckCircle } from 'lucide-react';
import Link from 'next/link';

import pickupService from '@/services/pickupService';

import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/atoms/Select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/atoms/Tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/Card';
import { Badge } from '@/components/atoms/Badge';
import { Skeleton } from '@/components/atoms/Skeleton';
import { Pagination } from '@/components/molecules/Pagination';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/atoms/DropdownMenu';

/**
 * Status badge component
 * Displays a badge with color based on pickup assignment status
 */
const StatusBadge = ({ status }) => {
  const statusConfig = {
    pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
    assigned: { color: 'bg-blue-100 text-blue-800', label: 'Assigned' },
    in_progress: { color: 'bg-purple-100 text-purple-800', label: 'In Progress' },
    completed: { color: 'bg-green-100 text-green-800', label: 'Completed' },
    cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled' },
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <Badge variant="outline" className={`${config.color} border-none`}>
      {config.label}
    </Badge>
  );
};

/**
 * PickupAssignmentManagement Component
 * Allows operations team to manage pickup assignments, including team allocation and route optimization
 */
const PickupAssignmentManagement = () => {
  // State for filters, tabs, and pagination
  const [activeTab, setActiveTab] = useState('active');
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    search: '',
    team: '',
    vehicle: '',
    branch: '',
    date: null,
    status: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Fetch pickup assignments
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['pickupAssignments', activeTab, filters, page],
    queryFn: async () => {
      try {
        // Convert filters to API query parameters
        const queryParams = {
          page: page,
          limit: 10,
          status: filters.status || undefined,
          branch: filters.branch || undefined,
          date: filters.date || undefined,
          search: filters.search || undefined,
          active: activeTab === 'active' ? true : false,
        };
        
        // Call the API service
        const response = await pickupService.getPickupAssignments(queryParams);
        return response;
      } catch (error) {
        console.error('Error fetching pickup assignments:', error);
        throw error;
      }
    },
  });
  
  // Fetch teams for assignment
  const { data: teams, isLoading: isLoadingTeams } = useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      const response = await pickupService.getTeams();
      return response.data;
    },
  });
  
  // Fetch vehicles for assignment
  const { data: vehicles, isLoading: isLoadingVehicles } = useQuery({
    queryKey: ['vehicles'],
    queryFn: async () => {
      const response = await pickupService.getVehicles();
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
  
  // Optimize route mutation
  const optimizeRouteMutation = useMutation({
    mutationFn: (id) => pickupService.optimizeRoute(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pickupAssignments'] });
    },
  });
  
  // Update assignment mutation
  const updateAssignmentMutation = useMutation({
    mutationFn: ({ id, data }) => pickupService.updatePickupAssignment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pickupAssignments'] });
    },
  });
  
  // Update assignment status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => pickupService.updatePickupAssignmentStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pickupAssignments'] });
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

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      search: '',
      team: '',
      vehicle: '',
      branch: '',
      date: null,
      status: '',
    });
    setPage(1);
  };

  // Handle optimize route
  const handleOptimizeRoute = (id) => {
    optimizeRouteMutation.mutate(id);
  };

  // Handle update status
  const handleUpdateStatus = (id, status) => {
    updateStatusMutation.mutate({ id, status });
  };

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">Active Assignments</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming Assignments</TabsTrigger>
          <TabsTrigger value="completed">Completed Assignments</TabsTrigger>
        </TabsList>
      </Tabs>
      
      {/* Search and Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by code, team, or vehicle"
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
          <Link href="/pickup/assignments/create">
            <Button>Create Assignment</Button>
          </Link>
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Team</label>
                <Select 
                  value={filters.team} 
                  onValueChange={(value) => handleFilterChange('team', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Teams" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Teams</SelectItem>
                    {teams?.map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle</label>
                <Select 
                  value={filters.vehicle} 
                  onValueChange={(value) => handleFilterChange('vehicle', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Vehicles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Vehicles</SelectItem>
                    {vehicles?.map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.name}
                      </SelectItem>
                    ))}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <Input
                  type="date"
                  value={filters.date || ''}
                  onChange={(e) => handleFilterChange('date', e.target.value)}
                />
              </div>
              
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
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="mt-4 flex justify-end">
              <Button 
                variant="outline"
                onClick={resetFilters}
              >
                Reset Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Assignment Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          // Loading skeletons
          Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className="border border-gray-200">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-5 w-20" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
                <div className="pt-2 border-t border-gray-100">
                  <Skeleton className="h-4 w-full" />
                  <div className="mt-2 flex justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                <div className="pt-2 border-t border-gray-100">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : error ? (
          // Error state
          <div className="p-4 text-center">
            <div className="flex flex-col items-center space-y-2">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <p className="text-red-500 font-medium">Error loading pickup assignments</p>
              <p className="text-gray-500">{error.message || 'Please try again'}</p>
              <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-2">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </div>
        ) : data?.data.length === 0 ? (
          // Empty state
          <div className="col-span-full text-center text-gray-500 p-8 bg-gray-50 rounded-md">
            No pickup assignments found. Create a new assignment to get started.
          </div>
        ) : (
          // Data cards
          data?.data.map((assignment) => (
            <Card key={assignment.id} className="border border-gray-200 hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-md">
                    <Link href={`/pickup/assignments/${assignment.id}`} className="hover:text-primary">
                      {assignment.code}
                    </Link>
                  </CardTitle>
                  <StatusBadge status={assignment.status} />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <User className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="font-medium">{assignment.team.name}</span>
                    <span className="mx-1">•</span>
                    <span className="text-gray-600">{assignment.team.leader}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Truck className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{assignment.vehicle.type}</span>
                    <span className="mx-1">•</span>
                    <span className="text-gray-600">{assignment.vehicle.licensePlate}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{assignment.branch.name}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{format(new Date(assignment.date), 'EEEE, MMMM d, yyyy')}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{assignment.timeWindow.start} - {assignment.timeWindow.end}</span>
                  </div>
                </div>
                
                <div className="pt-2 border-t border-gray-100">
                  <div className="text-sm font-medium">Pickup Requests ({assignment.pickupRequests.length})</div>
                  <div className="mt-1 space-y-1">
                    {assignment.pickupRequests.slice(0, 2).map((request) => (
                      <div key={request.id} className="flex justify-between items-center text-xs">
                        <span className="text-gray-600">{request.code}</span>
                        <span className="text-gray-600">{request.customer}</span>
                        <StatusBadge status={request.status} />
                      </div>
                    ))}
                    {assignment.pickupRequests.length > 2 && (
                      <div className="text-xs text-gray-500 text-center">
                        +{assignment.pickupRequests.length - 2} more requests
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="pt-2 border-t border-gray-100">
                  <div className="flex justify-between text-xs">
                    <div>
                      <span className="text-gray-500">Distance:</span>
                      <span className="ml-1 font-medium">{assignment.routeOptimization.totalDistance} km</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Duration:</span>
                      <span className="ml-1 font-medium">{Math.floor(assignment.routeOptimization.estimatedDuration / 60)}h {assignment.routeOptimization.estimatedDuration % 60}m</span>
                    </div>
                  </div>
                </div>
                
                <div className="pt-2 border-t border-gray-100 flex justify-between items-center">
                  <div className="text-xs text-gray-500">
                    Created {format(new Date(assignment.createdAt), 'MMM d, HH:mm')}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/pickup/assignments/${assignment.id}`}>View Details</Link>
                      </DropdownMenuItem>
                      {assignment.status === 'assigned' && (
                        <DropdownMenuItem asChild>
                          <Link href={`/pickup/assignments/${assignment.id}/edit`}>Edit Assignment</Link>
                        </DropdownMenuItem>
                      )}
                      {['assigned', 'in_progress'].includes(assignment.status) && (
                        <DropdownMenuItem asChild>
                          <Link href={`/pickup/tracking?assignment=${assignment.id}`}>Track Assignment</Link>
                        </DropdownMenuItem>
                      )}
                      {assignment.status === 'in_progress' && (
                        <DropdownMenuItem asChild>
                          <Link href={`/pickup/assignments/${assignment.id}/complete`}>Mark as Completed</Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => handleUpdateStatus(assignment.id, 'in_progress')}
                        disabled={assignment.status !== 'assigned' || updateStatusMutation.isPending}
                      >
                        {updateStatusMutation.isPending && 
                         updateStatusMutation.variables?.id === assignment.id && 
                         updateStatusMutation.variables?.status === 'in_progress' ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Starting...
                          </>
                        ) : (
                          'Start Pickup'
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleUpdateStatus(assignment.id, 'completed')}
                        disabled={assignment.status !== 'in_progress' || updateStatusMutation.isPending}
                      >
                        {updateStatusMutation.isPending && 
                         updateStatusMutation.variables?.id === assignment.id && 
                         updateStatusMutation.variables?.status === 'completed' ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Completing...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Complete Pickup
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleUpdateStatus(assignment.id, 'cancelled')}
                        disabled={['completed', 'cancelled'].includes(assignment.status) || updateStatusMutation.isPending}
                        className="text-red-600 hover:text-red-800"
                      >
                        {updateStatusMutation.isPending && 
                         updateStatusMutation.variables?.id === assignment.id && 
                         updateStatusMutation.variables?.status === 'cancelled' ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Cancelling...
                          </>
                        ) : (
                          'Cancel Assignment'
                        )}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
      
      {/* Pagination */}
      {data?.meta && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-700">
            Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, data.meta.totalItems)} of {data.meta.totalItems} assignments
          </div>
          <Pagination
            currentPage={page}
            totalPages={data.meta.totalPages}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
};

export default PickupAssignmentManagement;
