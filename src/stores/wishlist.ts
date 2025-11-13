'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { WishlistItem, WishlistStats, Product } from '@/types';
import { wishlistApi } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

interface WishlistState {
  wishlistItems: WishlistItem[];
  stats: WishlistStats | null;
  isLoading: boolean;
  
  // Enhanced wishlist features
  recentlyAdded: Product[];
  priceAlerts: Array<{
    productId: number;
    targetPrice: number;
    currentPrice: number;
    isActive: boolean;
  }>;
  
  // Actions
  getWishlist: () => Promise<void>;
  addToWishlist: (product: Product) => Promise<void>;
  removeFromWishlist: (wishlistItemId: number) => Promise<void>;
  moveToCart: (wishlistItemId: number) => Promise<void>;
  clearWishlist: () => Promise<void>;
  checkWishlistItem: (productId: number) => Promise<boolean>;
  getWishlistStats: () => Promise<void>;
  
  // Enhanced actions
  bulkMoveToCart: (wishlistItemIds: number[]) => Promise<void>;
  bulkRemoveFromWishlist: (wishlistItemIds: number[]) => Promise<void>;
  addPriceAlert: (productId: number, targetPrice: number) => Promise<void>;
  removePriceAlert: (productId: number) => void;
  checkPriceAlerts: () => Promise<void>;
  shareWishlist: () => Promise<string>;
  
  // Local state helpers
  isInWishlist: (productId: number) => boolean;
  getTotalItems: () => number;
  getWishlistItemById: (productId: number) => WishlistItem | undefined;
  getRecentlyAdded: () => Product[];
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      wishlistItems: [],
      stats: null,
      isLoading: false,
      
      // Enhanced wishlist features
      recentlyAdded: [],
      priceAlerts: [],

      getWishlist: async () => {
        try {
          set({ isLoading: true });
          
          const response = await wishlistApi.getWishlist();
          
          if (response.success) {
            set({ 
              wishlistItems: response.data || [],
              isLoading: false 
            });
          } else {
            console.error('Failed to fetch wishlist:', response.message);
            set({ isLoading: false });
            toast({
              title: "Error",
              description: response.message || "Failed to fetch wishlist",
              variant: "destructive",
            });
          }
        } catch (error: any) {
          console.error('Error fetching wishlist:', error);
          set({ isLoading: false });
          toast({
            title: "Error",
            description: "Unable to fetch wishlist. Please try again.",
            variant: "destructive",
          });
        }
      },

      addToWishlist: async (product: Product) => {
        try {
          set({ isLoading: true });
          
          const response = await wishlistApi.addToWishlist(product.id);
          
          if (response.success) {
            // Refresh wishlist to get updated data
            await get().getWishlist();
            toast({
              title: "Added to wishlist",
              description: `${product.name} has been added to your wishlist`,
            });
          } else {
            console.error('Failed to add to wishlist:', response.message);
            set({ isLoading: false });
            toast({
              title: "Error",
              description: response.message || "Failed to add to wishlist",
              variant: "destructive",
            });
          }
        } catch (error: any) {
          console.error('Error adding to wishlist:', error);
          set({ isLoading: false });
          toast({
            title: "Error",
            description: "Unable to add to wishlist. Please try again.",
            variant: "destructive",
          });
        }
      },

      removeFromWishlist: async (wishlistItemId: number) => {
        try {
          set({ isLoading: true });
          
          const response = await wishlistApi.removeFromWishlist(wishlistItemId);
          
          if (response.success) {
            // Remove item from local state
            const { wishlistItems } = get();
            const updatedItems = wishlistItems.filter(item => item.id !== wishlistItemId);
            set({ 
              wishlistItems: updatedItems,
              isLoading: false 
            });
            
            toast({
              title: "Removed from wishlist",
              description: "Item has been removed from your wishlist",
            });
          } else {
            console.error('Failed to remove from wishlist:', response.message);
            set({ isLoading: false });
            toast({
              title: "Error",
              description: response.message || "Failed to remove from wishlist",
              variant: "destructive",
            });
          }
        } catch (error: any) {
          console.error('Error removing from wishlist:', error);
          set({ isLoading: false });
          toast({
            title: "Error",
            description: "Unable to remove from wishlist. Please try again.",
            variant: "destructive",
          });
        }
      },

