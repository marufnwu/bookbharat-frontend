'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
  Loader2,
  ShoppingCart
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { OrderSummaryCard } from '@/components/cart/OrderSummaryCard';
import { useCartSummary } from '@/hooks/useCartSummary';

export default function ImprovedCartPage() {
  const { siteConfig } = useConfig();
  const [updating, setUpdating] = useState<number | null>(null);
  const [removing, setRemoving] = useState<number | null>(null);
  const [clearingCart, setClearingCart] = useState(false);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
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

  const cartSummary = useCartSummary(cart);

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

  const handleApplyCoupon = async (code: string) => {
    try {
      setApplyingCoupon(true);
      await applyCoupon(code);
      toast.success('Coupon applied successfully!');
    } catch (error: any) {
      console.error('Failed to apply coupon:', error);
      toast.error(error?.response?.data?.message || 'Invalid promo code');
      throw error; // Re-throw to let OrderSummaryCard handle it
    } finally {
      setApplyingCoupon(false);
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
      throw error; // Re-throw to let OrderSummaryCard handle it
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
                <div className="bg-muted rounded w-16 h-20"></div>
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
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative pb-24 sm:pb-20 lg:pb-0">
      {/* Loading Overlay - Only shows during API calls */}
      {isLoading && !initialLoad && (
        <div className="fixed inset-0 bg-background/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-card p-4 rounded-lg shadow-lg flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="text-sm">Updating cart...</span>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-6 lg:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl lg:text-3xl font-bold">Shopping Cart</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {cart.total_items} {cart.total_items === 1 ? 'item' : 'items'} in your cart
            </p>
          </div>

          <div className="flex items-center gap-2 lg:gap-3">
            <Button
              variant="outline"
              onClick={handleClearCart}
              disabled={clearingCart}
              className="text-destructive hover:text-destructive text-xs lg:text-sm px-2 lg:px-3 touch-target"
              size="sm"
            >
              {clearingCart ? (
                <Loader2 className="h-3 w-3 lg:h-4 lg:w-4 animate-spin" />
              ) : (
                <Trash2 className="h-3 w-3 lg:h-4 lg:w-4" />
              )}
              <span className="ml-1 lg:ml-2">Clear Cart</span>
            </Button>
            <Button asChild size="sm" className="text-xs lg:text-sm px-2 lg:px-3 touch-target">
              <Link href="/products">
                <ShoppingBag className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
                <span>Continue Shopping</span>
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-4 lg:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-2 lg:space-y-4">
            {cart.items.map((item) => (
              <Card key={item.id} className="p-3 lg:p-6">
                <div className="flex gap-3 lg:gap-4">
                  {/* Product Image */}
                  <div className="relative w-20 h-24 sm:w-16 sm:h-20 lg:w-24 lg:h-32 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                    {item.product?.images?.[0]?.url ? (
                      <Image
                        src={item.product.images[0].url}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 80px, 96px"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <BookOpen className="h-6 w-6 lg:h-8 lg:w-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1">
                        <Link href={`/products/${item.product.slug || item.product.id}`}>
                          <h3 className="font-medium text-sm lg:text-base line-clamp-2 hover:text-primary leading-tight">
                            {item.product.name}
                          </h3>
                        </Link>
                        <p className="text-xs text-muted-foreground mt-1">
                          by {item.product.brand || 'Unknown'}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={removing === item.id}
                        className="h-11 w-11 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-muted-foreground hover:text-destructive flex-shrink-0 touch-target"
                      >
                        {removing === item.id ? (
                          <Loader2 className="h-3 w-3 lg:h-4 lg:w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-3 w-3 lg:h-4 lg:w-4" />
                        )}
                      </Button>
                    </div>

                    {/* Price and Quantity Row */}
                    <div className="flex items-center justify-between gap-2">
                      {/* Price */}
                      <div className="flex items-center gap-2">
                        <span className="text-lg sm:text-sm lg:text-lg font-bold">
                          {cartSummary.currencySymbol}{item.product.price}
                        </span>
                        {item.product.compare_price > item.product.price && (
                          <>
                            <span className="text-xs text-muted-foreground line-through">
                              {cartSummary.currencySymbol}{item.product.compare_price}
                            </span>
                            <Badge variant="secondary" className="text-[9px] lg:text-xs px-1">
                              {Math.round((1 - item.product.price / item.product.compare_price) * 100)}% off
                            </Badge>
                          </>
                        )}
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center border rounded-lg">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-11 w-11 sm:h-7 sm:w-7 touch-target"
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          disabled={updating === item.id}
                        >
                          <Minus className="h-3 w-3 lg:h-4 lg:w-4" />
                        </Button>
                        <span className="px-2 lg:px-4 py-1 lg:py-2 text-center min-w-[2rem] lg:min-w-[3rem] text-sm">
                          {updating === item.id ? (
                            <Loader2 className="h-3 w-3 lg:h-4 lg:w-4 animate-spin mx-auto" />
                          ) : (
                            item.quantity
                          )}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-11 w-11 sm:h-7 sm:w-7 touch-target"
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          disabled={updating === item.id || !item.product.in_stock}
                        >
                          <Plus className="h-3 w-3 lg:h-4 lg:w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Item Total - Mobile Only */}
                    <div className="lg:hidden text-right text-xs text-muted-foreground mt-1">
                      Total: {cartSummary.currencySymbol}{(item.product.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Order Summary - Desktop Sidebar */}
          <div className="hidden lg:block">
            <OrderSummaryCard
              summary={{
                subtotal: cartSummary.subtotal,
                couponDiscount: cartSummary.couponDiscount,
                bundleDiscount: cartSummary.bundleDiscount,
                discountedSubtotal: cartSummary.discountedSubtotal,
                shippingCost: cartSummary.shippingCost || 0,
                shippingDetails: cartSummary.shippingDetails,
                tax: cartSummary.tax,
                total: cartSummary.total,
                currencySymbol: cartSummary.currencySymbol,
                couponCode: cartSummary.couponCode,
                bundleDetails: cartSummary.bundleDetails,
                discountMessage: cartSummary.discountMessage,
                itemCount: cart.total_items,
                requiresPincode: cartSummary.requiresPincode
              }}
              onApplyCoupon={handleApplyCoupon}
              onRemoveCoupon={handleRemoveCoupon}
              applyCouponLoading={applyingCoupon}
              removeCouponLoading={removingCoupon}
              variant="cart"
              showCheckoutButton={true}
              availableCoupons={availableCoupons || []}
            />
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom Summary */}
      <OrderSummaryCard
        summary={{
          subtotal: cartSummary.subtotal,
          couponDiscount: cartSummary.couponDiscount,
          bundleDiscount: cartSummary.bundleDiscount,
          discountedSubtotal: cartSummary.discountedSubtotal,
          shippingCost: cartSummary.shippingCost || 0,
          shippingDetails: cartSummary.shippingDetails,
          tax: cartSummary.tax,
          total: cartSummary.total,
          currencySymbol: cartSummary.currencySymbol,
          couponCode: cartSummary.couponCode,
          bundleDetails: cartSummary.bundleDetails,
          discountMessage: cartSummary.discountMessage,
          itemCount: cart.total_items,
          requiresPincode: cartSummary.requiresPincode
        }}
        onApplyCoupon={handleApplyCoupon}
        onRemoveCoupon={handleRemoveCoupon}
        applyCouponLoading={applyingCoupon}
        removeCouponLoading={removingCoupon}
        variant="mobile"
        showCheckoutButton={true}
        availableCoupons={availableCoupons || []}
      />
    </div>
  );
}