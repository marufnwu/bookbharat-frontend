'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { LucideIcon, TrendingUp, Sparkles, ArrowRight } from 'lucide-react';

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
  const href = `/categories/${category.slug || category.id}`;
  const categoryImage = category.image_url || category.image;
  const productCount = category.products_count ?? category.product_count;

  // Image Hero Variant - Large image on top
  if (variant === 'image-hero') {
    return (
      <Link href={href} className="group">
        <Card className={cn(
          "h-full overflow-hidden border-0 transition-all duration-300",
          "hover:shadow-2xl hover:-translate-y-2",
          className
        )}>
          {/* Image Section - Large */}
          <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-primary/5 to-secondary/5">
            {categoryImage ? (
              <>
                <Image
                  src={categoryImage}
                  alt={category.name}
                  fill
                  className="object-cover transition-all duration-500 group-hover:scale-110"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />
              </>
            ) : (
              <div className={cn(
                "absolute inset-0 flex items-center justify-center",
                "bg-gradient-to-br",
                colorClass.replace('text-', 'from-').replace('600', '500'),
                "to-primary/30"
              )}>
                <Icon className="w-16 h-16 md:w-20 md:h-20 text-white/90" />
              </div>
            )}

            {/* Featured Badge */}
            {category.featured && (
              <div className="absolute top-3 right-3 z-10">
                <Badge className="bg-yellow-400 text-yellow-900 border-0 font-semibold shadow-lg">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Featured
                </Badge>
              </div>
            )}

            {/* Trending Badge */}
            {productCount && productCount > 100 && (
              <div className="absolute top-3 left-3 z-10">
                <Badge className="bg-white/90 text-primary border-0 font-semibold backdrop-blur-sm">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Popular
                </Badge>
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="p-4 bg-background">
            <h3 className="font-bold text-base md:text-lg mb-2 line-clamp-1 group-hover:text-primary transition-colors">
              {category.name}
            </h3>
            
            {showProductCount && productCount !== undefined && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {productCount} Books
                </span>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
            )}
          </div>
        </Card>
      </Link>
    );
  }

  // Image Overlay Variant - Text overlaid on image
  if (variant === 'image-overlay') {
    return (
      <Link href={href} className="group">
        <Card className={cn(
          "h-full overflow-hidden border-0 transition-all duration-300",
          "hover:shadow-2xl hover:-translate-y-2",
          "relative aspect-square",
          className
        )}>
          {/* Full Image Background */}
          {categoryImage ? (
            <Image
              src={categoryImage}
              alt={category.name}
              fill
              className="object-cover transition-all duration-500 group-hover:scale-110"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className={cn(
              "absolute inset-0",
              "bg-gradient-to-br",
              colorClass.replace('text-', 'from-').replace('600', '500'),
              "to-primary/30"
            )}>
              <div className="absolute inset-0 flex items-center justify-center">
                <Icon className="w-20 h-20 md:w-24 md:h-24 text-white/80" />
              </div>
            </div>
          )}

          {/* Dark Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20 group-hover:from-black/80 transition-all" />

          {/* Content Overlay */}
          <div className="absolute inset-0 p-5 flex flex-col justify-end text-white">
            {category.featured && (
              <Badge className="self-start mb-3 bg-yellow-400 text-yellow-900 border-0 font-semibold">
                <Sparkles className="w-3 h-3 mr-1" />
                Featured
              </Badge>
            )}
            
            <h3 className="font-bold text-lg md:text-xl mb-2 line-clamp-2 drop-shadow-lg">
              {category.name}
            </h3>
            
            {showProductCount && productCount !== undefined && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/90 font-medium">
                  {productCount} Books Available
                </span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </div>
            )}
          </div>
        </Card>
      </Link>
    );
  }

  // Image Side Variant - Image on left, content on right
  if (variant === 'image-side') {
    return (
      <Link href={href} className="group">
        <Card className={cn(
          "h-full overflow-hidden border-0 transition-all duration-300",
          "hover:shadow-xl hover:-translate-y-1",
          "bg-gradient-to-br from-background to-muted/10",
          className
        )}>
          <div className="flex items-center h-full">
            {/* Image Section */}
            <div className="relative w-32 h-32 flex-shrink-0 overflow-hidden">
              {categoryImage ? (
                <Image
                  src={categoryImage}
                  alt={category.name}
                  fill
                  className="object-cover transition-all duration-500 group-hover:scale-110"
                  sizes="128px"
                />
              ) : (
                <div className={cn(
                  "absolute inset-0 flex items-center justify-center",
                  "bg-gradient-to-br",
                  colorClass.replace('text-', 'from-').replace('600', '500'),
                  "to-primary/30"
                )}>
                  <Icon className="w-12 h-12 text-white/90" />
                </div>
              )}
            </div>

            {/* Content Section */}
            <div className="flex-1 p-4">
              {category.featured && (
                <Badge className="mb-2 bg-yellow-100 text-yellow-700 border-0">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Featured
                </Badge>
              )}
              
              <h3 className="font-bold text-base md:text-lg mb-1 line-clamp-1 group-hover:text-primary transition-colors">
                {category.name}
              </h3>
              
              {showProductCount && productCount !== undefined && (
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-muted-foreground">
                    {productCount} Books
                  </span>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
              )}
            </div>
          </div>
        </Card>
      </Link>
    );
  }

  return null;
}

