import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, TouchableOpacity } from 'react-native';
import { Card, Button, TextInput, Divider, ActivityIndicator, FAB, Modal, Portal } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { loadingManagementService } from '../services/loadingManagementService';
import { itemAllocationService } from '../services/itemAllocationService';
import BarcodeScanner from './BarcodeScanner';
import ItemStatusBadge from './ItemStatusBadge';

const LoadingManagement = ({ route }) => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [manifests, setManifests] = useState([]);
  const [selectedManifest, setSelectedManifest] = useState(null);
  const [loadingItems, setLoadingItems] = useState([]);
  const [showScanner, setShowScanner] = useState(false);
  const [scannerTarget, setScannerTarget] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newManifestData, setNewManifestData] = useState({
    vehicleId: '',
    vehicleNumber: '',
    driverId: '',
    driverName: '',
    destinationType: 'branch',
    destinationId: '',
    destinationName: '',
    scheduledDeparture: new Date().getTime(),
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load manifests
  const loadManifests = async () => {
    try {
      setLoading(true);
      const pendingManifests = await loadingManagementService.getManifestsByStatus('pending');
      const inProgressManifests = await loadingManagementService.getManifestsByStatus('in_progress');
      setManifests([...pendingManifests, ...inProgressManifests]);
    } catch (error) {
      console.error('Error loading manifests:', error);
      Alert.alert('Error', 'Failed to load manifests: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadManifests();
  }, []);

  // Load loading items for a manifest
  const loadLoadingItems = async (manifestId) => {
    try {
      setLoading(true);
      const items = await loadingManagementService.getLoadingItemsInManifest(manifestId);
      setLoadingItems(items);
    } catch (error) {
      console.error('Error loading loading items:', error);
      Alert.alert('Error', 'Failed to load loading items: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleManifestSelect = (manifest) => {
    setSelectedManifest(manifest);
    loadLoadingItems(manifest.id);
  };

  const handleBarcodeScan = async (data) => {
    if (scannerTarget === 'item') {
      if (!selectedManifest) {
        Alert.alert('Error', 'Please select a manifest first.');
        return;
      }

      try {
        // Find allocations by tracking number or item code
        const allocations = await itemAllocationService.getAllocationsByStatus('confirmed');
        const matchingAllocation = allocations.find(allocation => {
          const item = allocation.warehouseItem;
          return item && (item.trackingNumber === data || item.itemCode === data);
        });

        if (matchingAllocation) {
          // Add item to manifest
          await loadingManagementService.addItemToManifest(
            selectedManifest.id,
            matchingAllocation.warehouseItemId,
            {
              loadedBy: route?.params?.userId || 'unknown',
            }
          );
          
          // Refresh loading items
          loadLoadingItems(selectedManifest.id);
          
          Alert.alert('Success', 'Item added to manifest successfully.');
        } else {
          Alert.alert('Not Found', 'No allocated item found with the scanned code.');
        }
      } catch (error) {
        console.error('Error processing scanned item:', error);
        Alert.alert('Error', 'Failed to process scanned item: ' + error.message);
      }
    } else if (scannerTarget === 'vehicle') {
      // Assuming the barcode format is "id:number"
      const [id, number] = data.split(':');
      setNewManifestData({
        ...newManifestData,
        vehicleId: id,
        vehicleNumber: number,
      });
    } else if (scannerTarget === 'driver') {
      // Assuming the barcode format is "id:name"
      const [id, name] = data.split(':');
      setNewManifestData({
        ...newManifestData,
        driverId: id,
        driverName: name,
      });
    } else if (scannerTarget === 'destination') {
      // Assuming the barcode format is "id:name"
      const [id, name] = data.split(':');
      setNewManifestData({
        ...newManifestData,
        destinationId: id,
        destinationName: name,
      });
    }
  };

  const handleCreateManifest = async () => {
    // Validate manifest data
    if (!newManifestData.vehicleId || !newManifestData.driverId || !newManifestData.destinationId) {
      Alert.alert('Error', 'Please provide all required manifest details.');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Create new manifest
      await loadingManagementService.createManifest({
        ...newManifestData,
        createdBy: route?.params?.userId || 'unknown',
      });
      
      // Close modal and refresh manifests
      setShowCreateModal(false);
      setNewManifestData({
        vehicleId: '',
        vehicleNumber: '',
        driverId: '',
        driverName: '',
        destinationType: 'branch',
        destinationId: '',
        destinationName: '',
        scheduledDeparture: new Date().getTime(),
      });
      loadManifests();
      
      Alert.alert('Success', 'Loading manifest created successfully.');
    } catch (error) {
      console.error('Error creating manifest:', error);
      Alert.alert('Error', 'Failed to create manifest: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkAsLoaded = async (loadingItemId) => {
    try {
      await loadingManagementService.markItemAsLoaded(
        loadingItemId,
        route?.params?.userId || 'unknown'
      );
      
      // Refresh loading items
      loadLoadingItems(selectedManifest.id);
    } catch (error) {
      console.error('Error marking item as loaded:', error);
      Alert.alert('Error', 'Failed to mark item as loaded: ' + error.message);
    }
  };

  const handleCompleteManifest = async () => {
    if (!selectedManifest) {
      return;
    }

    // Check if all items are loaded
    const allLoaded = loadingItems.every(item => item.status === 'loaded');
    
    if (!allLoaded) {
      Alert.alert(
        'Warning',
        'Not all items are loaded. Do you want to continue?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Continue',
            onPress: async () => {
              try {
                await loadingManagementService.completeManifest(selectedManifest.id);
                Alert.alert('Success', 'Manifest completed successfully.');
                setSelectedManifest(null);
                setLoadingItems([]);
                loadManifests();
              } catch (error) {
                console.error('Error completing manifest:', error);
                Alert.alert('Error', 'Failed to complete manifest: ' + error.message);
              }
            },
          },
        ]
      );
    } else {
      try {
        await loadingManagementService.completeManifest(selectedManifest.id);
        Alert.alert('Success', 'Manifest completed successfully.');
        setSelectedManifest(null);
        setLoadingItems([]);
        loadManifests();
      } catch (error) {
        console.error('Error completing manifest:', error);
        Alert.alert('Error', 'Failed to complete manifest: ' + error.message);
      }
    }
  };

  const filteredManifests = manifests.filter(manifest => {
    const query = searchQuery.toLowerCase();
    return (
      manifest.manifestCode?.toLowerCase().includes(query) ||
      manifest.vehicleNumber?.toLowerCase().includes(query) ||
      manifest.driverName?.toLowerCase().includes(query) ||
      manifest.destinationName?.toLowerCase().includes(query)
    );
  });

  const renderManifestItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleManifestSelect(item)}>
      <Card 
        style={[
          styles.manifestCard, 
          selectedManifest?.id === item.id && styles.selectedCard
        ]}
      >
        <Card.Content>
          <View style={styles.manifestHeader}>
            <Text style={styles.manifestCode}>{item.manifestCode}</Text>
            <ItemStatusBadge status={item.status} />
          </View>
          
          <Divider style={styles.divider} />
          
          <View style={styles.manifestDetails}>
            <Text>Vehicle: {item.vehicleNumber}</Text>
            <Text>Driver: {item.driverName}</Text>
            <Text>Destination: {item.destinationName}</Text>
            <Text>Scheduled: {new Date(item.scheduledDeparture).toLocaleString()}</Text>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  const renderLoadingItem = ({ item }) => (
    <Card style={styles.loadingItemCard}>
      <Card.Content>
        <View style={styles.loadingItemHeader}>
          <Text style={styles.itemCode}>{item.itemCode}</Text>
          <ItemStatusBadge status={item.status} />
        </View>
        
        <Text style={styles.trackingNumber}>Tracking: {item.trackingNumber}</Text>
        
        <Divider style={styles.divider} />
        
        <View style={styles.loadingItemDetails}>
          <Text>Position: {item.loadingPosition || 'Not specified'}</Text>
          <Text>Loaded by: {item.loadedBy || 'Not loaded'}</Text>
          <Text>Loaded at: {item.loadedAt ? new Date(item.loadedAt).toLocaleString() : 'Not loaded'}</Text>
        </View>
        
        {item.status !== 'loaded' && (
          <Button
            mode="contained"
            onPress={() => handleMarkAsLoaded(item.id)}
            style={styles.loadButton}
          >
            Mark as Loaded
          </Button>
        )}
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      {!selectedManifest ? (
        // Manifest list view
        <>
          <Card style={styles.card}>
            <Card.Title title="Loading Manifests" />
            <Card.Content>
              <TextInput
                label="Search Manifests"
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
              data={filteredManifests}
              renderItem={renderManifestItem}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.listContainer}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No loading manifests available</Text>
              }
            />
          )}
          
          <FAB
            style={styles.fab}
            icon="plus"
            onPress={() => setShowCreateModal(true)}
            label="Create Manifest"
          />
        </>
      ) : (
        // Loading items view
        <>
          <Card style={styles.card}>
            <Card.Title 
              title={`Manifest: ${selectedManifest.manifestCode}`}
              subtitle={`${selectedManifest.destinationName} - ${selectedManifest.vehicleNumber}`}
            />
            <Card.Content>
              <View style={styles.manifestActions}>
                <Button
                  mode="outlined"
                  icon="arrow-left"
                  onPress={() => {
                    setSelectedManifest(null);
                    setLoadingItems([]);
                  }}
                  style={styles.backButton}
                >
                  Back to Manifests
                </Button>
                
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
              
              <Divider style={styles.divider} />
              
              <View style={styles.manifestSummary}>
                <Text style={styles.summaryTitle}>Loading Summary</Text>
                <Text>Total Items: {loadingItems.length}</Text>
                <Text>Loaded: {loadingItems.filter(item => item.status === 'loaded').length}</Text>
                <Text>Pending: {loadingItems.filter(item => item.status === 'pending').length}</Text>
              </View>
            </Card.Content>
          </Card>
          
          {loading ? (
            <ActivityIndicator size="large" color="#2563EB" style={styles.loader} />
          ) : (
            <FlatList
              data={loadingItems}
              renderItem={renderLoadingItem}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.listContainer}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No items in this manifest</Text>
              }
            />
          )}
          
          <FAB
            style={styles.fab}
            icon="check"
            onPress={handleCompleteManifest}
            label="Complete Loading"
            disabled={loadingItems.length === 0}
          />
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
      
      {/* Create Manifest Modal */}
      <Portal>
        <Modal
          visible={showCreateModal}
          onDismiss={() => setShowCreateModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Card>
            <Card.Title title="Create Loading Manifest" />
            <Card.Content>
              <View style={styles.scannerRow}>
                <TextInput
                  label="Vehicle Number *"
                  value={newManifestData.vehicleNumber}
                  onChangeText={(text) => setNewManifestData({...newManifestData, vehicleNumber: text})}
                  style={styles.input}
                />
                <TouchableOpacity
                  style={styles.scanButton}
                  onPress={() => {
                    setScannerTarget('vehicle');
                    setShowScanner(true);
                  }}
                >
                  <Text style={styles.scanButtonText}>Scan</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.scannerRow}>
                <TextInput
                  label="Driver Name *"
                  value={newManifestData.driverName}
                  onChangeText={(text) => setNewManifestData({...newManifestData, driverName: text})}
                  style={styles.input}
                />
                <TouchableOpacity
                  style={styles.scanButton}
                  onPress={() => {
                    setScannerTarget('driver');
                    setShowScanner(true);
                  }}
                >
                  <Text style={styles.scanButtonText}>Scan</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.scannerRow}>
                <TextInput
                  label="Destination *"
                  value={newManifestData.destinationName}
                  onChangeText={(text) => setNewManifestData({...newManifestData, destinationName: text})}
                  style={styles.input}
                />
                <TouchableOpacity
                  style={styles.scanButton}
                  onPress={() => {
                    setScannerTarget('destination');
                    setShowScanner(true);
                  }}
                >
                  <Text style={styles.scanButtonText}>Scan</Text>
                </TouchableOpacity>
              </View>
              
              <TextInput
                label="Notes"
                value={newManifestData.notes}
                onChangeText={(text) => setNewManifestData({...newManifestData, notes: text})}
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
                  onPress={handleCreateManifest}
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
  manifestCard: {
    marginBottom: 8,
  },
  selectedCard: {
    backgroundColor: '#e6f2ff',
    borderColor: '#2563EB',
    borderWidth: 1,
  },
  manifestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  manifestCode: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  divider: {
    marginVertical: 8,
  },
  manifestDetails: {
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
  manifestActions: {
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
  manifestSummary: {
    marginTop: 8,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  loadingItemCard: {
    marginBottom: 8,
  },
  loadingItemHeader: {
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
  loadingItemDetails: {
    marginTop: 8,
    marginBottom: 8,
  },
  loadButton: {
    marginTop: 8,
  },
  modalContainer: {
    padding: 16,
  },
  input: {
    marginBottom: 8,
    flex: 1,
  },
  scannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  scanButtonText: {
    color: 'white',
    fontWeight: 'bold',
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

export default LoadingManagement;
