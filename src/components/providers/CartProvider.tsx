'use client';

import { useEffect } from 'react';
import { useCartStore } from '@/stores/cart';

interface CartProviderProps {
  children: React.ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const loadCartFromStorage = useCartStore(state => state.loadCartFromStorage);
  const getCart = useCartStore(state => state.getCart);

  useEffect(() => {
    loadCartFromStorage();
    getCart(undefined, undefined);
  }, [loadCartFromStorage, getCart]);

  return <>{children}</>;
}