/**
 * Forgot Password Screen for Checker App
 */
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import axios from 'axios';

import { AuthStackParamList } from '../../navigation/types';
import { API_BASE_URL } from '../../config/constants';
import Input from '../../components/atoms/Input';
import Button from '../../components/atoms/Button';
import { colors } from '../../styles/theme';

type ForgotPasswordScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'ForgotPassword'>;

const ForgotPasswordScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const navigation = useNavigation<ForgotPasswordScreenNavigationProp>();

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/forgot-password`, { email });
      
      if (response.data.success) {
        setIsSuccess(true);
      } else {
        setError(response.data.error?.message || 'Failed to send reset password link');
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        setError(error.response.data.error?.message || 'Failed to send reset password link');
      } else {
        setError('Network error. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>← Back to Login</Text>
      </TouchableOpacity>
      
      <View style={styles.logoContainer}>
        <Image 
          source={require('../../assets/images/logo.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Reset Password</Text>
      </View>
      
      <View style={styles.formContainer}>
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        
        {isSuccess ? (
          <View style={styles.successContainer}>
            <Text style={styles.successTitle}>Reset Link Sent!</Text>
            <Text style={styles.successText}>
              We've sent a password reset link to your email address. Please check your inbox and follow the instructions.
            </Text>
            <Button
              title="Back to Login"
              onPress={() => navigation.navigate('Login')}
              style={styles.backToLoginButton}
            />
          </View>
        ) : (
          <>
            <Text style={styles.instructionText}>
              Enter your email address and we'll send you a link to reset your password.
            </Text>
            
            <Input
              placeholder="Email Address"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              style={styles.input}
            />
            
            <Button
              title="Send Reset Link"
              onPress={handleResetPassword}
              style={styles.resetButton}
              loading={isLoading}
              disabled={isLoading}
            />
          </>
        )}
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
  backButton: {
    marginTop: 40,
    marginBottom: 10,
  },
  backButtonText: {
    color: colors.primary,
    fontSize: 16,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  logo: {
    width: 80,
    height: 80,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginTop: 10,
  },
  formContainer: {
    width: '100%',
  },
  instructionText: {
    fontSize: 16,
    color: colors.neutral,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
  },
  resetButton: {
    marginTop: 10,
  },
  backToLoginButton: {
    marginTop: 20,
  },
  successContainer: {
    alignItems: 'center',
    padding: 20,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.secondary,
    marginBottom: 10,
  },
  successText: {
    fontSize: 16,
    color: colors.neutral,
    textAlign: 'center',
    marginBottom: 20,
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

export default ForgotPasswordScreen;
