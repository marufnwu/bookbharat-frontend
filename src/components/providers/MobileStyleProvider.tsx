'use client';

import { useEffect } from 'react';
import '@/styles/mobile-optimizations.css';

export function MobileStyleProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Ensure mobile styles are loaded
    console.log('Mobile optimization styles loaded');
  }, []);

  return <>{children}</>;
}