      moveToCart: async (wishlistItemId: number) => {
        try {
          set({ isLoading: true });
          
          const response = await wishlistApi.moveWishlistToCart(wishlistItemId);
          
          if (response.success) {
            // Remove item from wishlist after successful move
            const { wishlistItems } = get();
            const updatedItems = wishlistItems.filter(item => item.id !== wishlistItemId);
            set({ 
              wishlistItems: updatedItems,
              isLoading: false 
            });
            
            toast({
              title: "Moved to cart",
              description: "Item has been moved from wishlist to cart",
            });
          } else {
            console.error('Failed to move to cart:', response.message);
            set({ isLoading: false });
            toast({
              title: "Error",
              description: response.message || "Failed to move to cart",
              variant: "destructive",
            });
          }
        } catch (error: any) {
          console.error('Error moving to cart:', error);
          set({ isLoading: false });
          toast({
            title: "Error",
            description: "Unable to move to cart. Please try again.",
            variant: "destructive",
          });
        }
      },

      clearWishlist: async () => {
        try {
          set({ isLoading: true });
          
          const response = await wishlistApi.clearWishlist();
          
          if (response.success) {
            set({ 
              wishlistItems: [],
              stats: null,
              isLoading: false 
            });
            
            toast({
              title: "Wishlist cleared",
              description: "All items have been removed from your wishlist",
            });
          } else {
            console.error('Failed to clear wishlist:', response.message);
            set({ isLoading: false });
            toast({
              title: "Error",
              description: response.message || "Failed to clear wishlist",
              variant: "destructive",
            });
          }
        } catch (error: any) {
          console.error('Error clearing wishlist:', error);
          set({ isLoading: false });
          toast({
            title: "Error",
            description: "Unable to clear wishlist. Please try again.",
            variant: "destructive",
          });
        }
      },

      checkWishlistItem: async (productId: number) => {
        try {
          const response = await wishlistApi.checkWishlistItem(productId);
          return response.success && response.data?.in_wishlist;
        } catch (error: any) {
          console.error('Error checking wishlist item:', error);
          return false;
        }
      },

      getWishlistStats: async () => {
        try {
          const response = await wishlistApi.getWishlistStats();
          
          if (response.success) {
            set({ stats: response.data });
          } else {
            console.error('Failed to fetch wishlist stats:', response.message);
          }
        } catch (error: any) {
          console.error('Error fetching wishlist stats:', error);
        }
      },

      // Enhanced wishlist methods
      bulkMoveToCart: async (wishlistItemIds: number[]) => {
        try {
          set({ isLoading: true });
          
          const promises = wishlistItemIds.map(id => wishlistApi.moveToCart(id));
          const results = await Promise.allSettled(promises);
          
          const successful = results.filter(r => r.status === 'fulfilled').length;
          const failed = results.filter(r => r.status === 'rejected').length;
          
          if (successful > 0) {
            await get().getWishlist();
            toast({
              title: "Items moved to cart",
              description: `${successful} items moved to cart${failed > 0 ? `, ${failed} failed` : ''}`,
            });
          }
          
          set({ isLoading: false });
        } catch (error: any) {
          console.error('Error moving items to cart:', error);
          set({ isLoading: false });
          toast({
            title: "Error",
            description: "Unable to move items to cart. Please try again.",
            variant: "destructive",
          });
        }
      },

      bulkRemoveFromWishlist: async (wishlistItemIds: number[]) => {
        try {
          set({ isLoading: true });
          
          const promises = wishlistItemIds.map(id => wishlistApi.removeFromWishlist(id));
          const results = await Promise.allSettled(promises);
          
          const successful = results.filter(r => r.status === 'fulfilled').length;
          const failed = results.filter(r => r.status === 'rejected').length;
          
          if (successful > 0) {
            await get().getWishlist();
            toast({
              title: "Items removed",
              description: `${successful} items removed from wishlist${failed > 0 ? `, ${failed} failed` : ''}`,
            });
          }
          
          set({ isLoading: false });
        } catch (error: any) {
          console.error('Error removing items from wishlist:', error);
          set({ isLoading: false });
          toast({
            title: "Error",
            description: "Unable to remove items from wishlist. Please try again.",
            variant: "destructive",
          });
        }
      },

