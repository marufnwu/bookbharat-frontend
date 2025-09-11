'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { 
  Heart, 
  ShoppingCart, 
  Star, 
  Zap,
  Plus,
  Minus,
  Share2,
  Eye,
  TrendingUp,
  Clock,
  CheckCircle,
  X,
  Loader2
} from 'lucide-react';
import { Product } from '@/types';
import { useCartStore } from '@/stores/cart';
import { useWishlistStore } from '@/stores/wishlist';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface MobileProductCardProps {
  product: Product;
  variant?: 'grid' | 'list' | 'compact' | 'minimal';
  onQuickView?: () => void;
  className?: string;
}

export function MobileProductCard({ 
  product, 
  variant = 'grid',
  onQuickView,
  className 
}: MobileProductCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isImageLoading, setIsImageLoading] = useState(true);
  
  const { addToCart } = useCartStore();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore();
  const isWishlisted = isInWishlist(product.id);

  const discountPercentage = product.compare_price && product.compare_price > product.price
    ? Math.round((1 - product.price / product.compare_price) * 100)
    : 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!product.in_stock) {
      toast.error('Product is out of stock');
      return;
    }
    
    try {
      setIsAddingToCart(true);
      await addToCart(product, quantity);
      toast.success(`Added ${quantity} item(s) to cart`);
      setShowQuickAdd(false);
      setQuantity(1);
    } catch (error) {
      toast.error('Failed to add to cart');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
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

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Check out ${product.name} on BookBharat`,
          url: `/products/${product.slug || product.id}`
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.origin + `/products/${product.slug || product.id}`);
      toast.success('Link copied to clipboard');
    }
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onQuickView?.();
  };

  if (variant === 'list') {
    return (
      <div className={cn(
        'flex bg-card rounded-lg border border-border overflow-hidden hover:shadow-md transition-all',
        className
      )}>
        {/* Image */}
        <Link href={`/products/${product.slug || product.id}`} className="relative w-24 xs:w-28 sm:w-32 flex-shrink-0">
          <div className="aspect-[3/4] relative bg-muted">
            {product.images?.[0] && !imageError ? (
              <Image
                src={product.images[0].url}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 96px, 128px"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <TrendingUp className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
            {discountPercentage > 0 && (
              <Badge className="absolute top-1 left-1 text-[10px] px-1.5 py-0.5" variant="destructive">
                -{discountPercentage}%
              </Badge>
            )}
          </div>
        </Link>

        {/* Content */}
        <div className="flex-1 p-3 flex flex-col">
          <Link href={`/products/${product.slug || product.id}`} className="flex-1">
            <h3 className="font-medium text-sm line-clamp-2 mb-1">{product.name}</h3>
            {product.brand && (
              <p className="text-xs text-muted-foreground mb-1">by {product.brand}</p>
            )}
            
            {/* Rating */}
            <div className="flex items-center gap-1 mb-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={cn(
                      "h-3 w-3",
                      i < 4 ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                    )}
                  />
                ))}
              </div>
              <span className="text-[10px] text-muted-foreground">(4.5)</span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-2">
              <span className="font-bold text-base">₹{product.price}</span>
              {product.compare_price && product.compare_price > product.price && (
                <span className="text-xs text-muted-foreground line-through">
                  ₹{product.compare_price}
                </span>
              )}
            </div>
          </Link>

          {/* Actions */}
          <div className="flex items-center gap-2 mt-2">
            <Button
              size="sm"
              onClick={handleAddToCart}
              disabled={!product.in_stock || isAddingToCart}
              className="flex-1 h-8 text-xs"
            >
              {isAddingToCart ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <>
                  <ShoppingCart className="h-3 w-3 mr-1" />
                  Add
                </>
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleWishlistToggle}
              className="h-8 w-8 p-0"
            >
              <Heart className={cn(
                "h-3.5 w-3.5",
                isWishlisted && "fill-current text-red-500"
              )} />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'minimal') {
    return (
      <Link href={`/products/${product.slug || product.id}`}>
        <div className={cn(
          'group',
          className
        )}>
          {/* Image */}
          <div className="aspect-[3/4] relative bg-muted rounded-lg overflow-hidden mb-2">
            {product.images?.[0] && !imageError ? (
              <Image
                src={product.images[0].url}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform"
                sizes="(max-width: 475px) 50vw, (max-width: 640px) 33vw, 25vw"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <TrendingUp className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
            {discountPercentage > 0 && (
              <Badge className="absolute top-1 left-1 text-[10px] px-1 py-0" variant="destructive">
                -{discountPercentage}%
              </Badge>
            )}
          </div>

          {/* Content */}
          <div className="space-y-0.5">
            <h3 className="text-xs font-medium line-clamp-2">{product.name}</h3>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm">₹{product.price}</span>
              {product.compare_price && product.compare_price > product.price && (
                <span className="text-[10px] text-muted-foreground line-through">
                  ₹{product.compare_price}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Default grid variant
  return (
    <div className={cn(
      'group bg-card rounded-lg border border-border overflow-hidden hover:shadow-lg transition-all relative',
      className
    )}>
      {/* Quick Actions Overlay */}
      <div className="absolute top-2 right-2 z-10 flex flex-col gap-1.5">
        <button
          onClick={handleWishlistToggle}
          className="p-1.5 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:scale-110 transition-transform"
        >
          <Heart className={cn(
            "h-3.5 w-3.5",
            isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600"
          )} />
        </button>
        <button
          onClick={handleShare}
          className="p-1.5 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:scale-110 transition-transform"
        >
          <Share2 className="h-3.5 w-3.5 text-gray-600" />
        </button>
        {onQuickView && (
          <button
            onClick={handleQuickView}
            className="p-1.5 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:scale-110 transition-transform"
          >
            <Eye className="h-3.5 w-3.5 text-gray-600" />
          </button>
        )}
      </div>

      {/* Image */}
      <Link href={`/products/${product.slug || product.id}`}>
        <div className="aspect-[3/4] relative bg-muted">
          {product.images?.[0] && !imageError ? (
            <>
              {isImageLoading && (
                <div className="absolute inset-0 bg-muted animate-pulse" />
              )}
              <Image
                src={product.images[0].url}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform"
                sizes="(max-width: 475px) 50vw, (max-width: 640px) 33vw, 25vw"
                onError={() => setImageError(true)}
                onLoad={() => setIsImageLoading(false)}
                priority={false}
              />
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {discountPercentage > 0 && (
              <Badge variant="destructive" className="text-[10px] px-1.5 py-0.5">
                -{discountPercentage}%
              </Badge>
            )}
            {product.is_featured && (
              <Badge className="text-[10px] px-1.5 py-0.5">
                Featured
              </Badge>
            )}
            {!product.in_stock && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">
                Out of Stock
              </Badge>
            )}
          </div>
        </div>
      </Link>

      {/* Content */}
      <div className="p-3">
        <Link href={`/products/${product.slug || product.id}`}>
          {/* Category */}
          {product.category?.name && (
            <p className="text-[10px] text-primary font-medium uppercase tracking-wider mb-1">
              {product.category.name}
            </p>
          )}

          {/* Title */}
          <h3 className="font-medium text-sm line-clamp-2 mb-1 min-h-[2.5rem]">
            {product.name}
          </h3>

          {/* Author/Brand */}
          {product.brand && (
            <p className="text-xs text-muted-foreground mb-2">by {product.brand}</p>
          )}

          {/* Rating */}
          <div className="flex items-center gap-1 mb-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={cn(
                    "h-3 w-3",
                    i < 4 ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                  )}
                />
              ))}
            </div>
            <span className="text-[10px] text-muted-foreground">(234)</span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2 mb-3">
            <span className="font-bold text-base">₹{product.price}</span>
            {product.compare_price && product.compare_price > product.price && (
              <>
                <span className="text-xs text-muted-foreground line-through">
                  ₹{product.compare_price}
                </span>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  Save ₹{product.compare_price - product.price}
                </Badge>
              </>
            )}
          </div>
        </Link>

        {/* Quick Add Section */}
        {showQuickAdd ? (
          <div className="space-y-2 animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium">Quantity:</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setQuantity(Math.max(1, quantity - 1));
                  }}
                  className="p-1 hover:bg-muted rounded transition-colors"
                  disabled={quantity <= 1}
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="w-8 text-center text-sm font-medium">{quantity}</span>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setQuantity(quantity + 1);
                  }}
                  className="p-1 hover:bg-muted rounded transition-colors"
                  disabled={quantity >= 10}
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            </div>
            <div className="flex gap-1.5">
              <Button
                size="sm"
                onClick={handleAddToCart}
                disabled={!product.in_stock || isAddingToCart}
                className="flex-1 h-8 text-xs"
              >
                {isAddingToCart ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Add {quantity > 1 && `(${quantity})`}
                  </>
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.preventDefault();
                  setShowQuickAdd(false);
                  setQuantity(1);
                }}
                className="h-8 w-8 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex gap-1.5">
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.preventDefault();
                if (product.in_stock) {
                  setShowQuickAdd(true);
                }
              }}
              disabled={!product.in_stock}
              className="flex-1 h-8 text-xs"
            >
              <ShoppingCart className="h-3 w-3 mr-1" />
              {product.in_stock ? 'Add to Cart' : 'Out of Stock'}
            </Button>
            <Button
              size="sm"
              onClick={async (e) => {
                e.preventDefault();
                if (product.in_stock) {
                  await handleAddToCart(e);
                  // Navigate to checkout
                  window.location.href = '/checkout';
                }
              }}
              disabled={!product.in_stock || isAddingToCart}
              className="flex-1 h-8 text-xs"
            >
              <Zap className="h-3 w-3 mr-1" />
              Buy Now
            </Button>
          </div>
        )}

        {/* Stock & Delivery Info */}
        <div className="mt-2 space-y-1">
          {product.in_stock && (
            <div className="flex items-center text-[10px] text-green-600">
              <CheckCircle className="h-3 w-3 mr-1" />
              In Stock
            </div>
          )}
          <div className="flex items-center text-[10px] text-muted-foreground">
            <Clock className="h-3 w-3 mr-1" />
            Delivery in 2-3 days
          </div>
        </div>
      </div>
    </div>
  );
}

// Swipeable Product Card for horizontal scrolling
export function SwipeableProductCard({ product }: { product: Product }) {
  return (
    <div className="w-32 xs:w-36 sm:w-40 flex-shrink-0 snap-start">
      <MobileProductCard product={product} variant="minimal" />
    </div>
  );
}

// Product Card Skeleton for loading states
export function MobileProductCardSkeleton({ variant = 'grid' }: { variant?: 'grid' | 'list' | 'minimal' }) {
  if (variant === 'list') {
    return (
      <div className="flex bg-card rounded-lg border border-border overflow-hidden">
        <div className="w-24 xs:w-28 sm:w-32 aspect-[3/4] bg-muted animate-pulse" />
        <div className="flex-1 p-3 space-y-2">
          <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
          <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
          <div className="h-3 bg-muted animate-pulse rounded w-1/4" />
          <div className="h-5 bg-muted animate-pulse rounded w-1/3" />
          <div className="flex gap-2">
            <div className="h-8 bg-muted animate-pulse rounded flex-1" />
            <div className="h-8 w-8 bg-muted animate-pulse rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'minimal') {
    return (
      <div>
        <div className="aspect-[3/4] bg-muted animate-pulse rounded-lg mb-2" />
        <div className="space-y-1">
          <div className="h-3 bg-muted animate-pulse rounded w-3/4" />
          <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <div className="aspect-[3/4] bg-muted animate-pulse" />
      <div className="p-3 space-y-2">
        <div className="h-3 bg-muted animate-pulse rounded w-1/4" />
        <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
        <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
        <div className="h-3 bg-muted animate-pulse rounded w-1/3" />
        <div className="h-5 bg-muted animate-pulse rounded w-1/3" />
        <div className="flex gap-1.5">
          <div className="h-8 bg-muted animate-pulse rounded flex-1" />
          <div className="h-8 bg-muted animate-pulse rounded flex-1" />
        </div>
      </div>
    </div>
  );
}