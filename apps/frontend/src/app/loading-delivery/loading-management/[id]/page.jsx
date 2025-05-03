/**
 * Samudra Paket ERP - Loading Management Detail Page
 * Displays detailed view of a specific loading operation with visualization
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  Truck,
  Package,
  Calendar,
  User,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Clipboard,
  Send
} from 'lucide-react';
import Link from 'next/link';
import VehicleLoadingVisualization from '@/components/organisms/loading-delivery/VehicleLoadingVisualization';

// Mock data for loading operation detail
const getMockLoadingDetail = (id) => {
  return {
    id: id,
    vehicleId: 'B-1234-CD',
    vehicleType: 'Truck',
    vehicleCapacity: '8000',
    destination: 'Bandung',
    departure: '2025-05-04T14:30:00Z',
    items: [
      { id: 'PKG-001', description: 'Elektronik', weight: 25, dimensions: '60x40x30cm', section: 'front', loaded: true },
      { id: 'PKG-002', description: 'Furniture', weight: 40, dimensions: '120x80x50cm', section: 'rear', loaded: true },
      { id: 'PKG-003', description: 'Pakaian', weight: 15, dimensions: '50x40x30cm', section: 'middle', loaded: true },
      { id: 'PKG-004', description: 'Peralatan Rumah', weight: 30, dimensions: '70x50x40cm', section: 'front', loaded: false },
      { id: 'PKG-005', description: 'Alat Olahraga', weight: 20, dimensions: '60x40x30cm', section: 'middle', loaded: false },
      { id: 'PKG-006', description: 'Makanan', weight: 15, dimensions: '40x30x20cm', section: 'rear', loaded: false },
      { id: 'PKG-007', description: 'Kosmetik', weight: 10, dimensions: '30x20x15cm', section: 'middle', loaded: false },
      { id: 'PKG-008', description: 'Buku', weight: 25, dimensions: '50x40x30cm', section: 'front', loaded: false },
      { id: 'PKG-009', description: 'Mainan', weight: 18, dimensions: '45x35x25cm', section: 'rear', loaded: false },
    ],
    status: 'loading',
    progress: 33, // calculated based on loaded items
    driver: 'Ahmad Fauzi',
    driverContact: '081234567890',
    updatedAt: '2025-05-03T13:25:00Z',
    createdAt: '2025-05-02T10:15:00Z',
    notes: 'Prioritaskan barang yang mudah pecah di bagian tengah kendaraan',
    documents: [
      { id: 'DOC-001', name: 'Surat Jalan', type: 'PDF', url: '#' },
      { id: 'DOC-002', name: 'Manifest Barang', type: 'PDF', url: '#' },
    ],
    loadingHistory: [
      { timestamp: '2025-05-03T10:15:00Z', action: 'Loading started', user: 'Budi Santoso' },
      { timestamp: '2025-05-03T11:30:00Z', action: 'Front section loading in progress', user: 'Budi Santoso' },
      { timestamp: '2025-05-03T12:45:00Z', action: 'Middle section loading started', user: 'Agus Wijaya' },
    ]
  };
};

export default function LoadingManagementDetail({ params }) {
  const [loadingData, setLoadingData] = useState(null);
  const [loadingItems, setLoadingItems] = useState([]);
  
  useEffect(() => {
    // In a real app, this would be an API call
    const mockData = getMockLoadingDetail(params.id);
    setLoadingData(mockData);
    setLoadingItems(mockData.items);
  }, [params.id]);
  
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
  
  // Handle loading an item
  const handleItemLoad = (itemId) => {
    setLoadingItems(prevItems => 
      prevItems.map(item => 
        item.id === itemId ? { ...item, loaded: true } : item
      )
    );
  };
  
  // Handle completing the loading process
  const handleCompleteLoading = () => {
    // In a real app, this would be an API call
    alert('Pemuatan selesai! Status akan diubah menjadi "Siap Berangkat"');
  };
  
  // Generate QR code URL (in a real app, this would generate a proper QR code)
  const getQRCodeUrl = () => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${loadingData?.id}`;
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
  
  // Calculate loading stats
  const calculateStats = () => {
    if (!loadingItems.length) return { loaded: 0, total: 0, percentage: 0, totalWeight: 0, loadedWeight: 0 };
    
    const loaded = loadingItems.filter(item => item.loaded).length;
    const total = loadingItems.length;
    const percentage = Math.round((loaded / total) * 100);
    
    const totalWeight = loadingItems.reduce((sum, item) => sum + item.weight, 0);
    const loadedWeight = loadingItems
      .filter(item => item.loaded)
      .reduce((sum, item) => sum + item.weight, 0);
    
    return { loaded, total, percentage, totalWeight, loadedWeight };
  };
  
  const stats = calculateStats();
  
  if (!loadingData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/loading-delivery/loading-management" className="mr-4">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Kembali
            </Button>
          </Link>
          <h1 className="text-xl font-semibold">Detail Pemuatan {loadingData.id}</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Clipboard className="h-4 w-4 mr-2" />
            Cetak Dokumen
          </Button>
          <Button className={stats.percentage === 100 ? 'bg-green-600 hover:bg-green-700' : ''}>
            <Send className="h-4 w-4 mr-2" />
            {stats.percentage === 100 ? 'Konfirmasi Keberangkatan' : 'Simpan Progres'}
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center">
                  <Truck className="h-5 w-5 mr-2" />
                  Kendaraan {loadingData.vehicleId}
                </CardTitle>
                <CardDescription className="mt-1">
                  {loadingData.vehicleType} - Kapasitas {loadingData.vehicleCapacity} kg
                </CardDescription>
              </div>
              {getStatusBadge(loadingData.status)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-start">
                  <MapPin className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Tujuan</p>
                    <p className="font-medium">{loadingData.destination}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Calendar className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Jadwal Keberangkatan</p>
                    <p className="font-medium">{formatDateTime(loadingData.departure)}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-start">
                  <User className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Pengemudi</p>
                    <p className="font-medium">{loadingData.driver}</p>
                    <p className="text-xs text-muted-foreground">{loadingData.driverContact}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Package className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Progres Pemuatan</p>
                    <div className="flex items-center mt-1">
                      <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className={`h-2 rounded-full ${stats.percentage === 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                          style={{ width: `${stats.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-medium">{stats.percentage}%</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stats.loaded}/{stats.total} barang dimuat 
                      ({stats.loadedWeight}/{stats.totalWeight} kg)
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {loadingData.notes && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
                <div className="flex items-start">
                  <AlertTriangle className="h-4 w-4 text-amber-500 mr-2 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">Catatan Pemuatan</p>
                    <p className="text-sm text-amber-700">{loadingData.notes}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Barcode & Dokumen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              <img 
                src={getQRCodeUrl()} 
                alt="Loading QR Code" 
                className="w-32 h-32 border rounded-md"
              />
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Dokumen Terkait</h3>
              <div className="space-y-2">
                {loadingData.documents.map(doc => (
                  <div key={doc.id} className="flex items-center justify-between p-2 border rounded-md">
                    <div className="flex items-center">
                      <div className="bg-muted rounded p-1 mr-2">
                        <span className="text-xs font-medium">{doc.type}</span>
                      </div>
                      <span className="text-sm">{doc.name}</span>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <a href={doc.url} target="_blank" rel="noopener noreferrer">Lihat</a>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="visualization" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-auto">
          <TabsTrigger value="visualization">Visualisasi Muat</TabsTrigger>
          <TabsTrigger value="items">Daftar Barang</TabsTrigger>
          <TabsTrigger value="history">Riwayat Aktivitas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="visualization" className="pt-4">
          <VehicleLoadingVisualization 
            vehicleData={{
              id: loadingData.vehicleId,
              type: loadingData.vehicleType,
              capacity: loadingData.vehicleCapacity
            }}
            loadingItems={loadingItems}
            onItemLoad={handleItemLoad}
            onComplete={handleCompleteLoading}
          />
        </TabsContent>
        
        <TabsContent value="items" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Daftar Barang ({stats.loaded}/{stats.total})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">ID</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Deskripsi</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Berat</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Dimensi</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Posisi</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingItems.map(item => (
                      <tr key={item.id} className="border-t hover:bg-muted/50">
                        <td className="px-4 py-3 text-sm">{item.id}</td>
                        <td className="px-4 py-3 text-sm font-medium">{item.description}</td>
                        <td className="px-4 py-3 text-sm">{item.weight} kg</td>
                        <td className="px-4 py-3 text-sm">{item.dimensions}</td>
                        <td className="px-4 py-3 text-sm">
                          {item.section === 'front' 
                            ? 'Depan'
                            : item.section === 'middle'
                              ? 'Tengah'
                              : 'Belakang'
                          }
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {item.loaded ? (
                            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Dimuat
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
                              <Clock className="h-3 w-3 mr-1" />
                              Menunggu
                            </Badge>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <Button
                            size="sm"
                            variant={item.loaded ? "outline" : "default"}
                            onClick={() => handleItemLoad(item.id)}
                            disabled={item.loaded}
                          >
                            {item.loaded ? "Dimuat" : "Muat"}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Riwayat Aktivitas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative pl-6 space-y-6">
                <div className="absolute top-0 bottom-0 left-2 border-l-2 border-muted"></div>
                
                {loadingData.loadingHistory.map((event, index) => (
                  <div key={index} className="relative">
                    <div className="absolute -left-[10px] top-0 w-4 h-4 rounded-full bg-primary"></div>
                    <div className="bg-muted/30 p-3 rounded-md">
                      <p className="text-sm font-medium">{event.action}</p>
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-xs text-muted-foreground">Oleh: {event.user}</p>
                        <p className="text-xs text-muted-foreground">{formatDateTime(event.timestamp)}</p>
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="relative">
                  <div className="absolute -left-[10px] top-0 w-4 h-4 rounded-full bg-muted"></div>
                  <div className="bg-muted/30 p-3 rounded-md border-dashed border-2 border-muted">
                    <p className="text-sm font-medium">Pemuatan dimulai</p>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-xs text-muted-foreground">Sistem</p>
                      <p className="text-xs text-muted-foreground">{formatDateTime(loadingData.createdAt)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
