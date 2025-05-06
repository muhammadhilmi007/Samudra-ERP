import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { TextInput, Button, Card, Divider, Chip } from 'react-native-paper';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useNavigation } from '@react-navigation/native';
import { warehouseItemService } from '../services/warehouseItemService';
import BarcodeScanner from './BarcodeScanner';
import ItemPhotoCapture from './ItemPhotoCapture';
import ItemConditionForm from './ItemConditionForm';
import ItemMeasurementForm from './ItemMeasurementForm';

const validationSchema = Yup.object().shape({
  trackingNumber: Yup.string().required('Tracking number is required'),
  itemType: Yup.string().required('Item type is required'),
  receiverName: Yup.string().required('Receiver name is required'),
  receiverAddress: Yup.string().required('Receiver address is required'),
  receiverPhone: Yup.string().required('Receiver phone is required'),
  destinationBranchId: Yup.string().required('Destination branch is required'),
  destinationBranchName: Yup.string().required('Destination branch name is required'),
});

const IncomingItemForm = ({ route }) => {
  const navigation = useNavigation();
  const [showScanner, setShowScanner] = useState(false);
  const [scannerTarget, setScannerTarget] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [condition, setCondition] = useState({
    condition: 'good',
    damageDescription: '',
  });
  const [measurements, setMeasurements] = useState({
    weight: '',
    length: '',
    width: '',
    height: '',
  });

  const initialValues = {
    trackingNumber: '',
    itemType: 'package',
    receiverName: '',
    receiverAddress: '',
    receiverPhone: '',
    destinationBranchId: '',
    destinationBranchName: '',
    notes: '',
    sourceType: route?.params?.sourceType || 'incoming_shipment',
    sourceId: route?.params?.sourceId || '',
  };

  const handleBarcodeScan = (data, target) => {
    if (target === 'trackingNumber') {
      return { trackingNumber: data };
    } else if (target === 'destinationBranch') {
      // Assuming the barcode format is "branchId:branchName"
      const [id, name] = data.split(':');
      return {
        destinationBranchId: id,
        destinationBranchName: name,
      };
    }
    return {};
  };

  const handleSubmit = async (values) => {
    try {
      setIsSubmitting(true);
      
      // Combine all data
      const itemData = {
        ...values,
        ...measurements,
        ...condition,
        status: 'incoming',
      };
      
      // Process the incoming item
      const newItem = await warehouseItemService.processIncomingItem(itemData);
      
      // Upload photos if any
      if (photos.length > 0) {
        await Promise.all(
          photos.map(photo => warehouseItemService.addItemPhoto(newItem.id, photo.uri))
        );
      }
      
      Alert.alert(
        'Success',
        'Item has been processed successfully',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('WarehouseItemDetail', { itemId: newItem.id }),
          },
        ]
      );
    } catch (error) {
      console.error('Error processing item:', error);
      Alert.alert('Error', 'Failed to process item: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Title title="Process Incoming Item" />
        <Card.Content>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              setFieldValue,
              values,
              errors,
              touched,
            }) => (
              <View>
                <View style={styles.scannerRow}>
                  <TextInput
                    label="Tracking Number *"
                    value={values.trackingNumber}
                    onChangeText={handleChange('trackingNumber')}
                    onBlur={handleBlur('trackingNumber')}
                    style={styles.input}
                    error={touched.trackingNumber && errors.trackingNumber}
                  />
                  <TouchableOpacity
                    style={styles.scanButton}
                    onPress={() => {
                      setScannerTarget('trackingNumber');
                      setShowScanner(true);
                    }}
                  >
                    <Text style={styles.scanButtonText}>Scan</Text>
                  </TouchableOpacity>
                </View>
                {touched.trackingNumber && errors.trackingNumber && (
                  <Text style={styles.errorText}>{errors.trackingNumber}</Text>
                )}

                <View style={styles.row}>
                  <Chip
                    selected={values.itemType === 'package'}
                    onPress={() => setFieldValue('itemType', 'package')}
                    style={styles.chip}
                  >
                    Package
                  </Chip>
                  <Chip
                    selected={values.itemType === 'document'}
                    onPress={() => setFieldValue('itemType', 'document')}
                    style={styles.chip}
                  >
                    Document
                  </Chip>
                  <Chip
                    selected={values.itemType === 'fragile'}
                    onPress={() => setFieldValue('itemType', 'fragile')}
                    style={styles.chip}
                  >
                    Fragile
                  </Chip>
                </View>

                <TextInput
                  label="Receiver Name *"
                  value={values.receiverName}
                  onChangeText={handleChange('receiverName')}
                  onBlur={handleBlur('receiverName')}
                  style={styles.input}
                  error={touched.receiverName && errors.receiverName}
                />
                {touched.receiverName && errors.receiverName && (
                  <Text style={styles.errorText}>{errors.receiverName}</Text>
                )}

                <TextInput
                  label="Receiver Address *"
                  value={values.receiverAddress}
                  onChangeText={handleChange('receiverAddress')}
                  onBlur={handleBlur('receiverAddress')}
                  style={styles.input}
                  multiline
                  numberOfLines={3}
                  error={touched.receiverAddress && errors.receiverAddress}
                />
                {touched.receiverAddress && errors.receiverAddress && (
                  <Text style={styles.errorText}>{errors.receiverAddress}</Text>
                )}

                <TextInput
                  label="Receiver Phone *"
                  value={values.receiverPhone}
                  onChangeText={handleChange('receiverPhone')}
                  onBlur={handleBlur('receiverPhone')}
                  style={styles.input}
                  keyboardType="phone-pad"
                  error={touched.receiverPhone && errors.receiverPhone}
                />
                {touched.receiverPhone && errors.receiverPhone && (
                  <Text style={styles.errorText}>{errors.receiverPhone}</Text>
                )}

                <View style={styles.scannerRow}>
                  <TextInput
                    label="Destination Branch *"
                    value={values.destinationBranchName}
                    onChangeText={(text) => {
                      setFieldValue('destinationBranchName', text);
                    }}
                    onBlur={handleBlur('destinationBranchName')}
                    style={styles.input}
                    error={touched.destinationBranchName && errors.destinationBranchName}
                  />
                  <TouchableOpacity
                    style={styles.scanButton}
                    onPress={() => {
                      setScannerTarget('destinationBranch');
                      setShowScanner(true);
                    }}
                  >
                    <Text style={styles.scanButtonText}>Scan</Text>
                  </TouchableOpacity>
                </View>
                {touched.destinationBranchName && errors.destinationBranchName && (
                  <Text style={styles.errorText}>{errors.destinationBranchName}</Text>
                )}

                <TextInput
                  label="Notes"
                  value={values.notes}
                  onChangeText={handleChange('notes')}
                  onBlur={handleBlur('notes')}
                  style={styles.input}
                  multiline
                  numberOfLines={3}
                />

                <Divider style={styles.divider} />
                
                <Text style={styles.sectionTitle}>Item Measurements</Text>
                <ItemMeasurementForm
                  initialValues={measurements}
                  onValuesChange={setMeasurements}
                />

                <Divider style={styles.divider} />
                
                <Text style={styles.sectionTitle}>Item Condition</Text>
                <ItemConditionForm
                  initialValues={condition}
                  onValuesChange={setCondition}
                />

                <Divider style={styles.divider} />
                
                <Text style={styles.sectionTitle}>Item Photos</Text>
                <ItemPhotoCapture
                  photos={photos}
                  onPhotosChange={setPhotos}
                  maxPhotos={4}
                />

                <Button
                  mode="contained"
                  onPress={handleSubmit}
                  style={styles.button}
                  loading={isSubmitting}
                  disabled={isSubmitting}
                >
                  Process Item
                </Button>
              </View>
            )}
          </Formik>
        </Card.Content>
      </Card>

      {showScanner && (
        <BarcodeScanner
          isVisible={showScanner}
          onClose={() => setShowScanner(false)}
          onCodeScanned={(data) => {
            setShowScanner(false);
            const fieldUpdates = handleBarcodeScan(data, scannerTarget);
            Object.keys(fieldUpdates).forEach(key => {
              setFieldValue(key, fieldUpdates[key]);
            });
          }}
        />
      )}
    </ScrollView>
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
  input: {
    marginBottom: 8,
  },
  button: {
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
  },
  scannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scanButton: {
    backgroundColor: '#2563EB',
    padding: 10,
    borderRadius: 4,
    marginLeft: 8,
    height: 50,
    justifyContent: 'center',
  },
  scanButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  divider: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
});

export default IncomingItemForm;
