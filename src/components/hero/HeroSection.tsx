'use client';

import React, { useState, useEffect } from 'react';
import { HeroConfig } from './types';
import * as Variants from './variants';

// Pre-generated particle data for performance optimization
const PRE_GENERATED_PARTICLES = {
  interactivePromotional: Array.from({ length: 30 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 5}s`,
    animationDuration: `${2 + Math.random() * 4}s`,
    width: Math.random() > 0.5 ? 'w-1' : 'w-2',
    height: Math.random() > 0.5 ? 'h-1' : 'h-2',
    opacity: Math.random() > 0.5 ? 'bg-white/40' : 'bg-white/60'
  })),
  lifestyleStorytelling: Array.from({ length: 30 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 5}s`,
    animationDuration: `${4 + Math.random() * 3}s`
  })),
  seasonalCampaign: Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 5}s`,
    animationDuration: `${5 + Math.random() * 3}s`
  })),
  videoHero: Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 5}s`,
    animationDuration: `${4 + Math.random() * 3}s`
  })),
  modern: Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 3}s`,
    animationDuration: `${3 + Math.random() * 2}s`
  }))
};

interface HeroSectionProps {
  config: HeroConfig;
  className?: string;
}

export function HeroSection({ config, className }: HeroSectionProps) {
  const [isMounted, setIsMounted] = useState(false);
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

  // Set mounted state to prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Pre-generated particle data for better performance
  useEffect(() => {
    // Only set particles if they haven't been generated yet
    if (config.variant === 'interactive-promotional' && !particles.interactivePromotional.length) {
      setParticles(prev => ({ ...prev, interactivePromotional: PRE_GENERATED_PARTICLES.interactivePromotional }));
    } else if (config.variant === 'lifestyle-storytelling' && !particles.lifestyleStorytelling.length) {
      setParticles(prev => ({ ...prev, lifestyleStorytelling: PRE_GENERATED_PARTICLES.lifestyleStorytelling }));
    } else if (config.variant === 'seasonal-campaign' && !particles.seasonalCampaign.length) {
      setParticles(prev => ({ ...prev, seasonalCampaign: PRE_GENERATED_PARTICLES.seasonalCampaign }));
    } else if (config.variant === 'video-hero' && !config.videoUrl && !particles.videoHero.length) {
      // Only generate for video-hero when there's no video (fallback case)
      setParticles(prev => ({ ...prev, videoHero: PRE_GENERATED_PARTICLES.videoHero }));
    } else if (config.variant === 'modern' && !particles.modern.length) {
      setParticles(prev => ({ ...prev, modern: PRE_GENERATED_PARTICLES.modern }));
    }
  }, [config.variant, config.videoUrl, particles.interactivePromotional.length, particles.lifestyleStorytelling.length, particles.seasonalCampaign.length, particles.videoHero.length, particles.modern.length]);

  // Route to appropriate variant component
  const variantComponents = {
    'minimal-product': Variants.MinimalProduct,
    'lifestyle-storytelling': Variants.LifestyleStorytelling,
    'interactive-promotional': Variants.InteractivePromotional,
    'category-grid': Variants.CategoryGrid,
    'seasonal-campaign': Variants.SeasonalCampaign,
    'product-highlight': Variants.ProductHighlight,
    'video-hero': Variants.VideoHero,
    'interactive-tryOn': Variants.InteractiveTryOn,
    'editorial-magazine': Variants.EditorialMagazine,
    'modern': Variants.ModernVariant,
    'classic': Variants.ClassicVariant,
  };

  const VariantComponent = variantComponents[config.variant] || Variants.DefaultVariant;

  return (
    <VariantComponent 
      config={config} 
      className={className} 
      isMounted={isMounted} 
      particles={particles}
    />
  );
}

export default HeroSection;

