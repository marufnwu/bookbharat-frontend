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
import { StockIndicator } from '@/components/product/StockIndicator';
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
  }, [product.id, handleAddToCart, handleBuyNow]);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Mobile-First Header - Name and Author */}
      <div className="space-y-1">
        <div className="flex flex-wrap gap-1 sm:gap-2">
          {product.is_featured && (
            <Badge className="bg-purple-500 hover:bg-purple-600 text-white text-[10px] sm:text-xs px-1.5 py-0.5 sm:px-2">
              <Award className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
              Featured
            </Badge>
          )}
          {product.is_bestseller && (
            <Badge className="bg-orange-500 hover:bg-orange-600 text-white text-[10px] sm:text-xs px-1.5 py-0.5 sm:px-2">
              <TrendingUp className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
              Bestseller
            </Badge>
          )}
        </div>

        <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground leading-tight">
          {product.name}
        </h1>

        <p className="text-xs sm:text-sm text-muted-foreground">
          by <span className="font-medium text-foreground">{product.brand || product.author || 'Unknown Author'}</span>
        </p>
      </div>

      {/* Mobile-First Rating */}
      <div className="flex items-center justify-between p-2 sm:p-3 bg-muted/30 rounded-lg">
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "h-3 w-3 sm:h-4 sm:w-4",
                  i < Math.floor(product.rating || 4.5)
                    ? "text-yellow-400 fill-current"
                    : "text-gray-300"
                )}
              />
            ))}
          </div>
          <span className="font-semibold text-xs sm:text-sm">{product.rating || '4.5'}</span>
          <span className="text-[10px] sm:text-xs text-muted-foreground">({product.total_reviews || 0})</span>
        </div>
      </div>

      {/* Mobile-First Price Display */}
      <div className="space-y-1">
        {selectedBundleVariant ? (
          // Bundle pricing display
          <div className="space-y-1">
            <div className="text-[10px] sm:text-xs text-green-700 font-medium">
              {selectedBundleVariant.name} Selected
            </div>
            <div className="flex items-baseline gap-1 sm:gap-2 flex-wrap">
              <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-700">
                {currencySymbol}{parseFloat(String(selectedBundleVariant.calculated_price || 0)).toFixed(2)}
              </span>
              <span className="text-xs sm:text-base sm:text-lg text-muted-foreground line-through">
                {currencySymbol}{(product.price * selectedBundleVariant.quantity).toFixed(2)}
              </span>
              {selectedBundleVariant.savings_percentage && selectedBundleVariant.savings_percentage > 0 && (
                <Badge className="bg-green-600 text-white hover:bg-green-700 text-[9px] sm:text-xs px-1 sm:px-2 py-0.5">
                  SAVE {Math.round(selectedBundleVariant.savings_percentage)}%
                </Badge>
              )}
            </div>
            <div className="text-xs sm:text-sm text-green-600">
              You save {currencySymbol}{parseFloat(String(selectedBundleVariant.savings_amount || 0)).toFixed(2)} with this bundle!
            </div>
          </div>
        ) : (
          // Regular pricing display
          <div className="flex items-baseline gap-1 sm:gap-2 flex-wrap">
            <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
              {currencySymbol}{parseFloat(String(product.price)).toFixed(2)}
            </span>
            {product.compare_price && product.compare_price > product.price && (
              <>
                <span className="text-xs sm:text-base sm:text-lg text-muted-foreground line-through">
                  {currencySymbol}{parseFloat(String(product.compare_price)).toFixed(2)}
                </span>
                {getDiscountPercentage() > 0 && (
                  <Badge className="bg-red-500 text-white hover:bg-red-600 text-[9px] sm:text-xs px-1 sm:px-2 py-0.5">
                    {getDiscountPercentage()}% OFF
                  </Badge>
                )}
              </>
            )}
          </div>
        )}

        <div className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground">
          <Shield className="h-3 w-3" />
          <span>Inclusive of all taxes</span>
        </div>
      </div>

      {/* Enhanced Stock Status */}
      <StockIndicator
        product={product}
        showEstimatedDelivery={true}
      />

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

      {/* Mobile-First Quantity Selector - Hidden on mobile (uses mobile action bar) */}
      {product.in_stock && (
        <div className="hidden md:flex items-center gap-2 lg:gap-3">
          <span className="text-xs sm:text-sm font-medium">
            {selectedBundleVariant ? 'Number of Bundles:' : 'Quantity:'}
          </span>
          <div className="flex items-center border rounded-lg">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-1.5 hover:bg-muted transition-colors"
              disabled={quantity <= 1}
            >
              <Minus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
            <span className="px-3 sm:px-4 font-medium min-w-[2.5rem] text-center text-sm">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="p-1.5 hover:bg-muted transition-colors"
            >
              <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
          </div>
          {selectedBundleVariant && selectedBundleVariant.quantity && (
            <span className="text-[10px] sm:text-xs text-green-700">
              = {quantity * selectedBundleVariant.quantity} total items
            </span>
          )}
        </div>
      )}

      {/* Desktop Action Buttons */}
      {product.in_stock && (
        <div className="flex md:flex md:flex-row gap-3 lg:gap-4">
          <Button
            onClick={handleAddToCart}
            disabled={addingToCart}
            className={`w-full text-sm md:text-base md:py-3 lg:py-3.5 ${selectedBundleVariant ? 'bg-green-600 hover:bg-green-700 text-white' : ''}`}
            variant={selectedBundleVariant ? 'default' : 'outline'}
          >
            {addingToCart ? (
              <Loader2 className="h-4 w-4 md:h-5 md:w-5 mr-2 animate-spin" />
            ) : (
              <ShoppingCart className="h-4 w-4 md:h-5 md:w-5 mr-2" />
            )}
            {selectedBundleVariant ? 'Add Bundle to Cart' : 'Add to Cart'}
          </Button>
          <Button
            onClick={handleBuyNow}
            disabled={buyingNow}
            className="w-full bg-orange-500 hover:bg-orange-600 text-sm"
          >
            {buyingNow ? (
              <Loader2 className="h-4 w-4 md:h-5 md:w-5 mr-2 animate-spin" />
            ) : (
              <Zap className="h-4 w-4 md:h-5 md:w-5 mr-2" />
            )}
            {selectedBundleVariant ? 'Buy Bundle Now' : 'Buy Now'}
          </Button>
        </div>
      )}

      {/* Mobile-First Wishlist and Share */}
      <div className="flex gap-1.5 sm:gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleWishlistToggle}
          className="flex-1 text-sm md:text-base h-9 md:h-10"
        >
          <Heart className={cn(
            "h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1",
            isWishlisted && "fill-red-500 text-red-500"
          )} />
          <span className="hidden xs:inline">{isWishlisted ? 'Wishlisted' : 'Wishlist'}</span>
          <span className="xs:hidden">{isWishlisted ? '❤️' : '🤍'}</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleShare}
          className="flex-1 text-sm md:text-base h-9 md:h-10"
        >
          <Share2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
          <span className="hidden xs:inline">Share</span>
        </Button>
      </div>

      {/* Mobile-First Key Features */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 pt-2 sm:pt-3 border-t">
        <div className="flex items-start gap-1.5 sm:gap-2">
          <Truck className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary mt-0.5 flex-shrink-0" />
          <div>
            <div className="text-[10px] sm:text-xs font-medium">Free Delivery</div>
            <div className="text-[9px] sm:text-xs text-muted-foreground">On orders above ₹499</div>
          </div>
        </div>
        <div className="flex items-start gap-1.5 sm:gap-2">
          <RotateCcw className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary mt-0.5 flex-shrink-0" />
          <div>
            <div className="text-[10px] sm:text-xs font-medium">Easy Returns</div>
            <div className="text-[9px] sm:text-xs text-muted-foreground">7 days return policy</div>
          </div>
        </div>
        <div className="flex items-start gap-1.5 sm:gap-2">
          <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary mt-0.5 flex-shrink-0" />
          <div>
            <div className="text-[10px] sm:text-xs font-medium">Secure Payment</div>
            <div className="text-[9px] sm:text-xs text-muted-foreground">100% secure</div>
          </div>
        </div>
      </div>
    </div>
  );
}

