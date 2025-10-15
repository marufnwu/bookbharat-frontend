'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { LucideIcon, ArrowRight, TrendingUp, Sparkles } from 'lucide-react';

interface CategoryCardProps {
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
  variant?: 'default' | 'compact' | 'featured';
  showDescription?: boolean;
  showProductCount?: boolean;
  className?: string;
}

export function CategoryCard({
  category,
  icon: Icon,
  colorClass,
  variant = 'default',
  showDescription = true,
  showProductCount = true,
  className
}: CategoryCardProps) {
  const href = `/categories/${category.slug || category.id}`;
  
  const categoryImage = category.image_url || category.image;
  const productCount = category.products_count ?? category.product_count;

  if (variant === 'compact') {
    return (
      <Link href={href} className="group">
        <Card className={cn(
          "h-full transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 border-0 overflow-hidden bg-transparent",
          className
        )}>
          <CardContent className="p-2">
            <div className="flex flex-col items-center text-center">
              {/* Circular Image */}
              <div className="relative w-12 h-12 md:w-14 md:h-14 aspect-square overflow-hidden transition-transform group-hover:scale-110 rounded-full border-2 border-background shadow-md">
                {categoryImage ? (
                  <Image
                    src={categoryImage}
                    alt={category.name}
                    width={56}
                    height={56}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className={cn(
                    "w-full h-full rounded-full flex items-center justify-center transition-transform group-hover:scale-110",
                    colorClass.replace('text-', 'bg-').replace('600', '100'),
                    colorClass
                  )}>
                    <Icon className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                )}
              </div>

              {/* Category Name Only */}
              <div className="mt-1.5">
                <h3 className="font-semibold text-xs md:text-sm text-center line-clamp-1 group-hover:text-primary transition-colors px-1">
                  {category.name}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  if (variant === 'featured') {
    return (
      <Link href={href} className="group">
        <Card className={cn(
          "h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-0 overflow-hidden relative",
          "bg-gradient-to-br from-background to-muted/20",
          className
        )}>
          {category.featured && (
            <div className="absolute top-2 right-2 z-10">
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 border-0">
                <Sparkles className="w-3 h-3 mr-1" />
                Featured
              </Badge>
            </div>
          )}
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              {categoryImage ? (
                <div className="w-16 h-16 rounded-2xl overflow-hidden transition-all group-hover:scale-110 group-hover:rotate-3 relative flex-shrink-0">
                  <Image
                    src={categoryImage}
                    alt={category.name}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className={cn(
                  "w-16 h-16 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 group-hover:rotate-3 flex-shrink-0",
                  colorClass.replace('text-', 'bg-').replace('600', '100'),
                  colorClass
                )}>
                  <Icon className="w-8 h-8" />
                </div>
              )}
              <div className="flex-1 space-y-2">
                <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
                  {category.name}
                </h3>
                {showDescription && category.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {category.description}
                  </p>
                )}
                <div className="flex items-center justify-between pt-2">
                  {showProductCount && productCount !== undefined && (
                    <div className="flex items-center space-x-1 text-sm">
                      <TrendingUp className="w-4 h-4 text-primary" />
                      <span className="font-medium">{productCount} Books</span>
                    </div>
                  )}
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  // Default variant - Circular with name at bottom
  return (
    <Link href={href} className="group">
      <Card className={cn(
        "h-full transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 border-0 overflow-hidden bg-transparent",
        className
      )}>
        <CardContent className="p-2">
          <div className="flex flex-col items-center text-center">
            {/* Circular Image */}
            <div className="relative w-12 h-12 md:w-14 md:h-14 aspect-square overflow-hidden transition-transform group-hover:scale-110 rounded-full border-2 border-background shadow-md">
              {categoryImage ? (
                <Image
                  src={categoryImage}
                  alt={category.name}
                  width={56}
                  height={56}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className={cn(
                  "w-full h-full rounded-full flex items-center justify-center transition-transform group-hover:scale-110",
                  colorClass.replace('text-', 'bg-').replace('600', '100'),
                  colorClass
                )}>
                  <Icon className="w-5 h-5 md:w-6 md:h-6" />
                </div>
              )}

              {/* Featured Badge */}
              {category.featured && (
                <div className="absolute top-0 right-0 z-10">
                  <Badge className="bg-yellow-400 text-yellow-900 border-0 text-[8px] font-semibold shadow-lg p-0.5">
                    <Sparkles className="w-2 h-2" />
                  </Badge>
                </div>
              )}
            </div>

            {/* Category Name Only */}
            <div className="mt-1.5">
              <h3 className="font-semibold text-xs md:text-sm text-center line-clamp-1 group-hover:text-primary transition-colors px-1">
                {category.name}
              </h3>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}