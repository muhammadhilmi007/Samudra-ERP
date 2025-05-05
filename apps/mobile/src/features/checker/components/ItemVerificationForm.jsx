/**
 * ItemVerificationForm component
 * Form for verifying item details and condition
 */
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput,
  Switch,
  TouchableOpacity,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '../../../styles/theme';
import Button from '../../../components/atoms/Button';
import { 
  itemVerificationService, 
  VERIFICATION_STATUS, 
  PACKAGING_QUALITY 
} from '../services/itemVerificationService';

const ItemVerificationForm = ({ 
  itemId, 
  initialData = null, 
  onSave, 
  onCancel 
}) => {
  // Form state
  const [formData, setFormData] = useState({
    conditionRating: 3,
    hasDamage: false,
    damageDescription: '',
    packagingQuality: PACKAGING_QUALITY.GOOD,
    specialHandling: '',
    verificationStatus: VERIFICATION_STATUS.PENDING,
    verificationNotes: '',
  });
  
  // Validation state
  const [errors, setErrors] = useState({});
  
  // Loading state
  const [loading, setLoading] = useState(false);
  
  // Initialize form with data if available
  useEffect(() => {
    if (initialData) {
      setFormData({
        conditionRating: initialData.conditionRating || 3,
        hasDamage: initialData.hasDamage || false,
        damageDescription: initialData.damageDescription || '',
        packagingQuality: initialData.packagingQuality || PACKAGING_QUALITY.GOOD,
        specialHandling: initialData.specialHandling || '',
        verificationStatus: initialData.verificationStatus || VERIFICATION_STATUS.PENDING,
        verificationNotes: initialData.verificationNotes || '',
      });
    }
  }, [initialData]);
  
  // Handle form field changes
  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Clear error for this field if it exists
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };
  
  // Validate form data
  const validateForm = () => {
    const validationResult = itemVerificationService.validateConditionData(formData);
    
    if (!validationResult.isValid) {
      setErrors(validationResult.errors);
      return false;
    }
    
    return true;
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const savedCondition = await itemVerificationService.saveItemCondition(itemId, formData);
      
      if (onSave) {
        onSave(savedCondition);
      }
    } catch (error) {
      console.error('Error saving item condition:', error);
      Alert.alert(
        'Error',
        'Failed to save item condition. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };
  
  // Render condition rating stars
  const renderRatingStars = () => {
    const stars = [];
    
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => handleChange('conditionRating', i)}
          style={styles.starContainer}
        >
          <Ionicons
            name={i <= formData.conditionRating ? 'star' : 'star-outline'}
            size={24}
            color={i <= formData.conditionRating ? colors.accent : colors.neutral}
          />
        </TouchableOpacity>
      );
    }
    
    return (
      <View style={styles.starsContainer}>
        {stars}
      </View>
    );
  };
  
  // Render packaging quality options
  const renderPackagingOptions = () => {
    return (
      <View style={styles.packagingOptions}>
        {Object.values(PACKAGING_QUALITY).map((quality) => (
          <TouchableOpacity
            key={quality}
            style={[
              styles.packagingOption,
              formData.packagingQuality === quality && styles.packagingOptionSelected
            ]}
            onPress={() => handleChange('packagingQuality', quality)}
          >
            <Text 
              style={[
                styles.packagingOptionText,
                formData.packagingQuality === quality && styles.packagingOptionTextSelected
              ]}
            >
              {quality.charAt(0).toUpperCase() + quality.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.formContainer}>
        {/* Condition Rating */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Condition Rating</Text>
          {renderRatingStars()}
          {errors.conditionRating && (
            <Text style={styles.errorText}>{errors.conditionRating}</Text>
          )}
        </View>
        
        {/* Damage Toggle */}
        <View style={styles.formGroup}>
          <View style={styles.switchContainer}>
            <Text style={styles.label}>Item Has Damage</Text>
            <Switch
              value={formData.hasDamage}
              onValueChange={(value) => handleChange('hasDamage', value)}
              trackColor={{ false: colors.border.default, true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>
        
        {/* Damage Description (conditional) */}
        {formData.hasDamage && (
          <View style={styles.formGroup}>
            <Text style={styles.label}>Damage Description</Text>
            <TextInput
              style={[
                styles.input, 
                styles.textArea,
                errors.damageDescription && styles.inputError
              ]}
              value={formData.damageDescription}
              onChangeText={(text) => handleChange('damageDescription', text)}
              placeholder="Describe the damage..."
              multiline
              numberOfLines={3}
            />
            {errors.damageDescription && (
              <Text style={styles.errorText}>{errors.damageDescription}</Text>
            )}
          </View>
        )}
        
        {/* Packaging Quality */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Packaging Quality</Text>
          {renderPackagingOptions()}
          {errors.packagingQuality && (
            <Text style={styles.errorText}>{errors.packagingQuality}</Text>
          )}
        </View>
        
        {/* Special Handling Instructions */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Special Handling Instructions</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.specialHandling}
            onChangeText={(text) => handleChange('specialHandling', text)}
            placeholder="Enter any special handling instructions..."
            multiline
            numberOfLines={3}
          />
        </View>
        
        {/* Verification Notes */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Verification Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.verificationNotes}
            onChangeText={(text) => handleChange('verificationNotes', text)}
            placeholder="Enter verification notes..."
            multiline
            numberOfLines={3}
          />
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
  formGroup: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: '500',
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
    backgroundColor: colors.background.primary,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    color: colors.error,
    fontSize: typography.fontSize.xs,
    marginTop: spacing.xs,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xs,
  },
  starContainer: {
    padding: spacing.xs,
  },
  packagingOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  packagingOption: {
    flex: 1,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    marginHorizontal: spacing.xs,
  },
  packagingOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10', // 10% opacity
  },
  packagingOptionText: {
    color: colors.text.secondary,
    fontSize: typography.fontSize.sm,
  },
  packagingOptionTextSelected: {
    color: colors.primary,
    fontWeight: '500',
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

export default ItemVerificationForm;
