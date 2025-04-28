/**
 * Samudra Paket ERP - Mobile App
 * Main App component
 */

import React from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

const App: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Samudra Paket ERP</Text>
        <Text style={styles.subtitle}>PT. Sarana Mudah Raya</Text>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Mobile Application</Text>
          <Text style={styles.cardText}>
            Integrated mobile solution for logistics, delivery, and business operations.
          </Text>
        </View>
      </View>
      <StatusBar style="auto" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2563EB', // Primary color
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#64748B', // Neutral color
    marginBottom: 24,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginTop: 24,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#10B981', // Secondary color
    marginBottom: 8,
  },
  cardText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
});

export default App;
