'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useConfig } from '@/contexts/ConfigContext';
import { useCartStore } from '@/stores/cart';
import { useWishlistStore } from '@/stores/wishlist';
import { Product, ProductBundleVariant } from '@/types';
import { toast } from 'sonner';
import BundleVariantSelector from '@/components/product/BundleVariantSelector';
import {
  Star,
  Heart,
  Share2,
  Minus,
  Plus,
  ShoppingCart,
  Truck,
  Shield,
  RotateCcw,
  Check,
  Loader2,
  Award,
  TrendingUp,
  X,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductInfoCompactProps {
  product: Product;
  className?: string;
}

export function ProductInfoCompact({ product, className = '' }: ProductInfoCompactProps) {
  const { siteConfig } = useConfig();
  const { addToCart } = useCartStore();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore();

  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);
  const [selectedBundleVariant, setSelectedBundleVariant] = useState<ProductBundleVariant | null>(null);

  const currencySymbol = siteConfig?.payment?.currency_symbol || '₹';
  const isWishlisted = isInWishlist(product.id);

  // Get active bundle variants
  const activeBundleVariants = product.active_bundle_variants || product.bundle_variants || [];

  const getDiscountPercentage = () => {
    if (!product.compare_price || product.compare_price <= product.price) return 0;
    return Math.round((1 - product.price / product.compare_price) * 100);
  };

  const handleAddToCart = async () => {
    try {
      setAddingToCart(true);
      await addToCart(product, quantity, selectedBundleVariant?.id);
      
      const successMessage = selectedBundleVariant 
        ? `${selectedBundleVariant.name} added to cart!` 
        : 'Added to cart!';
      
      toast.success(successMessage);
    } catch (error) {
      toast.error('Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    try {
      setBuyingNow(true);
      await addToCart(product, quantity, selectedBundleVariant?.id);
      window.location.href = '/checkout';
    } catch (error) {
      toast.error('Failed to proceed');
    } finally {
      setBuyingNow(false);
    }
  };

  const handleWishlistToggle = async () => {
    try {
      if (isWishlisted) {
        await removeFromWishlist(product.id);
        toast.success('Removed from wishlist');
      } else {
        await addToWishlist(product);
        toast.success('Added to wishlist');
      }
    } catch (error) {
      toast.error('Failed to update wishlist');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Check out: ${product.name}`,
          url: window.location.href,
        });
      } catch (error) {
        navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied!');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied!');
    }
  };

  // Listen for custom events from mobile action bar
  useEffect(() => {
    const handleAddToCartEvent = (e: any) => {
      if (e.detail?.product?.id === product.id) {
        handleAddToCart();
      }
    };

    const handleBuyNowEvent = (e: any) => {
      if (e.detail?.product?.id === product.id) {
        handleBuyNow();
      }
    };

    window.addEventListener('addToCart' as any, handleAddToCartEvent);
    window.addEventListener('buyNow' as any, handleBuyNowEvent);

    return () => {
      window.removeEventListener('addToCart' as any, handleAddToCartEvent);
      window.removeEventListener('buyNow' as any, handleBuyNowEvent);
    };
  }, [product.id, quantity]);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Title and Badges - Compact */}
      <div>
        <div className="flex flex-wrap items-center gap-1.5 mb-2">
          {product.category?.name && (
            <Badge variant="secondary" className="text-xs px-2 py-0.5">
              {product.category.name}
            </Badge>
          )}
          {product.is_bestseller && (
            <Badge className="bg-orange-500 hover:bg-orange-600 text-white text-xs px-2 py-0.5">
              <TrendingUp className="h-3 w-3 mr-1" />
              Bestseller
            </Badge>
          )}
          {product.is_featured && (
            <Badge className="bg-purple-500 hover:bg-purple-600 text-white text-xs px-2 py-0.5">
              <Award className="h-3 w-3 mr-1" />
              Featured
            </Badge>
          )}
        </div>

        <h1 className="text-xl md:text-2xl font-bold text-foreground mb-1.5 leading-tight">
          {product.name}
        </h1>

        <p className="text-sm text-muted-foreground">
          by <span className="font-medium text-foreground">{product.brand || product.author || 'Unknown Author'}</span>
        </p>
      </div>

      {/* Rating - Compact */}
      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "h-4 w-4",
                  i < Math.floor(product.rating || 4.5)
                    ? "text-yellow-400 fill-current"
                    : "text-gray-300"
                )}
              />
            ))}
          </div>
          <span className="font-semibold text-sm">{product.rating || '4.5'}</span>
          <span className="text-xs text-muted-foreground">({product.total_reviews || 150})</span>
        </div>
      </div>

      {/* Price - Compact */}
      <div className="space-y-2">
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-3xl md:text-4xl font-bold text-foreground">
            {currencySymbol}{parseFloat(String(product.price)).toFixed(2)}
          </span>
          {product.compare_price && product.compare_price > product.price && (
            <>
              <span className="text-lg text-muted-foreground line-through">
                {currencySymbol}{parseFloat(String(product.compare_price)).toFixed(2)}
              </span>
              {getDiscountPercentage() > 0 && (
                <Badge className="bg-red-500 text-white hover:bg-red-600 px-2 py-0.5">
                  {getDiscountPercentage()}% OFF
                </Badge>
              )}
            </>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Shield className="h-3 w-3" />
          <span>Inclusive of all taxes</span>
        </div>
      </div>

      {/* Stock Status - Compact */}
      <div className={cn(
        "flex items-center gap-2 p-3 rounded-lg",
        product.in_stock ? "bg-green-50" : "bg-red-50"
      )}>
        <div className={cn(
          "flex items-center justify-center w-6 h-6 rounded-full",
          product.in_stock ? "bg-green-100" : "bg-red-100"
        )}>
          {product.in_stock ? (
            <Check className="h-4 w-4 text-green-600" />
          ) : (
            <X className="h-4 w-4 text-red-600" />
          )}
        </div>
        <div>
          <div className={cn(
            "font-medium text-sm",
            product.in_stock ? "text-green-800" : "text-red-800"
          )}>
            {product.in_stock ? 'In Stock' : 'Out of Stock'}
          </div>
          {product.in_stock && product.stock_quantity && product.stock_quantity < 10 && (
            <div className="text-xs text-green-600">
              Only {product.stock_quantity} left
            </div>
          )}
        </div>
      </div>

      {/* Bundle Variant Selector */}
      {activeBundleVariants.length > 0 && (
        <BundleVariantSelector
          productId={product.id}
          productName={product.name}
          productPrice={product.price}
          bundleVariants={activeBundleVariants}
          onVariantSelect={setSelectedBundleVariant}
          selectedVariantId={selectedBundleVariant?.id}
        />
      )}

      {/* Quantity Selector - Compact - Hidden on mobile (uses mobile action bar) */}
      {product.in_stock && (
        <div className="hidden md:flex items-center gap-3">
          <span className="text-sm font-medium">Quantity:</span>
          <div className="flex items-center border rounded-lg">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-2 hover:bg-muted transition-colors"
              disabled={quantity <= 1}
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="px-4 font-medium min-w-[3rem] text-center">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="p-2 hover:bg-muted transition-colors"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Action Buttons - Compact - Hidden on mobile */}
      {product.in_stock && (
        <div className="hidden md:grid grid-cols-2 gap-2">
          <Button
            onClick={handleAddToCart}
            disabled={addingToCart}
            className="w-full"
            variant="outline"
          >
            {addingToCart ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <ShoppingCart className="h-4 w-4 mr-2" />
            )}
            Add to Cart
          </Button>
          <Button
            onClick={handleBuyNow}
            disabled={buyingNow}
            className="w-full bg-orange-500 hover:bg-orange-600"
          >
            {buyingNow ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Zap className="h-4 w-4 mr-2" />
            )}
            Buy Now
          </Button>
        </div>
      )}

      {/* Wishlist and Share - Compact */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleWishlistToggle}
          className="flex-1"
        >
          <Heart className={cn(
            "h-4 w-4 mr-2",
            isWishlisted && "fill-red-500 text-red-500"
          )} />
          {isWishlisted ? 'Wishlisted' : 'Wishlist'}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleShare}
          className="flex-1"
        >
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </div>

      {/* Key Features - Compact */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t">
        <div className="flex items-start gap-2">
          <Truck className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
          <div>
            <div className="text-xs font-medium">Free Delivery</div>
            <div className="text-xs text-muted-foreground">On orders above ₹499</div>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <RotateCcw className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
          <div>
            <div className="text-xs font-medium">Easy Returns</div>
            <div className="text-xs text-muted-foreground">7 days return policy</div>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <Shield className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
          <div>
            <div className="text-xs font-medium">Secure Payment</div>
            <div className="text-xs text-muted-foreground">100% secure</div>
          </div>
        </div>
      </div>
    </div>
  );
}

