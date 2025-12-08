'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { cn } from '@/lib/utils';
import { ArrowRight, Star, Truck, Shield, BookOpen, ShoppingBag } from 'lucide-react';
import { HeroVariantProps } from '../types';
import { useConfig } from '@/contexts/ConfigContext';

export function DefaultVariant({ config, className }: HeroVariantProps) {
  const { siteConfig } = useConfig();
  const freeShippingEnabled = siteConfig?.payment?.free_shipping_enabled !== false;

  return (
    <section className={cn(
      'relative bg-gradient-to-b from-white to-gray-50/50 py-2 md:py-3',
      className
    )}>
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-3">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,0,0,0.1) 1px, transparent 0)`,
          backgroundSize: '20px 20px'
        }}></div>
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Elegant badge */}
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full px-4 py-1.5 text-sm font-medium text-gray-700 mb-4 shadow-sm border border-gray-200/50">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Premium Book Collection</span>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold mb-3 leading-tight">
          <span className="block text-gray-900 mb-2">Quality Books</span>
          <span className="block relative">
            <span className="relative z-10 bg-gradient-to-r from-gray-700 via-gray-800 to-gray-900 bg-clip-text text-transparent">
              Great Prices
            </span>
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-3/4 h-3 bg-gradient-to-r from-blue-200 to-purple-200 rounded-full opacity-50"></div>
          </span>
        </h1>

        <p className="text-base text-gray-600 mb-3 max-w-2xl mx-auto leading-relaxed">
          Curated collection of bestsellers and classics.{freeShippingEnabled ? ' Free shipping,' : ''} easy returns, and unbeatable customer service.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-3">
          <Button
            size="lg"
            className="bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black text-white shadow-xl hover:shadow-2xl transition-all duration-300 px-8 py-4"
            asChild
          >
            <Link href={config.primaryCta.href}>
              {config.primaryCta.text}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          {config.secondaryCta && (
            <Button
              size="lg"
              variant="outline"
              className="px-8 py-4 border-2"
              asChild
            >
              <Link href={config.secondaryCta.href}>
                {config.secondaryCta.text}
              </Link>
            </Button>
          )}
        </div>

        {/* Trust indicators - Compact */}
        <div className="flex flex-wrap justify-center gap-3 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-yellow-500 fill-current" />
            <span>4.9/5 Rating</span>
          </div>
          {freeShippingEnabled && (
            <>
              <span className="text-gray-300">•</span>
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-green-600" />
                <span>Free Shipping</span>
              </div>
            </>
          )}
          <span className="text-gray-300">•</span>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-blue-600" />
            <span>Secure Checkout</span>
          </div>
        </div>

        {/* Featured Products - Compact */}
        {config.featuredProducts && config.featuredProducts.length > 0 && (
          <div className="relative mb-8">
            <div className="flex justify-center items-end space-x-3">
              {config.featuredProducts.slice(0, 7).map((book, index) => (
                <div
                  key={book.id}
                  className={`
                    bg-white rounded-lg shadow-lg border border-gray-200/50 p-2 hover:shadow-xl transition-all duration-300 hover:-translate-y-1
                    ${index === 3 ? 'w-20 h-28 scale-110' : 'w-16 h-24'}
                  `}
                >
                  {book.images?.[0] && (
                    <div className="relative w-full h-full">
                      <OptimizedImage
                        src={book.images[0].image_url}
                        alt={book.name}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

