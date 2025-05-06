import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Appbar, Card, Title, Paragraph, Divider, Button, ActivityIndicator, Chip, TextInput } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { warehouseItemService } from '../../features/checker/services/warehouseItemService';
import { itemAllocationService } from '../../features/checker/services/itemAllocationService';
import ItemStatusBadge from '../../features/checker/components/ItemStatusBadge';
import DocumentGallery from '../../features/checker/components/DocumentGallery';

const WarehouseItemDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { itemId } = route.params;
  
  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({
    storageLocation: '',
    notes: '',
  });

  useEffect(() => {
    loadItemData();
  }, [itemId]);

  const loadItemData = async () => {
    try {
      setLoading(true);
      
      // Load item details
      const itemData = await warehouseItemService.getItemById(itemId);
      setItem(itemData);
      
      // Initialize edit data
      setEditData({
        storageLocation: itemData.storageLocation || '',
        notes: itemData.notes || '',
      });
      
      // Load item photos
      const itemPhotos = await warehouseItemService.getItemPhotos(itemId);
      setPhotos(itemPhotos);
      
      // Load allocations
      const itemAllocations = await itemAllocationService.getAllocationsByItem(itemId);
      setAllocations(itemAllocations);
    } catch (error) {
      console.error('Error loading item data:', error);
      Alert.alert('Error', 'Failed to load item data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    try {
      setLoading(true);
      
      // Update item
      await warehouseItemService.updateItem(itemId, editData);
      
      // Reload item data
      await loadItemData();
      
      // Exit edit mode
      setEditMode(false);
      
      Alert.alert('Success', 'Item updated successfully.');
    } catch (error) {
      console.error('Error updating item:', error);
      Alert.alert('Error', 'Failed to update item: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Not available';
    return new Date(timestamp).toLocaleString();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (!item) {
    return (
      <View style={styles.errorContainer}>
        <Title>Item not found</Title>
        <Button mode="contained" onPress={() => navigation.goBack()}>
          Go Back
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={`Item: ${item.itemCode}`} />
        {!editMode ? (
          <Appbar.Action icon="pencil" onPress={() => setEditMode(true)} />
        ) : (
          <Appbar.Action icon="check" onPress={handleSaveChanges} />
        )}
      </Appbar.Header>
      
      <ScrollView style={styles.content}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.headerRow}>
              <Title style={styles.title}>{item.itemCode}</Title>
              <ItemStatusBadge status={item.status} />
            </View>
            
            <Paragraph style={styles.trackingNumber}>
              Tracking Number: {item.trackingNumber}
            </Paragraph>
            
            <Divider style={styles.divider} />
            
            <View style={styles.section}>
              <Title style={styles.sectionTitle}>Item Details</Title>
              
              <View style={styles.detailRow}>
                <Paragraph style={styles.detailLabel}>Type:</Paragraph>
                <Paragraph style={styles.detailValue}>{item.itemType}</Paragraph>
              </View>
              
              <View style={styles.detailRow}>
                <Paragraph style={styles.detailLabel}>Weight:</Paragraph>
                <Paragraph style={styles.detailValue}>{item.weight} kg</Paragraph>
              </View>
              
              <View style={styles.detailRow}>
                <Paragraph style={styles.detailLabel}>Dimensions:</Paragraph>
                <Paragraph style={styles.detailValue}>
                  {item.length} x {item.width} x {item.height} cm
                </Paragraph>
              </View>
              
              <View style={styles.detailRow}>
                <Paragraph style={styles.detailLabel}>Volumetric Weight:</Paragraph>
                <Paragraph style={styles.detailValue}>{item.volumetricWeight} kg</Paragraph>
              </View>
              
              <View style={styles.detailRow}>
                <Paragraph style={styles.detailLabel}>Condition:</Paragraph>
                <Paragraph style={styles.detailValue}>{item.condition}</Paragraph>
              </View>
              
              {item.damageDescription && (
                <View style={styles.detailRow}>
                  <Paragraph style={styles.detailLabel}>Damage:</Paragraph>
                  <Paragraph style={styles.detailValue}>{item.damageDescription}</Paragraph>
                </View>
              )}
            </View>
            
            <Divider style={styles.divider} />
            
            <View style={styles.section}>
              <Title style={styles.sectionTitle}>Receiver Information</Title>
              
              <View style={styles.detailRow}>
                <Paragraph style={styles.detailLabel}>Name:</Paragraph>
                <Paragraph style={styles.detailValue}>{item.receiverName}</Paragraph>
              </View>
              
              <View style={styles.detailRow}>
                <Paragraph style={styles.detailLabel}>Address:</Paragraph>
                <Paragraph style={styles.detailValue}>{item.receiverAddress}</Paragraph>
              </View>
              
              <View style={styles.detailRow}>
                <Paragraph style={styles.detailLabel}>Phone:</Paragraph>
                <Paragraph style={styles.detailValue}>{item.receiverPhone}</Paragraph>
              </View>
              
              <View style={styles.detailRow}>
                <Paragraph style={styles.detailLabel}>Destination:</Paragraph>
                <Paragraph style={styles.detailValue}>{item.destinationBranchName}</Paragraph>
              </View>
            </View>
            
            <Divider style={styles.divider} />
            
            <View style={styles.section}>
              <Title style={styles.sectionTitle}>Warehouse Information</Title>
              
              {editMode ? (
                <TextInput
                  label="Storage Location"
                  value={editData.storageLocation}
                  onChangeText={(text) => setEditData({...editData, storageLocation: text})}
                  style={styles.input}
                />
              ) : (
                <View style={styles.detailRow}>
                  <Paragraph style={styles.detailLabel}>Storage Location:</Paragraph>
                  <Paragraph style={styles.detailValue}>
                    {item.storageLocation || 'Not assigned'}
                  </Paragraph>
                </View>
              )}
              
              <View style={styles.detailRow}>
                <Paragraph style={styles.detailLabel}>Source:</Paragraph>
                <Paragraph style={styles.detailValue}>
                  {item.sourceType === 'pickup' ? 'Pickup' : 'Incoming Shipment'}
                </Paragraph>
              </View>
              
              <View style={styles.detailRow}>
                <Paragraph style={styles.detailLabel}>Processed At:</Paragraph>
                <Paragraph style={styles.detailValue}>{formatDate(item.processedAt)}</Paragraph>
              </View>
              
              {item.allocatedAt && (
                <View style={styles.detailRow}>
                  <Paragraph style={styles.detailLabel}>Allocated At:</Paragraph>
                  <Paragraph style={styles.detailValue}>{formatDate(item.allocatedAt)}</Paragraph>
                </View>
              )}
              
              {item.loadedAt && (
                <View style={styles.detailRow}>
                  <Paragraph style={styles.detailLabel}>Loaded At:</Paragraph>
                  <Paragraph style={styles.detailValue}>{formatDate(item.loadedAt)}</Paragraph>
                </View>
              )}
            </View>
            
            <Divider style={styles.divider} />
            
            <View style={styles.section}>
              <Title style={styles.sectionTitle}>Notes</Title>
              
              {editMode ? (
                <TextInput
                  label="Notes"
                  value={editData.notes}
                  onChangeText={(text) => setEditData({...editData, notes: text})}
                  multiline
                  numberOfLines={3}
                  style={styles.input}
                />
              ) : (
                <Paragraph>{item.notes || 'No notes available'}</Paragraph>
              )}
            </View>
            
            {allocations.length > 0 && (
              <>
                <Divider style={styles.divider} />
                
                <View style={styles.section}>
                  <Title style={styles.sectionTitle}>Allocations</Title>
                  
                  {allocations.map((allocation, index) => (
                    <Card key={index} style={styles.allocationCard}>
                      <Card.Content>
                        <View style={styles.allocationHeader}>
                          <Paragraph style={styles.allocationTitle}>
                            {allocation.allocationType === 'shipment' ? 'Shipment' : 'Delivery Route'}
                          </Paragraph>
                          <Chip>{allocation.status}</Chip>
                        </View>
                        
                        <Paragraph>Name: {allocation.allocationName}</Paragraph>
                        <Paragraph>Allocated By: {allocation.allocatedBy}</Paragraph>
                        <Paragraph>Date: {formatDate(allocation.createdAt)}</Paragraph>
                        {allocation.notes && <Paragraph>Notes: {allocation.notes}</Paragraph>}
                      </Card.Content>
                    </Card>
                  ))}
                </View>
              </>
            )}
            
            {photos.length > 0 && (
              <>
                <Divider style={styles.divider} />
                
                <View style={styles.section}>
                  <Title style={styles.sectionTitle}>Photos</Title>
                  <DocumentGallery documents={photos.map(photo => ({ uri: photo.photoUri }))} />
                </View>
              </>
            )}
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    margin: 16,
    elevation: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 20,
  },
  trackingNumber: {
    fontSize: 14,
    color: '#666',
  },
  divider: {
    marginVertical: 16,
  },
  section: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  detailLabel: {
    width: 120,
    fontWeight: 'bold',
  },
  detailValue: {
    flex: 1,
  },
  input: {
    marginBottom: 8,
  },
  allocationCard: {
    marginBottom: 8,
    backgroundColor: '#f0f9ff',
  },
  allocationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  allocationTitle: {
    fontWeight: 'bold',
  },
});

export default WarehouseItemDetailScreen;
