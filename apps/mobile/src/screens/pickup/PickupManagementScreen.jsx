/**
 * PickupManagementScreen for Samudra Paket ERP Mobile App
 * Main screen for managing pickup operations
 */
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '../../styles/theme';
import Button from '../../components/atoms/Button';

const PickupManagementScreen = ({ navigation }) => {
  // Navigate to Checker App
  const navigateToCheckerApp = () => {
    // For testing purposes, we'll use a hardcoded pickup request ID
    // In a real app, this would come from selected pickup request
    const pickupRequestId = 'test-pickup-request-123';
    navigation.navigate('CheckerApp', { 
      screen: 'ItemList',
      params: { pickupRequestId }
    });
  };
  
  // Navigate to Warehouse Operations
  const navigateToWarehouseOperations = () => {
    navigation.navigate('CheckerApp', {
      screen: 'WarehouseOperations'
    });
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Pickup Management</Text>
        <Text style={styles.headerSubtitle}>Manage pickup operations</Text>
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <View style={styles.actionCards}>
            {/* Checker App Card */}
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={navigateToCheckerApp}
            >
              <View style={[styles.actionIconContainer, styles.checkerIconContainer]}>
                <Ionicons name="clipboard-outline" size={24} color={colors.primary} />
              </View>
              <Text style={styles.actionTitle}>Checker App</Text>
              <Text style={styles.actionDescription}>
                Verify, measure, and assess item conditions
              </Text>
              <Ionicons 
                name="chevron-forward" 
                size={16} 
                color={colors.text.tertiary} 
                style={styles.actionArrow}
              />
            </TouchableOpacity>
            
            {/* Warehouse Operations Card */}
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={navigateToWarehouseOperations}
            >
              <View style={[styles.actionIconContainer, { backgroundColor: '#e6f2ff' }]}>
                <Ionicons name="cube-outline" size={24} color="#2563EB" />
              </View>
              <Text style={styles.actionTitle}>Warehouse Operations</Text>
              <Text style={styles.actionDescription}>
                Manage warehouse items, loading, and inventory
              </Text>
              <Ionicons 
                name="chevron-forward" 
                size={16} 
                color={colors.text.tertiary} 
                style={styles.actionArrow}
              />
            </TouchableOpacity>
            
            {/* Pickup Assignment Card */}
            <TouchableOpacity style={styles.actionCard}>
              <View style={[styles.actionIconContainer, styles.assignmentIconContainer]}>
                <Ionicons name="calendar-outline" size={24} color={colors.secondary} />
              </View>
              <Text style={styles.actionTitle}>Pickup Assignments</Text>
              <Text style={styles.actionDescription}>
                View and manage pickup assignments
              </Text>
              <Ionicons 
                name="chevron-forward" 
                size={16} 
                color={colors.text.tertiary} 
                style={styles.actionArrow}
              />
            </TouchableOpacity>
            
            {/* Pickup Requests Card */}
            <TouchableOpacity style={styles.actionCard}>
              <View style={[styles.actionIconContainer, styles.requestsIconContainer]}>
                <Ionicons name="document-text-outline" size={24} color={colors.accent} />
              </View>
              <Text style={styles.actionTitle}>Pickup Requests</Text>
              <Text style={styles.actionDescription}>
                View and manage pickup requests
              </Text>
              <Ionicons 
                name="chevron-forward" 
                size={16} 
                color={colors.text.tertiary} 
                style={styles.actionArrow}
              />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          
          <View style={styles.emptyState}>
            <Ionicons name="time-outline" size={48} color={colors.border.dark} />
            <Text style={styles.emptyStateText}>No recent activity</Text>
            <Text style={styles.emptyStateSubtext}>
              Your recent pickup activities will appear here
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  header: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    paddingTop: spacing.xl,
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: spacing.xs / 2,
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: spacing.lg,
    padding: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  actionCards: {
    marginBottom: spacing.md,
  },
  actionCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  checkerIconContainer: {
    backgroundColor: colors.primary + '10', // 10% opacity
  },
  assignmentIconContainer: {
    backgroundColor: colors.secondary + '10', // 10% opacity
  },
  requestsIconContainer: {
    backgroundColor: colors.accent + '10', // 10% opacity
  },
  actionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  actionDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  actionArrow: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.md,
    ...shadows.sm,
  },
  emptyStateText: {
    fontSize: typography.fontSize.md,
    fontWeight: '500',
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
  emptyStateSubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});

export default PickupManagementScreen;
