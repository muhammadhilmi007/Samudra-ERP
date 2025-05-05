/**
 * OfflineBanner component for Samudra Paket ERP Mobile
 * Displays a banner when the device is offline
 */
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SCREEN } from '../../config/constants';

interface OfflineBannerProps {
  message?: string;
}

const OfflineBanner: React.FC<OfflineBannerProps> = ({
  message = 'Anda sedang offline. Data akan disinkronkan saat terhubung kembali.',
}) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.banner}>
        <Ionicons name="cloud-offline-outline" size={20} color={COLORS.TEXT.INVERSE} />
        <Text style={styles.message}>{message}</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999,
  },
  banner: {
    backgroundColor: COLORS.NEUTRAL,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SCREEN.SPACING.SM,
    paddingHorizontal: SCREEN.SPACING.MD,
  },
  message: {
    color: COLORS.TEXT.INVERSE,
    fontSize: 14,
    fontWeight: '500',
    marginLeft: SCREEN.SPACING.SM,
  },
});

export default OfflineBanner;
