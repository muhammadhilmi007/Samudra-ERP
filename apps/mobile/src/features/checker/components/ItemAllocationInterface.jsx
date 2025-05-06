import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, TouchableOpacity } from 'react-native';
import { Card, Button, TextInput, Divider, Chip, ActivityIndicator } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { itemAllocationService } from '../services/itemAllocationService';
import { warehouseItemService } from '../services/warehouseItemService';
import BarcodeScanner from './BarcodeScanner';
import ItemStatusBadge from './ItemStatusBadge';

const ItemAllocationInterface = ({ route }) => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [showScanner, setShowScanner] = useState(false);
  const [scannerTarget, setScannerTarget] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [allocationType, setAllocationType] = useState('shipment');
  const [allocationId, setAllocationId] = useState('');
  const [allocationName, setAllocationName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load items that can be allocated (items with status 'received' or 'incoming')
  const loadItems = async () => {
    try {
      setLoading(true);
      const receivedItems = await warehouseItemService.getItemsByStatus('received');
      const incomingItems = await warehouseItemService.getItemsByStatus('incoming');
      setItems([...receivedItems, ...incomingItems]);
    } catch (error) {
      console.error('Error loading items:', error);
      Alert.alert('Error', 'Failed to load items: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleItemSelect = (item) => {
    if (selectedItems.some(selected => selected.id === item.id)) {
      setSelectedItems(selectedItems.filter(selected => selected.id !== item.id));
    } else {
      setSelectedItems([...selectedItems, item]);
    }
  };

  const handleBarcodeScan = (data) => {
    if (scannerTarget === 'item') {
      // Find item by tracking number or item code
      const item = items.find(
        i => i.trackingNumber === data || i.itemCode === data
      );
      
      if (item) {
        handleItemSelect(item);
      } else {
        Alert.alert('Not Found', 'Item not found with the scanned code.');
      }
    } else if (scannerTarget === 'allocation') {
      // Assuming the barcode format is "id:name"
      const [id, name] = data.split(':');
      setAllocationId(id);
      setAllocationName(name);
    }
  };

  const handleAllocateItems = async () => {
    if (selectedItems.length === 0) {
      Alert.alert('Error', 'Please select at least one item to allocate.');
      return;
    }

    if (!allocationId || !allocationName) {
      Alert.alert('Error', 'Please provide allocation details.');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Allocate each selected item
      const allocationPromises = selectedItems.map(item => 
        itemAllocationService.allocateItem(item.id, {
          allocationType,
          allocationId,
          allocationName,
          allocatedBy: route?.params?.userId || 'unknown',
          notes: `Allocated to ${allocationType} ${allocationName}`,
        })
      );
      
      await Promise.all(allocationPromises);
      
      Alert.alert(
        'Success',
        `${selectedItems.length} items have been allocated successfully.`,
        [
          {
            text: 'OK',
            onPress: () => {
              setSelectedItems([]);
              loadItems(); // Refresh the list
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error allocating items:', error);
      Alert.alert('Error', 'Failed to allocate items: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredItems = items.filter(item => {
    const query = searchQuery.toLowerCase();
    return (
      item.itemCode?.toLowerCase().includes(query) ||
      item.trackingNumber?.toLowerCase().includes(query) ||
      item.receiverName?.toLowerCase().includes(query) ||
      item.destinationBranchName?.toLowerCase().includes(query)
    );
  });

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleItemSelect(item)}>
      <Card 
        style={[
          styles.itemCard, 
          selectedItems.some(selected => selected.id === item.id) && styles.selectedCard
        ]}
      >
        <Card.Content>
          <View style={styles.itemHeader}>
            <Text style={styles.itemCode}>{item.itemCode}</Text>
            <ItemStatusBadge status={item.status} />
          </View>
          
          <Text style={styles.trackingNumber}>Tracking: {item.trackingNumber}</Text>
          
          <Divider style={styles.divider} />
          
          <View style={styles.itemDetails}>
            <Text>To: {item.receiverName}</Text>
            <Text>Destination: {item.destinationBranchName}</Text>
            <Text>Type: {item.itemType}</Text>
            <Text>Weight: {item.weight} kg</Text>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Title title="Item Allocation" />
        <Card.Content>
          <TextInput
            label="Search Items"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
            right={<TextInput.Icon icon="magnify" />}
          />
          
          <View style={styles.scanButtonContainer}>
            <Button
              mode="contained"
              icon="barcode-scan"
              onPress={() => {
                setScannerTarget('item');
                setShowScanner(true);
              }}
              style={styles.scanButton}
            >
              Scan Item
            </Button>
          </View>
          
          <Text style={styles.sectionTitle}>Allocation Details</Text>
          
          <View style={styles.allocationTypeContainer}>
            <Text style={styles.label}>Allocation Type:</Text>
            <View style={styles.chipContainer}>
              <Chip
                selected={allocationType === 'shipment'}
                onPress={() => setAllocationType('shipment')}
                style={styles.chip}
              >
                Shipment
              </Chip>
              <Chip
                selected={allocationType === 'delivery_route'}
                onPress={() => setAllocationType('delivery_route')}
                style={styles.chip}
              >
                Delivery Route
              </Chip>
            </View>
          </View>
          
          <View style={styles.allocationIdContainer}>
            <TextInput
              label="Allocation ID"
              value={allocationId}
              onChangeText={setAllocationId}
              style={styles.allocationInput}
            />
            <Button
              mode="contained"
              icon="barcode-scan"
              onPress={() => {
                setScannerTarget('allocation');
                setShowScanner(true);
              }}
              style={styles.scanAllocationButton}
            >
              Scan
            </Button>
          </View>
          
          <TextInput
            label="Allocation Name"
            value={allocationName}
            onChangeText={setAllocationName}
            style={styles.input}
          />
          
          <Divider style={styles.divider} />
          
          <Text style={styles.sectionTitle}>Selected Items ({selectedItems.length})</Text>
          
          {selectedItems.length > 0 ? (
            <View style={styles.selectedItemsContainer}>
              {selectedItems.map(item => (
                <Chip
                  key={item.id}
                  onClose={() => handleItemSelect(item)}
                  style={styles.selectedItemChip}
                >
                  {item.itemCode}
                </Chip>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>No items selected</Text>
          )}
          
          <Button
            mode="contained"
            onPress={handleAllocateItems}
            style={styles.allocateButton}
            loading={isSubmitting}
            disabled={isSubmitting || selectedItems.length === 0 || !allocationId}
          >
            Allocate Items
          </Button>
        </Card.Content>
      </Card>
      
      <Text style={styles.listTitle}>Available Items ({filteredItems.length})</Text>
      
      {loading ? (
        <ActivityIndicator size="large" color="#2563EB" style={styles.loader} />
      ) : (
        <FlatList
          data={filteredItems}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No items available for allocation</Text>
          }
        />
      )}
      
      {showScanner && (
        <BarcodeScanner
          isVisible={showScanner}
          onClose={() => setShowScanner(false)}
          onCodeScanned={(data) => {
            setShowScanner(false);
            handleBarcodeScan(data);
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 16,
    elevation: 4,
  },
  searchInput: {
    marginBottom: 8,
  },
  scanButtonContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  scanButton: {
    width: '50%',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  allocationTypeContainer: {
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
  },
  allocationIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  allocationInput: {
    flex: 1,
    marginRight: 8,
  },
  scanAllocationButton: {
    height: 50,
    justifyContent: 'center',
  },
  input: {
    marginBottom: 8,
  },
  divider: {
    marginVertical: 16,
  },
  selectedItemsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  selectedItemChip: {
    margin: 4,
  },
  allocateButton: {
    marginTop: 8,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 16,
    marginBottom: 8,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  itemCard: {
    marginBottom: 8,
  },
  selectedCard: {
    backgroundColor: '#e6f2ff',
    borderColor: '#2563EB',
    borderWidth: 1,
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
  itemDetails: {
    marginTop: 8,
  },
  emptyText: {
    textAlign: 'center',
    marginVertical: 16,
    color: '#666',
  },
  loader: {
    marginTop: 32,
  },
});

export default ItemAllocationInterface;
