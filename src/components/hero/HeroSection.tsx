'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { cn } from '@/lib/utils';
// Import only commonly used icons, rest will be lazy loaded
import {
  ArrowRight,
  BookOpen,
  Star,
  Users,
  TrendingUp,
  Award,
  Truck,
  Shield
} from 'lucide-react';
import { Product } from '@/types';
import type { LucideIcon } from 'lucide-react';

// Icon map for dynamic loading
const iconMap: Record<string, React.ComponentType<any>> = {
  'arrow-right': ArrowRight,
  'book': BookOpen,
  'star': Star,
  'users': Users,
  'trending': TrendingUp,
  'award': Award,
  'truck': Truck,
  'shield': Shield,
};

interface HeroConfig {
  variant: 'minimal-product' | 'lifestyle-storytelling' | 'interactive-promotional' | 'category-grid' | 'seasonal-campaign' | 'product-highlight' | 'video-hero' | 'interactive-tryOn' | 'editorial-magazine';
  title: string;
  subtitle: string;
  primaryCta: {
    text: string;
    href: string;
  };
  secondaryCta?: {
    text: string;
    href: string;
  };
  stats?: Array<{
    label: string;
    value: string;
    icon?: string;
  }>;
  backgroundImage?: string;
  featuredProducts?: Product[];
  discountBadge?: {
    text: string;
    color?: string;
  };
  trustBadges?: string[];
  videoUrl?: string;
  categories?: Array<{
    id: string;
    name: string;
    image: string;
    href: string;
  }>;
  campaignData?: {
    title: string;
    countdown?: Date;
    offer?: string;
  };
  features?: Array<{
    title: string;
    description: string;
    icon: string;
  }>;
  testimonials?: Array<{
    text: string;
    author: string;
    rating: number;
  }>;
}

interface HeroSectionProps {
  config: HeroConfig;
  className?: string;
}

