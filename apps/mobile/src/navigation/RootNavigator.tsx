/**
 * Root Navigation for Samudra Paket ERP Mobile App
 */
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useNetInfo } from '@react-native-community/netinfo';
import { useSelector } from 'react-redux';

import { RootStackParamList } from './types';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import OfflineBanner from '../components/common/OfflineBanner';
import { selectIsAuthenticated } from '../features/auth/authSlice';
import LoadingScreen from '../screens/LoadingScreen';

const Stack = createStackNavigator<RootStackParamList>();

const RootNavigator: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const netInfo = useNetInfo();

  useEffect(() => {
    // Simulating auth state initialization
    const initializeAuth = async () => {
      // Here we would check for stored tokens/credentials
      setTimeout(() => {
        setIsLoading(false);
      }, 1500);
    };

    initializeAuth();
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      {!netInfo.isConnected && <OfflineBanner />}
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {isAuthenticated ? (
          <Stack.Screen name="Main" component={MainNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
