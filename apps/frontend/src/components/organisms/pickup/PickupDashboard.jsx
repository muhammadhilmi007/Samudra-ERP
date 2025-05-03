import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/atoms/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/atoms/Tabs';
import { CalendarIcon, TruckIcon, ClipboardCheckIcon, MapPinIcon, BarChart3Icon } from 'lucide-react';
import Link from 'next/link';

/**
 * PickupDashboard Component
 * Main dashboard for pickup management showing key metrics and quick access to pickup features
 */
const PickupDashboard = () => {
  return (
    <div className="space-y-6">
      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/pickup/create">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Create Request</CardTitle>
              <ClipboardCheckIcon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-500">Create a new pickup request for customers</p>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/pickup/list">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pickup Requests</CardTitle>
              <ClipboardCheckIcon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-500">View and manage all pickup requests</p>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/pickup/assignments">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Assignments</CardTitle>
              <TruckIcon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-500">Manage pickup assignments and teams</p>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/pickup/tracking">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Tracking</CardTitle>
              <MapPinIcon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-500">Track pickup operations in real-time</p>
            </CardContent>
          </Card>
        </Link>
      </div>
      
      {/* Pickup Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Pickup Overview</CardTitle>
          <CardDescription>Summary of today's pickup operations</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="summary">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="in-progress">In Progress</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
            <TabsContent value="summary" className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-blue-700">Total Requests</p>
                  <p className="text-2xl font-bold text-blue-900">24</p>
                  <p className="text-xs text-blue-600">Today's pickup requests</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-yellow-700">Pending</p>
                  <p className="text-2xl font-bold text-yellow-900">8</p>
                  <p className="text-xs text-yellow-600">Awaiting assignment</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-purple-700">In Progress</p>
                  <p className="text-2xl font-bold text-purple-900">12</p>
                  <p className="text-xs text-purple-600">Currently being processed</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-green-700">Completed</p>
                  <p className="text-2xl font-bold text-green-900">4</p>
                  <p className="text-xs text-green-600">Successfully completed</p>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="pending" className="pt-4">
              <div className="border rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scheduled</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {/* Sample data - will be replaced with actual data from API */}
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">PR-230503-001</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">PT Maju Bersama</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Today, 14:00-16:00</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Pending
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button className="text-primary hover:text-primary-dark">Assign</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </TabsContent>
            <TabsContent value="in-progress" className="pt-4">
              <div className="border rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {/* Sample data - will be replaced with actual data from API */}
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">PR-230503-002</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">CV Sejahtera</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Team A - Budi</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                          In Progress
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button className="text-primary hover:text-primary-dark">Track</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </TabsContent>
            <TabsContent value="completed" className="pt-4">
              <div className="border rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed At</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {/* Sample data - will be replaced with actual data from API */}
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">PR-230503-003</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">PT Sukses Mandiri</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Today, 10:25</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Completed
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button className="text-primary hover:text-primary-dark">View</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Pickup Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Pickup Performance</CardTitle>
          <CardDescription>Performance metrics for pickup operations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-500">On-Time Rate</h4>
                <BarChart3Icon className="h-4 w-4 text-gray-400" />
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">92%</p>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '92%' }}></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Target: 95%</p>
            </div>
            
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-500">Avg. Pickup Time</h4>
                <BarChart3Icon className="h-4 w-4 text-gray-400" />
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">18 min</p>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '75%' }}></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Target: 15 min</p>
            </div>
            
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-500">First-Time Success</h4>
                <BarChart3Icon className="h-4 w-4 text-gray-400" />
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">88%</p>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: '88%' }}></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Target: 90%</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Today's Schedule */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Schedule</CardTitle>
          <CardDescription>Pickup schedule for today</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900">May 3, 2025</h3>
            <Link href="/pickup/schedule" className="text-sm text-primary hover:text-primary-dark">
              View Full Schedule
            </Link>
          </div>
          <div className="space-y-4">
            <div className="flex items-start space-x-4 p-3 border rounded-lg">
              <div className="flex-shrink-0">
                <div className="bg-blue-100 text-blue-800 text-xs font-medium rounded-full w-10 h-10 flex items-center justify-center">
                  <CalendarIcon className="h-5 w-5" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">PT Maju Bersama</p>
                <p className="text-xs text-gray-500">Jl. Raya Kebayoran Lama No. 12, Jakarta Selatan</p>
                <div className="flex items-center mt-1">
                  <p className="text-xs text-gray-500">14:00 - 16:00</p>
                  <span className="mx-2 text-gray-300">•</span>
                  <p className="text-xs text-gray-500">Team A - Budi</p>
                </div>
              </div>
              <div className="flex-shrink-0">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                  Pending
                </span>
              </div>
            </div>
            
            <div className="flex items-start space-x-4 p-3 border rounded-lg">
              <div className="flex-shrink-0">
                <div className="bg-blue-100 text-blue-800 text-xs font-medium rounded-full w-10 h-10 flex items-center justify-center">
                  <CalendarIcon className="h-5 w-5" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">CV Sejahtera</p>
                <p className="text-xs text-gray-500">Jl. Gatot Subroto Kav. 51, Jakarta Pusat</p>
                <div className="flex items-center mt-1">
                  <p className="text-xs text-gray-500">16:30 - 18:00</p>
                  <span className="mx-2 text-gray-300">•</span>
                  <p className="text-xs text-gray-500">Team B - Andi</p>
                </div>
              </div>
              <div className="flex-shrink-0">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                  In Progress
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PickupDashboard;
