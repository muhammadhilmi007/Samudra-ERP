/**
 * ItemMeasurementForm component
 * Form for measuring and weighing items
 */
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput,
  Alert,
  ScrollView
} from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../../styles/theme';
import Button from '../../../components/atoms/Button';
import { 
  itemMeasurementService,
  calculateVolumetricWeight
} from '../services/itemMeasurementService';

const ItemMeasurementForm = ({ 
  itemId, 
  initialData = null,
  onSave,
  onCancel
}) => {
  // Form state
  const [formData, setFormData] = useState({
    weight: '',
    length: '',
    width: '',
    height: '',
  });
  
  // Calculated volumetric weight
  const [volumetricWeight, setVolumetricWeight] = useState(0);
  
  // Validation state
  const [errors, setErrors] = useState({});
  
  // Loading state
  const [loading, setLoading] = useState(false);
  
  // Initialize form with data if available
  useEffect(() => {
    if (initialData) {
      setFormData({
        weight: initialData.weight ? initialData.weight.toString() : '',
        length: initialData.length ? initialData.length.toString() : '',
        width: initialData.width ? initialData.width.toString() : '',
        height: initialData.height ? initialData.height.toString() : '',
      });
      
      // Calculate volumetric weight
      if (initialData.length && initialData.width && initialData.height) {
        const volWeight = calculateVolumetricWeight(
          initialData.length,
          initialData.width,
          initialData.height
        );
        setVolumetricWeight(volWeight);
      }
    }
  }, [initialData]);
  
  // Recalculate volumetric weight when dimensions change
  useEffect(() => {
    const length = parseFloat(formData.length) || 0;
    const width = parseFloat(formData.width) || 0;
    const height = parseFloat(formData.height) || 0;
    
    if (length > 0 && width > 0 && height > 0) {
      const volWeight = calculateVolumetricWeight(length, width, height);
      setVolumetricWeight(volWeight);
    } else {
      setVolumetricWeight(0);
    }
  }, [formData.length, formData.width, formData.height]);
  
  // Handle form field changes
  const handleChange = (field, value) => {
    // Only allow numeric input with decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
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
    }
  };
  
  // Validate form data
  const validateForm = () => {
    const dataToValidate = {
      weight: parseFloat(formData.weight) || 0,
      length: parseFloat(formData.length) || 0,
      width: parseFloat(formData.width) || 0,
      height: parseFloat(formData.height) || 0,
    };
    
    const validationResult = itemMeasurementService.validateMeasurementData(dataToValidate);
    
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
      const measurementData = {
        weight: parseFloat(formData.weight),
        length: parseFloat(formData.length),
        width: parseFloat(formData.width),
        height: parseFloat(formData.height),
      };
      
      const updatedItem = await itemMeasurementService.updateItemMeasurements(
        itemId,
        measurementData
      );
      
      if (onSave) {
        onSave(updatedItem);
      }
    } catch (error) {
      console.error('Error updating item measurements:', error);
      Alert.alert(
        'Error',
        'Failed to update item measurements. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };
  
  // Calculate effective weight (greater of actual weight and volumetric weight)
  const getEffectiveWeight = () => {
    const actualWeight = parseFloat(formData.weight) || 0;
    return Math.max(actualWeight, volumetricWeight);
  };
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.formContainer}>
        {/* Weight */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Weight (kg)</Text>
          <TextInput
            style={[styles.input, errors.weight && styles.inputError]}
            value={formData.weight}
            onChangeText={(text) => handleChange('weight', text)}
            placeholder="Enter weight in kg"
            keyboardType="numeric"
          />
          {errors.weight && (
            <Text style={styles.errorText}>{errors.weight}</Text>
          )}
        </View>
        
        {/* Dimensions */}
        <View style={styles.dimensionsContainer}>
          <Text style={styles.sectionTitle}>Dimensions (cm)</Text>
          
          <View style={styles.dimensionsRow}>
            {/* Length */}
            <View style={styles.dimensionField}>
              <Text style={styles.label}>Length</Text>
              <TextInput
                style={[styles.input, errors.length && styles.inputError]}
                value={formData.length}
                onChangeText={(text) => handleChange('length', text)}
                placeholder="L"
                keyboardType="numeric"
              />
              {errors.length && (
                <Text style={styles.errorText}>{errors.length}</Text>
              )}
            </View>
            
            {/* Width */}
            <View style={styles.dimensionField}>
              <Text style={styles.label}>Width</Text>
              <TextInput
                style={[styles.input, errors.width && styles.inputError]}
                value={formData.width}
                onChangeText={(text) => handleChange('width', text)}
                placeholder="W"
                keyboardType="numeric"
              />
              {errors.width && (
                <Text style={styles.errorText}>{errors.width}</Text>
              )}
            </View>
            
            {/* Height */}
            <View style={styles.dimensionField}>
              <Text style={styles.label}>Height</Text>
              <TextInput
                style={[styles.input, errors.height && styles.inputError]}
                value={formData.height}
                onChangeText={(text) => handleChange('height', text)}
                placeholder="H"
                keyboardType="numeric"
              />
              {errors.height && (
                <Text style={styles.errorText}>{errors.height}</Text>
              )}
            </View>
          </View>
        </View>
        
        {/* Weight Summary */}
        <View style={styles.weightSummary}>
          <View style={styles.weightRow}>
            <Text style={styles.weightLabel}>Actual Weight:</Text>
            <Text style={styles.weightValue}>
              {parseFloat(formData.weight) ? `${parseFloat(formData.weight).toFixed(2)} kg` : '-'}
            </Text>
          </View>
          
          <View style={styles.weightRow}>
            <Text style={styles.weightLabel}>Volumetric Weight:</Text>
            <Text style={styles.weightValue}>
              {volumetricWeight > 0 ? `${volumetricWeight.toFixed(2)} kg` : '-'}
            </Text>
          </View>
          
          <View style={styles.weightRow}>
            <Text style={[styles.weightLabel, styles.effectiveWeightLabel]}>
              Effective Weight:
            </Text>
            <Text style={[styles.weightValue, styles.effectiveWeightValue]}>
              {getEffectiveWeight() > 0 ? `${getEffectiveWeight().toFixed(2)} kg` : '-'}
            </Text>
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
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    color: colors.error,
    fontSize: typography.fontSize.xs,
    marginTop: spacing.xs,
  },
  sectionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: '500',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  dimensionsContainer: {
    marginBottom: spacing.md,
  },
  dimensionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dimensionField: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  weightSummary: {
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  weightRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  weightLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  weightValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: '500',
    color: colors.text.primary,
  },
  effectiveWeightLabel: {
    fontSize: typography.fontSize.md,
    fontWeight: '500',
    color: colors.primary,
  },
  effectiveWeightValue: {
    fontSize: typography.fontSize.md,
    fontWeight: '700',
    color: colors.primary,
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

export default ItemMeasurementForm;
