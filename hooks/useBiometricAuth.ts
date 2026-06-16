/**
 * useBiometricAuth Hook
 * Hook for managing biometric authentication in components
 *
 * @module hooks/useBiometricAuth
 */

import { useEffect, useState, useCallback } from 'react';
import {
  BiometricAuthService,
  BiometricAuthResult,
  BiometricSettings,
} from '../lib/services/BiometricAuthService';

/**
 * Biometric auth hook state
 */
interface UseBiometricAuthState {
  isAvailable: boolean;
  isEnabled: boolean;
  isLoading: boolean;
  lastResult: BiometricAuthResult | null;
  settings: BiometricSettings | null;
}

/**
 * Biometric auth hook actions
 */
interface UseBiometricAuthActions {
  authenticate: () => Promise<BiometricAuthResult>;
  enable: () => Promise<void>;
  disable: () => Promise<void>;
}

/**
 * Hook for biometric authentication
 * @returns State and actions for biometric auth
 */
export const useBiometricAuth = (): UseBiometricAuthState & UseBiometricAuthActions => {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState<BiometricAuthResult | null>(null);
  const [settings, setSettings] = useState<BiometricSettings | null>(null);

  // Initialize biometric service on mount
  useEffect(() => {
    const initBiometric = async () => {
      try {
        // Initialize service
        const initialized = await BiometricAuthService.initialize();
        setSettings(initialized);
        setIsEnabled(initialized.enabled);

        // Check availability
        const available = await BiometricAuthService.isAvailable();
        setIsAvailable(available);
      } catch (error) {
        console.error('[useBiometricAuth] Initialization error:', error);
      }
    };

    initBiometric();
  }, []);

  const authenticate = useCallback(async (): Promise<BiometricAuthResult> => {
    setIsLoading(true);
    try {
      const result = await BiometricAuthService.authenticate();
      setLastResult(result);
      return result;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const enable = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      await BiometricAuthService.enable();
      setIsEnabled(true);
      const updated = BiometricAuthService.getSettings();
      setSettings(updated);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const disable = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      await BiometricAuthService.disable();
      setIsEnabled(false);
      const updated = BiometricAuthService.getSettings();
      setSettings(updated);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isAvailable,
    isEnabled,
    isLoading,
    lastResult,
    settings,
    authenticate,
    enable,
    disable,
  };
};
