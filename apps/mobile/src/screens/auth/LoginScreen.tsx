/**
 * Login Screen for Checker App
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as LocalAuthentication from 'expo-local-authentication';

import { AuthStackParamList } from '../../navigation/types';
import {
  loginStart,
  loginSuccess,
  loginFailure,
  selectAuthLoading,
  selectAuthError,
} from '../../features/auth/authSlice';
import authService from '../../features/auth/authService';
import { secureStore } from '../../lib/secureStorage';

import Input from '../../components/atoms/Input';
import Button from '../../components/atoms/Button';
import { colors } from '../../styles/theme';

type LoginScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Login'>;

const BIOMETRIC_USERNAME_KEY = 'biometric_username';
const BIOMETRIC_ENABLED_KEY = 'biometric_enabled';

const LoginScreen: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
  const [savedUsername, setSavedUsername] = useState('');

  const dispatch = useDispatch();
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const isLoading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);

  // Check if device supports biometric authentication
  useEffect(() => {
    const checkBiometricAvailability = async () => {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();

      setIsBiometricAvailable(compatible && enrolled);

      // Check if user has enabled biometric login
      const storedUsername = await secureStore.get(BIOMETRIC_USERNAME_KEY);
      const biometricEnabled = await secureStore.get(BIOMETRIC_ENABLED_KEY);

      if (storedUsername && biometricEnabled === 'true') {
        setSavedUsername(storedUsername);
        setIsBiometricEnabled(true);
        setUsername(storedUsername);
      }
    };

    checkBiometricAvailability();
  }, []);

  // Handle biometric authentication
  const handleBiometricAuth = async () => {
    if (!isBiometricAvailable || !isBiometricEnabled) return;

    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to login',
        fallbackLabel: 'Use password',
      });

      if (result.success) {
        // Get stored password or token for this user
        const storedCredential = await secureStore.get(`biometric_${savedUsername}`);

        if (storedCredential) {
          dispatch(loginStart());

          // Use the stored credential to login
          const response = await authService.login({
            username: savedUsername,
            password: storedCredential,
          });

          if (response.success) {
            dispatch(
              loginSuccess({
                user: response.data.user,
                token: response.data.token,
              })
            );
          } else {
            dispatch(loginFailure(response.error?.message || 'Login failed'));
          }
        }
      }
    } catch (error) {
      console.error('Biometric authentication error:', error);
    }
  };

  // Handle manual login
  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please enter both username and password');
      return;
    }

    dispatch(loginStart());

    try {
      const response = await authService.login({ username, password });

      if (response.success) {
        // Save credentials for biometric login if user enables it
        if (isBiometricAvailable) {
          await secureStore.save(BIOMETRIC_USERNAME_KEY, username);
          await secureStore.save(`biometric_${username}`, password);
          await secureStore.save(BIOMETRIC_ENABLED_KEY, 'true');
        }

        dispatch(
          loginSuccess({
            user: response.data.user,
            token: response.data.token,
          })
        );
      } else {
        dispatch(loginFailure(response.error?.message || 'Login failed'));
      }
    } catch (error) {
      dispatch(loginFailure('Network error. Please try again.'));
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.logoContainer}>
        <Image
          source={require('../../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Samudra Paket</Text>
        <Text style={styles.subtitle}>Checker App</Text>
      </View>

      <View style={styles.formContainer}>
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <Input
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          style={styles.input}
        />

        <Input
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />

        <Button
          title="Login"
          onPress={handleLogin}
          style={styles.loginButton}
          loading={isLoading}
          disabled={isLoading}
        />

        {isBiometricAvailable && isBiometricEnabled && (
          <TouchableOpacity
            style={styles.biometricButton}
            onPress={handleBiometricAuth}
            disabled={isLoading}
          >
            <Text style={styles.biometricText}>Login with Biometric</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.forgotPasswordButton}
          onPress={() => navigation.navigate('ForgotPassword')}
        >
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2025 PT. Sarana Mudah Raya</Text>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
  },
  logo: {
    width: 120,
    height: 120,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginTop: 10,
  },
  subtitle: {
    fontSize: 18,
    color: colors.neutral,
    marginTop: 5,
  },
  formContainer: {
    width: '100%',
  },
  input: {
    marginBottom: 16,
  },
  loginButton: {
    marginTop: 10,
  },
  biometricButton: {
    alignItems: 'center',
    marginTop: 20,
  },
  biometricText: {
    color: colors.primary,
    fontSize: 16,
  },
  forgotPasswordButton: {
    alignItems: 'center',
    marginTop: 20,
  },
  forgotPasswordText: {
    color: colors.neutral,
    fontSize: 14,
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  footerText: {
    color: colors.neutral,
    fontSize: 12,
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: 10,
    borderRadius: 4,
    marginBottom: 16,
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 14,
  },
});

export default LoginScreen;
