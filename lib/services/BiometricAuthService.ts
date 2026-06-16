/**
 * Biometric Authentication Service
 * خدمة المصادقة البيومترية
 *
 * Provides biometric authentication (fingerprint, face recognition) integration
 * for secure access to sensitive calculation data.
 *
 * @module lib/services/BiometricAuthService
 */

import { Platform } from 'react-native';
import { SecureStorageService } from './SecureStorageService';

/**
 * Biometric authentication types
 */
export enum BiometricType {
  FINGERPRINT = 'fingerprint',
  FACE = 'face',
  IRIS = 'iris',
  NONE = 'none',
}

/**
 * Biometric authentication result
 */
export interface BiometricAuthResult {
  success: boolean;
  biometricType: BiometricType | null;
  error: string | null;
  authenticated: boolean;
}

/**
 * Biometric settings
 */
export interface BiometricSettings {
  enabled: boolean;
  type: BiometricType;
  lastUsed: string | null;
  attemptCount: number;
  lockedUntil: number | null; // Unix timestamp when account unlocks after failed attempts
}

const BIOMETRIC_SETTINGS_KEY = 'biometric_settings';
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

/**
 * Biometric Authentication Service
 * Manages biometric login and security features
 */
class BiometricAuthServiceClass {
  private settings: BiometricSettings | null = null;

  /**
   * Initialize biometric service
   * Check device capabilities and load stored settings
   */
  async initialize(): Promise<BiometricSettings> {
    try {
      const stored = await SecureStorageService.getItem<BiometricSettings>(BIOMETRIC_SETTINGS_KEY);
      this.settings = stored || {
        enabled: false,
        type: BiometricType.NONE,
        attemptCount: 0,
        lastUsed: null,
        lockedUntil: null,
      };
      return this.settings;
    } catch (error) {
      console.error('[BiometricAuthService] Failed to initialize:', error);
      this.settings = {
        enabled: false,
        type: BiometricType.NONE,
        attemptCount: 0,
        lastUsed: null,
        lockedUntil: null,
      };
      return this.settings;
    }
  }

  /**
   * Check if biometric auth is available on device
   */
  async isAvailable(): Promise<boolean> {
    try {
      // In production, use react-native-biometrics or similar library
      // For now, return true on Android/iOS and false on web
      return Platform.OS === 'android' || Platform.OS === 'ios';
    } catch (error) {
      console.warn('[BiometricAuthService] Error checking availability:', error);
      return false;
    }
  }

  /**
   * Get supported biometric type on device
   */
  async getSupportedBiometricType(): Promise<BiometricType> {
    try {
      // In production, detect actual device capabilities:
      // - Android: Use BiometricPrompt API (fingerprint, face)
      // - iOS: Use LocalAuthentication (Face ID, Touch ID)
      if (Platform.OS === 'android') {
        return BiometricType.FINGERPRINT; // or FACE
      } else if (Platform.OS === 'ios') {
        return BiometricType.FINGERPRINT; // or FACE
      }
      return BiometricType.NONE;
    } catch (error) {
      console.warn('[BiometricAuthService] Error detecting type:', error);
      return BiometricType.NONE;
    }
  }

