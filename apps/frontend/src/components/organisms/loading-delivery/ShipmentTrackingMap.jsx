/**
 * Samudra Paket ERP - Shipment Tracking Map Component
 * Provides visualization of shipment route and current location
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Navigation, Truck, Route, Info } from 'lucide-react';

const ShipmentTrackingMap = ({ shipmentData }) => {
  // In a real application, this would use an actual mapping library
  // like Google Maps, Mapbox, or Leaflet to render a real map
  // Here we're creating a simplified visual representation

  const calculateProgress = () => {
    if (!shipmentData) return 0;
    
    const startDate = new Date(shipmentData.departureTime).getTime();
    const endDate = new Date(shipmentData.estimatedArrival).getTime();
    const currentDate = new Date().getTime();
    
    // If we're past the estimated arrival, cap at 100%
    if (currentDate > endDate) return 100;
    
    // If we haven't departed yet, return 0%
    if (currentDate < startDate) return 0;
    
    const totalDuration = endDate - startDate;
    const elapsedDuration = currentDate - startDate;
    
    return Math.min(Math.round((elapsedDuration / totalDuration) * 100), 100);
  };
  
  const progressPercentage = calculateProgress();
  
  if (!shipmentData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Peta Pengiriman</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Tidak ada data pengiriman</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center">
          <Route className="h-5 w-5 mr-2" />
          Peta Pengiriman
          <Badge variant="outline" className="ml-2 bg-blue-100 text-blue-800 border-blue-200">
            {shipmentData.vehicleId}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg h-64 bg-muted/20 relative overflow-hidden">
          {/* This is a simplified map visualization */}
          {/* In a real application, this would be replaced with an actual map */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-muted-foreground text-xs">
              <Info className="h-4 w-4 mx-auto mb-1" />
              Visualisasi peta sebenarnya akan ditampilkan di sini
            </div>
          </div>
          
          {/* Simplified route visualization */}
          <div className="absolute inset-x-10 top-1/2 transform -translate-y-1/2">
            <div className="h-2 bg-gray-200 rounded-full relative">
              <div 
                className="h-2 rounded-full bg-blue-500"
                style={{ width: `${progressPercentage}%` }}
              ></div>
              
              {/* Origin marker */}
              <div className="absolute -left-2 -top-3 flex flex-col items-center">
                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white">
                  <MapPin className="h-3 w-3" />
                </div>
                <div className="bg-white px-2 py-1 rounded shadow-sm mt-1 text-xs font-medium">
                  {shipmentData.origin}
                </div>
              </div>
              
              {/* Destination marker */}
              <div className="absolute -right-2 -top-3 flex flex-col items-center">
                <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white">
                  <MapPin className="h-3 w-3" />
                </div>
                <div className="bg-white px-2 py-1 rounded shadow-sm mt-1 text-xs font-medium">
                  {shipmentData.destination}
                </div>
              </div>
              
              {/* Vehicle marker */}
              <div 
                className="absolute -top-4 flex flex-col items-center"
                style={{ left: `${progressPercentage}%`, transform: 'translateX(-50%)' }}
              >
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                  <Truck className="h-4 w-4" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Current location info */}
          <div className="absolute bottom-3 left-3 right-3 bg-white p-2 rounded-md shadow-sm">
            <div className="flex items-center text-sm">
              <Navigation className="h-4 w-4 mr-2 text-blue-500" />
              <div>
                <p className="font-medium">Posisi Terakhir</p>
                <p className="text-xs text-muted-foreground">
                  {shipmentData.currentLocation || 'Belum mulai perjalanan'}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Keberangkatan</p>
            <p className="text-sm font-medium">{formatDateTime(shipmentData.departureTime)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Estimasi Tiba</p>
            <p className="text-sm font-medium">{formatDateTime(shipmentData.estimatedArrival)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Helper function to format date and time
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

export default ShipmentTrackingMap;
