'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useConfig } from '@/contexts/ConfigContext';
import { useCartStore } from '@/stores/cart';
import { BundleDiscountDisplay } from '@/components/cart/BundleDiscountDisplay';
import { useCartSummary } from '@/hooks/useCartSummary';
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

  const cartSummary = useCartSummary(cart, siteConfig?.payment?.currency_symbol || '₹');

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
    if (!cart || cart.items.length === 0) return;
    
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

  const handleApplyCoupon = async () => {
    if (!promoCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    try {
      setApplyingPromo(true);
      await applyCoupon(promoCode.trim());
      setPromoCode('');
      setShowPromoInput(false);
      toast.success('Coupon applied successfully!');
    } catch (error: any) {
      console.error('Failed to apply coupon:', error);
      toast.error(error.message || 'Failed to apply coupon');
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

  // Loading state for initial load
  if (initialLoad && isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading your cart...</p>
        </div>
      </div>
    );
  }

  // Empty cart state
  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">
            Looks like you haven't added any books to your cart yet.
          </p>
          <Button asChild className="w-full">
            <Link href="/products">
              <BookOpen className="h-4 w-4 mr-2" />
              Browse Books
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold">Shopping Cart</h1>
            <p className="text-muted-foreground mt-1">
              {cart.total_items} {cart.total_items === 1 ? 'item' : 'items'} in your cart
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleClearCart}
              disabled={clearingCart}
              className="text-destructive hover:text-destructive"
            >
              {clearingCart ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Clear Cart
            </Button>
            <Button asChild>
              <Link href="/products">
                <ShoppingBag className="h-4 w-4 mr-2" />
                Continue Shopping
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => (
              <Card key={item.id} className="p-4 lg:p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Product Image */}
                  <div className="relative w-20 h-24 md:w-24 md:h-32 bg-muted rounded-lg overflow-hidden flex-shrink-0 mx-auto md:mx-0">
                    {item.product.images && item.product.images.length > 0 ? (
                      <Image
                        src={item.product.images[0].url || item.product.images[0].image_path || '/book-placeholder.svg'}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 80px, 96px"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <BookOpen className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1">
                        <Link href={`/products/${item.product.slug || item.product.id}`}>
                          <h3 className="font-medium text-sm md:text-base line-clamp-2 hover:text-primary">
                            {item.product.name}
                          </h3>
                        </Link>
                        <p className="text-xs md:text-sm text-muted-foreground">
                          by {item.product.brand || 'Unknown'}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={removing === item.id}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      >
                        {removing === item.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>

                    {/* Price */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-base md:text-lg font-bold">
                        {cartSummary.currencySymbol}{item.product.price}
                      </span>
                      {item.product.compare_price > item.product.price && (
                        <>
                          <span className="text-xs md:text-sm text-muted-foreground line-through">
                            {cartSummary.currencySymbol}{item.product.compare_price}
                          </span>
                          <Badge variant="secondary" className="text-[10px] md:text-xs">
                            {Math.round((1 - item.product.price / item.product.compare_price) * 100)}% off
                          </Badge>
                        </>
                      )}
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center border rounded-lg">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          disabled={updating === item.id}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="px-4 py-2 text-center min-w-[3rem]">
                          {updating === item.id ? (
                            <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                          ) : (
                            item.quantity
                          )}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          disabled={updating === item.id || !item.product.in_stock}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="text-sm font-bold">
                        Total: {cartSummary.currencySymbol}{(item.product.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Order Summary - Desktop Sidebar */}
          <div className="space-y-6">
            {/* Applied Coupon */}
            {cartSummary.couponCode && cartSummary.couponDiscount > 0 && (
              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <div>
                        <span className="font-semibold text-green-800">Coupon Applied</span>
                        <Badge variant="secondary" className="ml-2 bg-green-200 text-green-800">
                          {cartSummary.couponCode}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleRemoveCoupon}
                      disabled={removingCoupon}
                      className="h-6 w-6 text-green-600 hover:text-green-800"
                    >
                      {removingCoupon ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <X className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                  <p className="text-sm text-green-600 mt-1">
                    Saved {cartSummary.currencySymbol}{cartSummary.couponDiscount.toFixed(2)}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Bundle Discount */}
            <BundleDiscountDisplay
              bundleDiscount={cartSummary.bundleDiscount}
              bundleDetails={cartSummary.bundleDetails}
              discountMessage={cartSummary.discountMessage}
              currencySymbol={cartSummary.currencySymbol}
              variant="desktop"
            />

            {/* Promo Code */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Tag className="h-5 w-5 mr-2" />
                  Apply Coupon
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter coupon code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    className="flex-1 px-3 py-2 border border-input rounded-md text-sm"
                    disabled={applyingPromo}
                  />
                  <Button 
                    onClick={handleApplyCoupon} 
                    disabled={applyingPromo || !promoCode.trim()}
                    size="sm"
                  >
                    {applyingPromo ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Apply'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal ({cart.total_items} items)</span>
                    <span>{cartSummary.currencySymbol}{cartSummary.subtotal.toFixed(2)}</span>
                  </div>
                  {cartSummary.couponDiscount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Coupon discount</span>
                      <span>-{cartSummary.currencySymbol}{cartSummary.couponDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  {cartSummary.bundleDiscount > 0 && (
                    <div className="flex justify-between text-sm text-blue-600">
                      <span>Bundle discount</span>
                      <span>-{cartSummary.currencySymbol}{cartSummary.bundleDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span className="text-muted-foreground">Calculated at checkout</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax (GST 18%)</span>
                    <span>{cartSummary.currencySymbol}{cartSummary.tax.toFixed(2)}</span>
                  </div>
                </div>
                
                <hr />
                
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold">Total</span>
                  <span className="text-xl font-bold text-primary">
                    {cartSummary.currencySymbol}{cartSummary.total.toFixed(2)}
                  </span>
                </div>

                <Button className="w-full" size="lg" asChild>
                  <Link href="/checkout">
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Proceed to Checkout
                  </Link>
                </Button>

                <div className="text-center text-xs text-muted-foreground space-y-1">
                  <div className="flex items-center justify-center gap-1">
                    <Shield className="h-3 w-3" />
                    <span>Secure checkout</span>
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <Truck className="h-3 w-3" />
                    <span>Free delivery above {cartSummary.currencySymbol}499</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}