/**
 * Unit tests for TrackingTimeline component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import TrackingTimeline from '@/components/molecules/tracking/TrackingTimeline';

// Mock the dateUtils functions that are used in TrackingTimeline
jest.mock('@/lib/dateUtils', () => ({
  formatDate: jest.fn(() => 'May 3, 2025'),
  formatTime: jest.fn(() => '10:30 AM')
}));

describe('TrackingTimeline', () => {
  const mockStatusHistory = [
    {
      status: 'preparing',
      timestamp: '2025-05-01T08:00:00Z',
      location: 'Jakarta Warehouse',
      notes: 'Shipment is being prepared',
      user: 'John Doe'
    },
    {
      status: 'departed',
      timestamp: '2025-05-01T10:30:00Z',
      location: 'Jakarta Warehouse',
      notes: 'Shipment has departed from origin',
      user: 'Jane Smith'
    },
    {
      status: 'in_transit',
      timestamp: '2025-05-02T09:15:00Z',
      location: 'Bandung Distribution Center',
      notes: 'Shipment arrived at transit point',
      user: 'Bob Johnson'
    }
  ];
  
  it('renders correctly with status history data', () => {
    render(<TrackingTimeline statusHistory={mockStatusHistory} />);
    
    // Check that each status is displayed
    expect(screen.getByText('Preparing')).toBeInTheDocument();
    expect(screen.getByText('Departed')).toBeInTheDocument();
    expect(screen.getByText('In Transit')).toBeInTheDocument();
    
    // Check location display
    expect(screen.getByText('Jakarta Warehouse')).toBeInTheDocument();
    expect(screen.getByText('Bandung Distribution Center')).toBeInTheDocument();
    
    // Check that user information is displayed
    expect(screen.getByText('Updated by: John Doe')).toBeInTheDocument();
    expect(screen.getByText('Updated by: Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Updated by: Bob Johnson')).toBeInTheDocument();
  });
  
  it('renders a message when no status history is provided', () => {
    render(<TrackingTimeline statusHistory={[]} />);
    
    expect(screen.getByText('No tracking information available')).toBeInTheDocument();
  });
  
  it('renders a message when status history is undefined', () => {
    render(<TrackingTimeline />);
    
    expect(screen.getByText('No tracking information available')).toBeInTheDocument();
  });
  
  it('sorts the status history by timestamp in descending order', () => {
    // Create a new array with timestamps out of order
    const unsortedHistory = [
      { ...mockStatusHistory[2] }, // in_transit - newest
      { ...mockStatusHistory[0] }, // preparing - oldest
      { ...mockStatusHistory[1] }  // departed - middle
    ];
    
    render(<TrackingTimeline statusHistory={unsortedHistory} />);
    
    // Get all status elements
    const statusElements = screen.getAllByText(/Preparing|Departed|In Transit/);
    
    // After sorting, the order should be: in_transit (newest), departed, preparing (oldest)
    expect(statusElements[0].textContent).toBe('In Transit');
    expect(statusElements[1].textContent).toBe('Departed');
    expect(statusElements[2].textContent).toBe('Preparing');
  });
});
