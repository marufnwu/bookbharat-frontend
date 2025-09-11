'use client';

import Link from 'next/link';
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
    featured?: boolean;
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
  
  if (variant === 'compact') {
    return (
      <Link href={href} className="group">
        <Card className={cn(
          "h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-0 overflow-hidden",
          className
        )}>
          <CardContent className="p-4">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className={cn(
                "w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110",
                colorClass.replace('text-', 'bg-').replace('600', '100'),
                colorClass
              )}>
                <Icon className="w-6 h-6 md:w-7 md:h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-sm md:text-base line-clamp-1 group-hover:text-primary transition-colors">
                  {category.name}
                </h3>
                {showProductCount && category.product_count !== undefined && (
                  <p className="text-xs text-muted-foreground">
                    {category.product_count} Books
                  </p>
                )}
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
              <div className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 group-hover:rotate-3",
                colorClass.replace('text-', 'bg-').replace('600', '100'),
                colorClass
              )}>
                <Icon className="w-8 h-8" />
              </div>
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
                  {showProductCount && category.product_count !== undefined && (
                    <div className="flex items-center space-x-1 text-sm">
                      <TrendingUp className="w-4 h-4 text-primary" />
                      <span className="font-medium">{category.product_count} Books</span>
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

  // Default variant
  return (
    <Link href={href} className="group">
      <Card className={cn(
        "h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-0 overflow-hidden",
        "bg-gradient-to-br from-background to-muted/10",
        className
      )}>
        <CardContent className="p-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className={cn(
                "w-14 h-14 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110",
                colorClass.replace('text-', 'bg-').replace('600', '100'),
                colorClass
              )}>
                <Icon className="w-7 h-7" />
              </div>
              {category.featured && (
                <Badge variant="secondary" className="bg-primary/10 text-primary border-0">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Trending
                </Badge>
              )}
            </div>
            
            <div className="space-y-2">
              <h3 className="font-semibold text-base md:text-lg group-hover:text-primary transition-colors">
                {category.name}
              </h3>
              
              {showDescription && category.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {category.description}
                </p>
              )}
              
              {showProductCount && category.product_count !== undefined && (
                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm text-muted-foreground">
                    {category.product_count} Books
                  </span>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}