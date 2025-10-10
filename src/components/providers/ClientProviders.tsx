'use client';

import { AuthProvider } from './AuthProvider';
import { CartProvider } from './CartProvider';
import '@/lib/logger';

// Group non-critical providers together to be lazy loaded
export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        {children}
      </CartProvider>
    </AuthProvider>
  );
}
