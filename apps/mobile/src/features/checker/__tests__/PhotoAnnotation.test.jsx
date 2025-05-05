/**
 * PhotoAnnotation component tests
 */
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import { captureRef } from 'react-native-view-shot';
import PhotoAnnotation from '../components/PhotoAnnotation';

// Mock expo-image-manipulator
jest.mock('expo-image-manipulator', () => ({
  manipulateAsync: jest.fn(),
  SaveFormat: {
    JPEG: 'jpeg',
    PNG: 'png'
  }
}));

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

describe('PhotoAnnotation Component', () => {
  const mockPhoto = {
    uri: 'file:///mock/path/photo.jpg',
    width: 1200,
    height: 900
  };
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock image manipulator
    ImageManipulator.manipulateAsync.mockResolvedValue({
      uri: 'file:///mock/path/thumbnail.jpg',
      width: 300,
      height: 225
    });
    
    // Mock captureRef
    captureRef.mockResolvedValue('file:///mock/path/annotated.jpg');
  });
  
  it('renders error state when no photo is provided', () => {
    const { getByText } = render(
      <PhotoAnnotation 
        photo={null} 
        onSave={jest.fn()} 
        onCancel={jest.fn()} 
      />
    );
    
    expect(getByText('No photo provided for annotation.')).toBeTruthy();
  });
  
  it('renders the photo for annotation when valid photo is provided', () => {
    const { getByTestId } = render(
      <PhotoAnnotation 
        photo={mockPhoto} 
        onSave={jest.fn()} 
        onCancel={jest.fn()} 
      />
    );
    
    // Check if the canvas is rendered with the photo
    const canvas = getByTestId('annotation-canvas');
    const backgroundImage = getByTestId('background-image');
    
    expect(canvas).toBeTruthy();
    expect(backgroundImage.props.source).toEqual({ uri: mockPhoto.uri });
  });
  
  it('renders drawing tools and controls', () => {
    const { getByText, getAllByTestId } = render(
      <PhotoAnnotation 
        photo={mockPhoto} 
        onSave={jest.fn()} 
        onCancel={jest.fn()} 
      />
    );
    
    // Check if tool options are rendered
    const toolOptions = getAllByTestId('tool-option');
    expect(toolOptions.length).toBe(3); // pen, text, arrow
    
    // Check if color options are rendered
    const colorOptions = getAllByTestId('color-option');
    expect(colorOptions.length).toBe(6); // primary, secondary, accent, error, black, white
    
    // Check if action buttons are rendered
    expect(getByText('Cancel')).toBeTruthy();
    expect(getByText('Save Annotation')).toBeTruthy();
  });
  
  it('changes the active tool when a tool is selected', () => {
    const { getAllByTestId } = render(
      <PhotoAnnotation 
        photo={mockPhoto} 
        onSave={jest.fn()} 
        onCancel={jest.fn()} 
      />
    );
    
    // Get tool options
    const toolOptions = getAllByTestId('tool-option');
    const penTool = toolOptions[0];
    const textTool = toolOptions[1];
    const arrowTool = toolOptions[2];
    
    // Initially pen tool should be selected
    expect(penTool.props.style).toContainEqual(
      expect.objectContaining({ borderWidth: 2 })
    );
    
    // Select text tool
    fireEvent.press(textTool);
    
    // Text tool should be selected
    expect(textTool.props.style).toContainEqual(
      expect.objectContaining({ borderWidth: 2 })
    );
    
    // Select arrow tool
    fireEvent.press(arrowTool);
    
    // Arrow tool should be selected
    expect(arrowTool.props.style).toContainEqual(
      expect.objectContaining({ borderWidth: 2 })
    );
  });
  
  it('changes the active color when a color is selected', () => {
    const { getAllByTestId } = render(
      <PhotoAnnotation 
        photo={mockPhoto} 
        onSave={jest.fn()} 
        onCancel={jest.fn()} 
      />
    );
    
    // Get color options
    const colorOptions = getAllByTestId('color-option');
    
    // Initially primary color should be selected
    expect(colorOptions[0].props.style).toContainEqual(
      expect.objectContaining({ borderWidth: 2 })
    );
    
    // Select another color
    fireEvent.press(colorOptions[2]); // accent color
    
    // The selected color should be highlighted
    expect(colorOptions[2].props.style).toContainEqual(
      expect.objectContaining({ borderWidth: 2 })
    );
  });
  
  it('shows text input modal when text tool is selected', () => {
    const { getAllByTestId, getByTestId, getByPlaceholderText } = render(
      <PhotoAnnotation 
        photo={mockPhoto} 
        onSave={jest.fn()} 
        onCancel={jest.fn()} 
      />
    );
    
    // Get text tool
    const toolOptions = getAllByTestId('tool-option');
    const textTool = toolOptions[1];
    
    // Select text tool
    fireEvent.press(textTool);
    
    // Text input modal should be visible
    const textInput = getByPlaceholderText('Enter text annotation');
    expect(textInput).toBeTruthy();
    
    // Enter text
    fireEvent.changeText(textInput, 'Test annotation');
    
    // Add text button
    const addTextButton = getByTestId('add-text-button');
    fireEvent.press(addTextButton);
    
    // Modal should be closed
    expect(() => getByPlaceholderText('Enter text annotation')).toThrow();
  });
  
  it('calls onCancel when cancel button is pressed', () => {
    const onCancelMock = jest.fn();
    
    const { getByText } = render(
      <PhotoAnnotation 
        photo={mockPhoto} 
        onSave={jest.fn()} 
        onCancel={onCancelMock} 
      />
    );
    
    // Press cancel button
    fireEvent.press(getByText('Cancel'));
    
    // Check if onCancel was called
    expect(onCancelMock).toHaveBeenCalled();
  });
  
  it('saves the annotated image and calls onSave when save button is pressed', async () => {
    const onSaveMock = jest.fn();
    
    const { getByText, getByTestId } = render(
      <PhotoAnnotation 
        photo={mockPhoto} 
        onSave={onSaveMock} 
        onCancel={jest.fn()} 
      />
    );
    
    // Get the canvas
    const canvas = getByTestId('annotation-canvas');
    
    // Press save button
    fireEvent.press(getByText('Save Annotation'));
    
    // Check if image was captured
    expect(captureRef).toHaveBeenCalledWith(canvas, {
      format: 'jpg',
      quality: 0.9
    });
    
    // Check if thumbnail was created
    expect(ImageManipulator.manipulateAsync).toHaveBeenCalledWith(
      'file:///mock/path/annotated.jpg',
      [{ resize: { width: 300 } }],
      { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG }
    );
    
    // Check if onSave was called with the correct data
    await waitFor(() => {
      expect(onSaveMock).toHaveBeenCalledWith(
        expect.objectContaining({
          uri: 'file:///mock/path/annotated.jpg',
          thumbnailUri: 'file:///mock/path/thumbnail.jpg',
          annotated: true,
          timestamp: expect.any(Date)
        })
      );
    });
  });
  
  it('handles errors during annotation saving', async () => {
    // Mock error in captureRef
    captureRef.mockRejectedValue(new Error('Capture failed'));
    
    // Mock Alert.alert
    jest.spyOn(Alert, 'alert');
    
    const { getByText } = render(
      <PhotoAnnotation 
        photo={mockPhoto} 
        onSave={jest.fn()} 
        onCancel={jest.fn()} 
      />
    );
    
    // Press save button
    fireEvent.press(getByText('Save Annotation'));
    
    // Check if error alert was shown
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Error',
        'Failed to save annotation. Please try again.',
        [{ text: 'OK' }]
      );
    });
  });
  
  it('renders stroke width selector when pen tool is selected', () => {
    const { getAllByTestId } = render(
      <PhotoAnnotation 
        photo={mockPhoto} 
        onSave={jest.fn()} 
        onCancel={jest.fn()} 
      />
    );
    
    // Get tool options
    const toolOptions = getAllByTestId('tool-option');
    const penTool = toolOptions[0];
    
    // Select pen tool
    fireEvent.press(penTool);
    
    // Stroke width options should be visible
    const strokeWidthOptions = getAllByTestId('stroke-width-option');
    expect(strokeWidthOptions.length).toBe(4); // 1, 3, 5, 8
    
    // Initially 3px stroke width should be selected
    expect(strokeWidthOptions[1].props.style).toContainEqual(
      expect.objectContaining({ borderWidth: 2 })
    );
    
    // Select another stroke width
    fireEvent.press(strokeWidthOptions[3]); // 8px
    
    // The selected stroke width should be highlighted
    expect(strokeWidthOptions[3].props.style).toContainEqual(
      expect.objectContaining({ borderWidth: 2 })
    );
  });
});
