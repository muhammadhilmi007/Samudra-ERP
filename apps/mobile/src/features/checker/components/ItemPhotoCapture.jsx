/**
 * ItemPhotoCapture component
 * Component for capturing photos of items using device camera
 */
import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Camera } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../../styles/theme';
import Button from '../../../components/atoms/Button';

const ItemPhotoCapture = ({ 
  onPhotoCapture, 
  onCancel,
  maxPhotos = 5
}) => {
  // Camera permission state
  const [hasPermission, setHasPermission] = useState(null);
  
  // Camera reference
  const cameraRef = useRef(null);
  
  // Camera type (front or back)
  const [cameraType, setCameraType] = useState(Camera.Constants.Type.back);
  
  // Flash mode
  const [flashMode, setFlashMode] = useState(Camera.Constants.FlashMode.off);
  
  // Captured photos
  const [capturedPhotos, setCapturedPhotos] = useState([]);
  
  // Loading state
  const [loading, setLoading] = useState(false);
  
  // Request camera permission on mount
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);
  
  // Toggle camera type (front/back)
  const toggleCameraType = () => {
    setCameraType(
      cameraType === Camera.Constants.Type.back
        ? Camera.Constants.Type.front
        : Camera.Constants.Type.back
    );
  };
  
  // Toggle flash mode
  const toggleFlashMode = () => {
    setFlashMode(
      flashMode === Camera.Constants.FlashMode.off
        ? Camera.Constants.FlashMode.on
        : Camera.Constants.FlashMode.off
    );
  };
  
  // Take a photo
  const takePhoto = async () => {
    if (!cameraRef.current) return;
    
    try {
      setLoading(true);
      
      // Check if max photos limit reached
      if (capturedPhotos.length >= maxPhotos) {
        Alert.alert(
          'Maximum Photos Reached',
          `You can only capture up to ${maxPhotos} photos.`,
          [{ text: 'OK' }]
        );
        setLoading(false);
        return;
      }
      
      // Capture photo
      const photo = await cameraRef.current.takePictureAsync();
      
      // Resize and compress the image
      const processedImage = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{ resize: { width: 1200 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );
      
      // Create thumbnail
      const thumbnail = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{ resize: { width: 300 } }],
        { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG }
      );
      
      // Add to captured photos
      setCapturedPhotos([
        ...capturedPhotos, 
        { 
          uri: processedImage.uri,
          thumbnailUri: thumbnail.uri,
          width: processedImage.width,
          height: processedImage.height
        }
      ]);
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert(
        'Error',
        'Failed to capture photo. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };
  
  // Remove a photo
  const removePhoto = (index) => {
    setCapturedPhotos(capturedPhotos.filter((_, i) => i !== index));
  };
  
  // Handle save photos
  const handleSave = () => {
    if (capturedPhotos.length === 0) {
      Alert.alert(
        'No Photos',
        'Please capture at least one photo before saving.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    if (onPhotoCapture) {
      onPhotoCapture(capturedPhotos);
    }
  };
  
  // Render captured photos
  const renderCapturedPhotos = () => {
    if (capturedPhotos.length === 0) return null;
    
    return (
      <View style={styles.capturedPhotosContainer}>
        <Text style={styles.capturedPhotosTitle}>
          Captured Photos ({capturedPhotos.length}/{maxPhotos})
        </Text>
        
        <View style={styles.photoGrid}>
          {capturedPhotos.map((photo, index) => (
            <View key={index} style={styles.photoItem}>
              <Image 
                source={{ uri: photo.thumbnailUri || photo.uri }} 
                style={styles.photoThumbnail}
                resizeMode="cover"
              />
              
              <TouchableOpacity
                style={styles.removePhotoButton}
                onPress={() => removePhoto(index)}
              >
                <Ionicons name="close-circle" size={24} color={colors.error} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>
    );
  };
  
  // Handle camera permission not granted
  if (hasPermission === null) {
    return (
      <View style={styles.permissionContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.permissionText}>Requesting camera permission...</Text>
      </View>
    );
  }
  
  if (hasPermission === false) {
    return (
      <View style={styles.permissionContainer}>
        <Ionicons name="camera-off-outline" size={48} color={colors.error} />
        <Text style={styles.permissionText}>
          Camera permission not granted. Please enable camera access in your device settings.
        </Text>
        <Button
          title="Cancel"
          variant="outline"
          onPress={onCancel}
          style={styles.permissionButton}
        />
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      {/* Camera Preview */}
      <Camera
        ref={cameraRef}
        style={styles.camera}
        type={cameraType}
        flashMode={flashMode}
        ratio="4:3"
      >
        <View style={styles.cameraControls}>
          {/* Flash Toggle */}
          <TouchableOpacity
            style={styles.controlButton}
            onPress={toggleFlashMode}
          >
            <Ionicons
              name={flashMode === Camera.Constants.FlashMode.on ? 'flash' : 'flash-off'}
              size={24}
              color="#FFFFFF"
            />
          </TouchableOpacity>
          
          {/* Camera Flip */}
          <TouchableOpacity
            style={styles.controlButton}
            onPress={toggleCameraType}
          >
            <Ionicons name="camera-reverse-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </Camera>
      
      {/* Capture Button */}
      <View style={styles.captureContainer}>
        <TouchableOpacity
          style={styles.captureButton}
          onPress={takePhoto}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="large" color="#FFFFFF" />
          ) : (
            <View style={styles.captureButtonInner} />
          )}
        </TouchableOpacity>
      </View>
      
      {/* Captured Photos */}
      {renderCapturedPhotos()}
      
      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <Button
          title="Cancel"
          variant="outline"
          onPress={onCancel}
          style={styles.cancelButton}
        />
        <Button
          title="Save Photos"
          onPress={handleSave}
          style={styles.saveButton}
          disabled={capturedPhotos.length === 0}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  camera: {
    aspectRatio: 4/3,
    width: '100%',
  },
  cameraControls: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  captureContainer: {
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  capturedPhotosContainer: {
    padding: spacing.md,
  },
  capturedPhotosTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: '500',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  photoItem: {
    width: '31%',
    aspectRatio: 1,
    margin: '1%',
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
    position: 'relative',
  },
  photoThumbnail: {
    width: '100%',
    height: '100%',
  },
  removePhotoButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  cancelButton: {
    flex: 1,
    marginRight: spacing.sm,
  },
  saveButton: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  permissionText: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    textAlign: 'center',
    marginVertical: spacing.md,
  },
  permissionButton: {
    marginTop: spacing.md,
  },
});

export default ItemPhotoCapture;
