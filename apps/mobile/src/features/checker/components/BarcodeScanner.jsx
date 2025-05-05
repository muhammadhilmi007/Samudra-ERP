/**
 * BarcodeScanner component
 * Component for scanning barcodes and QR codes
 */
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert
} from 'react-native';
import { Camera } from 'expo-camera';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../../../styles/theme';
import Button from '../../../components/atoms/Button';

const BarcodeScanner = ({ 
  onScan, 
  onCancel,
  scanMultiple = false,
  supportedTypes = [
    BarCodeScanner.Constants.BarCodeType.qr,
    BarCodeScanner.Constants.BarCodeType.code128,
    BarCodeScanner.Constants.BarCodeType.code39,
    BarCodeScanner.Constants.BarCodeType.ean13,
    BarCodeScanner.Constants.BarCodeType.ean8
  ]
}) => {
  // Permission state
  const [hasPermission, setHasPermission] = useState(null);
  
  // Scanned items
  const [scannedItems, setScannedItems] = useState([]);
  
  // Scanning state
  const [scanning, setScanning] = useState(true);
  
  // Flash mode
  const [flashMode, setFlashMode] = useState(Camera.Constants.FlashMode.off);
  
  // Request camera permission on mount
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);
  
  // Toggle flash mode
  const toggleFlashMode = () => {
    setFlashMode(
      flashMode === Camera.Constants.FlashMode.off
        ? Camera.Constants.FlashMode.torch
        : Camera.Constants.FlashMode.off
    );
  };
  
  // Handle barcode scan
  const handleBarCodeScanned = ({ type, data }) => {
    // Check if this code has already been scanned
    if (scannedItems.some(item => item.data === data)) {
      return;
    }
    
    // Vibrate to indicate successful scan
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(100);
    }
    
    // Add to scanned items
    const newScannedItems = [...scannedItems, { type, data, timestamp: new Date() }];
    setScannedItems(newScannedItems);
    
    // If not scanning multiple, return the result immediately
    if (!scanMultiple) {
      if (onScan) {
        onScan([{ type, data }]);
      }
      return;
    }
    
    // Pause scanning briefly to prevent multiple scans of the same code
    setScanning(false);
    setTimeout(() => {
      setScanning(true);
    }, 2000);
  };
  
  // Handle save scanned items
  const handleSave = () => {
    if (scannedItems.length === 0) {
      Alert.alert(
        'No Items Scanned',
        'Please scan at least one barcode or QR code before saving.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    if (onScan) {
      onScan(scannedItems);
    }
  };
  
  // Remove a scanned item
  const removeScannedItem = (index) => {
    setScannedItems(scannedItems.filter((_, i) => i !== index));
  };
  
  // Render scanned items
  const renderScannedItems = () => {
    if (scannedItems.length === 0) return null;
    
    return (
      <View style={styles.scannedItemsContainer}>
        <Text style={styles.scannedItemsTitle}>
          Scanned Items ({scannedItems.length})
        </Text>
        
        {scannedItems.map((item, index) => (
          <View key={index} style={styles.scannedItem}>
            <View style={styles.scannedItemContent}>
              <Text style={styles.scannedItemType}>{item.type}</Text>
              <Text style={styles.scannedItemData}>{item.data}</Text>
              <Text style={styles.scannedItemTimestamp}>
                {item.timestamp.toLocaleTimeString()}
              </Text>
            </View>
            
            <TouchableOpacity
              style={styles.removeItemButton}
              onPress={() => removeScannedItem(index)}
            >
              <Ionicons name="close-circle" size={24} color={colors.error} />
            </TouchableOpacity>
          </View>
        ))}
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
      {/* Scanner */}
      <Camera
        style={styles.scanner}
        type={Camera.Constants.Type.back}
        flashMode={flashMode}
        barCodeScannerSettings={{
          barCodeTypes: supportedTypes,
        }}
        onBarCodeScanned={scanning ? handleBarCodeScanned : undefined}
      >
        <View style={styles.scannerOverlay}>
          <View style={styles.scannerTargetBorder} />
        </View>
        
        <View style={styles.scannerControls}>
          {/* Flash Toggle */}
          <TouchableOpacity
            style={styles.controlButton}
            onPress={toggleFlashMode}
          >
            <Ionicons
              name={flashMode === Camera.Constants.FlashMode.torch ? 'flash' : 'flash-off'}
              size={24}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </View>
      </Camera>
      
      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsText}>
          Position the barcode or QR code within the frame to scan
        </Text>
      </View>
      
      {/* Scanned Items */}
      {scanMultiple && renderScannedItems()}
      
      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <Button
          title="Cancel"
          variant="outline"
          onPress={onCancel}
          style={styles.cancelButton}
        />
        {scanMultiple ? (
          <Button
            title="Save Scanned Items"
            onPress={handleSave}
            style={styles.saveButton}
            disabled={scannedItems.length === 0}
          />
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scanner: {
    aspectRatio: 4/3,
    width: '100%',
  },
  scannerOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerTargetBorder: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  scannerControls: {
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
  instructionsContainer: {
    padding: spacing.md,
    alignItems: 'center',
  },
  instructionsText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  scannedItemsContainer: {
    padding: spacing.md,
  },
  scannedItemsTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: '500',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  scannedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: 8,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  scannedItemContent: {
    flex: 1,
  },
  scannedItemType: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
  },
  scannedItemData: {
    fontSize: typography.fontSize.sm,
    fontWeight: '500',
    color: colors.text.primary,
  },
  scannedItemTimestamp: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    marginTop: 2,
  },
  removeItemButton: {
    marginLeft: spacing.sm,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  cancelButton: {
    flex: scanMultiple ? 1 : null,
    marginRight: scanMultiple ? spacing.sm : 0,
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

export default BarcodeScanner;
