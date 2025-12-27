'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ProductCard from '@/components/ui/product-card';
import { productApi } from '@/lib/api';
import { Category, Product } from '@/types';
import { useConfig } from '@/contexts/ConfigContext';
import { getProductCardProps, getProductGridClasses } from '@/lib/product-card-config';
import {
  ChevronRight,
  Loader2,
  ArrowRight
} from 'lucide-react';
import { useInView } from 'react-intersection-observer';

interface CategoryProductSectionProps {
  category: Category;
  productsPerCategory: number;
  showSeeAll: boolean;
  showRating: boolean;
  showDiscount: boolean;
  lazyLoad: boolean;
  onContentLoaded?: () => void;
}

export default function CategoryProductSection({
  category,
  productsPerCategory,
  showSeeAll,
  showRating,
  showDiscount,
  lazyLoad,
  onContentLoaded
}: CategoryProductSectionProps) {
  const [products, setProducts] = useState<Product[]>(category.products || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const { siteConfig } = useConfig();

  // Determine if category has products and the count
  const hasProducts = category.products ? category.products.length > 0 : (category.products_count ? category.products_count > 0 : false);
  const productsCount = category.products ? category.products.length : (category.products_count || 0);

  
  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Intersection Observer for lazy loading
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
    skip: !lazyLoad || products.length > 0 || !hasProducts
  });

  useEffect(() => {
    // Don't load if category has no products
    if (!hasProducts) {
      return;
    }

    if (lazyLoad && inView && products.length === 0) {
      loadCategoryProducts();
    }
  }, [inView, lazyLoad, hasProducts]);

  useEffect(() => {
    // Don't load if category has no products
    if (!hasProducts) {
      return;
    }

    if (!lazyLoad && products.length === 0) {
      loadCategoryProducts();
    }
  }, [hasProducts]);

  const loadCategoryProducts = async () => {
    try {
      setLoading(true);
      setError(null);

     

      const response = await productApi.getProductsByCategory(category.id, {
        per_page: productsPerCategory,
        sort_by: 'created_at',
        sort_order: 'desc'
      });
      
      if (response.success) {
        const loadedProducts = response.data.products.data || [];
                setProducts(loadedProducts);
      } else {
        console.error(`Failed to load ${category.name} products`);
        setError('Failed to load products');
      }
    } catch (err: any) {
      console.error(`Failed to load category products for ${category.name}:`, err);
      setError('Failed to load products');
    } finally {
      setLoading(false);
      // Call onContentLoaded callback if provided
      if (onContentLoaded) {
        onContentLoaded();
      }
    }
  };


  // Early return if category has no products (after hooks are called)
  if (!hasProducts) {
    return null;
  }

  if (lazyLoad && !inView) {
    return <div ref={ref} className="h-96" />; // Placeholder for lazy loading
  }

  // Don't show individual loading states - let parent handle it
  if (loading && !lazyLoad) {
    return null; // Let parent show loading
  }

  if (error) {
    return (
      <section ref={ref} className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <p className="text-muted-foreground">{error}</p>
            <Button 
              variant="outline" 
              onClick={loadCategoryProducts}
              className="mt-4"
            >
              Try Again
            </Button>
          </div>
        </div>
      </section>
    );
  }

  // If no products after loading, don't render anything
  if (products.length === 0) {
        return null;
  }

  
  return (
    <section ref={ref} className="py-8 sm:py-12 md:py-16 bg-muted/30">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex items-center justify-between mb-6 sm:mb-8 md:mb-12 gap-2">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground truncate">{category.name}</h2>
            {category.description && (
              <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base line-clamp-1 sm:line-clamp-2">{category.description}</p>
            )}
          </div>
          {showSeeAll && (
            <Button variant="outline" size="sm" className="hidden sm:flex min-h-[40px]" asChild>
              <Link href={`/categories/${category.slug || category.id}`}>
                View All <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>

        <div className={getProductGridClasses('categorySection')}>
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              {...getProductCardProps('categorySection', isMobile)}
            />
          ))}
        </div>

        {/* View All Button for mobile */}
        {showSeeAll && products.length > 0 && (
          <div className="text-center mt-6 sm:hidden">
            <Button asChild className="min-h-[44px] touch-target w-full max-w-xs">
              <Link href={`/categories/${category.slug || category.id}`}>
                View All {category.name} Books
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}