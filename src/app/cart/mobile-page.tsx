'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/stores/cart';
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  Loader2,
  ShoppingCart,
  ChevronRight,
  Tag,
  Truck,
  Shield,
  ArrowLeft,
  X,
  Percent,
  Gift
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function MobileCartPage() {
  const [updating, setUpdating] = useState<number | null>(null);
  const [removing, setRemoving] = useState<number | null>(null);
  const [showCoupons, setShowCoupons] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [expandedSummary, setExpandedSummary] = useState(false);

  const {
    cart,
    isLoading,
    availableCoupons,
    getCart,
    updateQuantity,
    removeItem,
    applyCoupon,
    removeCoupon,
    getAvailableCoupons
  } = useCartStore();

  useEffect(() => {
    getCart();
    getAvailableCoupons();
  }, [getCart, getAvailableCoupons]);

  const handleQuantityChange = async (itemId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(itemId);
      return;
    }

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
      toast.success('Item removed');
    } finally {
      setRemoving(null);
    }
  };

  const handleApplyCoupon = async (code: string) => {
    setApplyingCoupon(true);
    try {
      await applyCoupon(code);
      toast.success('Coupon applied!');
      setShowCoupons(false);
      setCouponCode('');
    } catch (error) {
      toast.error('Invalid coupon code');
    } finally {
      setApplyingCoupon(false);
    }
  };

  if (!cart || !cart.items.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b sticky top-0 z-50">
          <div className="flex items-center p-4">
            <Link href="/products" className="mr-3">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-lg font-semibold">Shopping Cart</h1>
          </div>
        </div>

        {/* Empty State */}
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="bg-gray-100 rounded-full p-6 mb-4">
            <ShoppingCart className="h-16 w-16 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
          <p className="text-gray-500 text-center mb-6">
            Start adding books to build your collection
          </p>
          <Button asChild className="w-full max-w-xs">
            <Link href="/products">
              <ShoppingBag className="h-4 w-4 mr-2" />
              Browse Books
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const subtotal = cart.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const discount = cart.summary?.coupon_discount || 0;
  const tax = subtotal * 0.18;
  const shipping = cart.summary?.shipping_cost || 0;
  const total = subtotal - discount + tax + shipping;

  return (
    <div className="min-h-screen bg-gray-50 pb-[180px]">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center">
            <Link href="/products" className="mr-3">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-lg font-semibold">Cart</h1>
              <p className="text-xs text-gray-500">{cart.items.length} items</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCoupons(true)}
            className="text-blue-600"
          >
            <Tag className="h-4 w-4 mr-1" />
            Offers
          </Button>
        </div>
      </div>

      {/* Cart Items */}
      <div className="p-4 space-y-3">
        <AnimatePresence>
          {cart.items.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="bg-white rounded-xl shadow-sm overflow-hidden"
            >
              <div className="p-3">
                <div className="flex gap-3">
                  {/* Product Image */}
                  <div className="relative w-20 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {item.product.images?.[0]?.url ? (
                      <Image
                        src={item.product.images[0].image_url || images[0].url}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="h-8 w-8 text-gray-300" />
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm line-clamp-2 mb-1">
                      {item.product.name}
                    </h3>
                    <p className="text-xs text-gray-500 mb-2">
                      {item.product.author || 'Unknown Author'}
                    </p>

                    {/* Price */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-base font-bold">₹{item.product.price}</span>
                      {item.product.compare_price > item.product.price && (
                        <>
                          <span className="text-xs text-gray-400 line-through">
                            ₹{item.product.compare_price}
                          </span>
                          <Badge variant="secondary" className="text-[10px] px-1 py-0">
                            {Math.round((1 - item.product.price / item.product.compare_price) * 100)}% off
                          </Badge>
                        </>
                      )}
                    </div>

                    {/* Quantity and Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center bg-gray-100 rounded-lg">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          disabled={updating === item.id}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="px-3 text-sm font-medium min-w-[40px] text-center">
                          {updating === item.id ? (
                            <Loader2 className="h-3 w-3 animate-spin mx-auto" />
                          ) : (
                            item.quantity
                          )}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          disabled={updating === item.id}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={removing === item.id}
                        className="h-8 w-8 text-red-500"
                      >
                        {removing === item.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Delivery Info Card */}
        <div className="bg-blue-50 rounded-xl p-4 mt-4">
          <div className="flex items-start gap-3">
            <Truck className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900">Free Delivery</p>
              <p className="text-xs text-blue-700 mt-0.5">
                On orders above ₹499 • Usually delivered in 2-3 days
              </p>
            </div>
          </div>
        </div>

        {/* Security Badge */}
        <div className="bg-green-50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-green-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-900">100% Secure Payment</p>
              <p className="text-xs text-green-700 mt-0.5">
                Your information is protected
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Summary */}
      <motion.div
        className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-2xl z-50"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", damping: 20 }}
      >
        {/* Expandable Summary */}
        <div
          className="p-4 border-b cursor-pointer"
          onClick={() => setExpandedSummary(!expandedSummary)}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Total Amount</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">₹{total.toFixed(0)}</span>
                {discount > 0 && (
                  <span className="text-sm text-green-600">
                    Saved ₹{discount.toFixed(0)}
                  </span>
                )}
              </div>
            </div>
            <ChevronRight
              className={cn(
                "h-5 w-5 text-gray-400 transition-transform",
                expandedSummary && "rotate-90"
              )}
            />
          </div>
        </div>

        {/* Expanded Details */}
        <AnimatePresence>
          {expandedSummary && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="px-4 py-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal ({cart.items.length} items)</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Coupon Discount</span>
                    <span>-₹{discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery</span>
                  <span className={shipping === 0 ? "text-green-600" : ""}>
                    {shipping === 0 ? "FREE" : `₹${shipping}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">GST (18%)</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>
                <div className="pt-2 border-t flex justify-between font-semibold">
                  <span>Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Checkout Button */}
        <div className="p-4">
          <Button
            asChild
            className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-blue-700"
          >
            <Link href="/checkout">
              Proceed to Checkout
              <ChevronRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </motion.div>

      {/* Coupons Drawer */}
      <AnimatePresence>
        {showCoupons && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-50"
              onClick={() => setShowCoupons(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl z-50 max-h-[80vh] overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold">Available Offers</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowCoupons(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="p-4 space-y-3 overflow-y-auto max-h-[60vh]">
                {/* Coupon Input */}
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="flex-1 px-3 py-2 border rounded-lg text-sm"
                  />
                  <Button
                    onClick={() => handleApplyCoupon(couponCode)}
                    disabled={!couponCode || applyingCoupon}
                    className="px-4"
                  >
                    {applyingCoupon ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Apply'
                    )}
                  </Button>
                </div>

                {/* Available Coupons */}
                {availableCoupons?.map((coupon) => (
                  <motion.div
                    key={coupon.id}
                    whileTap={{ scale: 0.98 }}
                    className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="bg-white rounded-lg p-2">
                          {coupon.type === 'percentage' ? (
                            <Percent className="h-4 w-4 text-blue-600" />
                          ) : (
                            <Gift className="h-4 w-4 text-purple-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-sm">{coupon.code}</p>
                          <p className="text-xs text-gray-600">{coupon.name}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleApplyCoupon(coupon.code)}
                        disabled={applyingCoupon}
                        className="text-xs"
                      >
                        Apply
                      </Button>
                    </div>
                    <p className="text-xs text-gray-700 mb-1">{coupon.description}</p>
                    {coupon.minimum_order_amount > 0 && (
                      <p className="text-xs text-gray-500">
                        Min. order: ₹{coupon.minimum_order_amount}
                      </p>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}