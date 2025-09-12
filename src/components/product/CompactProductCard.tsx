'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/stores/cart';
import { useWishlistStore } from '@/stores/wishlist';
import { useConfig } from '@/contexts/ConfigContext';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  compare_price?: number;
  images?: Array<{ image_path: string; image_url?: string; url?: string; is_primary?: boolean }>;
  category?: { name: string };
  rating?: number;
  total_reviews?: number;
  author?: string;
  brand?: string;
  in_stock?: boolean;
}

interface CompactProductCardProps {
  product: Product;
}

export function CompactProductCard({ product }: CompactProductCardProps) {
  const { addToCart } = useCartStore();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore();
  const { siteConfig } = useConfig();
  const currencySymbol = siteConfig?.payment?.currency_symbol || '₹';
  const isWishlisted = isInWishlist(product.id);

  const getProductImage = () => {
    if (!product.images || product.images.length === 0) return '/book-placeholder.svg';
    
    const image = product.images[0];
    if (image.url) return image.url;
    if (image.image_url) return image.image_url;
    if (image.image_path) {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:8000';
      return image.image_path.startsWith('http') 
        ? image.image_path 
        : `${baseUrl}/storage/${image.image_path}`;
    }
    
    return '/book-placeholder.svg';
  };

  const getDiscountPercentage = () => {
    if (!product.compare_price || product.compare_price <= product.price) return 0;
    return Math.round((1 - product.price / product.compare_price) * 100);
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      await addToCart(product, 1);
      toast.success('Added to cart!');
    } catch (error) {
      toast.error('Failed to add to cart');
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

  return (
    <Link href={`/products/${product.slug || product.id}`}>
      <div className="group bg-white rounded-lg border border-gray-200 hover:border-primary/30 hover:shadow-md transition-all duration-200 h-full flex flex-col">
        {/* Image Section */}
        <div className="relative aspect-[3/4] bg-gray-50 rounded-t-lg overflow-hidden">
          <Image
            src={getProductImage()}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
          />
          
          {/* Discount Badge */}
          {getDiscountPercentage() > 0 && (
            <div className="absolute top-2 left-2 z-10">
              <Badge className="bg-red-500 text-white text-[10px] px-1.5 py-0.5">
                -{getDiscountPercentage()}%
              </Badge>
            </div>
          )}
          
          {/* Wishlist Button */}
          <button
            onClick={handleWishlistToggle}
            className="absolute top-2 right-2 z-10 p-1.5 bg-white/90 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Heart className={`h-3.5 w-3.5 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
          </button>
        </div>

        {/* Content Section */}
        <div className="flex-1 p-3 flex flex-col">
          {/* Category */}
          {product.category && (
            <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">
              {product.category.name}
            </p>
          )}

          {/* Title */}
          <h3 className="text-xs font-medium text-gray-900 line-clamp-2 mb-1 group-hover:text-primary transition-colors">
            {product.name}
          </h3>

          {/* Author/Brand */}
          {(product.author || product.brand) && (
            <p className="text-[10px] text-gray-600 mb-2 line-clamp-1">
              {product.author || product.brand}
            </p>
          )}

          {/* Rating */}
          {product.rating && (
            <div className="flex items-center gap-1 mb-2">
              <div className="flex items-center">
                <Star className="h-3 w-3 text-yellow-400 fill-current" />
                <span className="text-[10px] font-medium text-gray-700 ml-0.5">
                  {product.rating}
                </span>
              </div>
              {product.total_reviews && (
                <span className="text-[10px] text-gray-500">
                  ({product.total_reviews})
                </span>
              )}
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-1.5 mb-2 mt-auto">
            <span className="text-sm font-bold text-gray-900">
              {currencySymbol}{parseFloat(String(product.price)).toFixed(0)}
            </span>
            {product.compare_price && parseFloat(String(product.compare_price)) > parseFloat(String(product.price)) && (
              <span className="text-[10px] text-gray-400 line-through">
                {currencySymbol}{parseFloat(String(product.compare_price)).toFixed(0)}
              </span>
            )}
          </div>

          {/* Add to Cart Button */}
          <Button
            onClick={handleAddToCart}
            disabled={!product.in_stock}
            size="sm"
            className="w-full h-7 text-[10px] font-medium"
          >
            <ShoppingCart className="h-3 w-3 mr-1" />
            {product.in_stock ? 'Add to Cart' : 'Out of Stock'}
          </Button>
        </div>
      </div>
    </Link>
  );
}