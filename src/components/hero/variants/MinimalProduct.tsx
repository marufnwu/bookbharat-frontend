'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { cn } from '@/lib/utils';
import { ArrowRight, BookOpen, CheckCircle, Star } from 'lucide-react';
import { HeroVariantProps } from '../types';

export function MinimalProduct({ config, className }: HeroVariantProps) {
  return (
    <section className={cn(
      'relative overflow-hidden bg-white py-2 sm:py-3 md:py-4',
      className
    )}>
      {/* Clean minimal background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-white"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid md:grid-cols-5 gap-3 md:gap-6 items-center">
          {/* Left Side - Content */}
          <div className="md:col-span-3 space-y-2 md:space-y-3">
            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 bg-blue-50 rounded-full px-3 py-1 text-xs font-medium text-blue-700">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
              <span>Premium Books</span>
            </div>
            
            {/* Title */}
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
              {config.title}
            </h1>
            
            {/* Subtitle */}
            <p className="text-sm md:text-base text-gray-600 leading-relaxed max-w-xl">
              {config.subtitle}
            </p>
            
            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-2">
              <Button 
                className="bg-gray-900 hover:bg-gray-800 text-white px-5 py-2 text-sm"
                asChild
              >
                <Link href={config.primaryCta.href}>
                  {config.primaryCta.text}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              {config.secondaryCta && (
                <Button 
                  variant="outline"
                  className="px-5 py-2 text-sm"
                  asChild
                >
                  <Link href={config.secondaryCta.href}>
                    {config.secondaryCta.text}
                  </Link>
                </Button>
              )}
            </div>

            {/* Trust Badges - Compact */}
            {config.trustBadges && config.trustBadges.length > 0 && (
              <div className="flex flex-wrap gap-3 pt-3 border-t">
                {config.trustBadges.slice(0, 3).map((badge, index) => (
                  <div key={index} className="flex items-center gap-1.5 text-xs text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>{badge}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Side - Product Image */}
          <div className="md:col-span-2">
            {config.featuredProducts && config.featuredProducts[0] && (
              <div className="relative">
                <div className="aspect-square bg-gray-50 rounded-xl p-6 flex items-center justify-center border shadow-sm">
                  {config.featuredProducts[0].images?.[0] ? (
                    <OptimizedImage
                      src={config.featuredProducts[0].images[0].image_url}
                      alt={config.featuredProducts[0].name}
                      width={280}
                      height={280}
                      className="object-contain"
                      priority={true}
                    />
                  ) : (
                    <BookOpen className="h-24 w-24 text-gray-300" />
                  )}
                </div>
                
                {/* Floating badges */}
                {config.featuredProducts[0].sale_price && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white px-2.5 py-1 rounded-lg font-semibold text-xs shadow">
                    Save {Math.round((1 - config.featuredProducts[0].sale_price / config.featuredProducts[0].price) * 100)}%
                  </div>
                )}
                {config.featuredProducts[0].average_rating && (
                  <div className="absolute bottom-2 left-2 bg-white rounded-lg px-3 py-1.5 shadow-md flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-3 w-3 ${i < Math.floor(config.featuredProducts![0].average_rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-medium text-gray-700">
                      {config.featuredProducts[0].average_rating?.toFixed(1)}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

