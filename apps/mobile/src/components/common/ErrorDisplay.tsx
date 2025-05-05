/**
 * ErrorDisplay component for Samudra Paket ERP Mobile
 * Displays error messages with appropriate styling and actions
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SCREEN } from '../../config/constants';
import { AppError, ErrorType } from '../../lib/errorHandler';

interface ErrorDisplayProps {
  error: AppError | string;
  onRetry?: () => void;
  onDismiss?: () => void;
  showIcon?: boolean;
  showRetry?: boolean;
  showDismiss?: boolean;
  style?: any;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  onRetry,
  onDismiss,
  showIcon = true,
  showRetry = false,
  showDismiss = true,
  style,
}) => {
  // Get error message and icon based on error type
  const getErrorDetails = () => {
    if (typeof error === 'string') {
      return {
        message: error,
        icon: 'alert-circle-outline',
      };
    }

    let icon = 'alert-circle-outline';
    
    switch (error.type) {
      case ErrorType.NETWORK:
        icon = 'cloud-offline-outline';
        break;
      case ErrorType.AUTH:
        icon = 'lock-closed-outline';
        break;
      case ErrorType.PERMISSION:
        icon = 'shield-outline';
        break;
      case ErrorType.STORAGE:
        icon = 'save-outline';
        break;
      case ErrorType.SYNC:
        icon = 'sync-outline';
        break;
      case ErrorType.VALIDATION:
        icon = 'warning-outline';
        break;
      default:
        icon = 'alert-circle-outline';
    }
    
    return {
      message: error.message,
      icon,
    };
  };
  
  const { message, icon } = getErrorDetails();
  
  return (
    <View style={[styles.container, style]}>
      <View style={styles.content}>
        {showIcon && (
          <Ionicons name={icon} size={24} color={COLORS.ERROR} style={styles.icon} />
        )}
        <Text style={styles.message}>{message}</Text>
      </View>
      
      {(showRetry || showDismiss) && (
        <View style={styles.actions}>
          {showRetry && onRetry && (
            <TouchableOpacity style={styles.actionButton} onPress={onRetry}>
              <Ionicons name="refresh-outline" size={18} color={COLORS.PRIMARY} />
              <Text style={styles.actionText}>Coba Lagi</Text>
            </TouchableOpacity>
          )}
          
          {showDismiss && onDismiss && (
            <TouchableOpacity style={styles.actionButton} onPress={onDismiss}>
              <Ionicons name="close-outline" size={18} color={COLORS.NEUTRAL} />
              <Text style={[styles.actionText, { color: COLORS.NEUTRAL }]}>Tutup</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FEF2F2',
    borderRadius: SCREEN.RADIUS.MD,
    padding: SCREEN.SPACING.MD,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.ERROR,
    marginVertical: SCREEN.SPACING.SM,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  icon: {
    marginRight: SCREEN.SPACING.SM,
  },
  message: {
    flex: 1,
    fontSize: 14,
    color: COLORS.TEXT.PRIMARY,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: SCREEN.SPACING.SM,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SCREEN.SPACING.SM,
    marginLeft: SCREEN.SPACING.SM,
  },
  actionText: {
    fontSize: 14,
    color: COLORS.PRIMARY,
    marginLeft: 4,
    fontWeight: '500',
  },
});

export default ErrorDisplay;
