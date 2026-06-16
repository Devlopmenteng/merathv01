/**
 * Cache Management Utility for Calculator Engine
 * أداة إدارة التخزين المؤقت
 *
 * Provides bounded, TTL-aware caching with automatic invalidation
 * to prevent memory leaks in the inheritance calculation engine.
 *
 * @module lib/engine/CacheManager
 */

/**
 * Cache entry with metadata
 */
interface CacheEntryMetadata<T> {
  value: T;
  timestamp: number;
  hits: number;
}

/**
 * Cache configuration
 */
interface CacheConfig {
  /** Maximum number of entries before eviction */
  maxSize: number;
  /** Time-to-live in milliseconds (0 = no TTL) */
  ttl: number;
}

/**
 * Bounded cache manager with TTL support
 * Automatically evicts oldest entries when maxSize is exceeded
 */
export class BoundedCache<K, V> {
  private cache: Map<K, CacheEntryMetadata<V>>;
  private keyOrder: K[] = [];
  private config: Required<CacheConfig>;

  constructor(config: CacheConfig = { maxSize: 100, ttl: 0 }) {
    this.cache = new Map();
    this.config = config;
  }

  /**
   * Get value from cache
   * Returns null if entry doesn't exist or has expired
   */
  get(key: K): V | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check TTL expiration (ttl of 0 means no expiration)
    if (this.config.ttl > 0 && Date.now() - entry.timestamp > this.config.ttl) {
      this.cache.delete(key);
      this.keyOrder = this.keyOrder.filter((k) => k !== key);
      return null;
    }

    // Update hit count and timestamp
    entry.hits++;
    entry.timestamp = Date.now();

    return entry.value;
  }

  /**
   * Set value in cache
   * Automatically evicts oldest entry if cache is full
   */
  set(key: K, value: V): void {
    // If key already exists, update it
    if (this.cache.has(key)) {
      const entry = this.cache.get(key)!;
      entry.value = value;
      entry.timestamp = Date.now();
      return;
    }

    // If cache is full, evict least recently used entry
    if (this.cache.size >= this.config.maxSize) {
      const oldestKey = this.keyOrder.shift();
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    // Add new entry
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      hits: 0,
    });
    this.keyOrder.push(key);
  }

  /**
   * Check if key exists in cache (and not expired)
   */
  has(key: K): boolean {
    return this.get(key) !== null;
  }

  /**
   * Clear all entries from cache
   */
  clear(): void {
    this.cache.clear();
    this.keyOrder = [];
  }

  /**
   * Clear entries matching a predicate
   * Useful for invalidating madhab-specific caches
   */
  clearMatching(predicate: (key: K) => boolean): void {
    const keysToDelete = Array.from(this.cache.keys()).filter(predicate);
    keysToDelete.forEach((key) => {
      this.cache.delete(key);
      this.keyOrder = this.keyOrder.filter((k) => k !== key);
    });
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      entries: Array.from(this.cache.entries()).map(([key, entry]) => ({
        key,
        hits: entry.hits,
        age: Date.now() - entry.timestamp,
      })),
    };
  }
}

/**
 * Default cache configurations for calculator engine
 */
export const DEFAULT_CACHE_CONFIGS = {
  madhab: { maxSize: 4, ttl: 0 }, // 4 madhabs, no TTL (immutable)
  rules: { maxSize: 50, ttl: 0 }, // 50 rule entries max, no TTL (immutable)
  fraction: { maxSize: 200, ttl: 5 * 60 * 1000 }, // 200 fractions, 5 min TTL
};
