/**
 * Samudra Paket ERP - Delivery Planning Page
 * Provides interface for planning and managing delivery routes
 */

'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Search,
  Plus,
  Truck,
  Users,
  PackageOpen,
  CalendarDays,
  Filter,
  MapPin,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import RouteVisualization from '@/components/organisms/loading-delivery/RouteVisualization';

// Mock data for delivery routes
const mockDeliveryRoutes = [
  {
    id: 'DR-001',
    name: 'Jakarta Utara - 01',
    vehicleId: 'B-1234-AB',
    courierName: 'Budi Santoso',
    courierPhone: '081234567890',
    status: 'in_progress',
    progress: 75, // 75% complete
    area: 'Jakarta Utara',
    scheduledDate: '2025-05-03',
    scheduledStartTime: '2025-05-03T08:00:00Z',
    estimatedEndTime: '2025-05-03T17:00:00Z',
    stops: [
      {
        id: 'STOP-001',
        waybill: 'WAYBILL-0011',
        recipient: 'PT Maju Jaya',
        address: 'Jl. Sunter Raya No. 10, Jakarta Utara',
        phone: '021-5551234',
        scheduledTime: '2025-05-03T09:15:00Z',
        status: 'completed',
        notes: 'Gedung berwarna biru, lobi lantai 1'
      },
      {
        id: 'STOP-002',
        waybill: 'WAYBILL-0022',
        recipient: 'Toko Elektronik Abadi',
        address: 'Jl. Gading Raya No. 25, Jakarta Utara',
        phone: '021-5552345',
        scheduledTime: '2025-05-03T10:30:00Z',
        status: 'completed',
        notes: 'Sebelah minimarket'
      },
      {
        id: 'STOP-003',
        waybill: 'WAYBILL-0033',
        recipient: 'Rumah Ibu Ani',
        address: 'Jl. Kelapa Gading Blok C2 No. 15, Jakarta Utara',
        phone: '087654321098',
        scheduledTime: '2025-05-03T11:45:00Z',
        status: 'in_progress',
        notes: 'Rumah cat kuning, pagar hitam'
      },
      {
        id: 'STOP-004',
        waybill: 'WAYBILL-0044',
        recipient: 'Kantor Adv. Mitra Solusi',
        address: 'Jl. Boulevard Raya No. 30, Jakarta Utara',
        phone: '021-5553456',
        scheduledTime: '2025-05-03T13:15:00Z',
        status: 'pending',
        notes: 'Gedung perkantoran lantai 5'
      }
    ],
    totalPackages: 12,
    completedPackages: 9,
    updatedAt: '2025-05-03T12:15:00Z'
  },
  {
    id: 'DR-002',
    name: 'Jakarta Selatan - 02',
    vehicleId: 'B-5678-BC',
    courierName: 'Agus Wijaya',
    courierPhone: '087812345678',
    status: 'in_progress',
    progress: 37.5, // 37.5% complete
    area: 'Jakarta Selatan',
    scheduledDate: '2025-05-03',
    scheduledStartTime: '2025-05-03T08:30:00Z',
    estimatedEndTime: '2025-05-03T17:30:00Z',
    stops: [
      {
        id: 'STOP-005',
        waybill: 'WAYBILL-0055',
        recipient: 'PT Sejahtera Mandiri',
        address: 'Jl. Fatmawati No. 15, Jakarta Selatan',
        phone: '021-7891234',
        scheduledTime: '2025-05-03T09:45:00Z',
        status: 'completed',
        notes: 'Gedung berwarna abu-abu'
      },
      {
        id: 'STOP-006',
        waybill: 'WAYBILL-0066',
        recipient: 'Rumah Bapak Deni',
        address: 'Jl. Cipete Raya No. 20, Jakarta Selatan',
        phone: '081298765432',
        scheduledTime: '2025-05-03T11:00:00Z',
        status: 'completed',
        notes: 'Rumah dengan taman depan'
      },
      {
        id: 'STOP-007',
        waybill: 'WAYBILL-0077',
        recipient: 'Toko Buku Cemerlang',
        address: 'Jl. Kemang Raya No. 35, Jakarta Selatan',
        phone: '021-7892345',
        scheduledTime: '2025-05-03T13:30:00Z',
        status: 'in_progress',
        notes: 'Di samping kafe'
      },
      {
        id: 'STOP-008',
        waybill: 'WAYBILL-0088',
        recipient: 'Klinik Sehat Sentosa',
        address: 'Jl. Sisingamangaraja No. 40, Jakarta Selatan',
        phone: '021-7893456',
        scheduledTime: '2025-05-03T14:45:00Z',
        status: 'pending',
        notes: 'Klinik dengan papan nama besar'
      }
    ],
    totalPackages: 8,
    completedPackages: 3,
    updatedAt: '2025-05-03T13:10:00Z'
  },
  {
    id: 'DR-003',
    name: 'Jakarta Barat - 03',
    vehicleId: 'B-9012-CD',
    courierName: 'Dimas Pratama',
    courierPhone: '089876543210',
    status: 'completed',
    progress: 100, // 100% complete
    area: 'Jakarta Barat',
    scheduledDate: '2025-05-03',
    scheduledStartTime: '2025-05-03T08:15:00Z',
    estimatedEndTime: '2025-05-03T16:45:00Z',
    stops: [
      {
        id: 'STOP-009',
        waybill: 'WAYBILL-0099',
        recipient: 'Apotek Sehat',
        address: 'Jl. Tanjung Duren No. 25, Jakarta Barat',
        phone: '021-5611234',
        scheduledTime: '2025-05-03T09:30:00Z',
        status: 'completed',
        notes: 'Apotek 24 jam'
      },
      {
        id: 'STOP-010',
        waybill: 'WAYBILL-0100',
        recipient: 'PT Cipta Karya',
        address: 'Jl. Tomang Raya No. 30, Jakarta Barat',
        phone: '021-5612345',
        scheduledTime: '2025-05-03T10:45:00Z',
        status: 'completed',
        notes: 'Gedung perkantoran lantai 3'
      },
      {
        id: 'STOP-011',
        waybill: 'WAYBILL-0101',
        recipient: 'Restoran Padang Sederhana',
        address: 'Jl. Kemanggisan No. 40, Jakarta Barat',
        phone: '021-5613456',
        scheduledTime: '2025-05-03T12:00:00Z',
        status: 'completed',
        notes: 'Sebelah bank'
      }
    ],
    totalPackages: 15,
    completedPackages: 15,
    updatedAt: '2025-05-03T15:20:00Z'
  }
];

