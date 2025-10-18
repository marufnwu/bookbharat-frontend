'use client';

import React from 'react';
import Link from 'next/link';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { cn } from '@/lib/utils';
import { Grid3x3, ArrowRight, BookOpen } from 'lucide-react';
import { HeroVariantProps } from '../types';
import { seededRandomInt } from '@/lib/seeded-random';

export function CategoryGrid({ config, className }: HeroVariantProps) {
  return (
    <section className={cn(
      'relative overflow-hidden bg-gradient-to-br from-gray-50 to-white py-2 md:py-4',
      className
    )}>
      {/* Subtle background */}
      <div className="absolute inset-0 opacity-50">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle, #00000005 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-3">
          <div className="inline-flex items-center gap-2 bg-blue-50 rounded-full px-4 py-1.5 text-xs font-semibold text-blue-700 mb-2">
            <Grid3x3 className="h-3 w-3" />
            <span>Categories</span>
          </div>
          
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
            {config.title}
          </h1>
          <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto mb-3">
            {config.subtitle}
          </p>
        </div>

        {/* Category Grid - More Compact */}
        {config.categories && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {config.categories.map((category, index) => (
              <Link
                key={category.id}
                href={category.href}
                className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300"
                style={{
                  animationDelay: `${index * 0.1}s`
                }}
              >
                <div className="aspect-square relative">
                  <OptimizedImage
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                  
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/0 via-purple-600/0 to-pink-600/0 group-hover:from-blue-600/30 group-hover:via-purple-600/30 group-hover:to-pink-600/30 transition-all duration-500"></div>
                  
                  {/* Content */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-white font-black text-2xl mb-3 group-hover:text-yellow-300 transition-colors duration-300">{category.name}</h3>
                    <div className="flex items-center gap-2 text-white/80 group-hover:text-white transition-colors">
                      <span className="text-sm font-medium">Explore</span>
                      <ArrowRight className="h-4 w-4 transform group-hover:translate-x-2 transition-transform duration-300" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

