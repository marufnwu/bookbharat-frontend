'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { cn } from '@/lib/utils';
import { BookOpen, ArrowRight, ShoppingBag, Star, Heart, Shield, Truck, Sparkles } from 'lucide-react';
import { HeroVariantProps } from '../types';

export function ClassicVariant({ config, className }: HeroVariantProps) {
  return (
    <section className={cn(
      'relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-2 md:py-3',
      className
    )}>
      {/* Background decorations - smaller and more subtle */}
      <div className="absolute inset-0">
        <div className="absolute top-16 left-8 w-48 h-48 bg-gradient-to-r from-blue-400/15 to-purple-400/15 rounded-full blur-2xl"></div>
        <div className="absolute bottom-16 right-8 w-64 h-64 bg-gradient-to-r from-purple-400/15 to-pink-400/15 rounded-full blur-2xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-indigo-300/8 to-purple-300/8 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-3 items-center">
          {/* Left: Content */}
          <div>
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-sm font-medium shadow-lg mb-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-gray-700">Premium Collection</span>
              <span className="text-xs bg-gradient-to-r from-blue-500 to-purple-500 text-white px-2 py-0.5 rounded-full">NEW</span>
            </div>
            
            <h1 className="text-2xl md:text-3xl font-bold mb-3 leading-tight">
              <span className="block text-gray-900">{config.title}</span>
            </h1>
            
            <p className="text-base text-gray-700 mb-3 leading-relaxed max-w-lg">
              {config.subtitle}
            </p>
            
            {/* Stats - Compact */}
            {config.stats && (
              <div className="grid grid-cols-3 gap-3 mb-3">
                {config.stats.slice(0, 3).map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {stat.value}
                    </div>
                    <div className="text-xs text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            )}
            
            {/* CTAs */}
            <div className="flex flex-wrap gap-2">
              <Button 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 text-sm shadow-lg"
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
                  className="px-6 py-2 text-sm"
                  asChild
                >
                  <Link href={config.secondaryCta.href}>
                    {config.secondaryCta.text}
                  </Link>
                </Button>
              )}
            </div>
          </div>

          {/* Right: Featured Products Showcase */}
          <div className="relative">
            <div className="grid grid-cols-2 gap-3">
              {config.featuredProducts?.slice(0, 4).map((book, index) => (
                <div 
                  key={book.id} 
                  className={`
                    group bg-white rounded-2xl shadow-2xl p-4 border border-white/20 backdrop-blur-sm
                    hover:shadow-3xl transition-all duration-500 hover:-translate-y-2
                    ${index === 0 ? 'col-span-2 row-span-1' : ''}
                  `}
                >
                  <div className={`${index === 0 ? 'aspect-[16/9]' : 'aspect-square'} bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden mb-2`}>
                    {book.images?.[0] ? (
                      <OptimizedImage
                        src={book.images[0].image_url}
                        alt={book.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : null}
                  </div>
                  <h3 className="font-semibold text-sm text-gray-900 mb-1 line-clamp-1">{book.name}</h3>
                      <p className="text-blue-600 font-bold text-sm">${(book as any).sale_price || book.price}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

