'use client';

import React, { useState, useEffect } from 'react';
import { seededRandom } from '@/lib/seeded-random';
import { HeroConfig } from './types';
import * as Variants from './variants';

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

