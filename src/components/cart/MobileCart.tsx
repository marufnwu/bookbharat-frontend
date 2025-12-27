'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useHydratedAuth } from '@/stores/auth';
import { useCartStore } from '@/stores/cart';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Tag,
  Truck,
  Shield,
  ChevronRight,
  X,
  Loader2,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useConfig } from '@/contexts/ConfigContext';

interface MobileCartItemProps {
  item: any;
  onUpdateQuantity: (id: number, quantity: number) => void;
  onRemove: (id: number) => void;
  isUpdating?: boolean;
  isRemoving?: boolean;
}

export function MobileCartItem({
  item,
  onUpdateQuantity,
  onRemove,
  isUpdating,
  isRemoving
}: MobileCartItemProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="bg-card rounded-lg p-3 border border-border">
      <div className="flex gap-3">
        {/* Product Image */}
        <div className="w-20 h-24 flex-shrink-0 bg-muted rounded-md overflow-hidden relative">
          {item.product?.images?.[0] && !imageError ? (
            <Image
              src={item.product.images[0].image_url || images[0].url}
              alt={item.product.name}
              fill
              className="object-cover"
              sizes="80px"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <ShoppingBag className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
          {item.product?.discount_percentage > 0 && (
            <Badge className="absolute top-1 left-1 text-[9px] px-1 py-0" variant="destructive">
              -{item.product.discount_percentage}%
            </Badge>
          )}
        </div>

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          <Link href={`/products/${item.product?.slug || item.product_id}`}>
            <h3 className="text-sm font-medium line-clamp-2 mb-1">
              {item.product?.name || 'Product'}
            </h3>
          </Link>

          {item.product?.author && (
            <p className="text-xs text-muted-foreground mb-1">
              by {item.product.author}
            </p>
          )}

          {/* Price */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-bold">
              ₹{item.price * item.quantity}
            </span>
            {item.product?.compare_price > item.price && (
              <>
                <span className="text-xs text-muted-foreground line-through">
                  ₹{item.product.compare_price * item.quantity}
                </span>
                <Badge className="text-[9px] px-1 py-0" variant="secondary">
                  Save ₹{(item.product.compare_price - item.price) * item.quantity}
                </Badge>
              </>
            )}
          </div>

          {/* Quantity and Actions */}
          <div className="flex items-center justify-between">
            {/* Quantity Selector */}
            <div className="flex items-center gap-1 bg-muted rounded-md p-0.5">
              <button
                onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                disabled={item.quantity <= 1 || isUpdating}
                className="p-1 hover:bg-background rounded transition-colors disabled:opacity-50"
              >
                <Minus className="h-3 w-3" />
              </button>
              <span className="px-2 text-xs font-medium min-w-[24px] text-center">
                {isUpdating ? (
                  <Loader2 className="h-3 w-3 animate-spin mx-auto" />
                ) : (
                  item.quantity
                )}
              </span>
              <button
                onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                disabled={item.quantity >= 10 || isUpdating}
                className="p-1 hover:bg-background rounded transition-colors disabled:opacity-50"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>

            {/* Remove Button */}
            <button
              onClick={() => onRemove(item.id)}
              disabled={isRemoving}
              className="p-1.5 text-destructive hover:bg-destructive/10 rounded-md transition-colors"
            >
              {isRemoving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Stock Status */}
          {item.product?.stock_quantity && item.product.stock_quantity < 10 && (
            <p className="text-[10px] text-warning mt-1">
              Only {item.product.stock_quantity} left in stock
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

interface MobileCartSummaryProps {
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  onCheckout: () => void;
  isProcessing?: boolean;
}

export function MobileCartSummary({
  subtotal,
  shipping,
  tax,
  discount,
  total,
  onCheckout,
  isProcessing
}: MobileCartSummaryProps) {
  const { siteConfig } = useConfig();
  const freeShippingEnabled = siteConfig?.payment?.free_shipping_enabled !== false;
  const freeShippingThreshold = siteConfig?.payment?.free_shipping_threshold || 0;

  return (
    <div className="bg-card rounded-lg border border-border p-4 space-y-3">
      <h3 className="font-semibold text-sm">Order Summary</h3>

      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span>₹{subtotal.toFixed(2)}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-muted-foreground">Shipping</span>
          <span>{shipping === 0 ? 'Free' : `₹${shipping.toFixed(2)}`}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-muted-foreground">Tax</span>
          <span>₹{tax.toFixed(2)}</span>
        </div>

        {discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Discount</span>
            <span>-₹{discount.toFixed(2)}</span>
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-border">
        <div className="flex justify-between font-semibold text-base mb-3">
          <span>Total</span>
          <span>₹{total.toFixed(2)}</span>
        </div>

        <Button
          onClick={onCheckout}
          disabled={isProcessing}
          className="w-full h-10 text-sm"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              Proceed to Checkout
              <ArrowRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </div>

      {/* Benefits */}
      <div className="pt-3 border-t border-border space-y-2">
        {freeShippingEnabled && freeShippingThreshold > 0 && (
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <Truck className="h-3 w-3" />
            <span>Free delivery on orders above ₹{freeShippingThreshold}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <Shield className="h-3 w-3" />
          <span>Secure payment & 100% safe checkout</span>
        </div>
      </div>
    </div>
  );
}

interface MobilePromoCodeProps {
  onApply: (code: string) => Promise<void>;
  appliedCode?: string;
  onRemove?: () => void;
}

export function MobilePromoCode({ onApply, appliedCode, onRemove }: MobilePromoCodeProps) {
  const [code, setCode] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  const handleApply = async () => {
    if (!code.trim()) {
      toast.error('Please enter a promo code');
      return;
    }

    setIsApplying(true);
    try {
      await onApply(code.toUpperCase());
      setCode('');
      toast.success('Promo code applied successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Invalid promo code');
    } finally {
      setIsApplying(false);
    }
  };

  if (appliedCode) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <div>
            <p className="text-xs font-medium text-green-900">
              Promo code applied
            </p>
            <p className="text-[10px] text-green-700">
              Code: {appliedCode}
            </p>
          </div>
        </div>
        {onRemove && (
          <button
            onClick={onRemove}
            className="text-green-600 hover:text-green-700"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border border-border p-3">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Enter promo code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full h-8 pl-9 pr-3 text-xs border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <Button
          onClick={handleApply}
          disabled={isApplying || !code.trim()}
          size="sm"
          className="h-8 px-3 text-xs"
        >
          {isApplying ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            'Apply'
          )}
        </Button>
      </div>
    </div>
  );
}

interface MobileEmptyCartProps {
  onContinueShopping: () => void;
}

export function MobileEmptyCart({ onContinueShopping }: MobileEmptyCartProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
        <ShoppingBag className="h-10 w-10 text-muted-foreground" />
      </div>
      <h2 className="text-lg font-semibold mb-2">Your cart is empty</h2>
      <p className="text-sm text-muted-foreground text-center mb-6 max-w-sm">
        Looks like you haven't added any items to your cart yet. Start shopping to find your next favorite book!
      </p>
      <Button onClick={onContinueShopping} className="h-10">
        <ShoppingBag className="h-4 w-4 mr-2" />
        Continue Shopping
      </Button>
    </div>
  );
}

interface MobileCartRecommendationsProps {
  products: any[];
  onAddToCart: (product: any) => void;
}

export function MobileCartRecommendations({ products, onAddToCart }: MobileCartRecommendationsProps) {
  return (
    <div className="mt-6">
      <h3 className="font-semibold text-sm mb-3">You might also like</h3>
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
        {products.map((product) => (
          <div key={product.id} className="flex-shrink-0 w-32">
            <div className="bg-card rounded-lg border border-border p-2">
              <div className="aspect-[3/4] bg-muted rounded-md mb-2 relative">
                {product.images?.[0] && (
                  <Image
                    src={product.images[0].image_url || images[0].url}
                    alt={product.name}
                    fill
                    className="object-cover rounded-md"
                    sizes="128px"
                  />
                )}
              </div>
              <h4 className="text-[11px] font-medium line-clamp-2 mb-1">
                {product.name}
              </h4>
              <p className="text-xs font-bold mb-2">₹{product.price}</p>
              <Button
                onClick={() => onAddToCart(product)}
                size="sm"
                className="w-full h-7 text-[10px]"
              >
                Add to Cart
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}