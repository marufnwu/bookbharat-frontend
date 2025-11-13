'use client';

import { useEffect } from 'react';
import '@/styles/mobile-optimizations.css';

export function MobileStyleProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.body.classList.add('mobile-optimized');
 
     return () => {

  return <>{children}</>;
}