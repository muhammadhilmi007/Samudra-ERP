/**
 * Samudra Paket ERP - Loading & Delivery Dashboard
 * Main dashboard for loading and delivery operations
 */

'use client';

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Truck, Map, ArrowRightLeft, Activity, BarChart2, Clock } from 'lucide-react';
import Link from 'next/link';

export default function LoadingDeliveryDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-xl font-semibold">Operasional Muat & Pengiriman</h2>
        <div className="flex flex-wrap gap-2">
          <Link href="/loading-delivery/loading-management" className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90">
            <Package className="h-4 w-4 mr-2" />
            Kelola Muat
          </Link>
          <Link href="/loading-delivery/delivery-planning" className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700">
            <Truck className="h-4 w-4 mr-2" />
            Pengiriman
          </Link>
          <Link href="/loading-delivery/shipment-tracking" className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/90">
            <Map className="h-4 w-4 mr-2" />
            Tracking
          </Link>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full md:w-auto grid-cols-3 md:grid-cols-4 h-auto">
          <TabsTrigger value="overview">Ikhtisar</TabsTrigger>
          <TabsTrigger value="loading">Pemuatan</TabsTrigger>
          <TabsTrigger value="delivery">Pengiriman</TabsTrigger>
          <TabsTrigger value="shipments">Barang Transit</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Sedang Dimuat</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">18</span>
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">6 kendaraan sedang dimuat</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Dalam Perjalanan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">24</span>
                  <Truck className="h-6 w-6 text-blue-600" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">12 kendaraan dalam perjalanan</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pending Delivery</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">36</span>
                  <Clock className="h-6 w-6 text-amber-600" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">Menunggu pengiriman ke tujuan akhir</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg font-medium">Performa Pengiriman</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tepat Waktu</span>
                    <span className="font-medium">92%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full">
                    <div className="h-2 bg-green-500 rounded-full" style={{ width: '92%' }}></div>
                  </div>
                  
                  <div className="flex justify-between mt-4">
                    <span className="text-muted-foreground">Tertunda</span>
                    <span className="font-medium">5%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full">
                    <div className="h-2 bg-amber-500 rounded-full" style={{ width: '5%' }}></div>
                  </div>
                  
                  <div className="flex justify-between mt-4">
                    <span className="text-muted-foreground">Bermasalah</span>
                    <span className="font-medium">3%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full">
                    <div className="h-2 bg-red-500 rounded-full" style={{ width: '3%' }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg font-medium">Aktivitas Terbaru</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="relative pl-6 border-l-2 border-gray-200 py-1">
                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-green-500"></div>
                    <div className="text-sm">
                      <p className="font-medium">Truk A-4321-BC tiba di cabang Jakarta</p>
                      <p className="text-xs text-muted-foreground">15 menit yang lalu</p>
                    </div>
                  </div>
                  
                  <div className="relative pl-6 border-l-2 border-gray-200 py-1">
                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-blue-500"></div>
                    <div className="text-sm">
                      <p className="font-medium">Pemuatan selesai untuk truk B-1234-CD</p>
                      <p className="text-xs text-muted-foreground">45 menit yang lalu</p>
                    </div>
                  </div>
                  
                  <div className="relative pl-6 border-l-2 border-gray-200 py-1">
                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-amber-500"></div>
                    <div className="text-sm">
                      <p className="font-medium">Truk C-5678-EF berangkat dari cabang Surabaya</p>
                      <p className="text-xs text-muted-foreground">1 jam yang lalu</p>
                    </div>
                  </div>
                  
                  <div className="relative pl-6 py-1">
                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-purple-500"></div>
                    <div className="text-sm">
                      <p className="font-medium">Pengiriman selesai di area Bandung</p>
                      <p className="text-xs text-muted-foreground">2 jam yang lalu</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="loading" className="pt-4">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Status Pemuatan</h3>
            
            <div className="overflow-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">No. Kendaraan</th>
                    <th className="text-left py-3 px-4 font-medium">Tujuan</th>
                    <th className="text-left py-3 px-4 font-medium">Progres</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-left py-3 px-4 font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4">B-1234-CD</td>
                    <td className="py-3 px-4">Bandung</td>
                    <td className="py-3 px-4">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-primary h-2.5 rounded-full" style={{ width: '80%' }}></div>
                      </div>
                      <span className="text-xs text-muted-foreground">80%</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Sedang Dimuat
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Link href="/loading-delivery/loading-management/B-1234-CD" className="text-sm text-primary hover:underline">Detail</Link>
                    </td>
                  </tr>
                  <tr className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4">D-5678-EF</td>
                    <td className="py-3 px-4">Semarang</td>
                    <td className="py-3 px-4">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-primary h-2.5 rounded-full" style={{ width: '45%' }}></div>
                      </div>
                      <span className="text-xs text-muted-foreground">45%</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Sedang Dimuat
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Link href="/loading-delivery/loading-management/D-5678-EF" className="text-sm text-primary hover:underline">Detail</Link>
                    </td>
                  </tr>
                  <tr className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4">E-9012-GH</td>
                    <td className="py-3 px-4">Surabaya</td>
                    <td className="py-3 px-4">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '100%' }}></div>
                      </div>
                      <span className="text-xs text-muted-foreground">100%</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Siap Berangkat
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Link href="/loading-delivery/loading-management/E-9012-GH" className="text-sm text-primary hover:underline">Detail</Link>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="flex justify-end">
              <Link href="/loading-delivery/loading-management" className="text-sm text-primary hover:underline">
                Lihat Semua
              </Link>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="delivery" className="pt-4">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Status Pengiriman</h3>
            
            <div className="overflow-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Rute</th>
                    <th className="text-left py-3 px-4 font-medium">Kurir</th>
                    <th className="text-left py-3 px-4 font-medium">Jumlah Paket</th>
                    <th className="text-left py-3 px-4 font-medium">Progres</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-left py-3 px-4 font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4">Jakarta Utara - 01</td>
                    <td className="py-3 px-4">Budi Santoso</td>
                    <td className="py-3 px-4">12</td>
                    <td className="py-3 px-4">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: '75%' }}></div>
                      </div>
                      <span className="text-xs text-muted-foreground">9/12</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Dalam Pengiriman
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Link href="/loading-delivery/delivery-planning/JKT-N-01" className="text-sm text-primary hover:underline">Detail</Link>
                    </td>
                  </tr>
                  <tr className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4">Jakarta Selatan - 02</td>
                    <td className="py-3 px-4">Agus Wijaya</td>
                    <td className="py-3 px-4">8</td>
                    <td className="py-3 px-4">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: '37.5%' }}></div>
                      </div>
                      <span className="text-xs text-muted-foreground">3/8</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Dalam Pengiriman
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Link href="/loading-delivery/delivery-planning/JKT-S-02" className="text-sm text-primary hover:underline">Detail</Link>
                    </td>
                  </tr>
                  <tr className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4">Jakarta Barat - 03</td>
                    <td className="py-3 px-4">Dimas Pratama</td>
                    <td className="py-3 px-4">15</td>
                    <td className="py-3 px-4">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '100%' }}></div>
                      </div>
                      <span className="text-xs text-muted-foreground">15/15</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Selesai
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Link href="/loading-delivery/delivery-planning/JKT-B-03" className="text-sm text-primary hover:underline">Detail</Link>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="flex justify-end">
              <Link href="/loading-delivery/delivery-planning" className="text-sm text-primary hover:underline">
                Lihat Semua
              </Link>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="shipments" className="pt-4">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Pengiriman Antar Cabang</h3>
            
            <div className="overflow-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">ID Shipment</th>
                    <th className="text-left py-3 px-4 font-medium">Asal</th>
                    <th className="text-left py-3 px-4 font-medium">Tujuan</th>
                    <th className="text-left py-3 px-4 font-medium">Estimasi Tiba</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-left py-3 px-4 font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4">SHP-00123</td>
                    <td className="py-3 px-4">Jakarta</td>
                    <td className="py-3 px-4">Bandung</td>
                    <td className="py-3 px-4">03 Mei 2025, 14:30</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        In Transit
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Link href="/loading-delivery/shipment-tracking/SHP-00123" className="text-sm text-primary hover:underline">Track</Link>
                    </td>
                  </tr>
                  <tr className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4">SHP-00124</td>
                    <td className="py-3 px-4">Surabaya</td>
                    <td className="py-3 px-4">Jakarta</td>
                    <td className="py-3 px-4">04 Mei 2025, 09:45</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        Departed
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Link href="/loading-delivery/shipment-tracking/SHP-00124" className="text-sm text-primary hover:underline">Track</Link>
                    </td>
                  </tr>
                  <tr className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4">SHP-00125</td>
                    <td className="py-3 px-4">Bandung</td>
                    <td className="py-3 px-4">Semarang</td>
                    <td className="py-3 px-4">03 Mei 2025, 23:15</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Arrived
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Link href="/loading-delivery/shipment-tracking/SHP-00125" className="text-sm text-primary hover:underline">Track</Link>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="flex justify-end">
              <Link href="/loading-delivery/shipment-tracking" className="text-sm text-primary hover:underline">
                Lihat Semua
              </Link>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
