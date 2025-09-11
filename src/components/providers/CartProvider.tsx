'use client';

import { useEffect } from 'react';
import { useCartStore } from '@/stores/cart';

interface CartProviderProps {
  children: React.ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const { getCart } = useCartStore();

  useEffect(() => {
    console.log('🛒 CartProvider initializing cart...');
    getCart();
  }, [getCart]);

  return <>{children}</>;
}