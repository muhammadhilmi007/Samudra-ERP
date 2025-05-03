/**
 * Unit tests for ShipmentMap component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ShipmentMap from '@/components/organisms/tracking/ShipmentMap';

// Mock the Google Maps API
const mockMap = {
  setCenter: jest.fn(),
  fitBounds: jest.fn(),
  setZoom: jest.fn()
};

const mockMarker = {
  setMap: jest.fn(),
  addListener: jest.fn()
};

const mockInfoWindow = {
  open: jest.fn()
};

const mockPolyline = {
  setMap: jest.fn()
};

const mockLatLngBounds = {
  extend: jest.fn()
};

const mockLatLng = jest.fn().mockImplementation(() => ({
  lat: jest.fn().mockReturnValue(1),
  lng: jest.fn().mockReturnValue(1)
}));

// Mock window.google
beforeEach(() => {
  global.google = {
    maps: {
      Map: jest.fn(() => mockMap),
      Marker: jest.fn(() => mockMarker),
      InfoWindow: jest.fn(() => mockInfoWindow),
      Polyline: jest.fn(() => mockPolyline),
      LatLngBounds: jest.fn(() => mockLatLngBounds),
      LatLng: mockLatLng,
      SymbolPath: {
        CIRCLE: 0
      },
      event: {
        addListener: jest.fn(),
        removeListener: jest.fn()
      }
    }
  };
});

afterEach(() => {
  delete global.google;
  jest.clearAllMocks();
});

// Mock the formatDateTime function
jest.mock('@/lib/dateUtils', () => ({
  formatDateTime: jest.fn(() => 'May 3, 2025 10:30 AM')
}));

describe('ShipmentMap', () => {
  const mockShipmentData = {
    _id: '1234',
    waybillNo: 'SP123456789',
    originBranch: { name: 'Jakarta Branch' },
    destinationBranch: { name: 'Surabaya Branch' }
  };
  
  const mockTrackingPoints = [
    {
      timestamp: '2025-05-01T10:00:00Z',
      location: {
        coordinates: [106.8456, -6.2088] // [longitude, latitude]
      },
      status: 'departed',
      address: 'Jakarta'
    },
    {
      timestamp: '2025-05-02T08:30:00Z',
      location: {
        coordinates: [107.6191, -6.9175] // [longitude, latitude]
      },
      status: 'in_transit',
      address: 'Bandung'
    }
  ];
  
  const mockOriginCoordinates = [106.8456, -6.2088]; // [longitude, latitude]
  const mockDestinationCoordinates = [112.7508, -7.2575]; // [longitude, latitude]
  
  it('renders loading state when isLoading is true', () => {
    render(
      <ShipmentMap 
        shipmentData={mockShipmentData}
        trackingPoints={mockTrackingPoints}
        isLoading={true}
      />
    );
    
    expect(screen.getByText('Loading map data...')).toBeInTheDocument();
  });
  
  it('renders no data message when trackingPoints is empty', () => {
    render(
      <ShipmentMap 
        shipmentData={mockShipmentData}
        trackingPoints={[]}
        isLoading={false}
      />
    );
    
    expect(screen.getByText('No location data available')).toBeInTheDocument();
  });
  
  it('calls the refresh function when refresh button is clicked', () => {
    const mockRefresh = jest.fn();
    
    render(
      <ShipmentMap 
        shipmentData={mockShipmentData}
        trackingPoints={mockTrackingPoints}
        isLoading={false}
        onRefresh={mockRefresh}
      />
    );
    
    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    fireEvent.click(refreshButton);
    
    expect(mockRefresh).toHaveBeenCalledTimes(1);
  });
  
  it('initializes map when Google Maps is loaded', () => {
    const { rerender } = render(
      <ShipmentMap 
        shipmentData={mockShipmentData}
        trackingPoints={mockTrackingPoints}
        originCoordinates={mockOriginCoordinates}
        destinationCoordinates={mockDestinationCoordinates}
        isLoading={false}
      />
    );
    
    // Force re-render to trigger useEffect
    rerender(
      <ShipmentMap 
        shipmentData={mockShipmentData}
        trackingPoints={mockTrackingPoints}
        originCoordinates={mockOriginCoordinates}
        destinationCoordinates={mockDestinationCoordinates}
        isLoading={false}
      />
    );
    
    // Verify the Map constructor was called
    expect(global.google.maps.Map).toHaveBeenCalled();
  });
  
  it('displays origin and destination information', () => {
    render(
      <ShipmentMap 
        shipmentData={mockShipmentData}
        trackingPoints={mockTrackingPoints}
        originCoordinates={mockOriginCoordinates}
        destinationCoordinates={mockDestinationCoordinates}
        isLoading={false}
      />
    );
    
    expect(screen.getByText('Origin')).toBeInTheDocument();
    expect(screen.getByText('Jakarta Branch')).toBeInTheDocument();
    expect(screen.getByText('Last Known Location')).toBeInTheDocument();
    expect(screen.getByText('Bandung')).toBeInTheDocument(); // Last tracking point
  });
  
  it('handles errors when map initialization fails', () => {
    // Mock Map constructor to throw an error
    global.google.maps.Map = jest.fn(() => {
      throw new Error('Map initialization failed');
    });
    
    // Mock console.error to prevent error output in test
    const originalConsoleError = console.error;
    console.error = jest.fn();
    
    render(
      <ShipmentMap 
        shipmentData={mockShipmentData}
        trackingPoints={mockTrackingPoints}
        isLoading={false}
      />
    );
    
    expect(screen.getByText('Failed to initialize map')).toBeInTheDocument();
    
    // Restore console.error
    console.error = originalConsoleError;
  });
});
