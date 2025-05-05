/**
 * Loading Screen component for Samudra Paket ERP Mobile
 * Displays a loading indicator with the app logo
 */
import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { COLORS } from '../config/constants';

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'Memuat...',
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        {/* Replace with actual logo image */}
        <Image 
          source={require('../assets/logo.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      <ActivityIndicator size="large" color={COLORS.PRIMARY} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND.PRIMARY,
  },
  logoContainer: {
    marginBottom: 24,
  },
  logo: {
    width: 120,
    height: 120,
  },
  message: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.TEXT.SECONDARY,
    textAlign: 'center',
  },
});

export default LoadingScreen;
