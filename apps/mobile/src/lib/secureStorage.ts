/**
 * Secure Storage utility for Samudra Paket ERP Mobile
 * Uses Expo SecureStore for encrypted storage of sensitive data
 */
import * as SecureStore from 'expo-secure-store';

export const secureStore = {
  /**
   * Save a value securely
   * @param key - The key to store the value under
   * @param value - The value to store
   */
  save: async (key: string, value: string): Promise<void> => {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error('Error saving to secure storage:', error);
      throw error;
    }
  },

  /**
   * Get a value from secure storage
   * @param key - The key to retrieve
   * @returns The stored value or null if not found
   */
  get: async (key: string): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error('Error retrieving from secure storage:', error);
      return null;
    }
  },

  /**
   * Delete a value from secure storage
   * @param key - The key to delete
   */
  delete: async (key: string): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error('Error deleting from secure storage:', error);
      throw error;
    }
  },

  /**
   * Check if a key exists in secure storage
   * @param key - The key to check
   * @returns True if the key exists, false otherwise
   */
  exists: async (key: string): Promise<boolean> => {
    try {
      const value = await SecureStore.getItemAsync(key);
      return value !== null;
    } catch (error) {
      console.error('Error checking secure storage:', error);
      return false;
    }
  }
};

export default secureStore;