      addPriceAlert: async (productId: number, targetPrice: number) => {
        try {
          const { priceAlerts } = get();
          const existingAlert = priceAlerts.find(alert => alert.productId === productId);
          
          if (existingAlert) {
            existingAlert.targetPrice = targetPrice;
            existingAlert.isActive = true;
          } else {
            priceAlerts.push({
              productId,
              targetPrice,
              currentPrice: 0, // Will be updated when checking alerts
              isActive: true
            });
          }
          
          set({ priceAlerts: [...priceAlerts] });
          
          // Save to localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem('wishlist_price_alerts', JSON.stringify(priceAlerts));
          }
          
          toast({
            title: "Price alert set",
            description: `You'll be notified when the price drops to ₹${targetPrice}`,
          });
        } catch (error: any) {
          console.error('Error setting price alert:', error);
          toast({
            title: "Error",
            description: "Unable to set price alert. Please try again.",
            variant: "destructive",
          });
        }
      },

      removePriceAlert: (productId: number) => {
        const { priceAlerts } = get();
        const updatedAlerts = priceAlerts.filter(alert => alert.productId !== productId);
        set({ priceAlerts: updatedAlerts });
        
        // Update localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('wishlist_price_alerts', JSON.stringify(updatedAlerts));
        }
      },

      checkPriceAlerts: async () => {
        try {
          const { priceAlerts, wishlistItems } = get();
          const activeAlerts = priceAlerts.filter(alert => alert.isActive);
          
          if (activeAlerts.length === 0) return;
          
          const alertsToCheck = activeAlerts.map(alert => {
            const wishlistItem = wishlistItems.find(item => item.product_id === alert.productId);
            return {
              ...alert,
              currentPrice: wishlistItem?.product?.price || 0
            };
          });
          
          const triggeredAlerts = alertsToCheck.filter(alert => 
            alert.currentPrice <= alert.targetPrice && alert.currentPrice > 0
          );
          
          if (triggeredAlerts.length > 0) {
            // Update alerts with current prices
            const updatedAlerts = priceAlerts.map(alert => {
              const triggered = triggeredAlerts.find(t => t.productId === alert.productId);
              if (triggered) {
                return { ...alert, currentPrice: triggered.currentPrice, isActive: false };
              }
              return alert;
            });
            
            set({ priceAlerts: updatedAlerts });
            
            // Show notifications for triggered alerts
            triggeredAlerts.forEach(alert => {
              const product = wishlistItems.find(item => item.product_id === alert.productId)?.product;
              if (product) {
                toast({
                  title: "🎉 Price Alert Triggered!",
                  description: `${product.name} is now ₹${alert.currentPrice} (was ₹${alert.targetPrice})`,
                  duration: 10000,
                });
              }
            });
          }
        } catch (error: any) {
          console.error('Error checking price alerts:', error);
        }
      },

      shareWishlist: async () => {
        // SSR guard - this function can only run in the browser
        if (typeof window === 'undefined') {
          throw new Error('Cannot share wishlist on server');
        }

        try {
          const { wishlistItems } = get();
          const wishlistData = {
            items: wishlistItems.map(item => ({
              product_id: item.product_id,
              product_name: item.product?.name,
              product_price: item.product?.price,
              added_at: item.created_at
            })),
            shared_at: new Date().toISOString()
          };

          // In a real implementation, this would send to backend and return a shareable URL
          const shareUrl = `${window.location.origin}/wishlist/shared/${btoa(JSON.stringify(wishlistData))}`;

          // Copy to clipboard (with additional guard for navigator)
          if (navigator?.clipboard) {
            await navigator.clipboard.writeText(shareUrl);
          }

          toast({
            title: "Wishlist shared!",
            description: "Shareable link copied to clipboard",
          });

          return shareUrl;
        } catch (error: any) {
          console.error('Error sharing wishlist:', error);
          toast({
            title: "Error",
            description: "Unable to share wishlist. Please try again.",
            variant: "destructive",
          });
          throw error;
        }
      },

      getRecentlyAdded: () => {
        const { recentlyAdded } = get();
        return recentlyAdded.slice(0, 5); // Return last 5 items
      },

      // Local state helpers
      isInWishlist: (productId: number) => {
        const { wishlistItems } = get();
        return wishlistItems.some(item => item.product_id === productId);
      },

      getTotalItems: () => {
        const { wishlistItems } = get();
        return wishlistItems.length;
      },

      getWishlistItemById: (productId: number) => {
        const { wishlistItems } = get();
        return wishlistItems.find(item => item.product_id === productId);
      },
    }),
    {
      name: 'wishlist-store',
      storage: createJSONStorage(() => {
        // SSR-safe storage implementation
        if (typeof window !== 'undefined') {
          return localStorage;
        }
        // Fallback for SSR - no-op storage
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {}
        };
      }),
      partialize: (state) => ({
        wishlistItems: state.wishlistItems,
        stats: state.stats,
        recentlyAdded: state.recentlyAdded,
        priceAlerts: state.priceAlerts,
      }),
    }
  )
);