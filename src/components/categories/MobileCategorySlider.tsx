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
  const [currentScrollIndex, setCurrentScrollIndex] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Calculate total pages and current scroll index
  useEffect(() => {
    const calculatePages = () => {
      if (!scrollRef.current || !categories.length) {
        setTotalPages(1);
        return;
      }

      try {
        const { scrollWidth, clientWidth } = scrollRef.current;
        const cardWidth = 88; // 76px card + 12px gap
        const visibleCards = Math.max(1, Math.floor(clientWidth / cardWidth));
        const totalPossiblePages = Math.ceil(categories.length / (visibleCards * 2)); // 2 rows

        setTotalPages(Math.max(1, Math.min(10, totalPossiblePages)));
      } catch (error) {
        console.error('Error calculating pages:', error);
        setTotalPages(1);
      }
    };

    calculatePages();
  }, [categories]);

  // Initialize scroll position and update when categories change
  useEffect(() => {
    const checkScrollPosition = () => {
      if (!scrollRef.current) return;

      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      const canScrollLeft = scrollLeft > 10;
      const canScrollRight = scrollLeft < scrollWidth - clientWidth - 10;

      // Calculate current page based on scroll position
      const cardWidth = 88; // 76px card + 12px gap
      const currentPage = Math.round(scrollLeft / (cardWidth * 2)); // 2 rows per column
      setCurrentScrollIndex(Math.max(0, currentPage));

      setCanScrollLeft(canScrollLeft);
      setCanScrollRight(canScrollRight);
    };

    // Check immediately and after delays to ensure DOM is ready
    checkScrollPosition();
    const timeoutId1 = setTimeout(checkScrollPosition, 100);
    const timeoutId2 = setTimeout(checkScrollPosition, 500);

    return () => {
      clearTimeout(timeoutId1);
      clearTimeout(timeoutId2);
    };
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

    const cardWidth = 88; // 76px card + 12px gap
    const { scrollWidth, clientWidth } = scrollRef.current;
    const visibleCards = Math.floor(clientWidth / cardWidth);
    const scrollAmount = cardWidth * visibleCards * 2; // 2 rows

    let newScrollLeft = scrollRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);

    // Ensure we don't scroll beyond bounds
    const maxScroll = scrollWidth - clientWidth;
    newScrollLeft = Math.max(0, Math.min(newScrollLeft, maxScroll));

    // Snap to page boundaries
    const currentPage = Math.round(newScrollLeft / (cardWidth * 2));
    const snappedScrollLeft = currentPage * cardWidth * 2;

    scrollRef.current.scrollTo({
      left: snappedScrollLeft,
      behavior: 'smooth'
    });

    // Update scroll indicators after scroll animation completes
    setTimeout(() => {
      if (scrollRef.current) {
        checkScrollPosition();
      }
    }, 300);
  };

  // Scroll to specific page
  const scrollToPage = (pageIndex: number) => {
    if (!scrollRef.current || pageIndex < 0 || pageIndex >= totalPages) return;

    const cardWidth = 88;
    const targetScrollLeft = pageIndex * cardWidth * 2;

    scrollRef.current.scrollTo({
      left: targetScrollLeft,
      behavior: 'smooth'
    });

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
        <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none" />
      )}
      {canScrollRight && (
        <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none" />
      )}

      {/* Enhanced Navigation Arrows - Cleaner Design */}
      {canScrollLeft && (
        <div className="absolute left-1 top-1/2 -translate-y-1/2 z-20">
          <button
            onClick={() => scroll('left')}
            className="group bg-white/90 backdrop-blur-md hover:bg-white border border-gray-200/50 hover:border-gray-300 rounded-full p-2 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 ring-1 ring-gray-200/50 hover:ring-gray-300/70 min-w-[40px] min-h-[40px] flex items-center justify-center"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4 text-gray-600 group-hover:text-gray-800 transition-colors duration-200" />
          </button>
        </div>
      )}

      {canScrollRight && (
        <div className="absolute right-1 top-1/2 -translate-y-1/2 z-20">
          <button
            onClick={() => scroll('right')}
            className="group bg-white/90 backdrop-blur-md hover:bg-white border border-gray-200/50 hover:border-gray-300 rounded-full p-2 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 ring-1 ring-gray-200/50 hover:ring-gray-300/70 min-w-[40px] min-h-[40px] flex items-center justify-center"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-800 transition-colors duration-200" />
          </button>
        </div>
      )}

      {/* Scrollable Container - Enhanced 2 Row Grid Layout */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="grid grid-rows-2 gap-3 overflow-x-auto overflow-y-hidden scrollbar-hide scroll-smooth pb-3 px-6 min-w-0"
        style={{
          WebkitOverflowScrolling: 'touch', // Enable momentum scrolling on iOS
          // 2-row grid that flows horizontally
          gridTemplateRows: 'repeat(2, auto)',
          gridAutoFlow: 'column',
          // Ensure minimum width for scrolling calculation
          minWidth: '100%',
          // Enhanced touch scrolling
          scrollBehavior: 'smooth',
          scrollSnapType: 'x mandatory',
          // Better spacing for touch
          padding: '0.5rem 1.5rem 0.5rem 1.5rem'
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
              <div className="w-20 h-24 flex flex-col items-center">
              {/* Enhanced Touch Target */}
              <div className="relative w-16 h-16 aspect-square overflow-hidden transition-all duration-300 group-hover:scale-105 rounded-full border-2 border-background shadow-lg group-hover:shadow-xl bg-white">
                {categoryImage ? (
                  <Image
                    src={categoryImage}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                    sizes="64px"
                  />
                ) : (
                  <div className={cn(
                    "w-full h-full rounded-full flex items-center justify-center",
                    "bg-gradient-to-br",
                    colorClass.replace('text-', 'from-').replace('600', '400'),
                    "to-primary/30"
                  )}>
                    <Icon className="w-6 h-6 text-white/90" />
                  </div>
                )}

                {/* Featured Badge */}
                {category.featured && (
                  <div className="absolute top-1 right-1 z-10">
                    <Badge className="bg-yellow-400 text-yellow-900 border-0 text-[8px] font-semibold shadow-lg px-1 py-0.5">
                      <Sparkles className="w-2 h-2" />
                    </Badge>
                  </div>
                )}

                {/* Popular Badge */}
                {productCount && productCount > 50 && (
                  <div className="absolute top-1 left-1 z-10">
                    <Badge className="bg-white/90 text-primary border-0 text-[8px] font-semibold backdrop-blur-sm px-1 py-0.5">
                      <TrendingUp className="w-2 h-2" />
                    </Badge>
                  </div>
                )}

                {/* Subtle hover ring */}
                <div className="absolute inset-0 rounded-full ring-2 ring-primary/0 group-hover:ring-primary/20 transition-all duration-300" />
              </div>

              {/* Enhanced Category Name */}
              <div className="mt-2 text-center px-1 w-full">
                <h3 className="text-xs font-semibold line-clamp-2 leading-tight group-hover:text-primary transition-colors text-gray-800">
                  {category.name}
                </h3>
              </div>
            </div>
            </Link>
          );
        })}
      </div>

      {/* Dot Indicators */}
      {totalPages > 1 && totalPages <= 10 && (
        <div className="flex justify-center items-center mt-3 space-x-2">
          {Array.from({ length: Math.max(1, Math.min(totalPages, 10)) }, (_, index) => (
            <button
              key={index}
              onClick={() => scrollToPage(index)}
              className={`transition-all duration-300 rounded-full ${
                index === currentScrollIndex
                  ? 'w-8 h-2 bg-primary shadow-md scale-110'
                  : 'w-2 h-2 bg-gray-300 hover:bg-gray-400 scale-100'
              }`}
              aria-label={`Go to page ${index + 1}`}
            />
          ))}
        </div>
      )}

    </div>
  );
}

