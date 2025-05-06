/**
 * Tests for BatchScanning component
 */
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import BatchScanning from '../components/BatchScanning';
import { batchScanningService } from '../services/batchScanningService';
import { warehouseItemService } from '../services/warehouseItemService';

// Mock dependencies
jest.mock('../services/batchScanningService', () => ({
  batchScanningService: {
    getBatchesByStatus: jest.fn(() => Promise.resolve([
      {
        id: 'batch-1',
        batchCode: 'BATCH123456',
        batchType: 'incoming',
        status: 'pending',
        location: 'Warehouse A',
        createdAt: new Date().getTime(),
        notes: 'Test batch',
      },
      {
        id: 'batch-2',
        batchCode: 'BATCH654321',
        batchType: 'outgoing',
        status: 'pending',
        location: 'Warehouse B',
        createdAt: new Date().getTime(),
        notes: '',
      }
    ])),
    getItemsInBatch: jest.fn(() => Promise.resolve([
      {
        id: 'item-1',
        itemCode: 'WH123456789',
        trackingNumber: 'TRK123456789',
        status: 'incoming',
        receiverName: 'John Doe',
        destinationBranchName: 'Branch One',
        itemType: 'package',
        weight: '2.5',
      },
      {
        id: 'item-2',
        itemCode: 'WH987654321',
        trackingNumber: 'TRK987654321',
        status: 'incoming',
        receiverName: 'Jane Smith',
        destinationBranchName: 'Branch Two',
        itemType: 'document',
        weight: '0.5',
      }
    ])),
    createBatch: jest.fn(() => Promise.resolve({
      id: 'new-batch',
      batchCode: 'BATCH999999',
      batchType: 'incoming',
      status: 'pending',
    })),
    addItemToBatch: jest.fn(() => Promise.resolve()),
    processBatch: jest.fn(() => Promise.resolve()),
    cancelBatch: jest.fn(() => Promise.resolve()),
  }
}));

jest.mock('../services/warehouseItemService', () => ({
  warehouseItemService: {
    getItemsByStatus: jest.fn(() => Promise.resolve([
      {
        id: 'item-3',
        itemCode: 'WH555555555',
        trackingNumber: 'TRK555555555',
        status: 'incoming',
      }
    ])),
  }
}));

// Mock navigation
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
};

// Mock route
const mockRoute = {
  params: {
    userId: 'user-1',
  },
};

describe('BatchScanning', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with batch list', async () => {
    const { getByText, findByText } = render(
      <BatchScanning navigation={mockNavigation} route={mockRoute} />
    );

    // Check if component renders with title
    expect(getByText('Batch Scanning')).toBeTruthy();

    // Wait for batches to load
    await waitFor(() => {
      expect(batchScanningService.getBatchesByStatus).toHaveBeenCalledWith('pending');
    });

    // Check if batches are displayed
    await findByText('BATCH123456');
    await findByText('BATCH654321');
  });

  it('allows creating a new batch', async () => {
    const { getByText, getByTestId, findByText } = render(
      <BatchScanning navigation={mockNavigation} route={mockRoute} />
    );

    // Open create batch modal
    fireEvent.press(getByText('Create Batch'));

    // Fill in batch details
    fireEvent.changeText(getByTestId('location-input'), 'Warehouse C');
    fireEvent.changeText(getByTestId('notes-input'), 'New test batch');

    // Create batch
    fireEvent.press(getByText('Create'));

    // Check if service was called
    await waitFor(() => {
      expect(batchScanningService.createBatch).toHaveBeenCalledWith({
        batchType: 'incoming',
        location: 'Warehouse C',
        notes: 'New test batch',
        processedBy: 'user-1',
      });
    });

    // Check if batches are refreshed
    expect(batchScanningService.getBatchesByStatus).toHaveBeenCalledTimes(2);
  });

  it('displays batch details when a batch is selected', async () => {
    const { getByText, findByText } = render(
      <BatchScanning navigation={mockNavigation} route={mockRoute} />
    );

    // Wait for batches to load
    await waitFor(() => {
      expect(batchScanningService.getBatchesByStatus).toHaveBeenCalledWith('pending');
    });

    // Select a batch
    fireEvent.press(await findByText('BATCH123456'));

    // Check if batch details are displayed
    await waitFor(() => {
      expect(batchScanningService.getItemsInBatch).toHaveBeenCalledWith('batch-1');
    });

    // Check if batch summary is displayed
    await findByText('Batch Summary');
    await findByText('Total Items: 2');
  });

  it('allows processing a batch', async () => {
    const { getByText, findByText } = render(
      <BatchScanning navigation={mockNavigation} route={mockRoute} />
    );

    // Wait for batches to load
    await waitFor(() => {
      expect(batchScanningService.getBatchesByStatus).toHaveBeenCalledWith('pending');
    });

    // Select a batch
    fireEvent.press(await findByText('BATCH123456'));

    // Wait for batch items to load
    await waitFor(() => {
      expect(batchScanningService.getItemsInBatch).toHaveBeenCalledWith('batch-1');
    });

    // Process batch
    fireEvent.press(await findByText('Process Batch'));

    // Check if service was called
    await waitFor(() => {
      expect(batchScanningService.processBatch).toHaveBeenCalledWith('batch-1', 'user-1');
    });

    // Check if batches are refreshed
    expect(batchScanningService.getBatchesByStatus).toHaveBeenCalledTimes(2);
  });

  it('allows cancelling a batch', async () => {
    const { getByText, findByText } = render(
      <BatchScanning navigation={mockNavigation} route={mockRoute} />
    );

    // Wait for batches to load
    await waitFor(() => {
      expect(batchScanningService.getBatchesByStatus).toHaveBeenCalledWith('pending');
    });

    // Select a batch
    fireEvent.press(await findByText('BATCH123456'));

    // Wait for batch items to load
    await waitFor(() => {
      expect(batchScanningService.getItemsInBatch).toHaveBeenCalledWith('batch-1');
    });

    // Cancel batch
    fireEvent.press(await findByText('Cancel Batch'));
    
    // Confirm cancellation
    fireEvent.press(await findByText('Yes'));

    // Check if service was called
    await waitFor(() => {
      expect(batchScanningService.cancelBatch).toHaveBeenCalledWith('batch-1');
    });

    // Check if batches are refreshed
    expect(batchScanningService.getBatchesByStatus).toHaveBeenCalledTimes(2);
  });
});
