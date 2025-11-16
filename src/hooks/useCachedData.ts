/**
 * Custom hooks for cached data fetching
 */

import { useState, useEffect, useCallback } from 'react';
import { ClientCache, CacheDuration, versionedKey } from '@/lib/cache';

interface UseCachedDataOptions {
  ttl?: number;
  fetchOnMount?: boolean;
  dependencies?: any[];
}

/**
 * Hook for fetching and caching data
 */
export function useCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: UseCachedDataOptions = {}
) {
  const {
    ttl = CacheDuration.MEDIUM,
    fetchOnMount = true,
    dependencies = [],
  } = options;

  const [data, setData] = useState<T | null>(() => {
    // Try to get from cache on mount
    return ClientCache.get<T>(key);
  });

  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async (force = false) => {
    // Check cache first unless forced
    if (!force) {
      const cached = ClientCache.get<T>(key);
      if (cached) {
        setData(cached);
        setLoading(false);
        return cached;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const result = await fetcher();
      ClientCache.set(key, result, ttl);
      setData(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch data');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [key, fetcher, ttl]);

  const invalidate = useCallback(() => {
    ClientCache.remove(key);
    setData(null);
  }, [key]);

  const refresh = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  useEffect(() => {
    if (fetchOnMount) {
      fetchData();
    }
  }, [fetchOnMount, ...dependencies]);

  return {
    data,
    loading,
    error,
    refresh,
    invalidate,
    refetch: fetchData,
  };
}

/**
 * Hook for products with caching
 */
export function useCachedProducts(filters: Record<string, any> = {}) {
  const key = `products:${JSON.stringify(filters)}`;

  return useCachedData(
    key,
    async () => {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/products?${queryParams}`
      );

      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      return data.data;
    },
    {
      ttl: CacheDuration.MEDIUM,
      dependencies: [JSON.stringify(filters)],
    }
  );
}

/**
 * Hook for single product with caching
 */
export function useCachedProduct(id: string | number) {
  const key = `product:${id}`;

  return useCachedData(
    key,
    async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/products/${id}`
      );

      if (!response.ok) throw new Error('Failed to fetch product');
      const data = await response.json();
      return data.data.product;
    },
    {
      ttl: CacheDuration.LONG,
      dependencies: [id],
    }
  );
}

/**
 * Hook for categories with caching
 */
export function useCachedCategories() {
  const key = 'categories:all';

  return useCachedData(
    key,
    async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/categories`
      );

      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      return data.data;
    },
    {
      ttl: CacheDuration.DAY,
    }
  );
}

/**
 * Hook for search with caching
 */
export function useCachedSearch(query: string) {
  const key = `search:${query}`;

  return useCachedData(
    key,
    async () => {
      if (!query.trim()) return [];

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/products/search?query=${encodeURIComponent(query)}`
      );

      if (!response.ok) throw new Error('Failed to search');
      const data = await response.json();
      return data.data;
    },
    {
      ttl: CacheDuration.SHORT,
      fetchOnMount: !!query,
      dependencies: [query],
    }
  );
}

/**
 * Hook for clearing old cache versions on app start
 */
export function useCacheCleaner() {
  useEffect(() => {
    // Clear old cache versions on mount
    ClientCache.clearOldVersions();
  }, []);
}
