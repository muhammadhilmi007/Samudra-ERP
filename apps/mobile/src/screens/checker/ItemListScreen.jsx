/**
 * ItemListScreen for Checker App
 * Displays a list of items to be verified and managed
 */
import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors, typography, spacing, borderRadius, shadows } from '../../styles/theme';
import { database } from '../../db/config';
import { PickupItem, ItemCondition } from '../../db/models';
import { itemVerificationService } from '../../features/checker/services/itemVerificationService';
import ItemStatusBadge from '../../features/checker/components/ItemStatusBadge';

const ItemListScreen = ({ navigation, route }) => {
  // Get pickup request ID from route params
  const { pickupRequestId } = route.params || {};
  
  // Items state
  const [items, setItems] = useState([]);
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Error state
  const [error, setError] = useState(null);
  
  // Load items
  const loadItems = useCallback(async () => {
    try {
      setError(null);
      
      if (!pickupRequestId) {
        setError('No pickup request ID provided');
        setLoading(false);
        setRefreshing(false);
        return;
      }
      
      // Get items from database
      const pickupItems = await itemVerificationService.getItemsByPickupRequestId(pickupRequestId);
      
      // Get condition data for each item
      const itemsWithCondition = await Promise.all(
        pickupItems.map(async (item) => {
          const condition = await itemVerificationService.getItemCondition(item.id);
          return {
            ...item,
            condition,
          };
        })
      );
      
      setItems(itemsWithCondition);
    } catch (err) {
      console.error('Error loading items:', err);
      setError('Failed to load items. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [pickupRequestId]);
  
  // Load items on mount and when screen is focused
  useEffect(() => {
    loadItems();
  }, [loadItems]);
  
  useFocusEffect(
    useCallback(() => {
      loadItems();
    }, [loadItems])
  );
  
  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    loadItems();
  };
  
  // Navigate to item detail screen
  const handleItemPress = (item) => {
    navigation.navigate('ItemDetail', { itemId: item.id });
  };
  
  // Render item card
  const renderItemCard = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.itemCard}
        onPress={() => handleItemPress(item)}
      >
        <View style={styles.itemHeader}>
          <Text style={styles.itemDescription}>{item.description}</Text>
          {item.condition && (
            <ItemStatusBadge status={item.condition.verificationStatus} />
          )}
        </View>
        
        <View style={styles.itemDetails}>
          <View style={styles.itemDetail}>
            <Ionicons name="cube-outline" size={16} color={colors.text.secondary} />
            <Text style={styles.itemDetailText}>
              {item.weight ? `${item.weight} kg` : 'No weight'}
            </Text>
          </View>
          
          <View style={styles.itemDetail}>
            <Ionicons name="resize-outline" size={16} color={colors.text.secondary} />
            <Text style={styles.itemDetailText}>
              {item.length && item.width && item.height 
                ? `${item.length}×${item.width}×${item.height} cm` 
                : 'No dimensions'}
            </Text>
          </View>
        </View>
        
        <View style={styles.itemFooter}>
          <Text style={styles.itemId}>ID: {item.id.substring(0, 8)}</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.text.tertiary} />
        </View>
      </TouchableOpacity>
    );
  };
  
  // Render empty list
  const renderEmptyList = () => {
    if (loading) return null;
    
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="cube-outline" size={48} color={colors.border.dark} />
        <Text style={styles.emptyText}>No items found</Text>
        <Text style={styles.emptySubtext}>
          Items for this pickup request will appear here
        </Text>
      </View>
    );
  };
  
  // Render error
  const renderError = () => {
    if (!error) return null;
    
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={loadItems}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  };
  
  // Render loading
  const renderLoading = () => {
    if (!loading) return null;
    
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading items...</Text>
      </View>
    );
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Items to Verify</Text>
        <Text style={styles.headerSubtitle}>
          Pickup Request #{pickupRequestId?.substring(0, 8) || 'Unknown'}
        </Text>
      </View>
      
      {renderError()}
      
      {loading ? (
        renderLoading()
      ) : (
        <FlatList
          data={items}
          renderItem={renderItemCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
            />
          }
        />
      )}
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
    paddingTop: spacing.lg,
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
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.lg,
  },
  itemCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    padding: spacing.md,
    ...shadows.sm,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  itemDescription: {
    fontSize: typography.fontSize.md,
    fontWeight: '500',
    color: colors.text.primary,
    flex: 1,
    marginRight: spacing.sm,
  },
  itemDetails: {
    marginBottom: spacing.sm,
  },
  itemDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs / 2,
  },
  itemDetailText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    paddingTop: spacing.sm,
  },
  itemId: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    fontSize: typography.fontSize.md,
    fontWeight: '500',
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
  emptySubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  errorText: {
    fontSize: typography.fontSize.md,
    color: colors.error,
    textAlign: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  retryButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
  },
  retryButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
});

export default ItemListScreen;
