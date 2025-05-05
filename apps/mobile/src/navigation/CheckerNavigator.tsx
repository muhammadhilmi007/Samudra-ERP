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
    </Stack.Navigator>
  );
};

export default CheckerNavigator;
