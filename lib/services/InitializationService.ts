/**
 * Application Initialization Service
 * تخدمة تهيئة التطبيق
 *
 * Centralizes initialization of all app-wide settings and data to prevent race conditions.
 * Ensures that all context providers receive coordinated initial state.
 *
 * @module lib/services/InitializationService
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nManager } from 'react-native';
import { APP_DEFAULTS } from '../constants/appDefaults';
import { initI18n } from '../i18n';

/**
 * Application initialization state
 */
export interface AppInitState {
  locale: string;
  isDarkMode: boolean;
  isPremium: boolean;
  isReady: boolean;
  error?: string;
}

/**
 * Initialization service for coordinated app startup
 *
 * Solves the race condition where multiple providers independently fetch AsyncStorage,
 * leading to inconsistent state and UI flashes.
 */
class InitializationServiceClass {
  private initState: AppInitState | null = null;
  private initPromise: Promise<AppInitState> | null = null;

  /**
   * Initialize the application
   * Returns a promise that resolves when all async operations complete
   *
   * @returns AppInitState with all initialized values
   */
  async initialize(): Promise<AppInitState> {
    // Return cached result if already initialized
    if (this.initState) {
      return this.initState;
    }

    // Return pending promise if initialization is in progress
    if (this.initPromise) {
      return this.initPromise;
    }

    // Start initialization and cache the promise to prevent concurrent initializations
    this.initPromise = this.performInitialization();
    return this.initPromise;
  }

  /**
   * Perform the actual initialization
   * Fetches all async data in parallel, then applies setup
   */
  private async performInitialization(): Promise<AppInitState> {
    try {
      // Parallel fetch from AsyncStorage
      const [locale, isDarkMode, isPremium] = await Promise.all([
        this.getLocale(),
        this.getThemePreference(),
        this.getPremiumStatus(),
      ]);

      // Determine RTL requirement
      const isRTL = this.isRTLLocale(locale);

      // Apply i18n initialization
      initI18n(locale);

      // Apply RTL setup (separate from render cycle)
      this.setupRTL(isRTL);

      // Cache the result
      this.initState = {
        locale,
        isDarkMode,
        isPremium,
        isReady: true,
      };

      return this.initState;
    } catch (error) {
      const errorState: AppInitState = {
        locale: APP_DEFAULTS.DEFAULT_LOCALE,
        isDarkMode: false,
        isPremium: false,
        isReady: true,
        error: `Initialization failed: ${error instanceof Error ? error.message : String(error)}`,
      };
      this.initState = errorState;
      console.error('[InitializationService]', errorState.error);
      return errorState;
    }
  }

  /**
   * Retrieve locale preference from storage
   */
  private async getLocale(): Promise<string> {
    try {
      const stored = await AsyncStorage.getItem(APP_DEFAULTS.STORAGE_KEYS.LANGUAGE_PREFERENCE);
      return stored || APP_DEFAULTS.DEFAULT_LOCALE;
    } catch (error) {
      console.warn('[InitializationService] Failed to load locale:', error);
      return APP_DEFAULTS.DEFAULT_LOCALE;
    }
  }

  /**
   * Retrieve theme preference from storage
   */
  private async getThemePreference(): Promise<boolean> {
    try {
      const stored = await AsyncStorage.getItem(APP_DEFAULTS.STORAGE_KEYS.THEME_PREFERENCE);
      return stored === 'dark'; // Returns false by default (light mode)
    } catch (error) {
      console.warn('[InitializationService] Failed to load theme:', error);
      return false;
    }
  }

  /**
   * Retrieve premium status from storage
   */
  private async getPremiumStatus(): Promise<boolean> {
    try {
      const stored = await AsyncStorage.getItem(APP_DEFAULTS.STORAGE_KEYS.PREMIUM);
      return stored === 'true';
    } catch (error) {
      console.warn('[InitializationService] Failed to load premium status:', error);
      return false;
    }
  }

  /**
   * Check if locale is RTL
   */
  private isRTLLocale(locale: string): boolean {
    const RTL_LOCALES = ['ar', 'ur'];
    return RTL_LOCALES.includes(locale);
  }

  /**
   * Setup RTL configuration (side-effect free, can be called before render)
   */
  private setupRTL(shouldBeRTL: boolean): void {
    try {
      // Only update if different from current state
      if (I18nManager.isRTL !== shouldBeRTL) {
        I18nManager.allowRTL(shouldBeRTL);
        // In React Native 0.71+, this works synchronously without app restart
        I18nManager.forceRTL(shouldBeRTL);
      }
    } catch (error) {
      console.warn('[InitializationService] Failed to setup RTL:', error);
    }
  }

  /**
   * Get current initialization state (use this in providers)
   */
  getState(): AppInitState | null {
    return this.initState;
  }

  /**
   * Reset initialization (for testing or recovery)
   */
  reset(): void {
    this.initState = null;
    this.initPromise = null;
  }
}

// Export singleton instance
export const InitializationService = new InitializationServiceClass();
