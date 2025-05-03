import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { MapPin, Calendar, User, Truck, Clock, MoreHorizontal, Search, Filter, Phone, RefreshCw, AlertCircle, Navigation, Package } from 'lucide-react';
import Link from 'next/link';

import pickupService from '@/services/pickupService';

import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/atoms/Select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/Card';
import { Badge } from '@/components/atoms/Badge';
import { Skeleton } from '@/components/atoms/Skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/atoms/Tabs';

/**
 * Status badge component
 * Displays a badge with color based on pickup status
 */
const StatusBadge = ({ status }) => {
  const statusConfig = {
    pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
    assigned: { color: 'bg-blue-100 text-blue-800', label: 'Assigned' },
    in_progress: { color: 'bg-purple-100 text-purple-800', label: 'In Progress' },
    completed: { color: 'bg-green-100 text-green-800', label: 'Completed' },
    cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled' },
    failed: { color: 'bg-gray-100 text-gray-800', label: 'Failed' },
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <Badge variant="outline" className={`${config.color} border-none`}>
      {config.label}
    </Badge>
  );
};

/**
 * PickupTrackingDashboard Component
 * Provides real-time tracking and monitoring of pickup operations
 */
const PickupTrackingDashboard = () => {
  // State for filters and selected assignment
  const [filters, setFilters] = useState({
    search: '',
    date: '',
    status: '',
    branch: '',
  });
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds by default
  const queryClient = useQueryClient();
  const mapRef = useRef(null);

  // Fetch active pickup assignments with real-time updates
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['activePickupAssignments', filters],
    queryFn: async () => {
      try {
        // Convert filters to API query parameters
        const queryParams = {
          search: filters.search || undefined,
          date: filters.date || undefined,
          status: filters.status || undefined,
          branch: filters.branch || undefined,
          active: true, // Only get active assignments
        };
        
        // Call the API service
        const response = await pickupService.getActivePickupAssignments(queryParams);
        return response;
      } catch (error) {
        console.error('Error fetching active pickup assignments:', error);
        throw error;
      }
    },
    refetchInterval: refreshInterval,
  });
  
  // Fetch real-time location updates for the selected assignment
  const { data: locationData, isLoading: isLoadingLocation } = useQuery({
    queryKey: ['assignmentLocation', selectedAssignment?.id],
    queryFn: async () => {
      if (!selectedAssignment?.id) return null;
      
      try {
        const response = await pickupService.getPickupAssignmentLocation(selectedAssignment.id);
        return response.data;
      } catch (error) {
        console.error('Error fetching assignment location:', error);
        throw error;
      }
    },
    enabled: !!selectedAssignment?.id,
    refetchInterval: refreshInterval,
  });
  
  // Fetch branches for filter dropdown
  const { data: branches, isLoading: isLoadingBranches } = useQuery({
    queryKey: ['branches'],
    queryFn: async () => {
      const response = await pickupService.getBranches();
      return response.data;
    },
  });
  
  // Update map when location data changes
  useEffect(() => {
    if (locationData && mapRef.current) {
      // Update map with new location data
      // This would be implemented with a mapping library like Google Maps or Leaflet
      console.log('Updating map with new location data:', locationData);
    }
  }, [locationData]);
  
  // Update selected assignment with real-time data
  useEffect(() => {
    if (selectedAssignment && data?.data) {
      const updatedAssignment = data.data.find(a => a.id === selectedAssignment.id);
      if (updatedAssignment) {
        setSelectedAssignment(updatedAssignment);
      }
    }
  }, [data?.data, selectedAssignment]);

  const handleRefresh = () => {
    refetch();
  };

  const handleRefreshIntervalChange = (seconds) => {
    setRefreshInterval(seconds * 1000);
  };

  const calculateCompletionPercentage = (assignment) => {
    if (!assignment || !assignment.pickupRequests || assignment.pickupRequests.length === 0) {
      return 0;
    }
    
    const completedRequests = assignment.pickupRequests.filter(req => req.status === 'completed').length;
    return Math.round((completedRequests / assignment.pickupRequests.length) * 100);
  };

  const formatLastUpdated = (lastUpdated) => {
    if (!lastUpdated) return 'Unknown';
    
    try {
      const date = typeof lastUpdated === 'string' ? parseISO(lastUpdated) : new Date(lastUpdated);
      return format(date, 'HH:mm:ss');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  return (
    <div className="space-y-6">
      {/* Tracking Overview */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>Pickup Tracking Overview</CardTitle>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="w-full md:w-48">
                <Input
                  type="date"
                  value={filters.date}
                  onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                />
              </div>
              <Select value={filters.branch} onValueChange={(value) => setFilters({ ...filters, branch: value })}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="All Branches" />
                </SelectTrigger>
                <SelectContent>
                  {branches?.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Stats cards */}
            <div className="grid grid-cols-3 md:grid-cols-1 gap-4">
              <Card className="bg-blue-50">
                <CardContent className="p-4">
                  <div className="text-sm font-medium text-blue-700">Total Assignments</div>
                  <div className="text-2xl font-bold text-blue-900">{data?.data?.length || 0}</div>
                  <div className="text-xs text-blue-600">Active pickup assignments</div>
                </CardContent>
              </Card>
              <Card className="bg-green-50">
                <CardContent className="p-4">
                  <div className="text-sm font-medium text-green-700">Completed Pickups</div>
                  <div className="text-2xl font-bold text-green-900">
                    {data?.data?.reduce((total, assignment) => {
                      return total + assignment.pickupRequests.filter(req => req.status === 'completed').length;
                    }, 0) || 0}
                  </div>
                  <div className="text-xs text-green-600">
                    Out of {data?.data?.reduce((total, assignment) => total + assignment.pickupRequests.length, 0) || 0} total pickups
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-amber-50">
                <CardContent className="p-4">
                  <div className="text-sm font-medium text-amber-700">On-Time Rate</div>
                  <div className="text-2xl font-bold text-amber-900">
                    {data?.data?.length ? (
                      `${Math.round((data.data.filter(a => a.status !== 'delayed').length / data.data.length) * 100)}%`
                    ) : '0%'}
                  </div>
                  <div className="text-xs text-amber-600">Based on today's pickups</div>
                </CardContent>
              </Card>
            </div>
            <div className="md:col-span-2">
              {/* Map view */}
              <div className="md:col-span-2 h-[400px] bg-gray-100 rounded-lg overflow-hidden">
                {error ? (
                  <div className="h-full flex flex-col items-center justify-center">
                    <AlertCircle className="h-10 w-10 text-red-500 mb-2" />
                    <p className="text-red-500 font-medium">Error loading map data</p>
                    <p className="text-gray-500 text-sm">{error.message || 'Please try again'}</p>
                    <Button variant="outline" size="sm" onClick={handleRefresh} className="mt-4">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Retry
                    </Button>
                  </div>
                ) : isLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="flex flex-col items-center">
                      <RefreshCw className="h-10 w-10 text-blue-500 animate-spin mb-2" />
                      <p className="text-gray-500">Loading map data...</p>
                    </div>
                  </div>
                ) : data?.data?.length === 0 ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="flex flex-col items-center">
                      <MapPin className="h-10 w-10 text-gray-400 mb-2" />
                      <p className="text-gray-500">No active pickup assignments</p>
                    </div>
                  </div>
                ) : (
                  <div className="h-full" ref={mapRef}>
                    <div className="absolute top-4 right-4 z-10 flex space-x-2">
                      <Select 
                        value={String(refreshInterval / 1000)} 
                        onValueChange={handleRefreshIntervalChange}
                      >
                        <SelectTrigger className="w-[180px] bg-white">
                          <SelectValue placeholder="Refresh interval" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10">Refresh every 10s</SelectItem>
                          <SelectItem value="30">Refresh every 30s</SelectItem>
                          <SelectItem value="60">Refresh every 1m</SelectItem>
                          <SelectItem value="300">Refresh every 5m</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="outline" size="icon" onClick={handleRefresh} className="bg-white">
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="p-4 absolute bottom-4 left-4 z-10 bg-white rounded-md shadow-md max-w-xs">
                      {selectedAssignment ? (
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <h3 className="font-medium">{selectedAssignment.code}</h3>
                            <Badge variant={selectedAssignment.status === 'in_progress' ? 'default' : 'outline'}>
                              {selectedAssignment.status === 'in_progress' ? 'Active' : 'Scheduled'}
                            </Badge>
                          </div>
                          <div className="text-sm">
                            <div className="flex items-center text-gray-600">
                              <Truck className="h-4 w-4 mr-1" />
                              {selectedAssignment.vehicle?.plateNumber} ({selectedAssignment.vehicle?.type})
                            </div>
                            <div className="flex items-center text-gray-600">
                              <User className="h-4 w-4 mr-1" />
                              {selectedAssignment.team?.driver?.name}
                            </div>
                            <div className="flex items-center text-gray-600">
                              <Clock className="h-4 w-4 mr-1" />
                              Last updated: {formatLastUpdated(selectedAssignment.currentLocation?.lastUpdated)}
                            </div>
                          </div>
                          <Progress value={calculateCompletionPercentage(selectedAssignment)} className="h-2" />
                          <div className="text-xs text-gray-500">
                            {selectedAssignment.pickupRequests.filter(req => req.status === 'completed').length} of {selectedAssignment.pickupRequests.length} pickups completed
                          </div>
                          <Button variant="outline" size="sm" className="w-full" asChild>
                            <Link href={`/pickup/tracking/${selectedAssignment.id}`}>
                              View Details
                            </Link>
                          </Button>
                        </div>
              ) : (
                        <div className="text-sm text-gray-500">
                          Select a vehicle on the map or from the list below to view details
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assignment list */}
      <Card>
        <CardHeader>
          <CardTitle>Active Pickup Assignments</CardTitle>
          <CardDescription>Real-time status of all active pickup teams</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center py-8">
                          <RefreshCw className="h-10 w-10 text-blue-500 animate-spin mx-auto mb-2" />
                          <p className="text-gray-500">Loading assignments...</p>
                        </div>
              ) : error ? (
                <div className="text-center py-8">
                          <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-2" />
                          <p className="text-red-500 font-medium">Error loading assignments</p>
                          <p className="text-gray-500 text-sm mb-4">{error.message || 'Please try again'}</p>
                          <Button variant="outline" onClick={handleRefresh}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Retry
                          </Button>
                        </div>
              ) : data?.data?.length === 0 ? (
                <div className="text-center py-8">
                          <Package className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-500">No active assignments found</p>
                        </div>
              ) : (
                data?.data?.map((assignment) => (
                          <Card 
                            key={assignment.id} 
                            className={`overflow-hidden ${selectedAssignment?.id === assignment.id ? 'ring-2 ring-blue-500' : ''}`}
                          >
                            <CardContent className="p-0">
                              <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x">
                                {/* Team info */}
                                <div className="p-4">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                      <div 
                                        className={`h-2 w-2 rounded-full ${assignment.status === 'in_progress' ? 'bg-green-500' : 
                                          assignment.status === 'delayed' ? 'bg-red-500' : 'bg-amber-500'}`}
                                      ></div>
                                      <h3 className="font-medium">{assignment.code}</h3>
                                    </div>
                                    <Badge variant={assignment.status === 'in_progress' ? 'default' : 'outline'}>
                                      {assignment.status === 'in_progress' ? 'Active' : 
                                       assignment.status === 'delayed' ? 'Delayed' : 'Scheduled'}
                                    </Badge>
                                  </div>
                                  <div className="mt-2 space-y-1 text-sm">
                                    <div className="flex items-center text-gray-600">
                                      <User className="h-4 w-4 mr-1" />
                                      {assignment.team?.driver?.name}
                                    </div>
                                    <div className="flex items-center text-gray-600">
                                      <Phone className="h-4 w-4 mr-1" />
                                      {assignment.team?.driver?.phone}
                                    </div>
                                    <div className="flex items-center text-gray-600">
                                      <Truck className="h-4 w-4 mr-1" />
                                      {assignment.vehicle?.plateNumber} ({assignment.vehicle?.type})
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Current location */}
                                <div className="p-4">
                                  <h4 className="text-sm font-medium text-gray-500 mb-2">Current Location</h4>
                                  {assignment.currentLocation ? (
                                    <div className="flex items-start space-x-2">
                                      <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                                      <div>
                                        <p className="text-sm font-medium">
                                          {assignment.currentLocation.address || 
                                           `${assignment.currentLocation.lat.toFixed(4)}, ${assignment.currentLocation.lng.toFixed(4)}`}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                          Last updated: {formatLastUpdated(assignment.currentLocation.lastUpdated)}
                                        </p>
                                      </div>
                                    </div>
                          ) : (
                                    <p className="text-sm text-gray-500">Location data not available</p>
                                  )}
                                </div>
                                
                                {/* Progress */}
                                <div className="p-4">
                                  <h4 className="text-sm font-medium text-gray-500 mb-2">Progress</h4>
                                  <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                      <span>
                                        {assignment.pickupRequests.filter(req => req.status === 'completed').length} of {assignment.pickupRequests.length} pickups
                                      </span>
                                      <span>{calculateCompletionPercentage(assignment)}%</span>
                                    </div>
                                    <Progress 
                                      value={calculateCompletionPercentage(assignment)} 
                                      className="h-2"
                                    />
                                  </div>
                                </div>
                                
                                {/* Actions */}
                                <div className="p-4 flex flex-col justify-between">
                                  <div>
                                    <h4 className="text-sm font-medium text-gray-500 mb-2">Next Pickup</h4>
                                    {assignment.pickupRequests.find(req => req.status === 'pending' || req.status === 'in_progress') ? (
                                      <div className="text-sm">
                                        <p className="font-medium">
                                          {assignment.pickupRequests.find(req => req.status === 'pending' || req.status === 'in_progress').customer}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                          {assignment.pickupRequests.find(req => req.status === 'pending' || req.status === 'in_progress').status === 'in_progress' ? 
                                            'Currently at location' : 
                                            `ETA: ${assignment.pickupRequests.find(req => req.status === 'pending').estimatedArrival || 'Not available'}`}
                                        </p>
                                      </div>
                            ) : (
                                      <p className="text-sm text-gray-500">All pickups completed</p>
                                    )}
                                  </div>
                                  <div className="mt-4 flex space-x-2">
                                    <Button size="sm" variant="outline" className="flex-1" asChild>
                                      <Link href={`/pickup/tracking/${assignment.id}`}>
                                        Details
                                      </Link>
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="default" 
                                      className="flex-1"
                                      onClick={() => setSelectedAssignment(assignment)}
                                    >
                                      <Navigation className="h-4 w-4 mr-2" />
                                      Track
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
            </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PickupTrackingDashboard;
