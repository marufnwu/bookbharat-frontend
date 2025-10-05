'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useCartStore } from '@/stores/cart';
import { useCartSummary } from '@/hooks/useCartSummary';
import { OrderSummaryCard } from '@/components/cart/OrderSummaryCard';
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  Loader2,
  ShoppingCart,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  BookOpen
} from 'lucide-react';
import { toast } from 'sonner';

export default function CartPage() {
  const [updating, setUpdating] = useState<number | null>(null);
  const [removing, setRemoving] = useState<number | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [clearingCart, setClearingCart] = useState(false);
  const [applyingCoupon, setApplyingCoupon] = useState(false);

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

  const cartSummary = useCartSummary(cart, '₹');

  useEffect(() => {
    getCart();
    getAvailableCoupons();
  }, [getCart, getAvailableCoupons]);

  const handleQuantityChange = async (itemId: number, newQuantity: number) => {
    if (newQuantity <= 0) return;
    setUpdating(itemId);
    try {
      await updateQuantity(itemId, newQuantity);
    } finally {
      setUpdating(null);
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    setRemoving(itemId);
    try {
      await removeItem(itemId);
      toast.success('Removed from cart');
    } finally {
      setRemoving(null);
    }
  };

  const handleClearCart = async () => {
    if (!confirm('Clear all items from cart?')) return;
    setClearingCart(true);
    try {
      await clearCart();
      toast.success('Cart cleared');
    } finally {
      setClearingCart(false);
    }
  };

  const handleApplyCoupon = async (code: string) => {
    setApplyingCoupon(true);
    try {
      await applyCoupon(code);
      toast.success('Coupon applied!');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Invalid coupon');
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = async () => {
    try {
      await removeCoupon();
      toast.success('Coupon removed');
    } catch (error) {
      toast.error('Failed to remove coupon');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <div className="sticky top-0 bg-background border-b px-4 py-3 flex items-center gap-3 lg:hidden">
          <Link href="/products"><ArrowLeft className="h-5 w-5" /></Link>
          <h1 className="text-lg font-semibold">Cart</h1>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-lg font-semibold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground text-sm mb-6">Add books to get started</p>
          <Button asChild className="w-full max-w-xs">
            <Link href="/products">Browse Books</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32 lg:pb-0">
      {/* Mobile Header */}
      <div className="sticky top-0 bg-background border-b px-4 py-3 flex items-center justify-between z-10 lg:hidden">
        <div className="flex items-center gap-3">
          <Link href="/products"><ArrowLeft className="h-5 w-5" /></Link>
          <div>
            <h1 className="text-lg font-semibold">Cart</h1>
            <p className="text-xs text-muted-foreground">{cart.total_items} items</p>
          </div>
        </div>
      </div>

      {/* Desktop Container */}
      <div className="container mx-auto px-4 py-6 lg:py-8">
        {/* Desktop Header */}
        <div className="hidden lg:flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Shopping Cart</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {cart.total_items} items in your cart
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleClearCart}
              disabled={clearingCart}
              className="text-destructive"
            >
              {clearingCart ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              <span className="ml-2">Clear Cart</span>
            </Button>
            <Button asChild>
              <Link href="/products">Continue Shopping</Link>
            </Button>
          </div>
        </div>

        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-3 p-4 lg:p-0">
            {cart.items.map((item) => (
              <Card key={item.id} className="p-3 lg:p-6">
                <div className="flex gap-3 lg:gap-4">
                  {/* Image */}
                  <div className="w-20 h-24 lg:w-24 lg:h-32 bg-muted rounded flex-shrink-0 overflow-hidden">
                    {item.product?.images?.[0]?.url ? (
                      <Image
                        src={item.product.images[0].url}
                        alt={item.product.name}
                        width={96}
                        height={128}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1">
                        <h3 className="text-sm lg:text-base font-medium line-clamp-2 mb-1">
                          {item.product.name}
                        </h3>
                        <p className="text-xs lg:text-sm text-muted-foreground">
                          {item.product.author || 'Unknown'}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={removing === item.id}
                        className="hidden lg:flex text-muted-foreground hover:text-destructive"
                      >
                        {removing === item.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>

                    {/* Price */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-base lg:text-lg font-bold">
                        {cartSummary.currencySymbol}{item.product.price}
                      </span>
                      {item.product.compare_price > item.product.price && (
                        <span className="text-xs text-muted-foreground line-through">
                          {cartSummary.currencySymbol}{item.product.compare_price}
                        </span>
                      )}
                    </div>

                    {/* Quantity & Remove */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center bg-muted rounded-lg">
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          disabled={updating === item.id}
                          className="p-2 disabled:opacity-50"
                        >
                          <Minus className="h-3 w-3 lg:h-4 lg:w-4" />
                        </button>
                        <span className="px-3 lg:px-4 text-sm lg:text-base font-medium min-w-[40px] text-center">
                          {updating === item.id ? (
                            <Loader2 className="h-3 w-3 lg:h-4 lg:w-4 animate-spin mx-auto" />
                          ) : (
                            item.quantity
                          )}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          disabled={updating === item.id}
                          className="p-2 disabled:opacity-50"
                        >
                          <Plus className="h-3 w-3 lg:h-4 lg:w-4" />
                        </button>
                      </div>

                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={removing === item.id}
                        className="p-2 text-destructive lg:hidden"
                      >
                        {removing === item.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Desktop Sidebar Summary */}
          <div className="hidden lg:block">
            <OrderSummaryCard
              summary={{
                subtotal: cartSummary.subtotal,
                couponDiscount: cartSummary.couponDiscount,
                bundleDiscount: cartSummary.bundleDiscount,
                discountedSubtotal: cartSummary.discountedSubtotal,
                shippingCost: cartSummary.shippingCost || 0,
                shippingDetails: cartSummary.shippingDetails,
                charges: cartSummary.charges,
                totalCharges: cartSummary.totalCharges,
                tax: cartSummary.tax,
                taxesBreakdown: cartSummary.taxesBreakdown,
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
              variant="cart"
              showCheckoutButton={true}
              availableCoupons={availableCoupons || []}
            />
          </div>
        </div>
      </div>

      {/* Mobile Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t shadow-lg lg:hidden z-50">
        {/* Summary Toggle */}
        <button
          onClick={() => setShowSummary(!showSummary)}
          className="w-full px-4 py-3 flex items-center justify-between border-b"
        >
          <div className="text-left">
            <p className="text-xs text-muted-foreground">Total ({cart.total_items} items)</p>
            <p className="text-xl font-bold">{cartSummary.currencySymbol}{cartSummary.total.toFixed(0)}</p>
          </div>
          {showSummary ? (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronUp className="h-5 w-5 text-muted-foreground" />
          )}
        </button>

        {/* Expandable Summary */}
        {showSummary && (
          <div className="px-4 py-3 space-y-2 text-sm border-b max-h-[60vh] overflow-y-auto">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{cartSummary.currencySymbol}{cartSummary.subtotal.toFixed(2)}</span>
            </div>

            {cartSummary.couponDiscount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount ({cartSummary.couponCode})</span>
                <span>-{cartSummary.currencySymbol}{cartSummary.couponDiscount.toFixed(2)}</span>
              </div>
            )}

            {cartSummary.bundleDiscount > 0 && (
              <div className="flex justify-between text-blue-600">
                <span>Bundle Discount</span>
                <span>-{cartSummary.currencySymbol}{cartSummary.bundleDiscount.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-muted-foreground">Delivery</span>
              {cartSummary.requiresPincode ? (
                <span className="text-xs text-muted-foreground">At checkout</span>
              ) : cartSummary.shippingCost === 0 ? (
                <span className="text-green-600 font-medium">FREE</span>
              ) : (
                <span>{cartSummary.currencySymbol}{cartSummary.shippingCost.toFixed(2)}</span>
              )}
            </div>

            {/* Charges */}
            {cartSummary.charges && cartSummary.charges.length > 0 && (
              <>
                {cartSummary.charges.map((charge: any, index: number) => (
                  <div key={index} className="flex justify-between text-orange-600">
                    <span className="flex items-center gap-1">
                      <span className="text-xs">📦</span>
                      {charge.display_label}
                    </span>
                    <span>+{cartSummary.currencySymbol}{parseFloat(String(charge.amount)).toFixed(2)}</span>
                  </div>
                ))}
              </>
            )}

            {/* Tax Breakdown */}
            {cartSummary.taxesBreakdown && cartSummary.taxesBreakdown.length > 0 ? (
              <>
                {cartSummary.taxesBreakdown.map((tax: any, index: number) => (
                  <div key={index} className="flex justify-between text-muted-foreground">
                    <span>{tax.display_label}</span>
                    <span>+{cartSummary.currencySymbol}{parseFloat(String(tax.amount)).toFixed(2)}</span>
                  </div>
                ))}
              </>
            ) : (
              <div className="flex justify-between text-muted-foreground">
                <span>Tax (18%)</span>
                <span>+{cartSummary.currencySymbol}{cartSummary.tax.toFixed(2)}</span>
              </div>
            )}

            {/* Total Savings */}
            {(cartSummary.couponDiscount > 0 || cartSummary.bundleDiscount > 0) && (
              <div className="flex justify-between text-green-700 font-semibold bg-green-50 px-2 py-1.5 rounded -mx-2">
                <span className="flex items-center gap-1">
                  <span>🎉</span>
                  Total Savings
                </span>
                <span>-{cartSummary.currencySymbol}{(cartSummary.couponDiscount + cartSummary.bundleDiscount).toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between font-semibold pt-2 border-t text-base">
              <span>Total</span>
              <span>{cartSummary.currencySymbol}{cartSummary.total.toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* Checkout Button */}
        <div className="p-4">
          <Button asChild className="w-full h-12 text-base">
            <Link href="/checkout">Proceed to Checkout</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}