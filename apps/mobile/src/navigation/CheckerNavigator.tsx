/**
 * CheckerNavigator for Samudra Paket ERP Mobile App
 * Handles navigation for the Checker App module
 */
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { CheckerStackParamList } from './types';

// Import Checker screens
import ItemListScreen from '../screens/checker/ItemListScreen';
import ItemDetailScreen from '../screens/checker/ItemDetailScreen';

// Import Warehouse Operations screens
import WarehouseOperationsScreen from '../screens/checker/WarehouseOperationsScreen';
import IncomingItemProcessingScreen from '../screens/checker/IncomingItemProcessingScreen';
import ItemAllocationScreen from '../screens/checker/ItemAllocationScreen';
import LoadingManagementScreen from '../screens/checker/LoadingManagementScreen';
import BatchScanningScreen from '../screens/checker/BatchScanningScreen';
import InventoryViewScreen from '../screens/checker/InventoryViewScreen';
import WarehouseItemDetailScreen from '../screens/checker/WarehouseItemDetailScreen';

const Stack = createStackNavigator<CheckerStackParamList>();

const CheckerNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="ItemList" component={ItemListScreen} />
      <Stack.Screen name="ItemDetail" component={ItemDetailScreen} />
      
      {/* Warehouse Operations Screens */}
      <Stack.Screen name="WarehouseOperations" component={WarehouseOperationsScreen} />
      <Stack.Screen name="IncomingItemProcessing" component={IncomingItemProcessingScreen} />
      <Stack.Screen name="ItemAllocation" component={ItemAllocationScreen} />
      <Stack.Screen name="LoadingManagement" component={LoadingManagementScreen} />
      <Stack.Screen name="BatchScanning" component={BatchScanningScreen} />
      <Stack.Screen name="InventoryView" component={InventoryViewScreen} />
      <Stack.Screen name="WarehouseItemDetail" component={WarehouseItemDetailScreen} />
    </Stack.Navigator>
  );
};

export default CheckerNavigator;
