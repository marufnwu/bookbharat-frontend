'use client';

// TODO: Replace console.log/console.error with logger from '@/lib/logger' for production
// Currently 13 console statements used for debugging

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Cart, CartItem, Product } from '@/types';
import { cartApi } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

interface CartState {
  cart: Cart | null;
  isLoading: boolean;
  availableCoupons: any[];
  deliveryPincode: string | null;
  selectedPaymentMethod: string | null;

  // Actions
  getCart: (deliveryPincode?: string, paymentMethod?: string) => Promise<void>;
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  applyCoupon: (couponCode: string) => Promise<void>;
  removeCoupon: () => Promise<void>;
  getAvailableCoupons: () => Promise<void>;
  calculateShipping: (pincode: string, pickupPincode?: string) => Promise<void>;
  setDeliveryPincode: (pincode: string) => void;
  setPaymentMethod: (paymentMethod: string | null) => Promise<void>;

  // Local state helpers
  getTotalItems: () => number;
  getSubtotal: () => number;
  getItemQuantity: (productId: number) => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: null,
      isLoading: false,
      availableCoupons: [],
      deliveryPincode: null,
      selectedPaymentMethod: null,

      getCart: async (deliveryPincode?: string, paymentMethod?: string) => {
        try {
          set({ isLoading: true });

          // Log authentication method for debugging
          const authToken = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
          const sessionId = typeof window !== 'undefined' ? localStorage.getItem('guest_session_id') : null;

          if (authToken) {
            console.log('🛒 Fetching cart as authenticated user');
          } else {
            console.log('🛒 Fetching cart with session ID:', sessionId);
          }

          // Use parameters or from state
          const pincode = deliveryPincode || get().deliveryPincode;
          const method = paymentMethod || get().selectedPaymentMethod;
          const params: any = {};
          if (pincode) params.delivery_pincode = pincode;
          if (method) params.payment_method = method;

          const response = await cartApi.getCart(params);
          console.log('🛒 Raw API response:', JSON.stringify(response, null, 2));
          
          // Handle different possible response structures
          let apiCart = null;
          if (response?.cart) {
            // Direct cart response: { success: true, cart: {...} }
            apiCart = response.cart;
          } else if (response?.data?.cart) {
            // Nested cart response: { data: { cart: {...} } }
            apiCart = response.data.cart;
          } else if (response?.data) {
            // Cart as data: { data: {...} }
            apiCart = response.data;
          }
          
          console.log('🛒 Extracted cart data:', JSON.stringify(apiCart, null, 2));
          
          if (!apiCart) {
            console.log('🛒 No cart data found, setting to null');
            set({ cart: null, isLoading: false });
            return;
          }
          
          // Calculate total items from items array
          const items = apiCart.items || [];
          const calculatedTotalItems = items.reduce((total: number, item: any) => total + (item.quantity || 0), 0);
          
          // Use the summary.total_items first as it represents total quantity, not count of different items
          const totalItems = apiCart.summary?.total_items || calculatedTotalItems || apiCart.items_count || 0;
          
          const transformedCart = {
            id: apiCart.id || 0,
            user_id: apiCart.user_id || 0,
            items: items,
            subtotal: apiCart.summary?.subtotal || apiCart.subtotal || 0,
            total_items: totalItems,
            created_at: apiCart.created_at || new Date().toISOString(),
            updated_at: apiCart.updated_at || new Date().toISOString(),
            summary: apiCart.summary || null
          };
          
          console.log('🛒 Final transformed cart:', JSON.stringify(transformedCart, null, 2));
          console.log('🛒 Total items - calculated:', calculatedTotalItems, 'from API summary:', apiCart.summary?.total_items, 'final:', totalItems);
          console.log('🛒 CRITICAL - summary.charges:', apiCart.summary?.charges);
          console.log('🛒 CRITICAL - summary.total_charges:', apiCart.summary?.total_charges);
          console.log('🛒 CRITICAL - full summary:', JSON.stringify(apiCart.summary, null, 2));

          set({ cart: transformedCart, isLoading: false });
        } catch (error) {
          console.error('🛒 Failed to fetch cart:', error);
          set({ cart: null, isLoading: false });
        }
      },

