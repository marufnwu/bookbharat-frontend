'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { cn } from '@/lib/utils';
import { Eye, Camera } from 'lucide-react';
import { HeroVariantProps } from '../types';

export function InteractiveTryOn({ config, className }: HeroVariantProps) {
  return (
    <section className={cn(
      'relative bg-gradient-to-br from-gray-50 to-white py-2 md:py-4',
      className
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-3">
          <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-2">
            {config.title}
          </h1>
          <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto mb-3">
            {config.subtitle}
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Button 
              className="bg-gray-900 hover:bg-gray-800 text-white px-5 py-2 text-sm"
              asChild
            >
              <Link href={config.primaryCta.href}>
                <Camera className="mr-2 h-4 w-4" />
                {config.primaryCta.text}
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

        {/* Interactive Preview - Compact */}
        {config.featuredProducts && config.featuredProducts[0] && (
          <div className="max-w-xl mx-auto">
            <div className="bg-white rounded-xl p-4 shadow border">
              <div className="aspect-video bg-gray-100 rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
                {config.featuredProducts[0].images?.[0] ? (
                  <OptimizedImage
                    src={config.featuredProducts[0].images[0].image_url}
                    alt={config.featuredProducts[0].name}
                    fill
                    className="object-contain"
                  />
                ) : (
                  <div className="text-center">
                    <Eye className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Preview Area</p>
                  </div>
                )}
              </div>
              <h3 className="font-semibold text-gray-900 text-center">
                {config.featuredProducts[0].name}
              </h3>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

