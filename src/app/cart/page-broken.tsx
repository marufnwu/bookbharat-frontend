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
          </Link>
        </Button>
      </div>
    );
  }

  const currencySymbol = siteConfig?.payment?.currency_symbol || '₹';
  const subtotal = (cart as any)?.summary?.subtotal || cart.subtotal || 0;
  const couponDiscount = (cart as any)?.summary?.coupon_discount || 0;
                  <span>-{currencySymbol}{totalDiscount.toFixed(2)}</span>
  const couponCode = (cart as any)?.summary?.coupon_code || null;
  const couponFreeShipping = (cart as any)?.summary?.coupon_free_shipping || false;
  const bundleDiscount = (cart as any)?.summary?.bundle_discount || 0;
                  <span>-{currencySymbol}{totalDiscount.toFixed(2)}</span>
  const bundleDetails = (cart as any)?.summary?.bundle_details || null;
  const totalDiscount = (cart as any)?.summary?.total_discount || Math.max(couponDiscount, bundleDiscount);
                  <span>-{currencySymbol}{totalDiscount.toFixed(2)}</span>
  const discountMessage = (cart as any)?.summary?.discount_message || null;
  const discountedSubtotal = (cart as any)?.summary?.discounted_subtotal || subtotal;
  const tax = (cart as any)?.summary?.tax_amount || Math.round(discountedSubtotal * 0.18);
  const total = (cart as any)?.summary?.total || (discountedSubtotal + tax);
  
  const savings = cart.items.reduce((sum, item) => {
    if (item.product.compare_price && item.product.compare_price > item.product.price) {
      return sum + ((item.product.compare_price - item.product.price) * item.quantity);
    }
    return sum;
  }, 0);

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

      {/* Mobile Header */}
      <div className="md:hidden sticky top-0 z-30 bg-background border-b">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-lg font-bold">Cart ({cart.total_items})</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearCart}
            disabled={clearingCart}
            className="text-destructive"
          >
            {clearingCart ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Clear'
            )}
          </Button>
        </div>
      </div>

      {/* Desktop Breadcrumb */}
      <div className="hidden md:block container mx-auto px-4 py-4">
        <nav className="text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary">Home</Link>
          <span className="mx-2">/</span>
          <span>Shopping Cart</span>
        </nav>
      </div>

      <div className="container mx-auto px-4 pb-24 md:pb-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Cart Items - Mobile & Desktop */}
          <div className="lg:col-span-2 space-y-4">
            {/* Desktop Header */}
            <div className="hidden md:flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold">
                Shopping Cart ({cart.total_items} items)
              </h1>
              <Button
                variant="outline"
                onClick={handleClearCart}
                disabled={clearingCart}
                className="text-destructive hover:text-destructive"
              >
                {clearingCart ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Clearing...
                  </>
                ) : (
                  'Clear Cart'
                )}
              </Button>
            </div>

            {/* Cart Items */}
            <div className="space-y-3">
              {cart.items.map((item) => (
                <Card 
                  key={item.id} 
                  className={cn(
                    "overflow-hidden transition-opacity",
                    removing === item.id && "opacity-50"
                  )}
                >
                  <CardContent className="p-3 md:p-6">
                    <div className="flex gap-3">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <div className="w-16 h-20 md:w-20 md:h-28 bg-muted rounded overflow-hidden">
                          {item.product.images?.length > 0 ? (
                            <Image
                              src={item.product.images[0].url}
                              alt={item.product.name}
                              width={80}
                              height={112}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <BookOpen className="h-6 w-6 md:h-8 md:w-8 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        {/* Title & Remove Button */}
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
                            {currencySymbol}{item.product.price}
                          </span>
                          {item.product.compare_price > item.product.price && (
                            <>
                              <span className="text-xs md:text-sm text-muted-foreground line-through">
                                {currencySymbol}{item.product.compare_price}
                              </span>
                              <Badge variant="secondary" className="text-[10px] md:text-xs">
                                {Math.round((1 - item.product.price / item.product.compare_price) * 100)}% off
                              </Badge>
                            </>
                          )}
                        </div>

                        {/* Quantity & Total - Mobile */}
                        <div className="md:hidden">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center border rounded-md">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                disabled={updating === item.id}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="px-3 text-sm min-w-[2rem] text-center">
                                {updating === item.id ? (
                                  <Loader2 className="h-3 w-3 animate-spin mx-auto" />
                                ) : (
                                  item.quantity
                                )}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                disabled={updating === item.id || !item.product.in_stock}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                            <div className="text-sm font-bold">
                              Total: {currencySymbol}{item.total}
                            </div>
                          </div>
                        </div>

                        {/* Quantity & Actions - Desktop */}
                        <div className="hidden md:flex items-center justify-between">
                          <div className="flex items-center border rounded-lg">
                            <Button
                              variant="ghost"
                              size="sm"
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
                              size="sm"
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              disabled={updating === item.id || !item.product.in_stock}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="flex items-center gap-3">
                            <Button variant="ghost" size="sm">
                              <Heart className="h-4 w-4 mr-2" />
                              Wishlist
                            </Button>
                            <div className="text-lg font-bold">
                              {currencySymbol}{item.total}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Continue Shopping - Desktop */}
            <div className="hidden md:flex justify-between items-center pt-4">
              <Button variant="outline" asChild>
                <Link href="/products">
                  Continue Shopping
                </Link>
              </Button>
              {savings > 0 && (
                <p className="text-sm text-muted-foreground">
                  You saved {currencySymbol}{savings} on this order!
                </p>
              )}
            </div>
          </div>

          {/* Order Summary - Desktop Sidebar */}
          <div className="hidden lg:block space-y-6">
            {/* Applied Coupon */}
            {couponCode && couponDiscount > 0 && (
                  <span>-{currencySymbol}{totalDiscount.toFixed(2)}</span>
              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <div>
                        <span className="font-semibold text-green-800">Coupon Applied</span>
                        <Badge variant="secondary" className="ml-2 bg-green-200 text-green-800">
                          {couponCode}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleRemoveCoupon}
                      disabled={removingCoupon}
                      className="h-6 w-6 text-red-500 hover:text-red-700"
                    >
                      {removingCoupon ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <X className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                  <p className="text-sm text-green-600 mt-1">
                  <span>Discount</span>
                  <span>-{currencySymbol}{totalDiscount.toFixed(2)}</span>
                  </p>
                </CardContent>
              </Card>
{/* Bundle Discount Applied */}            {bundleDiscount > 0 && (              <Card className="border-blue-200 bg-blue-50">                <CardContent className="p-4">                  <div className="flex items-center justify-between">                    <div className="flex items-center gap-2">                      <Tag className="w-4 h-4 text-blue-600" />                      <div>                        <span className="font-semibold text-blue-800">Bundle Discount</span>                        {bundleDetails?.discount_rule && (                          <Badge variant="secondary" className="ml-2 bg-blue-200 text-blue-800">                            {bundleDetails.discount_rule.name}                          </Badge>                        )}                      </div>                    </div>                    <div className="text-right">                      <p className="text-blue-800 font-semibold">-{currencySymbol}{bundleDiscount.toFixed(2)}</p>                      {bundleDetails && (                        <p className="text-xs text-blue-600">                          {bundleDetails.discount_percentage}% off {bundleDetails.product_count} items                        </p>                      )}                    </div>                  </div>                  {discountMessage && (                    <p className="text-sm text-blue-700 mt-2 font-medium">                      {discountMessage}                    </p>                  )}                </CardContent>              </Card>            )}
                  <span>-{currencySymbol}{totalDiscount.toFixed(2)}</span>
            )}

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
                    placeholder="Enter code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-lg text-sm"
                    disabled={applyingPromo}
                  />
                  <Button 
                    onClick={applyPromoCode} 
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

                {/* Available Coupons */}
                {availableCoupons.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Available offers:</p>
                    {availableCoupons.slice(0, 2).map((coupon: any) => (
                      <div
                        key={coupon.code}
                        className="p-2 rounded border border-dashed cursor-pointer hover:bg-muted/50"
                        onClick={() => {
                          setPromoCode(coupon.code);
                          applyPromoCode();
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium">{coupon.code}</span>
                          <span className="text-xs text-primary">Apply</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground">{coupon.description}</p>
                      </div>
                    ))}
                  </div>
                )}
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
                    <span>{currencySymbol}{subtotal.toFixed(2)}</span>
                  </div>
                  {couponDiscount > 0 && (
                  <span>-{currencySymbol}{totalDiscount.toFixed(2)}</span>
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Coupon discount</span>
                  }                  {bundleDiscount > 0 && (                    <div className="flex justify-between text-sm text-blue-600">                      <span>Bundle discount</span>                      <span>-{currencySymbol}{bundleDiscount.toFixed(2)}</span>                    </div>
                  <span>-{currencySymbol}{totalDiscount.toFixed(2)}</span>
                      <span>-{currencySymbol}{couponDiscount.toFixed(2)}</span>
                  <span>-{currencySymbol}{totalDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span className="text-muted-foreground">Calculated at checkout</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax (GST 18%)</span>
                    <span>{currencySymbol}{tax.toFixed(2)}</span>
                  </div>
                </div>
                
                <hr />
                
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold">Total</span>
                  <span className="text-xl font-bold text-primary">{currencySymbol}{total.toFixed(2)}</span>
                </div>

                <Button size="lg" className="w-full" asChild>
                  <Link href="/checkout">
                    Proceed to Checkout
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>

                <div className="text-[10px] text-muted-foreground space-y-1">
                  <div className="flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    <span>Secure checkout</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Truck className="h-3 w-3" />
                    <span>Free delivery above {currencySymbol}499</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Summary Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t shadow-lg z-40">
        {/* Expandable Summary */}
        <div 
          className="p-3 border-b cursor-pointer"
          onClick={() => setExpandedSummary(!expandedSummary)}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Total Amount</p>
              <p className="text-lg font-bold">{currencySymbol}{total.toFixed(2)}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">View details</span>
              {expandedSummary ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </div>
          </div>
        </div>

        {/* Expanded Details */}
        {expandedSummary && (
          <div className="p-3 space-y-3 max-h-60 overflow-y-auto">
            {/* Promo Code Section */}
            {!couponCode && (
              <div className="space-y-2">
                <button
                  onClick={() => setShowPromoInput(!showPromoInput)}
                  className="flex items-center justify-between w-full text-sm"
                >
                  <span className="flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Add promo code
                  </span>
                  <ChevronDown className={cn("h-4 w-4 transition-transform", showPromoInput && "rotate-180")} />
                </button>
                
                {showPromoInput && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="flex-1 px-3 py-2 border rounded text-sm"
                      disabled={applyingPromo}
                    />
                    <Button 
                      onClick={applyPromoCode}
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
                )}
              </div>
            )}

            {/* Applied Coupon */}
            {couponCode && (
              <div className="bg-green-50 p-2 rounded flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-xs font-medium">{couponCode} applied</p>
                    <p className="text-[10px] text-green-600">Saved {currencySymbol}{couponDiscount}</p>
                  <span>-{currencySymbol}{totalDiscount.toFixed(2)}</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRemoveCoupon}
                  disabled={removingCoupon}
                  className="h-6 w-6"
                >
                  {removingCoupon ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <X className="h-3 w-3" />
                  )}
                </Button>
              </div>
            )}

            {/* Price Breakdown */}
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{currencySymbol}{subtotal.toFixed(2)}</span>
              </div>
              {couponDiscount > 0 && (
                  <span>-{currencySymbol}{totalDiscount.toFixed(2)}</span>
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-{currencySymbol}{totalDiscount.toFixed(2)}</span>
                  <span>-{currencySymbol}{couponDiscount.toFixed(2)}</span>
                  <span>-{currencySymbol}{totalDiscount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span>{currencySymbol}{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="text-xs">At checkout</span>
              </div>
            </div>
          </div>
        )}

        {/* Checkout Button */}
        <div className="p-3">
          <Button className="w-full" size="lg" asChild>
            <Link href="/checkout">
              Proceed to Checkout
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}