export default function DeliveryPlanning() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedRoute, setSelectedRoute] = useState(mockDeliveryRoutes[0]);
  
  // Filter routes based on search and status
  const filteredRoutes = mockDeliveryRoutes.filter(route => {
    const matchesSearch = 
      route.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.vehicleId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.courierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.area.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || route.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });
  
  // Format date and time
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Handle stop status change
  const handleStopStatusChange = (stopId, newStatus) => {
    // In a real app, this would be an API call
    console.log(`Changing stop ${stopId} status to ${newStatus}`);
    
    // For demo purposes, update the local state
    if (selectedRoute) {
      const updatedRoute = {
        ...selectedRoute,
        stops: selectedRoute.stops.map(stop => 
          stop.id === stopId ? { ...stop, status: newStatus } : stop
        )
      };
      
      // Recalculate progress
      const completedStops = updatedRoute.stops.filter(stop => stop.status === 'completed').length;
      const totalStops = updatedRoute.stops.length;
      updatedRoute.progress = totalStops > 0 ? (completedStops / totalStops) * 100 : 0;
      
      // Update completed packages count
      updatedRoute.completedPackages = completedStops;
      
      // If all stops are completed, update route status
      if (completedStops === totalStops && totalStops > 0) {
        updatedRoute.status = 'completed';
      } else if (completedStops > 0) {
        updatedRoute.status = 'in_progress';
      }
      
      setSelectedRoute(updatedRoute);
    }
  };
  
  // Get status badge
  const getStatusBadge = (status) => {
    switch(status) {
      case 'completed':
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Selesai
          </Badge>
        );
      case 'in_progress':
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
            <Clock className="h-3 w-3 mr-1" />
            Dalam Proses
          </Badge>
        );
      case 'scheduled':
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <CalendarDays className="h-3 w-3 mr-1" />
            Terjadwal
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
            <AlertCircle className="h-3 w-3 mr-1" />
            Dibatalkan
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">
            {status}
          </Badge>
        );
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/loading-delivery" className="mr-4">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Kembali
            </Button>
          </Link>
          <h1 className="text-xl font-semibold">Perencanaan Pengiriman</h1>
        </div>
        <Link href="/loading-delivery/delivery-planning/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Buat Rute Baru
          </Button>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Rute</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{mockDeliveryRoutes.length}</span>
              <Truck className="h-6 w-6 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Kurir Aktif</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{mockDeliveryRoutes.filter(r => r.status === 'in_progress').length}</span>
              <Users className="h-6 w-6 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pengiriman Selesai</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{mockDeliveryRoutes.reduce((acc, route) => acc + route.completedPackages, 0)}</span>
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Paket</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{mockDeliveryRoutes.reduce((acc, route) => acc + route.totalPackages, 0)}</span>
              <PackageOpen className="h-6 w-6 text-amber-500" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-md border shadow-sm">
            <div className="p-4 flex flex-col gap-4 border-b">
              <div className="relative w-full">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Cari rute pengiriman..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Status:</span>
                <select 
                  className="text-sm border rounded-md px-2 py-1.5"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">Semua</option>
                  <option value="in_progress">Dalam Proses</option>
                  <option value="completed">Selesai</option>
                  <option value="scheduled">Terjadwal</option>
                </select>
              </div>
            </div>
            
            <div className="max-h-[600px] overflow-y-auto">
              {filteredRoutes.length > 0 ? (
                filteredRoutes.map((route) => (
                  <div 
                    key={route.id} 
                    className={`p-4 border-b cursor-pointer hover:bg-muted/50 ${selectedRoute?.id === route.id ? 'bg-muted/50' : ''}`}
                    onClick={() => setSelectedRoute(route)}
                  >
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-medium">{route.name}</h3>
                        <p className="text-xs text-muted-foreground">{route.vehicleId} • {route.courierName}</p>
                      </div>
                      {getStatusBadge(route.status)}
                    </div>
                    
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span>{Math.round(route.progress)}%</span>
                      </div>
                      <div className="w-full h-2 bg-muted mt-1 rounded-full">
                        <div 
                          className={`h-2 rounded-full ${route.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'}`}
                          style={{ width: `${route.progress}%` }}
                        ></div>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          <span>{route.stops.length} Lokasi</span>
                        </div>
                        <div className="flex items-center">
                          <PackageOpen className="h-3 w-3 mr-1" />
                          <span>{route.completedPackages}/{route.totalPackages} Paket</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-muted-foreground">
                  Tidak ada rute pengiriman yang sesuai dengan kriteria pencarian.
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-2 space-y-4">
          {selectedRoute ? (
            <>
              <Tabs defaultValue="route" className="w-full">
                <TabsList className="grid w-full grid-cols-2 h-auto">
                  <TabsTrigger value="route">Visualisasi Rute</TabsTrigger>
                  <TabsTrigger value="details">Detail Pengiriman</TabsTrigger>
                </TabsList>
                
                <TabsContent value="route" className="pt-4">
                  <RouteVisualization 
                    routeData={selectedRoute}
                    onRefreshRoute={() => console.log('Refreshing route data...')}
                    onStopStatusChange={handleStopStatusChange}
                  />
                </TabsContent>
                
                <TabsContent value="details" className="pt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Truck className="h-5 w-5 mr-2" />
                        Detail Rute {selectedRoute.id}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div>
                            <span className="text-sm text-muted-foreground">Nama Rute</span>
                            <p className="text-base font-medium">{selectedRoute.name}</p>
                          </div>
                          <div>
                            <span className="text-sm text-muted-foreground">Kendaraan</span>
                            <p className="text-base font-medium">{selectedRoute.vehicleId}</p>
                          </div>
                          <div>
                            <span className="text-sm text-muted-foreground">Pengemudi</span>
                            <p className="text-base font-medium">{selectedRoute.courierName}</p>
                            <p className="text-xs text-muted-foreground">{selectedRoute.courierPhone}</p>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <span className="text-sm text-muted-foreground">Tanggal</span>
                            <p className="text-base font-medium">{new Date(selectedRoute.scheduledDate).toLocaleDateString('id-ID')}</p>
                          </div>
                          <div>
                            <span className="text-sm text-muted-foreground">Jadwal</span>
                            <p className="text-base font-medium">
                              {formatDateTime(selectedRoute.scheduledStartTime)} - {formatDateTime(selectedRoute.estimatedEndTime)}
                            </p>
                          </div>
                          <div>
                            <span className="text-sm text-muted-foreground">Status</span>
                            <div className="mt-1">
                              {getStatusBadge(selectedRoute.status)}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="pt-4">
                        <h3 className="text-base font-medium mb-2">Daftar Pengiriman</h3>
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="bg-muted/50">
                                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">No.</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Penerima</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Alamat</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Jadwal</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedRoute.stops.map((stop, index) => (
                                <tr key={stop.id} className="border-t hover:bg-muted/50">
                                  <td className="px-4 py-3 text-sm">{index + 1}</td>
                                  <td className="px-4 py-3 text-sm font-medium">{stop.recipient}</td>
                                  <td className="px-4 py-3 text-sm">{stop.address}</td>
                                  <td className="px-4 py-3 text-sm">
                                    {stop.scheduledTime 
                                      ? new Date(stop.scheduledTime).toLocaleTimeString('id-ID', {
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })
                                      : '-'
                                    }
                                  </td>
                                  <td className="px-4 py-3 text-sm">
                                    {stop.status === 'completed' && (
                                      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                                        Selesai
                                      </Badge>
                                    )}
                                    {stop.status === 'in_progress' && (
                                      <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                                        Sedang Dikunjungi
                                      </Badge>
                                    )}
                                    {stop.status === 'pending' && (
                                      <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                                        Menunggu
                                      </Badge>
                                    )}
                                    {stop.status === 'failed' && (
                                      <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
                                        Gagal
                                      </Badge>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          ) : (
            <div className="flex items-center justify-center h-64 border rounded-lg">
              <div className="text-center">
                <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Pilih rute pengiriman untuk melihat detail</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