  /**
   * Authenticate using biometric
   * Returns success/failure and updates attempt counter
   */
  async authenticate(): Promise<BiometricAuthResult> {
    try {
      // Check if account is locked out
      if (this.settings?.lockedUntil && Date.now() < this.settings.lockedUntil) {
        const remainingMs = this.settings.lockedUntil - Date.now();
        const remainingMins = Math.ceil(remainingMs / 60000);
        return {
          success: false,
          authenticated: false,
          biometricType: null,
          error: `Account locked. Try again in ${remainingMins} minute(s)`,
        };
      }

      // Check if biometric is enabled
      if (!this.settings?.enabled) {
        return {
          success: false,
          authenticated: false,
          biometricType: null,
          error: 'Biometric authentication not enabled',
        };
      }

      // In production, call actual biometric API:
      // - Android: BiometricPrompt.authenticate()
      // - iOS: LAContext.evaluatePolicy()
      // For now, simulate with a placeholder
      const success = await this.simulateBiometricPrompt();

      if (success) {
        // Reset attempt counter on success
        await this.resetAttempts();
        return {
          success: true,
          authenticated: true,
          biometricType: this.settings.type,
          error: null,
        };
      } else {
        // Increment failed attempt counter
        await this.incrementFailedAttempts();

        if (this.settings.attemptCount >= MAX_FAILED_ATTEMPTS) {
          return {
            success: false,
            authenticated: false,
            biometricType: null,
            error: `Too many failed attempts. Account locked for ${LOCKOUT_DURATION / 60000} minutes`,
          };
        }

        return {
          success: false,
          authenticated: false,
          biometricType: null,
          error: `Biometric authentication failed (${this.settings.attemptCount}/${MAX_FAILED_ATTEMPTS})`,
        };
      }
    } catch (error) {
      console.error('[BiometricAuthService] Authentication error:', error);
      return {
        success: false,
        authenticated: false,
        biometricType: null,
        error: 'Biometric authentication failed',
      };
    }
  }

  /**
   * Enable biometric authentication
   */
  async enable(): Promise<void> {
    try {
      const type = await this.getSupportedBiometricType();

      if (type === BiometricType.NONE) {
        throw new Error('Biometric not supported on this device');
      }

      this.settings = {
        enabled: true,
        type,
        attemptCount: 0,
        lastUsed: new Date().toISOString(),
        lockedUntil: null,
      };

      await SecureStorageService.setItem(BIOMETRIC_SETTINGS_KEY, this.settings);
    } catch (error) {
      console.error('[BiometricAuthService] Failed to enable:', error);
      throw error;
    }
  }

  /**
   * Disable biometric authentication
   */
  async disable(): Promise<void> {
    try {
      this.settings = {
        enabled: false,
        type: BiometricType.NONE,
        attemptCount: 0,
        lastUsed: null,
        lockedUntil: null,
      };

      await SecureStorageService.setItem(BIOMETRIC_SETTINGS_KEY, this.settings);
    } catch (error) {
      console.error('[BiometricAuthService] Failed to disable:', error);
      throw error;
    }
  }

  /**
   * Check if biometric is currently enabled
   */
  isEnabled(): boolean {
    return this.settings?.enabled ?? false;
  }

  /**
   * Get current settings
   */
  getSettings(): BiometricSettings | null {
    return this.settings;
  }

  /**
   * Reset failed attempts counter
   */
  private async resetAttempts(): Promise<void> {
    if (!this.settings) return;

    this.settings.attemptCount = 0;
    this.settings.lockedUntil = null;
    this.settings.lastUsed = new Date().toISOString();

    await SecureStorageService.setItem(BIOMETRIC_SETTINGS_KEY, this.settings);
  }

  /**
   * Increment failed attempts and lock if exceeded
   */
  private async incrementFailedAttempts(): Promise<void> {
    if (!this.settings) return;

    this.settings.attemptCount++;

    if (this.settings.attemptCount >= MAX_FAILED_ATTEMPTS) {
      this.settings.lockedUntil = Date.now() + LOCKOUT_DURATION;
    }

    await SecureStorageService.setItem(BIOMETRIC_SETTINGS_KEY, this.settings);
  }

  /**
   * Simulate biometric prompt (placeholder for production implementation)
   * In production, use device biometric APIs
   */
  private async simulateBiometricPrompt(): Promise<boolean> {
    // Placeholder: In production, this would:
    // - Android: BiometricPrompt.authenticate()
    // - iOS: LAContext.evaluatePolicy(LAPolicyDeviceOwnerAuthenticationWithBiometrics)
    // For now, always return true for development
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate 90% success rate for dev/testing
        resolve(Math.random() > 0.1);
      }, 1000);
    });
  }
}

// Export singleton instance
export const BiometricAuthService = new BiometricAuthServiceClass();
