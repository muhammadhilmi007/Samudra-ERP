/**
 * Samudra Paket ERP - Vehicle Loading Visualization Component Tests
 * Unit tests for the Vehicle Loading Visualization component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import VehicleLoadingVisualization from '@/components/organisms/loading-delivery/VehicleLoadingVisualization';

// Mock data for tests
const mockVehicleData = {
  id: 'B-1234-CD',
  type: 'Truck',
  capacity: '8000'
};

const mockLoadingItems = [
  { id: 'PKG-001', description: 'Elektronik', weight: 25, dimensions: '60x40x30cm', section: 'front', loaded: true },
  { id: 'PKG-002', description: 'Furniture', weight: 40, dimensions: '120x80x50cm', section: 'rear', loaded: true },
  { id: 'PKG-003', description: 'Pakaian', weight: 15, dimensions: '50x40x30cm', section: 'middle', loaded: false },
  { id: 'PKG-004', description: 'Peralatan Rumah', weight: 30, dimensions: '70x50x40cm', section: 'front', loaded: false }
];

// TooltipProvider mock since the component uses it
jest.mock('@/components/ui/tooltip', () => ({
  Tooltip: ({ children }) => <div data-testid="tooltip">{children}</div>,
  TooltipTrigger: ({ children }) => <div data-testid="tooltip-trigger">{children}</div>,
  TooltipContent: ({ children }) => <div data-testid="tooltip-content">{children}</div>,
  TooltipProvider: ({ children }) => <div data-testid="tooltip-provider">{children}</div>
}));

describe('VehicleLoadingVisualization', () => {
  test('renders with vehicle data and loading items', () => {
    render(
      <VehicleLoadingVisualization 
        vehicleData={mockVehicleData}
        loadingItems={mockLoadingItems}
      />
    );
    
    // Check that vehicle ID is displayed
    expect(screen.getByText(mockVehicleData.id)).toBeInTheDocument();
    
    // Check that progress is calculated correctly (50% of items are loaded)
    expect(screen.getByText('50%')).toBeInTheDocument();
    
    // Check that the vehicle sections are displayed
    expect(screen.getByText('Depan')).toBeInTheDocument();
    expect(screen.getByText('Tengah')).toBeInTheDocument();
    expect(screen.getByText('Belakang')).toBeInTheDocument();
  });
  
  test('handles section selection', () => {
    render(
      <VehicleLoadingVisualization 
        vehicleData={mockVehicleData}
        loadingItems={mockLoadingItems}
      />
    );
    
    // Initially should show a message to select a section
    expect(screen.getByText('Pilih bagian kendaraan pada visualisasi')).toBeInTheDocument();
    
    // Click on a section (front section)
    const frontSection = screen.getAllByText('Depan')[0];
    fireEvent.click(frontSection);
    
    // Should show items from that section
    expect(screen.getByText('Barang di Bagian Depan')).toBeInTheDocument();
    expect(screen.getByText('PKG-001 - Elektronik')).toBeInTheDocument();
    
    // Click on another section (middle section)
    const middleSection = screen.getAllByText('Tengah')[0];
    fireEvent.click(middleSection);
    
    // Should show items from that section
    expect(screen.getByText('Barang di Bagian Tengah')).toBeInTheDocument();
    expect(screen.getByText('PKG-003 - Pakaian')).toBeInTheDocument();
  });
  
  test('calls onItemLoad when loading an item', () => {
    const mockOnItemLoad = jest.fn();
    
    render(
      <VehicleLoadingVisualization 
        vehicleData={mockVehicleData}
        loadingItems={mockLoadingItems}
        onItemLoad={mockOnItemLoad}
      />
    );
    
    // Click on a section (front section) to show its items
    const frontSection = screen.getAllByText('Depan')[0];
    fireEvent.click(frontSection);
    
    // Find the button to load PKG-004 which is not loaded yet
    const loadButtons = screen.getAllByRole('button');
    const loadButton = loadButtons.find(button => 
      button.closest('div')?.textContent?.includes('PKG-004')
    );
    
    // Click the load button
    if (loadButton) {
      fireEvent.click(loadButton);
      expect(mockOnItemLoad).toHaveBeenCalledWith('PKG-004');
    } else {
      throw new Error('Load button not found');
    }
  });
  
  test('calls onComplete when all items are loaded', () => {
    const mockOnComplete = jest.fn();
    const allLoadedItems = mockLoadingItems.map(item => ({ ...item, loaded: true }));
    
    render(
      <VehicleLoadingVisualization 
        vehicleData={mockVehicleData}
        loadingItems={allLoadedItems}
        onComplete={mockOnComplete}
      />
    );
    
    // Find the "Selesai" button which should be enabled when all items are loaded
    const completeButton = screen.getByText('Selesai').closest('button');
    
    // Click the complete button
    if (completeButton) {
      fireEvent.click(completeButton);
      expect(mockOnComplete).toHaveBeenCalled();
    } else {
      throw new Error('Complete button not found or not enabled');
    }
  });
  
  test('disables completion button when not all items are loaded', () => {
    render(
      <VehicleLoadingVisualization 
        vehicleData={mockVehicleData}
        loadingItems={mockLoadingItems} // Some items are not loaded
      />
    );
    
    // Find the "Muat Barang" button which should be disabled
    const muatBarangText = screen.getByText('Muat Barang');
    const muatBarangButton = muatBarangText.closest('button');
    
    // Check that the button is disabled
    expect(muatBarangButton).toBeDisabled();
  });
});
