'use client';

import React, { useState, useEffect } from 'react';
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
  Shield,
  CheckCircle,
  Quote,
  Gift,
  Timer,
  Zap,
  Eye,
  MousePointer,
  Calendar,
  PlayCircle,
  Camera,
  ShoppingBag,
  Heart,
  Sparkles,
  Grid3x3
} from 'lucide-react';
import { Product } from '@/types';
import type { LucideIcon } from 'lucide-react';
import { seededRandom, seededRandomFloat, seededRandomInt } from '@/lib/seeded-random';

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
  variant: 'minimal-product' | 'lifestyle-storytelling' | 'interactive-promotional' | 'category-grid' | 'seasonal-campaign' | 'product-highlight' | 'video-hero' | 'interactive-tryOn' | 'editorial-magazine' | 'modern' | 'classic';
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
  const [particles, setParticles] = useState<{
    interactivePromotional: Array<{
      id: number;
      left: string;
      top: string;
      animationDelay: string;
      animationDuration: string;
      width: string;
      height: string;
      opacity: string;
    }>;
    lifestyleStorytelling: Array<{
      id: number;
      left: string;
      top: string;
      animationDelay: string;
      animationDuration: string;
    }>;
    seasonalCampaign: Array<{
      id: number;
      left: string;
      top: string;
      animationDelay: string;
      animationDuration: string;
    }>;
    videoHero: Array<{
      id: number;
      left: string;
      top: string;
      animationDelay: string;
      animationDuration: string;
    }>;
    modern: Array<{
      id: number;
      left: string;
      top: string;
      animationDelay: string;
      animationDuration: string;
    }>;
  }>({
    interactivePromotional: [],
    lifestyleStorytelling: [],
    seasonalCampaign: [],
    videoHero: [],
    modern: []
  });

  const getIconComponent = (iconName?: string) => {
    if (!iconName) return BookOpen;

    // Use the iconMap for loaded icons, fallback to BookOpen
    return iconMap[iconName] || BookOpen;
  };

  // Generate particles on client side only to prevent hydration mismatch
  useEffect(() => {
    if (config.variant === 'interactive-promotional') {
      const generatedParticles = [...Array(30)].map((_, i) => ({
        id: i,
        left: `${seededRandom() * 100}%`,
        top: `${seededRandom() * 100}%`,
        animationDelay: `${seededRandom() * 5}s`,
        animationDuration: `${2 + seededRandom() * 4}s`,
        width: seededRandom() > 0.5 ? 'w-1' : 'w-2',
        height: seededRandom() > 0.5 ? 'h-1' : 'h-2',
        opacity: seededRandom() > 0.5 ? 'bg-white/40' : 'bg-white/60'
      }));
      setParticles(prev => ({ ...prev, interactivePromotional: generatedParticles }));
    } else if (config.variant === 'lifestyle-storytelling') {
      const generatedParticles = [...Array(30)].map((_, i) => ({
        id: i,
        left: `${seededRandom() * 100}%`,
        top: `${seededRandom() * 100}%`,
        animationDelay: `${seededRandom() * 5}s`,
        animationDuration: `${4 + seededRandom() * 3}s`
      }));
      setParticles(prev => ({ ...prev, lifestyleStorytelling: generatedParticles }));
    } else if (config.variant === 'seasonal-campaign') {
      const generatedParticles = [...Array(20)].map((_, i) => ({
        id: i,
        left: `${seededRandom() * 100}%`,
        top: `${seededRandom() * 100}%`,
        animationDelay: `${seededRandom() * 5}s`,
        animationDuration: `${5 + seededRandom() * 3}s`
      }));
      setParticles(prev => ({ ...prev, seasonalCampaign: generatedParticles }));
    } else if (config.variant === 'video-hero' && !config.videoUrl) {
      // Only generate for video-hero when there's no video (fallback case)
      const generatedParticles = [...Array(20)].map((_, i) => ({
        id: i,
        left: `${seededRandom() * 100}%`,
        top: `${seededRandom() * 100}%`,
        animationDelay: `${seededRandom() * 5}s`,
        animationDuration: `${4 + seededRandom() * 3}s`
      }));
      setParticles(prev => ({ ...prev, videoHero: generatedParticles }));
    } else if (config.variant === 'modern') {
      const generatedParticles = [...Array(20)].map((_, i) => ({
        id: i,
        left: `${seededRandom() * 100}%`,
        top: `${seededRandom() * 100}%`,
        animationDelay: `${seededRandom() * 3}s`,
        animationDuration: `${3 + seededRandom() * 2}s`
      }));
      setParticles(prev => ({ ...prev, modern: generatedParticles }));
    }
  }, [config.variant, config.videoUrl]);

  // Variant 1: Minimal & Product-Focused - Ultra Compact Professional
  if (config.variant === 'minimal-product') {
    return (
      <section className={cn(
        'relative overflow-hidden bg-white py-4 sm:py-6 md:py-8',
        className
      )}>
        {/* Clean minimal background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-white"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-5 gap-4 md:gap-6 items-center">
            {/* Left Side - Content */}
            <div className="md:col-span-3 space-y-3 md:space-y-4">
              {/* Badge */}
              <div className="inline-flex items-center gap-1.5 bg-blue-50 rounded-full px-3 py-1 text-xs font-medium text-blue-700">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                <span>Premium Books</span>
              </div>
              
              {/* Title */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                {config.title}
              </h1>
              
              {/* Subtitle */}
              <p className="text-sm md:text-base text-gray-600 leading-relaxed max-w-xl">
                {config.subtitle}
              </p>
              
              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-2">
                <Button 
                  className="bg-gray-900 hover:bg-gray-800 text-white px-5 py-2 text-sm"
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
                    className="px-5 py-2 text-sm"
                    asChild
                  >
                    <Link href={config.secondaryCta.href}>
                      {config.secondaryCta.text}
                    </Link>
                  </Button>
                )}
              </div>

              {/* Trust Badges - Compact */}
              {config.trustBadges && config.trustBadges.length > 0 && (
                <div className="flex flex-wrap gap-3 pt-3 border-t">
                  {config.trustBadges.slice(0, 3).map((badge, index) => (
                    <div key={index} className="flex items-center gap-1.5 text-xs text-gray-600">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>{badge}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Side - Product Image */}
            <div className="md:col-span-2">
              {config.featuredProducts && config.featuredProducts[0] && (
                <div className="relative">
                  <div className="aspect-square bg-gray-50 rounded-xl p-6 flex items-center justify-center border shadow-sm">
                    {config.featuredProducts[0].images?.[0] ? (
                      <OptimizedImage
                        src={config.featuredProducts[0].images[0].image_url}
                        alt={config.featuredProducts[0].name}
                        width={280}
                        height={280}
                        className="object-contain"
                        priority={true}
                      />
                    ) : (
                      <BookOpen className="h-24 w-24 text-gray-300" />
                    )}
                  </div>
                  
                  {/* Discount badge */}
                  {config.discountBadge && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-2.5 py-1 rounded-lg font-semibold text-xs shadow">
                      {config.discountBadge.text}
                    </div>
                  )}
                  
                  {/* Rating badge */}
                  <div className="absolute bottom-2 left-2 bg-white rounded-lg px-3 py-1.5 shadow-md flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-3 w-3 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <span className="text-xs font-semibold">4.9</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Variant 2: Lifestyle & Storytelling - Compact Professional
  if (config.variant === 'lifestyle-storytelling') {
    return (
      <section className={cn(
        'relative overflow-hidden py-8 md:py-12 min-h-[50vh] md:min-h-[60vh] flex items-center',
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
        <div className="absolute inset-0">
          {particles.lifestyleStorytelling?.map((particle) => (
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
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Left Side - Storytelling Content */}
            <div className="space-y-4 text-white">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 text-xs font-medium text-white/90">
                  <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
                  <span>Featured</span>
                </div>
                
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                  <span className="block text-white">{config.title}</span>
                </h1>
                <p className="text-base md:text-lg text-white/90 leading-relaxed max-w-xl">
                  {config.subtitle}
                </p>
              </div>
              
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
                        src={product.images[0].image_url}
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

  // Variant 3: Interactive & Promotional - Compact Design
  if (config.variant === 'interactive-promotional') {
    return (
      <section className={cn(
        'relative overflow-hidden bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 py-8 md:py-12 min-h-[50vh] md:min-h-[60vh] flex items-center',
        className
      )}>
        {/* Simplified background */}
        <div className="absolute inset-0">
          <div className="absolute top-8 left-8 w-32 h-32 bg-blue-400/10 rounded-full blur-xl"></div>
          <div className="absolute bottom-8 right-8 w-40 h-40 bg-purple-400/10 rounded-full blur-xl"></div>
          
          {/* Animated particles - generated client-side only */}
          {particles.interactivePromotional?.map((particle) => (
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
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center">
          {/* Campaign Banner - Compact */}
          {config.campaignData && (
            <div className="inline-flex items-center gap-2 bg-yellow-400 text-gray-900 px-4 py-2 rounded-lg mb-4 font-bold text-sm shadow">
              <Gift className="h-4 w-4" />
              <span>{config.campaignData.title}</span>
            </div>
          )}

          <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
            <span className="block text-white">{config.title}</span>
          </h1>
          
          <p className="text-base md:text-lg text-white/90 mb-6 max-w-2xl mx-auto">
            {config.subtitle}
          </p>
          
          {/* CTAs - Compact */}
          <div className="flex flex-wrap gap-2 justify-center mb-8">
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <BookOpen className="h-8 w-8 text-white/40" />
                      </div>
                    )}
                  </div>
                  
                  <h3 className="text-white font-semibold text-sm mb-2 line-clamp-2">{product.name}</h3>
                  
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-yellow-400 font-bold">$19.99</span>
                    <span className="text-white/60 line-through">$39.99</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    );
  }

  // Variant 4: Category Grid Hero - Compact
  if (config.variant === 'category-grid') {
    return (
      <section className={cn(
        'relative overflow-hidden bg-gradient-to-br from-gray-50 to-white py-8 md:py-12',
        className
      )}>
        {/* Subtle background */}
        <div className="absolute inset-0 opacity-50">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle, #00000005 1px, transparent 1px)`,
            backgroundSize: '24px 24px'
          }}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          {/* Header - Compact */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-blue-50 rounded-full px-4 py-1.5 text-xs font-semibold text-blue-700 mb-3">
              <Grid3x3 className="h-3 w-3" />
              <span>Categories</span>
            </div>
            
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              {config.title}
            </h1>
            <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto mb-4">
              {config.subtitle}
            </p>
            <Button 
              className="bg-gray-900 hover:bg-gray-800 text-white px-5 py-2 text-sm"
              asChild
            >
              <Link href={config.primaryCta.href}>
                {config.primaryCta.text}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {/* Category Grid - Compact */}
          {config.categories && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
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
                        {seededRandomInt(100, 600)}+ books
                      </div>
                    </div>
                    
                    {/* Enhanced content */}
                    <div className="absolute bottom-6 left-6 right-6 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                      <h3 className="text-white font-black text-2xl mb-3 group-hover:text-yellow-300 transition-colors duration-300">{category.name}</h3>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-white/90 group-hover:text-white transition-colors duration-300">
                          <Grid3x3 className="h-5 w-5 mr-2 group-hover:rotate-180 transition-transform duration-500" />
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

  // Variant 5: Seasonal/Campaign Hero - Compact
  if (config.variant === 'seasonal-campaign') {
    return (
      <section className={cn(
        'relative overflow-hidden py-8 md:py-12 min-h-[50vh] md:min-h-[60vh] flex items-center',
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
        <div className="absolute inset-0">
          {particles.seasonalCampaign?.map((particle) => (
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
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center">
            {/* Campaign Badge - Compact */}
            {config.campaignData && (
              <div className="inline-flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg mb-4 font-bold text-sm shadow">
                <Calendar className="h-4 w-4" />
                <span>{config.campaignData.title}</span>
              </div>
            )}

            <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight text-white">
              {config.title}
            </h1>
            
            <p className="text-base md:text-lg text-white/90 mb-6 max-w-2xl mx-auto">
              {config.subtitle}
            </p>
            
            {/* Countdown Timer - Compact */}
            {config.campaignData?.countdown && (
              <div className="flex justify-center items-center gap-2 mb-6">
                {[
                  { value: '23', label: 'DAYS' },
                  { value: '12', label: 'HRS' },
                  { value: '45', label: 'MIN' },
                  { value: '32', label: 'SEC' }
                ].map((time, index) => (
                  <div key={time.label} className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 text-center">
                    <div className="text-xl md:text-2xl font-bold text-white">
                      {time.value}
                    </div>
                    <div className="text-white/70 text-xs">
                      {time.label}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex flex-wrap gap-2 justify-center">
              <Button 
                className="bg-white text-gray-900 hover:bg-gray-100 px-5 py-2 text-sm font-semibold"
                asChild
              >
                <Link href={config.primaryCta.href}>
                  {config.primaryCta.text}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Variant 6: Product Highlight with Features - Compact
  if (config.variant === 'product-highlight') {
    return (
      <section className={cn(
        'relative overflow-hidden bg-gradient-to-br from-gray-50 to-white py-8 md:py-12',
        className
      )}>
        {/* Subtle background */}
        <div className="absolute inset-0">
          <div className="absolute top-8 right-8 w-32 h-32 bg-blue-100/40 rounded-full blur-2xl"></div>
          <div className="absolute bottom-8 left-8 w-24 h-24 bg-purple-100/40 rounded-full blur-2xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Left Side - Product Image - Compact */}
            <div className="relative order-2 md:order-1">
              {config.featuredProducts?.[0] && (
                <div className="relative">
                  <div className="aspect-square bg-white rounded-xl p-6 shadow border">
                    {config.featuredProducts[0].images?.[0] ? (
                      <OptimizedImage
                        src={config.featuredProducts[0].images[0].image_url}
                        alt={config.featuredProducts[0].name}
                        fill
                        className="object-contain"
                        priority={true}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <BookOpen className="h-20 w-20 text-gray-300" />
                      </div>
                    )}
                  </div>
                  
                  {/* Badges - Compact */}
                  <div className="absolute top-2 right-2 bg-purple-500 text-white px-3 py-1 rounded-lg font-bold text-xs shadow">
                    Bestseller
                  </div>
                  <div className="absolute bottom-2 left-2 bg-green-500 text-white px-2 py-1 rounded-lg flex items-center gap-1 text-xs shadow">
                    <Star className="h-3 w-3 fill-current" />
                    <span>4.9</span>
                  </div>
                </div>
              )}
            </div>

            {/* Right Side - Content - Compact */}
            <div className="order-1 md:order-2 space-y-4">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 bg-purple-50 rounded-full px-4 py-1.5 text-xs font-semibold text-purple-700">
                  <Award className="h-3 w-3" />
                  <span>Featured</span>
                </div>
                
                <h1 className="text-2xl md:text-4xl font-bold text-gray-900">
                  {config.title}
                </h1>
                <p className="text-sm md:text-base text-gray-600">
                  {config.subtitle}
                </p>
              </div>
              
              {/* Features - Compact */}
              {config.features && (
                <div className="grid gap-3">
                  {config.features.slice(0, 3).map((feature, index) => (
                    <div 
                      key={index} 
                      className="flex items-start gap-3 p-3 bg-white rounded-lg border hover:shadow-sm transition-shadow"
                    >
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                        {getIconComponent(feature.icon) && (
                          React.createElement(getIconComponent(feature.icon), {
                            className: "h-4 w-4 text-white"
                          })
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm text-gray-900">{feature.title}</h3>
                        <p className="text-xs text-gray-600">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex flex-wrap gap-2">
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 text-sm"
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
          </div>
        </div>
      </section>
    );
  }

  // Variant 7: Modern Video Hero - Compact
  if (config.variant === 'video-hero') {
    return (
      <section className={cn(
        'relative overflow-hidden min-h-[50vh] md:min-h-[60vh] flex items-center py-8 md:py-12',
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
            <div className="absolute inset-0">
              {particles.videoHero?.map((particle) => (
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
          </div>
        )}
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center">
          {/* Badge - Compact */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 text-xs font-semibold text-white mb-4">
            <PlayCircle className="h-4 w-4" />
            <span>Video</span>
          </div>
          
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
            {config.title}
          </h1>
          
          <p className="text-base md:text-lg text-white/90 mb-6 max-w-2xl mx-auto">
            {config.subtitle}
          </p>
          
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

  // Variant 8: Interactive Try-On/Demo - Compact
  if (config.variant === 'interactive-tryOn') {
    return (
      <section className={cn(
        'relative bg-gradient-to-br from-gray-50 to-white py-8 md:py-12',
        className
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2">
              {config.title}
            </h1>
            <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto mb-4">
              {config.subtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Demo Area - Compact */}
            <div className="relative">
              <div className="bg-white rounded-xl p-4 shadow border">
                <div className="aspect-video bg-gray-100 rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
                  {config.featuredProducts?.[0]?.images?.[0] ? (
                    <OptimizedImage
                      src={config.featuredProducts[0].images[0].image_url}
                      alt={config.featuredProducts[0].name}
                      fill
                      className="object-contain"
                    />
                  ) : (
                    <div className="text-center">
                      <Camera className="h-8 w-8 text-gray-400 mb-2 mx-auto" />
                      <p className="text-xs text-gray-500">Demo</p>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-center gap-2">
                  <Button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 text-sm">
                    <Eye className="mr-1 h-3 w-3" />
                    Preview
                  </Button>
                  <Button variant="outline" className="px-4 py-2 text-sm">
                    <Camera className="mr-1 h-3 w-3" />
                    Try Demo
                  </Button>
                </div>
              </div>
            </div>

            {/* Features - Compact */}
            <div className="space-y-4">
              {config.features && (
                <div className="grid grid-cols-2 gap-3">
                  {config.features.slice(0, 4).map((feature, index) => (
                    <div key={index} className="text-center p-3 bg-white rounded-lg shadow-sm border">
                      <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                        {getIconComponent(feature.icon) && (
                          React.createElement(getIconComponent(feature.icon), {
                            className: "h-4 w-4 text-white"
                          })
                        )}
                      </div>
                      <h3 className="font-semibold text-sm text-gray-900 mb-1">{feature.title}</h3>
                      <p className="text-xs text-gray-600">{feature.description}</p>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <Button 
                  className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 text-sm"
                  asChild
                >
                  <Link href={config.primaryCta.href}>
                    {config.primaryCta.text}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Variant 9: Editorial Magazine Style - Compact
  if (config.variant === 'editorial-magazine') {
    return (
      <section className={cn(
        'relative bg-white py-8 md:py-12',
        className
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Magazine Header - Compact */}
          <div className="border-b border-gray-200 pb-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Featured</p>
                <h1 className="text-2xl md:text-4xl font-light text-gray-900">
                  {config.title}
                </h1>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">{new Date().getFullYear()}</p>
                <p className="text-xs text-gray-500">#01</p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Featured Articles - Compact */}
            {config.featuredProducts?.slice(0, 3).map((product, index) => (
              <article key={product.id} className={index === 0 ? "md:col-span-2" : ""}>
                <div className="space-y-3">
                  <div className={`${index === 0 ? "aspect-[16/9]" : "aspect-video"} bg-gray-100 rounded-lg overflow-hidden`}>
                    {product.images?.[0] ? (
                      <OptimizedImage
                        src={product.images[0].image_url}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <BookOpen className={`${index === 0 ? "h-12 w-12" : "h-8 w-8"} text-gray-300`} />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">{index === 0 ? "Featured" : "Article"}</p>
                    <h2 className={`${index === 0 ? "text-xl md:text-2xl" : "text-base md:text-lg"} font-light text-gray-900 mb-2`}>
                      {product.name}
                    </h2>
                    {index === 0 && (
                      <>
                        <p className="text-sm text-gray-600 mb-3">
                          {config.subtitle}
                        </p>
                        <Button 
                          className="bg-black hover:bg-gray-800 text-white px-4 py-2 text-sm"
                          asChild
                        >
                          <Link href={config.primaryCta.href}>
                            {config.primaryCta.text}
                            <ArrowRight className="ml-2 h-3 w-3" />
                          </Link>
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Stats - Compact */}
          {config.stats && config.stats.length > 0 && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-3 gap-4">
                {config.stats.slice(0, 3).map((stat, index) => (
                  <div key={index} className="text-center">
                    <p className="text-2xl md:text-3xl font-light text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-600">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    );
  }

  // Default fallback
  if (config.variant === 'classic') {
    return (
      <section className={cn(
        'relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-6 md:py-8 lg:py-10',
        className
      )}>
        {/* Background decorations - smaller and more subtle */}
        <div className="absolute inset-0">
          <div className="absolute top-16 left-8 w-48 h-48 bg-gradient-to-r from-blue-400/15 to-purple-400/15 rounded-full blur-2xl"></div>
          <div className="absolute bottom-16 right-8 w-64 h-64 bg-gradient-to-r from-purple-400/15 to-pink-400/15 rounded-full blur-2xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-indigo-300/8 to-purple-300/8 rounded-full blur-3xl"></div>
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
                            src={book.images[0].image_url}
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
        'relative overflow-hidden py-8 md:py-10 lg:py-12',
        className
      )}>
        {/* Dynamic background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"></div>
        
        {/* Animated background patterns - generated client-side only */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full">
            {particles.modern?.map((particle) => (
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
      'relative bg-gradient-to-b from-white to-gray-50/50 py-8 md:py-10 lg:py-12',
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
                        src={book.images[0].image_url}
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