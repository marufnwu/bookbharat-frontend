'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { BundleDiscountDisplay } from '@/components/cart/BundleDiscountDisplay';
import {
  ShoppingBag,
  Gift,
  Percent,
  X,
  Loader2,
  ShoppingCart,
  Truck,
  Shield,
  CheckCircle,
  Tag,
  Info,
  HelpCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface CartSummaryData {
  subtotal: number;
  couponDiscount: number;
  bundleDiscount: number;
  discountedSubtotal: number;
  shippingCost: number;
  shippingDetails?: any;
  requiresPincode?: boolean;
  charges?: Array<{
    code: string;
    name: string;
    display_label: string;
    amount: number;
    is_taxable: boolean;
    type: string;
  }>;
  totalCharges?: number;
  tax: number;
  taxesBreakdown?: Array<{
    code: string;
    name: string;
    display_label: string;
    rate: string;
    amount: number;
    taxable_amount: number;
    is_inclusive: boolean;
    type: string;
  }>;
  total: number;
  currencySymbol: string;
  couponCode?: string;
  bundleDetails?: any;
  discountMessage?: string;
  itemCount: number;
}

interface OrderSummaryCardProps {
  summary: CartSummaryData;
  onApplyCoupon: (code: string) => Promise<void>;
  onRemoveCoupon: () => Promise<void>;
  applyCouponLoading?: boolean;
  removeCouponLoading?: boolean;
  variant?: 'cart' | 'checkout' | 'mobile';
  showCheckoutButton?: boolean;
  isProcessingOrder?: boolean;
  onPlaceOrder?: () => void;
  hasValidShippingAddress?: boolean;
  calculatingShipping?: boolean;
  availableCoupons?: any[];
  children?: React.ReactNode; // For custom content like cart items
}

export function OrderSummaryCard({
  summary,
  onApplyCoupon,
  onRemoveCoupon,
  applyCouponLoading = false,
  removeCouponLoading = false,
  variant = 'cart',
  showCheckoutButton = false,
  isProcessingOrder = false,
  onPlaceOrder,
  hasValidShippingAddress = false,
  calculatingShipping = false,
  availableCoupons = [],
  children
}: OrderSummaryCardProps) {
  const [couponCode, setCouponCode] = useState('');
  const [showCouponField, setShowCouponField] = useState(false);

  const handleApplyCoupon = async (code?: string) => {
    const codeToApply = code || couponCode;
    if (!codeToApply.trim()) return;
    
    try {
      await onApplyCoupon(codeToApply.toUpperCase());
      setCouponCode('');
      setShowCouponField(false);
    } catch (error: any) {
      // Error handling is done in parent component
    }
  };

  const handleRemoveCoupon = async () => {
    try {
      await onRemoveCoupon();
    } catch (error) {
      // Error handling is done in parent component
    }
  };

  if (variant === 'mobile') {
    return (
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 z-40">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between text-sm">
              <span>Subtotal:</span>
              <span>{summary.currencySymbol}{parseFloat(String(summary.subtotal)).toFixed(2)}</span>
            </div>
            {(summary.couponDiscount > 0 || summary.bundleDiscount > 0) && (
              <div className="flex items-center justify-between text-xs font-semibold text-green-700 bg-green-50 px-2 py-1 rounded border border-green-200">
                <span className="flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Total Savings:
                </span>
                <span>-{summary.currencySymbol}{(parseFloat(String(summary.couponDiscount)) + parseFloat(String(summary.bundleDiscount))).toFixed(2)}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-base font-bold border-t pt-1 mt-1">
              <span>Total:</span>
              <span className="text-primary">{summary.currencySymbol}{parseFloat(String(summary.total)).toFixed(2)}</span>
            </div>
          </div>
          {showCheckoutButton && (
            <Button asChild className="flex-shrink-0 px-6">
              <a href="/checkout">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Checkout
              </a>
            </Button>
          )}
          {onPlaceOrder && (
            <Button 
              onClick={onPlaceOrder} 
              disabled={isProcessingOrder}
              className="flex-shrink-0 px-6"
            >
              {isProcessingOrder ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <ShoppingCart className="h-4 w-4 mr-2" />
              )}
              {isProcessingOrder ? 'Processing...' : 'Place Order'}
            </Button>
          )}
        </div>
        
        {/* Mobile Coupon Section */}
        {!summary.couponCode && (
          <div className="mt-3 pt-3 border-t border-border">
            {!showCouponField ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCouponField(true)}
                className="w-full border-dashed text-xs"
              >
                <Percent className="h-3 w-3 mr-2" />
                Have a coupon code?
              </Button>
            ) : (
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="flex-1 text-sm h-9"
                  disabled={applyCouponLoading}
                  onKeyPress={(e) => e.key === 'Enter' && handleApplyCoupon()}
                />
                <Button 
                  onClick={() => handleApplyCoupon()} 
                  disabled={applyCouponLoading || !couponCode.trim()}
                  size="sm"
                  className="px-4"
                >
                  {applyCouponLoading ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    'Apply'
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {setShowCouponField(false); setCouponCode('');}}
                  className="px-2"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
            
            {/* Available Coupons - Mobile */}
            {availableCoupons.length > 0 && (
              <div className="space-y-2 mt-3">
                <p className="text-xs text-muted-foreground">Available offers:</p>
                {availableCoupons.slice(0, 2).map((coupon: any) => (
                  <div
                    key={coupon.code}
                    className="p-2 rounded border border-dashed cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleApplyCoupon(coupon.code)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium">{coupon.code}</span>
                      <span className="text-xs text-primary font-medium">Apply</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">{coupon.description}</p>
                    {coupon.min_amount && (
                      <p className="text-[10px] text-muted-foreground">
                        Min. order: {summary.currencySymbol}{coupon.min_amount}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Applied Coupon - Mobile */}
        {summary.couponCode && summary.couponDiscount > 0 && (
          <div className="mt-3 pt-3 border-t border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3 h-3 text-green-600" />
                <span className="text-xs text-green-800 font-medium">Coupon Applied</span>
                <Badge variant="secondary" className="text-[9px] bg-green-200 text-green-800">
                  {summary.couponCode}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRemoveCoupon}
                disabled={removeCouponLoading}
                className="h-6 w-6 text-green-600"
              >
                {removeCouponLoading ? (
                  <Loader2 className="h-2 w-2 animate-spin" />
                ) : (
                  <X className="h-2 w-2" />
                )}
              </Button>
            </div>
          </div>
        )}
        
        {/* Bundle Discount - Mobile */}
        {summary.bundleDiscount > 0 && (
          <div className="mt-3 pt-3 border-t border-border">
            <BundleDiscountDisplay
              bundleDiscount={summary.bundleDiscount}
              bundleDetails={summary.bundleDetails}
              discountMessage={summary.discountMessage}
              currencySymbol={summary.currencySymbol}
              variant="mobile"
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <Card className={variant === 'checkout' ? 'sticky top-4' : ''}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <ShoppingBag className="h-5 w-5 mr-2" />
            {variant === 'checkout' ? 'Order Summary' : 'Cart Summary'}
          </span>
          <Badge variant="secondary">
            {summary.itemCount} items
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Custom content (e.g., cart items for checkout) */}
        {children}

        {/* Applied Coupon */}
        {summary.couponCode && summary.couponDiscount > 0 && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <div>
                    <span className="font-semibold text-green-800 text-sm">Coupon Applied</span>
                    <Badge variant="secondary" className="ml-2 bg-green-200 text-green-800 text-xs">
                      {summary.couponCode}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRemoveCoupon}
                  disabled={removeCouponLoading}
                  className="h-6 w-6 text-green-600 hover:text-green-800"
                >
                  {removeCouponLoading ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <X className="h-3 w-3" />
                  )}
                </Button>
              </div>
              <p className="text-sm text-green-600 mt-1">
                🎉 You saved {summary.currencySymbol}{parseFloat(String(summary.couponDiscount)).toFixed(2)}!
              </p>
            </CardContent>
          </Card>
        )}

        {/* Bundle Discount */}
        <BundleDiscountDisplay
          bundleDiscount={summary.bundleDiscount}
          bundleDetails={summary.bundleDetails}
          discountMessage={summary.discountMessage}
          currencySymbol={summary.currencySymbol}
          variant="desktop"
        />

        {/* Coupon Section */}
        {!summary.couponCode && (
          <div className="space-y-3">
            {!showCouponField ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCouponField(true)}
                className="w-full border-dashed"
              >
                <Percent className="h-4 w-4 mr-2" />
                Have a coupon code?
              </Button>
            ) : (
              <div className="flex space-x-2">
                <Input
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Enter coupon code"
                  className="flex-1"
                  disabled={applyCouponLoading}
                  onKeyPress={(e) => e.key === 'Enter' && handleApplyCoupon()}
                />
                <Button
                  onClick={() => handleApplyCoupon()}
                  disabled={applyCouponLoading || !couponCode.trim()}
                  size="sm"
                >
                  {applyCouponLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Apply'
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {setShowCouponField(false); setCouponCode('');}}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            
            {/* Available Coupons - Desktop */}
            {availableCoupons.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium mb-2">Available Offers</p>
                {availableCoupons.slice(0, 3).map((coupon: any) => (
                  <div
                    key={coupon.code}
                    className="p-3 rounded border border-dashed cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleApplyCoupon(coupon.code)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{coupon.code}</span>
                      <span className="text-sm text-primary font-medium">Apply</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{coupon.description}</p>
                    {coupon.min_amount && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Min. order: {summary.currencySymbol}{coupon.min_amount}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {children && <hr />}

        {/* Price Breakdown */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{summary.currencySymbol}{parseFloat(String(summary.subtotal)).toFixed(2)}</span>
          </div>
          
          {/* Individual Discounts */}
          {summary.couponDiscount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Coupon discount</span>
              <span>-{summary.currencySymbol}{parseFloat(String(summary.couponDiscount)).toFixed(2)}</span>
            </div>
          )}

          {summary.bundleDiscount > 0 && (
            <div className="flex justify-between text-blue-600">
              <span>Bundle discount</span>
              <span>-{summary.currencySymbol}{parseFloat(String(summary.bundleDiscount)).toFixed(2)}</span>
            </div>
          )}
          
          {/* Total Discount Summary */}
          {(summary.couponDiscount > 0 || summary.bundleDiscount > 0) && (
            <div className="flex justify-between text-green-700 font-semibold bg-green-50 px-3 py-2 rounded-lg border border-green-200">
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Total Savings
              </span>
              <span>-{summary.currencySymbol}{(parseFloat(String(summary.couponDiscount)) + parseFloat(String(summary.bundleDiscount))).toFixed(2)}</span>
            </div>
          )}
          
          <div className="flex justify-between">
            <span className="flex items-center">
              Shipping
              {calculatingShipping && (
                <Loader2 className="h-3 w-3 animate-spin ml-2" />
              )}
            </span>
            <span>
              {summary.requiresPincode && variant === 'cart' ? (
                <span className="text-xs text-muted-foreground italic">Calculated at checkout</span>
              ) : variant === 'checkout' && !hasValidShippingAddress ? (
                <span className="text-muted-foreground">TBD</span>
              ) : summary.shippingCost === 0 ? (
                <span className="text-green-600 font-semibold">FREE</span>
              ) : (
                `${summary.currencySymbol}${parseFloat(String(summary.shippingCost)).toFixed(2)}`
              )}
            </span>
          </div>

          {/* Additional Charges - Enhanced with COD Service Charge highlighting */}
          {summary.charges && summary.charges.length > 0 && (
            <>
              {summary.charges.map((charge: any, index: number) => {
                const isCODCharge = charge.code?.toLowerCase().includes('cod') || 
                                   charge.name?.toLowerCase().includes('cod') ||
                                   charge.type?.toLowerCase().includes('cod');
                return (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="flex items-center gap-1.5">
                      {charge.display_label || charge.name}
                      {isCODCharge && (
                        <span 
                          className="inline-flex items-center cursor-help" 
                          title="Service charge for Cash on Delivery orders"
                        >
                          <HelpCircle className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground transition-colors" />
                        </span>
                      )}
                    </span>
                    <span className={isCODCharge ? 'text-orange-600 font-medium' : ''}>
                      {summary.currencySymbol}{parseFloat(String(charge.amount)).toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </>
          )}


          {/* Tax Breakdown */}
          {summary.taxesBreakdown && summary.taxesBreakdown.length > 0 ? (
            <>
              {summary.taxesBreakdown.map((tax: any, index: number) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>{tax.display_label}</span>
                  <span>{summary.currencySymbol}{parseFloat(String(tax.amount)).toFixed(2)}</span>
                </div>
              ))}
            </>
          ) : (
            <div className="flex justify-between">
              <span>Tax (GST 18%)</span>
              <span>{summary.currencySymbol}{parseFloat(String(summary.tax)).toFixed(2)}</span>
            </div>
          )}

          <hr />
          
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span className="text-primary">{summary.currencySymbol}{parseFloat(String(summary.total)).toFixed(2)}</span>
          </div>
          
          {/* Total Savings Highlight */}
          {(summary.couponDiscount > 0 || summary.bundleDiscount > 0) && (
            <div className="text-center text-sm text-green-600 bg-green-50 p-2 rounded border border-green-200">
              🎉 You saved {summary.currencySymbol}{(parseFloat(String(summary.couponDiscount)) + parseFloat(String(summary.bundleDiscount))).toFixed(2)} on this order!
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {showCheckoutButton && (
          <Button className="w-full" size="lg" asChild>
            <a href="/checkout">
              <ShoppingCart className="h-5 w-5 mr-2" />
              Proceed to Checkout
            </a>
          </Button>
        )}

        {onPlaceOrder && (
          <Button 
            onClick={onPlaceOrder} 
            disabled={isProcessingOrder}
            className="w-full"
            size="lg"
          >
            {isProcessingOrder ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Shield className="h-4 w-4 mr-2" />
                Place Order • {summary.currencySymbol}{parseFloat(String(summary.total)).toFixed(2)}
              </>
            )}
          </Button>
        )}

        {/* Trust badges */}
        {variant === 'cart' && (
          <div className="text-center text-xs text-muted-foreground space-y-1">
            <div className="flex items-center justify-center gap-1">
              <Shield className="h-3 w-3" />
              <span>Secure checkout</span>
            </div>
            <div className="flex items-center justify-center gap-1">
              <Truck className="h-3 w-3" />
              <span>Free delivery above {summary.currencySymbol}499</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}