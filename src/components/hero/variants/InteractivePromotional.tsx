'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { cn } from '@/lib/utils';
import { ArrowRight, Gift } from 'lucide-react';
import { HeroVariantProps } from '../types';

export function InteractivePromotional({ config, className, isMounted, particles }: HeroVariantProps) {
  return (
    <section className={cn(
      'relative overflow-hidden bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 py-2 md:py-4',
      className
    )}>
      {/* Simplified background */}
      <div className="absolute inset-0">
        <div className="absolute top-8 left-8 w-32 h-32 bg-blue-400/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-8 right-8 w-40 h-40 bg-purple-400/10 rounded-full blur-xl"></div>
      </div>
        
      {/* Animated particles - generated client-side only */}
      {isMounted && (
        <div className="absolute inset-0 pointer-events-none">
          {particles?.interactivePromotional?.map((particle: any) => (
            <div
              key={particle.id}
              className="absolute animate-pulse"
              style={{
                left: particle.left,
                top: particle.top,
                animationDelay: particle.animationDelay,
                animationDuration: particle.animationDuration
              }}
            >
              <div className={`${particle.width} ${particle.height} ${particle.opacity} rounded-full`}></div>
            </div>
          ))}
        </div>
      )}
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center">
        {/* Campaign Banner - Compact */}
        {config.campaignData && (
          <div className="inline-flex items-center gap-2 bg-yellow-400 text-gray-900 px-4 py-2 rounded-lg mb-4 font-bold text-sm shadow">
            <Gift className="h-4 w-4" />
            {config.campaignData.title}
          </div>
        )}
        
        <h1 className="text-xl md:text-3xl font-bold mb-3 leading-tight">
          <span className="block text-white">{config.title}</span>
        </h1>
        
        <p className="text-base md:text-lg text-white/90 mb-3 max-w-2xl mx-auto">
          {config.subtitle}
        </p>
        
        {/* CTAs - Compact */}
        <div className="flex flex-wrap gap-2 justify-center mb-4">
          <Button 
            className="bg-yellow-400 text-gray-900 hover:bg-yellow-300 px-5 py-2 text-sm font-semibold"
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
              className="border-white text-white hover:bg-white/10 px-5 py-2 text-sm"
              asChild
            >
              <Link href={config.secondaryCta.href}>
                {config.secondaryCta.text}
              </Link>
            </Button>
          )}
        </div>

        {/* Product Showcase - Compact */}
        {config.featuredProducts && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {config.featuredProducts.slice(0, 4).map((product) => (
              <div 
                key={product.id} 
                className="group bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20 hover:bg-white/20 transition-all cursor-pointer"
              >
                <div className="aspect-[3/4] bg-white/5 rounded-lg mb-2 overflow-hidden relative">
                  {product.images?.[0] ? (
                    <OptimizedImage
                      src={product.images[0].image_url}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : null}
                </div>
                <h3 className="text-white font-semibold text-sm mb-2 line-clamp-2">{product.name}</h3>
                <p className="text-yellow-400 font-bold text-sm">
                  ${(product as any).sale_price || product.price}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

