import { Product } from '@/types';

export interface HeroConfig {
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

export interface HeroVariantProps {
  config: HeroConfig;
  className?: string;
  isMounted?: boolean;
  particles?: any;
}

