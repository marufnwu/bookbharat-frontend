/**
 * Cache Cleaner Component
 * Automatically clears old cache versions on app start
 * Add this to your root layout
 */

'use client';

import { useEffect } from 'react';
import { ClientCache, CACHE_VERSION } from '@/lib/cache';

export function CacheCleaner() {
  useEffect(() => {
    // Clear old cache versions
    ClientCache.clearOldVersions();

    // Log current cache version (development only)
    if (process.env.NODE_ENV === 'development') {
      console.log('[Cache] Current version:', CACHE_VERSION);
      console.log('[Cache] Old versions cleared');
    }
  }, []);

  return null; // This component doesn't render anything
}
