'use client';

import { AuthProvider } from './AuthProvider';
import { CartProvider } from './CartProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { useState } from 'react';
import '@/lib/logger';

// Group non-critical providers together to be lazy loaded
export function ClientProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          {children}
          <Toaster position="top-right" richColors closeButton />
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
