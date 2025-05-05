/**
 * Settings Screen for Checker App
 */
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Switch, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator
} from 'react-native';
import { useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Application from 'expo-application';
import * as FileSystem from 'expo-file-system';

import { logout } from '../../features/auth/authSlice';
import authService from '../../features/auth/authService';
import { secureStore } from '../../lib/secureStorage';
import { colors } from '../../styles/theme';

const BIOMETRIC_ENABLED_KEY = 'biometric_enabled';
const OFFLINE_MODE_KEY = 'offline_mode';
const NOTIFICATION_ENABLED_KEY = 'notification_enabled';
const DARK_MODE_KEY = 'dark_mode';

const SettingsScreen: React.FC = () => {
  const dispatch = useDispatch();
  
  // Settings state
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
  const [isOfflineModeEnabled, setIsOfflineModeEnabled] = useState(false);
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(true);
  const [isDarkModeEnabled, setIsDarkModeEnabled] = useState(false);
  const [cacheSize, setCacheSize] = useState('0 MB');
  const [isLoading, setIsLoading] = useState(false);
  const [appVersion, setAppVersion] = useState('');

  // Load settings on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Check biometric availability
        const compatible = await LocalAuthentication.hasHardwareAsync();
        const enrolled = await LocalAuthentication.isEnrolledAsync();
        setIsBiometricAvailable(compatible && enrolled);
        
        // Load saved settings
        const biometricEnabled = await secureStore.get(BIOMETRIC_ENABLED_KEY);
        setIsBiometricEnabled(biometricEnabled === 'true');
        
        const offlineMode = await secureStore.get(OFFLINE_MODE_KEY);
        setIsOfflineModeEnabled(offlineMode === 'true');
        
        const notificationEnabled = await secureStore.get(NOTIFICATION_ENABLED_KEY);
        setIsNotificationEnabled(notificationEnabled !== 'false'); // Default to true
        
        const darkMode = await secureStore.get(DARK_MODE_KEY);
        setIsDarkModeEnabled(darkMode === 'true');
        
        // Get app version
        setAppVersion(Application.nativeApplicationVersion || '1.0.0');
        
        // Calculate cache size
        calculateCacheSize();
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };
    
    loadSettings();
  }, []);

  // Calculate cache size
  const calculateCacheSize = async () => {
    try {
      const cacheDir = FileSystem.cacheDirectory;
      if (cacheDir) {
        const dirInfo = await FileSystem.getInfoAsync(cacheDir);
        if (dirInfo.exists && dirInfo.isDirectory) {
          // Convert bytes to MB
          const sizeInMB = (dirInfo.size / (1024 * 1024)).toFixed(2);
          setCacheSize(`${sizeInMB} MB`);
        }
      }
    } catch (error) {
      console.error('Error calculating cache size:', error);
      setCacheSize('Unknown');
    }
  };

  // Clear app cache
  const handleClearCache = async () => {
    try {
      setIsLoading(true);
      
      const cacheDir = FileSystem.cacheDirectory;
      if (cacheDir) {
        const dirInfo = await FileSystem.getInfoAsync(cacheDir);
        if (dirInfo.exists && dirInfo.isDirectory) {
          // List all files in cache directory
          const files = await FileSystem.readDirectoryAsync(cacheDir);
          
          // Delete each file
          for (const file of files) {
            await FileSystem.deleteAsync(`${cacheDir}${file}`, { idempotent: true });
          }
          
          // Update cache size
          setCacheSize('0 MB');
          Alert.alert('Success', 'Cache cleared successfully');
        }
      }
    } catch (error) {
      console.error('Error clearing cache:', error);
      Alert.alert('Error', 'Failed to clear cache');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await authService.logout();
              dispatch(logout());
            } catch (error) {
              console.error('Logout error:', error);
            }
          },
        },
      ]
    );
  };

  // Toggle settings
  const toggleBiometric = async (value: boolean) => {
    setIsBiometricEnabled(value);
    await secureStore.save(BIOMETRIC_ENABLED_KEY, value ? 'true' : 'false');
  };
  
  const toggleOfflineMode = async (value: boolean) => {
    setIsOfflineModeEnabled(value);
    await secureStore.save(OFFLINE_MODE_KEY, value ? 'true' : 'false');
  };
  
  const toggleNotification = async (value: boolean) => {
    setIsNotificationEnabled(value);
    await secureStore.save(NOTIFICATION_ENABLED_KEY, value ? 'true' : 'false');
  };
  
  const toggleDarkMode = async (value: boolean) => {
    setIsDarkModeEnabled(value);
    await secureStore.save(DARK_MODE_KEY, value ? 'true' : 'false');
    Alert.alert('Info', 'Dark mode will be available in a future update');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        
        <TouchableOpacity 
          style={styles.settingItem}
          onPress={handleLogout}
        >
          <View style={styles.settingItemLeft}>
            <View style={[styles.iconContainer, { backgroundColor: '#FFEBEE' }]}>
              <Ionicons name="log-out-outline" size={20} color="#D32F2F" />
            </View>
            <Text style={[styles.settingItemText, { color: '#D32F2F' }]}>Logout</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.neutral} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security</Text>
        
        {isBiometricAvailable && (
          <View style={styles.settingItem}>
            <View style={styles.settingItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="finger-print-outline" size={20} color={colors.primary} />
              </View>
              <Text style={styles.settingItemText}>Biometric Authentication</Text>
            </View>
            <Switch
              value={isBiometricEnabled}
              onValueChange={toggleBiometric}
              trackColor={{ false: '#CCCCCC', true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        )}
        
        <TouchableOpacity 
          style={styles.settingItem}
          onPress={() => Alert.alert('Info', 'This feature will be available soon')}
        >
          <View style={styles.settingItemLeft}>
            <View style={styles.iconContainer}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.primary} />
            </View>
            <Text style={styles.settingItemText}>Change Password</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.neutral} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Preferences</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingItemLeft}>
            <View style={styles.iconContainer}>
              <Ionicons name="notifications-outline" size={20} color={colors.primary} />
            </View>
            <Text style={styles.settingItemText}>Notifications</Text>
          </View>
          <Switch
            value={isNotificationEnabled}
            onValueChange={toggleNotification}
            trackColor={{ false: '#CCCCCC', true: colors.primary }}
            thumbColor="#FFFFFF"
          />
        </View>
        
        <View style={styles.settingItem}>
          <View style={styles.settingItemLeft}>
            <View style={styles.iconContainer}>
              <Ionicons name="cloud-offline-outline" size={20} color={colors.primary} />
            </View>
            <Text style={styles.settingItemText}>Offline Mode</Text>
          </View>
          <Switch
            value={isOfflineModeEnabled}
            onValueChange={toggleOfflineMode}
            trackColor={{ false: '#CCCCCC', true: colors.primary }}
            thumbColor="#FFFFFF"
          />
        </View>
        
        <View style={styles.settingItem}>
          <View style={styles.settingItemLeft}>
            <View style={styles.iconContainer}>
              <Ionicons name="moon-outline" size={20} color={colors.primary} />
            </View>
            <Text style={styles.settingItemText}>Dark Mode</Text>
          </View>
          <Switch
            value={isDarkModeEnabled}
            onValueChange={toggleDarkMode}
            trackColor={{ false: '#CCCCCC', true: colors.primary }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data & Storage</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingItemLeft}>
            <View style={styles.iconContainer}>
              <Ionicons name="save-outline" size={20} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.settingItemText}>Cache</Text>
              <Text style={styles.settingItemSubtext}>{cacheSize}</Text>
            </View>
          </View>
          {isLoading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={handleClearCache}
            >
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity 
          style={styles.settingItem}
          onPress={() => Alert.alert('Info', 'This feature will be available soon')}
        >
          <View style={styles.settingItemLeft}>
            <View style={styles.iconContainer}>
              <Ionicons name="cloud-download-outline" size={20} color={colors.primary} />
            </View>
            <Text style={styles.settingItemText}>Data Synchronization</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.neutral} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        
        <TouchableOpacity 
          style={styles.settingItem}
          onPress={() => Alert.alert('Info', 'This feature will be available soon')}
        >
          <View style={styles.settingItemLeft}>
            <View style={styles.iconContainer}>
              <Ionicons name="help-circle-outline" size={20} color={colors.primary} />
            </View>
            <Text style={styles.settingItemText}>Help & Support</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.neutral} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.settingItem}
          onPress={() => Alert.alert('Info', 'This feature will be available soon')}
        >
          <View style={styles.settingItemLeft}>
            <View style={styles.iconContainer}>
              <Ionicons name="document-text-outline" size={20} color={colors.primary} />
            </View>
            <Text style={styles.settingItemText}>Terms & Privacy Policy</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.neutral} />
        </TouchableOpacity>
        
        <View style={styles.settingItem}>
          <View style={styles.settingItemLeft}>
            <View style={styles.iconContainer}>
              <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.settingItemText}>App Version</Text>
              <Text style={styles.settingItemSubtext}>{appVersion}</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: colors.primary,
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.neutral,
    marginBottom: 10,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  settingItemText: {
    fontSize: 16,
    color: '#000000',
  },
  settingItemSubtext: {
    fontSize: 12,
    color: colors.neutral,
    marginTop: 2,
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F5F5F5',
    borderRadius: 4,
  },
  clearButtonText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
});

export default SettingsScreen;
