'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CategoryCard } from '@/components/categories/CategoryCard';
import { Button } from '@/components/ui/button';
import { getCategoryIcon, getCategoryColor } from '@/lib/category-utils';
import { Category } from '@/types';
import { ChevronRight, Grid3x3, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CategoriesSectionProps {
  categories: Category[];
  className?: string;
}

export function CategoriesSection({ categories, className }: CategoriesSectionProps) {
  const [showAll, setShowAll] = useState(false);
  const displayCategories = showAll ? categories : categories.slice(0, 8);
  
  return (
    <section className={cn("py-12 md:py-16 relative overflow-hidden", className)}>
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <div className="text-center mb-10 md:mb-12">
          <div className="inline-flex items-center justify-center space-x-2 mb-4">
            <Grid3x3 className="w-6 h-6 text-primary" />
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Explore Categories
            </h2>
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover your next favorite book from our wide range of categories
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          {displayCategories.map((category, index) => (
            <CategoryCard
              key={category.id}
              category={category}
              icon={getCategoryIcon(category.name)}
              colorClass={getCategoryColor(index)}
              variant="default"
              showDescription={false}
              showProductCount={true}
            />
          ))}
        </div>

        {/* View More/Less Button */}
        <div className="text-center space-y-4">
          {categories.length > 8 && (
            <Button
              variant="outline"
              size="lg"
              onClick={() => setShowAll(!showAll)}
              className="group"
            >
              {showAll ? 'Show Less' : `View All ${categories.length} Categories`}
              <ChevronRight className={cn(
                "w-4 h-4 ml-2 transition-transform",
                showAll ? "rotate-90" : "group-hover:translate-x-1"
              )} />
            </Button>
          )}
          
          <div className="flex items-center justify-center space-x-4">
            <Link href="/categories">
              <Button variant="default" size="lg" className="group">
                Browse All Categories
                <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}