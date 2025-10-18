'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { cn } from '@/lib/utils';
import { Sparkles, ArrowRight, ShoppingBag, Heart, BookOpen, Star, PlayCircle } from 'lucide-react';
import { HeroVariantProps } from '../types';

export function ModernVariant({ config, className, isMounted, particles }: HeroVariantProps) {
  return (
    <section className={cn(
      'relative overflow-hidden py-2 md:py-4',
      className
    )}>
      {/* Dynamic background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"></div>
      
      {/* Animated background patterns - generated client-side only */}
      {isMounted && (
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full">
            {particles?.modern?.map((particle: any) => (
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
                <div className="w-1 h-1 bg-white/20 rounded-full"></div>
              </div>
            ))}
          </div>
          
          {/* Gradient overlays */}
          <div className="absolute top-1/4 left-0 w-96 h-96 bg-gradient-to-r from-blue-500/30 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-gradient-to-l from-purple-500/30 to-transparent rounded-full blur-3xl"></div>
        </div>
      )}

      {config.backgroundImage && (
        <div className="absolute inset-0">
          <OptimizedImage
            src={config.backgroundImage}
            alt="Hero background"
            fill
            className="object-cover opacity-30"
            priority={true}
          />
        </div>
      )}
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          {/* Announcement badge */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-4">
            <Sparkles className="h-4 w-4 text-yellow-400" />
            <span className="text-white/90 text-sm font-medium">Featured Collection 2024</span>
            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs px-2 py-1">
              NEW
            </Badge>
          </div>

          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3 leading-tight">
            <span className="block">Best Books,</span>
            <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Best Prices
            </span>
          </h1>

          <p className="text-base md:text-lg text-white/80 mb-3 max-w-2xl mx-auto leading-relaxed">
            {config.subtitle}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-3">
            <Button 
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1"
              asChild
            >
              <Link href={config.primaryCta.href}>
                <ShoppingBag className="mr-2 h-5 w-5" />
                {config.primaryCta.text}
              </Link>
            </Button>
            {config.secondaryCta && (
              <Button 
                variant="outline"
                className="bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 px-8 py-4 text-lg transition-all duration-300"
                asChild
              >
                <Link href={config.secondaryCta.href}>
                  <Heart className="mr-2 h-5 w-5" />
                  {config.secondaryCta.text}
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