      addToCart: async (product: Product, quantity = 1) => {
        try {
          set({ isLoading: true });
          await cartApi.addToCart(product.id, quantity);
          
          // Refresh cart from server
          await get().getCart();
          
          // Show success toast
          toast({
            title: "Added to cart",
            description: `${product.title} has been added to your cart.`,
            variant: "success",
          });
        } catch (error) {
          set({ isLoading: false });
          
          // Show error toast
          toast({
            title: "Failed to add to cart",
            description: "Something went wrong. Please try again.",
            variant: "destructive",
          });
          
          throw error;
        }
      },

      updateQuantity: async (itemId: number, quantity: number) => {
        try {
          set({ isLoading: true });
          await cartApi.updateCartItem(itemId, quantity);
          
          // Refresh cart from server
          await get().getCart();
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      removeItem: async (itemId: number) => {
        try {
          set({ isLoading: true });
          await cartApi.removeCartItem(itemId);
          
          // Refresh cart from server
          await get().getCart();
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      clearCart: async () => {
        try {
          set({ isLoading: true });
          await cartApi.clearCart();
          set({ cart: null, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      getTotalItems: () => {
        const { cart } = get();
        const totalItems = cart?.total_items || 0;
        console.log('🛒 getTotalItems called - cart:', cart ? 'exists' : 'null', 'total_items:', totalItems);
        return totalItems;
      },

      getSubtotal: () => {
        const { cart } = get();
        return cart?.subtotal || 0;
      },

      getItemQuantity: (productId: number) => {
        const { cart } = get();
        if (!cart?.items) return 0;
        
        const item = cart.items.find(item => item.product_id === productId);
        return item?.quantity || 0;
      },

      applyCoupon: async (couponCode: string) => {
        try {
          set({ isLoading: true });
          await cartApi.applyCoupon(couponCode);
          
          // Refresh cart from server
          await get().getCart();
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      removeCoupon: async () => {
        try {
          set({ isLoading: true });
          await cartApi.removeCoupon();
          
          // Refresh cart from server
          await get().getCart();
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      getAvailableCoupons: async () => {
        try {
          const response = await cartApi.getAvailableCoupons();
          const coupons = response.data?.coupons || response.coupons || [];
          set({ availableCoupons: coupons });
        } catch (error) {
          console.error('Failed to fetch available coupons:', error);
          set({ availableCoupons: [] });
        }
      },

      calculateShipping: async (pincode: string, pickupPincode?: string) => {
        try {
          set({ isLoading: true });
          const response = await cartApi.calculateShipping(pincode, pickupPincode);

          if (response.success && response.summary) {
            // Update delivery pincode
            set({ deliveryPincode: pincode });

            // FIXED: Refresh cart with new shipping calculation AND current payment method
            // This ensures COD charges are included in shipping estimate
            const currentPaymentMethod = get().selectedPaymentMethod;
            await get().getCart(pincode, currentPaymentMethod);
          }
        } catch (error) {
          console.error('Failed to calculate shipping:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      setDeliveryPincode: (pincode: string) => {
        set({ deliveryPincode: pincode });
      },

      setPaymentMethod: async (paymentMethod: string | null) => {
        try {
          console.log('💳 Setting payment method:', paymentMethod);
          set({ selectedPaymentMethod: paymentMethod, isLoading: true });

          // Get current pincode
          const pincode = get().deliveryPincode;

          // Recalculate cart with payment method
          await get().getCart(pincode || undefined, paymentMethod || undefined);

          console.log('💳 Cart recalculated with payment method');
        } catch (error) {
          console.error('Failed to set payment method:', error);
          set({ isLoading: false });
          throw error;
        }
      },
    }),
    {
      name: 'cart-store',
      partialize: (state) => ({
        cart: state.cart,
        deliveryPincode: state.deliveryPincode,
        selectedPaymentMethod: state.selectedPaymentMethod,
      }),
    }
  )
);