'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useConfig } from '@/contexts/ConfigContext';
import { useCartStore } from '@/stores/cart';
import { Cart, CartItem } from '@/types';
import { 
  BookOpen, 
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  Heart,
  Tag,
  Truck,
  Shield,
  Loader2,
  X,
  CheckCircle,
  Clock,
  Percent,
  ChevronDown,
  ChevronUp,
  ShoppingCart
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function ImprovedCartPage() {
  const { siteConfig } = useConfig();
  const [promoCode, setPromoCode] = useState('');
  const [applyingPromo, setApplyingPromo] = useState(false);
  const [showPromoInput, setShowPromoInput] = useState(false);
  const [showAvailableCoupons, setShowAvailableCoupons] = useState(false);
  const [expandedSummary, setExpandedSummary] = useState(false);
  const [updating, setUpdating] = useState<number | null>(null);
  const [removing, setRemoving] = useState<number | null>(null);
  const [clearingCart, setClearingCart] = useState(false);
  const [removingCoupon, setRemovingCoupon] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  
  const { 
    cart, 
    isLoading, 
    availableCoupons,
    getCart, 
    updateQuantity, 
    removeItem, 
    clearCart, 
    applyCoupon, 
    removeCoupon, 
    getAvailableCoupons 
  } = useCartStore();

  useEffect(() => {
    const loadCart = async () => {
      await getCart();
      setInitialLoad(false);
    };
    loadCart();
    getAvailableCoupons();
  }, [getCart, getAvailableCoupons]);

  const handleQuantityChange = async (itemId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(itemId);
      return;
    }

    try {
      setUpdating(itemId);
      await updateQuantity(itemId, newQuantity);
      toast.success('Quantity updated');
    } catch (error) {
      console.error('Failed to update quantity:', error);
      toast.error('Failed to update quantity');
    } finally {
      setUpdating(null);
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    try {
      setRemoving(itemId);
      await removeItem(itemId);
      toast.success('Item removed from cart');
    } catch (error) {
      console.error('Failed to remove item:', error);
      toast.error('Failed to remove item');
    } finally {
      setRemoving(null);
    }
  };

  const handleClearCart = async () => {
    if (!confirm('Are you sure you want to clear your cart?')) return;
    
    try {
      setClearingCart(true);
      await clearCart();
      toast.success('Cart cleared');
    } catch (error) {
      console.error('Failed to clear cart:', error);
      toast.error('Failed to clear cart');
    } finally {
      setClearingCart(false);
    }
  };

  const applyPromoCode = async () => {
    if (!promoCode.trim()) return;
    
    try {
      setApplyingPromo(true);
      await applyCoupon(promoCode.toUpperCase());
      setPromoCode('');
      setShowPromoInput(false);
      toast.success('Promo code applied successfully!');
    } catch (error: any) {
      console.error('Failed to apply coupon:', error);
      toast.error(error?.response?.data?.message || 'Invalid promo code');
    } finally {
      setApplyingPromo(false);
    }
  };

  const handleRemoveCoupon = async () => {
    try {
      setRemovingCoupon(true);
      await removeCoupon();
      toast.success('Coupon removed');
    } catch (error) {
      console.error('Failed to remove coupon:', error);
      toast.error('Failed to remove coupon');
    } finally {
      setRemovingCoupon(false);
    }
  };

  // Only show loading skeleton on initial load
  if (initialLoad && isLoading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/2"></div>
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-card rounded-lg p-4 space-y-3">
              <div className="flex gap-3">
                <div className="bg-muted rounded w-20 h-24"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                  <div className="h-4 bg-muted rounded w-1/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!cart || !cart.items.length) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <ShoppingCart className="h-20 w-20 text-muted-foreground mb-4" />
        <h1 className="text-xl font-bold mb-2">Your cart is empty</h1>
        <p className="text-sm text-muted-foreground text-center mb-6">
          Start adding books to build your library
        </p>
        <Button asChild className="w-full max-w-xs">
          <Link href="/products">
            <ShoppingBag className="h-4 w-4 mr-2" />
            Browse Books
