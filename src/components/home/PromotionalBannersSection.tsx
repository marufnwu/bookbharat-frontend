'use client';

import React from 'react';
import {
  Truck,
  Shield,
  Headphones,
  Package,
  Award,
  Clock,
  RefreshCw,
  LucideIcon,
} from 'lucide-react';
import { useHomepageLayout } from '@/contexts/SiteConfigContext';
import { cn } from '@/lib/utils';

interface PromotionalBanner {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error';
  enabled: boolean;
}

const iconMap: Record<string, LucideIcon> = {
  truck: Truck,
  shield: Shield,
  headphones: Headphones,
  package: Package,
  award: Award,
  clock: Clock,
  refresh: RefreshCw,
};

const colorClasses: Record<string, { bg: string; text: string; iconBg: string }> = {
  primary: {
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    iconBg: 'bg-blue-100',
  },
  secondary: {
    bg: 'bg-gray-50',
    text: 'text-gray-600',
    iconBg: 'bg-gray-100',
  },
  accent: {
    bg: 'bg-purple-50',
    text: 'text-purple-600',
    iconBg: 'bg-purple-100',
  },
  success: {
    bg: 'bg-green-50',
    text: 'text-green-600',
    iconBg: 'bg-green-100',
  },
  warning: {
    bg: 'bg-yellow-50',
    text: 'text-yellow-600',
    iconBg: 'bg-yellow-100',
  },
  error: {
    bg: 'bg-red-50',
    text: 'text-red-600',
    iconBg: 'bg-red-100',
  },
};

export function PromotionalBannersSection() {
  const homepageLayout = useHomepageLayout();

  // Safely access promotionalBanners with optional chaining
  const banners = homepageLayout?.promotionalBanners?.filter?.(banner => banner?.enabled) || [];

  if (!banners || banners.length === 0) {
    return null;
  }

  return (
    <section className="py-12 md:py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {banners.map((banner) => {
            const IconComponent = iconMap[banner?.icon] || Package;
            const colors = colorClasses[banner?.color] || colorClasses.primary;

            return (
              <div
                key={banner?.id}
                className="flex items-center gap-4 p-6 bg-blue-50 text-blue-600 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <div className="p-3 bg-blue-100 rounded-lg flex-shrink-0">
                  <IconComponent className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm sm:text-base">
                    {banner?.title || 'Special Offer'}
                  </h3>
                  <p className="text-xs sm:text-sm mt-1 opacity-80">
                    {banner?.description || 'Limited time offer'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

