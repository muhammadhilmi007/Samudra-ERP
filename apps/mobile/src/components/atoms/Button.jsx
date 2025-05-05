/**
 * Button component for Samudra Paket ERP Mobile App
 * A reusable button with consistent styling
 */
import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  View 
} from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../styles/theme';

const Button = ({ 
  title, 
  onPress, 
  variant = 'primary', 
  size = 'medium',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
  ...props 
}) => {
  // Determine button style based on variant
  const getButtonStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles.buttonSecondary;
      case 'outline':
        return styles.buttonOutline;
      case 'text':
        return styles.buttonText;
      case 'danger':
        return styles.buttonDanger;
      default:
        return styles.buttonPrimary;
    }
  };

  // Determine text style based on variant
  const getTextStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles.textSecondary;
      case 'outline':
        return styles.textOutline;
      case 'text':
        return styles.textText;
      case 'danger':
        return styles.textDanger;
      default:
        return styles.textPrimary;
    }
  };

  // Determine button size
  const getButtonSizeStyle = () => {
    switch (size) {
      case 'small':
        return styles.buttonSmall;
      case 'large':
        return styles.buttonLarge;
      default:
        return styles.buttonMedium;
    }
  };

  // Determine text size
  const getTextSizeStyle = () => {
    switch (size) {
      case 'small':
        return styles.textSmall;
      case 'large':
        return styles.textLarge;
      default:
        return styles.textMedium;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getButtonStyle(),
        getButtonSizeStyle(),
        disabled && styles.buttonDisabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator 
          color={variant === 'outline' || variant === 'text' ? colors.primary : '#FFFFFF'} 
          size="small" 
        />
      ) : (
        <View style={styles.contentContainer}>
          {leftIcon && <View style={styles.leftIconContainer}>{leftIcon}</View>}
          
          <Text 
            style={[
              styles.text, 
              getTextStyle(), 
              getTextSizeStyle(),
              disabled && styles.textDisabled,
              textStyle,
            ]}
          >
            {title}
          </Text>
          
          {rightIcon && <View style={styles.rightIconContainer}>{rightIcon}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
  },
  buttonSecondary: {
    backgroundColor: colors.secondary,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  buttonText: {
    backgroundColor: 'transparent',
  },
  buttonDanger: {
    backgroundColor: colors.error,
  },
  buttonDisabled: {
    backgroundColor: colors.border.default,
    borderColor: colors.border.default,
  },
  buttonSmall: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    minHeight: 36,
  },
  buttonMedium: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    minHeight: 48,
  },
  buttonLarge: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    minHeight: 56,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '500',
    textAlign: 'center',
  },
  textPrimary: {
    color: '#FFFFFF',
  },
  textSecondary: {
    color: '#FFFFFF',
  },
  textOutline: {
    color: colors.primary,
  },
  textText: {
    color: colors.primary,
  },
  textDanger: {
    color: '#FFFFFF',
  },
  textDisabled: {
    color: colors.text.tertiary,
  },
  textSmall: {
    fontSize: typography.fontSize.sm,
  },
  textMedium: {
    fontSize: typography.fontSize.md,
  },
  textLarge: {
    fontSize: typography.fontSize.lg,
  },
  leftIconContainer: {
    marginRight: spacing.xs,
  },
  rightIconContainer: {
    marginLeft: spacing.xs,
  },
});

export default Button;
