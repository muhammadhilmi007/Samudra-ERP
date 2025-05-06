import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { Card, Button, TextInput, Divider, ActivityIndicator, Chip, Menu, Searchbar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { warehouseItemService } from '../services/warehouseItemService';
import ItemStatusBadge from './ItemStatusBadge';

const InventoryView = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('');
  const [destinationFilter, setDestinationFilter] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [refreshing, setRefreshing] = useState(false);

  // Load all warehouse items
  const loadItems = async () => {
    try {
      setLoading(true);
      
      // Get items with different statuses
      const incomingItems = await warehouseItemService.getItemsByStatus('incoming');
      const receivedItems = await warehouseItemService.getItemsByStatus('received');
      const allocatedItems = await warehouseItemService.getItemsByStatus('allocated');
      const loadedItems = await warehouseItemService.getItemsByStatus('loaded');
      
      // Combine all items
      const allItems = [
        ...incomingItems,
        ...receivedItems,
        ...allocatedItems,
        ...loadedItems,
      ];
      
      setItems(allItems);
      applyFilters(allItems, searchQuery, statusFilter, locationFilter, destinationFilter);
    } catch (error) {
      console.error('Error loading inventory items:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  // Apply filters to items
  const applyFilters = (itemsToFilter, search, status, location, destination) => {
    let result = [...itemsToFilter];
    
    // Apply search filter
    if (search) {
      const query = search.toLowerCase();
      result = result.filter(item => 
        item.itemCode?.toLowerCase().includes(query) ||
        item.trackingNumber?.toLowerCase().includes(query) ||
        item.receiverName?.toLowerCase().includes(query) ||
        item.storageLocation?.toLowerCase().includes(query)
      );
    }
    
    // Apply status filter
    if (status && status !== 'all') {
      result = result.filter(item => item.status === status);
    }
    
    // Apply location filter
    if (location) {
      result = result.filter(item => 
        item.storageLocation?.toLowerCase().includes(location.toLowerCase())
      );
    }
    
    // Apply destination filter
    if (destination) {
      result = result.filter(item => 
        item.destinationBranchName?.toLowerCase().includes(destination.toLowerCase())
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let valueA = a[sortBy];
      let valueB = b[sortBy];
      
      // Handle date fields
      if (sortBy === 'createdAt' || sortBy === 'updatedAt' || 
          sortBy === 'processedAt' || sortBy === 'allocatedAt' || 
          sortBy === 'loadedAt') {
        valueA = valueA ? new Date(valueA).getTime() : 0;
        valueB = valueB ? new Date(valueB).getTime() : 0;
      }
      
      // Handle string fields
      if (typeof valueA === 'string') {
        valueA = valueA.toLowerCase();
      }
      if (typeof valueB === 'string') {
        valueB = valueB.toLowerCase();
      }
      
      // Sort based on order
      if (sortOrder === 'asc') {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });
    
    setFilteredItems(result);
  };

  // Handle search query change
  const handleSearchChange = (query) => {
    setSearchQuery(query);
    applyFilters(items, query, statusFilter, locationFilter, destinationFilter);
  };

  // Handle status filter change
  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    applyFilters(items, searchQuery, status, locationFilter, destinationFilter);
  };

  // Handle location filter change
  const handleLocationFilterChange = (location) => {
    setLocationFilter(location);
    applyFilters(items, searchQuery, statusFilter, location, destinationFilter);
  };

  // Handle destination filter change
  const handleDestinationFilterChange = (destination) => {
    setDestinationFilter(destination);
    applyFilters(items, searchQuery, statusFilter, locationFilter, destination);
  };

  // Handle sort change
  const handleSortChange = (field) => {
    // If same field, toggle order
    if (field === sortBy) {
      const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
      setSortOrder(newOrder);
      applyFilters(items, searchQuery, statusFilter, locationFilter, destinationFilter);
    } else {
      // New field, set to desc by default
      setSortBy(field);
      setSortOrder('desc');
      applyFilters(items, searchQuery, statusFilter, locationFilter, destinationFilter);
    }
    setMenuVisible(false);
  };

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    loadItems();
  };

  // Handle item selection
  const handleItemSelect = (item) => {
    navigation.navigate('WarehouseItemDetail', { itemId: item.id });
  };

  // Render item card
  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleItemSelect(item)}>
      <Card style={styles.itemCard}>
        <Card.Content>
          <View style={styles.itemHeader}>
            <Text style={styles.itemCode}>{item.itemCode}</Text>
            <ItemStatusBadge status={item.status} />
          </View>
          
          <Text style={styles.trackingNumber}>Tracking: {item.trackingNumber}</Text>
          
          <Divider style={styles.divider} />
          
          <View style={styles.itemDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Receiver:</Text>
              <Text style={styles.detailValue}>{item.receiverName}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Destination:</Text>
              <Text style={styles.detailValue}>{item.destinationBranchName}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Type:</Text>
              <Text style={styles.detailValue}>{item.itemType}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Weight:</Text>
              <Text style={styles.detailValue}>{item.weight} kg</Text>
            </View>
            
            {item.storageLocation && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Location:</Text>
                <Text style={styles.detailValue}>{item.storageLocation}</Text>
              </View>
            )}
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Processed:</Text>
              <Text style={styles.detailValue}>
                {item.processedAt ? new Date(item.processedAt).toLocaleDateString() : 'Not processed'}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Card style={styles.filterCard}>
        <Card.Content>
          <Searchbar
            placeholder="Search items..."
            onChangeText={handleSearchChange}
            value={searchQuery}
            style={styles.searchbar}
          />
          
          <View style={styles.filtersContainer}>
            <Text style={styles.filtersTitle}>Filters:</Text>
            
            <View style={styles.filterChips}>
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Status:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScrollView}>
                  <Chip
                    selected={statusFilter === 'all'}
                    onPress={() => handleStatusFilterChange('all')}
                    style={styles.chip}
                  >
                    All
                  </Chip>
                  <Chip
                    selected={statusFilter === 'incoming'}
                    onPress={() => handleStatusFilterChange('incoming')}
                    style={styles.chip}
                  >
                    Incoming
                  </Chip>
                  <Chip
                    selected={statusFilter === 'received'}
                    onPress={() => handleStatusFilterChange('received')}
                    style={styles.chip}
                  >
                    Received
                  </Chip>
                  <Chip
                    selected={statusFilter === 'allocated'}
                    onPress={() => handleStatusFilterChange('allocated')}
                    style={styles.chip}
                  >
                    Allocated
                  </Chip>
                  <Chip
                    selected={statusFilter === 'loaded'}
                    onPress={() => handleStatusFilterChange('loaded')}
                    style={styles.chip}
                  >
                    Loaded
                  </Chip>
                </ScrollView>
              </View>
              
              <View style={styles.inputFilters}>
                <TextInput
                  label="Location"
                  value={locationFilter}
                  onChangeText={handleLocationFilterChange}
                  style={styles.filterInput}
                  dense
                />
                
                <TextInput
                  label="Destination"
                  value={destinationFilter}
                  onChangeText={handleDestinationFilterChange}
                  style={styles.filterInput}
                  dense
                />
              </View>
            </View>
          </View>
          
          <View style={styles.sortContainer}>
            <Text style={styles.sortLabel}>Sort by:</Text>
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <Button 
                  mode="outlined" 
                  onPress={() => setMenuVisible(true)}
                  icon={sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'}
                >
                  {getSortByLabel(sortBy)}
                </Button>
              }
            >
              <Menu.Item onPress={() => handleSortChange('createdAt')} title="Date Created" />
              <Menu.Item onPress={() => handleSortChange('itemCode')} title="Item Code" />
              <Menu.Item onPress={() => handleSortChange('trackingNumber')} title="Tracking Number" />
              <Menu.Item onPress={() => handleSortChange('receiverName')} title="Receiver Name" />
              <Menu.Item onPress={() => handleSortChange('destinationBranchName')} title="Destination" />
              <Menu.Item onPress={() => handleSortChange('weight')} title="Weight" />
              <Menu.Item onPress={() => handleSortChange('storageLocation')} title="Storage Location" />
            </Menu>
          </View>
        </Card.Content>
      </Card>
      
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'} found
        </Text>
        <Button 
          icon="refresh" 
          mode="text" 
          onPress={handleRefresh}
          loading={refreshing}
        >
          Refresh
        </Button>
      </View>
      
      {loading && !refreshing ? (
        <ActivityIndicator size="large" color="#2563EB" style={styles.loader} />
      ) : (
        <FlatList
          data={filteredItems}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No items match your filters</Text>
          }
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      )}
    </View>
  );
};

