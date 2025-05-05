/**
 * Button component for Samudra Paket ERP Mobile
 * Implements design system with primary, secondary, and accent variants
 */
import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps
} from 'react-native';
import { COLORS, SCREEN } from '../../config/constants';

export type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost';
export type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
  ...props
}) => {
  // Determine button styles based on variant and size
  const getButtonStyles = (): ViewStyle => {
    let buttonStyle: ViewStyle = {};
    
    // Variant styles
    switch (variant) {
      case 'primary':
        buttonStyle = {
          backgroundColor: COLORS.PRIMARY,
          borderColor: COLORS.PRIMARY,
        };
        break;
      case 'secondary':
        buttonStyle = {
          backgroundColor: COLORS.SECONDARY,
          borderColor: COLORS.SECONDARY,
        };
        break;
      case 'accent':
        buttonStyle = {
          backgroundColor: COLORS.ACCENT,
          borderColor: COLORS.ACCENT,
        };
        break;
      case 'outline':
        buttonStyle = {
          backgroundColor: 'transparent',
          borderColor: COLORS.PRIMARY,
          borderWidth: 1,
        };
        break;
      case 'ghost':
        buttonStyle = {
          backgroundColor: 'transparent',
          borderColor: 'transparent',
        };
        break;
    }
    
    // Size styles
    switch (size) {
      case 'small':
        buttonStyle = {
          ...buttonStyle,
          paddingVertical: SCREEN.SPACING.XS,
          paddingHorizontal: SCREEN.SPACING.SM,
          borderRadius: SCREEN.RADIUS.SM,
        };
        break;
      case 'medium':
        buttonStyle = {
          ...buttonStyle,
          paddingVertical: SCREEN.SPACING.SM,
          paddingHorizontal: SCREEN.SPACING.MD,
          borderRadius: SCREEN.RADIUS.MD,
        };
        break;
      case 'large':
        buttonStyle = {
          ...buttonStyle,
          paddingVertical: SCREEN.SPACING.MD,
          paddingHorizontal: SCREEN.SPACING.LG,
          borderRadius: SCREEN.RADIUS.MD,
        };
        break;
    }
    
    // Width style
    if (fullWidth) {
      buttonStyle.width = '100%';
    }
    
    // Disabled style
    if (disabled || loading) {
      buttonStyle.opacity = 0.6;
    }
    
    return buttonStyle;
  };
  
  // Determine text styles based on variant and size
  const getTextStyles = (): TextStyle => {
    let textStyleObj: TextStyle = {};
    
    // Variant styles
    switch (variant) {
      case 'primary':
      case 'secondary':
      case 'accent':
        textStyleObj = {
          color: COLORS.TEXT.INVERSE,
        };
        break;
      case 'outline':
      case 'ghost':
        textStyleObj = {
          color: COLORS.PRIMARY,
        };
        break;
    }
    
    // Size styles
    switch (size) {
      case 'small':
        textStyleObj = {
          ...textStyleObj,
          fontSize: 14,
        };
        break;
      case 'medium':
        textStyleObj = {
          ...textStyleObj,
          fontSize: 16,
        };
        break;
      case 'large':
        textStyleObj = {
          ...textStyleObj,
          fontSize: 18,
        };
        break;
    }
    
    return textStyleObj;
  };

  return (
    <TouchableOpacity
      style={[styles.button, getButtonStyles(), style]}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator 
          color={variant === 'outline' || variant === 'ghost' ? COLORS.PRIMARY : COLORS.TEXT.INVERSE} 
          size={size === 'small' ? 'small' : 'small'}
        />
      ) : (
        <>
          {leftIcon && <>{leftIcon}</>}
          <Text style={[styles.text, getTextStyles(), textStyle]}>{title}</Text>
          {rightIcon && <>{rightIcon}</>}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: SCREEN.RADIUS.MD,
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
    marginHorizontal: SCREEN.SPACING.XS,
  },
});

export default Button;
