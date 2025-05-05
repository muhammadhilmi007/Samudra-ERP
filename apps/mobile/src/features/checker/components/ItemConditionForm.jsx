/**
 * ItemConditionForm component
 * Form for assessing item condition with visual inspection
 */
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  TouchableOpacity,
  Image,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../../styles/theme';
import Button from '../../../components/atoms/Button';
import ItemStatusBadge from './ItemStatusBadge';
import { itemVerificationService, VERIFICATION_STATUS } from '../services/itemVerificationService';

const ItemConditionForm = ({ 
  itemId,
  itemData,
  conditionData = null,
  onSave,
  onCancel,
  onTakePhoto
}) => {
  // Verification status state
  const [status, setStatus] = useState(VERIFICATION_STATUS.PENDING);
  
  // Loading state
  const [loading, setLoading] = useState(false);
  
  // Initialize with data if available
  useEffect(() => {
    if (conditionData) {
      setStatus(conditionData.verificationStatus);
    }
  }, [conditionData]);
  
  // Handle verification status change
  const handleStatusChange = async (newStatus) => {
    setStatus(newStatus);
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    setLoading(true);
    
    try {
      const updatedCondition = await itemVerificationService.updateVerificationStatus(
        itemId,
        status
      );
      
      if (onSave) {
        onSave(updatedCondition);
      }
    } catch (error) {
      console.error('Error updating verification status:', error);
      Alert.alert(
        'Error',
        'Failed to update verification status. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };
  
  // Render item photos
  const renderItemPhotos = () => {
    if (!itemData || !itemData.photos || itemData.photos.length === 0) {
      return (
        <View style={styles.noPhotosContainer}>
          <Ionicons name="images-outline" size={48} color={colors.border.dark} />
          <Text style={styles.noPhotosText}>No photos available</Text>
          <Button
            title="Take Photo"
            variant="outline"
            size="small"
            onPress={onTakePhoto}
            leftIcon={<Ionicons name="camera-outline" size={16} color={colors.primary} />}
          />
        </View>
      );
    }
    
    return (
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.photosContainer}
      >
        {itemData.photos.map((photo, index) => (
          <View key={index} style={styles.photoItem}>
            <Image 
              source={{ uri: photo.photoUri }} 
              style={styles.photo}
              resizeMode="cover"
            />
          </View>
        ))}
        
        <TouchableOpacity 
          style={styles.addPhotoButton}
          onPress={onTakePhoto}
        >
          <Ionicons name="add-circle" size={32} color={colors.primary} />
          <Text style={styles.addPhotoText}>Add Photo</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  };
  
  // Render item details
  const renderItemDetails = () => {
    if (!itemData) return null;
    
    return (
      <View style={styles.itemDetailsContainer}>
        <Text style={styles.itemDescription}>{itemData.description}</Text>
        
        <View style={styles.itemDetailRow}>
          <View style={styles.itemDetailItem}>
            <Text style={styles.itemDetailLabel}>Weight</Text>
            <Text style={styles.itemDetailValue}>
              {itemData.weight ? `${itemData.weight} kg` : 'Not measured'}
            </Text>
          </View>
          
          <View style={styles.itemDetailItem}>
            <Text style={styles.itemDetailLabel}>Dimensions</Text>
            <Text style={styles.itemDetailValue}>
              {itemData.length && itemData.width && itemData.height 
                ? `${itemData.length} × ${itemData.width} × ${itemData.height} cm` 
                : 'Not measured'}
            </Text>
          </View>
        </View>
        
        {conditionData && (
          <View style={styles.conditionSummary}>
            <View style={styles.conditionRow}>
              <Text style={styles.conditionLabel}>Condition Rating:</Text>
              <View style={styles.ratingContainer}>
                {[1, 2, 3, 4, 5].map(star => (
                  <Ionicons
                    key={star}
                    name={star <= conditionData.conditionRating ? 'star' : 'star-outline'}
                    size={16}
                    color={star <= conditionData.conditionRating ? colors.accent : colors.neutral}
                    style={styles.ratingStar}
                  />
                ))}
              </View>
            </View>
            
            <View style={styles.conditionRow}>
              <Text style={styles.conditionLabel}>Packaging:</Text>
              <Text style={styles.conditionValue}>
                {conditionData.packagingQuality.charAt(0).toUpperCase() + 
                 conditionData.packagingQuality.slice(1)}
              </Text>
            </View>
            
            {conditionData.hasDamage && (
              <View style={styles.conditionRow}>
                <Text style={styles.conditionLabel}>Damage:</Text>
                <Text style={[styles.conditionValue, styles.damageText]}>
                  {conditionData.damageDescription || 'Yes'}
                </Text>
              </View>
            )}
            
            {conditionData.specialHandling && (
              <View style={styles.conditionRow}>
                <Text style={styles.conditionLabel}>Special Handling:</Text>
                <Text style={styles.conditionValue}>{conditionData.specialHandling}</Text>
              </View>
            )}
          </View>
        )}
      </View>
    );
  };
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.formContainer}>
        {/* Item Photos Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Item Photos</Text>
          {renderItemPhotos()}
        </View>
        
        {/* Item Details Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Item Details</Text>
          {renderItemDetails()}
        </View>
        
        {/* Verification Status Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Verification Status</Text>
          
          <View style={styles.statusContainer}>
            <Text style={styles.statusLabel}>Current Status:</Text>
            <ItemStatusBadge status={status} />
          </View>
          
          <View style={styles.statusButtons}>
            <TouchableOpacity
              style={[
                styles.statusButton,
                status === VERIFICATION_STATUS.VERIFIED && styles.statusButtonActive,
                styles.verifiedButton
              ]}
              onPress={() => handleStatusChange(VERIFICATION_STATUS.VERIFIED)}
            >
              <Ionicons
                name={status === VERIFICATION_STATUS.VERIFIED ? 'checkmark-circle' : 'checkmark-circle-outline'}
                size={24}
                color={status === VERIFICATION_STATUS.VERIFIED ? colors.success : colors.border.dark}
              />
              <Text 
                style={[
                  styles.statusButtonText,
                  status === VERIFICATION_STATUS.VERIFIED && styles.statusButtonTextActive,
                  styles.verifiedButtonText
                ]}
              >
                Verify
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.statusButton,
                status === VERIFICATION_STATUS.REJECTED && styles.statusButtonActive,
                styles.rejectedButton
              ]}
              onPress={() => handleStatusChange(VERIFICATION_STATUS.REJECTED)}
            >
              <Ionicons
                name={status === VERIFICATION_STATUS.REJECTED ? 'close-circle' : 'close-circle-outline'}
                size={24}
                color={status === VERIFICATION_STATUS.REJECTED ? colors.error : colors.border.dark}
              />
              <Text 
                style={[
                  styles.statusButtonText,
                  status === VERIFICATION_STATUS.REJECTED && styles.statusButtonTextActive,
                  styles.rejectedButtonText
                ]}
              >
                Reject
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            title="Cancel"
            variant="outline"
            onPress={onCancel}
            style={styles.cancelButton}
          />
          <Button
            title="Save"
            onPress={handleSubmit}
            loading={loading}
            style={styles.saveButton}
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  formContainer: {
    padding: spacing.md,
  },
  sectionContainer: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  photosContainer: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  photoItem: {
    width: 120,
    height: 120,
    borderRadius: borderRadius.md,
    marginRight: spacing.sm,
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  addPhotoButton: {
    width: 120,
    height: 120,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
  },
  addPhotoText: {
    fontSize: typography.fontSize.xs,
    color: colors.primary,
    marginTop: spacing.xs,
  },
  noPhotosContainer: {
    height: 120,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    padding: spacing.md,
  },
  noPhotosText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    marginVertical: spacing.xs,
  },
  itemDetailsContainer: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  itemDescription: {
    fontSize: typography.fontSize.md,
    fontWeight: '500',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  itemDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  itemDetailItem: {
    flex: 1,
  },
  itemDetailLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginBottom: spacing.xs / 2,
  },
  itemDetailValue: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  conditionSummary: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  conditionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  conditionLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    width: 100,
  },
  conditionValue: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
  },
  ratingStar: {
    marginRight: spacing.xs / 2,
  },
  damageText: {
    color: colors.error,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  statusLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginRight: spacing.sm,
  },
  statusButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: borderRadius.md,
    marginHorizontal: spacing.xs,
  },
  statusButtonActive: {
    borderWidth: 2,
  },
  verifiedButton: {
    borderColor: colors.success + '40', // 40% opacity
  },
  rejectedButton: {
    borderColor: colors.error + '40', // 40% opacity
  },
  statusButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: '500',
    marginLeft: spacing.xs,
    color: colors.text.secondary,
  },
  statusButtonTextActive: {
    fontWeight: '600',
  },
  verifiedButtonText: {
    color: colors.success,
  },
  rejectedButtonText: {
    color: colors.error,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
  },
  cancelButton: {
    flex: 1,
    marginRight: spacing.sm,
  },
  saveButton: {
    flex: 1,
    marginLeft: spacing.sm,
  },
});

export default ItemConditionForm;
