'use client';

import { useEffect } from 'react';
import { useCartStore } from '@/stores/cart';

interface CartProviderProps {
  children: React.ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const { getCart } = useCartStore();

  useEffect(() => {
    if (!cartStore.cart && cartStore.loadCart) {
      cartStore.loadCart();
    }
  }, [getCart]);

  return <>{children}</>;
}