export function HeroSection({ config, className }: HeroSectionProps) {
  const getIconComponent = (iconName?: string) => {
    if (!iconName) return BookOpen;

    // Use the iconMap for loaded icons, fallback to BookOpen
    return iconMap[iconName] || BookOpen;
  };

  // Variant 1: Minimal & Product-Focused - Ultra Mobile-First Design
  if (config.variant === 'minimal-product') {
    return (
      <section className={cn(
        'relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50/20 py-3 sm:py-6 lg:py-8 mobile-optimized',
        className
      )}>
        {/* Subtle background pattern - Minimal for mobile */}
        <div className="absolute inset-0 opacity-[0.005] sm:opacity-[0.01]">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,0,0,0.1) 1px, transparent 0)`,
            backgroundSize: '16px 16px'
          }}></div>
        </div>
        
        {/* Floating geometric shapes - Desktop only */}
        <div className="hidden xl:block absolute top-12 left-6 w-12 h-12 bg-gradient-to-br from-blue-100/20 to-purple-100/20 rounded-full blur-md"></div>
        <div className="hidden xl:block absolute bottom-12 right-6 w-10 h-10 bg-gradient-to-br from-orange-100/20 to-pink-100/20 rounded-full blur-md"></div>
        
        <div className="relative max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 items-center">
            {/* Left Side - Content */}
            <div className="space-y-3 sm:space-y-4 lg:space-y-5 order-2 lg:order-1">
              <div className="space-y-2 sm:space-y-3">
                <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100/50 rounded-full px-2.5 py-1 text-[10px] sm:text-xs font-medium text-blue-700 shadow-sm">
                  <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="hidden xs:inline">Premium Quality Books</span>
                  <span className="xs:hidden">Premium Books</span>
                </div>
                
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 leading-[0.9] tracking-tight">
                  {config.title}
                </h1>
                <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-600 max-w-lg leading-relaxed font-light">
                  {config.subtitle}
                </p>
              </div>
              
              <div className="flex flex-col xs:flex-row items-start gap-2 sm:gap-3">
                <Button 
                  size="xs"
                  className="w-full xs:w-auto group relative overflow-hidden bg-gradient-to-r from-gray-900 to-black hover:from-black hover:to-gray-900 text-white px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow-md rounded-md"
                  asChild
                >
                  <Link href={config.primaryCta.href}>
                    <span className="relative z-10 flex items-center justify-center">
                      <span className="truncate">{config.primaryCta.text}</span>
                      <ArrowRight className="ml-1 sm:ml-1.5 h-3 w-3 sm:h-4 sm:w-4 group-hover:translate-x-0.5 transition-transform duration-200" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                  </Link>
                </Button>
                {config.secondaryCta && (
                  <Button 
                    variant="outline" 
                    size="xs"
                    className="w-full xs:w-auto border border-gray-200 hover:border-gray-900 hover:bg-gray-900 hover:text-white px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium transition-all duration-200 rounded-md"
                    asChild
                  >
                    <Link href={config.secondaryCta.href}>
                      <span className="truncate">{config.secondaryCta.text}</span>
                    </Link>
                  </Button>
                )}
              </div>

              {/* Ultra-compact Trust Badges - Mobile First */}
              {config.trustBadges && config.trustBadges.length > 0 && (
                <div className="grid grid-cols-2 xs:grid-cols-3 gap-1.5 sm:gap-2 pt-2 sm:pt-3 border-t border-gray-100/50">
                  {config.trustBadges.slice(0, 3).map((badge, index) => (
                    <div key={index} className="flex items-center gap-1.5 px-1.5 py-1 sm:px-2 sm:py-1.5 bg-white/50 backdrop-blur-sm rounded-md border border-white/30 shadow-sm">
                      <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="h-2 w-2 sm:h-2.5 sm:w-2.5 text-white" />
                      </div>
                      <span className="text-[9px] sm:text-[10px] font-medium text-gray-700 text-left leading-tight truncate">{badge}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Side - Ultra Mobile-Optimized Product Showcase */}
            <div className="relative order-1 lg:order-2">
              {config.featuredProducts && config.featuredProducts[0] && (
                <div className="relative">
                  {/* Main product showcase - Ultra compact for mobile */}
                  <div className="aspect-square bg-gradient-to-br from-white to-gray-50/60 rounded-xl sm:rounded-2xl lg:rounded-3xl p-4 sm:p-6 lg:p-8 flex items-center justify-center shadow-md sm:shadow-xl border border-white/40 backdrop-blur-sm transition-all duration-300">
                    {config.featuredProducts[0].images?.[0] ? (
                      <OptimizedImage
                        src={config.featuredProducts[0].images[0].image_url || images[0].url}
                        alt={config.featuredProducts[0].name}
                        width={300}
                        height={300}
                        className="object-contain max-h-full"
                        priority={true}
                        eager={true}
                      />
                    ) : (
                      <BookOpen className="h-16 w-16 sm:h-24 sm:w-24 lg:h-32 lg:w-32 text-gray-300" />
                    )}
                  </div>
                  
                  {/* Ultra-compact floating discount badge */}
                  <div className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 bg-gradient-to-r from-red-500 to-pink-500 text-white px-2 py-0.5 sm:px-3 sm:py-1 rounded-full font-bold text-xs sm:text-sm shadow-lg">
                    {config.discountBadge?.text || '50% OFF'}
                  </div>
                  
                  {/* Minimal glowing orbs - Only on larger screens for performance */}
                  <div className="hidden sm:block absolute -bottom-2 -left-2 w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur-sm opacity-40"></div>
                  <div className="hidden sm:block absolute top-1/3 -right-4 w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full blur-md opacity-30"></div>
                  
                  {/* Floating review badge - Repositioned for mobile */}
                  <div className="absolute top-4 -left-4 sm:top-6 sm:-left-6 lg:top-8 lg:-left-8 bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl px-2.5 py-2 sm:px-3 sm:py-2.5 lg:px-4 lg:py-3 shadow-lg sm:shadow-xl border border-white/50 group">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-yellow-400 fill-current" />
                        ))}
                      </div>
                      <span className="text-xs sm:text-sm font-semibold text-gray-900">4.9</span>
                    </div>
                    <p className="text-[10px] sm:text-xs text-gray-600 mt-0.5 sm:mt-1">2.5k+ reviews</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Variant 2: Lifestyle & Storytelling
  if (config.variant === 'lifestyle-storytelling') {
    return (
      <section className={cn(
        'relative overflow-hidden py-20 lg:py-28 min-h-screen flex items-center',
        className
      )}>
        {/* Enhanced Background with Parallax Effect */}
        {config.backgroundImage && (
          <div className="absolute inset-0">
            <OptimizedImage
              src={config.backgroundImage}
              alt="Lifestyle background"
              fill
              className="object-cover scale-105"
              priority={true}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/70"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
          </div>
        )}
        
        {/* Atmospheric particles */}
        <div className="absolute inset-0">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-float opacity-30"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${4 + Math.random() * 3}s`
              }}
            >
              <div className="w-1 h-1 bg-white/60 rounded-full"></div>
            </div>
          ))}
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            {/* Left Side - Enhanced Storytelling Content */}
            <div className="space-y-10 text-white">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-6 py-3 text-sm font-medium text-white/90">
                  <div className="w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse"></div>
                  <span>Literary Excellence</span>
                </div>
                
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-light leading-[0.9] tracking-tight">
                  <span className="block text-white/95">{config.title.split(' ').slice(0, 2).join(' ')}</span>
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400">
                    {config.title.split(' ').slice(2).join(' ')}
                  </span>
                </h1>
                <p className="text-2xl md:text-3xl text-white/80 leading-relaxed font-extralight max-w-2xl">
                  {config.subtitle}
                </p>
              </div>
              
              {config.testimonials && config.testimonials[0] && (
                <div className="relative">
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 shadow-2xl">
                    <Quote className="h-8 w-8 text-yellow-400/80 mb-4" />
                    <blockquote className="text-xl italic text-white/90 leading-relaxed mb-6">
                      "{config.testimonials[0].text}"
                    </blockquote>
                    <footer className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">{config.testimonials[0].author.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="text-white font-medium">{config.testimonials[0].author}</p>
                        <div className="flex items-center mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="h-3 w-3 text-yellow-400 fill-current" />
                          ))}
                        </div>
                      </div>
                    </footer>
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-6">
                <Button 
                  size="lg" 
                  className="group relative overflow-hidden bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white px-10 py-6 text-xl font-semibold transition-all duration-500 transform hover:-translate-y-2 shadow-2xl hover:shadow-3xl rounded-full"
                  asChild
                >
                  <Link href={config.primaryCta.href}>
                    <span className="relative z-10 flex items-center">
                      {config.primaryCta.text}
                      <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform duration-300" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </Link>
                </Button>
              </div>
            </div>

            {/* Right Side - Enhanced Lifestyle Image Collage */}
            <div className="grid grid-cols-2 gap-6">
              {config.featuredProducts?.slice(0, 4).map((product, index) => (
                <div 
                  key={product.id} 
                  className={cn(
                    "group relative rounded-3xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-4",
                    index === 0 ? "row-span-2 scale-110" : "",
                    index === 1 ? "col-span-1" : ""
                  )}
                  style={{
                    animationDelay: `${index * 0.2}s`
                  }}
                >
                  <div className={cn(
                    "relative",
                    index === 0 ? "aspect-[4/5]" : "aspect-square"
                  )}>
                    {product.images?.[0] ? (
                      <OptimizedImage
                        src={product.images[0].image_url || images[0].url}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <div className="bg-gradient-to-br from-gray-300 to-gray-400 w-full h-full flex items-center justify-center">
                        <BookOpen className="h-16 w-16 text-gray-500" />
                      </div>
                    )}
                  </div>
                  
                  {/* Enhanced overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
                  
                  {/* Floating content */}
                  <div className="absolute bottom-6 left-6 right-6 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="text-white font-bold text-lg mb-2 line-clamp-2">{product.name}</h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-3 w-3 text-yellow-400 fill-current" />
                        ))}
                        <span className="text-white/80 text-sm ml-2">4.9</span>
                      </div>
                      <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                        <span className="text-white text-sm font-medium">$24.99</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Glowing border effect */}
                  <div className="absolute inset-0 border-2 border-transparent group-hover:border-yellow-400/50 rounded-3xl transition-colors duration-300"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Variant 3: Interactive & Promotional
  if (config.variant === 'interactive-promotional') {
    return (
      <section className={cn(
        'relative overflow-hidden bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 py-20 lg:py-28 min-h-screen flex items-center',
        className
      )}>
        {/* Enhanced animated background */}
        <div className="absolute inset-0">
          {/* Floating geometric shapes */}
          <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-32 right-20 w-96 h-96 bg-gradient-to-br from-pink-400/20 to-purple-500/20 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-1/2 left-1/4 w-48 h-48 bg-gradient-to-br from-blue-400/20 to-cyan-500/20 rounded-full blur-3xl animate-float" style={{animationDelay: '1s'}}></div>
          
          {/* Animated particles */}
          {[...Array(100)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${2 + Math.random() * 4}s`
              }}
            >
              <div className={`w-${Math.random() > 0.5 ? '1' : '2'} h-${Math.random() > 0.5 ? '1' : '2'} bg-white/${Math.random() > 0.5 ? '40' : '60'} rounded-full`}></div>
            </div>
          ))}
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Enhanced Campaign Banner */}
          {config.campaignData && (
            <div className="inline-flex items-center gap-4 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-black px-8 py-4 rounded-full mb-10 font-black text-lg shadow-2xl animate-bounce hover:animate-pulse transition-all duration-300">
              <div className="flex items-center gap-2">
                <Gift className="h-6 w-6 animate-spin" style={{animationDuration: '3s'}} />
                <span className="text-xl">{config.campaignData.title}</span>
              </div>
              {config.campaignData.countdown && (
                <div className="flex items-center gap-2 bg-black/20 rounded-full px-4 py-2">
                  <Timer className="h-5 w-5 animate-pulse" />
                  <span className="font-bold">Limited Time!</span>
                </div>
              )}
            </div>
          )}

          <h1 className="text-6xl md:text-8xl lg:text-9xl font-black mb-10 leading-[0.85]">
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 animate-gradient-shift">
              {config.title.split(' ').slice(0, 2).join(' ')}
            </span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 animate-gradient-shift" style={{animationDelay: '1s'}}>
              {config.title.split(' ').slice(2).join(' ')}
            </span>
          </h1>
          
          <p className="text-2xl md:text-3xl text-white/90 mb-14 max-w-4xl mx-auto leading-relaxed font-light">
            {config.subtitle}
          </p>
          
          {/* Enhanced Interactive CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-8 justify-center mb-20">
            <Button 
              size="lg" 
              className="group relative overflow-hidden bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-black hover:from-red-500 hover:to-pink-600 px-16 py-8 text-2xl font-black shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-110 animate-glow rounded-full"
              asChild
            >
              <Link href={config.primaryCta.href}>
                <span className="relative z-10 flex items-center">
                  <Zap className="mr-4 h-8 w-8 animate-pulse" />
                  {config.primaryCta.text}
                  <ArrowRight className="ml-4 h-8 w-8 group-hover:translate-x-2 transition-transform duration-300" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </Link>
            </Button>
            {config.secondaryCta && (
              <Button 
                size="lg" 
                className="group bg-white/10 backdrop-blur-md border-3 border-white/30 text-white hover:bg-white hover:text-black px-16 py-8 text-2xl font-bold transition-all duration-500 transform hover:scale-105 rounded-full"
                asChild
              >
                <Link href={config.secondaryCta.href}>
                  <Eye className="mr-4 h-8 w-8 group-hover:scale-110 transition-transform duration-300" />
                  {config.secondaryCta.text}
                </Link>
              </Button>
            )}
          </div>

          {/* Enhanced Interactive Product Showcase */}
          {config.featuredProducts && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {config.featuredProducts.slice(0, 4).map((product, index) => (
                <div 
                  key={product.id} 
                  className="group relative bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-500 transform hover:-translate-y-6 hover:rotate-2 cursor-pointer shadow-2xl hover:shadow-3xl"
                  style={{
                    animationDelay: `${index * 0.2}s`
                  }}
                >
                  <div className="aspect-[3/4] bg-gradient-to-br from-white/10 to-white/5 rounded-2xl mb-6 overflow-hidden relative">
                    {product.images?.[0] ? (
                      <OptimizedImage
                        src={product.images[0].image_url || images[0].url}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-125 transition-transform duration-700"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <BookOpen className="h-16 w-16 text-white/40 group-hover:text-white/60 transition-colors duration-300" />
                      </div>
                    )}
                    
                    {/* Glowing overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-yellow-400/20 via-transparent to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </div>
                  
                  <h3 className="text-white font-bold text-lg mb-3 line-clamp-2 group-hover:text-yellow-300 transition-colors duration-300">{product.name}</h3>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">$19.99</span>
                      <span className="text-white/60 line-through text-sm">$39.99</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MousePointer className="h-5 w-5 text-white/60 group-hover:text-yellow-400 transition-colors duration-300 animate-bounce" />
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  
                  {/* Interactive elements */}
                  <div className="absolute -top-3 -right-3 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                    50% OFF
                  </div>
                  
                  {/* Glowing border effect */}
                  <div className="absolute inset-0 border-2 border-transparent group-hover:border-yellow-400/50 rounded-3xl transition-colors duration-300"></div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    );
  }

  // Variant 4: Category Grid Hero
  if (config.variant === 'category-grid') {
    return (
      <section className={cn(
        'relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50/30 py-20 lg:py-28',
        className
      )}>
        {/* Enhanced background with geometric patterns */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full opacity-[0.03]">
            <div className="absolute inset-0" style={{
              backgroundImage: `conic-gradient(from 0deg, transparent, rgba(0,0,0,0.1), transparent)`,
              backgroundSize: '60px 60px'
            }}></div>
          </div>
          
          {/* Floating shapes */}
          <div className="absolute top-20 right-20 w-40 h-40 bg-gradient-to-br from-blue-100/60 to-purple-100/60 rounded-full blur-2xl animate-float"></div>
          <div className="absolute bottom-32 left-16 w-32 h-32 bg-gradient-to-br from-pink-100/60 to-orange-100/60 rounded-full blur-2xl animate-float" style={{animationDelay: '2s'}}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Enhanced Header */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100/50 rounded-full px-6 py-3 text-sm font-semibold text-blue-700 shadow-sm mb-8">
              <Grid3X3 className="h-4 w-4" />
              <span>Curated Collections</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 leading-[0.9] tracking-tight mb-8">
              {config.title}
            </h1>
            <p className="text-2xl md:text-3xl text-gray-600 max-w-4xl mx-auto mb-12 leading-relaxed font-light">
              {config.subtitle}
            </p>
            <Button 
              size="lg" 
              className="group relative overflow-hidden bg-gradient-to-r from-gray-900 to-blue-900 hover:from-blue-900 hover:to-purple-900 text-white px-12 py-6 text-xl font-bold shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-1 rounded-full"
              asChild
            >
              <Link href={config.primaryCta.href}>
                <span className="relative z-10 flex items-center">
                  {config.primaryCta.text}
                  <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </Link>
            </Button>
          </div>

          {/* Enhanced Category Grid */}
          {config.categories && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {config.categories.map((category, index) => (
                <Link 
                  key={category.id} 
                  href={category.href}
                  className="group block"
                  style={{
                    animationDelay: `${index * 0.1}s`
                  }}
                >
                  <div className="relative overflow-hidden rounded-3xl bg-white shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-6 hover:rotate-1 group-hover:scale-105">
                    <div className="aspect-square relative">
                      <OptimizedImage
                        src={category.image}
                        alt={category.name}
                        fill
                        className="object-cover group-hover:scale-125 transition-transform duration-700"
                      />
                      
                      {/* Enhanced overlays */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-transparent to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      
                      {/* Floating count badge */}
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-bold text-gray-900 shadow-lg">
                        {Math.floor(Math.random() * 500) + 100}+ books
                      </div>
                    </div>
                    
                    {/* Enhanced content */}
                    <div className="absolute bottom-6 left-6 right-6 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                      <h3 className="text-white font-black text-2xl mb-3 group-hover:text-yellow-300 transition-colors duration-300">{category.name}</h3>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-white/90 group-hover:text-white transition-colors duration-300">
                          <Grid3X3 className="h-5 w-5 mr-2 group-hover:rotate-180 transition-transform duration-500" />
                          <span className="text-sm font-medium">Explore Collection</span>
                        </div>
                        <ArrowRight className="h-5 w-5 text-white/70 group-hover:text-yellow-300 group-hover:translate-x-1 transition-all duration-300" />
                      </div>
                    </div>
                    
                    {/* Glowing border effect */}
                    <div className="absolute inset-0 border-3 border-transparent group-hover:border-blue-400/50 rounded-3xl transition-colors duration-300"></div>
                    
                    {/* Subtle animation indicators */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 border-2 border-white/30 rounded-full opacity-0 group-hover:opacity-100 group-hover:scale-150 transition-all duration-500"></div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    );
  }

  // Variant 5: Seasonal/Campaign Hero
  if (config.variant === 'seasonal-campaign') {
    return (
      <section className={cn(
        'relative overflow-hidden py-20 lg:py-28 min-h-screen flex items-center',
        className
      )}>
        {/* Enhanced Seasonal Background */}
        {config.backgroundImage && (
          <div className="absolute inset-0">
            <OptimizedImage
              src={config.backgroundImage}
              alt="Seasonal background"
              fill
              className="object-cover scale-105"
              priority={true}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-red-900/70 via-green-900/60 to-red-800/80"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40"></div>
          </div>
        )}
        
        {/* Festive floating elements */}
        <div className="absolute inset-0">
          {/* Snowflakes/particles */}
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-float opacity-60"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${5 + Math.random() * 3}s`
              }}
            >
              <div className="w-2 h-2 bg-white/80 rounded-full"></div>
            </div>
          ))}
          
          {/* Glowing orbs */}
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-br from-yellow-400/30 to-red-500/30 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-gradient-to-br from-green-400/30 to-emerald-500/30 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Enhanced Campaign Badge */}
            {config.campaignData && (
              <div className="inline-flex items-center gap-4 bg-gradient-to-r from-red-500 via-green-500 to-red-600 text-white px-10 py-5 rounded-full mb-12 font-black text-xl shadow-2xl animate-bounce hover:animate-pulse transition-all duration-300">
                <div className="flex items-center gap-3">
                  <Calendar className="h-8 w-8 animate-spin" style={{animationDuration: '4s'}} />
                  <span className="text-2xl">{config.campaignData.title}</span>
                  <Gift className="h-8 w-8 animate-bounce" />
                </div>
              </div>
            )}

            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black mb-10 leading-[0.85]">
              <span className="block text-white drop-shadow-2xl">
                {config.title.split(' ').slice(0, 2).join(' ')}
              </span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-red-400 to-green-400 animate-gradient-shift drop-shadow-2xl">
                {config.title.split(' ').slice(2).join(' ')}
              </span>
            </h1>
            
            <p className="text-2xl md:text-3xl text-white/95 mb-16 max-w-4xl mx-auto leading-relaxed font-light drop-shadow-lg">
              {config.subtitle}
            </p>
            
            {/* Enhanced Countdown Timer */}
            {config.campaignData?.countdown && (
              <div className="flex justify-center items-center gap-6 mb-16">
                {[
                  { value: '23', label: 'DAYS' },
                  { value: '12', label: 'HRS' },
                  { value: '45', label: 'MIN' },
                  { value: '32', label: 'SEC' }
                ].map((time, index) => (
                  <div key={time.label} className="group">
                    <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-3xl px-8 py-6 text-center shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-110">
                      <div className="text-4xl md:text-5xl font-black text-white mb-2 group-hover:text-yellow-300 transition-colors duration-300">
                        {time.value}
                      </div>
                      <div className="text-white/90 text-sm font-bold tracking-wider">
                        {time.label}
                      </div>
                    </div>
                    {index < 3 && (
                      <div className="text-white/60 text-3xl font-bold mx-2 animate-pulse">:</div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-8 justify-center">
              <Button 
                size="lg" 
                className="group relative overflow-hidden bg-gradient-to-r from-yellow-400 via-red-500 to-green-500 text-black hover:from-green-500 hover:to-red-600 px-16 py-8 text-2xl font-black shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-110 animate-glow rounded-full"
                asChild
              >
                <Link href={config.primaryCta.href}>
                  <span className="relative z-10 flex items-center">
                    <Gift className="mr-4 h-8 w-8 animate-bounce" />
                    {config.primaryCta.text}
                    <ArrowRight className="ml-4 h-8 w-8 group-hover:translate-x-2 transition-transform duration-300" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </Link>
              </Button>
            </div>
            
            {/* Festive decorative elements */}
            <div className="absolute top-20 left-20 text-6xl animate-bounce" style={{animationDelay: '1s'}}>🎄</div>
            <div className="absolute top-32 right-20 text-5xl animate-bounce" style={{animationDelay: '2s'}}>⭐</div>
            <div className="absolute bottom-20 left-32 text-4xl animate-bounce" style={{animationDelay: '3s'}}>🎁</div>
            <div className="absolute bottom-32 right-32 text-5xl animate-bounce" style={{animationDelay: '4s'}}>❄️</div>
          </div>
        </div>
      </section>
    );
  }

  // Variant 6: Product Highlight with Features
  if (config.variant === 'product-highlight') {
    return (
      <section className={cn(
        'relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 py-20 lg:py-28',
        className
      )}>
        {/* Enhanced background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-blue-200/40 to-purple-300/40 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 left-20 w-48 h-48 bg-gradient-to-br from-pink-200/40 to-orange-300/40 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
          
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 opacity-[0.02]">
            <div className="absolute inset-0" style={{
              backgroundImage: `linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)`,
              backgroundSize: '20px 20px'
            }}></div>
          </div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            {/* Left Side - Enhanced Product Showcase */}
            <div className="relative order-2 lg:order-1">
              {config.featuredProducts?.[0] && (
                <div className="relative group">
                  {/* Main product container */}
                  <div className="aspect-square bg-gradient-to-br from-white via-white to-blue-50/30 rounded-[3rem] p-12 shadow-2xl border border-white/60 backdrop-blur-sm hover:shadow-3xl transition-all duration-700 group-hover:scale-105">
                    {config.featuredProducts[0].images?.[0] ? (
                      <OptimizedImage
                        src={config.featuredProducts[0].images[0].image_url || images[0].url}
                        alt={config.featuredProducts[0].name}
                        fill
                        className="object-contain p-8 group-hover:scale-110 transition-transform duration-700"
                        priority={true}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <BookOpen className="h-40 w-40 text-gray-300 group-hover:text-gray-400 transition-colors duration-300" />
                      </div>
                    )}
                  </div>
                  
                  {/* Enhanced floating badges */}
                  <div className="absolute -top-6 -right-6 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white px-6 py-3 rounded-full font-black text-xl shadow-2xl animate-bounce hover:animate-pulse transform hover:scale-110 transition-transform duration-300">
                    🏆 Bestseller
                  </div>
                  <div className="absolute -bottom-6 -left-6 bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 text-white px-6 py-3 rounded-full font-black text-lg shadow-2xl">
                    <div className="flex items-center gap-2">
                      <Star className="h-5 w-5 fill-current" />
                      <span>4.9 Rated</span>
                    </div>
                  </div>
                  
                  {/* Glowing orbs */}
                  <div className="absolute top-1/4 -left-8 w-16 h-16 bg-gradient-to-br from-blue-400/60 to-purple-500/60 rounded-full blur-xl animate-pulse"></div>
                  <div className="absolute bottom-1/4 -right-8 w-12 h-12 bg-gradient-to-br from-pink-400/60 to-orange-500/60 rounded-full blur-lg animate-pulse" style={{animationDelay: '1s'}}></div>
                  
                  {/* Interactive elements */}
                  <div className="absolute top-8 left-8 bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-xl border border-white/50">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="font-semibold text-gray-900">In Stock</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Side - Enhanced Features & Content */}
            <div className="order-1 lg:order-2 space-y-10">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100/50 rounded-full px-6 py-3 text-sm font-bold text-purple-700 shadow-sm">
                  <Award className="h-4 w-4" />
                  <span>Featured Product</span>
                </div>
                
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 leading-[0.9] tracking-tight">
                  {config.title}
                </h1>
                <p className="text-2xl md:text-3xl text-gray-600 leading-relaxed font-light">
                  {config.subtitle}
                </p>
              </div>
              
              {/* Enhanced Features List */}
              {config.features && (
                <div className="grid gap-6">
                  {config.features.map((feature, index) => (
                    <div 
                      key={index} 
                      className="group flex items-start gap-6 p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/40 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                      style={{
                        animationDelay: `${index * 0.1}s`
                      }}
                    >
                      <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                        {getIconComponent(feature.icon) && (
                          React.createElement(getIconComponent(feature.icon), {
                            className: "h-8 w-8 text-white"
                          })
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-black text-xl text-gray-900 mb-2 group-hover:text-blue-700 transition-colors duration-300">{feature.title}</h3>
                        <p className="text-lg text-gray-600 leading-relaxed">{feature.description}</p>
                      </div>
                      <ArrowRight className="h-6 w-6 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-300" />
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row items-start gap-6">
                <Button 
                  size="lg" 
                  className="group relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-pink-600 hover:to-blue-600 text-white px-12 py-6 text-xl font-bold shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-1 rounded-full"
                  asChild
                >
                  <Link href={config.primaryCta.href}>
                    <span className="relative z-10 flex items-center">
                      {config.primaryCta.text}
                      <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform duration-300" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </Link>
                </Button>
                {config.secondaryCta && (
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="border-3 border-gray-200 hover:border-purple-400 hover:bg-purple-50 px-12 py-6 text-xl font-medium transition-all duration-300 rounded-full"
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

  // Variant 7: Modern Video Hero
  if (config.variant === 'video-hero') {
    return (
      <section className={cn(
        'relative overflow-hidden h-screen flex items-center',
        className
      )}>
        {/* Enhanced Video Background */}
        {config.videoUrl ? (
          <div className="absolute inset-0">
            <video
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover scale-105"
            >
              <source src={config.videoUrl} type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/70"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30"></div>
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-800">
            {/* Fallback animated background */}
            <div className="absolute inset-0">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="absolute animate-float opacity-20"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 5}s`,
                    animationDuration: `${4 + Math.random() * 3}s`
                  }}
                >
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Cinematic overlay effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/50 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/50 to-transparent"></div>
          <div className="absolute top-0 bottom-0 left-0 w-32 bg-gradient-to-r from-black/30 to-transparent"></div>
          <div className="absolute top-0 bottom-0 right-0 w-32 bg-gradient-to-l from-black/30 to-transparent"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Cinematic badge */}
          <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-6 py-3 text-sm font-bold text-white/90 shadow-xl mb-8">
            <PlayCircle className="h-5 w-5 animate-pulse" />
            <span>Watch Our Story</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-white mb-10 leading-[0.85] tracking-tight">
            <span className="block drop-shadow-2xl animate-slide-up">
              {config.title.split(' ').slice(0, 2).join(' ')}
            </span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 animate-gradient-shift drop-shadow-2xl" style={{animationDelay: '0.3s'}}>
              {config.title.split(' ').slice(2).join(' ')}
            </span>
          </h1>
          
          <p className="text-2xl md:text-3xl text-white/95 mb-16 max-w-4xl mx-auto leading-relaxed font-light drop-shadow-lg animate-slide-up" style={{animationDelay: '0.6s'}}>
            {config.subtitle}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-8 justify-center animate-slide-up" style={{animationDelay: '0.9s'}}>
            <Button 
              size="lg" 
              className="group relative overflow-hidden bg-white/95 text-black hover:bg-white px-16 py-8 text-2xl font-black shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-110 rounded-full"
              asChild
            >
              <Link href={config.primaryCta.href}>
                <span className="relative z-10 flex items-center">
                  <PlayCircle className="mr-4 h-8 w-8 group-hover:scale-125 transition-transform duration-300" />
                  {config.primaryCta.text}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </Link>
            </Button>
            {config.secondaryCta && (
              <Button 
                size="lg" 
                variant="outline" 
                className="group border-3 border-white/60 text-white hover:bg-white hover:text-black px-16 py-8 text-2xl font-bold transition-all duration-500 transform hover:scale-105 rounded-full backdrop-blur-sm"
                asChild
              >
                <Link href={config.secondaryCta.href}>
                  <span className="flex items-center">
                    {config.secondaryCta.text}
                    <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform duration-300" />
                  </span>
                </Link>
              </Button>
            )}
          </div>
        </div>
        
        {/* Enhanced scroll indicator */}
        <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2">
          <div className="flex flex-col items-center gap-3 animate-bounce-soft">
            <div className="w-8 h-12 border-2 border-white/60 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-white/80 rounded-full mt-2 animate-pulse"></div>
            </div>
            <span className="text-white/70 text-sm font-medium">Scroll</span>
          </div>
        </div>
        
        {/* Play button overlay for video */}
        {config.videoUrl && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative">
              <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30 shadow-2xl animate-pulse">
                <PlayCircle className="h-12 w-12 text-white" />
              </div>
              <div className="absolute inset-0 rounded-full border-2 border-white/20 animate-ping"></div>
            </div>
          </div>
        )}
      </section>
    );
  }

  // Variant 8: Interactive Try-On/Demo
  if (config.variant === 'interactive-tryOn') {
    return (
      <section className={cn(
        'relative bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 py-16 lg:py-20',
        className
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              {config.title}
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              {config.subtitle}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Interactive Demo Area */}
            <div className="relative">
              <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100">
                <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl mb-6 flex items-center justify-center relative overflow-hidden">
                  {config.featuredProducts?.[0]?.images?.[0] ? (
                    <OptimizedImage
                      src={config.featuredProducts[0].images[0].image_url || images[0].url}
                      alt={config.featuredProducts[0].name}
                      fill
                      className="object-contain"
                    />
                  ) : (
                    <div className="text-center">
                      <Camera className="h-16 w-16 text-gray-400 mb-4 mx-auto" />
                      <p className="text-gray-500">Interactive Demo</p>
                    </div>
                  )}
                  
                  {/* Interactive overlay */}
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/5 transition-colors cursor-pointer flex items-center justify-center">
                    <div className="bg-white/90 backdrop-blur-sm rounded-full p-4 opacity-0 hover:opacity-100 transition-opacity">
                      <MousePointer className="h-8 w-8 text-gray-700" />
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-center gap-4">
                  <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                    <Eye className="mr-2 h-4 w-4" />
                    Preview
                  </Button>
                  <Button variant="outline">
                    <Camera className="mr-2 h-4 w-4" />
                    Try Demo
                  </Button>
                </div>
              </div>
            </div>

            {/* Content & Features */}
            <div className="space-y-8">
              {config.features && (
                <div className="grid grid-cols-2 gap-6">
                  {config.features.slice(0, 4).map((feature, index) => (
                    <div key={index} className="text-center p-6 bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                        {getIconComponent(feature.icon) && (
                          React.createElement(getIconComponent(feature.icon), {
                            className: "h-6 w-6 text-white"
                          })
                        )}
                      </div>
                      <h3 className="font-bold text-gray-900 mb-2">{feature.title}</h3>
                      <p className="text-sm text-gray-600">{feature.description}</p>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex items-center gap-4">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 text-lg font-medium shadow-xl"
                  asChild
                >
                  <Link href={config.primaryCta.href}>
                    {config.primaryCta.text}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Variant 9: Editorial Magazine Style
  if (config.variant === 'editorial-magazine') {
    return (
      <section className={cn(
        'relative bg-white py-16 lg:py-20',
        className
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Magazine Header */}
          <div className="border-b border-gray-200 pb-8 mb-16">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-wider text-gray-500 mb-2">Featured Collection</p>
                <h1 className="text-5xl md:text-7xl font-light text-gray-900 leading-tight">
                  {config.title}
                </h1>
              </div>
              <div className="text-right">
                <p className="text-lg text-gray-600">{new Date().getFullYear()}</p>
                <p className="text-sm text-gray-500">Issue #01</p>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-8">
              <div className="grid gap-8">
                {/* Hero Article */}
                {config.featuredProducts?.[0] && (
                  <article className="grid md:grid-cols-2 gap-8 items-center">
                    <div className="aspect-[4/5] bg-gray-100 rounded-lg overflow-hidden">
                      {config.featuredProducts[0].images?.[0] ? (
                        <OptimizedImage
                          src={config.featuredProducts[0].images[0].image_url || images[0].url}
                          alt={config.featuredProducts[0].name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <BookOpen className="h-16 w-16 text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm uppercase tracking-wider text-gray-500 mb-3">Featured</p>
                      <h2 className="text-3xl font-light text-gray-900 mb-4 leading-tight">
                        {config.featuredProducts[0].name}
                      </h2>
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        {config.subtitle}
                      </p>
                      <Button 
                        className="bg-black hover:bg-gray-800 text-white"
                        asChild
                      >
                        <Link href={config.primaryCta.href}>
                          {config.primaryCta.text}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </article>
                )}

                {/* Secondary Articles */}
                <div className="grid md:grid-cols-2 gap-8 pt-8 border-t border-gray-200">
                  {config.featuredProducts?.slice(1, 3).map((product, index) => (
                    <article key={product.id} className="space-y-4">
                      <div className="aspect-[3/2] bg-gray-100 rounded-lg overflow-hidden">
                        {product.images?.[0] ? (
                          <OptimizedImage
                            src={product.images[0].image_url || images[0].url}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <BookOpen className="h-12 w-12 text-gray-300" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">Collection</p>
                        <h3 className="text-xl font-light text-gray-900 mb-2">{product.name}</h3>
                        <p className="text-sm text-gray-600">Discover the latest in our curated collection...</p>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-4">
              <div className="sticky top-8 space-y-8">
                {/* Stats */}
                {config.stats && (
                  <div className="border border-gray-200 rounded-lg p-6">
                    <h3 className="text-sm uppercase tracking-wider text-gray-500 mb-4">By the Numbers</h3>
                    <div className="space-y-4">
                      {config.stats.map((stat, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-gray-600">{stat.label}</span>
                          <span className="font-bold text-gray-900">{stat.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Testimonial */}
                {config.testimonials?.[0] && (
                  <div className="border-l-4 border-gray-900 pl-6">
                    <blockquote className="text-lg italic text-gray-700 mb-4">
                      "{config.testimonials[0].text}"
                    </blockquote>
                    <cite className="text-sm text-gray-500 not-italic">
                      — {config.testimonials[0].author}
                    </cite>
                  </div>
                )}

                {/* CTA */}
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Start Reading Today</h3>
                  <Button className="w-full bg-black hover:bg-gray-800 text-white" asChild>
                    <Link href={config.primaryCta.href}>
                      {config.primaryCta.text}
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Default fallback
  if (config.variant === 'classic') {
    return (
      <section className={cn(
        'relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 lg:py-12',
        className
      )}>
        {/* Background decorations */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-indigo-300/10 to-purple-300/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Content */}
            <div className="space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-sm font-medium shadow-lg">
                <Sparkles className="h-4 w-4 text-yellow-500" />
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Limited Time Offers
                </span>
              </div>

              <div className="space-y-4">
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight">
                  <span className="block text-gray-900">Books That</span>
                  <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    Change Lives
                  </span>
                </h1>
                <p className="text-lg text-gray-600 max-w-lg">
                  From bestsellers to hidden gems. Find your next great read with fast delivery and unbeatable prices.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                  asChild
                >
                  <Link href={config.primaryCta.href}>
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Shop Books
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                {config.secondaryCta && (
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="border-2 border-gray-300 hover:border-purple-300 hover:bg-purple-50 transition-all duration-300"
                    asChild
                  >
                    <Link href={config.secondaryCta.href}>
                      View Categories
                    </Link>
                  </Button>
                )}
              </div>
            </div>

            {/* Visual */}
            <div className="relative">
              {/* Main showcase */}
              <div className="relative">
                {/* Floating cards */}
                <div className="grid grid-cols-2 gap-4 relative z-10">
                  {config.featuredProducts?.slice(0, 4).map((book, index) => (
                    <div 
                      key={book.id} 
                      className={`
                        group bg-white rounded-2xl shadow-2xl p-4 border border-white/20 backdrop-blur-sm
                        hover:shadow-3xl transition-all duration-500 hover:-translate-y-2
                        ${index === 0 ? 'transform translate-y-8' : ''}
                        ${index === 1 ? 'transform -translate-y-4' : ''}
                        ${index === 2 ? 'transform translate-y-4' : ''}
                        ${index === 3 ? 'transform -translate-y-8' : ''}
                      `}
                    >
                      <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden mb-3 relative">
                        {book.images && book.images.length > 0 ? (
                          <OptimizedImage
                            src={book.images[0].image_url || images[0].url}
                            alt={book.name}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <BookOpen className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 rounded-xl"></div>
                        
                        {/* Price badge */}
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-white/90 text-gray-900 shadow-md">
                            $19.99
                          </Badge>
                        </div>
                      </div>
                      <h4 className="font-semibold text-gray-900 text-sm line-clamp-1 mb-1">
                        {book.name}
                      </h4>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="h-3 w-3 text-yellow-400 fill-current" />
                          ))}
                        </div>
                        <Heart className="h-4 w-4 text-gray-400 hover:text-red-500 cursor-pointer transition-colors" />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Floating elements */}
                <div className="absolute -top-4 -right-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-3 rounded-full shadow-xl animate-bounce">
                  <Sparkles className="h-6 w-6" />
                </div>
                
                <div className="absolute -bottom-6 -left-6 bg-gradient-to-r from-green-400 to-blue-500 text-white px-4 py-2 rounded-full shadow-xl">
                  <span className="text-sm font-bold">50% OFF</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (config.variant === 'modern') {
    return (
      <section className={cn(
        'relative overflow-hidden py-12 lg:py-16',
        className
      )}>
        {/* Dynamic background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"></div>
        
        {/* Animated background patterns */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${3 + Math.random() * 2}s`
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
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3 mb-8">
              <Sparkles className="h-4 w-4 text-yellow-400" />
              <span className="text-white/90 text-sm font-medium">Featured Collection 2024</span>
              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs px-2 py-1">
                NEW
              </Badge>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              <span className="block">Best Books,</span>
              <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Best Prices
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl mx-auto leading-relaxed">
              Premium book collection with fast shipping and unbeatable deals. Start reading today.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1"
                asChild
              >
                <Link href={config.primaryCta.href}>
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  Shop Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              {config.secondaryCta && (
                <Button 
                  size="lg" 
                  className="bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 px-8 py-4 text-lg transition-all duration-300"
                  asChild
                >
                  <Link href={config.secondaryCta.href}>
                    <PlayCircle className="mr-2 h-5 w-5" />
                    Browse All
                  </Link>
                </Button>
              )}
            </div>

            {config.stats && config.stats.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 pt-12 border-t border-white/10">
                {config.stats.map((stat, index) => (
                  <div key={index} className="text-center group">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
                      {getIconComponent(stat.icon) && (
                        React.createElement(getIconComponent(stat.icon), {
                          className: "h-6 w-6 text-white"
                        })
                      )}
                    </div>
                    <div className="text-4xl font-bold text-white mb-2">{stat.value}</div>
                    <div className="text-white/60 text-sm uppercase tracking-wider">{stat.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  // Minimal variant
  return (
    <section className={cn(
      'relative bg-gradient-to-b from-white to-gray-50/50 py-12 md:py-16',
      className
    )}>
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,0,0,0.1) 1px, transparent 0)`,
          backgroundSize: '20px 20px'
        }}></div>
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Elegant badge */}
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full px-6 py-2 text-sm font-medium text-gray-700 mb-8 shadow-sm border border-gray-200/50">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Premium Book Collection</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
          <span className="block text-gray-900 mb-2">Quality Books</span>
          <span className="block relative">
            <span className="relative z-10 bg-gradient-to-r from-gray-700 via-gray-800 to-gray-900 bg-clip-text text-transparent">
              Great Prices
            </span>
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-3/4 h-3 bg-gradient-to-r from-blue-200 to-purple-200 rounded-full opacity-50"></div>
          </span>
        </h1>
        
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
          Curated collection of bestsellers and classics. Free shipping, easy returns, and unbeatable customer service.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black text-white shadow-xl hover:shadow-2xl transition-all duration-300 px-8 py-4"
            asChild
          >
            <Link href={config.primaryCta.href}>
              <ShoppingBag className="mr-2 h-5 w-5" />
              Start Shopping
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          {config.secondaryCta && (
            <Button 
              variant="outline" 
              size="lg" 
              className="border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 px-8 py-4 transition-all duration-300"
              asChild
            >
              <Link href={config.secondaryCta.href}>
                View All Books
              </Link>
            </Button>
          )}
        </div>

        {/* Elegant book showcase */}
        {config.featuredProducts && config.featuredProducts.length > 0 && (
          <div className="relative mb-8">
            <div className="flex justify-center items-end space-x-3">
              {config.featuredProducts.slice(0, 7).map((book, index) => (
                <div 
                  key={book.id} 
                  className={`
                    bg-white rounded-lg shadow-lg border border-gray-200/50 p-2 hover:shadow-xl transition-all duration-300 hover:-translate-y-1
                    ${index === 3 ? 'w-20 h-28 scale-110' : 'w-16 h-24'}
                    ${index < 3 ? `transform translate-y-${(3-index) * 2}` : ''}
                    ${index > 3 ? `transform translate-y-${(index-3) * 2}` : ''}
                  `}
                >
                  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded overflow-hidden">
                    {book.images && book.images.length > 0 ? (
                      <OptimizedImage
                        src={book.images[0].image_url || images[0].url}
                        alt={book.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <BookOpen className="h-4 w-4 text-gray-400" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Floating elements */}
            <div className="absolute -top-2 left-1/4 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-bold shadow-lg animate-bounce">
              Best Seller
            </div>
            <div className="absolute -bottom-2 right-1/4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
              Free Shipping
            </div>
          </div>
        )}

        {config.stats && config.stats.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-12 border-t border-gray-200">
            {config.stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mb-3 group-hover:scale-110 transition-transform duration-300">
                  {getIconComponent(stat.icon) && (
                    React.createElement(getIconComponent(stat.icon), {
                      className: "h-5 w-5 text-gray-600"
                    })
                  )}
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-500 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Trust indicators */}
        <div className="flex justify-center items-center space-x-8 mt-16 opacity-60">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Shield className="h-4 w-4" />
            <span>Secure Checkout</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Truck className="h-4 w-4" />
            <span>Fast Delivery</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Star className="h-4 w-4" />
            <span>5-Star Reviews</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;