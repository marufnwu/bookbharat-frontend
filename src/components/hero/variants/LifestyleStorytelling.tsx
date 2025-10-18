'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { cn } from '@/lib/utils';
import { ArrowRight, Star, BookOpen } from 'lucide-react';
import { HeroVariantProps } from '../types';

export function LifestyleStorytelling({ config, className, isMounted, particles }: HeroVariantProps) {
  return (
    <section className={cn(
      'relative overflow-hidden py-2 md:py-4',
      className
    )}>
      {/* Background Image */}
      {config.backgroundImage && (
        <div className="absolute inset-0">
          <OptimizedImage
            src={config.backgroundImage}
            alt="Lifestyle background"
            fill
            className="object-cover"
            priority={true}
          />
          <div className="absolute inset-0 bg-black/60"></div>
        </div>
      )}
      
      {/* Atmospheric particles - generated client-side only */}
      {isMounted && (
        <div className="absolute inset-0">
          {particles?.lifestyleStorytelling?.map((particle: any) => (
            <div
              key={particle.id}
              className="absolute animate-float opacity-30"
              style={{
                left: particle.left,
                top: particle.top,
                animationDelay: particle.animationDelay,
                animationDuration: particle.animationDuration
              }}
            >
              <div className="w-1 h-1 bg-white/60 rounded-full"></div>
            </div>
          ))}
        </div>
      )}
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid md:grid-cols-2 gap-3 items-center">
          {/* Left Side - Storytelling Content */}
          <div className="space-y-2 text-white">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 text-xs font-medium text-white/90">
                <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
                <span>Featured</span>
              </div>
              
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold leading-tight">
                <span className="block text-white">{config.title}</span>
              </h1>
              <p className="text-base md:text-lg text-white/90 leading-relaxed max-w-xl">
                {config.subtitle}
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-2">
              <Button 
                className="bg-white text-gray-900 hover:bg-gray-100 px-5 py-2 text-sm"
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
          </div>

          {/* Right Side - Enhanced Lifestyle Image Collage */}
          <div className="grid grid-cols-2 gap-3">
            {config.featuredProducts?.slice(0, 4).map((product, index) => (
              <div 
                key={product.id} 
                className={cn(
                  "group relative rounded-3xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-4",
                  index === 0 ? "row-span-2 scale-110" : "",
                )}
              >
                <div className="aspect-[3/4] relative">
                  {product.images?.[0] ? (
                    <OptimizedImage
                      src={product.images[0].image_url}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                  
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0">
                      <Link href={`/products/${product.id}`}>
                        <Button size="sm" className="bg-white text-gray-900 hover:bg-gray-100">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                  
                  {/* Product info */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-0 group-hover:-translate-y-2 transition-transform duration-300">
                    <h3 className="text-white font-bold text-lg mb-2 line-clamp-2">{product.name}</h3>
                    {product.average_rating && (
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium">{product.average_rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

