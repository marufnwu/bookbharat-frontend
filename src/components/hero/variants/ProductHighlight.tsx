'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { cn } from '@/lib/utils';
import { ArrowRight, Star, Award } from 'lucide-react';
import { HeroVariantProps } from '../types';

export function ProductHighlight({ config, className }: HeroVariantProps) {
  return (
    <section className={cn(
      'relative overflow-hidden bg-gradient-to-br from-gray-50 to-white py-2 md:py-4',
      className
    )}>
      {/* Subtle background */}
      <div className="absolute inset-0">
        <div className="absolute top-8 right-8 w-32 h-32 bg-blue-100/40 rounded-full blur-2xl"></div>
        <div className="absolute bottom-8 left-8 w-24 h-24 bg-purple-100/40 rounded-full blur-2xl"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid md:grid-cols-2 gap-3 items-center">
          {/* Left Side - Product Image - Compact */}
          <div className="relative order-2 md:order-1">
            {config.featuredProducts?.[0] && (
              <div className="relative">
                <div className="aspect-square bg-white rounded-xl p-6 shadow border">
                  {config.featuredProducts[0].images?.[0] ? (
                    <OptimizedImage
                      src={config.featuredProducts[0].images[0].image_url}
                      alt={config.featuredProducts[0].name}
                      fill
                      className="object-contain"
                      priority={true}
                    />
                  ) : null}
                </div>
                
                {/* Floating badges - Compact */}
                {config.featuredProducts[0].sale_price && (
                  <div className="absolute top-2 right-2 bg-purple-500 text-white px-3 py-1 rounded-lg font-bold text-xs shadow">
                    SALE
                  </div>
                )}
                {config.featuredProducts[0].average_rating && (
                  <div className="absolute bottom-2 left-2 bg-green-500 text-white px-2 py-1 rounded-lg flex items-center gap-1 text-xs shadow">
                    <Star className="h-3 w-3 fill-current" />
                    <span className="font-bold">{config.featuredProducts[0].average_rating.toFixed(1)}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Side - Product Details - Compact */}
          <div className="order-1 md:order-2 space-y-2">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 bg-purple-50 rounded-full px-4 py-1.5 text-xs font-semibold text-purple-700">
                <Award className="h-3 w-3" />
                <span>Featured Product</span>
              </div>
              
              <h1 className="text-xl md:text-3xl font-bold text-gray-900 leading-tight">
                {config.title}
              </h1>
              <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                {config.subtitle}
              </p>
            </div>

            {/* Features List - Compact */}
            {config.features && config.features.length > 0 && (
              <div className="space-y-2">
                {config.features.slice(0, 3).map((feature, index) => (
                  <div key={index} className="flex items-start gap-3 bg-white rounded-lg p-3 shadow-sm">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Award className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-gray-900">{feature.title}</h4>
                      <p className="text-xs text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* CTAs - Compact */}
            <div className="flex flex-wrap gap-2">
              <Button 
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 text-sm"
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
          </div>
        </div>
      </div>
    </section>
  );
}

