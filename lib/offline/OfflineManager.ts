/**
 * Offline Mode Support
 * دعم وضع عدم الاتصال بالإنترنت
 *
 * This module provides offline functionality for the inheritance calculator,
 * allowing users to perform calculations without internet connectivity by caching
 * results and providing offline access to essential features.
 *
 * @module lib/offline/OfflineManager
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CalculationResult, EstateInput, HeirEntry, MadhhabType } from '../engine/types';

/**
 * Offline storage keys
 */
const STORAGE_KEYS = {
  CALCULATION_CACHE: 'merath_calculation_cache',
  OFFLINE_CALCULATIONS: 'merath_offline_calculations',
  LAST_SYNC: 'merath_last_sync',
  OFFLINE_MODE_ENABLED: 'merath_offline_mode_enabled',
};

/**
 * Cached calculation structure
 */
export interface CachedCalculation {
  /** Unique identifier for the calculation */
  id: string;
  /** Timestamp when calculation was performed */
  timestamp: number;
  /** Estate configuration */
  estate: EstateInput;
  /** Heirs configuration */
  heirs: HeirEntry[];
  /** Madhab used for calculation */
  madhab: MadhhabType;
  /** Calculation result */
  result: CalculationResult;
  /** Whether this was calculated offline */
  isOffline: boolean;
  /** Whether this needs to be synced when online */
  needsSync: boolean;
}

/**
 * Offline status information
 */
export interface OfflineStatus {
  /** Currently in offline mode */
  isOffline: boolean;
  /** Number of cached calculations */
  cachedCount: number;
  /** Number of calculations needing sync */
  pendingSyncCount: number;
  /** Last successful sync timestamp */
  lastSync: number | null;
  /** Estimated data usage saved (in bytes) */
  dataSaved: number;
}

/**
 * Offline manager class
 */
export class OfflineManager {
  private cache: Map<string, CachedCalculation> = new Map();
  private maxSize: number = 100; // Maximum cached calculations

  /**
   * Initialize offline manager
   */
  public async initialize(): Promise<void> {
    try {
      await this.loadCache();
      console.log('[OfflineManager] Initialized successfully');
    } catch (error) {
      console.error('[OfflineManager] Initialization failed:', error);
    }
  }

  /**
   * Load cached calculations from storage
   */
  private async loadCache(): Promise<void> {
    try {
      const cachedData = await AsyncStorage.getItem(STORAGE_KEYS.CALCULATION_CACHE);
      if (cachedData) {
        const calculations: CachedCalculation[] = JSON.parse(cachedData);
        calculations.forEach((calc) => {
          this.cache.set(calc.id, calc);
        });
        console.log(`[OfflineManager] Loaded ${calculations.length} cached calculations`);
      }
    } catch (error) {
      console.error('[OfflineManager] Failed to load cache:', error);
    }
  }

  /**
   * Save cache to storage
   */
  private async saveCache(): Promise<void> {
    try {
      const calculations = Array.from(this.cache.values());
      await AsyncStorage.setItem(STORAGE_KEYS.CALCULATION_CACHE, JSON.stringify(calculations));
      console.log(`[OfflineManager] Saved ${calculations.length} calculations to cache`);
    } catch (error) {
      console.error('[OfflineManager] Failed to save cache:', error);
    }
  }

  /**
   * Generate unique calculation ID
   */
  private generateId(estate: EstateInput, heirs: HeirEntry[], madhab: MadhhabType): string {
    const data = JSON.stringify({ estate, heirs, madhab });
    return `calc_${Date.now()}_${this.hashString(data)}`;
  }

  /**
   * Simple hash function for generating IDs
   */
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Cache a calculation result
   *
   * @param estate - Estate configuration
   * @param heirs - Heirs array
   * @param madhab - Madhab used
   * @param result - Calculation result
   * @param isOffline - Whether calculated offline
   * @returns Cached calculation ID
   */
  public async cacheCalculation(
    estate: EstateInput,
    heirs: HeirEntry[],
    madhab: MadhhabType,
    result: CalculationResult,
    isOffline: boolean = false
  ): Promise<string> {
    const id = this.generateId(estate, heirs, madhab);

    const cachedCalc: CachedCalculation = {
      id,
      timestamp: Date.now(),
      estate,
      heirs,
      madhab,
      result,
      isOffline,
      needsSync: isOffline,
    };

    // Add to cache
    this.cache.set(id, cachedCalc);

    // Enforce maximum cache size
    if (this.cache.size > this.maxSize) {
      const oldestEntry = this.findOldestEntry();
      if (oldestEntry) {
        this.cache.delete(oldestEntry.id);
      }
    }

    // Persist to storage
    await this.saveCache();

    console.log(`[OfflineManager] Cached calculation: ${id}`);
    return id;
  }

