/**
 * PhotoAnnotation component
 * Component for annotating photos with drawings and text
 */
import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image,
  TextInput,
  ScrollView,
  Modal,
  Alert,
  ActivityIndicator
} from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../../styles/theme';
import Button from '../../../components/atoms/Button';
import { captureRef } from 'react-native-view-shot';

// Drawing Canvas component
const DrawingCanvas = ({ imageUri, onRef, onSave, onCancel }) => {
  // Canvas reference
  const canvasRef = useRef(null);
  
  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState('pen'); // pen, text, arrow
  const [currentColor, setCurrentColor] = useState(colors.primary);
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [textAnnotation, setTextAnnotation] = useState('');
  const [textPosition, setTextPosition] = useState({ x: 0, y: 0 });
  const [showTextInput, setShowTextInput] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Available colors for annotation
  const availableColors = [
    colors.primary,
    colors.secondary,
    colors.accent,
    colors.error,
    '#000000',
    '#FFFFFF'
  ];
  
  // Available stroke widths
  const availableStrokeWidths = [1, 3, 5, 8];
  
  // Handle save annotation
  const handleSave = async () => {
    try {
      setLoading(true);
      
      // Capture the annotated image
      const annotatedImageUri = await captureRef(canvasRef, {
        format: 'jpg',
        quality: 0.9
      });
      
      // Create thumbnail
      const thumbnail = await ImageManipulator.manipulateAsync(
        annotatedImageUri,
        [{ resize: { width: 300 } }],
        { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG }
      );
      
      // Call the save callback with the annotated image
      if (onSave) {
        onSave({
          uri: annotatedImageUri,
          thumbnailUri: thumbnail.uri,
          annotated: true,
          timestamp: new Date()
        });
      }
    } catch (error) {
      console.error('Error saving annotation:', error);
      Alert.alert(
        'Error',
        'Failed to save annotation. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };
  
  // Render color selector
  const renderColorSelector = () => {
    return (
      <View style={styles.colorSelector}>
        {availableColors.map((color, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.colorOption,
              { backgroundColor: color },
              currentColor === color && styles.selectedColorOption,
              color === '#FFFFFF' && { borderWidth: 1, borderColor: '#CCCCCC' }
            ]}
            onPress={() => setCurrentColor(color)}
          />
        ))}
      </View>
    );
  };
  
  // Render stroke width selector
  const renderStrokeWidthSelector = () => {
    return (
      <View style={styles.strokeWidthSelector}>
        {availableStrokeWidths.map((width, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.strokeWidthOption,
              strokeWidth === width && styles.selectedStrokeWidthOption
            ]}
            onPress={() => setStrokeWidth(width)}
          >
            <View 
              style={[
                styles.strokeWidthPreview, 
                { height: width, backgroundColor: currentColor }
              ]} 
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };
  
  // Render tool selector
  const renderToolSelector = () => {
    return (
      <View style={styles.toolSelector}>
        <TouchableOpacity
          style={[
            styles.toolOption,
            currentTool === 'pen' && styles.selectedToolOption
          ]}
          onPress={() => setCurrentTool('pen')}
        >
          <MaterialIcons name="edit" size={24} color={currentTool === 'pen' ? colors.primary : colors.text.secondary} />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.toolOption,
            currentTool === 'text' && styles.selectedToolOption
          ]}
          onPress={() => {
            setCurrentTool('text');
            setShowTextInput(true);
          }}
        >
          <MaterialIcons name="text-fields" size={24} color={currentTool === 'text' ? colors.primary : colors.text.secondary} />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.toolOption,
            currentTool === 'arrow' && styles.selectedToolOption
          ]}
          onPress={() => setCurrentTool('arrow')}
        >
          <MaterialIcons name="arrow-forward" size={24} color={currentTool === 'arrow' ? colors.primary : colors.text.secondary} />
        </TouchableOpacity>
      </View>
    );
  };
  
  return (
    <View style={styles.canvasContainer}>
      {/* Canvas */}
      <View ref={canvasRef} style={styles.canvas}>
        <Image 
          source={{ uri: imageUri }} 
          style={styles.backgroundImage}
          resizeMode="contain"
        />
        
        {/* Placeholder for actual drawing implementation */}
        <View style={styles.drawingPlaceholder}>
          <Text style={styles.placeholderText}>
            Drawing canvas will render here when dependencies are installed
          </Text>
          <Text style={styles.placeholderSubtext}>
            Please install react-native-view-shot and a drawing library
          </Text>
        </View>
      </View>
      
      {/* Text Input Modal */}
      <Modal
        visible={showTextInput}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Text Annotation</Text>
            
            <TextInput
              style={styles.textInput}
              placeholder="Enter text annotation"
              value={textAnnotation}
              onChangeText={setTextAnnotation}
              multiline
              maxLength={100}
            />
            
            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                variant="outline"
                onPress={() => setShowTextInput(false)}
                style={styles.modalButton}
              />
              <Button
                title="Add Text"
                onPress={() => {
                  // In a real implementation, we would add the text to the canvas
                  // For now, just close the modal
                  setShowTextInput(false);
                }}
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Annotation Controls */}
      <View style={styles.annotationControls}>
        {renderToolSelector()}
        {renderColorSelector()}
        {currentTool === 'pen' && renderStrokeWidthSelector()}
      </View>
      
      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <Button
          title="Cancel"
          variant="outline"
          onPress={onCancel}
          style={styles.cancelButton}
          disabled={loading}
        />
        <Button
          title="Save Annotation"
          onPress={handleSave}
          style={styles.saveButton}
          disabled={loading}
        >
          {loading && <ActivityIndicator size="small" color="#FFFFFF" />}
        </Button>
      </View>
    </View>
  );
};

const PhotoAnnotation = ({ 
  photo, 
  onSave, 
  onCancel 
}) => {
  if (!photo || !photo.uri) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
        <Text style={styles.errorText}>
          No photo provided for annotation.
        </Text>
        <Button
          title="Cancel"
          variant="outline"
          onPress={onCancel}
          style={styles.errorButton}
        />
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <DrawingCanvas
        imageUri={photo.uri}
        onSave={onSave}
        onCancel={onCancel}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  canvasContainer: {
    flex: 1,
  },
  canvas: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    position: 'relative',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  drawingPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  placeholderText: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  placeholderSubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  annotationControls: {
    padding: spacing.md,
    backgroundColor: colors.background.secondary,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  toolSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  toolOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: spacing.sm,
    backgroundColor: colors.background.primary,
  },
  selectedToolOption: {
    backgroundColor: colors.background.highlight,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  colorSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  colorOption: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginHorizontal: 5,
  },
  selectedColorOption: {
    borderWidth: 2,
    borderColor: colors.text.primary,
  },
  strokeWidthSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  strokeWidthOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
    backgroundColor: colors.background.primary,
  },
  selectedStrokeWidthOption: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  strokeWidthPreview: {
    width: '70%',
    borderRadius: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: colors.background.primary,
  },
  cancelButton: {
    flex: 1,
    marginRight: spacing.sm,
  },
  saveButton: {
    flex: 1,
    marginLeft: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.background.primary,
  },
  errorText: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    textAlign: 'center',
    marginVertical: spacing.md,
  },
  errorButton: {
    marginTop: spacing.md,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  modalTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: spacing.md,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
});

export default PhotoAnnotation;
