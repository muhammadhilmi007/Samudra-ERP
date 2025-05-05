/**
 * ItemVerificationSummary component
 * Displays a summary of item verification status and details
 */
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '../../../styles/theme';
import ItemStatusBadge from './ItemStatusBadge';
import { VERIFICATION_STATUS } from '../services/itemVerificationService';

const ItemVerificationSummary = ({ 
  item, 
  condition,
  photos = []
}) => {
  // Calculate effective weight (greater of actual weight and volumetric weight)
  const getEffectiveWeight = () => {
    if (!item) return 0;
    return Math.max(item.weight || 0, item.volumetricWeight || 0);
  };
  
  // Get verification status color
  const getStatusColor = () => {
    if (!condition) return colors.neutral;
    
    switch (condition.verificationStatus) {
      case VERIFICATION_STATUS.VERIFIED:
        return colors.success;
      case VERIFICATION_STATUS.REJECTED:
        return colors.error;
      default:
        return colors.accent;
    }
  };
  
  // Render verification status icon
  const renderStatusIcon = () => {
    if (!condition) return null;
    
    let iconName = 'time-outline';
    
    switch (condition.verificationStatus) {
      case VERIFICATION_STATUS.VERIFIED:
        iconName = 'checkmark-circle';
        break;
      case VERIFICATION_STATUS.REJECTED:
        iconName = 'close-circle';
        break;
      default:
        iconName = 'time-outline';
    }
    
    return (
      <Ionicons 
        name={iconName} 
        size={48} 
        color={getStatusColor()} 
        style={styles.statusIcon}
      />
    );
  };
  
  // Render condition rating stars
  const renderRatingStars = () => {
    if (!condition) return null;
    
    const stars = [];
    
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= condition.conditionRating ? 'star' : 'star-outline'}
          size={16}
          color={i <= condition.conditionRating ? colors.accent : colors.neutral}
          style={styles.ratingStar}
        />
      );
    }
    
    return (
      <View style={styles.ratingContainer}>
        {stars}
      </View>
    );
  };
  
  // Render item photos
  const renderPhotos = () => {
    if (!photos || photos.length === 0) {
      return (
        <View style={styles.noPhotosContainer}>
          <Ionicons name="images-outline" size={24} color={colors.border.dark} />
          <Text style={styles.noPhotosText}>No photos available</Text>
        </View>
      );
    }
    
    return (
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.photosContainer}
      >
        {photos.map((photo, index) => (
          <View key={index} style={styles.photoItem}>
            <Image 
              source={{ uri: photo.thumbnailUri || photo.photoUri }} 
              style={styles.photo}
              resizeMode="cover"
            />
          </View>
        ))}
      </ScrollView>
    );
  };
  
  if (!item) {
    return (
      <View style={styles.container}>
        <Text style={styles.noDataText}>No item data available</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      {/* Header with Status */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.itemCode}>Item #{item.id?.substring(0, 8)}</Text>
          <Text style={styles.itemDescription}>{item.description}</Text>
          
          {condition && (
            <View style={styles.statusContainer}>
              <ItemStatusBadge status={condition.verificationStatus} />
            </View>
          )}
        </View>
        
        {renderStatusIcon()}
      </View>
      
      {/* Photos */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Photos</Text>
        {renderPhotos()}
      </View>
      
      {/* Measurements */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Measurements</Text>
        
        <View style={styles.measurementsContainer}>
          <View style={styles.measurementItem}>
            <Text style={styles.measurementLabel}>Weight</Text>
            <Text style={styles.measurementValue}>
              {item.weight ? `${item.weight} kg` : 'Not measured'}
            </Text>
          </View>
          
          <View style={styles.measurementItem}>
            <Text style={styles.measurementLabel}>Dimensions</Text>
            <Text style={styles.measurementValue}>
              {item.length && item.width && item.height 
                ? `${item.length} × ${item.width} × ${item.height} cm` 
                : 'Not measured'}
            </Text>
          </View>
          
          <View style={styles.measurementItem}>
            <Text style={styles.measurementLabel}>Volumetric Weight</Text>
            <Text style={styles.measurementValue}>
              {item.volumetricWeight 
                ? `${item.volumetricWeight} kg` 
                : 'Not calculated'}
            </Text>
          </View>
          
          <View style={[styles.measurementItem, styles.effectiveWeightItem]}>
            <Text style={styles.effectiveWeightLabel}>Effective Weight</Text>
            <Text style={styles.effectiveWeightValue}>
              {getEffectiveWeight() > 0 
                ? `${getEffectiveWeight()} kg` 
                : 'Not available'}
            </Text>
          </View>
        </View>
      </View>
      
      {/* Condition Assessment */}
      {condition && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Condition Assessment</Text>
          
          <View style={styles.conditionContainer}>
            <View style={styles.conditionRow}>
              <Text style={styles.conditionLabel}>Condition Rating:</Text>
              {renderRatingStars()}
            </View>
            
            <View style={styles.conditionRow}>
              <Text style={styles.conditionLabel}>Packaging Quality:</Text>
              <Text style={styles.conditionValue}>
                {condition.packagingQuality.charAt(0).toUpperCase() + 
                 condition.packagingQuality.slice(1)}
              </Text>
            </View>
            
            <View style={styles.conditionRow}>
              <Text style={styles.conditionLabel}>Has Damage:</Text>
              <Text style={styles.conditionValue}>
                {condition.hasDamage ? 'Yes' : 'No'}
              </Text>
            </View>
            
            {condition.hasDamage && condition.damageDescription && (
              <View style={styles.conditionRow}>
                <Text style={styles.conditionLabel}>Damage Details:</Text>
                <Text style={[styles.conditionValue, styles.damageText]}>
                  {condition.damageDescription}
                </Text>
              </View>
            )}
            
            {condition.specialHandling && (
              <View style={styles.conditionRow}>
                <Text style={styles.conditionLabel}>Special Handling:</Text>
                <Text style={styles.conditionValue}>
                  {condition.specialHandling}
                </Text>
              </View>
            )}
            
            {condition.verificationNotes && (
              <View style={styles.conditionRow}>
                <Text style={styles.conditionLabel}>Notes:</Text>
                <Text style={styles.conditionValue}>
                  {condition.verificationNotes}
                </Text>
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  noDataText: {
    fontSize: typography.fontSize.md,
    color: colors.text.tertiary,
    textAlign: 'center',
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    padding: spacing.md,
    backgroundColor: colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  headerContent: {
    flex: 1,
  },
  itemCode: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    marginBottom: spacing.xs / 2,
  },
  itemDescription: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  statusContainer: {
    marginTop: spacing.xs,
  },
  statusIcon: {
    marginLeft: spacing.md,
  },
  section: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  sectionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  photosContainer: {
    flexDirection: 'row',
  },
  photoItem: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.sm,
    marginRight: spacing.sm,
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  noPhotosContainer: {
    height: 100,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
  },
  noPhotosText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
  measurementsContainer: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  measurementItem: {
    marginBottom: spacing.sm,
  },
  measurementLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginBottom: spacing.xs / 2,
  },
  measurementValue: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
  },
  effectiveWeightItem: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    marginBottom: 0,
  },
  effectiveWeightLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: '500',
    color: colors.primary,
    marginBottom: spacing.xs / 2,
  },
  effectiveWeightValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: '700',
    color: colors.primary,
  },
  conditionContainer: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  conditionRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  conditionLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    width: 120,
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
});

export default ItemVerificationSummary;
