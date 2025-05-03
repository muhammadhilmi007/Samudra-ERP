/**
 * Samudra Paket ERP - Delivery Status Dashboard
 * Provides comprehensive view of delivery operations status and metrics
 */

'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  ArrowLeft,
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle,
  Truck,
  RefreshCw,
  Download,
  ChevronDown,
  MapPin,
  Calendar
} from 'lucide-react';
import Link from 'next/link';

// Import chart components (these would typically be from a chart library like Chart.js or Recharts)
// For this example, we'll create placeholder components
const PerformanceChart = () => (
  <div className="h-64 border rounded-md flex items-center justify-center">
    <p className="text-muted-foreground">Performance chart would be displayed here</p>
  </div>
);

const DeliveryVolumeChart = () => (
  <div className="h-64 border rounded-md flex items-center justify-center">
    <p className="text-muted-foreground">Delivery volume chart would be displayed here</p>
  </div>
);

const RegionalPerformanceChart = () => (
  <div className="h-64 border rounded-md flex items-center justify-center">
    <p className="text-muted-foreground">Regional performance chart would be displayed here</p>
  </div>
);

// Mock data
const mockPerformanceData = {
  onTimeDelivery: 92, // percentage
  averageDeliveryTime: 45, // minutes
  firstTimeDeliverySuccess: 88, // percentage
  issuesRate: 3, // percentage
  totalDeliveriesToday: 287,
  completedDeliveriesToday: 215,
  inProgressDeliveriesToday: 48,
  pendingDeliveriesToday: 24,
  activeVehicles: 18,
  activeCouriers: 22
};

const mockIssues = [
  {
    id: 'ISSUE-001',
    waybill: 'WB-12345',
    type: 'address_not_found',
    description: 'Alamat tidak ditemukan, nomor telepon tidak bisa dihubungi',
    recipient: 'PT Abadi Jaya',
    courier: 'Budi Santoso',
    area: 'Jakarta Timur',
    status: 'pending_resolution',
    createdAt: '2025-05-03T10:15:00Z'
  },
  {
    id: 'ISSUE-002',
    waybill: 'WB-23456',
    type: 'recipient_not_available',
    description: 'Penerima tidak di tempat, akan dicoba kembali besok',
    recipient: 'Toko Elektronik Maju',
    courier: 'Agus Wijaya',
    area: 'Jakarta Selatan',
    status: 'rescheduled',
    createdAt: '2025-05-03T11:30:00Z'
  },
  {
    id: 'ISSUE-003',
    waybill: 'WB-34567',
    type: 'package_damaged',
    description: 'Paket rusak saat pengiriman, pelanggan menolak menerima',
    recipient: 'Ibu Ani',
    courier: 'Dimas Pratama',
    area: 'Jakarta Barat',
    status: 'returned_to_warehouse',
    createdAt: '2025-05-03T13:45:00Z'
  }
];

