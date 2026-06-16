/**
 * Font Loading Optimization Service
 *
 * Features:
 * - Pre-load fonts asynchronously
 * - Cache font state in AsyncStorage
 * - Lazy load secondary fonts (Noto Naskh Arabic)
 * - Error handling and fallback
 * - Progress tracking for UX
 *
 * Benefits:
 * - Reduces app startup time
 * - Prevents font flash of unstyled text (FOUT)
 * - Enables progressive font loading
 */

import * as Font from 'expo-font';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import {
  NotoNaskhArabic_400Regular,
  NotoNaskhArabic_500Medium,
  NotoNaskhArabic_600SemiBold,
  NotoNaskhArabic_700Bold,
} from '@expo-google-fonts/noto-naskh-arabic';

interface FontLoadingProgress {
  stage: 'pending' | 'primary' | 'secondary' | 'complete';
  progress: number; // 0-100
  error?: Error | null;
}

interface FontCache {
  loaded: boolean;
  timestamp: number;
  version: string;
}

class FontLoadingService {
  private static instance: FontLoadingService;
  private progress: FontLoadingProgress = { stage: 'pending', progress: 0 };
  private primaryFonts = {
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  };
  private secondaryFonts = {
    NotoNaskhArabic_400Regular,
    NotoNaskhArabic_500Medium,
    NotoNaskhArabic_600SemiBold,
    NotoNaskhArabic_700Bold,
  };
  private CACHE_KEY = 'font_loading_cache';
  private CACHE_VERSION = '1.0.0';

  private constructor() {}

  static getInstance(): FontLoadingService {
    if (!FontLoadingService.instance) {
      FontLoadingService.instance = new FontLoadingService();
    }
    return FontLoadingService.instance;
  }

  /**
   * Load primary fonts (Inter) - critical path
   * Should complete as quickly as possible
   */
  async loadPrimaryFonts(): Promise<boolean> {
    try {
      this.progress = { stage: 'primary', progress: 10 };

      // Check cache first
      const cached = await this.checkCache();
      if (cached) {
        this.progress = { stage: 'primary', progress: 50 };
        // Still load to ensure in-memory availability
      }

      await Font.loadAsync(this.primaryFonts);

      this.progress = { stage: 'primary', progress: 60 };
      return true;
    } catch (error) {
      console.error('[FontLoadingService] Failed to load primary fonts:', error);
      this.progress = {
        stage: 'primary',
        progress: 0,
        error: error instanceof Error ? error : new Error(String(error)),
      };
      return false;
    }
  }

  /**
   * Load secondary fonts (RTL fonts) - can be deferred
   * Loaded after app becomes interactive
   */
  async loadSecondaryFonts(): Promise<boolean> {
    try {
      this.progress = { stage: 'secondary', progress: 70 };

      await Font.loadAsync(this.secondaryFonts);

      this.progress = { stage: 'secondary', progress: 90 };
      await this.updateCache();

      return true;
    } catch (error) {
      console.error('[FontLoadingService] Failed to load secondary fonts:', error);
      // Don't fail on secondary fonts - app can continue
      this.progress = {
        stage: 'secondary',
        progress: 90,
        error: error instanceof Error ? error : new Error(String(error)),
      };
      return false;
    }
  }

  /**
   * Load all fonts sequentially
   * Use for critical app startup
   */
  async loadAllFonts(): Promise<boolean> {
    const primarySuccess = await this.loadPrimaryFonts();
    if (!primarySuccess) return false;

    const secondarySuccess = await this.loadSecondaryFonts();
    this.progress = { stage: 'complete', progress: 100 };

    return primarySuccess && secondarySuccess;
  }

  /**
   * Get current loading progress
   */
  getProgress(): FontLoadingProgress {
    return { ...this.progress };
  }

  /**
   * Check if fonts are cached and valid
   */
  private async checkCache(): Promise<boolean> {
    try {
      const cached = await AsyncStorage.getItem(this.CACHE_KEY);
      if (!cached) return false;

      const cacheData: FontCache = JSON.parse(cached);

      // Cache valid for 7 days
      const cacheAge = Date.now() - cacheData.timestamp;
      const MAX_CACHE_AGE = 7 * 24 * 60 * 60 * 1000;

      return (
        cacheData.loaded && cacheData.version === this.CACHE_VERSION && cacheAge < MAX_CACHE_AGE
      );
    } catch (error) {
      console.warn('[FontLoadingService] Cache check failed:', error);
      return false;
    }
  }

  /**
   * Update font cache
   */
  private async updateCache(): Promise<void> {
    try {
      const cacheData: FontCache = {
        loaded: true,
        timestamp: Date.now(),
        version: this.CACHE_VERSION,
      };
      await AsyncStorage.setItem(this.CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('[FontLoadingService] Failed to update cache:', error);
    }
  }

  /**
   * Clear font cache (for debugging/manual reset)
   */
  async clearCache(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.CACHE_KEY);
    } catch (error) {
      console.warn('[FontLoadingService] Failed to clear cache:', error);
    }
  }
}

export const fontLoadingService = FontLoadingService.getInstance();
