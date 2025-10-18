'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PlayCircle, Zap, ArrowRight } from 'lucide-react';
import { HeroVariantProps } from '../types';

export function VideoHero({ config, className, isMounted, particles }: HeroVariantProps) {
  return (
    <section className={cn(
      'relative overflow-hidden py-2 md:py-4',
      className
    )}>
      {/* Video Background - Simplified */}
      {config.videoUrl ? (
        <div className="absolute inset-0">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
          >
            <source src={config.videoUrl} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/50"></div>
        </div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800">
          {/* Subtle particles */}
          {isMounted && (
            <div className="absolute inset-0">
              {particles?.videoHero?.map((particle: any) => (
                <div
                  key={particle.id}
                  className="absolute animate-float opacity-20"
                  style={{
                    left: particle.left,
                    top: particle.top,
                    animationDelay: particle.animationDelay,
                    animationDuration: particle.animationDuration
                  }}
                >
                  <div className="w-1 h-1 bg-white rounded-full"></div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center">
        {/* Badge - Compact */}
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 text-xs font-semibold text-white mb-4">
          <Zap className="h-4 w-4 text-yellow-400" />
          <span>Watch & Discover</span>
        </div>

        <h1 className="text-xl md:text-3xl font-bold text-white mb-3 leading-tight">
          {config.title}
        </h1>
        
        <p className="text-sm md:text-base text-white/90 mb-3 max-w-2xl mx-auto">
          {config.subtitle}
        </p>

        {/* CTAs - Compact */}
        <div className="flex flex-wrap gap-2 justify-center">
          <Button 
            className="bg-white text-gray-900 hover:bg-gray-100 px-5 py-2 text-sm font-semibold"
            asChild
          >
            <Link href={config.primaryCta.href}>
              <PlayCircle className="mr-2 h-4 w-4" />
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
    </section>
  );
}

