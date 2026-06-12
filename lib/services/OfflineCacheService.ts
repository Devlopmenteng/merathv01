import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_PREFIX = 'merath_cache_';
const CACHE_VERSION = '1.0';
const CACHE_VERSION_KEY = `${CACHE_PREFIX}version`;

/**
 * Cache entry metadata
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  version: string;
}

/**
 * Offline Cache Service
 * Service for managing offline data caching with AsyncStorage
 */
export class OfflineCacheService {
  private cacheEnabled = true;

  /**
   * Initialize the cache service
   */
  async initialize(): Promise<void> {
    try {
      const storedVersion = await AsyncStorage.getItem(CACHE_VERSION_KEY);

      if (storedVersion !== CACHE_VERSION) {
        // Clear cache if version mismatch
        await this.clearAll();
        await AsyncStorage.setItem(CACHE_VERSION_KEY, CACHE_VERSION);
      }

      this.cacheEnabled = true;
    } catch (error) {
      console.error('Failed to initialize offline cache:', error);
      this.cacheEnabled = false;
    }
  }

  /**
   * Check if cache is enabled
   */
  isCacheEnabled(): boolean {
    return this.cacheEnabled;
  }

  /**
   * Generate cache key
   */
  private getCacheKey(key: string): string {
    return `${CACHE_PREFIX}${key}`;
  }

  /**
   * Store data in cache
   */
  async set<T>(key: string, data: T, ttl?: number): Promise<void> {
    if (!this.cacheEnabled) return;

    try {
      const cacheKey = this.getCacheKey(key);
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        version: CACHE_VERSION,
      };

      await AsyncStorage.setItem(cacheKey, JSON.stringify(entry));

      // Store expiration time if TTL is provided
      if (ttl !== undefined) {
        const expirationKey = `${cacheKey}_expires`;
        await AsyncStorage.setItem(expirationKey, String(Date.now() + ttl));
      }
    } catch (error) {
      console.error(`Failed to cache data for key: ${key}`, error);
    }
  }

  /**
   * Retrieve data from cache
   */
  async get<T>(key: string): Promise<T | null> {
    if (!this.cacheEnabled) return null;

    try {
      const cacheKey = this.getCacheKey(key);
      const cached = await AsyncStorage.getItem(cacheKey);

      if (!cached) return null;

      const entry: CacheEntry<T> = JSON.parse(cached);

      // Check if expired
      const expirationKey = `${cacheKey}_expires`;
      const expiration = await AsyncStorage.getItem(expirationKey);

      if (expiration && Date.now() > parseInt(expiration, 10)) {
        // Cache expired, remove it
        await this.remove(key);
        return null;
      }

      return entry.data;
    } catch (error) {
      console.error(`Failed to retrieve cached data for key: ${key}`, error);
      return null;
    }
  }

  /**
   * Remove specific entry from cache
   */
  async remove(key: string): Promise<void> {
    if (!this.cacheEnabled) return;

    try {
      const cacheKey = this.getCacheKey(key);
      await AsyncStorage.removeItem(cacheKey);
      await AsyncStorage.removeItem(`${cacheKey}_expires`);
    } catch (error) {
      console.error(`Failed to remove cache entry for key: ${key}`, error);
    }
  }

  /**
   * Clear all cache entries
   */
  async clearAll(): Promise<void> {
    if (!this.cacheEnabled) return;

    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter((key) => key.startsWith(CACHE_PREFIX));

      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.error('Failed to clear cache', error);
    }
  }

  /**
   * Get cache size (approximate)
   */
  async getCacheSize(): Promise<number> {
    if (!this.cacheEnabled) return 0;

    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter((key) => key.startsWith(CACHE_PREFIX));

      let totalSize = 0;
      for (const key of cacheKeys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          totalSize += value.length;
        }
      }

      return totalSize;
    } catch (error) {
      console.error('Failed to get cache size', error);
      return 0;
    }
  }

  /**
   * Cache static data (glossary, Fiqh references, etc.)
   */
  async cacheStaticData(): Promise<void> {
    // This will be called to cache frequently accessed static data
    // Implementation depends on what data needs to be cached
  }

  /**
   * Check if cache has data for a key
   */
  async has(key: string): Promise<boolean> {
    if (!this.cacheEnabled) return false;

    const data = await this.get(key);
    return data !== null;
  }
}

// Singleton instance
export const offlineCacheService = new OfflineCacheService();

/**
 * Initialize offline cache
 */
export async function initializeOfflineCache(): Promise<void> {
  await offlineCacheService.initialize();
}
