/**
 * Profile Screen for Checker App
 */
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  ScrollView, 
  Alert
} from 'react-native';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

import { selectCurrentUser } from '../../features/auth/authSlice';
import { API_BASE_URL } from '../../config/constants';
import { secureStore } from '../../lib/secureStorage';
import Button from '../../components/atoms/Button';
import { colors } from '../../styles/theme';

const ProfileScreen: React.FC = () => {
  const user = useSelector(selectCurrentUser);
  const [isLoading, setIsLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  
  // Profile sections
  const [activeSection, setActiveSection] = useState<'info' | 'security' | 'preferences'>('info');

  // Handle profile image selection
  const handleSelectImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'You need to grant permission to access your photos');
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];
        
        // Upload image to server
        setIsLoading(true);
        
        const formData = new FormData();
        formData.append('profileImage', {
          uri: selectedImage.uri,
          type: 'image/jpeg',
          name: 'profile-image.jpg',
        } as any);
        
        try {
          const token = await secureStore.get('auth_token');
          
          const response = await axios.post(
            `${API_BASE_URL}/users/profile-image`,
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${token}`,
              },
            }
          );
          
          if (response.data.success) {
            setProfileImage(selectedImage.uri);
            Alert.alert('Success', 'Profile image updated successfully');
          } else {
            Alert.alert('Error', response.data.error?.message || 'Failed to update profile image');
          }
        } catch (error) {
          Alert.alert('Error', 'Failed to upload image. Please try again.');
          console.error('Image upload error:', error);
        } finally {
          setIsLoading(false);
        }
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to open image picker');
    }
  };

  // Render profile info section
  const renderProfileInfo = () => (
    <View style={styles.sectionContainer}>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Full Name</Text>
        <Text style={styles.infoValue}>{user?.name || 'N/A'}</Text>
      </View>
      
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Username</Text>
        <Text style={styles.infoValue}>{user?.username || 'N/A'}</Text>
      </View>
      
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Email</Text>
        <Text style={styles.infoValue}>{user?.email || 'N/A'}</Text>
      </View>
      
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Role</Text>
        <Text style={styles.infoValue}>{user?.role || 'N/A'}</Text>
      </View>
      
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Branch</Text>
        <Text style={styles.infoValue}>{user?.branch || 'N/A'}</Text>
      </View>
      
      <Button
        title="Edit Profile"
        onPress={() => Alert.alert('Info', 'This feature will be available soon')}
        style={styles.editButton}
      />
    </View>
  );

  // Render security section
  const renderSecuritySection = () => (
    <View style={styles.sectionContainer}>
      <TouchableOpacity 
        style={styles.securityOption}
        onPress={() => Alert.alert('Info', 'This feature will be available soon')}
      >
        <View style={styles.securityOptionIconContainer}>
          <Ionicons name="lock-closed-outline" size={24} color={colors.primary} />
        </View>
        <View style={styles.securityOptionContent}>
          <Text style={styles.securityOptionTitle}>Change Password</Text>
          <Text style={styles.securityOptionDescription}>Update your account password</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.neutral} />
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.securityOption}
        onPress={() => Alert.alert('Info', 'This feature will be available soon')}
      >
        <View style={styles.securityOptionIconContainer}>
          <Ionicons name="finger-print-outline" size={24} color={colors.primary} />
        </View>
        <View style={styles.securityOptionContent}>
          <Text style={styles.securityOptionTitle}>Biometric Authentication</Text>
          <Text style={styles.securityOptionDescription}>Enable or disable biometric login</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.neutral} />
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.securityOption}
        onPress={() => Alert.alert('Info', 'This feature will be available soon')}
      >
        <View style={styles.securityOptionIconContainer}>
          <Ionicons name="shield-outline" size={24} color={colors.primary} />
        </View>
        <View style={styles.securityOptionContent}>
          <Text style={styles.securityOptionTitle}>Two-Factor Authentication</Text>
          <Text style={styles.securityOptionDescription}>Add an extra layer of security</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.neutral} />
      </TouchableOpacity>
    </View>
  );

  // Render preferences section
  const renderPreferencesSection = () => (
    <View style={styles.sectionContainer}>
      <TouchableOpacity 
        style={styles.securityOption}
        onPress={() => Alert.alert('Info', 'This feature will be available soon')}
      >
        <View style={styles.securityOptionIconContainer}>
          <Ionicons name="notifications-outline" size={24} color={colors.primary} />
        </View>
        <View style={styles.securityOptionContent}>
          <Text style={styles.securityOptionTitle}>Notifications</Text>
          <Text style={styles.securityOptionDescription}>Manage notification preferences</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.neutral} />
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.securityOption}
        onPress={() => Alert.alert('Info', 'This feature will be available soon')}
      >
        <View style={styles.securityOptionIconContainer}>
          <Ionicons name="language-outline" size={24} color={colors.primary} />
        </View>
        <View style={styles.securityOptionContent}>
          <Text style={styles.securityOptionTitle}>Language</Text>
          <Text style={styles.securityOptionDescription}>Change app language</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.neutral} />
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.securityOption}
        onPress={() => Alert.alert('Info', 'This feature will be available soon')}
      >
        <View style={styles.securityOptionIconContainer}>
          <Ionicons name="color-palette-outline" size={24} color={colors.primary} />
        </View>
        <View style={styles.securityOptionContent}>
          <Text style={styles.securityOptionTitle}>Appearance</Text>
          <Text style={styles.securityOptionDescription}>Customize app appearance</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.neutral} />
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>
      
      <View style={styles.profileImageContainer}>
        {isLoading ? (
          <ActivityIndicator size="large" color={colors.primary} />
        ) : (
          <>
            <Image 
              source={
                profileImage 
                  ? { uri: profileImage } 
                  : require('../../assets/images/default-avatar.png')
              } 
              style={styles.profileImage}
            />
            <TouchableOpacity 
              style={styles.editImageButton}
              onPress={handleSelectImage}
            >
              <Ionicons name="camera" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </>
        )}
      </View>
      
      <Text style={styles.userName}>{user?.name || 'User'}</Text>
      <Text style={styles.userRole}>{user?.role || 'Checker'}</Text>
      
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[
            styles.tab, 
            activeSection === 'info' && styles.activeTab
          ]}
          onPress={() => setActiveSection('info')}
        >
          <Text 
            style={[
              styles.tabText, 
              activeSection === 'info' && styles.activeTabText
            ]}
          >
            Info
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.tab, 
            activeSection === 'security' && styles.activeTab
          ]}
          onPress={() => setActiveSection('security')}
        >
          <Text 
            style={[
              styles.tabText, 
              activeSection === 'security' && styles.activeTabText
            ]}
          >
            Security
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.tab, 
            activeSection === 'preferences' && styles.activeTab
          ]}
          onPress={() => setActiveSection('preferences')}
        >
          <Text 
            style={[
              styles.tabText, 
              activeSection === 'preferences' && styles.activeTabText
            ]}
          >
            Preferences
          </Text>
        </TouchableOpacity>
      </View>
      
      {activeSection === 'info' && renderProfileInfo()}
      {activeSection === 'security' && renderSecuritySection()}
      {activeSection === 'preferences' && renderPreferencesSection()}
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
  profileImageContainer: {
    alignItems: 'center',
    marginTop: -40,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginTop: 10,
  },
  userRole: {
    fontSize: 14,
    color: colors.neutral,
    textAlign: 'center',
    marginTop: 5,
  },
  tabContainer: {
    flexDirection: 'row',
    marginTop: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    color: colors.neutral,
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  sectionContainer: {
    padding: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  infoLabel: {
    fontSize: 14,
    color: colors.neutral,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
  },
  editButton: {
    marginTop: 20,
  },
  securityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  securityOptionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  securityOptionContent: {
    flex: 1,
  },
  securityOptionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
  },
  securityOptionDescription: {
    fontSize: 14,
    color: colors.neutral,
    marginTop: 2,
  },
});

export default ProfileScreen;
