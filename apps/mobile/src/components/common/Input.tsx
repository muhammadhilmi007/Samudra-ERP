/**
 * Input component for Samudra Paket ERP Mobile
 * Implements design system with various input types and validation
 */
import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SCREEN } from '../../config/constants';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  touched?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
  inputStyle?: TextStyle;
  errorStyle?: TextStyle;
  isPassword?: boolean;
  required?: boolean;
  helper?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  touched,
  leftIcon,
  rightIcon,
  containerStyle,
  labelStyle,
  inputStyle,
  errorStyle,
  isPassword = false,
  required = false,
  helper,
  ...props
}) => {
  const [secureTextEntry, setSecureTextEntry] = useState(isPassword);
  const hasError = touched && error;

  const toggleSecureEntry = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <View style={styles.labelContainer}>
          <Text style={[styles.label, labelStyle]}>
            {label}
            {required && <Text style={styles.required}> *</Text>}
          </Text>
        </View>
      )}
      
      <View style={[
        styles.inputContainer,
        hasError && styles.inputError,
      ]}>
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        
        <TextInput
          style={[
            styles.input,
            leftIcon && styles.inputWithLeftIcon,
            (rightIcon || isPassword) && styles.inputWithRightIcon,
            inputStyle,
          ]}
          placeholderTextColor={COLORS.TEXT.TERTIARY}
          secureTextEntry={secureTextEntry}
          {...props}
        />
        
        {isPassword ? (
          <TouchableOpacity 
            style={styles.rightIcon} 
            onPress={toggleSecureEntry}
            activeOpacity={0.7}
          >
            <Ionicons
              name={secureTextEntry ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color={COLORS.TEXT.TERTIARY}
            />
          </TouchableOpacity>
        ) : rightIcon ? (
          <View style={styles.rightIcon}>{rightIcon}</View>
        ) : null}
      </View>
      
      {hasError ? (
        <Text style={[styles.errorText, errorStyle]}>{error}</Text>
      ) : helper ? (
        <Text style={styles.helperText}>{helper}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SCREEN.SPACING.MD,
    width: '100%',
  },
  labelContainer: {
    marginBottom: SCREEN.SPACING.XS,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.TEXT.SECONDARY,
  },
  required: {
    color: COLORS.ERROR,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.BORDER.DEFAULT,
    borderRadius: SCREEN.RADIUS.MD,
    backgroundColor: COLORS.BACKGROUND.PRIMARY,
  },
  inputError: {
    borderColor: COLORS.ERROR,
  },
  input: {
    flex: 1,
    height: 48,
    paddingHorizontal: SCREEN.SPACING.MD,
    fontSize: 16,
    color: COLORS.TEXT.PRIMARY,
  },
  inputWithLeftIcon: {
    paddingLeft: SCREEN.SPACING.XS,
  },
  inputWithRightIcon: {
    paddingRight: SCREEN.SPACING.XS,
  },
  leftIcon: {
    paddingLeft: SCREEN.SPACING.SM,
  },
  rightIcon: {
    paddingRight: SCREEN.SPACING.SM,
  },
  errorText: {
    color: COLORS.ERROR,
    fontSize: 12,
    marginTop: SCREEN.SPACING.XS,
  },
  helperText: {
    color: COLORS.TEXT.TERTIARY,
    fontSize: 12,
    marginTop: SCREEN.SPACING.XS,
  },
});

export default Input;
