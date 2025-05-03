/**
 * Samudra Paket ERP - Shipment Tracking Page
 * Allows tracking of inter-branch shipments
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
  Truck,
  Map,
  Calendar,
  Navigation,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import ShipmentTrackingMap from '@/components/organisms/loading-delivery/ShipmentTrackingMap';

// Mock data for shipments
const mockShipments = [
  {
    id: 'SHP-00123',
    vehicleId: 'B-1234-CD',
    driver: 'Ahmad Fauzi',
    origin: 'Jakarta',
    destination: 'Bandung',
    departureTime: '2025-05-03T10:30:00Z',
    estimatedArrival: '2025-05-03T14:30:00Z',
    currentLocation: 'Cikampek Tol',
    status: 'in_transit',
    statusHistory: [
      { status: 'preparing', timestamp: '2025-05-03T08:15:00Z', location: 'Gudang Jakarta' },
      { status: 'departed', timestamp: '2025-05-03T10:30:00Z', location: 'Cabang Jakarta' },
      { status: 'in_transit', timestamp: '2025-05-03T12:45:00Z', location: 'Cikampek Tol' }
    ],
    checkpoints: [
      { name: 'Jakarta', timestamp: '2025-05-03T10:30:00Z', status: 'passed' },
      { name: 'Karawang', timestamp: '2025-05-03T11:45:00Z', status: 'passed' },
      { name: 'Purwakarta', estimatedTimestamp: '2025-05-03T13:15:00Z', status: 'upcoming' },
      { name: 'Bandung', estimatedTimestamp: '2025-05-03T14:30:00Z', status: 'upcoming' }
    ],
    items: 42,
    weight: 1250,
    updatedAt: '2025-05-03T12:45:00Z',
  },
  {
    id: 'SHP-00124',
    vehicleId: 'D-5678-EF',
    driver: 'Rudi Hartono',
    origin: 'Surabaya',
    destination: 'Jakarta',
    departureTime: '2025-05-03T08:00:00Z',
    estimatedArrival: '2025-05-04T09:45:00Z',
    currentLocation: 'Semarang',
    status: 'in_transit',
    statusHistory: [
      { status: 'preparing', timestamp: '2025-05-03T06:30:00Z', location: 'Gudang Surabaya' },
      { status: 'departed', timestamp: '2025-05-03T08:00:00Z', location: 'Cabang Surabaya' },
      { status: 'in_transit', timestamp: '2025-05-03T12:30:00Z', location: 'Semarang' }
    ],
    checkpoints: [
      { name: 'Surabaya', timestamp: '2025-05-03T08:00:00Z', status: 'passed' },
      { name: 'Semarang', timestamp: '2025-05-03T12:30:00Z', status: 'passed' },
      { name: 'Cirebon', estimatedTimestamp: '2025-05-03T18:00:00Z', status: 'upcoming' },
      { name: 'Jakarta', estimatedTimestamp: '2025-05-04T09:45:00Z', status: 'upcoming' }
    ],
    items: 64,
    weight: 1850,
    updatedAt: '2025-05-03T12:30:00Z',
  },
  {
    id: 'SHP-00125',
    vehicleId: 'E-9012-GH',
    driver: 'Dimas Pratama',
    origin: 'Bandung',
    destination: 'Semarang',
    departureTime: '2025-05-03T09:15:00Z',
    estimatedArrival: '2025-05-03T23:15:00Z',
    currentLocation: 'Tegal',
    status: 'in_transit',
    statusHistory: [
      { status: 'preparing', timestamp: '2025-05-03T07:30:00Z', location: 'Gudang Bandung' },
      { status: 'departed', timestamp: '2025-05-03T09:15:00Z', location: 'Cabang Bandung' },
      { status: 'in_transit', timestamp: '2025-05-03T14:45:00Z', location: 'Tegal' }
    ],
    checkpoints: [
      { name: 'Bandung', timestamp: '2025-05-03T09:15:00Z', status: 'passed' },
      { name: 'Cirebon', timestamp: '2025-05-03T13:30:00Z', status: 'passed' },
      { name: 'Tegal', timestamp: '2025-05-03T14:45:00Z', status: 'passed' },
      { name: 'Semarang', estimatedTimestamp: '2025-05-03T23:15:00Z', status: 'upcoming' }
    ],
    items: 38,
    weight: 980,
    updatedAt: '2025-05-03T14:45:00Z',
  }
];

export default function ShipmentTracking() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedShipment, setSelectedShipment] = useState(mockShipments[0]);
  
  // Filter shipments based on search
  const filteredShipments = mockShipments.filter(shipment => {
    return (
      shipment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.vehicleId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.driver.toLowerCase().includes(searchTerm.toLowerCase())
    );
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
  
  // Format time only
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Get status badge
  const getStatusBadge = (status) => {
    switch(status) {
      case 'preparing':
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
            <Clock className="h-3 w-3 mr-1" />
            Persiapan
          </Badge>
        );
      case 'departed':
        return (
          <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">
            <Truck className="h-3 w-3 mr-1" />
            Berangkat
          </Badge>
        );
      case 'in_transit':
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <Navigation className="h-3 w-3 mr-1" />
            Dalam Perjalanan
          </Badge>
        );
      case 'arrived_at_destination':
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Tiba di Tujuan
          </Badge>
        );
      case 'unloaded':
        return (
          <Badge variant="outline" className="bg-indigo-100 text-indigo-800 border-indigo-200">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Sudah Dibongkar
          </Badge>
        );
      case 'completed':
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Selesai
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
            <AlertCircle className="h-3 w-3 mr-1" />
            Dibatalkan
          </Badge>
        );
      case 'delayed':
        return (
          <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200">
            <Clock className="h-3 w-3 mr-1" />
            Tertunda
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
          <h1 className="text-xl font-semibold">Tracking Pengiriman Antar Cabang</h1>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Cari ID shipment, kendaraan..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Card className="overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Pengiriman Aktif</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[500px] overflow-y-auto">
                {filteredShipments.length > 0 ? (
                  filteredShipments.map((shipment) => (
                    <div 
                      key={shipment.id} 
                      className={`p-3 border-b flex flex-col gap-2 cursor-pointer hover:bg-muted/50 ${
                        selectedShipment?.id === shipment.id ? 'bg-muted/50' : ''
                      }`}
                      onClick={() => setSelectedShipment(shipment)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{shipment.id}</h3>
                          <p className="text-xs text-muted-foreground">{shipment.vehicleId}</p>
                        </div>
                        {getStatusBadge(shipment.status)}
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <div>
                          <p className="font-medium">{shipment.origin}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatTime(shipment.departureTime)}
                          </p>
                        </div>
                        <div className="flex items-center px-2">
                          <ArrowLeft className="h-4 w-4 rotate-180 text-muted-foreground" />
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{shipment.destination}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatTime(shipment.estimatedArrival)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-muted-foreground">
                    Tidak ada pengiriman yang sesuai dengan pencarian.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-2 space-y-6">
          {selectedShipment ? (
            <>
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <CardTitle className="flex items-center">
                        Pengiriman {selectedShipment.id}
                        {getStatusBadge(selectedShipment.status)}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Update terakhir: {formatDateTime(selectedShipment.updatedAt)}
                      </p>
                    </div>
                    <div className="mt-2 md:mt-0">
                      <Button variant="outline" size="sm">
                        Refresh Data
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <div className="flex items-start">
                        <Truck className="h-4 w-4 mt-0.5 mr-2 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Kendaraan</p>
                          <p className="font-medium">{selectedShipment.vehicleId}</p>
                          <p className="text-xs text-muted-foreground">Supir: {selectedShipment.driver}</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <Map className="h-4 w-4 mt-0.5 mr-2 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Rute</p>
                          <p className="font-medium">{selectedShipment.origin} → {selectedShipment.destination}</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-start">
                        <Calendar className="h-4 w-4 mt-0.5 mr-2 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Jadwal</p>
                          <p className="font-medium">Berangkat: {formatDateTime(selectedShipment.departureTime)}</p>
                          <p className="font-medium">Estimasi Tiba: {formatDateTime(selectedShipment.estimatedArrival)}</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <Package className="h-4 w-4 mt-0.5 mr-2 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Muatan</p>
                          <p className="font-medium">{selectedShipment.items} barang ({selectedShipment.weight} kg)</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-muted/20 p-3 rounded-md border">
                    <div className="flex items-start">
                      <Navigation className="h-4 w-4 mt-0.5 mr-2 text-blue-500" />
                      <div>
                        <p className="text-sm font-medium">Posisi Terakhir</p>
                        <p className="text-sm">{selectedShipment.currentLocation}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Tabs defaultValue="map" className="w-full">
                <TabsList className="grid w-full md:w-auto grid-cols-2 md:grid-cols-3 h-auto">
                  <TabsTrigger value="map">Peta & Rute</TabsTrigger>
                  <TabsTrigger value="checkpoints">Checkpoint</TabsTrigger>
                  <TabsTrigger value="history">Riwayat Status</TabsTrigger>
                </TabsList>
                
                <TabsContent value="map" className="pt-4">
                  <ShipmentTrackingMap shipmentData={selectedShipment} />
                </TabsContent>
                
                <TabsContent value="checkpoints" className="pt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Map className="h-5 w-5 mr-2" />
                        Checkpoint Perjalanan
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="relative pl-6 space-y-6">
                        <div className="absolute top-0 bottom-0 left-2 border-l-2 border-muted"></div>
                        
                        {selectedShipment.checkpoints.map((checkpoint, index) => (
                          <div key={index} className="relative">
                            <div 
                              className={`absolute -left-[10px] top-0 w-4 h-4 rounded-full ${
                                checkpoint.status === 'passed' 
                                  ? 'bg-green-500' 
                                  : checkpoint.status === 'upcoming'
                                    ? 'bg-muted'
                                    : 'bg-amber-500'
                              }`}
                            ></div>
                            <div 
                              className={`p-3 rounded-md ${
                                checkpoint.status === 'passed' 
                                  ? 'bg-green-50 border border-green-200' 
                                  : checkpoint.status === 'upcoming'
                                    ? 'bg-muted/30 border border-dashed border-muted'
                                    : 'bg-amber-50 border border-amber-200'
                              }`}
                            >
                              <p className="text-sm font-medium">{checkpoint.name}</p>
                              <div className="flex justify-between items-center mt-1">
                                <p className="text-xs text-muted-foreground">
                                  {checkpoint.status === 'passed' ? 'Dilewati' : 'Estimasi'}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {formatDateTime(checkpoint.timestamp || checkpoint.estimatedTimestamp)}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="history" className="pt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Clock className="h-5 w-5 mr-2" />
                        Riwayat Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="relative pl-6 space-y-6">
                        <div className="absolute top-0 bottom-0 left-2 border-l-2 border-muted"></div>
                        
                        {selectedShipment.statusHistory.map((statusEvent, index) => (
                          <div key={index} className="relative">
                            <div className="absolute -left-[10px] top-0 w-4 h-4 rounded-full bg-primary"></div>
                            <div className="bg-muted/30 p-3 rounded-md">
                              <div className="flex justify-between items-start">
                                <p className="text-sm font-medium">
                                  {statusEvent.status === 'preparing' && 'Persiapan Muatan'}
                                  {statusEvent.status === 'departed' && 'Berangkat dari Asal'}
                                  {statusEvent.status === 'in_transit' && 'Dalam Perjalanan'}
                                  {statusEvent.status === 'arrived_at_destination' && 'Tiba di Tujuan'}
                                  {statusEvent.status === 'unloaded' && 'Pembongkaran Selesai'}
                                  {statusEvent.status === 'completed' && 'Pengiriman Selesai'}
                                  {statusEvent.status === 'cancelled' && 'Pengiriman Dibatalkan'}
                                  {statusEvent.status === 'delayed' && 'Pengiriman Tertunda'}
                                </p>
                                {getStatusBadge(statusEvent.status)}
                              </div>
                              <div className="mt-1">
                                <p className="text-sm">{statusEvent.location}</p>
                                <p className="text-xs text-muted-foreground">
                                  {formatDateTime(statusEvent.timestamp)}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          ) : (
            <div className="flex items-center justify-center h-64 border rounded-lg">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Pilih pengiriman untuk melihat detail</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
