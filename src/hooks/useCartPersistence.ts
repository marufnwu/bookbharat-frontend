'use client';

import { useEffect, useRef } from 'react';
import { useCartStore } from '@/stores/cart';
import { useHydratedAuth } from '@/stores/auth';

export function useCartPersistence() {
  const { 
    cart, 
    saveCartToStorage, 
    loadCartFromStorage, 
    enableCartRecovery,
    disableCartRecovery,
    startAbandonedCartTimer,
    clearAbandonedCartTimer
  } = useCartStore();
  
  const { user, isAuthenticated } = useHydratedAuth();
  const hasInitialized = useRef(false);

  // Initialize cart persistence on mount
  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      
      // Try to load cart from storage first
      const restored = loadCartFromStorage();
      
      if (restored) {
        console.log('🛒 Cart restored from storage');
      }
      
      // Enable cart recovery for authenticated users
      if (isAuthenticated && user?.email) {
        enableCartRecovery(user.email);
      } else {
        enableCartRecovery();
      }
    }
  }, [isAuthenticated, user?.email, loadCartFromStorage, enableCartRecovery]);

  // Save cart to storage whenever cart changes
  useEffect(() => {
    if (cart && cart.items.length > 0) {
      saveCartToStorage();
      
      // Start abandoned cart timer if recovery is enabled
      startAbandonedCartTimer();
    } else {
      // Clear timer if cart is empty
      clearAbandonedCartTimer();
    }
  }, [cart, saveCartToStorage, startAbandonedCartTimer, clearAbandonedCartTimer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearAbandonedCartTimer();
    };
  }, [clearAbandonedCartTimer]);

  return {
    cartRestored: hasInitialized.current,
    cartRecoveryEnabled: useCartStore.getState().cartRecoveryEnabled
  };
}
