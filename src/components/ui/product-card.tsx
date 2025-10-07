'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { cn } from '@/lib/utils';
import { 
  BookOpen, 
  Star, 
  ShoppingCart, 
  Heart,
  Eye,
  Loader2,
  Plus,
  Zap
} from 'lucide-react';
import { Product } from '@/types';
import { useCartStore } from '@/stores/cart';
import { useWishlistStore } from '@/stores/wishlist';
import { useConfig } from '@/contexts/ConfigContext';

interface ProductCardProps {
  product: Product;
  variant?: 'default' | 'compact' | 'large' | 'minimal';
  showCategory?: boolean;
  showAuthor?: boolean;
  showRating?: boolean;
  showDiscount?: boolean;
  showWishlist?: boolean;
  showQuickView?: boolean;
  showAddToCart?: boolean;
  showBuyNow?: boolean;
  className?: string;
}

export function ProductCard({ 
  product,
  variant = 'default',
  showCategory = true,
  showAuthor = true,
  showRating = true,
  showDiscount = true,
  showWishlist = true,
  showQuickView = false,
  showAddToCart = true,
  showBuyNow = true,
  className
}: ProductCardProps) {
  const { siteConfig } = useConfig();
  const { addToCart: addToCartStore } = useCartStore();
  const { 
    addToWishlist, 
    removeFromWishlist, 
    isInWishlist,
    isLoading: wishlistLoading 
  } = useWishlistStore();
  
  const [addingToCart, setAddingToCart] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);
  const [imageError, setImageError] = useState(false);

  const currencySymbol = siteConfig?.payment?.currency_symbol || '₹';
  const isWishlisted = isInWishlist(product.id);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!product.in_stock) return;
    
    try {
      setAddingToCart(true);
      await addToCartStore(product, 1);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      if (isWishlisted) {
        await removeFromWishlist(product.id);
      } else {
        await addToWishlist(product);
      }
    } catch (error) {
      console.error('Failed to update wishlist:', error);
    }
  };

  const handleBuyNow = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!product.in_stock) return;
    
    try {
      setBuyingNow(true);
      await addToCartStore(product, 1);
      // Navigate to checkout - you can customize this URL
      window.location.href = '/checkout';
    } catch (error) {
      console.error('Failed to buy now:', error);
    } finally {
      setBuyingNow(false);
    }
  };

  const getDiscountPercentage = () => {
    if (!product.compare_price || product.compare_price <= product.price) return 0;
    return Math.round((1 - product.price / product.compare_price) * 100);
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'compact':
        return {
          card: 'h-auto',
          content: 'compact-padding',
          image: 'aspect-[4/5] mb-2',
          imageSize: 'h-8 w-8',
          title: 'compact-text font-medium line-clamp-2',
          author: 'text-xs',
          price: 'compact-text',
          comparePrice: 'text-xs',
          rating: 'h-3 w-3',
          button: 'h-7 w-7',
          actionButton: 'h-7 px-2 text-xs'
        };
      case 'large':
        return {
          card: 'h-auto',
          content: 'p-5',
          image: 'aspect-[3/4] mb-4',
          imageSize: 'h-14 w-14',
          title: 'compact-title font-semibold line-clamp-2',
          author: 'compact-text',
          price: 'text-lg',
          comparePrice: 'compact-text',
          rating: 'h-4 w-4',
          button: 'h-10 w-10',
          actionButton: 'h-9 px-3 compact-text'
        };
      case 'minimal':
        return {
          card: 'h-auto border-0 shadow-none',
          content: 'p-0',
          image: 'aspect-[3/4] mb-2',
          imageSize: 'h-10 w-10',
          title: 'compact-text font-medium line-clamp-2',
          author: 'text-xs',
          price: 'compact-text',
          comparePrice: 'text-xs',
          rating: 'h-3 w-3',
          button: 'h-6 w-6',
          actionButton: 'h-6 px-1.5 text-xs'
        };
      default:
        return {
          card: 'h-auto',
          content: 'compact-padding',
          image: 'aspect-[3/4] mb-3',
          imageSize: 'h-10 w-10',
          title: 'compact-heading line-clamp-2',
          author: 'compact-text',
          price: 'compact-heading',
          comparePrice: 'compact-text',
          rating: 'h-3 w-3',
          button: 'h-8 w-8',
          actionButton: 'h-8 px-2.5 compact-text'
        };
    }
  };

  const styles = getVariantStyles();
  const discountPercentage = getDiscountPercentage();

  return (
    <Card className={cn(
      'group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border border-gray-200/60 hover:border-primary/20 bg-white/80 backdrop-blur-sm',
      styles.card,
      className
    )}>
      <CardContent className={styles.content}>
        {/* Product Image */}
        <div className={cn('relative bg-gray-50 rounded-lg overflow-hidden', styles.image)}>
          <Link href={`/products/${product.slug || product.id}`}>
            <div className="relative w-full h-full">
              {product.images && product.images.length > 0 && (product.images[0].image_url || product.images[0].url) && !imageError ? (
                <OptimizedImage
                  src={product.images[0].image_url || product.images[0].url || ''}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                  onError={() => setImageError(true)}
                  priority={false}
                  eager={false}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <BookOpen className={cn('text-gray-400', styles.imageSize)} />
                </div>
              )}
            </div>
          </Link>

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {showDiscount && discountPercentage > 0 && (
              <Badge variant="destructive" className="text-xs font-medium">
                -{discountPercentage}%
              </Badge>
            )}
            {product.is_featured && (
              <Badge className="text-xs font-medium">
                Featured
              </Badge>
            )}
          </div>

          {/* Action Buttons */}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col gap-2">
            {showWishlist && (
              <Button
                size="sm"
                variant="secondary"
                className={cn(
                  'rounded-full shadow-lg bg-white/90 hover:bg-white border-0 backdrop-blur-sm hover:scale-110 transition-all duration-200',
                  styles.button
                )}
                onClick={handleWishlistToggle}
                disabled={wishlistLoading}
              >
                {wishlistLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Heart className={cn(
                    'h-4 w-4 transition-colors duration-200',
                    isWishlisted ? 'fill-current text-red-500' : 'text-gray-600 hover:text-red-500'
                  )} />
                )}
              </Button>
            )}
            {showQuickView && (
              <Button
                size="sm"
                variant="secondary"
                className={cn(
                  'rounded-full shadow-lg bg-white/90 hover:bg-white border-0 backdrop-blur-sm hover:scale-110 transition-all duration-200',
                  styles.button
                )}
              >
                <Eye className="h-4 w-4 text-gray-600 hover:text-blue-600 transition-colors duration-200" />
              </Button>
            )}
          </div>

          {/* Out of Stock Overlay */}
          {!product.in_stock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
              <Badge variant="secondary" className="text-xs font-medium">
                Out of Stock
              </Badge>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="system-compact">
          {showCategory && product.category?.name && (
            <p className="text-xs text-primary font-medium uppercase tracking-wider">
              {product.category.name}
            </p>
          )}
          
          <h3 className={cn('group-hover:text-primary transition-colors', styles.title)}>
            <Link href={`/products/${product.slug || product.id}`}>
              {product.name}
            </Link>
          </h3>
          
          {showAuthor && product.brand && (
            <p className={cn('text-muted-foreground', styles.author)}>
              by {product.brand}
            </p>
          )}
          
          {showRating && (
            <div className="flex items-center gap-1">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={cn('text-yellow-400 fill-current', styles.rating)} />
                ))}
              </div>
              <span className="text-xs text-muted-foreground ml-1">(4.5)</span>
            </div>
          )}
          
          {/* Price */}
          <div className="flex items-center compact-gap">
            <span className={cn('font-bold text-foreground', styles.price)}>
              {currencySymbol}{product.price}
            </span>
            {product.compare_price && product.compare_price > product.price && (
              <span className={cn('text-muted-foreground line-through', styles.comparePrice)}>
                {currencySymbol}{product.compare_price}
              </span>
            )}
          </div>
          
          {/* Action Buttons */}
          {product.in_stock && (
            <div className="flex items-center compact-gap pt-1.5">
              {showAddToCart && (
                <Button
                  size="sm"
                  variant="outline"
                  className={cn(
                    'flex-1 rounded-md border-2 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200',
                    styles.actionButton
                  )}
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                >
                  {addingToCart ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <>
                      <ShoppingCart className="h-3 w-3 mr-1" />
                      Cart
                    </>
                  )}
                </Button>
              )}
              
              {showBuyNow && (
                <Button
                  size="sm"
                  className={cn(
                    'flex-1 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md transition-all duration-200',
                    styles.actionButton
                  )}
                  onClick={handleBuyNow}
                  disabled={buyingNow}
                >
                  {buyingNow ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <>
                      <Zap className="h-3 w-3 mr-1" />
                      Buy
                    </>
                  )}
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default ProductCard;