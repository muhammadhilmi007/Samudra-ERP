/**
 * Samudra Paket ERP - Operational Dashboard Component
 * Provides key operational metrics and visualizations for tracking shipments
 */

'use client';

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { 
  TruckIcon, PackageCheck, PackageX, Clock, Activity, 
  Truck, AlertTriangle, Calendar, TrendingUp 
} from 'lucide-react';

// Demo data - Replace with actual data from API
const demoShipmentStatusData = [
  { status: 'Preparing', count: 15, color: '#2563EB' },
  { status: 'In Transit', count: 32, color: '#F59E0B' },
  { status: 'Arrived', count: 8, color: '#10B981' },
  { status: 'Delayed', count: 5, color: '#EF4444' },
];

const demoWeeklyShipmentData = [
  { day: 'Mon', count: 12 },
  { day: 'Tue', count: 19 },
  { day: 'Wed', count: 15 },
  { day: 'Thu', count: 22 },
  { day: 'Fri', count: 30 },
  { day: 'Sat', count: 18 },
  { day: 'Sun', count: 8 },
];

const demoDelayReasonData = [
  { reason: 'Weather', count: 3, color: '#2563EB' },
  { reason: 'Traffic', count: 7, color: '#F59E0B' },
  { reason: 'Vehicle Breakdown', count: 2, color: '#EF4444' },
  { reason: 'Administrative', count: 4, color: '#10B981' },
];

const demoPerformanceData = [
  { month: 'Jan', onTime: 85, target: 90 },
  { month: 'Feb', onTime: 88, target: 90 },
  { month: 'Mar', onTime: 92, target: 90 },
  { month: 'Apr', onTime: 89, target: 90 },
  { month: 'May', onTime: 94, target: 90 },
  { month: 'Jun', onTime: 91, target: 90 }
];

const OperationalDashboard = () => {
  const [timeFrame, setTimeFrame] = useState('week');
  const [branchFilter, setBranchFilter] = useState('all');
  
  // In a real implementation, we would get this data from Redux store
  const { branches } = useSelector(state => state.branches || { branches: [] });
  
  const getOverallStatusData = () => {
    // In a real implementation, this would be calculated from actual shipment data
    return {
      total: 60,
      onTime: 55,
      delayed: 5,
      completed: 42,
      pending: 18,
      alertsCount: 3
    };
  };
  
  const statusData = getOverallStatusData();
  const onTimePercentage = Math.round((statusData.onTime / statusData.total) * 100);
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Operational Dashboard</h2>
          <p className="text-muted-foreground">
            Monitor shipment operations and track key performance metrics
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Select value={branchFilter} onValueChange={setBranchFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Branches" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Branches</SelectItem>
              {branches && branches.map(branch => (
                <SelectItem key={branch.id} value={branch.id}>
                  {branch.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={timeFrame} onValueChange={setTimeFrame}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="This Week" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Shipments</CardTitle>
            <PackageCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusData.total}</div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {timeFrame === 'week' ? 'This week' : timeFrame === 'month' ? 'This month' : 'This period'}
              </p>
              <Badge variant="outline" className="text-xs">
                <TrendingUp className="h-3 w-3 mr-1" />
                +12%
              </Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">On-Time Rate</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{onTimePercentage}%</div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Target 90%
              </p>
              <Badge variant={onTimePercentage >= 90 ? 'outline' : 'destructive'} className="text-xs">
                {onTimePercentage >= 90 ? 'On Target' : 'Below Target'}
              </Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Shipments</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusData.pending}</div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {statusData.delayed} delayed
              </p>
              <Badge variant={statusData.delayed > 0 ? 'destructive' : 'outline'} className="text-xs">
                {statusData.delayed > 0 ? `${statusData.delayed} issues` : 'All on track'}
              </Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusData.alertsCount}</div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Requiring attention
              </p>
              <Badge variant={statusData.alertsCount > 0 ? 'destructive' : 'outline'} className="text-xs">
                {statusData.alertsCount > 0 ? 'Action needed' : 'No alerts'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts & Analytics */}
      <Tabs defaultValue="shipmentStatus" className="w-full">
        <TabsList className="grid grid-cols-4 md:w-[600px]">
          <TabsTrigger value="shipmentStatus">Status</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="delayReasons">Delays</TabsTrigger>
        </TabsList>
        
        <TabsContent value="shipmentStatus" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Shipment Status Distribution</CardTitle>
              <CardDescription>
                Overview of current shipment statuses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={demoShipmentStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="status"
                      label={({ status, percent }) => `${status}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {demoShipmentStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} shipments`, 'Count']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                {demoShipmentStatusData.map((status) => (
                  <div key={status.status} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: status.color }}></div>
                    <span className="text-sm">{status.status}: <strong>{status.count}</strong></span>
                  </div>
                ))}
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="trends" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Shipment Volume Trends</CardTitle>
              <CardDescription>
                {timeFrame === 'week' ? 'Daily shipment volume for the current week' : 
                 timeFrame === 'month' ? 'Weekly shipment volume for the current month' : 
                 'Shipment volume trends'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={demoWeeklyShipmentData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" name="Shipments" fill="#2563EB" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Total for period: <strong>{demoWeeklyShipmentData.reduce((sum, item) => sum + item.count, 0)}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Average: <strong>{Math.round(demoWeeklyShipmentData.reduce((sum, item) => sum + item.count, 0) / demoWeeklyShipmentData.length)}</strong> per day
                  </span>
                </div>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="performance" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>On-Time Performance</CardTitle>
              <CardDescription>
                Monthly on-time delivery performance compared to target
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={demoPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[80, 100]} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="onTime" name="On-Time %" stroke="#2563EB" activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="target" name="Target" stroke="#F59E0B" strokeDasharray="5 5" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#2563EB' }}></div>
                  <span className="text-sm">Current: <strong>{demoPerformanceData[demoPerformanceData.length - 1].onTime}%</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#F59E0B' }}></div>
                  <span className="text-sm">Target: <strong>{demoPerformanceData[0].target}%</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: onTimePercentage >= 90 ? '#10B981' : '#EF4444' }}></div>
                  <span className="text-sm">Status: <strong>{onTimePercentage >= 90 ? 'Meeting Target' : 'Below Target'}</strong></span>
                </div>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="delayReasons" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Delay Reasons</CardTitle>
              <CardDescription>
                Analysis of factors causing shipment delays
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={demoDelayReasonData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="reason"
                      label={({ reason, percent }) => `${reason}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {demoDelayReasonData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} shipments`, 'Count']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <div className="grid grid-cols-2 gap-4 w-full">
                {demoDelayReasonData.map((reason) => (
                  <div key={reason.reason} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: reason.color }}></div>
                    <span className="text-sm">{reason.reason}: <strong>{reason.count}</strong></span>
                  </div>
                ))}
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OperationalDashboard;
