'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { cn } from '@/lib/utils';
import { Gift, Timer, Calendar } from 'lucide-react';
import { HeroVariantProps } from '../types';

export function SeasonalCampaign({ config, className, isMounted, particles }: HeroVariantProps) {
  return (
    <section className={cn(
      'relative overflow-hidden py-2 md:py-4',
      className
    )}>
      {/* Seasonal Background - Simplified */}
      {config.backgroundImage && (
        <div className="absolute inset-0">
          <OptimizedImage
            src={config.backgroundImage}
            alt="Seasonal background"
            fill
            className="object-cover"
            priority={true}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-red-900/60 to-green-900/60"></div>
        </div>
      )}
      
      {/* Subtle particles */}
      {isMounted && (
        <div className="absolute inset-0">
          {particles?.seasonalCampaign?.map((particle: any) => (
            <div
              key={particle.id}
              className="absolute animate-float opacity-40"
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
        <div className="text-center">
          {/* Campaign Badge - Compact */}
          {config.campaignData && (
            <div className="inline-flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg mb-4 font-bold text-sm shadow">
              <Gift className="h-4 w-4" />
              {config.campaignData.title}
            </div>
          )}
          
          <h1 className="text-xl md:text-3xl font-bold mb-3 leading-tight text-white">
            {config.title}
          </h1>
          
          <p className="text-sm md:text-base text-white/90 mb-3 max-w-2xl mx-auto">
            {config.subtitle}
          </p>
          
          {/* Countdown Timer - Compact */}
          {config.campaignData?.countdown && (
            <div className="flex justify-center items-center gap-2 mb-3">
              <Timer className="h-5 w-5 text-yellow-400" />
              <span className="text-white font-bold text-lg">Limited Time Offer!</span>
            </div>
          )}
          
          <div className="flex flex-wrap gap-2 justify-center">
            <Button 
              className="bg-white text-gray-900 hover:bg-gray-100 px-5 py-2 text-sm font-semibold"
              asChild
            >
              <Link href={config.primaryCta.href}>
                {config.primaryCta.text}
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
      </div>
    </section>
  );
}

