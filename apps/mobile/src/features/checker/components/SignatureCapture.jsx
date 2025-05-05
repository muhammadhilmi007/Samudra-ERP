/**
 * SignatureCapture component
 * Component for capturing digital signatures
 */
import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../../styles/theme';
import Button from '../../../components/atoms/Button';
import { captureRef } from 'react-native-view-shot';

// Canvas component for signature drawing
const SignatureCanvas = ({ onRef, onBegin, onEnd, onEmpty }) => {
  const canvasRef = useRef(null);
  
  // Set up canvas properties
  const canvasProps = {
    style: styles.canvas,
    onRef: (ref) => {
      canvasRef.current = ref;
      if (onRef) onRef(ref);
    },
    dataDetect: true,
    strokeWidth: 3,
    strokeColor: colors.text.primary,
    backgroundColor: 'transparent',
    onBegin: onBegin,
    onEnd: onEnd,
    onEmpty: onEmpty
  };
  
  return (
    <View style={styles.canvasContainer}>
      {/* Placeholder for react-native-signature-canvas */}
      <View 
        ref={canvasRef}
        style={styles.canvas}
      >
        <Text style={styles.placeholderText}>
          Signature canvas will render here when dependencies are installed
        </Text>
        <Text style={styles.placeholderSubtext}>
          Please install react-native-signature-canvas
        </Text>
      </View>
    </View>
  );
};

const SignatureCapture = ({ 
  onSignatureCapture, 
  onCancel,
  signatureTitle = "Signature",
  signatureDescription = "Please sign in the area below"
}) => {
  // Signature canvas reference
  const signatureRef = useRef(null);
  
  // Signature state
  const [signature, setSignature] = useState(null);
  
  // Loading state
  const [loading, setLoading] = useState(false);
  
  // Is canvas empty
  const [isCanvasEmpty, setIsCanvasEmpty] = useState(true);
  
  // Handle signature begin
  const handleSignatureBegin = () => {
    setIsCanvasEmpty(false);
  };
  
  // Handle signature end
  const handleSignatureEnd = () => {
    // Placeholder for signature end handling
  };
  
  // Handle empty canvas
  const handleEmpty = () => {
    setIsCanvasEmpty(true);
    setSignature(null);
  };
  
  // Clear signature
  const clearSignature = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
      setIsCanvasEmpty(true);
      setSignature(null);
    }
  };
  
  // Save signature
  const saveSignature = async () => {
    if (isCanvasEmpty) {
      Alert.alert(
        'Empty Signature',
        'Please provide a signature before saving.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    try {
      setLoading(true);
      
      // Capture the signature view as an image
      if (signatureRef.current) {
        // In a real implementation, we would use signatureRef.current.readSignature()
        // For now, we'll simulate capturing the signature view
        const signatureUri = await captureRef(signatureRef.current, {
          format: 'jpg',
          quality: 0.9,
        });
        
        // Create a unique filename for the signature
        const filename = `signature_${Date.now()}.jpg`;
        const destinationUri = `${FileSystem.documentDirectory}signatures/${filename}`;
        
        // Ensure the signatures directory exists
        await FileSystem.makeDirectoryAsync(
          `${FileSystem.documentDirectory}signatures/`, 
          { intermediates: true }
        );
        
        // Save the signature to the file system
        await FileSystem.moveAsync({
          from: signatureUri,
          to: destinationUri
        });
        
        // Set the signature data
        const signatureData = {
          uri: destinationUri,
          filename,
          timestamp: new Date(),
          title: signatureTitle
        };
        
        setSignature(signatureData);
        
        // Call the callback with the signature data
        if (onSignatureCapture) {
          onSignatureCapture(signatureData);
        }
      }
    } catch (error) {
      console.error('Error saving signature:', error);
      Alert.alert(
        'Error',
        'Failed to save signature. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{signatureTitle}</Text>
        <Text style={styles.description}>{signatureDescription}</Text>
      </View>
      
      {/* Signature Canvas */}
      <View style={styles.signatureContainer}>
        <SignatureCanvas
          onRef={ref => signatureRef.current = ref}
          onBegin={handleSignatureBegin}
          onEnd={handleSignatureEnd}
          onEmpty={handleEmpty}
        />
      </View>
      
      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <Button
          title="Clear"
          variant="outline"
          onPress={clearSignature}
          style={styles.clearButton}
          disabled={isCanvasEmpty || loading}
        />
        <Button
          title="Cancel"
          variant="outline"
          onPress={onCancel}
          style={styles.cancelButton}
          disabled={loading}
        />
        <Button
          title="Save Signature"
          onPress={saveSignature}
          style={styles.saveButton}
          disabled={isCanvasEmpty || loading}
        >
          {loading && <ActivityIndicator size="small" color="#FFFFFF" />}
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  description: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  signatureContainer: {
    flex: 1,
    margin: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.secondary,
    overflow: 'hidden',
  },
  canvasContainer: {
    flex: 1,
    position: 'relative',
  },
  canvas: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
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
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  clearButton: {
    flex: 1,
    marginRight: spacing.sm,
  },
  cancelButton: {
    flex: 1,
    marginHorizontal: spacing.sm,
  },
  saveButton: {
    flex: 1,
    marginLeft: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SignatureCapture;