export default function DeliveryStatusDashboard() {
  const [dateRange, setDateRange] = useState('today');
  const [region, setRegion] = useState('all');
  
  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };
  
  // Format time
  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Get a human-readable date range description
  const getDateRangeDescription = () => {
    switch(dateRange) {
      case 'today':
        return 'Hari Ini (3 Mei 2025)';
      case 'yesterday':
        return 'Kemarin (2 Mei 2025)';
      case 'week':
        return '7 Hari Terakhir (27 Apr - 3 Mei 2025)';
      case 'month':
        return 'Bulan Ini (Mei 2025)';
      default:
        return 'Hari Ini';
    }
  };
  
  // Get issue status badge
  const getIssueStatusBadge = (status) => {
    switch(status) {
      case 'pending_resolution':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Menunggu Penyelesaian
          </span>
        );
      case 'rescheduled':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Dijadwalkan Ulang
          </span>
        );
      case 'returned_to_warehouse':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Dikembalikan ke Gudang
          </span>
        );
      case 'resolved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Teratasi
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
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
          <h1 className="text-xl font-semibold">Dashboard Status Pengiriman</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Ekspor
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-4 rounded-lg border shadow-sm">
        <div>
          <h2 className="text-lg font-medium">{getDateRangeDescription()}</h2>
          <p className="text-sm text-muted-foreground">Terakhir diperbarui: {formatTime(new Date().toISOString())}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Rentang Waktu" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Hari Ini</SelectItem>
              <SelectItem value="yesterday">Kemarin</SelectItem>
              <SelectItem value="week">7 Hari Terakhir</SelectItem>
              <SelectItem value="month">Bulan Ini</SelectItem>
            </SelectContent>
          </Select>
          <Select value={region} onValueChange={setRegion}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Wilayah" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Wilayah</SelectItem>
              <SelectItem value="jakarta_utara">Jakarta Utara</SelectItem>
              <SelectItem value="jakarta_selatan">Jakarta Selatan</SelectItem>
              <SelectItem value="jakarta_barat">Jakarta Barat</SelectItem>
              <SelectItem value="jakarta_timur">Jakarta Timur</SelectItem>
              <SelectItem value="jakarta_pusat">Jakarta Pusat</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ketepatan Waktu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-2xl font-bold">{mockPerformanceData.onTimeDelivery}%</span>
                <span className="text-sm text-green-600 ml-2">+2.5%</span>
              </div>
              <TrendingUp className="h-6 w-6 text-green-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Pengiriman tepat waktu</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Waktu Pengiriman</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-2xl font-bold">{mockPerformanceData.averageDeliveryTime}</span>
                <span className="text-xs ml-1">menit</span>
                <span className="text-sm text-green-600 ml-2">-3.2%</span>
              </div>
              <Clock className="h-6 w-6 text-blue-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Rata-rata waktu pengiriman</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Sukses Pertama Kali</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-2xl font-bold">{mockPerformanceData.firstTimeDeliverySuccess}%</span>
                <span className="text-sm text-green-600 ml-2">+1.8%</span>
              </div>
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Pengiriman sukses pada percobaan pertama</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Masalah Pengiriman</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-2xl font-bold">{mockPerformanceData.issuesRate}%</span>
                <span className="text-sm text-red-600 ml-2">+0.5%</span>
              </div>
              <AlertTriangle className="h-6 w-6 text-amber-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Pengiriman mengalami masalah</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle>Performansi Pengiriman</CardTitle>
            <CardDescription>Tren mingguan ketepatan waktu pengiriman</CardDescription>
          </CardHeader>
          <CardContent>
            <PerformanceChart />
          </CardContent>
        </Card>
        
        <Card className="md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle>Status Pengiriman Hari Ini</CardTitle>
            <CardDescription>Total: {mockPerformanceData.totalDeliveriesToday} pengiriman</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm">Selesai</span>
                  <span className="text-sm font-medium">{mockPerformanceData.completedDeliveriesToday} ({Math.round(mockPerformanceData.completedDeliveriesToday / mockPerformanceData.totalDeliveriesToday * 100)}%)</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full">
                  <div 
                    className="h-2 bg-green-500 rounded-full" 
                    style={{ width: `${Math.round(mockPerformanceData.completedDeliveriesToday / mockPerformanceData.totalDeliveriesToday * 100)}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm">Dalam Proses</span>
                  <span className="text-sm font-medium">{mockPerformanceData.inProgressDeliveriesToday} ({Math.round(mockPerformanceData.inProgressDeliveriesToday / mockPerformanceData.totalDeliveriesToday * 100)}%)</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full">
                  <div 
                    className="h-2 bg-blue-500 rounded-full" 
                    style={{ width: `${Math.round(mockPerformanceData.inProgressDeliveriesToday / mockPerformanceData.totalDeliveriesToday * 100)}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm">Menunggu</span>
                  <span className="text-sm font-medium">{mockPerformanceData.pendingDeliveriesToday} ({Math.round(mockPerformanceData.pendingDeliveriesToday / mockPerformanceData.totalDeliveriesToday * 100)}%)</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full">
                  <div 
                    className="h-2 bg-amber-500 rounded-full" 
                    style={{ width: `${Math.round(mockPerformanceData.pendingDeliveriesToday / mockPerformanceData.totalDeliveriesToday * 100)}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-100 text-blue-800 mx-auto">
                      <Truck className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-medium mt-1">{mockPerformanceData.activeVehicles}</p>
                    <p className="text-xs text-muted-foreground">Kendaraan Aktif</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-green-100 text-green-800 mx-auto">
                      <CheckCircle className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-medium mt-1">{mockPerformanceData.activeCouriers}</p>
                    <p className="text-xs text-muted-foreground">Kurir Aktif</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="issues" className="w-full">
        <TabsList className="grid w-full md:w-auto grid-cols-2 md:grid-cols-3 h-auto">
          <TabsTrigger value="issues">Masalah Pengiriman</TabsTrigger>
          <TabsTrigger value="volume">Volume Pengiriman</TabsTrigger>
          <TabsTrigger value="regional">Performa Regional</TabsTrigger>
        </TabsList>
        
        <TabsContent value="issues" className="pt-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <CardTitle>Masalah Pengiriman Terbaru</CardTitle>
                <Button variant="outline" size="sm">
                  Lihat Semua Masalah
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">ID</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Waybill</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Penerima</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Wilayah</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Deskripsi</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Waktu</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockIssues.map((issue) => (
                      <tr key={issue.id} className="border-t hover:bg-muted/50">
                        <td className="px-4 py-3 text-sm">{issue.id}</td>
                        <td className="px-4 py-3 text-sm">{issue.waybill}</td>
                        <td className="px-4 py-3 text-sm font-medium">{issue.recipient}</td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex items-center">
                            <MapPin className="h-3 w-3 mr-1 text-muted-foreground" />
                            {issue.area}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">{issue.description}</td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex flex-col">
                            <span>{formatDate(issue.createdAt)}</span>
                            <span className="text-xs text-muted-foreground">{formatTime(issue.createdAt)}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">{getIssueStatusBadge(issue.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="volume" className="pt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Volume Pengiriman Harian</CardTitle>
              <CardDescription>Jumlah pengiriman per hari selama 7 hari terakhir</CardDescription>
            </CardHeader>
            <CardContent>
              <DeliveryVolumeChart />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="regional" className="pt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Performa Regional</CardTitle>
              <CardDescription>Perbandingan performa antar wilayah</CardDescription>
            </CardHeader>
            <CardContent>
              <RegionalPerformanceChart />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
