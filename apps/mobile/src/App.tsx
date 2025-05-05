/**
 * Samudra Paket ERP - Mobile App
 * Main App component
 */

import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import NetInfo from '@react-native-community/netinfo';

// Store
import { store } from './store/store';

// Navigation
import RootNavigator from './navigation/RootNavigator';

// Services
import syncService from './lib/sync/syncService';
import notificationService from './lib/notifications';
import { database } from './db/config';
import { COLORS } from './config/constants';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: true,
    },
  },
});

const App: React.FC = () => {
  const [appIsReady, setAppIsReady] = useState(false);
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    async function prepare() {
      try {
        // Initialize services
        await database.write(async () => {
          // This is a no-op transaction to ensure database is ready
        });
        
        // Initialize sync service
        syncService.initialize();
        
        // Initialize notification service
        await notificationService.initialize();
        
        // Load fonts
        await Font.loadAsync({
          ...Ionicons.font,
          'Inter-Regular': require('../assets/fonts/Inter-Regular.ttf'),
          'Inter-Medium': require('../assets/fonts/Inter-Medium.ttf'),
          'Inter-SemiBold': require('../assets/fonts/Inter-SemiBold.ttf'),
          'Inter-Bold': require('../assets/fonts/Inter-Bold.ttf'),
        });
        
        // Artificial delay for a smoother startup experience
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (e) {
        console.warn('Error loading app resources:', e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    // Set up network connectivity listener
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected ?? false);
      
      // Trigger sync when connection is restored
      if (state.isConnected) {
        syncService.sync();
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (appIsReady) {
      // Hide splash screen once the app is ready
      SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="auto" backgroundColor={COLORS.BACKGROUND.PRIMARY} />
          <RootNavigator />
        </QueryClientProvider>
      </Provider>
    </SafeAreaProvider>
  );
};

export default App;
