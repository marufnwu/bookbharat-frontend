'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { WishlistItem, WishlistStats, Product } from '@/types';
import { wishlistApi } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

interface WishlistState {
  wishlistItems: WishlistItem[];
  stats: WishlistStats | null;
  isLoading: boolean;
  
  // Actions
  getWishlist: () => Promise<void>;
  addToWishlist: (product: Product) => Promise<void>;
  removeFromWishlist: (wishlistItemId: number) => Promise<void>;
  moveToCart: (wishlistItemId: number) => Promise<void>;
  clearWishlist: () => Promise<void>;
  checkWishlistItem: (productId: number) => Promise<boolean>;
  getWishlistStats: () => Promise<void>;
  
  // Local state helpers
  isInWishlist: (productId: number) => boolean;
  getTotalItems: () => number;
  getWishlistItemById: (productId: number) => WishlistItem | undefined;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      wishlistItems: [],
      stats: null,
      isLoading: false,

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
      partialize: (state) => ({
        wishlistItems: state.wishlistItems,
        stats: state.stats,
      }),
    }
  )
);