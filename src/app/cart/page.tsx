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
  Percent
} from 'lucide-react';

export default function CartPage() {
  const { siteConfig } = useConfig();
  const [promoCode, setPromoCode] = useState('');
  const [applyingPromo, setApplyingPromo] = useState(false);
  const [shipping, setShipping] = useState<number | null>(null);
  const [updating, setUpdating] = useState<number | null>(null);
  const [removing, setRemoving] = useState<number | null>(null);
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
    getCart();
    getAvailableCoupons();
  }, [getCart, getAvailableCoupons]);

  // Shipping will be calculated at checkout based on delivery address

  const handleQuantityChange = async (itemId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(itemId);
      return;
    }

    try {
      setUpdating(itemId);
      await updateQuantity(itemId, newQuantity);
    } catch (error) {
      console.error('Failed to update quantity:', error);
    } finally {
      setUpdating(null);
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    try {
      setRemoving(itemId);
      await removeItem(itemId);
    } catch (error) {
      console.error('Failed to remove item:', error);
    } finally {
      setRemoving(null);
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCart();
    } catch (error) {
      console.error('Failed to clear cart:', error);
    }
  };

  const applyPromoCode = async () => {
    if (!promoCode.trim()) return;
    
    try {
      setApplyingPromo(true);
      await applyCoupon(promoCode.toUpperCase());
      setPromoCode('');
    } catch (error: any) {
      console.error('Failed to apply coupon:', error);
      alert(error?.response?.data?.message || 'Failed to apply coupon');
    } finally {
      setApplyingPromo(false);
    }
  };

  const handleRemoveCoupon = async () => {
    try {
      await removeCoupon();
    } catch (error) {
      console.error('Failed to remove coupon:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex space-x-4 p-4 border border-border rounded-lg">
              <div className="bg-gray-200 rounded w-20 h-28"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!cart || !cart.items.length) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Your cart is empty</h1>
          <p className="text-muted-foreground mb-6">
            Looks like you haven't added any books to your cart yet.
          </p>
          <Button asChild>
            <Link href="/products">
              Continue Shopping
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const currencySymbol = siteConfig?.payment?.currency_symbol || '₹';
  
  // Use data from cart summary if available (includes real coupon data)
  const subtotal = (cart as any)?.summary?.subtotal || cart.subtotal || 0;
  const couponDiscount = (cart as any)?.summary?.coupon_discount || 0;
  const couponCode = (cart as any)?.summary?.coupon_code || null;
  const couponFreeShipping = (cart as any)?.summary?.coupon_free_shipping || false;
  const discountedSubtotal = (cart as any)?.summary?.discounted_subtotal || subtotal;
  const tax = (cart as any)?.summary?.tax_amount || Math.round(discountedSubtotal * 0.18);
  const calculatedShipping = (cart as any)?.summary?.shipping_cost !== undefined ? (cart as any).summary.shipping_cost : null;
  const total = (cart as any)?.summary?.total || (discountedSubtotal + tax);
  
  const savings = cart.items.reduce((sum, item) => {
    if (item.product.compare_price && item.product.compare_price > item.product.price) {
      return sum + ((item.product.compare_price - item.product.price) * item.quantity);
    }
    return sum;
  }, 0);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-primary">Home</Link>
        <span className="mx-2">/</span>
        <span>Shopping Cart</span>
      </nav>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-foreground">
              Shopping Cart ({cart.total_items} items)
            </h1>
            <Button
              variant="outline"
              onClick={handleClearCart}
              className="text-destructive hover:text-destructive"
            >
              Clear Cart
            </Button>
          </div>

          <div className="space-y-4">
            {cart.items.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-6">
                  <div className="flex space-x-4">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <div className="w-20 h-28 bg-gray-100 rounded-lg overflow-hidden">
                        {item.product.images && item.product.images.length > 0 ? (
                          <Image
                            src={item.product.images[0].url}
                            alt={item.product.name}
                            width={80}
                            height={112}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <BookOpen className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          {item.product.category && (
                            <Badge variant="outline" className="text-xs mb-1">
                              {item.product.category.name}
                            </Badge>
                          )}
                          <Link href={`/products/${item.product.slug || item.product.id}`}>
                            <h3 className="font-semibold text-foreground hover:text-primary transition-colors">
                              {item.product.name}
                            </h3>
                          </Link>
                          <p className="text-sm text-muted-foreground">
                            by {item.product.brand || 'Unknown Author'}
                          </p>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={removing === item.id}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          {removing === item.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold text-foreground">
                          {currencySymbol}{item.product.price}
                        </span>
                        {item.product.compare_price && item.product.compare_price > item.product.price && (
                          <>
                            <span className="text-sm text-muted-foreground line-through">
                              {currencySymbol}{item.product.compare_price}
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              {Math.round((1 - item.product.price / item.product.compare_price) * 100)}% off
                            </Badge>
                          </>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        {/* Quantity Controls */}
                        <div className="flex items-center border border-border rounded-lg">
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

                        {/* Actions */}
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Heart className="h-4 w-4 mr-2" />
                            Move to Wishlist
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

          {/* Continue Shopping */}
          <div className="flex justify-between items-center">
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

        {/* Order Summary */}
        <div className="space-y-6">
          {/* Applied Coupon */}
          {couponCode && couponDiscount > 0 && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-green-800">Coupon Applied</span>
                        <Badge variant="secondary" className="bg-green-200 text-green-800">
                          {couponCode}
                        </Badge>
                      </div>
                      <p className="text-sm text-green-600">
                        You saved {currencySymbol}{couponDiscount}
                        {couponFreeShipping && (
                          <span> + Free shipping</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={async () => {
                      try {
                        await removeCoupon();
                      } catch (error) {
                        console.error('Failed to remove coupon:', error);
                      }
                    }}
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
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
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Enter coupon code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="flex-1 px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <Button onClick={applyPromoCode} disabled={applyingPromo || !promoCode.trim()}>
                  {applyingPromo ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Apply'
                  )}
                </Button>
              </div>
              {/* Applied Coupon */}
              {couponCode && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-sm font-medium text-green-800">
                        {couponCode} Applied
                      </span>
                    </div>
                    <button
                      onClick={handleRemoveCoupon}
                      className="text-xs text-green-600 hover:text-green-800 underline"
                    >
                      Remove
                    </button>
                  </div>
                  <p className="text-xs text-green-600 mt-1">
                    You saved {currencySymbol}{couponDiscount}!
                  </p>
                </div>
              )}
              
              {/* Available Coupons */}
              <div className="space-y-2">
                {availableCoupons.map((coupon: any, index) => {
                  const isApplied = coupon.code === couponCode;
                  const canUse = !isApplied && (!coupon.minimum_order_amount || subtotal >= coupon.minimum_order_amount);
                  
                  return (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-2 rounded border ${
                        isApplied 
                          ? 'border-green-200 bg-green-50' 
                          : canUse 
                            ? 'border-blue-200 bg-blue-50 cursor-pointer hover:bg-blue-100' 
                            : 'border-gray-200 bg-gray-50'
                      }`}
                      onClick={() => {
                        if (canUse && !isApplied) {
                          setPromoCode(coupon.code);
                          applyPromoCode();
                        }
                      }}
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className={`text-sm font-medium ${
                            isApplied ? 'text-green-800' : canUse ? 'text-blue-800' : 'text-gray-500'
                          }`}>
                            {coupon.code}
                          </span>
                          <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                            {coupon.formatted_value}
                          </span>
                        </div>
                        <p className={`text-xs ${
                          isApplied ? 'text-green-600' : canUse ? 'text-blue-600' : 'text-gray-500'
                        }`}>
                          {coupon.description}
                        </p>
                        {coupon.minimum_order_amount && (
                          <p className="text-xs text-gray-500">
                            Min order: {currencySymbol}{coupon.minimum_order_amount}
                            {subtotal < coupon.minimum_order_amount && (
                              <span className="text-red-500 ml-1">
                                (Add {currencySymbol}{coupon.minimum_order_amount - subtotal} more)
                              </span>
                            )}
                          </p>
                        )}
                      </div>
                      {canUse && !isApplied && (
                        <button
                          className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPromoCode(coupon.code);
                          }}
                        >
                          Apply
                        </button>
                      )}
                      {isApplied && (
                        <span className="text-xs text-green-600 font-medium">Applied</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {/* Items Summary */}
                <div className="bg-slate-50 p-3 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <ShoppingBag className="h-4 w-4 text-slate-600" />
                      <span className="text-sm font-medium">Items ({cart.total_items})</span>
                    </div>
                    <span className="font-semibold">{currencySymbol}{subtotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Discounts */}
                {(couponDiscount > 0 || savings > 0) && (
                  <div className="bg-green-50 p-3 rounded-lg space-y-2">
                    <div className="flex items-center space-x-2">
                      <Percent className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">Discounts Applied</span>
                    </div>
                    {couponDiscount > 0 && (
                      <div className="flex justify-between text-green-700">
                        <span className="text-sm">Coupon ({couponCode})</span>
                        <span className="font-medium">-{currencySymbol}{couponDiscount.toFixed(2)}</span>
                      </div>
                    )}
                    {savings > 0 && (
                      <div className="flex justify-between text-green-700">
                        <span className="text-sm">Product Savings</span>
                        <span className="font-medium">-{currencySymbol}{savings.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Pricing Breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Subtotal after discounts</span>
                    <span>{currencySymbol}{discountedSubtotal.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Truck className="h-4 w-4 text-slate-600" />
                      <span className="text-sm">
                        Shipping
                        {couponFreeShipping ? (
                          <Badge variant="secondary" className="ml-2 bg-green-100 text-green-700">
                            Free with coupon
                          </Badge>
                        ) : discountedSubtotal >= (siteConfig?.payment?.free_shipping_threshold || 499) ? (
                          <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-700">
                            Eligible for free delivery
                          </Badge>
                        ) : null}
                      </span>
                    </div>
                    <span className="text-sm text-slate-500">
                      Calculated at checkout
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <div className="flex items-center space-x-2">
                      <Shield className="h-4 w-4 text-slate-600" />
                      <span className="text-sm">Tax (GST 18%)</span>
                    </div>
                    <span>{currencySymbol}{tax.toFixed(2)}</span>
                  </div>
                </div>
                
                <hr className="border-slate-200" />
                
                {/* Total */}
                <div className="bg-primary/5 p-3 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">Total Amount</span>
                    <span className="text-xl font-bold text-primary">{currencySymbol}{total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Savings Summary */}
                {(couponDiscount > 0 || couponFreeShipping) && (
                  <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-green-800 font-medium">🎉 Total Savings</div>
                    <div className="text-2xl font-bold text-green-600">
                      {currencySymbol}{(couponDiscount + savings).toFixed(2)}
                    </div>
                    <div className="text-sm text-green-600">with {couponCode} coupon</div>
                  </div>
                )}

                {/* Free Shipping Progress */}
                {!couponFreeShipping && discountedSubtotal < (siteConfig?.payment?.free_shipping_threshold || 499) && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-sm text-blue-800 mb-2">
                      Add {currencySymbol}{(siteConfig?.payment?.free_shipping_threshold || 499) - discountedSubtotal} more to get FREE shipping!
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${Math.min(100, (discountedSubtotal / (siteConfig?.payment?.free_shipping_threshold || 499)) * 100)}%` 
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <Button size="lg" className="w-full" asChild>
                  <Link href="/checkout">
                    Proceed to Checkout
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Link>
                </Button>
                
                <div className="text-xs text-muted-foreground space-y-1">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-primary" />
                    <span>Secure checkout with SSL encryption</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Truck className="h-4 w-4 text-primary" />
                    <span>
                      Free delivery on orders above {currencySymbol}{siteConfig?.payment?.free_shipping_threshold || 499}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}