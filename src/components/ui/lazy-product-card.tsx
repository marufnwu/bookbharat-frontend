'use client';

import { useState, useRef, useEffect } from 'react';
import { ProductCard } from './product-card';
import { Product, ProductCardProps } from '@/types';

interface LazyProductCardProps extends Omit<ProductCardProps, 'product'> {
  product: Product;
  threshold?: number; // How much of the element must be visible before loading
  rootMargin?: string; // Margin around the root element
}

export function LazyProductCard({
  product,
  threshold = 0.1,
  rootMargin = '50px',
  ...cardProps
}: LazyProductCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || hasLoaded) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsVisible(true);
          setHasLoaded(true);
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin,
        // Improve performance by only observing once
        trackVisibility: false,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, hasLoaded]);

  // Placeholder skeleton with same dimensions as product card
  if (!isVisible) {
    return (
      <div
        ref={elementRef}
        className="bg-white rounded-lg border border-gray-200 overflow-hidden animate-pulse"
        style={{ minHeight: '320px' }}
      >
        <div className="aspect-[3/4] bg-gray-200"></div>
        <div className="p-4 space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          <div className="flex items-center justify-between">
            <div className="h-5 bg-gray-200 rounded w-1/4"></div>
            <div className="h-8 bg-gray-200 rounded w-20"></div>
          </div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return <ProductCard product={product} {...cardProps} />;
}

export default LazyProductCard;