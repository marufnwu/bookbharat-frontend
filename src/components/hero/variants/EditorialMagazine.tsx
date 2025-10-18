'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { cn } from '@/lib/utils';
import { BookOpen, ArrowRight } from 'lucide-react';
import { HeroVariantProps } from '../types';

export function EditorialMagazine({ config, className }: HeroVariantProps) {
  return (
    <section className={cn(
      'relative bg-white py-2 md:py-4',
      className
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Magazine Header - Compact */}
        <div className="border-b border-gray-200 pb-4 mb-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">{config.title}</h2>
              <p className="text-sm text-gray-600 mt-1">{config.subtitle}</p>
            </div>
            <Button 
              variant="outline"
              size="sm"
              asChild
            >
              <Link href={config.primaryCta.href}>
                {config.primaryCta.text}
              </Link>
            </Button>
          </div>
        </div>

        {/* Featured Articles Grid - Compact */}
        <div className="grid md:grid-cols-3 gap-3">
          {config.featuredProducts?.slice(0, 3).map((product, index) => (
            <article key={product.id} className={index === 0 ? "md:col-span-2" : ""}>
              <div className="space-y-3">
                <div className={`${index === 0 ? "aspect-[16/9]" : "aspect-video"} bg-gray-100 rounded-lg overflow-hidden`}>
                  {product.images?.[0] ? (
                    <OptimizedImage
                      src={product.images[0].image_url}
                      alt={product.name}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-300"
                    />
                  ) : null}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold text-blue-600">Featured</span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500">5 min read</span>
                  </div>
                  <h3 className={`font-bold text-gray-900 mb-2 ${index === 0 ? "text-xl md:text-2xl" : "text-base"} line-clamp-2`}>
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                    {product.short_description || config.subtitle}
                  </p>
                  <Button 
                    variant="link"
                    size="sm"
                    className="text-blue-600 p-0 h-auto font-semibold"
                    asChild
                  >
                    <Link href={`/products/${product.id}`}>
                      Read more <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

