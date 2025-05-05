/**
 * ItemStatusBadge component
 * Displays the verification status of an item with appropriate styling
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../../styles/theme';
import { VERIFICATION_STATUS } from '../services/itemVerificationService';

const ItemStatusBadge = ({ status }) => {
  // Determine badge style based on status
  const getBadgeStyle = () => {
    switch (status) {
      case VERIFICATION_STATUS.VERIFIED:
        return styles.verified;
      case VERIFICATION_STATUS.REJECTED:
        return styles.rejected;
      default:
        return styles.pending;
    }
  };

  // Determine text style based on status
  const getTextStyle = () => {
    switch (status) {
      case VERIFICATION_STATUS.VERIFIED:
        return styles.verifiedText;
      case VERIFICATION_STATUS.REJECTED:
        return styles.rejectedText;
      default:
        return styles.pendingText;
    }
  };

  // Get display text for status
  const getStatusText = () => {
    switch (status) {
      case VERIFICATION_STATUS.VERIFIED:
        return 'Verified';
      case VERIFICATION_STATUS.REJECTED:
        return 'Rejected';
      default:
        return 'Pending';
    }
  };

  return (
    <View style={[styles.badge, getBadgeStyle()]}>
      <Text style={[styles.text, getTextStyle()]}>{getStatusText()}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: typography.fontSize.xs,
    fontWeight: '500',
  },
  // Pending status
  pending: {
    backgroundColor: colors.accent + '20', // 20% opacity
  },
  pendingText: {
    color: colors.accent,
  },
  // Verified status
  verified: {
    backgroundColor: colors.success + '20', // 20% opacity
  },
  verifiedText: {
    color: colors.success,
  },
  // Rejected status
  rejected: {
    backgroundColor: colors.error + '20', // 20% opacity
  },
  rejectedText: {
    color: colors.error,
  },
});

export default ItemStatusBadge;
