/**
 * Samudra Paket ERP - Loading Management Page
 * Provides interface for managing vehicle loading operations
 */

'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  Plus,
  Search,
  Truck,
  Package,
  AlertCircle,
  Clock,
  CheckCircle2,
  Filter,
} from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

// Mock data for loading operations
const mockLoadingOperations = [
  {
    id: 'LD-001',
    vehicleId: 'B-1234-CD',
    destination: 'Bandung',
    departure: '2025-05-04T14:30:00Z',
    items: 42,
    status: 'loading',
    progress: 80,
    driver: 'Ahmad Fauzi',
    updatedAt: '2025-05-03T13:25:00Z',
  },
  {
    id: 'LD-002',
    vehicleId: 'D-5678-EF',
    destination: 'Semarang',
    departure: '2025-05-04T16:00:00Z',
    items: 36,
    status: 'loading',
    progress: 45,
    driver: 'Rudi Hartono',
    updatedAt: '2025-05-03T12:45:00Z',
  },
  {
    id: 'LD-003',
    vehicleId: 'E-9012-GH',
    destination: 'Surabaya',
    departure: '2025-05-04T18:30:00Z',
    items: 64,
    status: 'ready',
    progress: 100,
    driver: 'Dimas Pratama',
    updatedAt: '2025-05-03T11:30:00Z',
  },
  {
    id: 'LD-004',
    vehicleId: 'F-3456-IJ',
    destination: 'Yogyakarta',
    departure: '2025-05-04T15:45:00Z',
    items: 29,
    status: 'scheduled',
    progress: 0,
    driver: 'Andri Kurniawan',
    updatedAt: '2025-05-03T10:15:00Z',
  },
  {
    id: 'LD-005',
    vehicleId: 'G-7890-KL',
    destination: 'Solo',
    departure: '2025-05-04T16:15:00Z',
    items: 31,
    status: 'scheduled',
    progress: 0,
    driver: 'Budi Santoso',
    updatedAt: '2025-05-03T09:30:00Z',
  },
  {
    id: 'LD-006',
    vehicleId: 'H-2345-MN',
    destination: 'Malang',
    departure: '2025-05-05T08:00:00Z',
    items: 52,
    status: 'scheduled',
    progress: 0,
    driver: 'Joko Widodo',
    updatedAt: '2025-05-03T08:45:00Z',
  },
  {
    id: 'LD-007',
    vehicleId: 'I-6789-OP',
    destination: 'Cirebon',
    departure: '2025-05-04T17:30:00Z',
    items: 27,
    status: 'ready',
    progress: 100,
    driver: 'Agus Wijaya',
    updatedAt: '2025-05-03T14:10:00Z',
  },
];

export default function LoadingManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Filter operations based on search and status
  const filteredOperations = mockLoadingOperations.filter(op => {
    const matchesSearch = 
      op.vehicleId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      op.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
      op.driver.toLowerCase().includes(searchTerm.toLowerCase()) ||
      op.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || op.status === filterStatus;
    
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
  
  // Get status badge
  const getStatusBadge = (status) => {
    switch(status) {
      case 'loading':
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <Clock className="h-3 w-3 mr-1" />
            Sedang Dimuat
          </Badge>
        );
      case 'ready':
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Siap Berangkat
          </Badge>
        );
      case 'scheduled':
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
            <Clock className="h-3 w-3 mr-1" />
            Terjadwal
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
          <h1 className="text-xl font-semibold">Manajemen Pemuatan Barang</h1>
        </div>
        <Link href="/loading-delivery/loading-management/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Buat Pemuatan Baru
          </Button>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Pemuatan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{mockLoadingOperations.length}</span>
              <Truck className="h-6 w-6 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Sedang Dimuat</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{mockLoadingOperations.filter(op => op.status === 'loading').length}</span>
              <Package className="h-6 w-6 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Siap Berangkat</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{mockLoadingOperations.filter(op => op.status === 'ready').length}</span>
              <CheckCircle2 className="h-6 w-6 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Terjadwal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{mockLoadingOperations.filter(op => op.status === 'scheduled').length}</span>
              <Clock className="h-6 w-6 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="bg-white rounded-md border shadow-sm">
        <div className="p-4 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between border-b">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Cari kendaraan, tujuan..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Filter:</span>
            </div>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="loading">Sedang Dimuat</SelectItem>
                <SelectItem value="ready">Siap Berangkat</SelectItem>
                <SelectItem value="scheduled">Terjadwal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50">
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">ID</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Kendaraan</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Tujuan</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Supir</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Jlh Barang</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Progres</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Jadwal Berangkat</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredOperations.length > 0 ? (
                filteredOperations.map((operation) => (
                  <tr key={operation.id} className="border-t hover:bg-muted/50">
                    <td className="px-4 py-3 text-sm">{operation.id}</td>
                    <td className="px-4 py-3 text-sm font-medium">{operation.vehicleId}</td>
                    <td className="px-4 py-3 text-sm">{operation.destination}</td>
                    <td className="px-4 py-3 text-sm">{operation.driver}</td>
                    <td className="px-4 py-3 text-sm">{operation.items}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center">
                        <div className="w-20 h-2 bg-gray-200 rounded-full mr-2">
                          <div 
                            className={`h-2 rounded-full ${
                              operation.progress === 100 ? 'bg-green-500' : 'bg-blue-500'
                            }`}
                            style={{ width: `${operation.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-muted-foreground">{operation.progress}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">{formatDateTime(operation.departure)}</td>
                    <td className="px-4 py-3 text-sm">{getStatusBadge(operation.status)}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center space-x-2">
                        <Link 
                          href={`/loading-delivery/loading-management/${operation.id}`}
                          className="text-primary hover:underline text-sm"
                        >
                          Detail
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="px-4 py-8 text-center text-sm text-muted-foreground">
                    Tidak ada data pemuatan yang sesuai dengan kriteria pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
