/**
 * Samudra Paket ERP - Route Visualization Component
 * Provides interactive visualization of delivery routes with optimized stops
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  MapPin, 
  Route, 
  TruckIcon, 
  Package, 
  Check, 
  Clock, 
  AlertCircle,
  RefreshCw,
  Info
} from 'lucide-react';

const RouteVisualization = ({ 
  routeData, 
  onRefreshRoute = () => {},
  onStopStatusChange = () => {}
}) => {
  const [selectedStop, setSelectedStop] = useState(null);
  
  // Calculate route completion percentage
  const completedStops = routeData?.stops?.filter(stop => stop.status === 'completed').length || 0;
  const totalStops = routeData?.stops?.length || 0;
  const completionPercentage = totalStops > 0 ? Math.round((completedStops / totalStops) * 100) : 0;
  
  // Handle selecting a stop
  const handleSelectStop = (stopId) => {
    const selected = routeData?.stops?.find(stop => stop.id === stopId);
    setSelectedStop(selected);
  };
  
  // Handle changing stop status
  const handleStopStatusChange = (stopId, newStatus) => {
    onStopStatusChange(stopId, newStatus);
  };
  
  // Format time
  const formatTime = (timeString) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Get status badge for a stop
  const getStopStatusBadge = (status) => {
    switch(status) {
      case 'completed':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Selesai</Badge>;
      case 'in_progress':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Sedang Dikunjungi</Badge>;
      case 'failed':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Gagal</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Menunggu</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  if (!routeData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Visualisasi Rute</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Tidak ada data rute</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <CardTitle className="flex items-center">
            <Route className="h-5 w-5 mr-2" />
            {routeData.name}
            <Badge variant="outline" className="ml-2 bg-blue-100 text-blue-800 border-blue-200">
              {routeData.vehicleId}
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-2 mt-2 md:mt-0">
            <Badge variant="outline">
              {completedStops}/{totalStops} Pengiriman
            </Badge>
            <Button variant="outline" size="sm" onClick={onRefreshRoute}>
              <RefreshCw className="h-3 w-3 mr-1" />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Left panel: Route visualization */}
          <div className="md:col-span-2 border rounded-lg p-3 bg-muted/20">
            <div className="mb-3 flex justify-between items-center">
              <h3 className="text-sm font-medium">Visualisasi Rute</h3>
              <div className="text-sm">
                Progress: <span className="font-medium">{completionPercentage}%</span>
              </div>
            </div>
            
            <div className="relative h-[300px] bg-white rounded-md border overflow-hidden">
              {/* This would be replaced with an actual map in a real implementation */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-muted-foreground text-xs">
                  <Info className="h-4 w-4 mx-auto mb-1" />
                  Visualisasi peta rute akan ditampilkan di sini
                </div>
              </div>
              
              {/* Route visualization */}
              <div className="absolute inset-x-10 top-1/2 transform -translate-y-1/2">
                <div className="h-2 bg-gray-200 rounded-full relative">
                  <div 
                    className="h-2 rounded-full bg-blue-500"
                    style={{ width: `${completionPercentage}%` }}
                  ></div>
                  
                  {/* Origin marker */}
                  <div className="absolute -left-2 -top-3 flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white">
                      <TruckIcon className="h-3 w-3" />
                    </div>
                    <div className="bg-white px-2 py-1 rounded shadow-sm mt-1 text-xs font-medium">
                      Mulai
                    </div>
                  </div>
                  
                  {/* Stop markers */}
                  {routeData.stops.map((stop, index) => {
                    // Calculate stop position based on index
                    const position = ((index + 1) / (routeData.stops.length + 1)) * 100;
                    const statusColor = 
                      stop.status === 'completed' 
                        ? 'bg-green-500' 
                        : stop.status === 'in_progress'
                          ? 'bg-blue-500'
                          : stop.status === 'failed'
                            ? 'bg-red-500'
                            : 'bg-yellow-500';
                    
                    return (
                      <div 
                        key={stop.id}
                        className="absolute -top-4 flex flex-col items-center cursor-pointer"
                        style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
                        onClick={() => handleSelectStop(stop.id)}
                      >
                        <div 
                          className={`w-6 h-6 rounded-full ${statusColor} flex items-center justify-center text-white ${selectedStop?.id === stop.id ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
                        >
                          <MapPin className="h-3 w-3" />
                        </div>
                        <div className="bg-white px-1 py-0.5 rounded shadow-sm mt-1">
                          <div className="text-xs font-medium">{index + 1}</div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* End marker */}
                  <div className="absolute -right-2 -top-3 flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white">
                      <Check className="h-3 w-3" />
                    </div>
                    <div className="bg-white px-2 py-1 rounded shadow-sm mt-1 text-xs font-medium">
                      Selesai
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Current location info */}
              <div className="absolute bottom-3 left-3 right-3 bg-white p-2 rounded-md shadow-sm">
                <div className="flex items-center text-sm">
                  <TruckIcon className="h-4 w-4 mr-2 text-blue-500" />
                  <div>
                    <p className="font-medium">Kurir: {routeData.courierName}</p>
                    <p className="text-xs text-muted-foreground">
                      {routeData.vehicleId} • {routeData.courierPhone}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right panel: Stops list */}
          <div className="md:col-span-1 border rounded-lg overflow-hidden">
            <div className="p-3 border-b bg-muted/10">
              <h3 className="text-sm font-medium mb-1">Daftar Pengiriman</h3>
              <p className="text-xs text-muted-foreground">Klik untuk detail</p>
            </div>
            
            <ScrollArea className="h-[300px]">
              <div className="p-2 space-y-2">
                {routeData.stops.map((stop, index) => (
                  <div 
                    key={stop.id}
                    onClick={() => handleSelectStop(stop.id)}
                    className={`p-2 rounded-md border cursor-pointer ${
                      selectedStop?.id === stop.id 
                        ? 'bg-blue-50 border-blue-200' 
                        : 'hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 rounded-full bg-muted items-center justify-center">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{stop.recipient}</p>
                        <p className="text-xs text-muted-foreground truncate">{stop.address}</p>
                      </div>
                      {getStopStatusBadge(stop.status)}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
        
        {/* Selected stop details */}
        {selectedStop && (
          <div className="mt-4 border rounded-lg p-3">
            <div className="flex items-start justify-between">
              <h3 className="text-sm font-medium">Detail Pengiriman</h3>
              {getStopStatusBadge(selectedStop.status)}
            </div>
            
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">Penerima</p>
                  <p className="text-sm font-medium">{selectedStop.recipient}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Alamat</p>
                  <p className="text-sm">{selectedStop.address}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">No. Resi</p>
                  <p className="text-sm font-medium">{selectedStop.waybill}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">Jadwal</p>
                  <p className="text-sm">
                    {selectedStop.scheduledTime 
                      ? formatTime(selectedStop.scheduledTime)
                      : 'Tidak terjadwal'
                    }
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">No. Telepon</p>
                  <p className="text-sm">{selectedStop.phone}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Catatan</p>
                  <p className="text-sm">{selectedStop.notes || '-'}</p>
                </div>
              </div>
            </div>
            
            {selectedStop.status !== 'completed' && (
              <div className="mt-4 flex gap-2 justify-end">
                {selectedStop.status !== 'failed' && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="bg-red-50 text-red-800 border-red-200 hover:bg-red-100 hover:text-red-900"
                    onClick={() => handleStopStatusChange(selectedStop.id, 'failed')}
                  >
                    <AlertCircle className="h-4 w-4 mr-1" />
                    Gagal
                  </Button>
                )}
                
                {selectedStop.status !== 'in_progress' && selectedStop.status !== 'completed' && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100 hover:text-blue-900"
                    onClick={() => handleStopStatusChange(selectedStop.id, 'in_progress')}
                  >
                    <Clock className="h-4 w-4 mr-1" />
                    Sedang Dikunjungi
                  </Button>
                )}
                
                {selectedStop.status !== 'completed' && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="bg-green-50 text-green-800 border-green-200 hover:bg-green-100 hover:text-green-900"
                    onClick={() => handleStopStatusChange(selectedStop.id, 'completed')}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Selesai
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RouteVisualization;
