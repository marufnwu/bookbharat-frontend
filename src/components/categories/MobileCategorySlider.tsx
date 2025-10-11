'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { LucideIcon, TrendingUp, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

interface MobileCategorySliderProps {
  // Displays categories in a 2-row horizontal scrolling grid layout optimized for mobile
  categories: Array<{
    id: number;
    name: string;
    slug?: string;
    description?: string;
    product_count?: number;
    products_count?: number;
    featured?: boolean;
    image?: string;
    image_url?: string;
  }>;
  icon: LucideIcon;
  colorClass: string;
  className?: string;
}

export function MobileCategorySlider({
  categories,
  icon: Icon,
  colorClass,
  className
}: MobileCategorySliderProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Initialize scroll position and update when categories change
  useEffect(() => {
    const checkScrollPosition = () => {
      if (!scrollRef.current) return;

      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      const canScrollLeft = scrollLeft > 0;
      const canScrollRight = scrollLeft < scrollWidth - clientWidth - 10;

      // If we have many categories, always show right arrow initially
      const hasManyCategories = categories.length > 4;
      const finalCanScrollRight = canScrollRight || (hasManyCategories && scrollLeft === 0);

      setCanScrollLeft(canScrollLeft);
      setCanScrollRight(finalCanScrollRight);
    };

    // Check immediately and after a short delay to ensure DOM is ready
    checkScrollPosition();
    const timeoutId = setTimeout(checkScrollPosition, 100);

    return () => clearTimeout(timeoutId);
  }, [categories]);

  // Check scroll position (reusable function)
  const checkScrollPosition = () => {
    if (!scrollRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  // Scroll functions
  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;

    const scrollAmount = 210; // Scroll by 2 cards width + gaps (96px * 2 + 18px gaps)
    const newScrollLeft = scrollRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);

    // Ensure we don't scroll beyond bounds
    const maxScroll = scrollRef.current.scrollWidth - scrollRef.current.clientWidth;
    const clampedScrollLeft = Math.max(0, Math.min(newScrollLeft, maxScroll));

    scrollRef.current.scrollTo({
      left: clampedScrollLeft,
      behavior: 'smooth'
    });

    // Update scroll indicators after scroll animation completes
    setTimeout(() => {
      if (scrollRef.current) {
        checkScrollPosition();
      }
    }, 300);
  };

  // Handle scroll events
  const handleScroll = () => {
    checkScrollPosition();
  };

  return (
    <div className={cn("relative", className)}>
      {/* Edge Fade Effects for Scroll Indication */}
      {canScrollLeft && (
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white/60 to-transparent z-10 pointer-events-none" />
      )}
      {canScrollRight && (
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white/60 to-transparent z-10 pointer-events-none" />
      )}

      {/* Navigation Arrows - Sleek Modern Design */}
      {canScrollLeft && (
        <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-start z-20">
          <button
            onClick={() => scroll('left')}
            className="group bg-white/80 backdrop-blur-sm hover:bg-white/95 border border-white/30 hover:border-white/50 rounded-r-xl px-2 py-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 ring-1 ring-black/5 hover:ring-black/10"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4 text-gray-600 group-hover:text-gray-800 transition-colors duration-200" />
          </button>
        </div>
      )}

      {canScrollRight && (
        <div className="absolute right-0 top-0 bottom-0 w-12 flex items-center justify-end z-20">
          <button
            onClick={() => scroll('right')}
            className="group bg-white/80 backdrop-blur-sm hover:bg-white/95 border border-white/30 hover:border-white/50 rounded-l-xl px-2 py-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 ring-1 ring-black/5 hover:ring-black/10"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-800 transition-colors duration-200" />
          </button>
        </div>
      )}

      {/* Scrollable Container - 2 Row Grid Layout */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="grid grid-rows-2 gap-3 overflow-x-auto overflow-y-hidden scrollbar-hide scroll-smooth pb-2 px-12 min-w-0"
        style={{
          WebkitOverflowScrolling: 'touch', // Enable momentum scrolling on iOS
          // 2-row grid that flows horizontally
          gridTemplateRows: 'repeat(2, auto)',
          gridAutoFlow: 'column',
          // Ensure minimum width for scrolling calculation
          minWidth: '100%'
        }}
      >
        {categories.map((category, index) => {
          const href = `/categories/${category.slug || category.id}`;
          const categoryImage = category.image_url || category.image;
          const productCount = category.products_count ?? category.product_count;

          return (
            <Link
              key={category.id}
              href={href}
              className="flex-shrink-0 group"
            >
              <Card className="w-24 h-24 overflow-hidden border-0 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                {/* Image Container */}
                <div className="relative w-full h-full">
                  {categoryImage ? (
                    <>
                      <Image
                        src={categoryImage}
                        alt={category.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                        sizes="96px"
                      />
                      {/* Dark Overlay */}
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />

                      {/* Featured Badge */}
                      {category.featured && (
                        <div className="absolute top-1 right-1">
                          <Badge className="bg-yellow-400 text-yellow-900 border-0 text-xs px-1 py-0 h-4">
                            <Sparkles className="w-2.5 h-2.5 mr-0.5" />
                          </Badge>
                        </div>
                      )}

                      {/* Popular Badge */}
                      {productCount && productCount > 50 && (
                        <div className="absolute top-1 left-1">
                          <Badge className="bg-white/90 text-primary border-0 text-xs px-1 py-0 h-4 backdrop-blur-sm">
                            <TrendingUp className="w-2.5 h-2.5 mr-0.5" />
                          </Badge>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className={cn(
                      "w-full h-full flex items-center justify-center",
                      "bg-gradient-to-br",
                      colorClass.replace('text-', 'from-').replace('600', '400'),
                      "to-primary/30"
                    )}>
                      <Icon className="w-6 h-6 text-white/90" />
                    </div>
                  )}

                  {/* Title Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-1.5 bg-gradient-to-t from-black/80 to-transparent">
                    <h3 className="text-xs font-semibold text-white line-clamp-2 leading-tight">
                      {category.name}
                    </h3>
                    {productCount !== undefined && (
                      <p className="text-[10px] text-white/80 mt-0.5">
                        {productCount} books
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

    </div>
  );
}

