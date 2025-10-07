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
}

export default function CategoryProductSection({
  category,
  productsPerCategory,
  showSeeAll,
  showRating,
  showDiscount,
  lazyLoad
}: CategoryProductSectionProps) {
  const [products, setProducts] = useState<Product[]>(category.products || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const { siteConfig } = useConfig();

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
    skip: !lazyLoad || products.length > 0
  });

  useEffect(() => {
    if (lazyLoad && inView && products.length === 0) {
      loadCategoryProducts();
    }
  }, [inView, lazyLoad]);

  useEffect(() => {
    if (!lazyLoad && products.length === 0) {
      loadCategoryProducts();
    }
  }, []);

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
        setProducts(response.data.products.data || []);
      } else {
        setError('Failed to load products');
      }
    } catch (err: any) {
      console.error('Failed to load category products:', err);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };


  if (lazyLoad && !inView) {
    return <div ref={ref} className="h-96" />; // Placeholder for lazy loading
  }

  if (loading) {
    return (
      <section ref={ref} className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span>Loading {category.name} products...</span>
            </div>
          </div>
        </div>
      </section>
    );
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
        {showSeeAll && (
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