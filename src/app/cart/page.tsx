'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/stores/cart';
import { useWishlistStore } from '@/stores/wishlist';
import { useAuthStore } from '@/stores/auth';
import { useCartSummary } from '@/hooks/useCartSummary';
import { useCartPersistence } from '@/hooks/useCartPersistence';
import { useConfig } from '@/contexts/ConfigContext';
import { useAnalytics } from '@/lib/analytics';
import { ANALYTICS_EVENTS } from '@/lib/analytics';
import { OrderSummaryCard } from '@/components/cart/OrderSummaryCard';
import { QuickSocialLogin } from '@/components/auth/QuickSocialLogin';
import { MobileGestureCard, MobileQuantityControls } from '@/components/mobile/MobileGestureCard';
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
  BookOpen,
  Tag,
  Gift,
  Heart,
  Share2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';

export default function CartPage() {
  const [updating, setUpdating] = useState<number | null>(null);
  const [removing, setRemoving] = useState<number | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [clearingCart, setClearingCart] = useState(false);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [couponCode, setCouponCode] = useState('');

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

  const { 
    addToWishlist, 
    isInWishlist, 
    bulkMoveToCart,
    shareWishlist 
  } = useWishlistStore();

  const { siteConfig } = useConfig();
  const { cartRestored, cartRecoveryEnabled } = useCartPersistence();
  const analytics = useAnalytics();
  const { isAuthenticated } = useAuthStore();

  const cartSummary = useCartSummary(cart, (siteConfig?.payment?.currency_symbol || '?'));

  useEffect(() => {
    // Cart page should not pass pincode/payment - shipping calculated at checkout
    const loadCart = async () => {
      setInitialLoading(true);
      await getCart(undefined, undefined);
      await getAvailableCoupons();
      setInitialLoading(false);
    };
    loadCart();
  }, [getCart, getAvailableCoupons]);

  // Track cart view
  useEffect(() => {
    if (cart && cart.items.length > 0) {
      analytics.trackCartView(cart);
    }
  }, [cart, analytics]);

  const handleQuantityChange = async (itemId: number, newQuantity: number) => {
    if (newQuantity <= 0) return;
    setUpdating(itemId);
    try {
      await updateQuantity(itemId, newQuantity);
      
      // Track quantity change
      const item = cart?.items.find(i => i.id === itemId);
      if (item) {
        if (newQuantity > item.quantity) {
          analytics.trackAddToCart(item.product, newQuantity - item.quantity, item.bundle_variant_id);
        } else {
          analytics.trackRemoveFromCart(item.product, item.quantity - newQuantity);
        }
      }
    } finally {
      setUpdating(null);
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    setRemoving(itemId);
    try {
      const item = cart?.items.find(i => i.id === itemId);
      await removeItem(itemId);
      
      // Track item removal
      if (item) {
        analytics.trackRemoveFromCart(item.product, item.quantity);
      }
      
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

  if (initialLoading) {
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
    <div className="min-h-screen bg-background pb-40 lg:pb-0">
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
        {/* Quick Login for Guest Users */}
        {!isAuthenticated && (
          <div className="mb-6">
            <QuickSocialLogin 
              onSuccess={() => {
                // Refresh cart after login
                getCart();
                analytics.track('cart_login_success', {
                  context: 'cart_page'
                });
              }}
            />
          </div>
        )}

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
            <Button
              variant="outline"
              onClick={async () => {
                try {
                  const wishlistItemIds = cart.items.map(item => item.id);
                  await bulkMoveToCart(wishlistItemIds);
                  await clearCart();
                  toast.success('All items saved to wishlist!');
                } catch (error) {
                  toast.error('Failed to save items to wishlist');
                }
              }}
              className="text-blue-600 hover:text-blue-700"
            >
              <Heart className="h-4 w-4" />
              <span className="ml-2">Save for Later</span>
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
              <MobileGestureCard
                key={item.id}
                onDelete={() => handleRemoveItem(item.id)}
                onWishlist={() => {
                  addToWishlist(item.product);
                  analytics.trackWishlistAdd(item.product);
                }}
                onShare={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: item.product.name,
                      text: `Check out this book: ${item.product.name}`,
                      url: `${window.location.origin}/products/${item.product.slug}`
                    });
                  } else {
                    navigator.clipboard.writeText(`${window.location.origin}/products/${item.product.slug}`);
                    toast.success('Product link copied to clipboard!');
                  }
                }}
                className="block"
              >
                <Card className={`p-3 lg:p-6 ${item.bundle_variant_id ? 'border-2 border-green-200 bg-green-50/30' : ''}`}>
                {/* Bundle Header Badge */}
                {item.bundle_variant_id && item.attributes?.bundle_name && (
                  <div className="mb-3 pb-3 border-b border-green-200">
                    <div className="flex items-center gap-2">
                      <div className="bg-green-600 text-white p-1.5 rounded-lg">
                        <Gift className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-green-900">
                            {item.attributes.bundle_name}
                          </span>
                          <Badge className="bg-green-600 text-white text-xs">
                            Bundle Pack
                          </Badge>
                        </div>
                        {item.attributes.bundle_quantity && (
                          <div className="text-xs text-green-700 mt-0.5">
                            {item.attributes.bundle_quantity} items per bundle • Total: {item.quantity} × {item.attributes.bundle_quantity} = {item.quantity * item.attributes.bundle_quantity} items
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex gap-3 lg:gap-4">
                  {/* Image */}
                  <div className="w-20 h-24 lg:w-24 lg:h-32 bg-muted rounded flex-shrink-0 overflow-hidden relative">
                    {item.product?.images?.[0]?.image_url || item.product?.images?.[0]?.url ? (
                      <Image
                        src={item.product.images[0].image_url || item.product.images[0].url || ''}
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
                    {/* Bundle Badge Overlay */}
                    {item.bundle_variant_id && item.attributes?.bundle_quantity && (
                      <div className="absolute top-1 right-1 bg-green-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                        ×{item.attributes.bundle_quantity}
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
                          {(item.product as any).author || 'Unknown'}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => addToWishlist(item.product)}
                          className="text-muted-foreground hover:text-red-500"
                          title="Add to Wishlist"
                        >
                          <Heart className={`h-4 w-4 ${isInWishlist(item.product.id) ? 'fill-red-500 text-red-500' : ''}`} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
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
                    </div>

                    {/* Price */}
                    <div className="mb-2">
                      {item.bundle_variant_id ? (
                        // Bundle Price Display
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-base lg:text-lg font-bold text-green-700">
                              {cartSummary.currencySymbol}{parseFloat(String(item.unit_price || item.price || 0)).toFixed(2)}
                            </span>
                            <Badge className="bg-green-600 text-white text-xs">Bundle Price</Badge>
                          </div>
                          {item.attributes?.bundle_quantity && (
                            <div className="text-xs text-green-700">
                              ({cartSummary.currencySymbol}{(parseFloat(String(item.unit_price || item.price || 0)) / item.attributes.bundle_quantity).toFixed(2)} per item)
                            </div>
                          )}
                          {item.product.price && (
                            <div className="text-xs text-gray-500 line-through">
                              Regular: {cartSummary.currencySymbol}{(parseFloat(String(item.product.price)) * (item.attributes?.bundle_quantity || 1)).toFixed(2)}
                            </div>
                          )}
                        </div>
                      ) : (
                        // Regular Price Display
                        <div className="flex items-center gap-2">
                          <span className="text-base lg:text-lg font-bold">
                            {cartSummary.currencySymbol}{parseFloat(String(item.unit_price || item.price || item.product.price)).toFixed(2)}
                          </span>
                          {item.product.compare_price && item.product.compare_price > item.product.price && (
                            <span className="text-xs text-muted-foreground line-through">
                              {cartSummary.currencySymbol}{parseFloat(String(item.product.compare_price)).toFixed(2)}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Quantity & Remove */}
                    <div className="flex items-center justify-between">
                      <MobileQuantityControls
                        quantity={item.quantity}
                        onIncrease={() => handleQuantityChange(item.id, item.quantity + 1)}
                        onDecrease={() => handleQuantityChange(item.id, item.quantity - 1)}
                        disabled={updating === item.id}
                      />
                      
                      {/* Bundle Quantity Label */}
                      {item.bundle_variant_id && (
                        <span className="text-xs text-green-700 font-medium">
                          {item.quantity} bundle{item.quantity > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>

                    {/* Mobile Remove Button */}
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
              </Card>
              </MobileGestureCard>
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

      {/* Mobile Fixed Bottom Bar - Positioned above bottom nav */}
      <div className="fixed bottom-16 left-0 right-0 bg-background border-t shadow-lg lg:hidden z-40">
        {/* Collapsed Summary - Always Visible */}
        <div className="px-4 py-3 border-b">
          <div className="flex items-center justify-between mb-2">
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-0.5">{cart.total_items} items</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold">{cartSummary.currencySymbol}{cartSummary.total.toFixed(2)}</p>
                {(cartSummary.couponDiscount > 0 || cartSummary.bundleDiscount > 0) && (
                  <span className="text-xs text-green-600 font-medium">
                    Save {cartSummary.currencySymbol}{(cartSummary.couponDiscount + cartSummary.bundleDiscount).toFixed(0)}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => setShowSummary(!showSummary)}
              className="ml-3 px-3 py-2 text-xs font-medium text-primary hover:bg-primary/5 rounded-md transition-colors flex items-center gap-1"
            >
              Details
              {showSummary ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronUp className="h-3 w-3" />
              )}
            </button>
          </div>

          {/* Quick Info Pills */}
          <div className="flex gap-2 flex-wrap">
            {cartSummary.shippingCost === 0 && !cartSummary.requiresPincode && (
              <span className="text-[10px] bg-green-50 text-green-700 px-2 py-1 rounded-full font-medium">
                FREE Delivery
              </span>
            )}
            {cartSummary.couponCode && (
              <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-1 rounded-full font-medium">
                {cartSummary.couponCode} applied
              </span>
            )}
            {cartSummary.bundleDiscount > 0 && (
              <span className="text-[10px] bg-purple-50 text-purple-700 px-2 py-1 rounded-full font-medium">
                Bundle discount
              </span>
            )}
          </div>
        </div>

        {/* Expandable Detailed Summary */}
        {showSummary && (
          <div className="px-4 py-3 space-y-2.5 text-sm border-b max-h-[50vh] overflow-y-auto bg-muted/30">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">{cartSummary.currencySymbol}{cartSummary.subtotal.toFixed(2)}</span>
            </div>

            {cartSummary.couponDiscount > 0 && (
              <div className="flex justify-between items-center text-green-600">
                <span className="flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5" />
                  Coupon ({cartSummary.couponCode})
                </span>
                <span className="font-semibold">-{cartSummary.currencySymbol}{cartSummary.couponDiscount.toFixed(2)}</span>
              </div>
            )}

            {cartSummary.bundleDiscount > 0 && (
              <div className="flex justify-between items-center text-blue-600">
                <span className="flex items-center gap-1.5">
                  <Gift className="h-3.5 w-3.5" />
                  Bundle Discount
                </span>
                <span className="font-semibold">-{cartSummary.currencySymbol}{cartSummary.bundleDiscount.toFixed(2)}</span>
              </div>
            )}

            {(cartSummary.couponDiscount > 0 || cartSummary.bundleDiscount > 0) && (
              <div className="flex justify-between items-center bg-green-50 border border-green-200 rounded-lg px-3 py-2 -mx-1">
                <span className="text-green-700 font-semibold text-xs">Total Savings</span>
                <span className="text-green-700 font-bold">-{cartSummary.currencySymbol}{(cartSummary.couponDiscount + cartSummary.bundleDiscount).toFixed(2)}</span>
              </div>
            )}

            <div className="border-t pt-2.5"></div>

            {/* Mobile Coupon Input */}
            {cartSummary.couponDiscount === 0 && (
              <div className="space-y-2 bg-blue-50 border border-blue-200 rounded-lg p-3 -mx-1">
                <div className="flex items-center gap-2 text-xs font-medium text-blue-900">
                  <Tag className="h-3.5 w-3.5" />
                  <span>Apply Coupon Code</span>
                </div>
                <div className="flex gap-1">
                  <input
                    type="text"
                    placeholder="Enter code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="flex-1 px-2 py-1.5 text-xs border border-blue-200 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <button
                    onClick={async () => {
                      if (couponCode.trim()) {
                        setApplyingCoupon(true);
                        try {
                          await handleApplyCoupon(couponCode);
                          setCouponCode('');
                        } catch (error) {
                          // Error handled in handleApplyCoupon
                        } finally {
                          setApplyingCoupon(false);
                        }
                      }
                    }}
                    disabled={applyingCoupon || !couponCode.trim()}
                    className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {applyingCoupon ? '...' : 'Apply'}
                  </button>
                </div>
              </div>
            )}

            {/* Show remove coupon button if one is applied */}
            {cartSummary.couponDiscount > 0 && (
              <button
                onClick={async () => {
                  setApplyingCoupon(true);
                  try {
                    await handleRemoveCoupon();
                  } catch (error) {
                    // Error handled in handleRemoveCoupon
                  } finally {
                    setApplyingCoupon(false);
                  }
                }}
                disabled={applyingCoupon}
                className="w-full px-3 py-1.5 text-xs bg-red-50 text-red-600 font-medium rounded border border-red-200 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {applyingCoupon ? 'Removing...' : 'Remove Coupon'}
              </button>
            )}

            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Delivery</span>
              {cartSummary.requiresPincode ? (
                <span className="text-xs text-muted-foreground italic">At checkout</span>
              ) : cartSummary.shippingCost === 0 ? (
                <span className="text-green-600 font-semibold">FREE</span>
              ) : (
                <span className="font-medium">{cartSummary.currencySymbol}{cartSummary.shippingCost.toFixed(2)}</span>
              )}
            </div>

            {/* Charges */}
            {cartSummary.charges && cartSummary.charges.length > 0 && (
              <>
                {cartSummary.charges.map((charge: any, index: number) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-muted-foreground text-xs">{charge.display_label}</span>
                    <span className="font-medium text-xs">+{cartSummary.currencySymbol}{parseFloat(String(charge.amount)).toFixed(2)}</span>
                  </div>
                ))}
              </>
            )}

            {/* Tax Breakdown */}
            {cartSummary.taxesBreakdown && cartSummary.taxesBreakdown.length > 0 ? (
              <>
                {cartSummary.taxesBreakdown.map((tax: any, index: number) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-muted-foreground text-xs">{tax.display_label}</span>
                    <span className="font-medium text-xs">+{cartSummary.currencySymbol}{parseFloat(String(tax.amount)).toFixed(2)}</span>
                  </div>
                ))}
              </>
            ) : (
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-xs">Tax (GST 18%)</span>
                <span className="font-medium text-xs">+{cartSummary.currencySymbol}{cartSummary.tax.toFixed(2)}</span>
              </div>
            )}

            <div className="border-t pt-2.5"></div>

            <div className="flex justify-between items-center font-bold text-base">
              <span>Total Amount</span>
              <span className="text-primary">{cartSummary.currencySymbol}{cartSummary.total.toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* Checkout Button - Mobile Optimized */}
        <div className="p-2 bg-white">
          <Button 
            asChild 
            className="w-full h-11 text-sm md:h-14 md:text-base font-bold shadow-md bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => {
              if (cart) {
                analytics.trackCheckoutStarted(cart);
              }
            }}
          >
            <Link href="/checkout" className="flex items-center justify-center gap-2">
              <ShoppingCart className="h-5 w-5 md:h-6 md:w-6" />
              Proceed to Checkout
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}




