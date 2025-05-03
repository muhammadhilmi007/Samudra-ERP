/**
 * Samudra Paket ERP - Shipment Map Component
 * Interactive map visualization for shipment location tracking
 */

'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, RefreshCw, MapPin, TruckIcon, HomeIcon } from 'lucide-react';
import { formatDateTime } from '@/lib/dateUtils';

const ShipmentMap = ({ 
  shipmentData, 
  trackingPoints = [], 
  originCoordinates,
  destinationCoordinates,
  isLoading = false,
  onRefresh = () => {}
}) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState('');

  // Initialize Google Maps
  useEffect(() => {
    // Skip if already initialized or no shipment data
    if (mapLoaded || !shipmentData || typeof window === 'undefined') return;

    // Check if Google Maps API is loaded
    if (!window.google || !window.google.maps) {
      const googleMapsScript = document.createElement('script');
      googleMapsScript.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=geometry`;
      googleMapsScript.async = true;
      googleMapsScript.defer = true;
      
      googleMapsScript.onload = initializeMap;
      googleMapsScript.onerror = () => setError('Failed to load Google Maps');
      
      document.head.appendChild(googleMapsScript);
      return () => {
        document.head.removeChild(googleMapsScript);
      };
    } else {
      initializeMap();
    }
  }, [shipmentData, mapLoaded]);

  // Update map markers when tracking data changes
  useEffect(() => {
    if (!map || !trackingPoints || trackingPoints.length === 0) return;
    
    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));
    
    const newMarkers = [];
    const bounds = new window.google.maps.LatLngBounds();
    const path = trackingPoints.map(point => {
      const latLng = new window.google.maps.LatLng(
        point.location.coordinates[1], 
        point.location.coordinates[0]
      );
      bounds.extend(latLng);
      return latLng;
    });
    
    // Add origin marker if provided
    if (originCoordinates) {
      const originLatLng = new window.google.maps.LatLng(
        originCoordinates[1], 
        originCoordinates[0]
      );
      bounds.extend(originLatLng);
      
      const originMarker = new window.google.maps.Marker({
        position: originLatLng,
        map,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#2563EB', // Primary blue
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
        title: 'Origin'
      });
      
      newMarkers.push(originMarker);
      
      // Add info window for origin
      const originInfoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 8px;">
            <strong>Origin</strong>
            <p>${shipmentData.originBranch?.name || 'Origin'}</p>
          </div>
        `
      });
      
      originMarker.addListener('click', () => {
        originInfoWindow.open(map, originMarker);
      });
    }
    
    // Add destination marker if provided
    if (destinationCoordinates) {
      const destLatLng = new window.google.maps.LatLng(
        destinationCoordinates[1], 
        destinationCoordinates[0]
      );
      bounds.extend(destLatLng);
      
      const destMarker = new window.google.maps.Marker({
        position: destLatLng,
        map,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#F59E0B', // Accent amber
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
        title: 'Destination'
      });
      
      newMarkers.push(destMarker);
      
      // Add info window for destination
      const destInfoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 8px;">
            <strong>Destination</strong>
            <p>${shipmentData.destinationBranch?.name || 'Destination'}</p>
          </div>
        `
      });
      
      destMarker.addListener('click', () => {
        destInfoWindow.open(map, destMarker);
      });
    }
    
    // Add tracking point markers
    trackingPoints.forEach((point, index) => {
      const isLastPoint = index === trackingPoints.length - 1;
      const latLng = new window.google.maps.LatLng(
        point.location.coordinates[1], 
        point.location.coordinates[0]
      );
      
      const marker = new window.google.maps.Marker({
        position: latLng,
        map,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: isLastPoint ? 10 : 6,
          fillColor: isLastPoint ? '#10B981' : '#64748B', // Green for last point, slate for others
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
        title: point.status || `Location ${index + 1}`
      });
      
      newMarkers.push(marker);
      
      // Add info window
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; max-width: 200px;">
            <strong>${point.status ? point.status.replace(/_/g, ' ').toUpperCase() : `Location ${index + 1}`}</strong>
            <p>${point.address || 'Unknown location'}</p>
            <p style="font-size: 12px; color: #64748B;">${formatDateTime(point.timestamp)}</p>
          </div>
        `
      });
      
      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });
      
      // Automatically open info window for last point
      if (isLastPoint && trackingPoints.length > 0) {
        infoWindow.open(map, marker);
      }
    });
    
    // Draw polyline between tracking points
    if (trackingPoints.length > 1) {
      const polyline = new window.google.maps.Polyline({
        path,
        geodesic: true,
        strokeColor: '#64748B',
        strokeOpacity: 0.8,
        strokeWeight: 3
      });
      
      polyline.setMap(map);
    }
    
    // Fit bounds to show all markers
    if (newMarkers.length > 0) {
      map.fitBounds(bounds);
      
      // Set minimum zoom level
      const listener = window.google.maps.event.addListener(map, 'idle', () => {
        if (map.getZoom() > 15) {
          map.setZoom(15);
        }
        window.google.maps.event.removeListener(listener);
      });
    }
    
    setMarkers(newMarkers);
  }, [map, trackingPoints, originCoordinates, destinationCoordinates]);

  // Initialize map
  const initializeMap = () => {
    if (!mapRef.current || mapLoaded) return;
    
    try {
      const mapOptions = {
        center: { lat: -1.2499, lng: 116.8256 }, // Indonesia center by default
        zoom: 5,
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: true,
        mapTypeControlOptions: {
          style: window.google.maps.MapTypeControlStyle.DROPDOWN_MENU
        },
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      };
      
      const newMap = new window.google.maps.Map(mapRef.current, mapOptions);
      setMap(newMap);
      setMapLoaded(true);
      setError('');
    } catch (err) {
      console.error('Error initializing map:', err);
      setError('Failed to initialize map');
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center">
          <MapPin className="mr-2 h-5 w-5" />
          Location Tracking
        </CardTitle>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRefresh}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="mr-1 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-1 h-4 w-4" />
          )}
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="bg-destructive/10 p-4 rounded-md text-destructive">
            <p className="font-medium">{error}</p>
            <p className="text-sm mt-1">Please check your internet connection or try again later.</p>
          </div>
        ) : isLoading ? (
          <div className="h-[400px] flex items-center justify-center bg-muted/20 rounded-md">
            <div className="flex flex-col items-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">Loading map data...</p>
            </div>
          </div>
        ) : trackingPoints && trackingPoints.length > 0 ? (
          <div ref={mapRef} className="h-[400px] rounded-md" />
        ) : (
          <div className="h-[400px] flex items-center justify-center bg-muted/20 rounded-md">
            <div className="flex flex-col items-center">
              <MapPin className="h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">No location data available</p>
            </div>
          </div>
        )}
        
        {trackingPoints && trackingPoints.length > 0 && (
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="flex items-start gap-2">
              <div className="flex-shrink-0 mt-1">
                <HomeIcon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Origin</p>
                <p className="text-xs text-muted-foreground">{shipmentData?.originBranch?.name || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="flex-shrink-0 mt-1">
                <TruckIcon className="h-4 w-4 text-accent" />
              </div>
              <div>
                <p className="text-sm font-medium">Last Known Location</p>
                <p className="text-xs text-muted-foreground">
                  {trackingPoints[trackingPoints.length - 1]?.address || 'Unknown location'}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ShipmentMap;
