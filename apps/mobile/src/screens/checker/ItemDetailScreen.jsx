/**
 * ItemDetailScreen for Checker App
 * Displays detailed information about an item and allows verification
 */
import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors, typography, spacing, borderRadius, shadows } from '../../styles/theme';
import Button from '../../components/atoms/Button';
import { database } from '../../db/config';
import { PickupItem, ItemCondition, ItemPhoto } from '../../db/models';
import { itemVerificationService } from '../../features/checker/services/itemVerificationService';
import { itemMeasurementService } from '../../features/checker/services/itemMeasurementService';
import ItemVerificationForm from '../../features/checker/components/ItemVerificationForm';
import ItemMeasurementForm from '../../features/checker/components/ItemMeasurementForm';
import ItemConditionForm from '../../features/checker/components/ItemConditionForm';
import ItemPhotoCapture from '../../features/checker/components/ItemPhotoCapture';
import ItemVerificationSummary from '../../features/checker/components/ItemVerificationSummary';

// Tab options
const TABS = {
  SUMMARY: 'summary',
  MEASURE: 'measure',
  CONDITION: 'condition',
  VERIFY: 'verify',
};

const ItemDetailScreen = ({ navigation, route }) => {
  // Get item ID from route params
  const { itemId } = route.params || {};
  
  // Item data state
  const [item, setItem] = useState(null);
  const [condition, setCondition] = useState(null);
  const [photos, setPhotos] = useState([]);
  
  // UI states
  const [activeTab, setActiveTab] = useState(TABS.SUMMARY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [photoCaptureVisible, setPhotoCaptureVisible] = useState(false);
  
  // Load item data
  const loadItemData = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      
      if (!itemId) {
        setError('No item ID provided');
        return;
      }
      
      // Get item from database
      const itemData = await itemVerificationService.getItemById(itemId);
      setItem(itemData);
      
      // Get condition data
      const conditionData = await itemVerificationService.getItemCondition(itemId);
      setCondition(conditionData);
      
      // Get photos
      const itemPhotos = await itemData.photos.fetch();
      setPhotos(itemPhotos);
      
    } catch (err) {
      console.error('Error loading item data:', err);
      setError('Failed to load item data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [itemId]);
  
  // Load data on mount and when screen is focused
  useEffect(() => {
    loadItemData();
  }, [loadItemData]);
  
  useFocusEffect(
    useCallback(() => {
      loadItemData();
    }, [loadItemData])
  );
  
  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };
  
  // Handle save condition
  const handleSaveCondition = async (updatedCondition) => {
    setCondition(updatedCondition);
    setActiveTab(TABS.SUMMARY);
    Alert.alert('Success', 'Item condition has been saved successfully.');
  };
  
  // Handle save measurements
  const handleSaveMeasurements = async (updatedItem) => {
    setItem(updatedItem);
    setActiveTab(TABS.SUMMARY);
    Alert.alert('Success', 'Item measurements have been saved successfully.');
  };
  
  // Handle save verification
  const handleSaveVerification = async (updatedCondition) => {
    setCondition(updatedCondition);
    setActiveTab(TABS.SUMMARY);
    Alert.alert('Success', 'Item verification has been saved successfully.');
  };
  
  // Handle photo capture
  const handlePhotoCapture = async (capturedPhotos) => {
    try {
      setPhotoCaptureVisible(false);
      
      if (!capturedPhotos || capturedPhotos.length === 0) return;
      
      // Save photos to database
      await database.action(async () => {
        for (const photo of capturedPhotos) {
          await database.get('item_photos').create(itemPhoto => {
            itemPhoto.itemId = itemId;
            itemPhoto.photoUri = photo.uri;
            itemPhoto.thumbnailUri = photo.thumbnailUri;
            itemPhoto.isUploaded = false;
          });
        }
      });
      
      // Reload photos
      const itemData = await itemVerificationService.getItemById(itemId);
      const itemPhotos = await itemData.photos.fetch();
      setPhotos(itemPhotos);
      
      Alert.alert('Success', 'Photos have been saved successfully.');
    } catch (error) {
      console.error('Error saving photos:', error);
      Alert.alert('Error', 'Failed to save photos. Please try again.');
    }
  };
  
  // Render tab button
  const renderTabButton = (tab, label, icon) => {
    const isActive = activeTab === tab;
    
    return (
      <TouchableOpacity
        style={[styles.tabButton, isActive && styles.tabButtonActive]}
        onPress={() => handleTabChange(tab)}
      >
        <Ionicons
          name={icon}
          size={20}
          color={isActive ? colors.primary : colors.text.secondary}
        />
        <Text
          style={[
            styles.tabButtonText,
            isActive && styles.tabButtonTextActive,
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };
  
  // Render active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case TABS.MEASURE:
        return (
          <ItemMeasurementForm
            itemId={itemId}
            initialData={item}
            onSave={handleSaveMeasurements}
            onCancel={() => setActiveTab(TABS.SUMMARY)}
          />
        );
      case TABS.CONDITION:
        return (
          <ItemConditionForm
            itemId={itemId}
            itemData={item}
            conditionData={condition}
            onSave={handleSaveCondition}
            onCancel={() => setActiveTab(TABS.SUMMARY)}
            onTakePhoto={() => setPhotoCaptureVisible(true)}
          />
        );
      case TABS.VERIFY:
        return (
          <ItemVerificationForm
            itemId={itemId}
            initialData={condition}
            onSave={handleSaveVerification}
            onCancel={() => setActiveTab(TABS.SUMMARY)}
          />
        );
      case TABS.SUMMARY:
      default:
        return (
          <ItemVerificationSummary
            item={item}
            condition={condition}
            photos={photos}
          />
        );
    }
  };
  
  // Render loading
  const renderLoading = () => {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading item data...</Text>
      </View>
    );
  };
  
  // Render error
  const renderError = () => {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
        <Text style={styles.errorText}>{error}</Text>
        <Button
          title="Retry"
          onPress={loadItemData}
          style={styles.retryButton}
        />
      </View>
    );
  };
  
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Item Details</Text>
          {item && (
            <Text style={styles.headerSubtitle}>
              {item.description}
            </Text>
          )}
        </View>
        
        <TouchableOpacity
          style={styles.photoButton}
          onPress={() => setPhotoCaptureVisible(true)}
        >
          <Ionicons name="camera-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      
      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {renderTabButton(TABS.SUMMARY, 'Summary', 'document-text-outline')}
        {renderTabButton(TABS.MEASURE, 'Measure', 'resize-outline')}
        {renderTabButton(TABS.CONDITION, 'Condition', 'shield-checkmark-outline')}
        {renderTabButton(TABS.VERIFY, 'Verify', 'checkmark-circle-outline')}
      </View>
      
      {/* Content */}
      {loading ? (
        renderLoading()
      ) : error ? (
        renderError()
      ) : (
        <View style={styles.contentContainer}>
          {renderTabContent()}
        </View>
      )}
      
      {/* Photo Capture Modal */}
      <Modal
        visible={photoCaptureVisible}
        animationType="slide"
        onRequestClose={() => setPhotoCaptureVisible(false)}
      >
        <ItemPhotoCapture
          onPhotoCapture={handlePhotoCapture}
          onCancel={() => setPhotoCaptureVisible(false)}
        />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    paddingTop: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
    marginHorizontal: spacing.sm,
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: typography.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: spacing.xs / 2,
  },
  photoButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    ...shadows.sm,
  },
  tabButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonActive: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabButtonText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    marginTop: spacing.xs / 2,
  },
  tabButtonTextActive: {
    color: colors.primary,
    fontWeight: '500',
  },
  contentContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  errorText: {
    fontSize: typography.fontSize.md,
    color: colors.error,
    textAlign: 'center',
    marginVertical: spacing.md,
  },
  retryButton: {
    marginTop: spacing.sm,
  },
});

export default ItemDetailScreen;
