/**
 * SignatureCapture component tests
 */
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import * as FileSystem from 'expo-file-system';
import { captureRef } from 'react-native-view-shot';
import SignatureCapture from '../components/SignatureCapture';

// Mock expo-file-system
jest.mock('expo-file-system', () => ({
  documentDirectory: 'file:///mock/path/',
  getInfoAsync: jest.fn(),
  makeDirectoryAsync: jest.fn(),
  moveAsync: jest.fn()
}));

// Mock react-native-view-shot
jest.mock('react-native-view-shot', () => ({
  captureRef: jest.fn()
}));

describe('SignatureCapture Component', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock file system functions
    FileSystem.getInfoAsync.mockResolvedValue({ exists: false });
    FileSystem.makeDirectoryAsync.mockResolvedValue(true);
    FileSystem.moveAsync.mockResolvedValue(true);
    
    // Mock captureRef
    captureRef.mockResolvedValue('file:///mock/path/temp-signature.jpg');
  });
  
  it('renders correctly with default props', () => {
    const { getByText } = render(
      <SignatureCapture onSignatureCapture={jest.fn()} onCancel={jest.fn()} />
    );
    
    // Check if default title and description are rendered
    expect(getByText('Signature')).toBeTruthy();
    expect(getByText('Please sign in the area below')).toBeTruthy();
    
    // Check if buttons are rendered
    expect(getByText('Clear')).toBeTruthy();
    expect(getByText('Cancel')).toBeTruthy();
    expect(getByText('Save Signature')).toBeTruthy();
  });
  
  it('renders with custom title and description', () => {
    const { getByText } = render(
      <SignatureCapture 
        onSignatureCapture={jest.fn()} 
        onCancel={jest.fn()}
        signatureTitle="Customer Signature"
        signatureDescription="Please sign to confirm receipt"
      />
    );
    
    // Check if custom title and description are rendered
    expect(getByText('Customer Signature')).toBeTruthy();
    expect(getByText('Please sign to confirm receipt')).toBeTruthy();
  });
  
  it('disables save and clear buttons when canvas is empty', () => {
    const { getByText } = render(
      <SignatureCapture onSignatureCapture={jest.fn()} onCancel={jest.fn()} />
    );
    
    // Check if save and clear buttons are disabled
    const saveButton = getByText('Save Signature').parent;
    const clearButton = getByText('Clear').parent;
    
    expect(saveButton.props.disabled).toBe(true);
    expect(clearButton.props.disabled).toBe(true);
  });
  
  it('enables save and clear buttons when signature is drawn', async () => {
    const { getByTestId, getByText } = render(
      <SignatureCapture onSignatureCapture={jest.fn()} onCancel={jest.fn()} />
    );
    
    // Get the signature canvas
    const canvas = getByTestId('signature-canvas');
    
    // Simulate drawing on the canvas
    fireEvent(canvas, 'onBegin');
    
    // Check if save and clear buttons are enabled
    const saveButton = getByText('Save Signature').parent;
    const clearButton = getByText('Clear').parent;
    
    expect(saveButton.props.disabled).toBe(false);
    expect(clearButton.props.disabled).toBe(false);
  });
  
  it('calls onCancel when cancel button is pressed', () => {
    const onCancelMock = jest.fn();
    
    const { getByText } = render(
      <SignatureCapture onSignatureCapture={jest.fn()} onCancel={onCancelMock} />
    );
    
    // Press cancel button
    fireEvent.press(getByText('Cancel'));
    
    // Check if onCancel was called
    expect(onCancelMock).toHaveBeenCalled();
  });
  
  it('clears signature when clear button is pressed', async () => {
    const { getByTestId, getByText } = render(
      <SignatureCapture onSignatureCapture={jest.fn()} onCancel={jest.fn()} />
    );
    
    // Get the signature canvas
    const canvas = getByTestId('signature-canvas');
    
    // Simulate drawing on the canvas
    fireEvent(canvas, 'onBegin');
    
    // Press clear button
    fireEvent.press(getByText('Clear'));
    
    // Check if canvas was cleared
    expect(canvas.props.clear).toHaveBeenCalled();
    
    // Check if save and clear buttons are disabled again
    await waitFor(() => {
      const saveButton = getByText('Save Signature').parent;
      const clearButton = getByText('Clear').parent;
      
      expect(saveButton.props.disabled).toBe(true);
      expect(clearButton.props.disabled).toBe(true);
    });
  });
  
  it('saves signature and calls onSignatureCapture when save button is pressed', async () => {
    const onSignatureCaptureMock = jest.fn();
    
    const { getByTestId, getByText } = render(
      <SignatureCapture 
        onSignatureCapture={onSignatureCaptureMock} 
        onCancel={jest.fn()}
        signatureTitle="Test Signature"
      />
    );
    
    // Get the signature canvas
    const canvas = getByTestId('signature-canvas');
    
    // Simulate drawing on the canvas
    fireEvent(canvas, 'onBegin');
    
    // Press save button
    fireEvent.press(getByText('Save Signature'));
    
    // Check if directories were created
    expect(FileSystem.makeDirectoryAsync).toHaveBeenCalledWith(
      'file:///mock/path/signatures/',
      { intermediates: true }
    );
    
    // Check if signature was captured
    expect(captureRef).toHaveBeenCalledWith(canvas, {
      format: 'jpg',
      quality: 0.9,
    });
    
    // Check if signature was moved to the correct location
    await waitFor(() => {
      expect(FileSystem.moveAsync).toHaveBeenCalledWith({
        from: 'file:///mock/path/temp-signature.jpg',
        to: expect.stringMatching(/file:\/\/\/mock\/path\/signatures\/signature_\d+\.jpg/)
      });
    });
    
    // Check if onSignatureCapture was called with the correct data
    await waitFor(() => {
      expect(onSignatureCaptureMock).toHaveBeenCalledWith(
        expect.objectContaining({
          uri: expect.stringMatching(/file:\/\/\/mock\/path\/signatures\/signature_\d+\.jpg/),
          filename: expect.stringMatching(/signature_\d+\.jpg/),
          timestamp: expect.any(Date),
          title: 'Test Signature'
        })
      );
    });
  });
  
  it('shows alert when trying to save without a signature', async () => {
    const { getByText } = render(
      <SignatureCapture onSignatureCapture={jest.fn()} onCancel={jest.fn()} />
    );
    
    // Mock Alert.alert
    jest.spyOn(Alert, 'alert');
    
    // Press save button without drawing
    fireEvent.press(getByText('Save Signature'));
    
    // Check if alert was shown
    expect(Alert.alert).toHaveBeenCalledWith(
      'Empty Signature',
      'Please provide a signature before saving.',
      [{ text: 'OK' }]
    );
    
    // Check that no file operations were performed
    expect(FileSystem.makeDirectoryAsync).not.toHaveBeenCalled();
    expect(captureRef).not.toHaveBeenCalled();
    expect(FileSystem.moveAsync).not.toHaveBeenCalled();
  });
  
  it('handles errors during signature saving', async () => {
    // Mock error in captureRef
    captureRef.mockRejectedValue(new Error('Capture failed'));
    
    // Mock Alert.alert
    jest.spyOn(Alert, 'alert');
    
    const { getByTestId, getByText } = render(
      <SignatureCapture onSignatureCapture={jest.fn()} onCancel={jest.fn()} />
    );
    
    // Get the signature canvas
    const canvas = getByTestId('signature-canvas');
    
    // Simulate drawing on the canvas
    fireEvent(canvas, 'onBegin');
    
    // Press save button
    fireEvent.press(getByText('Save Signature'));
    
    // Check if error alert was shown
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Error',
        'Failed to save signature. Please try again.',
        [{ text: 'OK' }]
      );
    });
  });
});
