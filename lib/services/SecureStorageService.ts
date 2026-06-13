/**
 * Secure Storage Service
 * خدمة التخزين الآمن
 *
 * This module provides encrypted storage for sensitive data using react-native-encrypted-storage.
 * All sensitive user data should be stored using this service instead of AsyncStorage.
 *
 * @module lib/services/SecureStorageService
 */

import EncryptedStorage from 'react-native-encrypted-storage';

/**
 * Secure storage keys for different types of sensitive data
 */
export const SECURE_STORAGE_KEYS = {
  USER_PREFERENCES: 'user_preferences',
  CALCULATION_HISTORY: 'calculation_history',
  API_TOKENS: 'api_tokens',
  BIOMETRIC_SETTINGS: 'biometric_settings',
  SESSION_DATA: 'session_data',
  PRIVACY_CONSENT: 'privacy_consent',
} as const;

/**
 * Secure Storage Service
 * Provides encrypted storage for sensitive data
 */
class SecureStorageServiceClass {
  /**
   * Store data securely with encryption
   */
  async setItem(key: string, value: unknown): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await EncryptedStorage.setItem(key, jsonValue);
    } catch (error) {
      console.error('Error storing secure data:', error);
      throw new Error('Failed to store data securely');
    }
  }

  /**
   * Retrieve and decrypt stored data
   */
  async getItem<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await EncryptedStorage.getItem(key);
      if (jsonValue === null) {
        return null;
      }
      return JSON.parse(jsonValue) as T;
    } catch (error) {
      console.error('Error retrieving secure data:', error);
      return null;
    }
  }

  /**
   * Remove securely stored data
   */
  async removeItem(key: string): Promise<void> {
    try {
      await EncryptedStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing secure data:', error);
      throw new Error('Failed to remove data securely');
    }
  }

  /**
   * Clear all securely stored data
   * Use with caution - this will delete all encrypted data
   */
  async clear(): Promise<void> {
    try {
      await EncryptedStorage.clear();
    } catch (error) {
      console.error('Error clearing secure storage:', error);
      throw new Error('Failed to clear secure storage');
    }
  }

  /**
   * Check if a key exists in secure storage
   */
  async hasKey(key: string): Promise<boolean> {
    try {
      const value = await EncryptedStorage.getItem(key);
      return value !== null;
    } catch (error) {
      console.error('Error checking secure storage key:', error);
      return false;
    }
  }
}

// Export singleton instance
export const SecureStorageService = new SecureStorageServiceClass();