  /**
   * Retrieve cached calculation
   *
   * @param estate - Estate configuration
   * @param heirs - Heirs array
   * @param madhab - Madhab used
   * @returns Cached calculation or null
   */
  public getCachedCalculation(
    estate: EstateInput,
    heirs: HeirEntry[],
    madhab: MadhhabType
  ): CachedCalculation | null {
    const id = this.generateId(estate, heirs, madhab);
    return this.cache.get(id) || null;
  }

  /**
   * Retrieve cached calculation by ID
   *
   * @param id - Calculation ID
   * @returns Cached calculation or null
   */
  public getCachedCalculationById(id: string): CachedCalculation | null {
    return this.cache.get(id) || null;
  }

  /**
   * Find oldest cache entry
   */
  private findOldestEntry(): CachedCalculation | null {
    let oldest: CachedCalculation | null = null;
    let oldestTimestamp = Date.now();

    for (const calc of this.cache.values()) {
      if (calc.timestamp < oldestTimestamp) {
        oldestTimestamp = calc.timestamp;
        oldest = calc;
      }
    }

    return oldest;
  }

  /**
   * Get all cached calculations
   *
   * @returns Array of cached calculations
   */
  public getAllCachedCalculations(): CachedCalculation[] {
    return Array.from(this.cache.values()).sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Get calculations needing sync
   *
   * @returns Array of calculations that need to be synced
   */
  public getCalculationsNeedingSync(): CachedCalculation[] {
    return this.getAllCachedCalculations().filter((calc) => calc.needsSync);
  }

  /**
   * Mark calculation as synced
   *
   * @param id - Calculation ID
   */
  public async markAsSynced(id: string): Promise<void> {
    const calc = this.cache.get(id);
    if (calc) {
      calc.needsSync = false;
      await this.saveCache();
      console.log(`[OfflineManager] Marked calculation as synced: ${id}`);
    }
  }

  /**
   * Delete cached calculation
   *
   * @param id - Calculation ID
   */
  public async deleteCachedCalculation(id: string): Promise<void> {
    if (this.cache.delete(id)) {
      await this.saveCache();
      console.log(`[OfflineManager] Deleted cached calculation: ${id}`);
    }
  }

  /**
   * Clear all cached calculations
   */
  public async clearCache(): Promise<void> {
    this.cache.clear();
    await this.saveCache();
    console.log('[OfflineManager] Cleared all cached calculations');
  }

  /**
   * Clear old calculations (older than specified days)
   *
   * @param days - Number of days to keep
   */
  public async clearOldCalculations(days: number = 30): Promise<void> {
    const cutoffTime = Date.now() - days * 24 * 60 * 60 * 1000;
    const idsToDelete: string[] = [];

    for (const [id, calc] of this.cache.entries()) {
      if (calc.timestamp < cutoffTime) {
        idsToDelete.push(id);
      }
    }

    idsToDelete.forEach((id) => this.cache.delete(id));

    if (idsToDelete.length > 0) {
      await this.saveCache();
      console.log(`[OfflineManager] Cleared ${idsToDelete.length} old calculations`);
    }
  }

  /**
   * Get offline status
   *
   * @returns Current offline status
   */
  public async getOfflineStatus(): Promise<OfflineStatus> {
    try {
      const isOfflineEnabled = await AsyncStorage.getItem(STORAGE_KEYS.OFFLINE_MODE_ENABLED);
      const lastSyncStr = await AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC);

      const isOffline = isOfflineEnabled === 'true';
      const lastSync = lastSyncStr ? parseInt(lastSyncStr, 10) : null;

      const calculations = this.getAllCachedCalculations();
      const pendingSync = calculations.filter((calc) => calc.needsSync);

      // Estimate data saved (rough estimate)
      const dataSaved = calculations.length * 2048; // Assume ~2KB per calculation

      return {
        isOffline,
        cachedCount: calculations.length,
        pendingSyncCount: pendingSync.length,
        lastSync,
        dataSaved,
      };
    } catch (error) {
      console.error('[OfflineManager] Failed to get offline status:', error);
      return {
        isOffline: false,
        cachedCount: 0,
        pendingSyncCount: 0,
        lastSync: null,
        dataSaved: 0,
      };
    }
  }

