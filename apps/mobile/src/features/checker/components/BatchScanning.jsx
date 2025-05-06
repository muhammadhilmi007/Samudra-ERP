import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, TouchableOpacity } from 'react-native';
import { Card, Button, TextInput, Divider, ActivityIndicator, FAB, Chip, Portal, Modal } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { batchScanningService } from '../services/batchScanningService';
import { warehouseItemService } from '../services/warehouseItemService';
import BarcodeScanner from './BarcodeScanner';
import ItemStatusBadge from './ItemStatusBadge';

const BatchScanning = ({ route }) => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [batchItems, setBatchItems] = useState([]);
  const [showScanner, setShowScanner] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newBatchData, setNewBatchData] = useState({
    batchType: 'incoming',
    location: '',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load batches
  const loadBatches = async () => {
    try {
      setLoading(true);
      const pendingBatches = await batchScanningService.getBatchesByStatus('pending');
      setBatches(pendingBatches);
    } catch (error) {
      console.error('Error loading batches:', error);
      Alert.alert('Error', 'Failed to load batches: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBatches();
  }, []);

  // Load batch items
  const loadBatchItems = async (batchId) => {
    try {
      setLoading(true);
      const items = await batchScanningService.getItemsInBatch(batchId);
      setBatchItems(items);
    } catch (error) {
      console.error('Error loading batch items:', error);
      Alert.alert('Error', 'Failed to load batch items: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBatchSelect = (batch) => {
    setSelectedBatch(batch);
    loadBatchItems(batch.id);
  };

  const handleBarcodeScan = async (data) => {
    if (!selectedBatch) {
      Alert.alert('Error', 'Please select a batch first.');
      return;
    }

    try {
      // Find item by tracking number or item code
      const items = await warehouseItemService.getItemsByStatus('incoming');
      const item = items.find(i => i.trackingNumber === data || i.itemCode === data);
      
      if (item) {
        // Add item to batch
        await batchScanningService.addItemToBatch(selectedBatch.id, item.id);
        
        // Refresh batch items
        loadBatchItems(selectedBatch.id);
        
        Alert.alert('Success', 'Item added to batch successfully.');
      } else {
        Alert.alert('Not Found', 'Item not found with the scanned code.');
      }
    } catch (error) {
      console.error('Error processing scanned item:', error);
      Alert.alert('Error', 'Failed to process scanned item: ' + error.message);
    }
  };

  const handleCreateBatch = async () => {
    try {
      setIsSubmitting(true);
      
      // Create new batch
      await batchScanningService.createBatch({
        ...newBatchData,
        processedBy: route?.params?.userId || 'unknown',
      });
      
      // Close modal and refresh batches
      setShowCreateModal(false);
      setNewBatchData({
        batchType: 'incoming',
        location: '',
        notes: '',
      });
      loadBatches();
      
      Alert.alert('Success', 'Batch created successfully.');
    } catch (error) {
      console.error('Error creating batch:', error);
      Alert.alert('Error', 'Failed to create batch: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProcessBatch = async () => {
    if (!selectedBatch) {
      return;
    }

    if (batchItems.length === 0) {
      Alert.alert('Error', 'Cannot process an empty batch.');
      return;
    }

    try {
      await batchScanningService.processBatch(
        selectedBatch.id,
        route?.params?.userId || 'unknown'
      );
      
      Alert.alert(
        'Success',
        'Batch processed successfully.',
        [
          {
            text: 'OK',
            onPress: () => {
              setSelectedBatch(null);
              setBatchItems([]);
              loadBatches();
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error processing batch:', error);
      Alert.alert('Error', 'Failed to process batch: ' + error.message);
    }
  };

  const handleCancelBatch = async () => {
    if (!selectedBatch) {
      return;
    }

    Alert.alert(
      'Confirm Cancellation',
      'Are you sure you want to cancel this batch?',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: async () => {
            try {
              await batchScanningService.cancelBatch(selectedBatch.id);
              
              Alert.alert(
                'Success',
                'Batch cancelled successfully.',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      setSelectedBatch(null);
                      setBatchItems([]);
                      loadBatches();
                    },
                  },
                ]
              );
            } catch (error) {
              console.error('Error cancelling batch:', error);
              Alert.alert('Error', 'Failed to cancel batch: ' + error.message);
            }
          },
        },
      ]
    );
  };

  const filteredBatches = batches.filter(batch => {
    const query = searchQuery.toLowerCase();
    return (
      batch.batchCode?.toLowerCase().includes(query) ||
      batch.location?.toLowerCase().includes(query) ||
      batch.processedBy?.toLowerCase().includes(query)
    );
  });

  const renderBatchItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleBatchSelect(item)}>
      <Card 
        style={[
          styles.batchCard, 
          selectedBatch?.id === item.id && styles.selectedCard
        ]}
      >
        <Card.Content>
          <View style={styles.batchHeader}>
            <Text style={styles.batchCode}>{item.batchCode}</Text>
            <ItemStatusBadge status={item.status} />
          </View>
          
          <Divider style={styles.divider} />
          
          <View style={styles.batchDetails}>
            <Text>Type: {item.batchType === 'incoming' ? 'Incoming' : 'Outgoing'}</Text>
            <Text>Location: {item.location || 'Not specified'}</Text>
            <Text>Created: {new Date(item.createdAt).toLocaleString()}</Text>
            {item.notes && <Text>Notes: {item.notes}</Text>}
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  const renderBatchItemItem = ({ item }) => (
    <Card style={styles.itemCard}>
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
  );

  return (
    <View style={styles.container}>
      {!selectedBatch ? (
        // Batch list view
        <>
          <Card style={styles.card}>
            <Card.Title title="Batch Scanning" />
            <Card.Content>
              <TextInput
                label="Search Batches"
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={styles.searchInput}
                right={<TextInput.Icon icon="magnify" />}
              />
            </Card.Content>
          </Card>
          
          {loading ? (
            <ActivityIndicator size="large" color="#2563EB" style={styles.loader} />
          ) : (
            <FlatList
              data={filteredBatches}
              renderItem={renderBatchItem}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.listContainer}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No pending batches available</Text>
              }
            />
          )}
          
          <FAB
            style={styles.fab}
            icon="plus"
            onPress={() => setShowCreateModal(true)}
            label="Create Batch"
          />
        </>
      ) : (
        // Batch items view
        <>
          <Card style={styles.card}>
            <Card.Title 
              title={`Batch: ${selectedBatch.batchCode}`}
              subtitle={`${selectedBatch.batchType === 'incoming' ? 'Incoming' : 'Outgoing'} - ${selectedBatch.location || 'No location'}`}
            />
            <Card.Content>
              <View style={styles.batchActions}>
                <Button
                  mode="outlined"
                  icon="arrow-left"
                  onPress={() => {
                    setSelectedBatch(null);
                    setBatchItems([]);
                  }}
                  style={styles.backButton}
                >
                  Back to Batches
                </Button>
                
                <Button
                  mode="contained"
                  icon="barcode-scan"
                  onPress={() => setShowScanner(true)}
                  style={styles.scanButton}
                >
                  Scan Item
                </Button>
              </View>
              
              <Divider style={styles.divider} />
              
              <View style={styles.batchSummary}>
                <Text style={styles.summaryTitle}>Batch Summary</Text>
                <Text>Total Items: {batchItems.length}</Text>
                <Text>Created: {new Date(selectedBatch.createdAt).toLocaleString()}</Text>
                {selectedBatch.notes && <Text>Notes: {selectedBatch.notes}</Text>}
              </View>
              
              <View style={styles.batchActionButtons}>
                <Button
                  mode="contained"
                  icon="check"
                  onPress={handleProcessBatch}
                  style={[styles.actionButton, styles.processButton]}
                  disabled={batchItems.length === 0}
                >
                  Process Batch
                </Button>
                
                <Button
                  mode="outlined"
                  icon="close"
                  onPress={handleCancelBatch}
                  style={[styles.actionButton, styles.cancelButton]}
                  color="#f44336"
                >
                  Cancel Batch
                </Button>
              </View>
            </Card.Content>
          </Card>
          
          <Text style={styles.itemsTitle}>Batch Items ({batchItems.length})</Text>
          
          {loading ? (
            <ActivityIndicator size="large" color="#2563EB" style={styles.loader} />
          ) : (
            <FlatList
              data={batchItems}
              renderItem={renderBatchItemItem}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.listContainer}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No items in this batch</Text>
              }
            />
          )}
        </>
      )}
      
      {/* Barcode Scanner Modal */}
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
      
      {/* Create Batch Modal */}
      <Portal>
        <Modal
          visible={showCreateModal}
          onDismiss={() => setShowCreateModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Card>
            <Card.Title title="Create Batch" />
            <Card.Content>
              <Text style={styles.label}>Batch Type:</Text>
              <View style={styles.chipContainer}>
                <Chip
                  selected={newBatchData.batchType === 'incoming'}
                  onPress={() => setNewBatchData({...newBatchData, batchType: 'incoming'})}
                  style={styles.chip}
                >
                  Incoming
                </Chip>
                <Chip
                  selected={newBatchData.batchType === 'outgoing'}
                  onPress={() => setNewBatchData({...newBatchData, batchType: 'outgoing'})}
                  style={styles.chip}
                >
                  Outgoing
                </Chip>
              </View>
              
              <TextInput
                label="Location"
                value={newBatchData.location}
                onChangeText={(text) => setNewBatchData({...newBatchData, location: text})}
                style={styles.input}
              />
              
              <TextInput
                label="Notes"
                value={newBatchData.notes}
                onChangeText={(text) => setNewBatchData({...newBatchData, notes: text})}
                style={styles.input}
                multiline
              />
              
              <View style={styles.modalButtons}>
                <Button
                  mode="outlined"
                  onPress={() => setShowCreateModal(false)}
                  style={styles.modalButton}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={handleCreateBatch}
                  style={styles.modalButton}
                  loading={isSubmitting}
                  disabled={isSubmitting}
                >
                  Create
                </Button>
              </View>
            </Card.Content>
          </Card>
        </Modal>
      </Portal>
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
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 80, // Extra padding for FAB
  },
  batchCard: {
    marginBottom: 8,
  },
  selectedCard: {
    backgroundColor: '#e6f2ff',
    borderColor: '#2563EB',
    borderWidth: 1,
  },
  batchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  batchCode: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  divider: {
    marginVertical: 8,
  },
  batchDetails: {
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
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#2563EB',
  },
  batchActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  backButton: {
    flex: 1,
    marginRight: 8,
  },
  scanButton: {
    flex: 1,
    marginLeft: 8,
  },
  batchSummary: {
    marginTop: 8,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  batchActionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
  },
  processButton: {
    marginRight: 8,
  },
  cancelButton: {
    marginLeft: 8,
  },
  itemsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 16,
    marginBottom: 8,
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
  itemDetails: {
    marginTop: 8,
  },
  modalContainer: {
    padding: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
  },
  input: {
    marginBottom: 8,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  modalButton: {
    marginLeft: 8,
  },
});

export default BatchScanning;
