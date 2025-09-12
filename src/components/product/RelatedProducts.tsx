'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CompactProductCard } from './CompactProductCard';
import { productApi } from '@/lib/api';

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

interface RelatedProductsProps {
  productId: string;
  categoryId?: string;
}

export default function RelatedProducts({ productId, categoryId }: RelatedProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetchRelatedProducts();
  }, [productId]);

  const fetchRelatedProducts = async () => {
    try {
      const response = await productApi.getRelatedProducts(productId);
      if (response.success) {
        setProducts(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching related products:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollLeft = () => {
    setCurrentIndex(prev => Math.max(0, prev - getScrollStep()));
  };

  const scrollRight = () => {
    const scrollStep = getScrollStep();
    const maxIndex = Math.max(0, products.length - getVisibleCount());
    setCurrentIndex(prev => Math.min(maxIndex, prev + scrollStep));
  };

  const getVisibleCount = () => {
    if (typeof window === 'undefined') return 4;
    if (window.innerWidth < 640) return 2; // Show 2 on mobile
    if (window.innerWidth < 768) return 3;
    if (window.innerWidth < 1024) return 4;
    if (window.innerWidth < 1280) return 5;
    return 6;
  };

  const getScrollStep = () => {
    if (typeof window === 'undefined') return 2;
    if (window.innerWidth < 640) return 2; // Scroll 2 at a time on mobile
    return 3;
  };

  useEffect(() => {
    const handleResize = () => {
      // Reset index if it's out of bounds after resize
      const maxIndex = Math.max(0, products.length - getVisibleCount());
      if (currentIndex > maxIndex) {
        setCurrentIndex(maxIndex);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [currentIndex, products.length]);

  if (loading) {
    return (
      <div className="my-6 lg:my-8">
        <h2 className="text-lg lg:text-xl font-semibold mb-4 lg:mb-6">You May Also Like</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 lg:gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-lg aspect-[3/5] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  const visibleCount = getVisibleCount();
  const canScrollLeft = currentIndex > 0;
  const canScrollRight = currentIndex < products.length - visibleCount;

  return (
    <div className="my-6 lg:my-8">
      <div className="flex justify-between items-center mb-4 lg:mb-6">
        <h2 className="text-lg lg:text-xl font-semibold">You May Also Like</h2>
        {products.length > visibleCount && (
          <div className="flex gap-2">
            <button
              onClick={scrollLeft}
              disabled={!canScrollLeft}
              className="p-1.5 lg:p-2 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous products"
            >
              <ChevronLeft className="w-4 h-4 lg:w-5 lg:h-5" />
            </button>
            <button
              onClick={scrollRight}
              disabled={!canScrollRight}
              className="p-1.5 lg:p-2 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Next products"
            >
              <ChevronRight className="w-4 h-4 lg:w-5 lg:h-5" />
            </button>
          </div>
        )}
      </div>

      <div className="relative overflow-hidden">
        <div 
          className="flex transition-transform duration-300 ease-in-out gap-3 lg:gap-4"
          style={{
            transform: `translateX(-${currentIndex * (100 / visibleCount)}%)`
          }}
        >
          {products.map(product => (
            <div
              key={product.id}
              className="flex-shrink-0"
              style={{
                width: `calc(${100 / visibleCount}% - ${visibleCount > 2 ? '0.75rem' : '0.375rem'})`,
              }}
            >
              <CompactProductCard product={product} />
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Dots Indicator */}
      {products.length > visibleCount && (
        <div className="flex justify-center gap-1.5 mt-4 sm:hidden">
          {Array.from({ length: Math.ceil(products.length / 2) }).map((_, index) => {
            const dotIndex = index * 2;
            return (
              <button
                key={index}
                onClick={() => setCurrentIndex(dotIndex)}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  Math.floor(currentIndex / 2) === index ? 'bg-primary' : 'bg-gray-300'
                }`}
                aria-label={`Go to products ${dotIndex + 1}-${dotIndex + 2}`}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}