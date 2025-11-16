/**
 * Frontend Cache Management with Versioning
 * Provides instant cache invalidation capabilities
 */

/**
 * Cache version - update this to invalidate all frontend cache
 * Automatically updated on each build via BUILD_ID
 */
export const CACHE_VERSION = process.env.NEXT_BUILD_ID || 'v1';

/**
 * Cache durations (in seconds)
 */
export const CacheDuration = {
  NONE: 0,
  SHORT: 60,          // 1 minute
  MEDIUM: 300,        // 5 minutes
  LONG: 3600,         // 1 hour
  DAY: 86400,         // 24 hours
  WEEK: 604800,       // 7 days
} as const;

/**
 * Cache tags for selective invalidation
 */
export const CacheTags = {
  PRODUCTS: 'products',
  CATEGORIES: 'categories',
  HOMEPAGE: 'homepage',
  USER: 'user',
  CART: 'cart',
  ORDERS: 'orders',
  SEARCH: 'search',
} as const;

/**
 * Generate versioned cache key
 */
export function versionedKey(key: string): string {
  return `${key}:${CACHE_VERSION}`;
}

/**
 * Fetch with automatic caching and versioning
 */
export async function cachedFetch<T = any>(
  url: string,
  options: {
    revalidate?: number;
    tags?: string[];
    cache?: RequestCache;
  } = {}
): Promise<T> {
  const {
    revalidate = CacheDuration.MEDIUM,
    tags = [],
    cache = 'force-cache',
  } = options;

  // Add version to tags for automatic invalidation
  const versionedTags = [...tags, `version:${CACHE_VERSION}`];

  const response = await fetch(url, {
    next: {
      revalidate,
      tags: versionedTags,
    },
    cache,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

/**
 * Client-side cache with localStorage
 */
export class ClientCache {
  private static getKey(key: string): string {
    return versionedKey(key);
  }

  static set<T>(key: string, value: T, ttl?: number): void {
    if (typeof window === 'undefined') return;

    const item = {
      value,
      timestamp: Date.now(),
      ttl: ttl || CacheDuration.MEDIUM,
      version: CACHE_VERSION,
    };

    try {
      localStorage.setItem(this.getKey(key), JSON.stringify(item));
    } catch (error) {
      console.error('Failed to set cache:', error);
    }
  }

  static get<T>(key: string): T | null {
    if (typeof window === 'undefined') return null;

    try {
      const item = localStorage.getItem(this.getKey(key));
      if (!item) return null;

      const parsed = JSON.parse(item);

      // Check version
      if (parsed.version !== CACHE_VERSION) {
        this.remove(key);
        return null;
      }

      // Check expiration
      if (parsed.ttl && Date.now() - parsed.timestamp > parsed.ttl * 1000) {
        this.remove(key);
        return null;
      }

      return parsed.value;
    } catch (error) {
      console.error('Failed to get cache:', error);
      return null;
    }
  }

  static remove(key: string): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem(this.getKey(key));
    } catch (error) {
      console.error('Failed to remove cache:', error);
    }
  }

  static clear(): void {
    if (typeof window === 'undefined') return;

    try {
      // Clear all cache items
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.includes(CACHE_VERSION)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }

  static clearOldVersions(): void {
    if (typeof window === 'undefined') return;

    try {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        // Remove items from old versions
        if (!key.includes(CACHE_VERSION)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Failed to clear old versions:', error);
    }
  }
}

/**
 * Cache warming utilities
 */
export async function warmCache() {
  // Warm up critical pages
  const criticalUrls = [
    '/',
    '/products',
    '/categories',
  ];

  await Promise.all(
    criticalUrls.map(url =>
      fetch(url, { next: { revalidate: CacheDuration.MEDIUM } })
    )
  );
}

/**
 * Cache invalidation hook (client-side)
 */
export function useInvalidateCache() {
  const invalidateAll = () => {
    ClientCache.clear();

    // Clear router cache
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  const invalidateTag = (tag: string) => {
    // For now, clear all - can be enhanced with more granular control
    ClientCache.clear();
  };

  return {
    invalidateAll,
    invalidateTag,
  };
}

/**
 * SWR config with cache versioning
 */
export const swrConfig = {
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  dedupingInterval: CacheDuration.SHORT * 1000,
  focusThrottleInterval: CacheDuration.SHORT * 1000,
  provider: () => {
    // Use Map with version checking
    const map = new Map();

    return {
      get: (key: string) => {
        const vKey = versionedKey(key);
        return map.get(vKey);
      },
      set: (key: string, value: any) => {
        const vKey = versionedKey(key);
        map.set(vKey, value);
      },
      delete: (key: string) => {
        const vKey = versionedKey(key);
        map.delete(vKey);
      },
    };
  },
};
