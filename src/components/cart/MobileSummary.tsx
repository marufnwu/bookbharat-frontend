'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ChevronUp,
  ChevronDown,
  Tag,
  Truck,
  Shield,
  Percent,
  Gift,
  X,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface MobileSummaryProps {
  summary: {
    subtotal: number;
    couponDiscount?: number;
    bundleDiscount?: number;
    shippingCost?: number;
    tax: number;
    total: number;
    currencySymbol?: string;
    couponCode?: string | null;
    itemCount: number;
  };
  availableCoupons?: any[];
  onApplyCoupon?: (code: string) => Promise<void>;
  onRemoveCoupon?: () => Promise<void>;
  className?: string;
}

export function MobileSummary({
  summary,
  availableCoupons = [],
  onApplyCoupon,
  onRemoveCoupon,
  className
}: MobileSummaryProps) {
  const [expanded, setExpanded] = useState(false);
  const [showCoupons, setShowCoupons] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [applying, setApplying] = useState(false);

  const totalDiscount = (summary.couponDiscount || 0) + (summary.bundleDiscount || 0);
  const symbol = summary.currencySymbol || '₹';

  const handleApplyCoupon = async (code: string) => {
    if (!onApplyCoupon) return;

    setApplying(true);
    try {
      await onApplyCoupon(code);
      setShowCoupons(false);
      setCouponCode('');
    } catch (error) {
      // Error handled by parent
    } finally {
      setApplying(false);
    }
  };

  return (
    <>
      <motion.div
        className={cn(
          "fixed bottom-0 left-0 right-0 bg-white border-t shadow-2xl z-40",
          className
        )}
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", damping: 20 }}
      >
        {/* Quick Actions Bar */}
        <div className="flex items-center justify-between p-3 border-b bg-gradient-to-r from-blue-50 to-purple-50">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCoupons(true)}
            className="text-blue-600 font-medium"
          >
            <Tag className="h-4 w-4 mr-1.5" />
            {summary.couponCode ? 'Change Offer' : 'Apply Coupon'}
          </Button>

          {summary.couponCode && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                {summary.couponCode} Applied
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                onClick={onRemoveCoupon}
                className="h-6 w-6"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>

        {/* Summary Header */}
        <div
          className="p-4 cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1">
                {summary.itemCount} {summary.itemCount === 1 ? 'item' : 'items'}
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">
                  {symbol}{summary.total.toFixed(0)}
                </span>
                {totalDiscount > 0 && (
                  <span className="text-sm text-green-600 font-medium">
                    Saved {symbol}{totalDiscount.toFixed(0)}
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Button
                asChild
                size="sm"
                className="bg-gradient-to-r from-blue-600 to-blue-700 px-6"
              >
                <Link href="/checkout">
                  Checkout
                </Link>
              </Button>
              <button className="text-gray-400">
                {expanded ? (
                  <ChevronDown className="h-5 w-5" />
                ) : (
                  <ChevronUp className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Expanded Details */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t"
            >
              <div className="p-4 space-y-3">
                {/* Price Breakdown */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span>{symbol}{summary.subtotal.toFixed(2)}</span>
                  </div>

                  {summary.couponDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Coupon Discount</span>
                      <span>-{symbol}{summary.couponDiscount.toFixed(2)}</span>
                    </div>
                  )}

                  {summary.bundleDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Bundle Discount</span>
                      <span>-{symbol}{summary.bundleDiscount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery</span>
                    <span className={summary.shippingCost === 0 ? "text-green-600 font-medium" : ""}>
                      {summary.shippingCost === 0 ? "FREE" : `${symbol}${summary.shippingCost}`}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">GST (18%)</span>
                    <span>{symbol}{summary.tax.toFixed(2)}</span>
                  </div>

                  <div className="pt-2 border-t flex justify-between font-semibold text-base">
                    <span>Total Amount</span>
                    <span>{symbol}{summary.total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Truck className="h-4 w-4 text-blue-500" />
                    <span>Fast Delivery</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Shield className="h-4 w-4 text-green-500" />
                    <span>Secure Payment</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Coupons Sheet */}
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
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 max-h-[85vh]"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
                <h2 className="text-lg font-semibold">Apply Coupon</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowCoupons(false)}
                  className="h-8 w-8"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Content */}
              <div className="p-4 pb-8 overflow-y-auto max-h-[70vh]">
                {/* Manual Input */}
                <div className="flex gap-2 mb-6">
                  <input
                    type="text"
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                  />
                  <Button
                    onClick={() => handleApplyCoupon(couponCode)}
                    disabled={!couponCode || applying}
                    className="px-6"
                  >
                    {applying ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Apply'
                    )}
                  </Button>
                </div>

                {/* Available Coupons */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    Available Offers ({availableCoupons.length})
                  </h3>

                  {availableCoupons.map((coupon) => (
                    <motion.div
                      key={coupon.id}
                      whileTap={{ scale: 0.98 }}
                      className="relative overflow-hidden rounded-2xl border"
                    >
                      {/* Decorative Pattern */}
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 opacity-50" />

                      <div className="relative p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="bg-white rounded-xl p-2.5 shadow-sm">
                              {coupon.type === 'percentage' ? (
                                <Percent className="h-5 w-5 text-blue-600" />
                              ) : coupon.type === 'free_shipping' ? (
                                <Truck className="h-5 w-5 text-green-600" />
                              ) : (
                                <Gift className="h-5 w-5 text-purple-600" />
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-base">{coupon.code}</p>
                              <p className="text-xs text-gray-600 mt-0.5">{coupon.name}</p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleApplyCoupon(coupon.code)}
                            disabled={applying || summary.couponCode === coupon.code}
                            className="text-xs px-4"
                          >
                            {summary.couponCode === coupon.code ? 'Applied' : 'Apply'}
                          </Button>
                        </div>

                        <p className="text-sm text-gray-700 mb-2">{coupon.description}</p>

                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          {coupon.minimum_order_amount > 0 && (
                            <span>Min. order: {symbol}{coupon.minimum_order_amount}</span>
                          )}
                          {coupon.expires_at && (
                            <span>Valid till {new Date(coupon.expires_at).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}