  /**
   * Enable offline mode
   */
  public async enableOfflineMode(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.OFFLINE_MODE_ENABLED, 'true');
      console.log('[OfflineManager] Offline mode enabled');
    } catch (error) {
      console.error('[OfflineManager] Failed to enable offline mode:', error);
    }
  }

  /**
   * Disable offline mode
   */
  public async disableOfflineMode(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.OFFLINE_MODE_ENABLED, 'false');
      console.log('[OfflineManager] Offline mode disabled');
    } catch (error) {
      console.error('[OfflineManager] Failed to disable offline mode:', error);
    }
  }

  /**
   * Update last sync timestamp
   */
  public async updateLastSync(): Promise<void> {
    try {
      const now = Date.now();
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC, now.toString());
      console.log('[OfflineManager] Last sync updated');
    } catch (error) {
      console.error('[OfflineManager] Failed to update last sync:', error);
    }
  }

  /**
   * Perform sync operation (placeholder for future implementation)
   */
  public async sync(): Promise<void> {
    try {
      const pendingSync = this.getCalculationsNeedingSync();

      if (pendingSync.length === 0) {
        console.log('[OfflineManager] No calculations to sync');
        return;
      }

      console.log(`[OfflineManager] Syncing ${pendingSync.length} calculations...`);

      // Mark all as synced (in real implementation, this would send to server)
      for (const calc of pendingSync) {
        await this.markAsSynced(calc.id);
      }

      await this.updateLastSync();
      console.log('[OfflineManager] Sync completed');
    } catch (error) {
      console.error('[OfflineManager] Sync failed:', error);
    }
  }

  /**
   * Get cache statistics
   *
   * @returns Cache statistics
   */
  public getCacheStats(): {
    totalCalculations: number;
    offlineCalculations: number;
    onlineCalculations: number;
    pendingSync: number;
    oldestCalculation: number | null;
    newestCalculation: number | null;
  } {
    const calculations = this.getAllCachedCalculations();
    const offlineCalcs = calculations.filter((calc) => calc.isOffline);
    const onlineCalcs = calculations.filter((calc) => !calc.isOffline);
    const pendingSync = calculations.filter((calc) => calc.needsSync);

    const timestamps = calculations.map((calc) => calc.timestamp);
    const oldest = timestamps.length > 0 ? Math.min(...timestamps) : null;
    const newest = timestamps.length > 0 ? Math.max(...timestamps) : null;

    return {
      totalCalculations: calculations.length,
      offlineCalculations: offlineCalcs.length,
      onlineCalculations: onlineCalcs.length,
      pendingSync: pendingSync.length,
      oldestCalculation: oldest,
      newestCalculation: newest,
    };
  }

  /**
   * Export cache data for backup
   *
   * @returns JSON string of cache data
   */
  public async exportCache(): Promise<string> {
    const calculations = this.getAllCachedCalculations();
    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      calculations,
      stats: this.getCacheStats(),
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Import cache data from backup
   *
   * @param data - JSON string of cache data
   */
  public async importCache(data: string): Promise<void> {
    try {
      const importData = JSON.parse(data);

      if (importData.calculations && Array.isArray(importData.calculations)) {
        importData.calculations.forEach((calc: CachedCalculation) => {
          this.cache.set(calc.id, calc);
        });

        await this.saveCache();
        console.log(`[OfflineManager] Imported ${importData.calculations.length} calculations`);
      }
    } catch (error) {
      console.error('[OfflineManager] Failed to import cache:', error);
      throw new Error('Invalid cache data format');
    }
  }
}

/**
 * Global offline manager instance
 */
export const offlineManager = new OfflineManager();

/**
 * Initialize offline manager (call on app startup)
 */
export async function initializeOfflineManager(): Promise<void> {
  await offlineManager.initialize();
}
