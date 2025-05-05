/**
 * BarcodeScanner component tests
 */
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Camera } from 'expo-camera';
import { BarCodeScanner } from 'expo-barcode-scanner';
import BarcodeScanner from '../components/BarcodeScanner';

// Mock expo-camera
jest.mock('expo-camera', () => ({
  Camera: {
    Constants: {
      Type: {
        back: 'back',
        front: 'front'
      },
      FlashMode: {
        off: 'off',
        on: 'on',
        torch: 'torch'
      }
    },
    requestCameraPermissionsAsync: jest.fn()
  }
}));

// Mock expo-barcode-scanner
jest.mock('expo-barcode-scanner', () => ({
  BarCodeScanner: {
    Constants: {
      BarCodeType: {
        qr: 'qr',
        code128: 'code128',
        code39: 'code39',
        ean13: 'ean13',
        ean8: 'ean8'
      }
    }
  }
}));

describe('BarcodeScanner Component', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock camera permission granted
    Camera.requestCameraPermissionsAsync.mockResolvedValue({ status: 'granted' });
  });
  
  it('renders loading state while requesting permissions', async () => {
    // Mock permission request in progress
    Camera.requestCameraPermissionsAsync.mockImplementation(() => new Promise(() => {}));
    
    const { getByText } = render(
      <BarcodeScanner onScan={jest.fn()} onCancel={jest.fn()} />
    );
    
    expect(getByText('Requesting camera permission...')).toBeTruthy();
  });
  
  it('renders permission denied state when camera permission is not granted', async () => {
    // Mock permission denied
    Camera.requestCameraPermissionsAsync.mockResolvedValue({ status: 'denied' });
    
    const { getByText, findByText } = render(
      <BarcodeScanner onScan={jest.fn()} onCancel={jest.fn()} />
    );
    
    const permissionText = await findByText('Camera permission not granted. Please enable camera access in your device settings.');
    expect(permissionText).toBeTruthy();
  });
  
  it('renders scanner when permission is granted', async () => {
    const { findByTestId } = render(
      <BarcodeScanner onScan={jest.fn()} onCancel={jest.fn()} />
    );
    
    // Add test ID to Camera component in the actual implementation
    const scanner = await findByTestId('barcode-scanner');
    expect(scanner).toBeTruthy();
  });
  
  it('calls onScan when a barcode is scanned in single scan mode', async () => {
    const onScanMock = jest.fn();
    
    const { getByTestId } = render(
      <BarcodeScanner 
        onScan={onScanMock} 
        onCancel={jest.fn()} 
        scanMultiple={false}
      />
    );
    
    // Simulate barcode scan
    const barcodeData = { type: 'qr', data: 'test-qr-code' };
    const scanner = getByTestId('barcode-scanner');
    
    // Trigger the onBarCodeScanned prop
    fireEvent(scanner, 'onBarCodeScanned', barcodeData);
    
    // Check if onScan was called with the correct data
    expect(onScanMock).toHaveBeenCalledWith([barcodeData]);
  });
  
  it('accumulates scanned items in multiple scan mode', async () => {
    const { getByTestId, getByText } = render(
      <BarcodeScanner 
        onScan={jest.fn()} 
        onCancel={jest.fn()} 
        scanMultiple={true}
      />
    );
    
    // Simulate barcode scans
    const scanner = getByTestId('barcode-scanner');
    
    // Scan first barcode
    fireEvent(scanner, 'onBarCodeScanned', { type: 'qr', data: 'qr-code-1' });
    
    // Wait for scanning to resume
    await waitFor(() => {
      expect(getByText('Scanned Items (1)')).toBeTruthy();
    }, { timeout: 3000 });
    
    // Scan second barcode
    fireEvent(scanner, 'onBarCodeScanned', { type: 'code128', data: 'barcode-2' });
    
    // Check if both items are displayed
    await waitFor(() => {
      expect(getByText('Scanned Items (2)')).toBeTruthy();
      expect(getByText('qr-code-1')).toBeTruthy();
      expect(getByText('barcode-2')).toBeTruthy();
    }, { timeout: 3000 });
  });
  
  it('prevents duplicate scans in multiple scan mode', async () => {
    const { getByTestId, getByText } = render(
      <BarcodeScanner 
        onScan={jest.fn()} 
        onCancel={jest.fn()} 
        scanMultiple={true}
      />
    );
    
    // Simulate barcode scans
    const scanner = getByTestId('barcode-scanner');
    
    // Scan a barcode
    fireEvent(scanner, 'onBarCodeScanned', { type: 'qr', data: 'duplicate-code' });
    
    // Wait for scanning to resume
    await waitFor(() => {
      expect(getByText('Scanned Items (1)')).toBeTruthy();
    }, { timeout: 3000 });
    
    // Scan the same barcode again
    fireEvent(scanner, 'onBarCodeScanned', { type: 'qr', data: 'duplicate-code' });
    
    // Check that it's still only counted once
    await waitFor(() => {
      expect(getByText('Scanned Items (1)')).toBeTruthy();
    }, { timeout: 3000 });
  });
  
  it('calls onCancel when cancel button is pressed', () => {
    const onCancelMock = jest.fn();
    
    const { getByText } = render(
      <BarcodeScanner onScan={jest.fn()} onCancel={onCancelMock} />
    );
    
    // Press cancel button
    fireEvent.press(getByText('Cancel'));
    
    // Check if onCancel was called
    expect(onCancelMock).toHaveBeenCalled();
  });
  
  it('toggles flash mode when flash button is pressed', async () => {
    const { getByTestId } = render(
      <BarcodeScanner onScan={jest.fn()} onCancel={jest.fn()} />
    );
    
    // Get the flash button and scanner
    const flashButton = getByTestId('flash-toggle-button');
    const scanner = getByTestId('barcode-scanner');
    
    // Initially flash mode should be off
    expect(scanner.props.flashMode).toBe(Camera.Constants.FlashMode.off);
    
    // Toggle flash mode
    fireEvent.press(flashButton);
    
    // Flash mode should be torch
    expect(scanner.props.flashMode).toBe(Camera.Constants.FlashMode.torch);
    
    // Toggle flash mode again
    fireEvent.press(flashButton);
    
    // Flash mode should be off again
    expect(scanner.props.flashMode).toBe(Camera.Constants.FlashMode.off);
  });
  
  it('saves selected items when save button is pressed in multiple scan mode', async () => {
    const onScanMock = jest.fn();
    
    const { getByTestId, getByText } = render(
      <BarcodeScanner 
        onScan={onScanMock} 
        onCancel={jest.fn()} 
        scanMultiple={true}
      />
    );
    
    // Simulate barcode scans
    const scanner = getByTestId('barcode-scanner');
    
    // Scan barcodes
    fireEvent(scanner, 'onBarCodeScanned', { type: 'qr', data: 'qr-code-1' });
    fireEvent(scanner, 'onBarCodeScanned', { type: 'code128', data: 'barcode-2' });
    
    // Wait for scanning to resume
    await waitFor(() => {
      expect(getByText('Scanned Items (2)')).toBeTruthy();
    }, { timeout: 3000 });
    
    // Press save button
    fireEvent.press(getByText('Save Scanned Items'));
    
    // Check if onScan was called with the correct data
    expect(onScanMock).toHaveBeenCalledWith([
      expect.objectContaining({ type: 'qr', data: 'qr-code-1' }),
      expect.objectContaining({ type: 'code128', data: 'barcode-2' })
    ]);
  });
  
  it('removes a scanned item when remove button is pressed', async () => {
    const { getByTestId, getByText, queryByText } = render(
      <BarcodeScanner 
        onScan={jest.fn()} 
        onCancel={jest.fn()} 
        scanMultiple={true}
      />
    );
    
    // Simulate barcode scans
    const scanner = getByTestId('barcode-scanner');
    
    // Scan barcodes
    fireEvent(scanner, 'onBarCodeScanned', { type: 'qr', data: 'qr-code-1' });
    fireEvent(scanner, 'onBarCodeScanned', { type: 'code128', data: 'barcode-2' });
    
    // Wait for scanning to resume
    await waitFor(() => {
      expect(getByText('Scanned Items (2)')).toBeTruthy();
    }, { timeout: 3000 });
    
    // Press remove button for the first item
    const removeButtons = getAllByTestId('remove-item-button');
    fireEvent.press(removeButtons[0]);
    
    // Check that the item was removed
    expect(queryByText('qr-code-1')).toBeNull();
    expect(getByText('Scanned Items (1)')).toBeTruthy();
    expect(getByText('barcode-2')).toBeTruthy();
  });
});
