'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { LucideIcon, TrendingUp, Sparkles, ArrowRight } from 'lucide-react';
import { useState } from 'react';

interface ImageCategoryCardProps {
  category: {
    id: number;
    name: string;
    slug?: string;
    description?: string;
    product_count?: number;
    products_count?: number;
    featured?: boolean;
    image?: string;
    image_url?: string;
  };
  icon: LucideIcon;
  colorClass: string;
  variant?: 'image-hero' | 'image-overlay' | 'image-side';
  showProductCount?: boolean;
  className?: string;
}

export function ImageCategoryCard({
  category,
  icon: Icon,
  colorClass,
  variant = 'image-hero',
  showProductCount = true,
  className
}: ImageCategoryCardProps) {
  const [imageError, setImageError] = useState(false);
  const href = `/categories/${category.slug || category.id}`;
  const categoryImage = category.image_url || category.image;
  const productCount = category.products_count ?? category.product_count;

  const handleImageError = () => {
    setImageError(true);
  };

  // Image Hero Variant - Enhanced Circular image with name at bottom
  if (variant === 'image-hero') {
    return (
      <Link href={href} className="group">
        <Card className={cn(
          "h-full overflow-hidden border-0 transition-all duration-300",
          "hover:shadow-lg hover:-translate-y-1 bg-transparent",
          "min-h-[100px] md:min-h-[120px]",
          className
        )}>
          <div className="flex flex-col items-center h-full justify-center p-2 md:p-3">
            {/* Enhanced Circular Image */}
            <div className="relative w-14 h-14 md:w-16 md:h-20 lg:w-24 lg:h-24 aspect-square overflow-hidden bg-gradient-to-br from-primary/5 to-secondary/5 rounded-full border-2 border-background shadow-md group-hover:shadow-lg transition-all">
              {categoryImage && !imageError ? (
                <>
                  <Image
                    src={categoryImage}
                    alt={category.name}
                    fill
                    className="object-cover transition-all duration-500 group-hover:scale-110"
                    sizes="(max-width: 640px) 56px, (max-width: 1024px) 64px, 96px"
                    onError={handleImageError}
                  />
                </>
              ) : (
                <div className={cn(
                  "absolute inset-0 flex items-center justify-center",
                  "bg-gradient-to-br",
                  colorClass.replace('text-', 'from-').replace('600', '500'),
                  "to-primary/30"
                )}>
                  <Icon className="w-7 h-7 md:w-8 md:h-10 lg:w-10 lg:h-10 text-white/90" />
                </div>
              )}

              {/* Featured Badge */}
              {category.featured && (
                <div className="absolute top-0.5 right-0.5 z-10">
                  <Badge className="bg-yellow-400 text-yellow-900 border-0 text-[8px] md:text-[10px] font-semibold shadow-lg px-1 py-0.5">
                    <Sparkles className="w-2 h-2" />
                  </Badge>
                </div>
              )}

              {/* Trending Badge */}
              {productCount && productCount > 100 && (
                <div className="absolute top-0.5 left-0.5 z-10">
                  <Badge className="bg-white/90 text-primary border-0 text-[8px] md:text-[10px] font-semibold backdrop-blur-sm px-1 py-0.5">
                    <TrendingUp className="w-2 h-2" />
                  </Badge>
                </div>
              )}
            </div>

            {/* Enhanced Category Name */}
            <div className="mt-2 md:mt-2.5 text-center">
              <h3 className="font-semibold text-xs md:text-sm text-center line-clamp-2 group-hover:text-primary transition-colors px-1 leading-tight text-gray-800">
                {category.name}
              </h3>
            </div>
          </div>
        </Card>
      </Link>
    );
  }

  // Image Overlay Variant - Circular image with name at bottom
  if (variant === 'image-overlay') {
    return (
      <Link href={href} className="group">
        <Card className={cn(
          "h-full overflow-hidden border-0 transition-all duration-300",
          "hover:shadow-lg hover:-translate-y-1 bg-transparent",
          className
        )}>
          <div className="flex flex-col items-center">
            {/* Circular Image */}
            <div className="relative w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 aspect-square overflow-hidden rounded-full border-2 border-background shadow-md group-hover:shadow-lg transition-all bg-gradient-to-br from-primary/5 to-secondary/5">
              {categoryImage && !imageError ? (
                <Image
                  src={categoryImage}
                  alt={category.name}
                  fill
                  className="object-cover transition-all duration-500 group-hover:scale-110"
                  sizes="(max-width: 640px) 64px, (max-width: 1024px) 80px, 96px"
                  onError={handleImageError}
                />
              ) : (
                <div className={cn(
                  "absolute inset-0 flex items-center justify-center",
                  "bg-gradient-to-br",
                  colorClass.replace('text-', 'from-').replace('600', '500'),
                  "to-primary/30"
                )}>
                  <Icon className="w-8 h-8 md:w-10 md:h-10 text-white/90" />
                </div>
              )}

              {/* Featured Badge */}
              {category.featured && (
                <div className="absolute top-1 right-1 z-10">
                  <Badge className="bg-yellow-400 text-yellow-900 border-0 text-[8px] font-semibold shadow-lg p-0.5">
                    <Sparkles className="w-2 h-2" />
                  </Badge>
                </div>
              )}

              {/* Trending Badge */}
              {productCount && productCount > 100 && (
                <div className="absolute top-1 left-1 z-10">
                  <Badge className="bg-white/90 text-primary border-0 text-[8px] font-semibold backdrop-blur-sm p-0.5">
                    <TrendingUp className="w-2 h-2" />
                  </Badge>
                </div>
              )}
            </div>

            {/* Category Name Only */}
            <div className="mt-2 md:mt-2.5 text-center">
              <h3 className="font-semibold text-xs md:text-sm text-center line-clamp-1 group-hover:text-primary transition-colors px-1">
                {category.name}
              </h3>
            </div>
          </div>
        </Card>
      </Link>
    );
  }

  // Image Side Variant - Circular image with name at bottom
  if (variant === 'image-side') {
    return (
      <Link href={href} className="group">
        <Card className={cn(
          "h-full overflow-hidden border-0 transition-all duration-300",
          "hover:shadow-lg hover:-translate-y-1 bg-transparent",
          className
        )}>
          <div className="flex flex-col items-center">
            {/* Circular Image */}
            <div className="relative w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 aspect-square overflow-hidden rounded-full border-2 border-background shadow-md group-hover:shadow-lg transition-all bg-gradient-to-br from-primary/5 to-secondary/5">
              {categoryImage && !imageError ? (
                <Image
                  src={categoryImage}
                  alt={category.name}
                  fill
                  className="object-cover transition-all duration-500 group-hover:scale-110"
                  sizes="(max-width: 640px) 64px, (max-width: 1024px) 80px, 96px"
                  onError={handleImageError}
                />
              ) : (
                <div className={cn(
                  "absolute inset-0 flex items-center justify-center",
                  "bg-gradient-to-br",
                  colorClass.replace('text-', 'from-').replace('600', '500'),
                  "to-primary/30"
                )}>
                  <Icon className="w-8 h-8 md:w-10 md:h-10 text-white/90" />
                </div>
              )}

              {/* Featured Badge */}
              {category.featured && (
                <div className="absolute top-1 right-1 z-10">
                  <Badge className="bg-yellow-400 text-yellow-900 border-0 text-[8px] font-semibold shadow-lg p-0.5">
                    <Sparkles className="w-2 h-2" />
                  </Badge>
                </div>
              )}

              {/* Trending Badge */}
              {productCount && productCount > 100 && (
                <div className="absolute top-1 left-1 z-10">
                  <Badge className="bg-white/90 text-primary border-0 text-[8px] font-semibold backdrop-blur-sm p-0.5">
                    <TrendingUp className="w-2 h-2" />
                  </Badge>
                </div>
              )}
            </div>

            {/* Category Name Only */}
            <div className="mt-2 md:mt-2.5 text-center">
              <h3 className="font-semibold text-xs md:text-sm text-center line-clamp-1 group-hover:text-primary transition-colors px-1">
                {category.name}
              </h3>
            </div>
          </div>
        </Card>
      </Link>
    );
  }

  return null;
}

