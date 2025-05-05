/**
 * Main navigation for authenticated users in Samudra Paket ERP Mobile App
 */
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { MainStackParamList } from './types';
import { Ionicons } from '@expo/vector-icons';

// Import implemented screens
import ProfileScreen from '../screens/profile/ProfileScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';

// Screens to be implemented later
const HomeScreen = () => null;
const PickupManagementScreen = () => null;
const DeliveryManagementScreen = () => null;
const ShipmentTrackingScreen = () => null;

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator<MainStackParamList>();

// Individual stack navigators for each tab
const HomeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Home" component={HomeScreen} />
  </Stack.Navigator>
);

const PickupStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="PickupManagement" component={PickupManagementScreen} />
  </Stack.Navigator>
);

const DeliveryStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="DeliveryManagement" component={DeliveryManagementScreen} />
  </Stack.Navigator>
);

const TrackingStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ShipmentTracking" component={ShipmentTrackingScreen} />
  </Stack.Navigator>
);

const ProfileStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Profile" component={ProfileScreen} />
    <Stack.Screen name="Settings" component={SettingsScreen} />
  </Stack.Navigator>
);

const MainNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'HomeTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'PickupTab') {
            iconName = focused ? 'cube' : 'cube-outline';
          } else if (route.name === 'DeliveryTab') {
            iconName = focused ? 'car' : 'car-outline';
          } else if (route.name === 'TrackingTab') {
            iconName = focused ? 'location' : 'location-outline';
          } else if (route.name === 'ProfileTab') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#64748B',
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={HomeStack} 
        options={{ title: 'Home' }}
      />
      <Tab.Screen 
        name="PickupTab" 
        component={PickupStack} 
        options={{ title: 'Pickup' }}
      />
      <Tab.Screen 
        name="DeliveryTab" 
        component={DeliveryStack} 
        options={{ title: 'Delivery' }}
      />
      <Tab.Screen 
        name="TrackingTab" 
        component={TrackingStack} 
        options={{ title: 'Tracking' }}
      />
      <Tab.Screen 
        name="ProfileTab" 
        component={ProfileStack} 
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

export default MainNavigator;
