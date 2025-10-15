'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CategoryCard } from '@/components/categories/CategoryCard';
import { ImageCategoryCard } from '@/components/categories/ImageCategoryCard';
import { MobileCategorySlider } from '@/components/categories/MobileCategorySlider';
import { Button } from '@/components/ui/button';
import { getCategoryIcon, getCategoryColor } from '@/lib/category-utils';
import { Category } from '@/types';
import { ChevronRight, Sparkles, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CategoriesSectionProps {
  categories: Category[];
  className?: string;
  variant?: 'default' | 'image-hero' | 'image-overlay' | 'image-side';
}

export function CategoriesSection({
  categories,
  className,
  variant = 'image-hero'
}: CategoriesSectionProps) {
  const [showAll, setShowAll] = useState(false);
  const displayCategories = showAll ? categories : categories.slice(0, 8);

  // Use image-focused card if variant is specified
  const useImageCard = variant !== 'default';

  return (
    <section className={cn("py-4 md:py-4 lg:py-5 relative overflow-hidden", className)}>
      {/* Background decoration - more subtle */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/2 via-transparent to-secondary/2 pointer-events-none" />
      <div className="absolute -top-8 -right-8 w-32 h-32 bg-primary/4 rounded-full blur-2xl pointer-events-none hidden md:block" />
      <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-secondary/4 rounded-full blur-2xl pointer-events-none hidden md:block" />

      <div className="max-w-7xl mx-auto px-3 sm:px-3 lg:px-4 relative">
        {/* Section Header - Enhanced Mobile */}
        <div className="text-center mb-4 md:mb-4">
          <div className="inline-flex items-center justify-center space-x-1.5 mb-2">
            <ImageIcon className="w-4 h-4 md:w-4 md:h-4 text-primary" />
            <h2 className="text-lg md:text-lg lg:text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Browse by Category
            </h2>
            <Sparkles className="w-4 h-4 md:w-4 md:h-4 text-primary" />
          </div>
          <p className="text-xs md:text-xs text-muted-foreground max-w-2xl mx-auto">
            Discover your next favorite book from our wide range of categories
          </p>
        </div>

        {/* Responsive Layout: Mobile Slider + Desktop Grid */}
        <div className="mb-4 md:mb-4">
          {/* Mobile: Enhanced 2-Row Horizontal Slider (hidden on md+) */}
          <div className="block md:hidden">
            <MobileCategorySlider
              categories={displayCategories}
              icon={getCategoryIcon('')}
              colorClass={getCategoryColor(0)}
            />
          </div>

          {/* Desktop: Grid Layout (hidden on mobile) */}
          <div className={cn(
            "hidden md:grid gap-2 md:gap-2.5",
            variant === 'image-side'
              ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-2"
              : "grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6"
          )}>
            {displayCategories.map((category, index) => (
              useImageCard ? (
                <ImageCategoryCard
                  key={category.id}
                  category={category}
                  icon={getCategoryIcon(category.name)}
                  colorClass={getCategoryColor(index)}
                  variant={variant as 'image-hero' | 'image-overlay' | 'image-side'}
                  showProductCount={true}
                />
              ) : (
                <CategoryCard
                  key={category.id}
                  category={category}
                  icon={getCategoryIcon(category.name)}
                  colorClass={getCategoryColor(index)}
                  variant="default"
                  showDescription={false}
                  showProductCount={true}
                />
              )
            ))}
          </div>
        </div>

        {/* Enhanced View More/Less Button */}
        <div className="text-center space-y-2 md:space-y-2">
          {categories.length > 8 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAll(!showAll)}
              className="group text-xs md:text-xs h-9 md:h-8 px-4 md:px-3 touch-target"
            >
              {showAll ? 'Show Less' : `View All ${categories.length} Categories`}
              <ChevronRight className={cn(
                "w-3 h-3 md:w-3 md:h-3 ml-1 transition-transform",
                showAll ? "rotate-90" : "group-hover:translate-x-1"
              )} />
            </Button>
          )}

          <div className="flex items-center justify-center space-x-2">
            <Link href="/categories">
              <Button size="sm" className="group text-xs md:text-xs h-9 md:h-8 px-4 md:px-3 touch-target">
                Browse All Categories
                <ChevronRight className="w-3 h-3 md:w-3 md:h-3 ml-1 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}