// Helper function to get sort label
const getSortByLabel = (sortBy) => {
  const labels = {
    createdAt: 'Date Created',
    itemCode: 'Item Code',
    trackingNumber: 'Tracking Number',
    receiverName: 'Receiver Name',
    destinationBranchName: 'Destination',
    weight: 'Weight',
    storageLocation: 'Storage Location',
  };
  return labels[sortBy] || 'Date Created';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  filterCard: {
    margin: 16,
    elevation: 4,
  },
  searchbar: {
    marginBottom: 16,
  },
  filtersContainer: {
    marginBottom: 16,
  },
  filtersTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  filterChips: {
    marginBottom: 8,
  },
  filterSection: {
    marginBottom: 8,
  },
  chipScrollView: {
    flexGrow: 0,
  },
  filterLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
  },
  inputFilters: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  filterInput: {
    flex: 1,
    marginRight: 8,
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortLabel: {
    fontSize: 14,
    marginRight: 8,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  resultsCount: {
    fontSize: 14,
    color: '#666',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  itemCard: {
    marginBottom: 8,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemCode: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  trackingNumber: {
    fontSize: 14,
    color: '#666',
  },
  divider: {
    marginVertical: 8,
  },
  itemDetails: {
    marginTop: 8,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  detailLabel: {
    width: 80,
    fontWeight: 'bold',
  },
  detailValue: {
    flex: 1,
  },
  emptyText: {
    textAlign: 'center',
    marginVertical: 32,
    color: '#666',
  },
  loader: {
    marginTop: 32,
  },
});

export default InventoryView;
